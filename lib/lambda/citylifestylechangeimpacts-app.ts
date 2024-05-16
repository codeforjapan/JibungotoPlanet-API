const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb')
const { DynamoDB } = require('@aws-sdk/client-dynamodb')

const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
import express from 'express'

const TABLE_NAME = process.env.TABLE_NAME || ''

const toComponent = (item: any) => {
  return {
    CityName: item.CityName,
    Potential: item.Potential,
    Domain: item.Domain,
    Group: item.Group,
    Options: item.Options,
    Type: item.Type,
    Japanese: item.Japanese
  }
}

const dynamoParam = {}
const tableName = TABLE_NAME

const dynamodb = DynamoDBDocument.from(new DynamoDB(dynamoParam))

const path = '/changeImpacts'

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

/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(
  path + '/:type',
  async (req: express.Request, res: express.Response) => {
    const type = req.params.type
    let response: any[] = [{ source: 'https://lifestyle.nies.go.jp' }]

    const params = {
      TableName: tableName,
      KeyConditionExpression: '#type = :typeValue',
      ExpressionAttributeNames: {
        '#type': 'Type'
      },
      ExpressionAttributeValues: {
        ':typeValue': type
      }
    }

    try {
      const data = await dynamodb.query(params)
      response = response.concat(
        data.Items.map((item: any) => toComponent(item))
      )
    } catch (err) {
      res.statusCode = 500
      res.json({ error: 'Could not load type: ' + err })
    }

    if (res.statusCode !== 500) {
      res.json(response)
    }
  }
)

/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(path + '/:type/:city_name', async (req, res) => {
  const type = req.params.type
  const city_name = req.params.city_name

  const params = {
    TableName: tableName,
    IndexName: 'CityName-Domain-index',
    KeyConditionExpression: '#city_name = :city_nameValue',
    FilterExpression: '#type = :typeValue',
    ExpressionAttributeNames: {
      '#city_name': 'CityName',
      '#type': 'Type'
    },
    ExpressionAttributeValues: {
      ':city_nameValue': city_name,
      ':typeValue': type
    }
  }

  try {
    const data = await dynamodb.query(params)
    res.json(
      data.Items.map((item: any) => toComponent(item)).concat([
        { source: 'https://lifestyle.nies.go.jp' }
      ])
    )
  } catch (err) {
    res.statusCode = 500
    res.json({ error: 'Could not load city_name: ' + err })
  }
})

/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(path + '/:type/:city_name/:domain', async (req, res) => {
  const type = req.params.type
  const city_name = req.params.city_name
  const domain = req.params.domain

  const params = {
    TableName: tableName,
    IndexName: 'CityName-Domain-index',
    KeyConditionExpression:
      '#city_name = :city_nameValue and #domain = :domainValue',
    FilterExpression: '#type = :typeValue',
    ExpressionAttributeNames: {
      '#city_name': 'CityName',
      '#domain': 'Domain',
      '#type': 'Type'
    },
    ExpressionAttributeValues: {
      ':city_nameValue': city_name,
      ':domainValue': domain,
      ':typeValue': type
    }
  }

  try {
    const data = await dynamodb.query(params)
    res.json(
      data.Items.map((item: any) => toComponent(item)).concat([
        { source: 'https://lifestyle.nies.go.jp' }
      ])
    )
  } catch (err) {
    res.statusCode = 500
    res.json({ error: 'Could not load domain: ' + err })
  }
})

/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(path + '/:type/:city_name/:domain/:group', async (req, res) => {
  const type = req.params.type
  const city_name = req.params.city_name
  const domain = req.params.domain
  const group = req.params.group

  const params = {
    TableName: tableName,
    IndexName: 'CityName-Domain-index',
    KeyConditionExpression:
      '#city_name = :city_nameValue and #domain = :domainValue',
    FilterExpression: '#type = :typeValue and #group = :groupValue',
    ExpressionAttributeNames: {
      '#city_name': 'CityName',
      '#domain': 'Domain',
      '#type': 'Type',
      '#group': 'Group'
    },
    ExpressionAttributeValues: {
      ':city_nameValue': city_name,
      ':domainValue': domain,
      ':typeValue': type,
      ':groupValue': group
    }
  }

  try {
    const data = await dynamodb.query(params)
    res.json(
      data.Items.map((item: any) => toComponent(item)).concat([
        { source: 'https://lifestyle.nies.go.jp' }
      ])
    )
  } catch (err) {
    res.statusCode = 500
    res.json({ error: 'Could not load group: ' + err })
  }
})

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get(
  path + '/:type/:city_name/:domain/:group/:options',
  async (req, res) => {
    const type = req.params.type
    const city_name = req.params.city_name
    const domain = req.params.domain
    const group = req.params.group
    const options = req.params.options

    const params = {
      TableName: tableName,
      IndexName: 'CityName-Domain-index',
      KeyConditionExpression:
        '#city_name = :city_nameValue and #domain = :domainValue',
      FilterExpression:
        '#type = :typeValue and #group = :groupValue and #options = :optionsValue',
      ExpressionAttributeNames: {
        '#city_name': 'CityName',
        '#domain': 'Domain',
        '#type': 'Type',
        '#group': 'Group',
        '#options': 'Options'
      },
      ExpressionAttributeValues: {
        ':city_nameValue': city_name,
        ':domainValue': domain,
        ':typeValue': type,
        ':groupValue': group,
        ':optionsValue': options
      }
    }

    try {
      const data = await dynamodb.query(params)
      res.json(
        data.Items.map((item: any) => toComponent(item)).concat([
          { source: 'https://lifestyle.nies.go.jp' }
        ])
      )
    } catch (err) {
      res.statusCode = 500
      res.json({ error: 'Could not load options: ' + err })
    }
  }
)

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
export default app
