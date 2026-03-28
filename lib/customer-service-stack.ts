import * as cdk from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';

export class CustomerServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambda.Function(this, 'CustomerServiceFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30),
      description: 'Customer service Lambda function',
    });

    const api = new apigwv2.HttpApi(this, 'CustomerServiceApi', {
      defaultIntegration: new HttpLambdaIntegration('CustomerServiceIntegration', handler),
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url!,
      description: 'API Gateway URL',
    });
  }
}
