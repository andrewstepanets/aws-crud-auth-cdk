import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthStack } from './stacks/auth-stack';
import { DataStack } from './stacks/data-stack';
import { RestApiStack } from './stacks/rest-api-stack';
import { WebStack } from './stacks/web-stack';

export class AppStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps & { envName: string }) {
        super(scope, id, props);

        const envProps = { envName: props?.envName ?? 'dev' };

        const authStack = new AuthStack(this, 'AuthStack', envProps);
        const dataStack = new DataStack(this, 'DataStack', envProps);

        const restApiStack = new RestApiStack(this, 'RestApiStack', {
            ...envProps,
            userPool: authStack.userPool,
            scenariosTable: dataStack.scenariosTable,
            auditTable: dataStack.auditTable,
        });

        new WebStack(this, 'WebStack', {
            ...envProps,
            api: restApiStack.api,
        });
    }
}
