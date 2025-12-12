'use client';

import { Search, Filter, X } from 'lucide-react';

interface FiltersProps {
  filters: {
    sport: string;
    market: string;
    minROI: string;
    maxROI: string;
    search: string;
  };
  setFilters: (filters: any) => void;
}

export default function SignalFilters({ filters, setFilters }: FiltersProps) {
  const resetFilters = () => {
    setFilters({
      sport: '',
      market: '',
      minROI: '',
      maxROI: '',
      search: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-primary-400" />
        <h2 className="text-lg font-semibold text-white">Filtros</h2>
        
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="ml-auto px-3 py-1 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition flex items-center gap-1"
          >
            <X size={14} />
            Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Buscar
          </label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Evento, esporte ou mercado..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sport */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Esporte
          </label>
          <select
            value={filters.sport}
            onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="Futebol">Futebol</option>
            <option value="Basquete">Basquete</option>
            <option value="Tênis">Tênis</option>
            <option value="Vôlei">Vôlei</option>
            <option value="E-Sports">E-Sports</option>
          </select>
        </div>

        {/* Market */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mercado
          </label>
          <select
            value={filters.market}
            onChange={(e) => setFilters({ ...filters, market: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="1x2">1x2</option>
            <option value="Over/Under">Over/Under</option>
            <option value="Handicap">Handicap</option>
            <option value="Ambas Marcam">Ambas Marcam</option>
          </select>
        </div>

        {/* ROI Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ROI Mín %
            </label>
            <input
              type="number"
              placeholder="0"
              step="0.1"
              value={filters.minROI}
              onChange={(e) => setFilters({ ...filters, minROI: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ROI Máx %
            </label>
            <input
              type="number"
              placeholder="100"
              step="0.1"
              value={filters.maxROI}
              onChange={(e) => setFilters({ ...filters, maxROI: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
