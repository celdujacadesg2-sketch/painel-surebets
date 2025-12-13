'use client';


import { Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/providers/';
import { useState } from 'react';

interface AccessDeniedProps {
  status: 'trial' | 'subscribed' | 'expired' | 'blocked' | 'admin';
}

export default function AccessDenied({ status }: AccessDeniedProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckout() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/paymaker/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user?.name, email: user?.email }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Erro ao criar pagamento');
      // Redirecionar para a URL de pagamento (PIX, cartão, etc)
      // Tente encontrar a URL no payload retornado
      const url = data.data?.payload?.payment_url || data.data?.payload?.pix_url || data.data?.payload?.url;
      if (url) {
        window.location.href = url;
      } else {
        setError('URL de pagamento não encontrada.');
      }
    } catch (e: any) {
      setError(e.message || 'Erro ao criar pagamento');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'blocked') {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Conta Bloqueada</h2>
          <p className="text-gray-300 mb-6">
            Sua conta foi bloqueada. Entre em contato com o suporte para mais informações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="bg-gray-800/50 border-2 border-yellow-500 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={32} className="text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Acesso Expirado</h2>
        <p className="text-gray-300 mb-6">
          {status === 'expired'
            ? 'Seu período de teste terminou. Para continuar acessando os sinais, faça sua assinatura.'
            : 'Seu acesso expirou. Renove sua assinatura para continuar.'}
        </p>
        <div className="space-y-4">
            <a
              href={`https://wa.me/21998405571?text=Olá! Quero renovar minha assinatura do Surecapta. Meu email cadastrado é: ${user?.email || ''}`}
              target="_self"
              rel="noopener noreferrer"
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition text-center block"
            >
              Assinar Agora - R$ 99/mês
            </a>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <p className="text-sm text-gray-400">
            Acesso ilimitado a todos os sinais em tempo real
          </p>
        </div>
      </div>
    </div>
  );
}
