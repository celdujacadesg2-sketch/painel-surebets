# Integração com MercadoPago

Este guia mostra como adaptar o sistema para usar MercadoPago em vez de PagBank.

## 📋 Configuração

### 1. Variáveis de Ambiente

Adicione no `.env`:

```env
MERCADOPAGO_ACCESS_TOKEN="seu_access_token_aqui"
MERCADOPAGO_PUBLIC_KEY="sua_public_key_aqui"
MERCADOPAGO_ENVIRONMENT="sandbox"  # ou "production"
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
```

### 2. Instalar SDK do MercadoPago

```bash
npm install mercadopago
```

## 🔧 Implementação

### Criar Link de Pagamento (MercadoPago)

Adicione esta função em `src/app/api/payments/create/route.ts`:

```typescript
import { MercadoPagoConfig, Preference } from 'mercadopago';

async function createMercadoPagoCheckout(params: {
  paymentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  description: string;
}): Promise<string> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado');
  }

  // Configurar cliente
  const client = new MercadoPagoConfig({
    accessToken,
  });

  const preference = new Preference(client);

  // Criar preferência de pagamento
  const result = await preference.create({
    body: {
      items: [
        {
          id: params.paymentId,
          title: params.description,
          quantity: 1,
          unit_price: params.amount,
          currency_id: 'BRL',
        },
      ],
      payer: {
        name: params.userName,
        email: params.userEmail,
      },
      external_reference: params.userId,
      back_urls: {
        success: `${appUrl}/dashboard?payment=success`,
        failure: `${appUrl}/dashboard?payment=failed`,
        pending: `${appUrl}/dashboard?payment=pending`,
      },
      notification_url: `${appUrl}/api/payments/webhook`,
      auto_return: 'approved',
    },
  });

  // Retornar URL de checkout
  return result.init_point || result.sandbox_init_point || '';
}
```

### Processar Webhook (MercadoPago)

Adicione esta função em `src/app/api/payments/webhook/route.ts`:

```typescript
async function handleMercadoPagoWebhook(data: any) {
  const { id, type, action } = data;

  console.log('💳 Processando notificação MercadoPago:', { id, type, action });

  // MercadoPago envia diferentes tipos de notificação
  if (type !== 'payment') {
    return NextResponse.json({ received: true });
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado');
    return NextResponse.json({ received: true });
  }

  try {
    // Buscar detalhes do pagamento na API do MercadoPago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('❌ Erro ao buscar pagamento MercadoPago:', response.statusText);
      return NextResponse.json({ received: true });
    }

    const payment = await response.json();

    // Status: approved, pending, rejected, cancelled, refunded, charged_back
    if (payment.status === 'approved') {
      await processApprovedPayment({
        userId: payment.external_reference,
        gatewayPaymentId: payment.id.toString(),
        gateway: 'mercadopago',
        amount: payment.transaction_amount,
        metadata: JSON.stringify(payment),
      });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Erro ao processar MercadoPago webhook:', error);
    return NextResponse.json({ received: true });
  }
}
```

### Atualizar Handler Principal

Modifique a função `POST` em `src/app/api/payments/webhook/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);

    console.log('📩 Webhook recebido:', data);

    // Detectar gateway pelo formato do payload
    if (data.notificationCode || data.notification_code) {
      // PagBank
      return await handlePagBankWebhook(data, body);
    } else if (data.type === 'payment' || data.action) {
      // MercadoPago
      return await handleMercadoPagoWebhook(data);
    }

    // Outros gateways
    return await handleGenericWebhook(data);

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 🔗 Configurar Webhook no MercadoPago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em **Webhooks**
4. Adicione a URL: `https://seu-dominio.com/api/payments/webhook`
5. Selecione eventos: **Pagamento**, **Plano de assinatura**
6. Salve

## 🧪 Testar

### Usar Conta de Teste

1. Crie contas de teste no painel do MercadoPago
2. Use dados de teste:

```
Email: test_user_123456@testuser.com
CPF: 12345678909
Cartão: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
```

### Testar Webhook Localmente

Use ngrok ou similar para expor localhost:

```bash
ngrok http 3002
# Copie a URL e configure no MercadoPago
```

## 💡 Vantagens do MercadoPago

- ✅ SDK bem documentado
- ✅ Checkout transparente (sem redirecionamento)
- ✅ Suporte a Pix
- ✅ Boleto bancário
- ✅ Parcelamento
- ✅ Fácil integração

## 📚 Documentação

- API: https://www.mercadopago.com.br/developers/pt/reference
- SDK Node: https://github.com/mercadopago/sdk-nodejs
- Webhooks: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks

## 🔄 Migração do PagBank para MercadoPago

Se você já está usando PagBank e quer migrar para MercadoPago:

1. **Mantenha as duas integrações ativas** durante a transição
2. **Atualize o frontend** para oferecer escolha do gateway
3. **Teste extensivamente** no ambiente sandbox
4. **Migre gradualmente** os novos usuários
5. **Mantenha suporte ao PagBank** para pagamentos antigos

O sistema já está preparado para múltiplos gateways, basta adicionar o código acima!
