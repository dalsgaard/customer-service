# Customer Service CDK Project

A CDK TypeScript project that deploys a Lambda function to AWS.

## Prerequisites

- Node.js installed
- AWS CLI configured (`aws configure`)
- AWS credentials with sufficient permissions (see below)

## Deploying

```bash
# Install dependencies
npm install

# Bootstrap your AWS account (first time only)
npx cdk bootstrap

# Preview changes
npx cdk synth

# Deploy
npx cdk deploy
```

`cdk deploy` is idempotent — you can run it multiple times. It uses CloudFormation under the hood and only applies the diff, so re-running with no changes is a no-op.

## Required IAM Permissions

The IAM user or role used to deploy needs the following permissions:

| Permission | Purpose |
|---|---|
| `cloudformation:*` | CDK drives everything through CloudFormation |
| `s3:*` | CDK uploads Lambda code to a staging bucket |
| `iam:*` | CDK creates/manages the Lambda execution role |
| `lambda:*` | Creates and updates the Lambda function |
| `ssm:GetParameter` | CDK reads bootstrap parameters from SSM |

**Easy option:** Attach `AdministratorAccess` (common for personal dev accounts).

**Tighter option:** Use `PowerUserAccess` + `IAMFullAccess`, or scope down to only the services your stack uses.

To verify your current credentials and policies:

```bash
# Confirm credentials are configured
aws sts get-caller-identity

# Check attached policies (IAM user)
aws iam list-attached-user-policies --user-name <your-username>

# Check attached policies (IAM role)
aws iam list-attached-role-policies --role-name <your-role>

# Check attached policies (IAM group)
aws iam list-attached-group-policies --group-name <your-group>
```

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
