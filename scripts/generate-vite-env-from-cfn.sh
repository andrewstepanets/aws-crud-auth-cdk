#!/bin/bash
set -e

STAGE=${1:-dev}

echo "Generating Vite env for stage $STAGE"

STAGE_PREFIX=$(echo "$STAGE" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')

echo "Stage prefix $STAGE_PREFIX"

echo "Listing CloudFormation stacks"
aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --query "StackSummaries[].StackName" \
  --output text | tr '\t' '\n'

echo "Resolving stack names dynamically"

AUTH_STACK_NAME=$(aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --query "StackSummaries[].StackName" \
  --output text | tr '\t' '\n' | grep "^${STAGE_PREFIX}-AuthStack" | head -n 1)

WEB_STACK_NAME=$(aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --query "StackSummaries[].StackName" \
  --output text | tr '\t' '\n' | grep "^${STAGE_PREFIX}-WebStack" | head -n 1)

echo "Resolved names"
echo "AUTH_STACK_NAME=${AUTH_STACK_NAME}"
echo "WEB_STACK_NAME=${WEB_STACK_NAME}"

if [ -z "$AUTH_STACK_NAME" ]; then
  echo "ERROR AuthStack not found"
  exit 1
fi

if [ -z "$WEB_STACK_NAME" ]; then
  echo "ERROR WebStack not found"
  exit 1
fi

echo "Reading CloudFormation outputs"

COGNITO_DOMAIN=$(aws cloudformation describe-stacks \
  --stack-name "$AUTH_STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='CognitoAuthorizeUrl'].OutputValue" \
  --output text | sed 's|https://||' | sed 's|/oauth2/authorize.*||')

COGNITO_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name "$AUTH_STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" \
  --output text)

API_URL=$(aws cloudformation describe-stacks \
  --stack-name "$WEB_STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text)

echo "Resolved values"
echo "COGNITO_DOMAIN=${COGNITO_DOMAIN}"
echo "COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID}"
echo "API_URL=${API_URL}"

if [ -z "$COGNITO_DOMAIN" ] || [ "$COGNITO_DOMAIN" = "None" ]; then
  echo "ERROR Cognito domain not found in outputs"
  exit 1
fi

if [ -z "$COGNITO_CLIENT_ID" ] || [ "$COGNITO_CLIENT_ID" = "None" ]; then
  echo "ERROR Cognito client id not found in outputs"
  exit 1
fi

if [ -z "$API_URL" ] || [ "$API_URL" = "None" ]; then
  echo "ERROR ApiUrl not found in outputs"
  exit 1
fi

cat > .env.production << EOF
VITE_COGNITO_DOMAIN=$COGNITO_DOMAIN
VITE_COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID
VITE_API_URL=$API_URL
EOF

echo "Generated .env.production"
cat .env.production
