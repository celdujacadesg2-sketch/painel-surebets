'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Award } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface Stats {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  winRate: number;
  totalInvested: number;
  totalProfit: number;
  roi: number;
  todayProfit: number;
}

interface DailyStatsProps {
  period?: 'today' | 'week' | 'month' | 'all';
}

export default function DailyStats({ period = 'today' }: DailyStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Auto refresh every minute for today stats
    if (period === 'today') {
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    }
  }, [period]);

  const fetchStats = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get(`/api/saved-bets/stats?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const statsData = response.data.stats;
      // Ensure all numeric values are properly typed
      setStats({
        totalBets: Number(statsData.totalBets) || 0,
        wonBets: Number(statsData.wonBets) || 0,
        lostBets: Number(statsData.lostBets) || 0,
        winRate: Number(statsData.winRate) || 0,
        totalInvested: Number(statsData.totalInvested) || 0,
        totalProfit: Number(statsData.totalProfit) || 0,
        roi: Number(statsData.roi) || 0,
        todayProfit: Number(statsData.todayProfit) || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set default stats on error
      setStats({
        totalBets: 0,
        wonBets: 0,
        lostBets: 0,
        winRate: 0,
        totalInvested: 0,
        totalProfit: 0,
        roi: 0,
        todayProfit: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="h-8 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const periodLabels = {
    today: 'Hoje',
    week: 'Esta Semana',
    month: 'Este Mês',
    all: 'Total'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Today's Profit */}
      <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 backdrop-blur border border-primary-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{periodLabels[period]} - Lucro</p>
            <p className={`text-2xl font-bold mt-1 ${
              (stats.todayProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {(stats.todayProfit || 0) >= 0 ? '+' : ''}R$ {Number(stats.todayProfit || 0).toFixed(2)}
            </p>
          </div>
          {(stats.todayProfit || 0) >= 0 ? (
            <TrendingUp className="text-green-400" size={32} />
          ) : (
            <TrendingDown className="text-red-400" size={32} />
          )}
        </div>
      </div>

      {/* Win Rate */}
      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Taxa de Acerto</p>
            <p className="text-2xl font-bold mt-1 text-blue-400">
              {Number(stats.winRate || 0).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.wonBets || 0}/{stats.totalBets || 0} apostas
            </p>
          </div>
          <Award className="text-blue-400" size={32} />
        </div>
      </div>

      {/* Total Invested */}
      <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur border border-yellow-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total Investido</p>
            <p className="text-2xl font-bold mt-1 text-yellow-400">
              R$ {Number(stats.totalInvested || 0).toFixed(2)}
            </p>
          </div>
          <DollarSign className="text-yellow-400" size={32} />
        </div>
      </div>

      {/* ROI */}
      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">ROI</p>
            <p className={`text-2xl font-bold mt-1 ${
              (stats.roi || 0) >= 0 ? 'text-purple-400' : 'text-red-400'
            }`}>
              {(stats.roi || 0) >= 0 ? '+' : ''}{Number(stats.roi || 0).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Lucro: R$ {Number(stats.totalProfit || 0).toFixed(2)}
            </p>
          </div>
          <TrendingUp className="text-purple-400" size={32} />
        </div>
      </div>
    </div>
  );
}
