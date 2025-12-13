import { NextRequest, NextResponse } from 'next/server';

// Endpoint seguro para criar transação Paymaker
export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ ok: false, error: 'Nome e email são obrigatórios.' }, { status: 400 });
    }

    // Montar payload mínimo para Paymaker
    const payload = {
      name,
      email,
      tel: '', // Opcional
      document: '', // Opcional
      payType: 'PIX', // Ou 'CREDIT_CARD', 'BOLETO' se quiser permitir outros
      installments: 1,
      transAmt: 9700, // R$97,00 em centavos
      product: {
        pro_name: 'Acesso Painel Surecapta',
        pro_text: 'Assinatura 30 dias',
        pro_category: 'Assinatura',
        pro_email: email,
        pro_phone: '',
        pro_days_warranty: 0,
        pro_delivery_type: 'online',
        pro_text_email: '',
        pro_site: 'https://surecapta.com',
      },
      trans_webhook_url: process.env.PAYMAKER_WEBHOOK_URL,
      address_cep: '',
      address_street: '',
      address_number: '',
      address_district: '',
      address_city: '',
      address_state: '',
      address_country: '',
      address_complement: '',
    };

    // Montar Authorization header
    const publicKey = process.env.PAYMAKER_PUBLIC_KEY;
    const secretKey = process.env.PAYMAKER_SECRET_KEY;
    if (!publicKey || !secretKey) {
      return NextResponse.json({ ok: false, error: 'Credenciais Paymaker não configuradas.' }, { status: 500 });
    }
    const credentials = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');

    // Chamar API Paymaker
    const response = await fetch('https://api.paymaker.com.br/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': credentials,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      return NextResponse.json({ ok: false, error: result.error || 'Erro ao criar transação.' }, { status: 500 });
    }

    // Retornar dados da transação (incluindo URL de pagamento)
    return NextResponse.json({ ok: true, data: result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
