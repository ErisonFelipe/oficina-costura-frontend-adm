#!/bin/bash

set -e

BUCKET="oficina-costura-admin-painel"
DISTRIBUTION_ID="E1S7XRWQSUVUPY"

echo "🔨 Buildando o painel admin..."
npm run build

echo "📤 Enviando para o S3..."
aws s3 sync dist/ "s3://$BUCKET" --delete

echo "🧹 Invalidando cache do CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" > /dev/null

echo ""
echo "✅ Deploy do painel admin concluído!"
