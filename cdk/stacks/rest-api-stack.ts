import { CfnOutput } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';
import { BaseStack, BaseStackProps } from '../lib/base-stack';

export interface RestApiStackProps extends BaseStackProps {
    userPool: cognito.UserPool;
    scenariosTable: dynamodb.ITable;
    auditTable: dynamodb.ITable;
}

export class RestApiStack extends BaseStack {
    public readonly api: apigateway.RestApi;

    constructor(scope: Construct, id: string, props: RestApiStackProps) {
        super(scope, id, props);

        const { userPool, scenariosTable, auditTable } = props;

        const scenariosLambda = new NodejsFunction(this, 'Scenarios', {
            functionName: `Scenarios-${this.envName}`,
            runtime: lambda.Runtime.NODEJS_22_X,
            entry: path.join(__dirname, '../lambdas/scenarios/index.ts'),
            handler: 'handler',
            environment: {
                SCENARIOS_TABLE_NAME: scenariosTable.tableName,
            },
        });

        scenariosTable.grantReadWriteData(scenariosLambda);

        const storeAuditLambda = new NodejsFunction(this, 'StoreAuditLog', {
            functionName: `Store-audit-log-${this.envName}`,
            runtime: lambda.Runtime.NODEJS_22_X,
            entry: path.join(__dirname, '../lambdas/store-audit-log/index.ts'),
            handler: 'handler',
            environment: {
                AUDIT_TABLE_NAME: auditTable.tableName,
            },
        });

        storeAuditLambda.addEventSource(
            new lambdaEventSources.DynamoEventSource(scenariosTable, {
                startingPosition: lambda.StartingPosition.LATEST,
                batchSize: 5,
                retryAttempts: 2,
            })
        );

        const getAuditLambda = new NodejsFunction(this, 'GetAuditLog', {
            functionName: `Get-audit-log-${this.envName}`,
            runtime: lambda.Runtime.NODEJS_22_X,
            entry: path.join(__dirname, '../lambdas/get-audit-log/index.ts'),
            handler: 'handler',
            environment: {
                AUDIT_TABLE_NAME: auditTable.tableName,
            },
        });

        auditTable.grantWriteData(storeAuditLambda);
        auditTable.grantReadData(getAuditLambda);

        this.api = new apigateway.RestApi(this, 'ScenariosApi', {
            restApiName: 'ScenariosApi',
        });

        const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'ScenariosAuthorizer', {
            cognitoUserPools: [userPool],
        });

        const scenarios = this.api.root.addResource('scenarios');
        const scenarioById = scenarios.addResource('{id}');
        const audit = scenarioById.addResource('audit');

        scenarios.addMethod('GET', new apigateway.LambdaIntegration(scenariosLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        scenarios.addMethod('POST', new apigateway.LambdaIntegration(scenariosLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        scenarioById.addMethod('GET', new apigateway.LambdaIntegration(scenariosLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        scenarioById.addMethod('PUT', new apigateway.LambdaIntegration(scenariosLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        scenarioById.addMethod('DELETE', new apigateway.LambdaIntegration(scenariosLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        audit.addMethod('GET', new apigateway.LambdaIntegration(getAuditLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        new CfnOutput(this, 'ScenariosApiUrl', {
            value: this.api.url,
            description: 'Base URL for Scenarios API',
        });
    }
}
