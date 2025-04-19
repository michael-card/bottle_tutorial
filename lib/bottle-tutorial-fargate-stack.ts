import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { ApplicationProtocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

interface BottleTutorialFargateStackProps extends cdk.StackProps {
  imageName: string;
  repositoryName: string;
  executionRoleName: string;
  fargateServiceName: string;
  domainName: string;
  hostedZoneId: string;
}

export class BottleTutorialFargateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BottleTutorialFargateStackProps) {
    super(scope, id, props);

    // Create a VPC, name is arbitrarily set here
    const vpc = new ec2.Vpc(this, 'bottle-tutorial-vpc', {
      maxAzs: 2 // Adjust as needed
    });

    // Create an ECS cluster, name is arbitrarily set here
    const cluster = new ecs.Cluster(this, 'bottle-tutorial-cluster', {
      vpc: vpc
    });

    const role = iam.Role.fromRoleName(this, props.executionRoleName, props.executionRoleName, {
        // Set 'mutable' to 'false' to use the role as-is and prevent adding new
        // policies to it. The default is 'true', which means the role may be
        // modified as part of the deployment.
        mutable: false,
      });

    // Get the hosted zone
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'hosted-zone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.domainName,
    });

    // Create a certificate
    const certificate = new acm.Certificate(this, 'bottle-tutorial-certificate', {
      domainName: props.domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // Create a Fargate service, name is arbitrarily set here
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, props.fargateServiceName, {
      cluster: cluster,
      desiredCount: 1,
      publicLoadBalancer: true,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(ecr.Repository.fromRepositoryName(this, props.repositoryName, props.repositoryName), props.imageName),
        containerPort: 8080,
        executionRole: role,
      },
      assignPublicIp: true,
      protocol: ApplicationProtocol.HTTPS,  // with Fargate if you want HTTPS you *must* specify a custom domain
      certificate: certificate,             // which means providing a certificate for HTTPS
      domainName: props.domainName,         // and a domain name in Route53
      domainZone: hostedZone,               // and the domain's Route53 hosted zone ID
      redirectHTTP: true,
    });
  }
}
