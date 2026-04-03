import { Stack, StackProps, Duration, CfnOutput } from 'aws-cdk-lib/core';
import { HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Table, BillingMode, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as path from 'path';

export class CustomerServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Table(this, 'CustomerTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const customerCreatedTopic = new Topic(this, 'CustomerCreatedTopic', {
      displayName: 'Customer Created',
    });

    const customerDeletedTopic = new Topic(this, 'CustomerDeletedTopic', {
      displayName: 'Customer Deleted',
    });

    const handler = new NodejsFunction(this, 'CustomerServiceFunction', {
      entry: 'lambda/index.ts',
      runtime: Runtime.NODEJS_24_X,
      timeout: Duration.seconds(30),
      description: 'Customer service Lambda function',
      environment: {
        TABLE_NAME: table.tableName,
        CUSTOMER_CREATED_TOPIC_ARN: customerCreatedTopic.topicArn,
        CUSTOMER_DELETED_TOPIC_ARN: customerDeletedTopic.topicArn,
        LOG_LEVEL: 'INFO',
      },
    });

    table.grantReadWriteData(handler);
    customerCreatedTopic.grantPublish(handler);
    customerDeletedTopic.grantPublish(handler);

    new CfnOutput(this, 'CustomerCreatedTopicArn', {
      value: customerCreatedTopic.topicArn,
      description: 'Customer Created SNS Topic ARN',
    });

    new CfnOutput(this, 'CustomerDeletedTopicArn', {
      value: customerDeletedTopic.topicArn,
      description: 'Customer Deleted SNS Topic ARN',
      exportName: 'CustomerServiceStack-CustomerDeletedTopicArn',
    });

    const api = new HttpApi(this, 'CustomerServiceApi', {
      defaultIntegration: new HttpLambdaIntegration(
        'CustomerServiceIntegration',
        handler,
      ),
    });

    new CfnOutput(this, 'ApiUrl', {
      value: api.url!,
      description: 'API Gateway URL',
      exportName: 'CustomerServiceStack-ApiUrl',
    });

    const specsBucket = new Bucket(this, 'OpenApiSpecsBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      bucketName: `openapi-specs-${this.account}-${this.region}`,
    });

    new BucketDeployment(this, 'UploadOpenApiSpec', {
      sources: [Source.asset(path.join(__dirname, '../openapi'), {
        exclude: ['types.ts'],
      })],
      destinationBucket: specsBucket,
      destinationKeyPrefix: 'customer-service',
    });

    new CfnOutput(this, 'OpenApiSpecsBucketName', {
      value: specsBucket.bucketName,
      description: 'OpenAPI specs S3 bucket',
      exportName: 'CustomerServiceStack-OpenApiSpecsBucketName',
    });
  }
}
