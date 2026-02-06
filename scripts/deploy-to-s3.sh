#!/bin/bash
set -e

STAGE=${1:-dev}
STAGE_CAP=$(echo "$STAGE" | awk '{print toupper(substr($0,1,1))substr($0,2)}')
WEB_STACK_NAME="${STAGE_CAP}-WebStack"

echo "Deploying to S3 for stage: $STAGE"

BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name "$WEB_STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='WebsiteBucketName'].OutputValue" --output text)
DIST_ID=$(aws cloudformation describe-stacks --stack-name "$WEB_STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)

if [ -z "$BUCKET_NAME" ] || [ "$BUCKET_NAME" == "None" ]; then
    echo "ERROR: Bucket name not found for stack $WEB_STACK_NAME"
    exit 1
fi

echo "Syncing build/ to s3://$BUCKET_NAME"
aws s3 sync build/ s3://$BUCKET_NAME --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"

echo "Deployment complete!"
