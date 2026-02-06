#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { PipelineStack } from './stacks/pipeline-stack';

const app = new cdk.App();

const connectionArn = app.node.tryGetContext('connectionArn') || process.env.CONNECTION_ARN;

new PipelineStack(app, 'PipelineStack', {
    connectionArn,
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});
