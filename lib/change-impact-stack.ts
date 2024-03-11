import { aws_dynamodb, aws_lambda_nodejs, Duration, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BaseStackProps } from './props'
import { IFunction, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
import * as path from 'path'

export interface ChangeImpactStackProps extends BaseStackProps {
  dynamoTable: aws_dynamodb.Table
}

export class ChangeImpactStack extends Stack {
  public readonly lambda: IFunction

  constructor(scope: Construct, id: string, props: ChangeImpactStackProps) {
    super(scope, id, props)

    this.lambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      'changeImpactFunction',
      {
        functionName: `${props.stage}${props.serviceName}changeImpactLambda`,
        entry: path.join(__dirname, './lambda/citylifestylechangeimpacts.ts'),
        handler: 'handler',
        runtime: Runtime.NODEJS_20_X,
        environment: {
          TABLE_NAME: props.dynamoTable.tableName
        },
        tracing: Tracing.ACTIVE,
        timeout: Duration.seconds(10)
      }
    )
    props.dynamoTable.grantReadData(this.lambda)
  }
}
