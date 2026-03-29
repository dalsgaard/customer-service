#!/bin/bash
aws cloudformation describe-stacks \
  --stack-name CustomerServiceStack \
  --region eu-north-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`CustomerCreatedTopicArn`].OutputValue' \
  --output text
