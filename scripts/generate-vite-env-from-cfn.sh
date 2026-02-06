#!/bin/bash
set -e

STAGE=${1:-dev}

echo "Generating Vite env for stage: $STAGE"

# Capitalize first letter for stack name
STAGE_PREFIX=$(echo "$STAGE" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')

# Stack names: Dev-AuthStack, Dev-WebStack, Prod-AuthStack, Prod-WebStack
AUTH_STACK="${STAGE_PREFIX}-AuthStack"
WEB_STACK="${STAGE_PREFIX}-WebStack"

echo "Using stack names: $AUTH_STACK, $WEB_STACK"

# Verify stacks exist
AUTH_EXISTS=$(aws cloudformation describe-stacks --stack-name "$AUTH_STACK" 2>/dev/null || echo "")
WEB_EXISTS=$(aws cloudformation describe-stacks --stack-name "$WEB_STACK" 2>/dev/null || echo "")

if [ -z "$AUTH_EXISTS" ]; then
  echo "Error: Auth stack $AUTH_STACK not found"
  exit 1
fi

if [ -z "$WEB_EXISTS" ]; then
  echo "Error: Web stack $WEB_STACK not found"
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
