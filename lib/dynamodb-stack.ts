import { aws_dynamodb, RemovalPolicy, Stack } from 'aws-cdk-lib'
import { Attribute, AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { BaseStackProps } from './props'

export class DynamodbStack extends Stack {
  public readonly localFootprintTable: aws_dynamodb.Table
  public readonly changeImpactTable: aws_dynamodb.Table
  public readonly profileTable: aws_dynamodb.Table
  public readonly footprintTable: aws_dynamodb.Table
  public readonly parameterTable: aws_dynamodb.Table

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
          name: 'dir_domain',
          type: AttributeType.STRING
        },
        sortKey: {
          name: 'item_type',
          type: AttributeType.STRING
        }
      },
      profile: {
        partitionKey: {
          name: 'id',
          type: AttributeType.STRING
        }
      },
      parameter: {
        partitionKey: {
          name: 'category',
          type: AttributeType.STRING
        },
        sortKey: {
          name: 'key',
          type: AttributeType.STRING
        }
      },
      localFootprint: {
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
      }
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
    }

    this.localFootprintTable.addGlobalSecondaryIndex({
      indexName: 'CityName-Domain-index',
      partitionKey: {
        name: 'CityName',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'Domain',
        type: AttributeType.STRING
      }
    })

    this.changeImpactTable.addGlobalSecondaryIndex({
      indexName: 'CityName-Domain-index',
      partitionKey: {
        name: 'CityName',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'Domain',
        type: AttributeType.STRING
      }
    })
  }
}
