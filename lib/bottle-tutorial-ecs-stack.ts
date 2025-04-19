import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import { Construct } from 'constructs';
import * as ecrdeploy from 'cdk-ecr-deployment';

interface BottleTutorialEcsStackProps extends cdk.StackProps {
  repositoryName: string;
  imageName: string;
}

export class BottleTutorialEcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BottleTutorialEcsStackProps) {
    super(scope, id, props);

    // Create an ECR repository
    const repository = new ecr.Repository(this, props.repositoryName, {
      repositoryName: props.repositoryName,
      imageScanOnPush: true, // Enable image scanning on push (optional)
    });

    // Define a Docker image asset
    const imageAsset = new ecr_assets.DockerImageAsset(this, props.imageName, {
      directory: '.',  // Path to the directory containing Dockerfile
      displayName: props.imageName,
      platform: ecr_assets.Platform.LINUX_AMD64,
    });

    // Grant push permissions to the Docker image asset
    imageAsset.repository.grantPullPush(new cdk.aws_iam.AccountPrincipal(cdk.Aws.ACCOUNT_ID));

    // Deploy the Docker image to the ECR repository
    new ecrdeploy.ECRDeployment(this, 'DeployDockerImage', {
      src: new ecrdeploy.DockerImageName(imageAsset.imageUri),
      dest: new ecrdeploy.DockerImageName(`${cdk.Aws.ACCOUNT_ID}.dkr.ecr.${props.env?.region}.amazonaws.com/${repository.repositoryName}:${props.imageName}`),
    });

    // Output the repository URI
    new cdk.CfnOutput(this, 'bottle-tutorial-repo-uri', {
      value: repository.repositoryUri,
      description: 'The URI of the ECR repository',
    });
  }
}
