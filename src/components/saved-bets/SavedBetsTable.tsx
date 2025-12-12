'use client';

import { useState } from 'react';
import { Trash2, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SavedBet {
  id: string;
  sport: string;
  event: string;
  market: string;
  odds: string; // JSON string with array of bets per bookmaker
  stake: number;
  bookmaker: string;
  notes?: string;
  createdAt: string;
  status?: string;
  result?: string; // JSON string with results per bookmaker
  actualProfit?: number;
  settledAt?: string;
}

interface SavedBetsTableProps {
  bets: SavedBet[];
  loading: boolean;
  onDelete: (betId: string) => void;
  onUpdateResult?: (betId: string, results: Record<string, 'won' | 'lost' | 'void'>) => void;
}

export default function SavedBetsTable({ bets, loading, onDelete, onUpdateResult }: SavedBetsTableProps) {
  const [expandedBet, setExpandedBet] = useState<string | null>(null);
  const [betResults, setBetResults] = useState<Record<string, Record<string, 'won' | 'lost' | 'void'>>>({});
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<SavedBet | null>(null);
  const [modalResults, setModalResults] = useState<Record<string, 'won' | 'lost' | 'void'>>({});

  const parseOdds = (oddsString: string) => {
    try {
      return JSON.parse(oddsString);
    } catch {
      return [];
    }
  };

  const parseResults = (resultsString?: string) => {
    if (!resultsString) return {};
    try {
      return JSON.parse(resultsString);
    } catch {
      return {};
    }
  };

  const toggleResultPanel = (betId: string, bookmaker: string) => {
    const key = `${betId}-${bookmaker}`;
    setExpandedBet(expandedBet === key ? null : key);
  };

  const handleBookmakerResult = (betId: string, bookmaker: string, status: 'won' | 'lost' | 'void') => {
    console.log('Setting result:', { betId, bookmaker, status });
    setBetResults(prev => {
      const newResults = {
        ...prev,
        [betId]: {
          ...(prev[betId] || {}),
          [bookmaker]: status
        }
      };
      console.log('New state:', newResults);
      return newResults;
    });
    setExpandedBet(null); // Close panel after selection
  };

  const handleConfirmResults = async (betId: string) => {
    if (!onUpdateResult) return;
    
    const results = betResults[betId];
    if (!results) return;

    await onUpdateResult(betId, results);
    setBetResults(prev => {
      const newResults = { ...prev };
      delete newResults[betId];
      return newResults;
    });
  };

  const calculateProfit = (bet: SavedBet, results: Record<string, 'won' | 'lost' | 'void'>) => {
    const oddsData = parseOdds(bet.odds);
    let totalProfit = 0;

    oddsData.forEach((odd: any) => {
      const result = results[odd.bookmaker];
      if (result === 'won') {
        totalProfit += (odd.stake * odd.value) - odd.stake;
      } else if (result === 'lost') {
        totalProfit -= odd.stake;
      }
      // void = 0 (stake returned)
    });

    return totalProfit;
  };

  const openResultModal = (bet: SavedBet) => {
    setSelectedBet(bet);
    setModalResults({});
    setResultModalOpen(true);
  };

  const closeResultModal = () => {
    setResultModalOpen(false);
    setSelectedBet(null);
    setModalResults({});
  };

  const handleModalResultChange = (bookmaker: string, result: 'won' | 'lost' | 'void') => {
    setModalResults(prev => ({
      ...prev,
      [bookmaker]: prev[bookmaker] === result ? undefined : result
    } as Record<string, 'won' | 'lost' | 'void'>));
  };

  const calculateModalProfit = () => {
    if (!selectedBet) return 0;
    const oddsData = parseOdds(selectedBet.odds);
    let totalProfit = 0;

    oddsData.forEach((odd: any) => {
      const result = modalResults[odd.bookmaker];
      if (result === 'won') {
        totalProfit += (odd.stake * odd.value) - odd.stake;
      } else if (result === 'lost') {
        totalProfit -= odd.stake;
      }
    });

    return totalProfit;
  };

  const confirmModalResult = async () => {
    if (!selectedBet || !onUpdateResult) return;
    
    const oddsData = parseOdds(selectedBet.odds);
    const allSelected = oddsData.every((odd: any) => modalResults[odd.bookmaker]);
    
    if (!allSelected) {
      alert('Selecione o resultado de todas as casas antes de confirmar.');
      return;
    }

    await onUpdateResult(selectedBet.id, modalResults);
    closeResultModal();
  };

  if (loading) {
    return (
      <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Carregando apostas...</p>
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
        <p className="text-gray-400 text-lg">📋 Nenhuma aposta salva ainda</p>
        <p className="text-gray-500 text-sm mt-2">Comece salvando suas apostas usando o formulário acima</p>
      </div>
    );
  }

  return (
    <>
      {/* Modal de Resultado */}
      {resultModalOpen && selectedBet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Definir Resultado</h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {parseOdds(selectedBet.odds).map((odd: any, index: number) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm font-medium text-gray-300">{odd.bookmaker}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleModalResultChange(odd.bookmaker, 'won')}
                      className={`py-3 rounded-lg font-medium text-sm transition-all ${
                        modalResults[odd.bookmaker] === 'won'
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                      }`}
                    >
                      GREEN
                    </button>
                    <button
                      onClick={() => handleModalResultChange(odd.bookmaker, 'lost')}
                      className={`py-3 rounded-lg font-medium text-sm transition-all ${
                        modalResults[odd.bookmaker] === 'lost'
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      RED
                    </button>
                    <button
                      onClick={() => handleModalResultChange(odd.bookmaker, 'void')}
                      className={`py-3 rounded-lg font-medium text-sm transition-all ${
                        modalResults[odd.bookmaker] === 'void'
                          ? 'bg-gray-500 text-white shadow-lg shadow-gray-500/50'
                          : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
                      }`}
                    >
                      VOID
                    </button>
                  </div>
                </div>
              ))}

              {/* Lucro Real */}
              {Object.keys(modalResults).length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">Lucro Real</p>
                    <p className={`text-3xl font-bold ${
                      calculateModalProfit() >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {calculateModalProfit() >= 0 ? '+' : ''}R$ {calculateModalProfit().toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700 flex gap-3">
              <button
                onClick={closeResultModal}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModalResult}
                className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition font-medium"
              >
                Confirmar Resultado
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
      {bets.map((bet) => {
        const oddsData = parseOdds(bet.odds);
        const savedResults = parseResults(bet.result);
        const currentResults = betResults[bet.id] || {};
        const isExpanded = expandedBet === bet.id;
        const isPending = bet.status === 'pending';
        const allResultsSelected = oddsData.length > 0 && 
          oddsData.every((odd: any) => currentResults[odd.bookmaker]);
        const estimatedProfit = allResultsSelected ? calculateProfit(bet, currentResults) : null;

        return (
          <div key={bet.id} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Status Badge */}
                    {bet.status === 'won' && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle size={12} /> Ganhou
                      </span>
                    )}
                    {bet.status === 'lost' && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                        <XCircle size={12} /> Perdeu
                      </span>
                    )}
                    {bet.status === 'void' && (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full flex items-center gap-1">
                        <MinusCircle size={12} /> Anulada
                      </span>
                    )}
                    {bet.status === 'pending' && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        ⏳ Pendente
                      </span>
                    )}
                    
                    <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                      {bet.sport}
                    </span>
                  </div>

                  <h3 className="text-white font-semibold text-lg">{bet.event}</h3>
                  <p className="text-gray-400 text-sm mt-1">{bet.market}</p>
                  
                  {bet.notes && (
                    <p className="text-gray-500 text-xs mt-2">{bet.notes}</p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-gray-400">
                      💰 Total: <span className="text-white font-semibold">R$ {bet.stake.toFixed(2)}</span>
                    </span>
                    <span className="text-gray-400">
                      📅 {formatDate(new Date(bet.createdAt))}
                    </span>
                  </div>

                  {/* Bookmakers List */}
                  <div className="mt-3 space-y-2">
                    {oddsData.map((odd: any, index: number) => {
                      const bookmaker = odd.bookmaker;
                      const savedResult = savedResults[bookmaker];
                      const currentResult = currentResults[bookmaker];
                      const displayResult = savedResult || currentResult;
                      const panelKey = `${bet.id}-${bookmaker}`;
                      const isPanelOpen = expandedBet === panelKey;
                      
                      console.log('Rendering bookmaker:', {
                        betId: bet.id,
                        bookmaker,
                        savedResult,
                        currentResult,
                        displayResult,
                        panelKey,
                        isPanelOpen
                      });
                      
                      return (
                        <div key={`${bet.id}-${bookmaker}-${index}`} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">{bookmaker}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                <span>Stake: R$ {Number(odd.stake).toFixed(2)}</span>
                                <span>Odd: {odd.value}</span>
                              </div>
                            </div>

                            {isPending && !savedResult && !displayResult && (
                              <button
                                onClick={() => {
                                  console.log('Opening panel for:', bookmaker);
                                  toggleResultPanel(bet.id, bookmaker);
                                }}
                                className="px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-lg transition text-sm font-medium"
                              >
                                Resultado
                              </button>
                            )}

                            {displayResult && (
                              <div>
                                {displayResult === 'won' && (
                                  <span className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs rounded-lg flex items-center gap-1 font-medium">
                                    <CheckCircle size={14} /> GREEN (Win)
                                  </span>
                                )}
                                {displayResult === 'lost' && (
                                  <span className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-1 font-medium">
                                    <XCircle size={14} /> RED (Loss)
                                  </span>
                                )}
                                {displayResult === 'void' && (
                                  <span className="px-3 py-1.5 bg-gray-500/20 text-gray-400 text-xs rounded-lg flex items-center gap-1 font-medium">
                                    <MinusCircle size={14} /> VOID (Refund)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Result Selection Panel */}
                          {isPending && !savedResult && isPanelOpen && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  onClick={() => handleBookmakerResult(bet.id, bookmaker, 'won')}
                                  className="p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg transition flex items-center justify-center gap-2 font-medium"
                                >
                                  <CheckCircle size={18} />
                                  <span>GREEN (Win)</span>
                                </button>
                                <button
                                  onClick={() => handleBookmakerResult(bet.id, bookmaker, 'lost')}
                                  className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition flex items-center justify-center gap-2 font-medium"
                                >
                                  <XCircle size={18} />
                                  <span>RED (Loss)</span>
                                </button>
                                <button
                                  onClick={() => handleBookmakerResult(bet.id, bookmaker, 'void')}
                                  className="p-3 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30 text-gray-400 rounded-lg transition flex items-center justify-center gap-2 font-medium"
                                >
                                  <MinusCircle size={18} />
                                  <span>VOID (Refund)</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {bet.actualProfit !== null && bet.actualProfit !== undefined && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Lucro Real</p>
                      <p className={`text-xl font-bold ${bet.actualProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {bet.actualProfit >= 0 ? '+' : ''}R$ {bet.actualProfit.toFixed(2)}
                      </p>
                    </div>
                  )}
                  
                  {isPending && allResultsSelected && estimatedProfit !== null && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Lucro Estimado</p>
                      <p className={`text-lg font-bold ${estimatedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {estimatedProfit >= 0 ? '+' : ''}R$ {estimatedProfit.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {isPending && onUpdateResult && (
                    <button
                      onClick={() => openResultModal(bet)}
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition font-medium text-sm"
                    >
                      Resultado
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('Deseja realmente excluir esta aposta?')) {
                        onDelete(bet.id);
                      }
                    }}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                    title="Deletar aposta"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Confirm Button */}
              {isPending && allResultsSelected && onUpdateResult && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleConfirmResults(bet.id)}
                    className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition"
                  >
                    Confirmar Todos os Resultados
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </>
  );
}
