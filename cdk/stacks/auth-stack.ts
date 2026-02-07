import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { BaseStack, BaseStackProps } from '../lib/base-stack';

export class AuthStack extends BaseStack {
    public readonly userPool: cognito.UserPool;
    public readonly userPoolUiClient: cognito.UserPoolClient;
    public readonly userPoolApiClient: cognito.UserPoolClient;

    constructor(scope: Construct, id: string, props: BaseStackProps) {
        super(scope, id, props);

        const urls =
            this.envName === 'prod'
                ? ['https://localhost:3000']
                : ['https://d9slborqav0zn.cloudfront.net', 'http://localhost:3000'];

        this.userPool = new cognito.UserPool(this, 'ScenariosUserPool', {
            userPoolName: `scenarios-user-pool-${this.envName}`,
            selfSignUpEnabled: false,
            signInAliases: { email: true },
            passwordPolicy: {
                minLength: 8,
                requireDigits: true,
                requireLowercase: true,
                requireUppercase: true,
                requireSymbols: false,
            },
            removalPolicy: RemovalPolicy.DESTROY,
        });

        this.userPool.addDomain('ScenariosDomain', {
            cognitoDomain: {
                domainPrefix: `scenarios-auth-${this.envName}-${this.account}`,
            },
        });

        this.userPoolUiClient = new cognito.UserPoolClient(this, 'ScenariosUserPoolClient', {
            userPool: this.userPool,
            generateSecret: false,
            accessTokenValidity: Duration.minutes(10),
            refreshTokenValidity: Duration.hours(4),
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                },
                scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
                callbackUrls: urls,
                logoutUrls: urls,
            },
        });

        this.userPoolApiClient = new cognito.UserPoolClient(this, 'ScenariosApiClient', {
            userPool: this.userPool,
            generateSecret: false,
            authFlows: {
                userPassword: true,
            },
            accessTokenValidity: Duration.minutes(10),
        });

        new cognito.CfnUserPoolGroup(this, 'EditorsGroup', {
            userPoolId: this.userPool.userPoolId,
            groupName: 'editors',
        });

        new cognito.CfnUserPoolGroup(this, 'ViewersGroup', {
            userPoolId: this.userPool.userPoolId,
            groupName: 'viewers',
        });

        new CfnOutput(this, 'CognitoDomain', {
            value: `scenarios-auth-${this.envName}-${this.account}.auth.${this.region}.amazoncognito.com`,
            description: 'Cognito domain',
        });

        new CfnOutput(this, 'CognitoClientId', {
            value: this.userPoolUiClient.userPoolClientId,
            description: 'Cognito UI client ID',
        });

        new CfnOutput(this, 'UserPoolId', {
            value: this.userPool.userPoolId,
        });

        new CfnOutput(this, 'ApiClientId', {
            value: this.userPoolApiClient.userPoolClientId,
        });
    }
}
