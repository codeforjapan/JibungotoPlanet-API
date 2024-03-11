#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Config, getConfig } from '../lib/config';
import { DynamodbStack } from "../lib/dynamodb-stack";
import { FootprintStack } from "../lib/footprint-stack";
import { ChangeImpactStack } from "../lib/change-impact-stack";
import { ApiGatewayStack } from "../lib/api-gateway-stack";
import { Tags } from "aws-cdk-lib";
import { Route53Stack } from "../lib/route53";
import { CalculateStack } from "../lib/calculate-stack";

const app = new cdk.App();
const stages = ['dev', 'public']

const stage = app.node.tryGetContext('stage')
if (!stages.includes(stage)) {
  throw new Error('set stage value using -c option')
}

const config: Config = getConfig(stage)
const serviceName = 'JibungotoPlanet-Api'

const env = {
  account: config.aws.accountId,
  region: config.aws.region
}

const dynamoDB = new DynamodbStack(app, `${ stage }${ serviceName }DynamoDBStack`, {
  stage,
  env,
  serviceName
})

const footprintLambda = new FootprintStack(app, `${ stage }${ serviceName }FootprintStack`, {
  stage,
  env,
  serviceName,
  dynamoTable: dynamoDB.localFootprintTable
})
footprintLambda.addDependency(dynamoDB)

const changeImpactLambda = new ChangeImpactStack(app, `${ stage }${ serviceName }ChangeImpactStack`, {
  stage,
  env,
  serviceName,
  dynamoTable: dynamoDB.changeImpactTable
})
footprintLambda.addDependency(dynamoDB)

const calculateLambda = new CalculateStack(app, `${ stage }${ serviceName }CalculateStack`, {
  stage,
  env,
  serviceName,
  footprintTable: dynamoDB.footprintTable,
  profileTable: dynamoDB.profileTable,
  parameterTable: dynamoDB.parameterTable,
})
footprintLambda.addDependency(dynamoDB)

const apiGateway = new ApiGatewayStack(app, `${ stage }${ serviceName }ApiGatewayStack`, {
  stage,
  env,
  serviceName,
  domain: config.domain,
  certificateArn: config.certificateArn,
  footprintLambda: footprintLambda.lambda,
  changeImpactLambda: changeImpactLambda.lambda,
  calculateLambda: calculateLambda.lambda
})
apiGateway.addDependency(footprintLambda)
apiGateway.addDependency(changeImpactLambda)
apiGateway.addDependency(calculateLambda)

const route53 = new Route53Stack(app, `${ stage }${ serviceName }Route53Stack`, {
  stage,
  env,
  serviceName,
  domain: config.domain,
  api: apiGateway.api
})
route53.addDependency(apiGateway)

Tags.of(app).add('Project', 'JibungotoPlanet');
Tags.of(app).add('Repository', 'JibungotoPlanet-API');
Tags.of(app).add('Env', stage);
Tags.of(app).add('ManagedBy', 'cdk');
