'use client';

import { useState, useEffect } from 'react';
import { formatROI, formatTimeAgo } from '@/lib/utils';
import { ExternalLink, Clock, TrendingUp, Calculator, Save, RotateCcw, X } from 'lucide-react';

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
  onHide?: (signalId: string) => void;
}

const WINDOW_POSITIONS_KEY = 'bookmaker_window_positions';

export default function SignalCard({ signal, onHide }: SignalCardProps) {
  const [timeAgo, setTimeAgo] = useState('');
  const [showPositionMenu, setShowPositionMenu] = useState(false);
  const [hasSavedPositions, setHasSavedPositions] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setTimeAgo(formatTimeAgo(new Date(signal.createdAt)));
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // Update every 10 seconds

    // Check if has saved positions
    const saved = localStorage.getItem(WINDOW_POSITIONS_KEY);
    setHasSavedPositions(!!saved);

    return () => clearInterval(interval);
  }, [signal.createdAt]);

  const openBookmakers = () => {
    try {
      const screenWidth = window.screen.availWidth;
      const screenHeight = window.screen.availHeight;
      
      // Parse bookmakers if it's a string
      const bookmakers = typeof signal.bookmakers === 'string' 
        ? JSON.parse(signal.bookmakers) 
        : signal.bookmakers;

      // Check for saved positions
      const savedPositions = localStorage.getItem(WINDOW_POSITIONS_KEY);
      let positions = null;
      
      if (savedPositions) {
        try {
          positions = JSON.parse(savedPositions);
        } catch (e) {
          console.error('Erro ao carregar posições salvas:', e);
        }
      }
      
      // Open all bookmakers at once
      bookmakers.forEach((bookmaker: any, index: number) => {
        if (bookmaker.url || bookmaker.link) {
          let features;
          
          if (positions && positions[index]) {
            // Use saved position
            const pos = positions[index];
            features = `width=${pos.width},height=${pos.height},left=${pos.left},top=${pos.top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;
          } else {
            // Default behavior - split screen
            const windowWidth = Math.floor(screenWidth / 2);
            const left = index * windowWidth;
            features = `width=${windowWidth},height=${screenHeight},left=${left},top=0,toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;
          }
          
          // Use fixed window names so they reuse the same windows
          const windowName = `bookmaker_window_${index}`;
          
          setTimeout(() => {
            window.open(bookmaker.url || bookmaker.link, windowName, features);
          }, index * 100); // Small delay between windows to prevent blocking
        }
      });
    } catch (error) {
      console.error('Erro ao abrir casas:', error);
      alert('Erro ao abrir casas. Verifique se o bloqueador de pop-ups está desativado.');
    }
  };

  const saveWindowPositions = () => {
    const userConfirm = window.confirm(
      '📍 Vou abrir as janelas das casas.\n\n' +
      '1️⃣ Posicione e redimensione as janelas como preferir\n' +
      '2️⃣ Depois volte aqui e clique em "Confirmar Posições"\n\n' +
      'Clique OK para continuar'
    );
    
    if (!userConfirm) return;
    
    setTimeout(() => {
      try {
        const bookmakers = typeof signal.bookmakers === 'string' 
          ? JSON.parse(signal.bookmakers) 
          : signal.bookmakers;

        // Open windows to let user position them
        const openedWindows: (Window | null)[] = [];
        const screenWidth = window.screen.availWidth;
        const screenHeight = window.screen.availHeight;
        const windowWidth = Math.floor(screenWidth / 2);
        
        bookmakers.forEach((bookmaker: any, index: number) => {
          if (bookmaker.url || bookmaker.link) {
            const left = index * windowWidth;
            const features = `width=${windowWidth},height=${screenHeight},left=${left},top=0,toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;
            const win = window.open(bookmaker.url || bookmaker.link, `bookmaker_position_${Date.now()}_${index}`, features);
            openedWindows.push(win);
          }
        });

        // Show confirmation button after windows open
        setTimeout(() => {
          const saveConfirm = window.confirm(
            '✅ Posicionou as janelas?\n\n' +
            'Clique OK para SALVAR as posições atuais.\n' +
            'As janelas continuarão abertas.'
          );
          
          if (saveConfirm) {
            const positions = openedWindows.map((win) => {
              if (win && !win.closed) {
                return {
                  width: win.outerWidth,
                  height: win.outerHeight,
                  left: win.screenX,
                  top: win.screenY
                };
              }
              return null;
            }).filter(Boolean);

            if (positions.length > 0) {
              localStorage.setItem(WINDOW_POSITIONS_KEY, JSON.stringify(positions));
              setHasSavedPositions(true);
              alert('✅ Posições salvas! As janelas continuam abertas e nas próximas vezes abrirão assim.');
            } else {
              alert('⚠️ Não foi possível capturar as posições. Tente novamente.');
            }
          }
          // NÃO fecha as janelas - deixa abertas para o usuário usar
        }, 2000);
        
      } catch (error) {
        console.error('Erro ao salvar posições:', error);
        alert('Erro ao salvar posições. Verifique se o bloqueador de pop-ups está desativado.');
      }
    }, 100);
  };

  const resetWindowPositions = () => {
    if (confirm('Deseja resetar as posições salvas? As janelas voltarão ao padrão (lado a lado).')) {
      localStorage.removeItem(WINDOW_POSITIONS_KEY);
      setHasSavedPositions(false);
      alert('✅ Posições resetadas! As janelas abrirão no padrão.');
    }
  };

  const openCalculator = () => {
    try {
      const odds = typeof signal.odds === 'string' ? JSON.parse(signal.odds) : signal.odds;
      const bookmakers = typeof signal.bookmakers === 'string' ? JSON.parse(signal.bookmakers) : signal.bookmakers;
      
      const oddsParam = encodeURIComponent(JSON.stringify(odds));
      const bookmakersParam = encodeURIComponent(JSON.stringify(bookmakers));
      const eventParam = encodeURIComponent(signal.event);
      const sportParam = encodeURIComponent(signal.sport);
      const marketParam = encodeURIComponent(signal.market);
      
      const url = `/calculator?odds=${oddsParam}&bookmakers=${bookmakersParam}&event=${eventParam}&sport=${sportParam}&market=${marketParam}`;
      const features = 'width=450,height=750,left=20,top=100,toolbar=no,menubar=no,scrollbars=yes,resizable=yes';
      window.open(url, `calculator_${signal.id}`, features);
    } catch (error) {
      console.error('Erro ao abrir calculadora:', error);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur border border-gray-700/50 rounded-xl p-3 hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300">
      {/* Botão X para esconder */}
      {onHide && (
        <button
          onClick={() => onHide(signal.id)}
          className="absolute -top-2 -right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-lg z-10"
          title="Esconder este sinal"
        >
          <X size={14} />
        </button>
      )}
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left Section - Main Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                  {signal.sport}
                </span>
                {signal.eventDate && (() => {
                  const eventDate = new Date(signal.eventDate);
                  const day = eventDate.getDate().toString().padStart(2, '0');
                  const month = (eventDate.getMonth() + 1).toString().padStart(2, '0');
                  const hour = eventDate.getHours().toString().padStart(2, '0');
                  const minute = eventDate.getMinutes().toString().padStart(2, '0');
                  return (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 text-xs font-semibold rounded-full border border-orange-500/30">
                      📅 {day}/{month} {hour}:{minute}
                    </span>
                  );
                })()}
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <Clock size={12} />
                  {timeAgo}
                </span>
              </div>
              
              <h3 className="text-sm font-bold text-white mb-1.5 leading-tight">
                {signal.event}
              </h3>
              
              {/* Aviso de horários diferentes */}
              {(() => {
                const odds = typeof signal.odds === 'string' ? JSON.parse(signal.odds) : signal.odds;
                const times = odds.filter((o: any) => o.eventTime).map((o: any) => o.eventTime);
                const hasDifferentTimes = times.length === 2 && times[0] !== times[1];
                
                if (hasDifferentTimes) {
                  return (
                    <div className="mb-1.5 px-2 py-1.5 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">⚠️</span>
                        <div className="flex-1 text-yellow-300 text-xs font-semibold">
                          Horários diferentes: {times[0]} | {times[1]}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              <div className="px-2 py-0.5 bg-purple-500/10 text-pink-300 text-xs font-semibold rounded border border-pink-500/20 inline-block">
                🏆 {signal.market}
              </div>
            </div>
          </div>

          {/* Odds Display - Mostrar todas as apostas com seus mercados */}
          <div className="space-y-1">
            {(() => {
              const odds = typeof signal.odds === 'string' ? JSON.parse(signal.odds) : signal.odds;
              const bookmakers = typeof signal.bookmakers === 'string' ? JSON.parse(signal.bookmakers) : signal.bookmakers;
              
              return odds && Array.isArray(odds) && odds.map((odd: any, index: number) => {
                const bookmaker = bookmakers[index] || { name: `Casa ${index + 1}` };
                
                return (
                  <div key={index} className="flex items-center justify-between gap-2 px-2 py-1.5 bg-gray-700/30 rounded-lg border border-gray-600/40 hover:border-primary-500/40 transition-all">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="text-xs font-bold text-white">
                          {bookmaker.name || bookmaker}
                        </div>
                        {odd.eventTime && (
                          <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded">
                            {odd.eventTime}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-300">
                        {odd.selection || odd.name || signal.market}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-primary-400">
                      @{odd.value || odd.odd || odd}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Right Section - ROI & Actions */}
        <div className="flex flex-row lg:flex-col items-center gap-2">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-400/40 rounded-xl px-3 py-2 text-center">
            <div className="flex items-center justify-center gap-1 text-green-400 mb-0.5">
              <TrendingUp size={12} />
              <span className="text-xs font-semibold">ROI</span>
            </div>
            <div className="text-xl font-bold text-green-400">
              {formatROI(signal.roi)}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={openCalculator}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Calculator size={14} />
              Calculadora
            </button>

            <div className="relative">
              <button
                onClick={openBookmakers}
                className="w-full px-3 py-1.5 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <ExternalLink size={14} />
                Abrir ({(() => {
                  const bookmakers = typeof signal.bookmakers === 'string' 
                    ? JSON.parse(signal.bookmakers) 
                    : signal.bookmakers;
                  return bookmakers.length;
                })()})
              </button>
              
              {/* Botão de menu de posições */}
              <button
                onClick={() => setShowPositionMenu(!showPositionMenu)}
                className="absolute -right-1 -top-1 p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-all border border-gray-600"
                title="Configurar posições das janelas"
              >
                <Save size={12} />
              </button>

              {/* Menu dropdown */}
              {showPositionMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      saveWindowPositions();
                      setShowPositionMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-gray-700 transition flex items-center gap-2"
                  >
                    <Save size={16} className="text-green-400" />
                    <span>Salvar Posições</span>
                  </button>
                  
                  {hasSavedPositions && (
                    <button
                      onClick={() => {
                        resetWindowPositions();
                        setShowPositionMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-gray-700 transition flex items-center gap-2 border-t border-gray-700"
                    >
                      <RotateCcw size={16} className="text-red-400" />
                      <span>Resetar Posições</span>
                    </button>
                  )}
                  
                  <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-700 bg-gray-900">
                    {hasSavedPositions ? '✅ Posições salvas' : '📍 Use posições padrão'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
