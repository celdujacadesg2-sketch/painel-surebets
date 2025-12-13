'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/providers/AuthProvider';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SavedBetForm from '@/components/saved-bets/SavedBetForm';
import SavedBetsTable from '@/components/saved-bets/SavedBetsTable';
import DailyStats from '@/components/dashboard/DailyStats';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function SavedBetsPage() {
  const { user, accessStatus, loading } = useAuth();
  const router = useRouter();
  const [savedBets, setSavedBets] = useState([]);
  const [loadingBets, setLoadingBets] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && accessStatus?.hasAccess) {
      fetchSavedBets();
    }
  }, [user, accessStatus]);

  const fetchSavedBets = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('/api/saved-bets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSavedBets(response.data.savedBets);
    } catch (error) {
      console.error('Failed to fetch saved bets:', error);
    } finally {
      setLoadingBets(false);
    }
  };

  const handleSaveBet = async (betData: any) => {
    try {
      const token = Cookies.get('token');
      await axios.post('/api/saved-bets', betData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSavedBets();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao salvar aposta');
    }
  };

  const handleDeleteBet = async (betId: string) => {
    try {
      const token = Cookies.get('token');
      await axios.delete(`/api/saved-bets/${betId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSavedBets(savedBets.filter((bet: any) => bet.id !== betId));
    } catch (error) {
      console.error('Failed to delete bet:', error);
    }
  };

  const handleUpdateResult = async (betId: string, results: Record<string, 'won' | 'lost' | 'void'>) => {
    try {
      const token = Cookies.get('token');
      
      // Find the bet to calculate profit
      const bet: any = savedBets.find((b: any) => b.id === betId);
      if (!bet) return;

      const oddsData = JSON.parse(bet.odds);
      let actualProfit = 0;

      oddsData.forEach((odd: any) => {
        const result = results[odd.bookmaker];
        if (result === 'won') {
          actualProfit += (odd.stake * odd.value) - odd.stake;
        } else if (result === 'lost') {
          actualProfit -= odd.stake;
        }
        // void = 0 (stake returned)
      });

      // Determine overall status
      const allWon = oddsData.every((odd: any) => results[odd.bookmaker] === 'won');
      const anyLost = oddsData.some((odd: any) => results[odd.bookmaker] === 'lost');
      const status = allWon ? 'won' : anyLost ? 'lost' : 'void';

      await axios.patch(`/api/saved-bets/${betId}/result`, 
        { 
          status, 
          actualProfit,
          result: JSON.stringify(results)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchSavedBets();
    } catch (error) {
      console.error('Failed to update bet result:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !accessStatus?.hasAccess) {
    router.push('/dashboard');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Apostas Salvas</h1>
          <p className="text-gray-400 mt-1">
            Gerencie suas apostas e acompanhe seus registros
          </p>
        </div>

        {/* Statistics Cards */}
        <DailyStats period="today" />

        <SavedBetForm onSave={handleSaveBet} />

        <SavedBetsTable
          bets={savedBets}
          loading={loadingBets}
          onDelete={handleDeleteBet}
          onUpdateResult={handleUpdateResult}
        />
      </div>
    </DashboardLayout>
  );
}
