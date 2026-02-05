import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface BaseStackProps extends StackProps {
    envName: string;
}

export class BaseStack extends Stack {
    public readonly envName: string;

    constructor(scope: Construct, id: string, props: BaseStackProps) {
        super(scope, id, props);
        this.envName = props.envName;
    }

    protected createTable(id: string, props: dynamodb.TableProps): dynamodb.Table {
        return new dynamodb.Table(this, id, {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
            pointInTimeRecovery: true,
            ...props,
        });
    }
}
