#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { RestApiStack } from './stacks/rest-api-stack';
import { WebStack } from './stacks/web-stack';

const app = new cdk.App();
new WebStack(app, 'WebStack');
new RestApiStack(app, 'RestApiStack');
