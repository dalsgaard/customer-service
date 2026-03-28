import { Stack, StackProps, Duration, CfnOutput } from 'aws-cdk-lib/core';
import { HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class CustomerServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const handler = new NodejsFunction(this, 'CustomerServiceFunction', {
      entry: 'lambda/index.ts',
      runtime: Runtime.NODEJS_24_X,
      timeout: Duration.seconds(30),
      description: 'Customer service Lambda function',
    });

    const api = new HttpApi(this, 'CustomerServiceApi', {
      defaultIntegration: new HttpLambdaIntegration('CustomerServiceIntegration', handler),
    });

    new CfnOutput(this, 'ApiUrl', {
      value: api.url!,
      description: 'API Gateway URL',
    });
  }
}
