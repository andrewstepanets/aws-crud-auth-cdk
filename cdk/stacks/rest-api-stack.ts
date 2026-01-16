import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export class RestApiStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const scenariosHandler = new NodejsFunction(this, 'ScenariosHandler', {
            functionName: 'scenarios-handler',
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../lambdas/scenarios/index.ts'),
            handler: 'handler',
        });

        const api = new apigateway.RestApi(this, 'ScenariosApi', {
            restApiName: 'ScenariosApi',
        });

        const scenarios = api.root.addResource('scenarios');
        scenarios.addMethod('GET', new apigateway.LambdaIntegration(scenariosHandler));
        scenarios.addMethod('POST', new apigateway.LambdaIntegration(scenariosHandler));

        const scenarioById = scenarios.addResource('{id}');
        scenarioById.addMethod('GET', new apigateway.LambdaIntegration(scenariosHandler));
        scenarioById.addMethod('PUT', new apigateway.LambdaIntegration(scenariosHandler));
        scenarioById.addMethod('DELETE', new apigateway.LambdaIntegration(scenariosHandler));

        new CfnOutput(this, 'ScenariosApiUrl', {
            value: api.url,
            description: 'Base URL for Scenarios API',
        });
    }
}
