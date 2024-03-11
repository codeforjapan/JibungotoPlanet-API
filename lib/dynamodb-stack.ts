
import { aws_dynamodb, RemovalPolicy, Stack } from 'aws-cdk-lib'
import { Attribute, AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { BaseStackProps } from './props'

export class DynamodbStack extends Stack {
  public readonly footprintTable: aws_dynamodb.Table
  public readonly changeImpactTable: aws_dynamodb.Table

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props)

    interface TableObjects {
      [key: string]: {
        partitionKey: Attribute
        sortKey?: Attribute
      }
    }

    const tableObjects: TableObjects = {
      footprint: {
        partitionKey: {
          name: 'Type',
          type: AttributeType.STRING
        },
        sortKey: {
          name: 'Id',
          type: AttributeType.STRING
        }
      },
      changeImpact: {
        partitionKey: {
          name: 'Type',
          type: AttributeType.STRING
        },
        sortKey: {
          name: 'Id',
          type: AttributeType.STRING
        }
      },
    }

    for (const [key, tableObject] of Object.entries(tableObjects)) {
      // @ts-ignore
      this[`${key}Table`] = new Table(
        this,
        `${props.stage}${props.serviceName}${key}`,
        {
          partitionKey: tableObject.partitionKey,
          sortKey: tableObject.sortKey,
          tableName: `${props.stage}${props.serviceName}${key}`,
          removalPolicy: RemovalPolicy.DESTROY,
          billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST
        }
      )

      // @ts-ignore
      this[`${key}Table`].addGlobalSecondaryIndex(
        {
          indexName: 'CityName-Domain-index',
          partitionKey: {
            name: 'CityName',
            type: AttributeType.STRING
          },
          sortKey: {
            name: 'Domain',
            type: AttributeType.STRING
          }
        }
      )
    }
  }
}
