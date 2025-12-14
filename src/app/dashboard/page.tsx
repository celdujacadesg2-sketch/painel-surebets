'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/providers/AuthProvider';
import BotaoRenovarWhatsapp from '@/components/BotaoRenovarWhatsapp';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SignalCard from '@/components/dashboard/SignalCard';
import SignalFilters from '@/components/dashboard/SignalFilters';
import AccessDenied from '@/components/dashboard/AccessDenied';
import DailyStats from '@/components/dashboard/DailyStats';
import { useSignals } from '@/hooks/useSignals';

export default function DashboardPage() {
  const { user, accessStatus, loading } = useAuth();
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  // Botão de Assinar/Renovar
  async function handleCheckout() {
    setPayError('');
    setPayLoading(true);
      try {
        const res = await fetch('/api/paymaker/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: user?.name, email: user?.email }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || 'Erro ao criar pagamento');
        const url = data.data?.payload?.payment_url || data.data?.payload?.pix_url || data.data?.payload?.url;
        if (url) {
          window.location.href = url;
        } else {
          setPayError('URL de pagamento não encontrada.');
        }
      } catch (e: any) {
        setPayError(e.message || 'Erro ao criar pagamento');
      } finally {
        setPayLoading(false);
      }
    }
  const router = useRouter();
  const { signals, loading: signalsLoading, refetch } = useSignals();
  const previousSignalsCount = useRef(signals.length);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundType, setSoundType] = useState<'beep' | 'bell' | 'chime'>('beep');
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const [hiddenSignals, setHiddenSignals] = useState<string[]>([]);

  // Load hidden signals from localStorage
  useEffect(() => {
    const hidden = localStorage.getItem('hidden_signals');
    if (hidden) {
      setHiddenSignals(JSON.parse(hidden));
    }
  }, []);

  const hideSignal = (signalId: string) => {
    const newHidden = [...hiddenSignals, signalId];
    setHiddenSignals(newHidden);
    localStorage.setItem('hidden_signals', JSON.stringify(newHidden));
  };

  const [filters, setFilters] = useState({
    sport: '',
    market: '',
    minROI: '',
    maxROI: '',
    search: '',
  });

  // Auto-refresh a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Detectar novos sinais e tocar som
  useEffect(() => {
    if (signals.length > previousSignalsCount.current && previousSignalsCount.current > 0) {
      // Novo sinal chegou!
      
      if (soundEnabled) {
        // Tocar som usando Web Audio API (mais confiável)
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          if (soundType === 'beep') {
            // Som de beep (dois bips curtos)
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            
            // Segundo bip
            setTimeout(() => {
              const oscillator2 = audioContext.createOscillator();
              const gainNode2 = audioContext.createGain();
              
              oscillator2.connect(gainNode2);
              gainNode2.connect(audioContext.destination);
              
              oscillator2.frequency.value = 1000;
              oscillator2.type = 'sine';
              
              gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
              gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
              
              oscillator2.start(audioContext.currentTime);
              oscillator2.stop(audioContext.currentTime + 0.1);
            }, 150);
          } else if (soundType === 'bell') {
            // Som de sino (frequência mais alta e suave)
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 1200;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          } else if (soundType === 'chime') {
            // Som de carrilhão (três notas ascendentes)
            const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
            
            frequencies.forEach((freq, index) => {
              setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
              }, index * 100);
            });
          }
        } catch (e) {
          console.log('Erro ao tocar som:', e);
        }
      }
      
      // Notificação do navegador (opcional)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎯 Novo Sinal de Surebet!', {
          body: `ROI: ${signals[0].roi.toFixed(2)}% - ${signals[0].event}`,
          icon: '/favicon.ico'
        });
      }
    }
    previousSignalsCount.current = signals.length;
  }, [signals, soundEnabled, soundType]);

  // Solicitar permissão para notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fechar menu de som ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSoundMenu) {
        const target = e.target as HTMLElement;
        if (!target.closest('.sound-menu-container')) {
          setShowSoundMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSoundMenu]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  if (!user || !accessStatus) {
    return null;
  }

  if (!accessStatus.hasAccess) {
    return (
      <DashboardLayout>
        <AccessDenied status={accessStatus.status} />
      </DashboardLayout>
    );
  }

  // Apply filters
  const filteredSignals = signals
    .filter(signal => !hiddenSignals.includes(signal.id)) // Filter hidden signals
    .filter(signal => {
    if (filters.sport && signal.sport !== filters.sport) return false;
    if (filters.market && signal.market !== filters.market) return false;
    if (filters.minROI && signal.roi < parseFloat(filters.minROI)) return false;
    if (filters.maxROI && signal.roi > parseFloat(filters.maxROI)) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        signal.event.toLowerCase().includes(searchLower) ||
        signal.sport.toLowerCase().includes(searchLower) ||
        signal.market.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Botões de Assinar/Renovar removidos conforme solicitado */}
        {payError && <div className="text-right text-red-400 text-sm mt-1">{payError}</div>}
        {/* Aviso de Popup - Mais Visível */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-3xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-yellow-300 font-bold text-base mb-1.5">
                ⚡ IMPORTANTE: Permita popups neste site
              </h3>
              <p className="text-yellow-100 text-sm leading-relaxed">
                Para que os links das casas de apostas abram automaticamente, você precisa permitir popups nas configurações do navegador. 
                Clique no ícone 🚫 ou <span className="font-semibold">⚙️</span> ao lado da barra de endereço.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Sinais em Tempo Real</h1>
            <p className="text-gray-400 mt-1">
              🔄 Atualização automática a cada 5s • {filteredSignals.length} disponíveis
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Controle de Som */}
            <div className="relative sound-menu-container">
              <button
                onClick={() => setShowSoundMenu(!showSoundMenu)}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  soundEnabled 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {soundEnabled ? '🔔' : '🔕'}
                <span className="hidden sm:inline">
                  {soundEnabled ? 'Som Ativo' : 'Som Desativado'}
                </span>
              </button>
              
              {showSoundMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-700 bg-gray-900">
                    <h3 className="text-sm font-semibold text-white">Notificações de Sinal</h3>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSoundEnabled(!soundEnabled);
                        if (!soundEnabled) {
                          // Tocar som de teste quando ativar
                          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                          const oscillator = audioContext.createOscillator();
                          const gainNode = audioContext.createGain();
                          oscillator.connect(gainNode);
                          gainNode.connect(audioContext.destination);
                          oscillator.frequency.value = 800;
                          oscillator.type = 'sine';
                          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                          oscillator.start(audioContext.currentTime);
                          oscillator.stop(audioContext.currentTime + 0.1);
                        }
                      }}
                      className={`w-full px-3 py-2 text-left text-sm rounded-lg transition flex items-center justify-between ${
                        soundEnabled ? 'bg-green-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {soundEnabled ? '🔔' : '🔕'}
                        <span>{soundEnabled ? 'Ativar Som' : 'Desativar Som'}</span>
                      </span>
                      {soundEnabled && <span className="text-xs">✓</span>}
                    </button>
                  </div>
                  
                  {soundEnabled && (
                    <>
                      <div className="px-3 py-2 text-xs text-gray-400 bg-gray-900 border-t border-gray-700">
                        Tipo de Som
                      </div>
                      
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            setSoundType('beep');
                            // Tocar preview
                            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const oscillator = audioContext.createOscillator();
                            const gainNode = audioContext.createGain();
                            oscillator.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                            oscillator.frequency.value = 800;
                            oscillator.type = 'sine';
                            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                            oscillator.start(audioContext.currentTime);
                            oscillator.stop(audioContext.currentTime + 0.1);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm rounded-lg transition flex items-center justify-between ${
                            soundType === 'beep' ? 'bg-primary-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          <span>📢 Beep (Dois bips)</span>
                          {soundType === 'beep' && <span className="text-xs">✓</span>}
                        </button>
                        
                        <button
                          onClick={() => {
                            setSoundType('bell');
                            // Tocar preview
                            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const oscillator = audioContext.createOscillator();
                            const gainNode = audioContext.createGain();
                            oscillator.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                            oscillator.frequency.value = 1200;
                            oscillator.type = 'sine';
                            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                            oscillator.start(audioContext.currentTime);
                            oscillator.stop(audioContext.currentTime + 0.5);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm rounded-lg transition flex items-center justify-between ${
                            soundType === 'bell' ? 'bg-primary-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          <span>🔔 Sino (Suave)</span>
                          {soundType === 'bell' && <span className="text-xs">✓</span>}
                        </button>
                        
                        <button
                          onClick={() => {
                            setSoundType('chime');
                            // Tocar preview
                            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const frequencies = [523.25, 659.25, 783.99];
                            frequencies.forEach((freq, index) => {
                              setTimeout(() => {
                                const oscillator = audioContext.createOscillator();
                                const gainNode = audioContext.createGain();
                                oscillator.connect(gainNode);
                                gainNode.connect(audioContext.destination);
                                oscillator.frequency.value = freq;
                                oscillator.type = 'sine';
                                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                                oscillator.start(audioContext.currentTime);
                                oscillator.stop(audioContext.currentTime + 0.3);
                              }, index * 100);
                            });
                          }}
                          className={`w-full px-3 py-2 text-left text-sm rounded-lg transition flex items-center justify-between ${
                            soundType === 'chime' ? 'bg-primary-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          <span>🎵 Carrilhão (Três notas)</span>
                          {soundType === 'chime' && <span className="text-xs">✓</span>}
                        </button>
                      </div>
                    </>
                  )}
                  
                  <div className="px-3 py-2 text-xs text-gray-500 bg-gray-900 border-t border-gray-700">
                    💡 Clique nos sons para ouvir uma prévia
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {accessStatus.status === 'trial' && accessStatus.daysRemaining !== undefined && (
            <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-2 rounded-lg">
              <p className="font-medium">
                ⏰ Faltam {accessStatus.daysRemaining} {accessStatus.daysRemaining === 1 ? 'dia' : 'dias'} de teste
              </p>
            </div>
          )}
        </div>

        {/* Daily Statistics */}
        <DailyStats period="today" />

        <SignalFilters filters={filters} setFilters={setFilters} />

        {signalsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Carregando sinais...</p>
          </div>
        ) : filteredSignals.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-lg">
              {signals.length === 0 
                ? '🔍 Nenhum sinal disponível no momento'
                : '🔍 Nenhum sinal encontrado com os filtros aplicados'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSignals.map(signal => (
              <SignalCard key={signal.id} signal={signal} onHide={() => hideSignal(signal.id)} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
