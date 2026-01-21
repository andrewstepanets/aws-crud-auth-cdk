import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class AuthStack extends Stack {
    public readonly userPool: cognito.UserPool;
    public readonly userPoolUiClient: cognito.UserPoolClient;
    public readonly userPoolApiClient: cognito.UserPoolClient;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const urls = ['https://dgmpvfufnkjzg.cloudfront.net', 'http://localhost:3000'];

        this.userPool = new cognito.UserPool(this, 'ScenariosUserPool', {
            userPoolName: 'scenarios-user-pool',
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
                domainPrefix: `scenarios-auth-${this.account}`,
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

        new CfnOutput(this, 'UserPoolId', {
            value: this.userPool.userPoolId,
        });

        new CfnOutput(this, 'UserPoolClientId', {
            value: this.userPoolUiClient.userPoolClientId,
        });

        new CfnOutput(this, 'CognitoAuthorizeUrl', {
            value:
                `https://scenarios-auth-${this.account}.auth.${this.region}.amazoncognito.com/oauth2/authorize` +
                `?client_id=${this.userPoolUiClient.userPoolClientId}` +
                `&response_type=code` +
                `&scope=openid+email+profile` +
                `&redirect_uri=https://dgmpvfufnkjzg.cloudfront.net`,
        });

        new CfnOutput(this, 'ApiClientId', {
            value: this.userPoolApiClient.userPoolClientId,
        });
    }
}
