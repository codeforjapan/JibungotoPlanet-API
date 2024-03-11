const AWS = require('aws-sdk')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
import express from "express";

const TABLE_NAME = process.env.TABLE_NAME || ''

const toComponent = (item: any) => {
  return {
    city_name: item.CityName,
    CarbonFootprints: item.CarbonFootprints,
    No: item.No,
    Domain: item.Domain,
    Component: item.Component,
    English: item.English,
    Japanese: item.Japanese,
    Type: item.Type,
  };
}


let dynamoParam = {}
let tableName = TABLE_NAME

const dynamodb = new AWS.DynamoDB.DocumentClient(dynamoParam)

const path = '/footprints'

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

app.get(path + '/:type', async (req: express.Request, res: express.Response) => {
  const type = req.params.type
  let response: any[] = []

  const params = {
    TableName: tableName,
    KeyConditionExpression: '#type = :typeValue',
    ExpressionAttributeNames: {
      '#type': 'Type',
    },
    ExpressionAttributeValues: {
      ':typeValue': type,
    }
  };

  try {
    const data = await dynamodb.query(params).promise()
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
})

/********************************
 * HTTP Get method for list objects *
 ********************************/


app.get(path + '/:type/:city_name', async (req, res) => {
  const type = req.params.type
  const city_name = req.params.city_name

  const params = {
    TableName: tableName,
    IndexName: 'CityName-Domain-index',
    KeyConditionExpression: "#city_name = :city_nameValue",
    FilterExpression: "#type = :typeValue",
    ExpressionAttributeNames: {
      "#city_name": "CityName",
      "#type": "Type",
    },
    ExpressionAttributeValues: {
      ":city_nameValue": city_name,
      ":typeValue": type,
    }
  };

  try {
    const data = await dynamodb.query(params).promise()
    res.json(data.Items.map((item: any) => toComponent(item)))
  } catch (err) {
    res.statusCode = 500
    res.json({ error: 'Could not load city_name ' + err })
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
    KeyConditionExpression: "#city_name = :city_nameValue and #domain = :domainValue",
    FilterExpression: "#type = :typeValue",
    ExpressionAttributeNames: {
      "#city_name": "CityName",
      "#domain": "Domain",
      "#type": "Type",
    },
    ExpressionAttributeValues: {
      ":city_nameValue": city_name,
      ":domainValue": domain,
      ":typeValue": type,
    }
  };


  try {
    const data = await dynamodb.query(params).promise()
    res.json(data.Items.map((item: any) => toComponent(item)))
  } catch (err) {
    res.statusCode = 500
    res.json({ error: 'Could not load domain: ' + err })
  }
})


/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get(path + '/:type/:city_name/:domain/:component', async (req, res) => {
  const type = req.params.type
  const city_name = req.params.city_name
  const domain = req.params.domain
  const component = req.params.component

  const params = {
    TableName: tableName,
    IndexName: 'CityName-Domain-index',
    KeyConditionExpression: "#city_name = :city_nameValue and #domain = :domainValue",
    FilterExpression: "#type = :typeValue and #component = :componentValue",
    ExpressionAttributeNames: {
      "#city_name": "CityName",
      "#domain": "Domain",
      "#type": "Type",
      "#component": "Component"
    },
    ExpressionAttributeValues: {
      ":city_nameValue": city_name,
      ":domainValue": domain,
      ":typeValue": type,
      ":componentValue": component
    }
  };


  try {
    const data = await dynamodb.query(params).promise()
    res.json(data.Items.map((item: any) => toComponent(item)))
  } catch (err) {
    res.statusCode = 500
    res.json({ error: 'Could not load component: ' + err })
  }
})


// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
export default app
