import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { BaseStack, BaseStackProps } from '../lib/base-stack';

export class DataStack extends BaseStack {
    public readonly scenariosTable: dynamodb.Table;
    public readonly auditTable: dynamodb.Table;

    constructor(scope: Construct, id: string, props: BaseStackProps) {
        super(scope, id, props);

        this.scenariosTable = this.createTable('ScenariosTable', {
            tableName: `scenarios-${this.envName}`,
            partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
            stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
        });

        this.scenariosTable.addGlobalSecondaryIndex({
            indexName: 'id-index',
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING,
            },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        this.scenariosTable.addGlobalSecondaryIndex({
            indexName: 'createdBy-index',
            partitionKey: {
                name: 'createdBy',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'createdAt',
                type: dynamodb.AttributeType.STRING,
            },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        this.auditTable = this.createTable('AuditLogsTable', {
            tableName: `audit-logs-${this.envName}`,
            partitionKey: { name: 'scenarioId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
        });
    }
}
