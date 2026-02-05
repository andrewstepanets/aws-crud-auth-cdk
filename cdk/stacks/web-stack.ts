import { CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { BaseStackProps } from '../lib/base-stack';

export interface WebStackProps extends BaseStackProps {
    api: apigateway.RestApi;
}

export class WebStack extends Stack {
    public readonly distribution: cloudfront.Distribution;

    constructor(scope: Construct, id: string, props: WebStackProps) {
        super(scope, id, props);

        // need to wait deploy restapi stack
        this.addDependency(Stack.of(props.api));

        const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        const apiDomain = `${props.api.restApiId}.execute-api.${Stack.of(this).region}.${Stack.of(this).urlSuffix}`;
        const apiPath = props.api.deploymentStage.stageName;

        const rewriteFunction = new cloudfront.Function(this, 'ApiRewriteFunction', {
            code: cloudfront.FunctionCode.fromInline(`
                    function handler(event) {
                        var request = event.request;
  
                        request.uri = request.uri.replace(/^\\/api/, '');
                        return request;
                    }
            `),
        });

        this.distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
                compress: true,
            },
            additionalBehaviors: {
                '/api/*': {
                    origin: new origins.HttpOrigin(apiDomain, {
                        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
                        originPath: `/${apiPath}`,
                    }),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
                    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                    originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
                    functionAssociations: [
                        {
                            function: rewriteFunction,
                            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
                        },
                    ],
                },
            },
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: Duration.seconds(300),
                },
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: Duration.seconds(300),
                },
            ],
        });

        new s3deploy.BucketDeployment(this, 'DeployWebsite', {
            sources: [s3deploy.Source.asset('../build')],
            destinationBucket: websiteBucket,
            distribution: this.distribution,
            distributionPaths: ['/*'],
        });

        new CfnOutput(this, 'WebsiteUrl', {
            value: `https://${this.distribution.distributionDomainName}`,
            description: 'CloudFront distribution URL',
        });

        new CfnOutput(this, 'DistributionId', {
            value: this.distribution.distributionId,
            description: 'CloudFront distribution ID',
        });

        new CfnOutput(this, 'ApiUrl', {
            value: `https://${this.distribution.distributionDomainName}/api`,
            description: 'API URL through CloudFront',
        });
    }
}
