#!/bin/bash
set -e

URL=$(aws cloudformation describe-stacks \
  --stack-name CustomerServiceStack \
  --region eu-north-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text)

# Extract the API ID from the URL (https://<apiId>.execute-api....)
API_ID=$(echo "$URL" | sed 's|https://||' | cut -d'.' -f1)

sed -i '' "s/default: .*/default: $API_ID/" openapi/customer.oas.yaml

echo "Updated apiId to $API_ID"
