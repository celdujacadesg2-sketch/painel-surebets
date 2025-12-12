'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { Ban, CheckCircle, Calendar } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  isBlocked: boolean;
  createdAt: string;
  accessStatus: {
    hasAccess: boolean;
    status: 'trial' | 'subscribed' | 'expired' | 'blocked' | 'admin';
    daysRemaining?: number;
  };
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  onBlockUser: (userId: string, block: boolean) => void;
  onExtendSubscription: (userId: string, days: number) => void;
}

export default function UsersTable({ users, loading, onBlockUser, onExtendSubscription }: UsersTableProps) {
  const [extendingUser, setExtendingUser] = useState<string | null>(null);
  const [daysToExtend, setDaysToExtend] = useState('30');

  if (loading) {
    return (
      <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Carregando usuários...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      trial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      subscribed: 'bg-green-500/20 text-green-400 border-green-500/30',
      expired: 'bg-red-500/20 text-red-400 border-red-500/30',
      blocked: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    
    const labels = {
      trial: 'Trial',
      subscribed: 'Assinante',
      expired: 'Expirado',
      blocked: 'Bloqueado',
      admin: 'Admin',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleExtend = (userId: string) => {
    const days = parseInt(daysToExtend);
    if (days > 0) {
      onExtendSubscription(userId, days);
      setExtendingUser(null);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Trial Expira
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Assinatura Expira
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Cadastro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700/30 transition">
                <td className="px-6 py-4">
                  <div className="text-sm text-white font-medium">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.accessStatus.status)}
                  {user.accessStatus.daysRemaining !== undefined && (
                    <div className="text-xs text-gray-400 mt-1">
                      {user.accessStatus.daysRemaining} dias restantes
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.trialEndsAt ? formatDate(new Date(user.trialEndsAt)) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.subscriptionEndsAt ? formatDate(new Date(user.subscriptionEndsAt)) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {formatDate(new Date(user.createdAt))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.role !== 'ADMIN' && (
                    <div className="flex items-center gap-2">
                      {extendingUser === user.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={daysToExtend}
                            onChange={(e) => setDaysToExtend(e.target.value)}
                            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            placeholder="Dias"
                          />
                          <button
                            onClick={() => handleExtend(user.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                          >
                            OK
                          </button>
                          <button
                            onClick={() => setExtendingUser(null)}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setExtendingUser(user.id)}
                            className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition"
                            title="Estender assinatura"
                          >
                            <Calendar size={16} />
                          </button>
                          
                          <button
                            onClick={() => onBlockUser(user.id, !user.isBlocked)}
                            className={`p-2 rounded transition ${
                              user.isBlocked
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                            title={user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                          >
                            {user.isBlocked ? <CheckCircle size={16} /> : <Ban size={16} />}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
