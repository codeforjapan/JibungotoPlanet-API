import { aws_dynamodb, aws_lambda_nodejs, Duration, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BaseStackProps } from './props'
import { IFunction, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
import * as path from 'path'

export interface CalculateStackProps extends BaseStackProps {
  footprintTable: aws_dynamodb.Table
  profileTable: aws_dynamodb.Table
  parameterTable: aws_dynamodb.Table
}

export class CalculateStack extends Stack {
  public readonly lambda: IFunction

  constructor(scope: Construct, id: string, props: CalculateStackProps) {
    super(scope, id, props)

    this.lambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'calculateFunction',
      {
        functionName: `${props.stage}${props.serviceName}calculateLambda`,
        entry: path.join(__dirname, './lambda/calculate.ts'),
        handler: 'handler',
        runtime: Runtime.NODEJS_20_X,
        environment: {
          FOOTPRINT_TABLE_NAME: props.footprintTable.tableName,
          PARAMETER_TABLE_NAME: props.parameterTable.tableName,
          PROFILE_TABLE_NAME: props.profileTable.tableName,
        },
        tracing: Tracing.ACTIVE,
        timeout: Duration.seconds(10)
      }
    )
    props.footprintTable.grantReadData(this.lambda)
    props.parameterTable.grantReadData(this.lambda)
    props.profileTable.grantReadWriteData(this.lambda)
  }
}
