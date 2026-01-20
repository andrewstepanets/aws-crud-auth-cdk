import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export interface RestApiStackProps extends StackProps {
    userPool: cognito.UserPool;
}

export class RestApiStack extends Stack {
    constructor(scope: Construct, id: string, props: RestApiStackProps) {
        super(scope, id, props);

        const { userPool } = props;

        const scenariosTable = new dynamodb.Table(this, 'ScenariosTable', {
            tableName: 'scenarios',
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const scenariosLambda = new NodejsFunction(this, 'ScenariosHandler', {
            functionName: 'scenarios-handler',
            runtime: lambda.Runtime.NODEJS_22_X,
            entry: path.join(__dirname, '../lambdas/scenarios/index.ts'),
            handler: 'handler',
            environment: {
                SCENARIOS_TABLE_NAME: scenariosTable.tableName,
            },
        });

        scenariosTable.grantReadWriteData(scenariosLambda);

        const api = new apigateway.RestApi(this, 'ScenariosApi', {
            restApiName: 'ScenariosApi',
        });

        const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'ScenariosAuthorizer', {
            cognitoUserPools: [userPool],
        });

        const scenarios = api.root.addResource('scenarios');
        scenarios.addMethod('GET', new apigateway.LambdaIntegration(scenariosLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        scenarios.addMethod('POST', new apigateway.LambdaIntegration(scenariosLambda), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        const scenarioById = scenarios.addResource('{id}');
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

        new CfnOutput(this, 'ScenariosApiUrl', {
            value: api.url,
            description: 'Base URL for Scenarios API',
        });
    }
}
