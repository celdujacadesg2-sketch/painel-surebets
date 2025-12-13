'use client';

import { useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const bookmakers = [
  { 
    name: 'Bet7k', 
    hasClones: true,
    logo: '/bet7k.webp'
  },
  { 
    name: 'Betano', 
    hasClones: false,
    logo: '/betano.png'
  },
  { 
    name: 'Bet365', 
    hasClones: false,
    logo: '/bet365.jpg'
  },
  { 
    name: 'Betão', 
    hasClones: true,
    logo: '/betao.png'
  },
  { 
    name: 'Blaze', 
    hasClones: true, 
    group: 'Blaze, Stake e Clones',
    logo: '/blaze.jpg'
  },
  { 
    name: 'Estrelabet', 
    hasClones: true,
    logo: '/estrela.png'
  },
  { 
    name: 'Novibet', 
    hasClones: false,
    logo: '/novibet.png'
  },
  { 
    name: 'Pinnacle', 
    hasClones: false,
    logo: '/pinnacle.webp'
  },
  { 
    name: 'Superbet', 
    hasClones: false,
    logo: '/superbet.png'
  },
  { 
    name: 'Sportingbet', 
    hasClones: false,
    logo: '/sporting.png'
  },
];

export default function BookmakersPage() {
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuggestion = async () => {
    if (!suggestion.trim()) {
      alert('Por favor, digite sua sugestão');
      return;
    }

    setIsSubmitting(true);
    
    // Aqui você pode implementar o envio da sugestão (email, API, etc)
    setTimeout(() => {
      alert('✅ Sugestão enviada com sucesso! Obrigado pela contribuição.');
      setSuggestion('');
      setShowSuggestionModal(false);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
              🏠 Casas de Apostas Suportadas
            </h1>
            <p className="text-gray-400">
              Lista de casas compatíveis com nosso sistema
            </p>
          </div>

          {/* Aviso de novas casas */}
          <div className="mb-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-2xl font-black text-yellow-300 mb-2 flex items-center gap-2">
                  🚀 Novidades em Breve!
                </h3>
                <p className="text-yellow-200 mb-3">
                  Estamos constantemente trabalhando para adicionar novas casas de apostas ao nosso sistema. 
                  Sua sugestão é muito importante para nós!
                </p>
              </div>
              <button
                onClick={() => setShowSuggestionModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
              >
                💡 Enviar Sugestão
              </button>
            </div>
          </div>

          {/* Lista de casas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmakers.map((bookmaker, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  {/* Logo */}
                  <div className="w-full h-32 bg-gradient-to-br from-white/5 via-white/10 to-white/5 rounded-xl flex items-center justify-center p-4 backdrop-blur-sm shadow-inner border border-white/10">
                    <img 
                      src={bookmaker.logo} 
                      alt={bookmaker.name}
                      className="w-full h-full object-cover rounded-lg shadow-lg"
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))' }}
                      onError={(e) => {
                        // Fallback se a logo não carregar
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-black text-white">${bookmaker.name}</span>`;
                      }}
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {bookmaker.group || bookmaker.name}
                    </h3>
                    {bookmaker.hasClones && (
                      <span className="text-xs text-gray-400 italic">
                        + clones compatíveis
                      </span>
                    )}
                  </div>
                  
                  {/* Check badge */}
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl">✓</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info adicional */}
          <div className="mt-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-blue-300 mb-2 flex items-center gap-2">
              ℹ️ Informação Importante
            </h3>
            <p className="text-gray-300 text-sm">
              As casas marcadas como "e Clones" também funcionam com sites semelhantes que utilizam a mesma plataforma.
              Se você encontrar alguma casa que não está funcionando corretamente, por favor, entre em contato conosco.
            </p>
          </div>
        </div>

        {/* Modal de Sugestão */}
        {showSuggestionModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
                💡 Sugerir Nova Casa
              </h2>
              <p className="text-gray-400 mb-6">
                Qual casa de apostas você gostaria de ver no nosso sistema?
              </p>
              
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Digite o nome da casa e qualquer informação adicional..."
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none h-32 mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSuggestionModal(false);
                    setSuggestion('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSuggestion}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
