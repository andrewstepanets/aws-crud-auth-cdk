#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { AuthStack } from './stacks/auth-stack';
import { DataStack } from './stacks/data-stack';
import { RestApiStack } from './stacks/rest-api-stack';
import { WebStack } from './stacks/web-stack';

const envProps = { envName: 'dev' };

const app = new cdk.App();
const authStack = new AuthStack(app, 'AuthStack', envProps);
const dataStack = new DataStack(app, 'DataStack', envProps);
const restApiStack = new RestApiStack(app, 'RestApiStack', {
    ...envProps,
    userPool: authStack.userPool,
    scenariosTable: dataStack.scenariosTable,
    auditTable: dataStack.auditTable,
});
new WebStack(app, 'WebStack', {
    ...envProps,
    api: restApiStack.api,
});
