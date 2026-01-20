import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class AuthStack extends Stack {
    public readonly userPool;
    public readonly userPoolClient;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

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

        this.userPoolClient = new cognito.UserPoolClient(this, 'ScenariosUserPoolClient', {
            userPool: this.userPool,
            authFlows: {
                userPassword: true,
                userSrp: true,
            },
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
            value: this.userPoolClient.userPoolClientId,
        });
    }
}
