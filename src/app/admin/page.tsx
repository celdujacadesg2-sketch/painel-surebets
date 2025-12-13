'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/providers/AuthProvider';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import UsersTable from '../../components/admin/UsersTable';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleBlockUser = async (userId: string, block: boolean) => {
    try {
      const token = Cookies.get('token');
      await axios.patch(
        `/api/admin/users/${userId}`,
        { isBlocked: block },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleExtendSubscription = async (userId: string, days: number) => {
    try {
      const token = Cookies.get('token');
      await axios.post(
        `/api/admin/users/${userId}/subscription`,
        { days },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (error) {
      console.error('Failed to extend subscription:', error);
    }
  };

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-gray-400 mt-1">
              Gerencie usuários e assinaturas
            </p>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-2 rounded-lg">
            <p className="font-medium">👑 Admin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total de Usuários</h3>
            <p className="text-3xl font-bold text-white">{users.length}</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Em Trial</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {users.filter((u: any) => u.accessStatus.status === 'trial').length}
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Assinantes Ativos</h3>
            <p className="text-3xl font-bold text-green-400">
              {users.filter((u: any) => u.accessStatus.status === 'subscribed').length}
            </p>
          </div>
        </div>

        <UsersTable
          users={users}
          loading={loadingUsers}
          onBlockUser={handleBlockUser}
          onExtendSubscription={handleExtendSubscription}
        />
      </div>
    </DashboardLayout>
  );
}
