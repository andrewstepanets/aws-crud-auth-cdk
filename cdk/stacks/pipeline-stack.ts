import { Stack, StackProps } from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
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
                    'yarn install',
                    'yarn build',
                    'cd cdk',
                    'yarn install',
                    'yarn test',
                    'npx cdk synth',
                ],

                primaryOutputDirectory: 'cdk/cdk.out',
            }),
        });

        pipeline.addStage(
            new AppStage(this, 'Dev', {
                envName: 'dev',
                env: {
                    account: process.env.CDK_DEFAULT_ACCOUNT,
                    region: process.env.CDK_DEFAULT_REGION,
                },
            })
        );

        pipeline.addStage(
            new AppStage(this, 'Prod', {
                envName: 'prod',
                env: {
                    account: process.env.CDK_DEFAULT_ACCOUNT,
                    region: process.env.CDK_DEFAULT_REGION,
                },
            }),
            {
                pre: [new pipelines.ManualApprovalStep('PromoteToProd')],
            }
        );
    }
}
