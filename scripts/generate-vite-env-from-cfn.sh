#!/bin/bash
set -e

# Usage: ./generate-vite-env-from-cfn.sh dev|prod
STAGE=${1:-dev}

echo "Generating Vite env for stage: $STAGE"

# Dev -> Dev, prod -> Prod
STAGE_PREFIX=$(echo "$STAGE" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')

AUTH_STACK_PART="${STAGE_PREFIX}-AuthStack"
WEB_STACK_PART="${STAGE_PREFIX}-WebStack"

echo "Looking for stacks containing:"
echo "  AuthStack: $AUTH_STACK_PART"
echo "  WebStack : $WEB_STACK_PART"

# Find real stack names (with hashes)
AUTH_STACK=$(aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE UPDATE_ROLLBACK_COMPLETE \
  --query "StackSummaries[?contains(StackName, '${AUTH_STACK_PART}')].StackName | [0]" \
  --output text)

WEB_STACK=$(aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE UPDATE_ROLLBACK_COMPLETE \
  --query "StackSummaries[?contains(StackName, '${WEB_STACK_PART}')].StackName | [0]" \
  --output text)

if [ -z "$AUTH_STACK" ] || [ "$AUTH_STACK" = "None" ]; then
  echo "ERROR: Auth stack not found"
  aws cloudformation list-stacks \
    --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE UPDATE_ROLLBACK_COMPLETE \
    --query "StackSummaries[].StackName"
  exit 1
fi

if [ -z "$WEB_STACK" ] || [ "$WEB_STACK" = "None" ]; then
  echo "ERROR: Web stack not found"
  aws cloudformation list-stacks \
    --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE UPDATE_ROLLBACK_COMPLETE \
    --query "StackSummaries[].StackName"
  exit 1
fi

echo "Found Auth stack: $AUTH_STACK"
echo "Found Web  stack: $WEB_STACK"

# Read outputs
COGNITO_DOMAIN=$(aws cloudformation describe-stacks \
  --stack-name "$AUTH_STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='CognitoDomain'].OutputValue" \
  --output text)

COGNITO_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name "$AUTH_STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='CognitoClientId'].OutputValue" \
  --output text)

if [ -z "$COGNITO_DOMAIN" ] || [ "$COGNITO_DOMAIN" = "None" ]; then
  echo "ERROR: CognitoDomain output not found in $AUTH_STACK"
  exit 1
fi

if [ -z "$COGNITO_CLIENT_ID" ] || [ "$COGNITO_CLIENT_ID" = "None" ]; then
  echo "ERROR: CognitoClientId output not found in $AUTH_STACK"
  exit 1
fi

# API URL
if [ "$STAGE" = "prod" ]; then
  API_URL="/api"
else
  API_URL="/api"
fi

# Write Vite env
cat > .env.production << EOF
VITE_COGNITO_DOMAIN=$COGNITO_DOMAIN
VITE_COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID
VITE_API_URL=$API_URL
EOF

echo "Generated .env.production:"
cat .env.production
