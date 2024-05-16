import { validate } from './actions/validate'
import { estimateMobility } from './actions/mobility'
import { estimateHousing } from './actions/housing'
import { estimateFood } from './actions/food'
import { estimateOther } from './actions/other'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand
} from '@aws-sdk/lib-dynamodb'

const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const { v4: uuid } = require('uuid')
import express from 'express'
import { EmissionCalculator } from '../../utils/emission'

const FOOTPRINT_TABLE_NAME = process.env.FOOTPRINT_TABLE_NAME || ''
const PARAMETER_TABLE_NAME = process.env.PARAMETER_TABLE_NAME || ''
const PROFILE_TABLE_NAME = process.env.PROFILE_TABLE_NAME || ''

const dynamoParam = {}
const footprintTableName = FOOTPRINT_TABLE_NAME
const parameterTableName = PARAMETER_TABLE_NAME
const profileTableName = PROFILE_TABLE_NAME

const dynamodbClient = new DynamoDBClient(dynamoParam)
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient)

const path = '/calculates'

// declare a new express app
const app: express.Express = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
})

const toResponse = (profile: any, estimate: any) => {
  const common = {
    id: profile.id,

    mobilityAnswer: profile.mobilityAnswer,
    housingAnswer: profile.housingAnswer,
    foodAnswer: profile.foodAnswer,
    otherAnswer: profile.otherAnswer
  }

  return estimate
    ? {
        ...common,
        baselines: profile.baselines,
        estimations: profile.estimations,
        mobilityScore: profile.mobility,
        foodScore: profile.food,
        housingScore: profile.housing,
        otherScore: profile.other
      }
    : common
}

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/
app.get(path + '/:id', async (req: express.Request, res: express.Response) => {
  try {
    const data = await dynamodb.send(
      new GetCommand({
        TableName: profileTableName,
        Key: { id: req.params.id }
      })
    )

    const profile = data.Item

    if (profile == undefined) {
      res.statusCode = 404
      res.json({ error: 'Could not load item: ' + req.params.id })
      return
    }

    // 計算がされていない場合は遅延初期化
    if (!profile.estimated) {
      await updateProfile(dynamodb, profile)
      profile.estimated = true
      profile.updatedAt = new Date().toISOString()
      await dynamodb.send(
        new PutCommand({
          TableName: PROFILE_TABLE_NAME,
          Item: profile
        })
      )
    }

    await addScore(profile)

    res.json(toResponse(profile, true))
  } catch (err) {
    res.statusCode = 500
    res.json({ error: 'Could not load item: ' + err })
  }
})

const addScore = async (profile: any) => {
  const emissionCalculator = new EmissionCalculator(profile)
  profile.mobility = emissionCalculator.mobility
  profile.food = emissionCalculator.food
  profile.housing = emissionCalculator.housing
  profile.other = emissionCalculator.other
}

const updateProfile = async (
  dynamodb: DynamoDBDocumentClient,
  profile: any
) => {
  profile.baselines = []
  profile.estimations = []

  if (profile.housingAnswer) {
    const { baselines, estimations } = await estimateHousing(
      dynamodb,
      profile.housingAnswer,
      profile.mobilityAnswer,
      footprintTableName,
      parameterTableName
    )
    profile.baselines = profile.baselines.concat(baselines)
    profile.estimations = profile.estimations.concat(estimations)
  }

  if (profile.mobilityAnswer) {
    const { baselines, estimations } = await estimateMobility(
      dynamodb,
      profile.housingAnswer,
      profile.mobilityAnswer,
      footprintTableName,
      parameterTableName
    )
    profile.baselines = profile.baselines.concat(baselines)
    profile.estimations = profile.estimations.concat(estimations)
  }

  if (profile.foodAnswer) {
    const { baselines, estimations } = await estimateFood(
      dynamodb,
      profile.foodAnswer,
      footprintTableName,
      parameterTableName
    )
    profile.baselines = profile.baselines.concat(baselines)
    profile.estimations = profile.estimations.concat(estimations)
  }

  if (profile.otherAnswer) {
    const { baselines, estimations } = await estimateOther(
      dynamodb,
      profile.housingAnswer,
      profile.otherAnswer,
      footprintTableName,
      parameterTableName
    )
    profile.baselines = profile.baselines.concat(baselines)
    profile.estimations = profile.estimations.concat(estimations)
  }
}

/************************************
 * HTTP put method for insert object *
 *************************************/

app.put(path + '/:id', async (req: express.Request, res: express.Response) => {
  const id = req.params.id
  const estimate = req.body.estimate
  const body: any = req.body

  if (validate(req.body)) {
    try {
      const data = await dynamodb.send(
        new GetCommand({
          TableName: PROFILE_TABLE_NAME,
          Key: { id }
        })
      )
      const profile = data.Item

      if (profile == undefined) {
        res.statusCode = 404
        res.json({ error: 'Could not load item: ' + req.params.id })
        return
      }

      if (body.mobilityAnswer) {
        profile.mobilityAnswer = body.mobilityAnswer
      }
      if (body.housingAnswer) {
        profile.housingAnswer = body.housingAnswer
      }
      if (body.foodAnswer) {
        profile.foodAnswer = body.foodAnswer
      }
      if (body.otherAnswer) {
        profile.otherAnswer = body.otherAnswer
      }

      profile.estimated = false

      if (estimate) {
        await updateProfile(dynamodb, profile)
        profile.updatedAt = new Date().toISOString()
        profile.estimated = true
      }

      await dynamodb.send(
        new PutCommand({
          TableName: profileTableName,
          Item: profile
        })
      )

      await addScore(profile)
      res.json({
        success: 'put call succeed!',
        url: req.url,
        data: toResponse(profile, estimate)
      })
    } catch (err: any) {
      res.statusCode = 500
      res.json({
        error: 'Could not load items',
        message: err.message,
        stack: err.stack
      })
    }
  } else {
    res.statusCode = 400
    res.json({ error: validate.errors })
  }
})

/************************************
 * HTTP post method for insert object *
 *************************************/

app.post(path, async (req: express.Request, res: express.Response) => {
  if (validate(req.body)) {
    try {
      const body: any = req.body
      const estimate = body.estimate

      const profile = {
        estimated: false,
        id: uuid(),
        mobilityAnswer: body.mobilityAnswer,
        housingAnswer: body.housingAnswer,
        foodAnswer: body.foodAnswer,
        otherAnswer: body.otherAnswer,

        baselines: [],
        estimations: [],

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (estimate) {
        await updateProfile(dynamodb, profile)
        profile.estimated = true
      }

      const params = {
        TableName: profileTableName,
        Item: profile
      }
      await dynamodb.send(new PutCommand(params))
      await addScore(profile)
      res.json({
        success: 'post call succeed!',
        url: req.url,
        data: toResponse(profile, estimate)
      })
    } catch (err) {
      res.statusCode = 500
      res.json({ error: err, url: req.url, body: req.body })
    }
  } else {
    res.statusCode = 400
    res.json({ error: validate.errors })
  }
})

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
export default app
