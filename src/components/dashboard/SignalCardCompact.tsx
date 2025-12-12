'use client';

import { useState, useEffect } from 'react';
import { formatROI, formatTimeAgo } from '@/lib/utils';
import { ExternalLink, Clock, TrendingUp, Calculator, X } from 'lucide-react';

interface Signal {
  id: string;
  sport: string;
  event: string;
  eventDate?: string | null;
  market: string;
  roi: number;
  odds: any[];
  bookmakers: any[];
  createdAt: string;
  expiresAt: string;
}

interface SignalCardProps {
  signal: Signal;
  onHide: () => void;
}

export default function SignalCardCompact({ signal, onHide }: SignalCardProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTimeAgo(formatTimeAgo(new Date(signal.createdAt)));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [signal.createdAt]);

  const openBookmakers = () => {
    try {
      const bookmakers = typeof signal.bookmakers === 'string' 
        ? JSON.parse(signal.bookmakers) 
        : signal.bookmakers;

      bookmakers.forEach((bookmaker: any, index: number) => {
        if (bookmaker.url || bookmaker.link) {
          const windowName = `bookmaker_${index}`;
          setTimeout(() => {
            window.open(bookmaker.url || bookmaker.link, windowName, 'width=600,height=800');
          }, index * 100);
        }
      });
    } catch (error) {
      console.error('Erro ao abrir casas:', error);
    }
  };

  const openCalculator = () => {
    try {
      const odds = typeof signal.odds === 'string' ? JSON.parse(signal.odds) : signal.odds;
      const bookmakers = typeof signal.bookmakers === 'string' ? JSON.parse(signal.bookmakers) : signal.bookmakers;
      
      const url = `/calculator?odds=${encodeURIComponent(JSON.stringify(odds))}&bookmakers=${encodeURIComponent(JSON.stringify(bookmakers))}&event=${encodeURIComponent(signal.event)}&sport=${encodeURIComponent(signal.sport)}&market=${encodeURIComponent(signal.market)}`;
      window.open(url, `calc_${signal.id}`, 'width=450,height=750');
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const odds = typeof signal.odds === 'string' ? JSON.parse(signal.odds) : signal.odds;
  const bookmakers = typeof signal.bookmakers === 'string' ? JSON.parse(signal.bookmakers) : signal.bookmakers;

  return (
    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 hover:border-primary-500/50 transition-all relative">
      {/* Botão de Ocultar */}
      <button
        onClick={() => {
          if (confirm('Ocultar este sinal? Ele não aparecerá mais na lista.')) {
            onHide();
          }
        }}
        className="absolute top-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded transition z-10"
        title="Ocultar sinal"
      >
        <X size={14} />
      </button>

      <div className="flex gap-3">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-blue-500/20 text-cyan-400 text-xs font-semibold rounded border border-cyan-500/30">
              {signal.sport}
            </span>
            {signal.eventDate && (() => {
              const d = new Date(signal.eventDate);
              return (
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded border border-orange-500/30">
                  📅 {d.getDate().toString().padStart(2,'0')}/{(d.getMonth()+1).toString().padStart(2,'0')} {d.getHours().toString().padStart(2,'0')}:{d.getMinutes().toString().padStart(2,'0')}
                </span>
              );
            })()}
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <Clock size={10} />
              {timeAgo}
            </span>
          </div>

          {/* Event Title */}
          <h3 className="text-sm font-bold text-white mb-2 truncate">{signal.event}</h3>

          {/* Market */}
          <div className="text-xs text-pink-300 mb-2">🏆 {signal.market}</div>

          {/* Odds */}
          <div className="space-y-1">
            {odds.map((odd: any, i: number) => {
              const bk = bookmakers[i] || {};
              return (
                <div key={i} className="flex items-center justify-between gap-2 px-2 py-1.5 bg-gray-700/30 rounded border border-gray-600/30">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{bk.name || `Casa ${i+1}`}</div>
                    <div className="text-xs text-gray-400 truncate">{odd.selection || odd.name || signal.market}</div>
                  </div>
                  <div className="text-base font-bold text-primary-400 whitespace-nowrap">@{odd.value || odd.odd || odd}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-col items-end gap-2">
          {/* ROI */}
          <div className="bg-green-500/20 border border-green-400/40 rounded-lg px-3 py-2 text-center">
            <div className="flex items-center gap-1 text-green-400 mb-0.5">
              <TrendingUp size={12} />
              <span className="text-xs font-semibold">ROI</span>
            </div>
            <div className="text-xl font-bold text-green-400">{formatROI(signal.roi)}</div>
          </div>

          {/* Buttons */}
          <button
            onClick={openCalculator}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded transition flex items-center gap-1"
            title="Calculadora"
          >
            <Calculator size={14} />
          </button>

          <button
            onClick={openBookmakers}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded transition flex items-center gap-1"
            title="Abrir Casas"
          >
            <ExternalLink size={14} />
            {bookmakers.length}
          </button>
        </div>
      </div>
    </div>
  );
}
