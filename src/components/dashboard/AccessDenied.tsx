'use client';

import { Lock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface AccessDeniedProps {
  status: 'trial' | 'subscribed' | 'expired' | 'blocked' | 'admin';
}

export default function AccessDenied({ status }: AccessDeniedProps) {
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
          <button className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition">
            Assinar Agora - R$ 99/mês
          </button>
          
          <p className="text-sm text-gray-400">
            Acesso ilimitado a todos os sinais em tempo real
          </p>
        </div>
      </div>
    </div>
  );
}
