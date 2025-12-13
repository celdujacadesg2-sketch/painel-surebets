/**
 * Exemplo de integração de pagamento no frontend
 * Este arquivo mostra como implementar a funcionalidade de pagamento
 * em um componente React/Next.js
 */

'use client';

import { useState } from 'react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  subscriptionDays: number;
  appliedAt: string | null;
  createdAt: string;
}

export default function PaymentExample() {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Planos disponíveis
  const plans = {
    monthly: { name: 'Mensal', days: 30, price: 29.90, discount: '' },
    quarterly: { name: 'Trimestral', days: 90, price: 79.90, discount: '11% OFF' },
    yearly: { name: 'Anual', days: 365, price: 299.90, discount: '17% OFF' },
  };

  /**
   * Criar pagamento e redirecionar para checkout
   */
  const handleSubscribe = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token'); // ou de onde você armazena o token JWT

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gateway: 'pagbank',
          plan: selectedPlan,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pagamento');
      }

      const data = await response.json();

      // Redirecionar para o checkout do PagBank
      window.location.href = data.payment.checkoutUrl;

    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      alert('Erro ao criar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carregar histórico de pagamentos
   */
  const loadPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/payments/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar histórico');
      }

      const data = await response.json();
      setPayments(data.payments);

    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  /**
   * Formatar status do pagamento
   */
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', color: 'bg-yellow-500' },
      completed: { label: 'Pago', color: 'bg-green-500' },
      failed: { label: 'Falhou', color: 'bg-red-500' },
      cancelled: { label: 'Cancelado', color: 'bg-gray-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 rounded text-white text-xs ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Assinatura</h1>

      {/* Seleção de Plano */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Object.entries(plans).map(([key, plan]) => (
          <div
            key={key}
            className={`border rounded-lg p-6 cursor-pointer transition ${
              selectedPlan === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300'
            }`}
            onClick={() => setSelectedPlan(key as typeof selectedPlan)}
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              {plan.discount && (
                <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded mb-2">
                  {plan.discount}
                </span>
              )}
              <div className="text-3xl font-bold mb-2">
                R$ {plan.price.toFixed(2)}
              </div>
              <div className="text-gray-600 text-sm">
                {plan.days} dias de acesso
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão de Pagamento */}
      <div className="text-center mb-12">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processando...' : 'Assinar Agora'}
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Você será redirecionado para o checkout seguro do PagBank
        </p>
      </div>

      {/* Histórico de Pagamentos */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Histórico de Pagamentos</h2>
          <button
            onClick={loadPaymentHistory}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Atualizar
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum pagamento encontrado
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dias
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Gateway
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.subscriptionDays} dias
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                      {payment.gateway}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
