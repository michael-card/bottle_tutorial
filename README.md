# Tutorial to run Python bottle tutorial in Fargate

Fargate will by default run your APIs as http, if you want them to be secure you must create a custom domain in Route53 and provide this domain and its associated host zone ID to the CDK stack. This tutorial assumes you will have a custom domain and its associated host zone ID available in environment variables.

## Prerequisites

- AWS account
- AWS CLI installed and configured
- Node.js and npm installed
- Python 3.13.3
- Docker

## Setup

1. Clone this repository
2. Install Node.js and npm
3. Install typescript
4. Install the AWS CLI
5. Install the CDK
6. Run `cdk bootstrap` if necessary to set up cdk for your account
7. Create a domain name in AWS Route53
8. Set environment variables for DOMAIN_NAME and HOSTED_ZONE_ID

## Deploy

1. Run `cdk deploy --all` at the command prompt
2. To test go to the URL returned by the cdk deploy command, if you just visit the URL returned you will get a help message. Add `/hello/NAME` to the URL to see the results of exercising the hello API

## Cleanup

1. Run `cdk destroy --all` at the command prompt to destroy the stack
