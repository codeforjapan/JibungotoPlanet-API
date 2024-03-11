import { aws_certificatemanager, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BaseStackProps } from './props'
import {
  BasePathMapping,
  Cors,
  DomainName,
  EndpointType,
  IDomainName,
  LambdaIntegration,
  RestApi,
  SecurityPolicy
} from 'aws-cdk-lib/aws-apigateway'
import { IFunction } from 'aws-cdk-lib/aws-lambda'

export interface ApiGatewayStackProps extends BaseStackProps {
  domain: string
  certificateArn: string
  footprintLambda: IFunction
  changeImpactLambda: IFunction
}

export class ApiGatewayStack extends Stack {
  public readonly api: IDomainName

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props)

    const apiGateway = new RestApi(
      this,
      `${props.stage}${props.serviceName}apiGateway`,
      {
        restApiName: `${props.stage}${props.serviceName}apiGateway`,
        deployOptions: {
          tracingEnabled: true,
          metricsEnabled: true,
          stageName: props.stage
        },
        endpointTypes: [EndpointType.REGIONAL],
        defaultCorsPreflightOptions: {
          allowOrigins: Cors.ALL_ORIGINS,
          allowMethods: Cors.ALL_METHODS,
          allowHeaders: Cors.DEFAULT_HEADERS,
          statusCode: 200
        }
      }
    )

    // memo replaceに向けて個別でルーティングする
    const footprint = apiGateway.root.addResource('footprints')
    const footprintType = footprint.addResource('{type}')
    const footprintCityName = footprintType.addResource('{city_name}')
    const footprintDomain = footprintCityName.addResource('{domain}')
    const footprintComponent = footprintDomain.addResource('{component}')

    const changeImpact = apiGateway.root.addResource('changeImpacts')
    const changeImpactType = changeImpact.addResource('{type}')
    const changeImpactCityName = changeImpactType.addResource('{city_name}')
    const changeImpactDomain = changeImpactCityName.addResource('{domain}')
    const changeImpactGroup = changeImpactDomain.addResource('{group}')
    const changeImpactOption = changeImpactGroup.addResource('{options}')

    const footprintIntegration = new LambdaIntegration(props.footprintLambda)
    const changeImpactIntegration = new LambdaIntegration(props.changeImpactLambda)

    footprintType.addMethod('GET', footprintIntegration)
    footprintCityName.addMethod('GET', footprintIntegration)
    footprintDomain.addMethod('GET', footprintIntegration)
    footprintComponent.addMethod('GET', footprintIntegration)

    changeImpactType.addMethod('GET', changeImpactIntegration)
    changeImpactCityName.addMethod('GET', changeImpactIntegration)
    changeImpactDomain.addMethod('GET', changeImpactIntegration)
    changeImpactGroup.addMethod('GET', changeImpactIntegration)
    changeImpactOption.addMethod('GET', changeImpactIntegration)

    const domain = new DomainName(
      this,
      `${props.stage}${props.serviceName}domain`,
      {
        certificate: aws_certificatemanager.Certificate.fromCertificateArn(
          this,
          'apiGateWayCertification',
          props.certificateArn
        ),
        domainName: `${props.stage}-api.${props.domain}`,
        securityPolicy: SecurityPolicy.TLS_1_2,
        endpointType: EndpointType.REGIONAL
      }
    )
    new BasePathMapping(
      this,
      `${props.stage}${props.serviceName}firstPathMapping`,
      {
        domainName: domain,
        restApi: apiGateway,
        basePath: ''
      }
    )
    new BasePathMapping(this, `${props.stage}${props.serviceName}PathMapping`, {
      domainName: domain,
      restApi: apiGateway,
      basePath: props.stage
    })
    this.api = domain
  }
}
