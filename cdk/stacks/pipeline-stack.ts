import { Stack, StackProps } from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { AppStage } from '../app-stage';

export interface PipelineStackProps extends StackProps {
    connectionArn: string;
}

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props: PipelineStackProps) {
        super(scope, id, props);

        const source = pipelines.CodePipelineSource.connection('andrewstepanets/aws-crud-auth-cdk', 'main', {
            connectionArn: props.connectionArn,
            triggerOnPush: true,
        });

        const pipeline = new pipelines.CodePipeline(this, 'CicdPipeline', {
            synth: new pipelines.CodeBuildStep('Synth', {
                input: source,

                buildEnvironment: {
                    buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
                    environmentVariables: {
                        CONNECTION_ARN: {
                            value: props.connectionArn,
                        },
                    },
                },

                installCommands: ['n 20', 'node -v'],

                commands: [
                    'corepack enable',
                    'mkdir -p build',
                    'echo "Placeholder" > build/index.html',
                    'cd cdk',
                    'yarn install',
                    'yarn test',
                    'npx cdk synth',
                ],

                primaryOutputDirectory: 'cdk/cdk.out',
            }),
        });

        const devStage = new AppStage(this, 'Dev', {
            envName: 'dev',
            env: {
                account: process.env.CDK_DEFAULT_ACCOUNT,
                region: process.env.CDK_DEFAULT_REGION,
            },
        });

        pipeline.addStage(devStage, {
            post: [
                new pipelines.CodeBuildStep('BuildAndDeployUiDev', {
                    input: source,
                    installCommands: ['n 20', 'node -v'],
                    commands: [
                        'echo "Generating Vite env from CloudFormation outputs"',
                        'bash scripts/generate-vite-env-from-cfn.sh dev',
                        'echo "Building frontend"',
                        'corepack enable',
                        'yarn install',
                        'yarn build --mode prod',
                        'echo "Deploying to S3"',
                        'bash scripts/deploy-to-s3.sh dev',
                    ],
                    rolePolicyStatements: [
                        new iam.PolicyStatement({
                            actions: ['cloudformation:DescribeStacks', 'cloudformation:ListStacks'],
                            resources: ['*'],
                        }),
                        new iam.PolicyStatement({
                            actions: ['s3:PutObject', 's3:ListBucket', 's3:DeleteObject'],
                            resources: ['*'],
                        }),
                        new iam.PolicyStatement({
                            actions: ['cloudfront:CreateInvalidation'],
                            resources: ['*'],
                        }),
                    ],
                }),
            ],
        });

        const prodStage = new AppStage(this, 'Prod', {
            envName: 'prod',
            env: {
                account: process.env.CDK_DEFAULT_ACCOUNT,
                region: process.env.CDK_DEFAULT_REGION,
            },
        });

        pipeline.addStage(prodStage, {
            pre: [new pipelines.ManualApprovalStep('PromoteToProd')],
            post: [
                new pipelines.CodeBuildStep('BuildAndDeployUiProd', {
                    input: source,
                    installCommands: ['n 20', 'node -v'],
                    commands: [
                        'echo "Generating Vite env from CloudFormation outputs"',
                        'bash scripts/generate-vite-env-from-cfn.sh prod',
                        'echo "Building frontend"',
                        'corepack enable',
                        'yarn install',
                        'yarn build --mode prod',
                        'echo "Deploying to S3"',
                        'bash scripts/deploy-to-s3.sh prod',
                    ],
                    rolePolicyStatements: [
                        new iam.PolicyStatement({
                            actions: ['cloudformation:DescribeStacks', 'cloudformation:ListStacks'],
                            resources: ['*'],
                        }),
                        new iam.PolicyStatement({
                            actions: ['s3:PutObject', 's3:ListBucket', 's3:DeleteObject'],
                            resources: ['*'],
                        }),
                        new iam.PolicyStatement({
                            actions: ['cloudfront:CreateInvalidation'],
                            resources: ['*'],
                        }),
                    ],
                }),
            ],
        });
    }
}
