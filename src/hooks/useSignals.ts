'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import Cookies from 'js-cookie';

interface Signal {
  id: string;
  sport: string;
  event: string;
  market: string;
  roi: number;
  odds: any;
  bookmakers: any;
  createdAt: string;
  expiresAt: string;
}

export function useSignals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchSignals = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('/api/signals', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSignals(response.data.signals);
    } catch (error) {
      console.error('Failed to fetch signals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial signals
    fetchSignals();

    // Setup WebSocket connection
    const socketInstance = io({
      path: '/api/socket',
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to WebSocket');
    });

    socketInstance.on('new-signal', (signal: Signal) => {
      console.log('📡 New signal received:', signal);
      setSignals(prev => [signal, ...prev]);
    });

    socketInstance.on('signal-removed', ({ signalId }: { signalId: string }) => {
      console.log('🗑️ Signal removed:', signalId);
      setSignals(prev => prev.filter(s => s.id !== signalId));
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { signals, loading, socket, refetch: fetchSignals };
}
