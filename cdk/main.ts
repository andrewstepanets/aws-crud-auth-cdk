#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { AuthStack } from './stacks/auth-stack';
import { RestApiStack } from './stacks/rest-api-stack';
import { WebStack } from './stacks/web-stack';

const app = new cdk.App();
const authStack = new AuthStack(app, 'AuthStack');

new WebStack(app, 'WebStack');
new RestApiStack(app, 'RestApiStack', {
    userPool: authStack.userPool,
});
