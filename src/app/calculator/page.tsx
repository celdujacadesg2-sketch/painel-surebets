'use client';

import { useState, useEffect } from 'react';
import { Calculator as CalcIcon, AlertTriangle, CheckCircle, Save, BookmarkPlus } from 'lucide-react';

interface Odd {
  selection: string;
  value: string;
}

const STORAGE_KEY = 'calculator_preferences';

export default function CalculatorPage() {
  const [event, setEvent] = useState<string>('');
  const [sport, setSport] = useState<string>('');
  const [market, setMarket] = useState<string>('');
  const [odds, setOdds] = useState<Odd[]>([]);
  const [mode, setMode] = useState<'total' | 'individual'>('total'); // total ou individual
  const [totalStake, setTotalStake] = useState<string>('');
  const [individualStakes, setIndividualStakes] = useState<string[]>([]);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveBetConfirm, setShowSaveBetConfirm] = useState(false);
  const [isSavingBet, setIsSavingBet] = useState(false);

  useEffect(() => {
    // Carrega preferências salvas
    const savedPrefs = localStorage.getItem(STORAGE_KEY);
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.mode) setMode(prefs.mode);
        if (prefs.totalStake) setTotalStake(prefs.totalStake);
      } catch (e) {
        console.error('Error loading preferences:', e);
      }
    }

    // Get data from URL params
    const params = new URLSearchParams(window.location.search);
    const oddsParam = params.get('odds');
    const eventParam = params.get('event');
    const sportParam = params.get('sport');
    const marketParam = params.get('market');
    
    if (oddsParam) {
      try {
        const parsedOdds = JSON.parse(decodeURIComponent(oddsParam));
        setOdds(parsedOdds);
        setIndividualStakes(new Array(parsedOdds.length).fill(''));
      } catch (e) {
        console.error('Error parsing odds:', e);
      }
    }

    if (eventParam) setEvent(decodeURIComponent(eventParam));
    if (sportParam) setSport(decodeURIComponent(sportParam));
    if (marketParam) setMarket(decodeURIComponent(marketParam));

    // Set title
    if (eventParam) {
      document.title = `Calculadora - ${decodeURIComponent(eventParam)}`;
    }
  }, []);

  const updateOdd = (index: number, value: string) => {
    const newOdds = [...odds];
    newOdds[index] = { ...newOdds[index], value };
    setOdds(newOdds);
  };

  // Salva as preferências
  const savePreferences = () => {
    const preferences = {
      mode,
      totalStake,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  // Salva a aposta nas apostas salvas
  const saveBet = async () => {
    if (!isSurebet || totalInvested === 0) {
      alert('⚠️ Complete os dados da aposta antes de salvar');
      return;
    }

    setIsSavingBet(true);

    try {
      // Pega o token do localStorage (ou cookies)
      let token = '';
      
      // Tenta pegar do localStorage
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || '';
        
        // Se não tiver no localStorage, tenta do cookie
        if (!token) {
          const cookies = document.cookie.split(';');
          const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
          if (tokenCookie) {
            token = tokenCookie.split('=')[1];
          }
        }
      }

      if (!token) {
        alert('⚠️ Você precisa estar logado para salvar apostas. Faça login no painel principal.');
        return;
      }

      // Pega os bookmakers da URL (se disponível)
      const params = new URLSearchParams(window.location.search);
      const bookmakersParam = params.get('bookmakers');
      let bookmakerNames: string[] = [];
      
      if (bookmakersParam) {
        try {
          const bookmakers = JSON.parse(decodeURIComponent(bookmakersParam));
          bookmakerNames = bookmakers.map((b: any) => b.name || 'Casa desconhecida');
        } catch (e) {
          console.error('Error parsing bookmakers:', e);
        }
      }

      // Se não tiver bookmakers na URL, gera nomes genéricos
      if (bookmakerNames.length === 0) {
        bookmakerNames = odds.map((_, i) => `Casa ${i + 1}`);
      }

      // Prepara os dados das odds com o nome da casa
      const oddsData = odds.map((odd, index) => ({
        bookmaker: bookmakerNames[index] || `Casa ${index + 1}`,
        selection: odd.selection,
        value: parseFloat(odd.value),
        stake: finalStakes[index],
        return: results[index].return,
        profit: results[index].profit,
        percentage: results[index].percentage
      }));

      const betData = {
        sport: sport || 'Futebol',
        event: event || 'Evento não informado',
        market: market || 'Mercado',
        odds: JSON.stringify(oddsData),
        stake: totalInvested.toString(),
        bookmaker: `Surebet - ROI: ${profitPercentage.toFixed(2)}%`,
        notes: `Modo: ${mode === 'total' ? 'Valor Total' : 'Stake Individual'}\nLucro Esperado: R$ ${guaranteedProfit.toFixed(2)}\nSurebet Value: ${surebetValue.toFixed(5)}`
      };

      const response = await fetch('/api/saved-bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(betData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar aposta');
      }

      setShowSaveBetConfirm(true);
      setTimeout(() => setShowSaveBetConfirm(false), 3000);
      
    } catch (error) {
      console.error('Erro ao salvar aposta:', error);
      alert(`❌ ${error instanceof Error ? error.message : 'Erro ao salvar aposta'}`);
    } finally {
      setIsSavingBet(false);
    }
  };

  // 🔢 1. Cálculo do surebet_value = (1/odd1) + (1/odd2) + ...
  const surebetValue = odds.reduce((sum, odd) => {
    const oddValue = parseFloat(odd.value);
    return oddValue > 0 ? sum + (1 / oddValue) : sum;
  }, 0);

  // 💰 2. Cálculo da porcentagem da surebet
  // profit_percentage = (1 - surebet_value) * 100
  const profitPercentage = surebetValue > 0 && surebetValue < 1 
    ? (1 - surebetValue) * 100 
    : 0;

  // Validação se é surebet (surebet_value < 1)
  const isSurebet = surebetValue > 0 && surebetValue < 1;
  const hasValidOdds = odds.every(o => parseFloat(o.value) > 1.01);

  // 🧮 3. Distribuição das stakes
  const totalStakeValue = parseFloat(totalStake) || 0;
  
  // Modo Total: divide o valor total entre as casas
  const calculatedStakesFromTotal = odds.map(odd => {
    const oddValue = parseFloat(odd.value);
    if (totalStakeValue > 0 && surebetValue > 0 && oddValue > 0) {
      return (totalStakeValue / oddValue) / surebetValue;
    }
    return 0;
  });

  // Modo Individual: calcula a outra stake baseado em uma stake inserida
  const updateIndividualStake = (index: number, value: string) => {
    const newStakes = [...individualStakes];
    newStakes[index] = value;
    
    const stakeValue = parseFloat(value);
    if (stakeValue > 0 && odds.length === 2) {
      const odd1 = parseFloat(odds[0].value);
      const odd2 = parseFloat(odds[1].value);
      
      if (index === 0) {
        // Calcular stake2 baseado em stake1
        const stake2 = (stakeValue * odd1) / odd2;
        newStakes[1] = stake2.toFixed(2);
      } else {
        // Calcular stake1 baseado em stake2
        const stake1 = (stakeValue * odd2) / odd1;
        newStakes[0] = stake1.toFixed(2);
      }
    }
    
    setIndividualStakes(newStakes);
  };

  // Stakes finais baseado no modo
  const finalStakes = mode === 'total' ? calculatedStakesFromTotal : individualStakes.map(s => parseFloat(s) || 0);
  const totalInvested = finalStakes.reduce((sum, s) => sum + s, 0);

  // 💵 4. Cálculo do lucro garantido
  const guaranteedProfit = totalInvested > 0 && isSurebet
    ? totalInvested * (profitPercentage / 100)
    : 0;

  // 📊 5. Resultados por casa
  const results = odds.map((odd, index) => {
    const oddValue = parseFloat(odd.value);
    const stake = finalStakes[index];
    const potentialReturn = stake * oddValue; // Retorno se essa aposta ganhar
    const profitIfWins = potentialReturn - totalInvested; // Lucro se vencer
    const percentage = totalInvested > 0 ? (stake / totalInvested) * 100 : 0;
    
    return {
      selection: odd.selection,
      odd: oddValue,
      stake: stake,
      return: potentialReturn,
      profit: profitIfWins,
      percentage: percentage
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-2">
      <div className="max-w-md mx-auto space-y-2">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-2">
          <div className="flex items-center gap-2 text-white mb-1">
            <CalcIcon className="text-primary-500" size={16} />
            <h1 className="text-base font-bold">Calculadora Surebet</h1>
          </div>
          
          {/* Event Info */}
          {event && (
            <div className="space-y-1">
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 text-[10px] font-medium rounded-full border border-primary-500/30">
                  {sport || 'Futebol'}
                </span>
                <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-medium rounded-full border border-purple-500/30">
                  {market || 'Mercado'}
                </span>
              </div>
              <h2 className="text-white font-semibold text-xs">{event}</h2>
            </div>
          )}
        </div>

        {/* Validação de Surebet */}
        {odds.length > 0 && (
          <div className={`p-2 rounded-lg border text-[10px] ${
            !hasValidOdds 
              ? 'bg-red-500/10 border-red-500/30' 
              : isSurebet 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div className="flex items-center gap-1.5">
              {!hasValidOdds ? (
                <>
                  <AlertTriangle className="text-red-400" size={14} />
                  <span className="text-red-400 font-medium">Odds inválidas</span>
                </>
              ) : isSurebet ? (
                <>
                  <CheckCircle className="text-green-400" size={14} />
                  <div className="flex-1">
                    <span className="text-green-400 font-medium">✅ Surebet! </span>
                    <span className="text-green-300">Lucro: {profitPercentage.toFixed(2)}%</span>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="text-yellow-400" size={14} />
                  <span className="text-yellow-400 font-medium">⚠️ Não é surebet</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Seletor de Modo */}
        {odds.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-2">
            <label className="text-[10px] font-medium text-gray-300 mb-1.5 block">
              📊 Modo de Cálculo
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setMode('total')}
                className={`px-2 py-1 rounded-lg font-medium transition text-[10px] ${
                  mode === 'total'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                💰 Total
              </button>
              <button
                onClick={() => setMode('individual')}
                className={`px-2 py-1 rounded-lg font-medium transition text-[10px] ${
                  mode === 'individual'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🎯 Individual
              </button>
            </div>
          </div>
        )}

        {/* Input do Total Stake (Modo Total) */}
        {odds.length > 0 && mode === 'total' && (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-2">
            <label className="block text-[10px] font-medium text-gray-300 mb-1">
              💰 Valor Total
            </label>
            <input
              type="text"
              value={totalStake}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, '');
                setTotalStake(value);
              }}
              placeholder="810.00"
              className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-base font-bold focus:outline-none focus:border-primary-500 transition"
            />
          </div>
        )}

        {/* Odds & Stakes */}
        {odds.length > 0 && (mode === 'total' ? totalStakeValue > 0 : true) && (
          <div className="space-y-1.5">
            {odds.map((odd, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-2">
                <div className="mb-1.5">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-semibold text-white">
                      {odd.selection}
                    </label>
                    <span className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 text-[10px] font-medium rounded-full border border-primary-500/30">
                      Casa {index + 1}
                    </span>
                  </div>
                  
                  {/* Odd Input */}
                  <div className="mb-1.5">
                    <label className="block text-[10px] text-gray-400 mb-0.5">Odd:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.01"
                      value={odd.value}
                      onChange={(e) => updateOdd(index, e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm font-semibold focus:outline-none focus:border-primary-500 transition"
                    />
                  </div>

                  {/* Stake */}
                  <div>
                    {mode === 'total' ? (
                      <>
                        <label className="block text-[10px] text-gray-400 mb-0.5">✅ Apostar:</label>
                        <div className="w-full px-2 py-1.5 bg-green-900/30 border border-green-500/50 rounded text-green-300 text-base font-bold">
                          R$ {results[index].stake.toFixed(2)}
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="block text-[10px] text-gray-400 mb-0.5">💵 Stake:</label>
                        <input
                          type="text"
                          value={individualStakes[index]}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, '');
                            updateIndividualStake(index, value);
                          }}
                          placeholder="0.00"
                          className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-base font-bold focus:outline-none focus:border-primary-500 transition"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Result for this bet */}
                {isSurebet && finalStakes[index] > 0 && (
                  <div className="pt-1.5 border-t border-gray-700 space-y-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-400">Retorno:</span>
                      <span className="text-white font-semibold">R$ {results[index].return.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-400">Lucro:</span>
                      <span className="text-green-400 font-semibold">R$ {results[index].profit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-400">% Total:</span>
                      <span className="text-primary-400 font-semibold">{results[index].percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Total Summary */}
        {totalInvested > 0 && isSurebet && (
          <>
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-2 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300 font-medium">Total:</span>
                <span className="text-white text-base font-bold">R$ {totalInvested.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-300">Surebet Value:</span>
                <span className="text-primary-400 font-semibold">{surebetValue.toFixed(5)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-300 font-medium">Margem:</span>
                <span className="text-green-400 text-sm font-bold">{profitPercentage.toFixed(2)}%</span>
              </div>
            </div>

            {/* Profit Display */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-3 text-center border-2 border-green-400">
              <div className="text-white/80 text-[10px] font-medium mb-0.5">💰 Lucro Garantido</div>
              <div className="text-white text-2xl font-bold mb-0.5">
                R$ {guaranteedProfit.toFixed(2)}
              </div>
              <div className="text-green-100 text-sm font-semibold">
                ROI: {profitPercentage.toFixed(2)}%
              </div>
            </div>

            {/* Botão Salvar Aposta */}
            <button
              onClick={saveBet}
              disabled={isSavingBet}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm"
            >
              <BookmarkPlus size={18} />
              {isSavingBet ? 'Salvando...' : 'Salvar Aposta'}
            </button>

            {/* Confirmação de salvamento da aposta */}
            {showSaveBetConfirm && (
              <div className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-xs text-center animate-pulse">
                ✅ Aposta salva em "Apostas Salvas"!
              </div>
            )}
          </>
        )}

        {/* Instructions */}
        {totalInvested === 0 && odds.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-2">
            <p className="text-gray-400 text-[10px] text-center">
              {mode === 'total' 
                ? '💡 Digite o valor total'
                : '💡 Digite em uma stake'
              }
            </p>
          </div>
        )}

        {/* No odds message */}
        {odds.length === 0 && (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-3 text-center">
            <CalcIcon className="text-gray-600 mx-auto mb-1.5" size={32} />
            <p className="text-gray-400 text-[10px]">
              Clique em "Calculadora" em um sinal
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
