# 💳 Configuração do Gateway de Pagamento

Este guia explica como configurar o webhook de pagamento para renovação automática de assinaturas.

## 🎯 Objetivo

Quando um cliente efetuar o pagamento, o sistema automaticamente:
- ✅ Registra o pagamento no banco de dados
- ✅ Adiciona 30 dias de acesso ao painel
- ✅ Renova a assinatura automaticamente

## 📋 Pré-requisitos

1. **Conta no Gateway de Pagamento** (PagBank, MercadoPago, etc)
2. **Token da API** do gateway
3. **URL pública** do seu servidor (não pode ser localhost)

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
# Gateway de Pagamento (PagBank)
PAGBANK_TOKEN="seu_token_aqui"
PAGBANK_ENVIRONMENT="sandbox"  # ou "production"

# URL pública do seu app (obrigatório para webhooks)
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
```

### 2. Aplicar Schema do Banco de Dados

Execute os comandos para atualizar o banco de dados com a tabela de pagamentos:

```bash
npx prisma generate
npx prisma db push
```

### 3. Configurar Webhook no Gateway

#### PagBank/PagSeguro:

1. Acesse o painel do PagBank
2. Vá em **Integrações** > **Notificações**
3. Configure a URL de notificação:
   ```
   https://seu-dominio.com/api/payments/webhook
   ```
4. Selecione os eventos: **Transação concluída**, **Transação cancelada**

#### MercadoPago:

1. Acesse o painel do MercadoPago
2. Vá em **Configurações** > **Webhooks**
3. Configure a URL:
   ```
   https://seu-dominio.com/api/payments/webhook
   ```
4. Selecione os eventos de pagamento

## 🚀 Como Usar

### Criar Link de Pagamento

**Endpoint:** `POST /api/payments/create`

**Headers:**
```
Authorization: Bearer {seu_jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "gateway": "pagbank",
  "plan": "monthly"
}
```

**Planos disponíveis:**
- `monthly` - 30 dias - R$ 29,90
- `quarterly` - 90 dias - R$ 79,90
- `yearly` - 365 dias - R$ 299,90

**Resposta:**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "amount": 29.90,
    "checkoutUrl": "https://pagseguro.uol.com.br/v2/checkout/payment.html?code=..."
  }
}
```

### Ver Histórico de Pagamentos

**Endpoint:** `GET /api/payments/history`

**Headers:**
```
Authorization: Bearer {seu_jwt_token}
```

**Resposta:**
```json
{
  "payments": [
    {
      "id": "uuid",
      "amount": 29.90,
      "currency": "BRL",
      "status": "completed",
      "gateway": "pagbank",
      "subscriptionDays": 30,
      "appliedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:25:00Z"
    }
  ]
}
```

## 🔄 Fluxo de Pagamento

1. **Cliente solicita pagamento:**
   - Frontend chama `POST /api/payments/create`
   - Recebe URL de checkout

2. **Cliente é redirecionado:**
   - Abre a URL do gateway (PagBank, MercadoPago, etc)
   - Efetua o pagamento

3. **Gateway processa pagamento:**
   - Pagamento aprovado/recusado
   - Gateway envia notificação para webhook

4. **Webhook recebe notificação:**
   - `POST /api/payments/webhook` é chamado automaticamente
   - Sistema verifica status do pagamento
   - Se aprovado, renova assinatura automaticamente

5. **Cliente volta ao painel:**
   - Acesso renovado por 30 dias
   - Pode usar o sistema normalmente

## 📊 Modelo de Dados

### Payment

```typescript
{
  id: string              // UUID
  userId: string          // ID do usuário
  amount: number          // Valor em R$
  currency: string        // BRL
  status: string          // pending, completed, failed, cancelled
  gateway: string         // pagbank, mercadopago, etc
  gatewayOrderId: string  // ID do pedido no gateway
  gatewayPaymentId: string // ID único do pagamento
  subscriptionDays: number // Dias que esse pagamento concede
  appliedAt: Date         // Quando foi aplicado
  metadata: string        // JSON com dados extras
  createdAt: Date
  updatedAt: Date
}
```

## 🛡️ Segurança

### Validação do Webhook

O webhook valida:
- ✅ Notificação vem do gateway oficial
- ✅ Busca dados direto da API do gateway (não confia apenas no webhook)
- ✅ Evita processar o mesmo pagamento duas vezes
- ✅ Registra logs de todas as operações

### Recomendações

1. **Use HTTPS** - Obrigatório em produção
2. **Configure CORS** - Apenas domínios autorizados
3. **Monitore logs** - Acompanhe os webhooks recebidos
4. **Teste no sandbox** - Use ambiente de teste antes de produção

## 🧪 Testando

### Ambiente Sandbox (PagBank)

1. Configure `PAGBANK_ENVIRONMENT="sandbox"`
2. Use token de sandbox
3. Acesse: https://sandbox.pagseguro.uol.com.br
4. Faça pagamentos de teste

### Dados de Teste PagBank

```
Email: test@sandbox.pagseguro.com.br
CPF: 111.111.111-11
Cartão: 4111 1111 1111 1111
CVV: 123
Validade: 12/30
```

## 📝 Exemplos de Integração Frontend

### React/Next.js

```typescript
// Criar pagamento
async function handleSubscribe() {
  const response = await fetch('/api/payments/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gateway: 'pagbank',
      plan: 'monthly',
    }),
  });

  const data = await response.json();
  
  // Redirecionar para checkout
  window.location.href = data.payment.checkoutUrl;
}

// Ver histórico
async function loadPaymentHistory() {
  const response = await fetch('/api/payments/history', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  setPayments(data.payments);
}
```

## 🐛 Troubleshooting

### Webhook não está sendo chamado

1. Verifique se a URL está pública (não localhost)
2. Confirme HTTPS em produção
3. Verifique logs do gateway
4. Teste manualmente com curl:

```bash
curl -X POST https://seu-dominio.com/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"notificationCode": "test123"}'
```

### Pagamento não renova assinatura

1. Verifique logs do servidor: `console.log` no webhook
2. Confirme que o `userId` está correto no `reference`
3. Verifique se o status é `3` (aprovado) no PagBank
4. Confira se não há erro de conexão com banco de dados

### Erro ao criar checkout

1. Verifique se `PAGBANK_TOKEN` está configurado
2. Confirme que `NEXT_PUBLIC_APP_URL` está correto
3. Teste no ambiente sandbox primeiro
4. Verifique se o token tem permissões corretas

## 📞 Suporte

Para problemas com:
- **Sistema:** Verifique logs do servidor
- **PagBank:** https://dev.pagseguro.uol.com.br/
- **MercadoPago:** https://www.mercadopago.com.br/developers/

## 🎉 Pronto!

Agora seu sistema está configurado para:
- ✅ Receber pagamentos automaticamente
- ✅ Renovar assinaturas via webhook
- ✅ Processar 30 dias de acesso por pagamento
