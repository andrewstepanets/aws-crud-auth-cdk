#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { BaseStack } from './lib/base-stack';

const app = new cdk.App();
new BaseStack(app, 'BaseStack');
