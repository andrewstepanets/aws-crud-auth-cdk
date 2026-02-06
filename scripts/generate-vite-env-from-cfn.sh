#!/bin/bash
set -e

STAGE=${1:-dev}
STAGE_CAP=$(echo "$STAGE" | awk '{print toupper(substr($0,1,1))substr($0,2)}')

echo "===== START generate vite env ====="
echo "Stage: $STAGE (Prefix: $STAGE_CAP)"

AUTH_STACK_NAME="${STAGE_CAP}-AuthStack"
WEB_STACK_NAME="${STAGE_CAP}-WebStack"

echo "Target Stacks: $AUTH_STACK_NAME, $WEB_STACK_NAME"

get_val() {
  aws cloudformation describe-stacks \
    --stack-name "$1" \
    --query "Stacks[0].Outputs[?OutputKey=='$2'].OutputValue" \
    --output text
}

echo "Fetching values from CloudFormation..."

COGNITO_DOMAIN=$(get_val "$AUTH_STACK_NAME" "CognitoDomain")
COGNITO_CLIENT_ID=$(get_val "$AUTH_STACK_NAME" "CognitoClientId")
API_URL=$(get_val "$WEB_STACK_NAME" "ApiUrl")

if [ -z "$COGNITO_DOMAIN" ] || [ "$COGNITO_DOMAIN" == "None" ]; then
  echo "ERROR: Could not find CognitoDomain in stack $AUTH_STACK_NAME"
  exit 1
fi

echo "Creating .env.production..."

cat > src/.env.production << EOF
VITE_COGNITO_DOMAIN=$COGNITO_DOMAIN
VITE_COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID
VITE_API_URL=$API_URL
EOF

echo "--- .env.production content ---"
echo "File created at src/.env.production"
echo "-------------------------------"
echo "===== END generate vite env ====="
