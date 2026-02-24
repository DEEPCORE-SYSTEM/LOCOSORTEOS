import React, { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Trophy, ChevronRight } from 'lucide-react';

export default function Ganadores() {
  const [winnersTab, setWinnersTab] = useState('reciente');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterLocation, setFilterLocation] = useState('Todas las ciudades');

  // Datos de ejemplo basados en el prototipo original. 
  // TODO: Dinamizar esto pasándole datos desde el backend usando props.
  const locationsList = ['Todas las ciudades', 'Lima', 'Arequipa', 'Trujillo', 'Chiclayo'];
  const grandWinners = [{ name: 'Carlos Mendoza' }];
  const allWinners = [
    { id: 1, name: 'Carlos Mendoza', initial: 'C', ticket: '0984', prize: 'Toyota Hilux 2026', type: 'CARRO', location: 'Lima' },
    { id: 2, name: 'Ana Torres', initial: 'A', ticket: '3412', prize: 'Moto Pulsar', type: 'MOTO', location: 'Arequipa' },
    { id: 3, name: 'Luis Ramirez', initial: 'L', ticket: '8871', prize: 'S/ 5,000 Efectivo', type: 'EFECTIVO', location: 'Trujillo' },
    { id: 4, name: 'Sofía Castro', initial: 'S', ticket: '1022', prize: 'iPhone 17 Plus', type: 'SMARTPHONE', location: 'Lima' },
  ];

  const filteredWinners = allWinners.filter(w => {
    const matchCat = filterCategory === 'Todos' || w.type === filterCategory;
    const matchLoc = filterLocation === 'Todas las ciudades' || w.location === filterLocation;
    return matchCat && matchLoc;
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
            <p className="text-slate-600 font-medium text-lg max-w-2xl mx-auto">
              ¡Felicitamos a todos los afortunados ganadores de nuestros sorteos! Aquí podrás verificar la transparencia de cada entrega.
            </p>
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
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider py-1 ${winner.type === 'CARRO' ? 'bg-emerald-100 text-emerald-800' :
                      winner.type === 'MOTO' ? 'bg-amber-100 text-amber-800' :
                        winner.type === 'EFECTIVO' ? 'bg-green-100 text-green-800' :
                          'bg-slate-100 text-slate-800'
                    }`}>
                    {winner.type}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{winner.ticket}</span>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-xl font-black text-slate-400 group-hover:bg-amber-400 group-hover:text-slate-900 group-hover:border-amber-400 transition-colors">
                    {winner.initial}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 text-sm truncate leading-tight">{winner.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{winner.location}</p>
                  </div>
                </div>

                <div className="mt-auto bg-[#F4F6F9] border border-slate-100 p-3 rounded-xl text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Premio</p>
                  <p className="font-black text-slate-900 text-sm">{winner.prize}</p>
                </div>

                {/* Etiqueta de Premio Mayor Condicional */}
                {grandWinners.some(g => g.name === winner.name) && (
                  <div className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-1 rounded shadow-sm opacity-90">
                    Premio Mayor
                  </div>
                )}
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
