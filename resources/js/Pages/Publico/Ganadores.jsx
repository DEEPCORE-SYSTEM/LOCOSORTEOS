import React, { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Trophy, ChevronRight, Search } from 'lucide-react';

export default function Ganadores({ ganadores = [], filters = {} }) {
  const [winnersTab, setWinnersTab] = useState('reciente');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterLocation, setFilterLocation] = useState('Todas las ciudades');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const locationsList = ['Todas las ciudades', 'Lima', 'Arequipa', 'Trujillo', 'Chiclayo'];
  const grandWinners = []; 

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/ganadores', { search: searchTerm }, { preserveState: true, replace: true });
  };

  const filteredWinners = ganadores.filter(w => {
    
    
    
    return true; 
  });

  return (
    <PublicLayout>
      <Head title="Nuestros Ganadores | Sorteos Finagro" />
      <section className="bg-[#F4F6F9] min-h-screen pb-20">
        {/* HEADER DE SORTEOS (Tabs) */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-[60px] md:top-[68px] z-40">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-6">
              <button onClick={() => setWinnersTab('reciente')} className={`whitespace-nowrap py-4 font-bold text-sm border-b-4 transition-colors ${winnersTab === 'reciente' ? 'border-amber-400 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Último Sorteo</button>
              <button onClick={() => setWinnersTab('historico')} className={`whitespace-nowrap py-4 font-bold text-sm border-b-4 transition-colors ${winnersTab === 'historico' ? 'border-amber-400 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Sorteos Anteriores</button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl mt-8">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Volver atrás
          </button>

          {/* HERO GANADORES */}
          <div className="text-center mb-8">
            <p className="text-emerald-600 font-black text-lg md:text-xl uppercase tracking-widest mb-1">Resultados Oficiales</p>
            <h2 className="text-5xl md:text-7xl font-black text-[#0A2240] uppercase italic mb-4">
              ¡GANADORES!
            </h2>
            <p className="text-slate-600 font-medium text-lg max-w-2xl mx-auto mb-8">
              ¡Felicitamos a todos los afortunados ganadores de nuestros sorteos! Aquí podrás verificar la transparencia de cada entrega.
            </p>

            {/* Búsqueda por DNI */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Buscar por DNI o N° de Ticket"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-6 py-3 rounded-xl shadow-sm transition-colors">
                    Buscar
                </button>
                {filters.search && (
                    <button type="button" onClick={() => { setSearchTerm(''); router.get('/ganadores'); }} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-3 rounded-xl shadow-sm transition-colors">
                        X
                    </button>
                )}
            </form>
          </div>

          {/* RESUMEN DE PREMIOS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center border border-slate-100">
              <p className="text-4xl font-black text-slate-900 mb-1">20</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Carros</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center border border-slate-100">
              <p className="text-4xl font-black text-slate-900 mb-1">12</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Motos</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center border border-slate-100">
              <p className="text-4xl font-black text-slate-900 mb-1">5</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Smartphones</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center border border-slate-100">
              <p className="text-4xl font-black text-slate-900 mb-1">180</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Efectivo</p>
            </div>
          </div>

          {/* FILTROS */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              {['Todos', 'CARRO', 'MOTO', 'SMARTPHONE', 'EFECTIVO'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-full font-bold text-xs md:text-sm transition-colors ${filterCategory === cat ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {cat === 'Todos' ? 'Todos' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
              <p className="text-slate-500 font-bold text-sm w-full md:w-auto text-center md:text-left">
                <span className="text-emerald-600">{filteredWinners.length}</span> resultados
              </p>
              <select
                value={filterLocation || ''}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full md:w-64 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500"
              >
                {locationsList.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* GRILLA DE GANADORES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredWinners.map((winner) => (
              <div key={winner.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 relative overflow-hidden flex flex-col hover:shadow-md hover:border-emerald-200 transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider bg-emerald-100 text-emerald-800">
                    Sorteo Finalizado
                  </span>
                  <span className="text-xs font-bold text-slate-400">N° {winner.ticket}</span>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-xl font-black text-slate-400 group-hover:bg-amber-400 group-hover:text-slate-900 group-hover:border-amber-400 transition-colors">
                    {winner.user.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 text-sm truncate leading-tight">{winner.user}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{winner.sorteo}</p>
                  </div>
                </div>

                <div className="mt-auto bg-[#F4F6F9] border border-slate-100 p-3 rounded-xl text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Premio Ganado</p>
                  <p className="font-black text-slate-900 text-sm">{winner.premio}</p>
                  <p className="text-[9px] text-slate-400 mt-1">DNI Oculto: ••••{winner.dni.slice(-4)} | Fecha: {winner.fecha}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredWinners.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 font-bold">No se encontraron ganadores con estos filtros.</p>
            </div>
          )}

        </div>
      </section>
    </PublicLayout>
  );
}
