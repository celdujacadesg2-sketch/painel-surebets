#!/bin/bash

# Script para testar o webhook de pagamento localmente
# Este script simula uma notificação do PagBank

echo "🧪 Testando Webhook de Pagamento"
echo "================================"
echo ""

# Configurações
API_URL="${1:-http://localhost:3002}"
USER_ID="${2:-seu-user-id-aqui}"

echo "📍 URL da API: $API_URL"
echo "👤 User ID: $USER_ID"
echo ""

# Simular webhook do PagBank
echo "📤 Enviando notificação de pagamento aprovado..."
echo ""

# Webhook com notificationCode (PagBank)
curl -X POST "$API_URL/api/payments/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationCode": "TEST-'$(date +%s)'",
    "notificationType": "transaction"
  }' \
  -v

echo ""
echo ""
echo "✅ Webhook enviado!"
echo ""
echo "📝 Notas:"
echo "  - Este é um teste básico que envia uma notificação"
echo "  - O sistema tentará buscar os dados na API do PagBank"
echo "  - Em produção, o PagBank envia notificações automaticamente"
echo "  - Verifique os logs do servidor para ver o resultado"
echo ""
echo "🔍 Para testar com dados reais:"
echo "  1. Configure PAGBANK_TOKEN no .env"
echo "  2. Use o ambiente sandbox do PagBank"
echo "  3. Faça um pagamento de teste no sandbox"
echo "  4. O PagBank enviará webhook automaticamente"
echo ""
