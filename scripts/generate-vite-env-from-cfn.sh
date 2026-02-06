#!/bin/bash
set -e

STAGE=${1:-dev}
PIPELINE_STACK="PipelineStack"

echo "Generating Vite env for stage: $STAGE"

# Capitalize first letter for stack name
STAGE_PREFIX=$(echo "$STAGE" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')

# Find stack names (CDK Pipelines creates: PipelineStack-Dev-AuthStack-XXXXX)
AUTH_PATTERN="${PIPELINE_STACK}-${STAGE_PREFIX}-AuthStack"
WEB_PATTERN="${PIPELINE_STACK}-${STAGE_PREFIX}-WebStack"

echo "Looking for stacks matching: $AUTH_PATTERN, $WEB_PATTERN"

# Find actual stack names
AUTH_STACK=$(aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --query "StackSummaries[?contains(StackName, '$AUTH_PATTERN')].StackName | [0]" \
  --output text)

WEB_STACK=$(aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --query "StackSummaries[?contains(StackName, '$WEB_PATTERN')].StackName | [0]" \
  --output text)

if [ -z "$AUTH_STACK" ] || [ "$AUTH_STACK" = "None" ]; then
  echo "Error: Auth stack not found"
  exit 1
fi

if [ -z "$WEB_STACK" ] || [ "$WEB_STACK" = "None" ]; then
  echo "Error: Web stack not found"
  exit 1
fi

echo "Found auth stack: $AUTH_STACK"
echo "Found web stack: $WEB_STACK"

# Get outputs
COGNITO_DOMAIN=$(aws cloudformation describe-stacks \
  --stack-name "$AUTH_STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='CognitoDomain'].OutputValue" \
  --output text)

COGNITO_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name "$AUTH_STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='CognitoClientId'].OutputValue" \
  --output text)

if [ -z "$COGNITO_DOMAIN" ] || [ "$COGNITO_DOMAIN" = "None" ]; then
  echo "Error: CognitoDomain output not found"
  exit 1
fi

if [ -z "$COGNITO_CLIENT_ID" ] || [ "$COGNITO_CLIENT_ID" = "None" ]; then
  echo "Error: CognitoClientId output not found"
  exit 1
fi

# Write .env.production
cat > .env.production << EOF
VITE_COGNITO_DOMAIN=$COGNITO_DOMAIN
VITE_COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID
VITE_API_URL=/api
EOF

echo "Generated .env.production:"
cat .env.production
