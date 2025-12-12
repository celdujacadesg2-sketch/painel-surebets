'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface SavedBetFormProps {
  onSave: (data: any) => Promise<void>;
}

export default function SavedBetForm({ onSave }: SavedBetFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    sport: '',
    event: '',
    market: '',
    odds: '',
    stake: '',
    bookmaker: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSave(formData);
      setFormData({
        sport: '',
        event: '',
        market: '',
        odds: '',
        stake: '',
        bookmaker: '',
        notes: '',
      });
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar aposta');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition"
      >
        <Plus size={20} />
        Nova Aposta
      </button>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Salvar Nova Aposta</h2>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Esporte *
            </label>
            <input
              type="text"
              required
              value={formData.sport}
              onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Futebol"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Evento *
            </label>
            <input
              type="text"
              required
              value={formData.event}
              onChange={(e) => setFormData({ ...formData, event: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Time A vs Time B"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mercado *
            </label>
            <input
              type="text"
              required
              value={formData.market}
              onChange={(e) => setFormData({ ...formData, market: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: 1x2, Over/Under"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Odd *
            </label>
            <input
              type="text"
              required
              value={formData.odds}
              onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: 2.50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Valor (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.stake}
              onChange={(e) => setFormData({ ...formData, stake: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: 100.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Casa de Aposta *
            </label>
            <input
              type="text"
              required
              value={formData.bookmaker}
              onChange={(e) => setFormData({ ...formData, bookmaker: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Bet365"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Adicione observações sobre esta aposta..."
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Aposta'}
          </button>
          
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
