#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BottleTutorialEcsStack } from '../lib/bottle-tutorial-ecs-stack';
import { BottleTutorialFargateStack } from '../lib/bottle-tutorial-fargate-stack';

const repositoryName = 'bottle-tutorial-repo';
const imageName = 'bottle-tutorial-image';

const app = new cdk.App();

// Create the ECS stack first
const ecsStack = new BottleTutorialEcsStack(app, 'BottleTutorialEcsStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  repositoryName: repositoryName, // desired repository name
  imageName: imageName, // desired image name
});

// Get domain configuration from environment variables
const domainName = process.env.DOMAIN_NAME;
const hostedZoneId = process.env.HOSTED_ZONE_ID;

if (!domainName || !hostedZoneId) {
  throw new Error('DOMAIN_NAME and HOSTED_ZONE_ID environment variables are required for HTTPS configuration');
}

// Create the Fargate stack second
const fargateStack = new BottleTutorialFargateStack(app, 'BottleTutorialFargateStack', {
  imageName: imageName, // desired docker image name
  repositoryName: repositoryName, // desired repository name
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  executionRoleName: 'ecsTaskExecutionRole', // name of taskExecutionRole to use
  fargateServiceName: 'bottle-tutorial-fargate-service', // desired Fargate service name
  domainName: domainName,
  hostedZoneId: hostedZoneId,
});

// Add explicit dependency - Fargate stack will only deploy after ECS stack
fargateStack.addDependency(ecsStack);
