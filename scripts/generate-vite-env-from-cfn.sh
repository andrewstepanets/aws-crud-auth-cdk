#!/bin/bash
set -e

STAGE=${1:-dev}
# Делаем первую букву заглавной (dev -> Dev)
STAGE_CAP=$(echo "$STAGE" | awk '{print toupper(substr($0,1,1))substr($0,2)}')

echo "===== START generate vite env ====="
echo "Stage: $STAGE (Prefix: $STAGE_CAP)"

# Твои стеки называются так:
AUTH_STACK_NAME="${STAGE_CAP}-AuthStack"
WEB_STACK_NAME="${STAGE_CAP}-WebStack"

echo "Target Stacks: $AUTH_STACK_NAME, $WEB_STACK_NAME"

# Функция для вытягивания OutputValue по OutputKey
get_val() {
  aws cloudformation describe-stacks \
    --stack-name "$1" \
    --query "Stacks[0].Outputs[?OutputKey=='$2'].OutputValue" \
    --output text
}

echo "Fetching values from CloudFormation..."

# Берем значения по тем ключам, которые у тебя реально прописаны в CDK коде
COGNITO_DOMAIN=$(get_val "$AUTH_STACK_NAME" "CognitoDomain")
COGNITO_CLIENT_ID=$(get_val "$AUTH_STACK_NAME" "CognitoClientId")
API_URL=$(get_val "$WEB_STACK_NAME" "ApiUrl")

# Проверка на ошибки
if [ -z "$COGNITO_DOMAIN" ] || [ "$COGNITO_DOMAIN" == "None" ]; then
  echo "ERROR: Could not find CognitoDomain in stack $AUTH_STACK_NAME"
  exit 1
fi

echo "Creating .env.production..."

cat > .env.production << EOF
VITE_COGNITO_DOMAIN=$COGNITO_DOMAIN
VITE_COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID
VITE_API_URL=$API_URL
EOF

echo "--- .env.production content ---"
cat .env.production
echo "-------------------------------"
echo "===== END generate vite env ====="
