import React, { useState, useMemo } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Trophy, ChevronRight, Search } from 'lucide-react';

export default function Ganadores({ sorteosPaginated, filters = {} }) {
  const sorteos = sorteosPaginated?.data || [];
  const paginationLinks = sorteosPaginated?.links || [];
  
  // Tab activa: por defecto 'all' para mostrar todos, o el ID de un sorteo específico
  const [activeSorteoTab, setActiveSorteoTab] = useState('all');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterLocation, setFilterLocation] = useState('Todos los lugares');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Extraemos lista dinámica de departamentos según los ganadores cargados
  const locationsList = useMemo(() => {
    const allDepartamentos = sorteos.flatMap(sorteo => sorteo.winners.map(w => w.departamento || 'Desconocida'));
    const uniqueLocations = [...new Set(allDepartamentos)].filter(loc => loc.trim() !== '');
    return ['Todos los lugares', ...uniqueLocations.sort()];
  }, [sorteos]);

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/ganadores', { search: searchTerm }, { preserveState: true, replace: true });
  };

  const { auth } = usePage().props;

  // Filtramos por categoría y ubicación seleccionada dentro de un sorteo
  const filterWinners = (winnersArray) => {
    let filtered = winnersArray;
    if (filterCategory !== 'Todos') {
      filtered = filtered.filter(w => w.premio.toUpperCase().includes(filterCategory.toUpperCase()));
    }
    if (filterLocation !== 'Todos los lugares') {
      filtered = filtered.filter(w => w.departamento === filterLocation);
    }
    return filtered;
  };

  // Filtramos los sorteos a mostrar según el Tab seleccionado
  const sorteosToDisplay = activeSorteoTab === 'all' 
    ? sorteos 
    : sorteos.filter(s => s.id === activeSorteoTab);

  // Computamos todos los ganadores a mostrar en pantalla aclamándolos en un solo array
  const allCurrentWinners = sorteosToDisplay.flatMap(sorteo => filterWinners(sorteo.winners));
  const totalFilteredWinners = allCurrentWinners.length;

  return (
    <PublicLayout isLoggedIn={!!auth?.user} currentUser={auth?.user}>
      <Head title="Nuestros Ganadores | Sorteos CampoAgro" />
      <section className="bg-[#F4F6F9] min-h-screen pb-20">
        
        {/* HEADER DE SORTEOS (Tabs Dinámicos por Sorteo) */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-[60px] md:top-[68px] z-40">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-6">
              <button 
                onClick={() => setActiveSorteoTab('all')} 
                className={`whitespace-nowrap py-4 font-bold text-sm border-b-4 transition-colors ${activeSorteoTab === 'all' ? 'border-amber-400 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Todos los Sorteos
              </button>
              {sorteos.map(sorteo => (
                <button 
                  key={sorteo.id}
                  onClick={() => setActiveSorteoTab(sorteo.id)} 
                  className={`whitespace-nowrap py-4 font-bold text-sm border-b-4 transition-colors ${activeSorteoTab === sorteo.id ? 'border-amber-400 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  {sorteo.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl mt-8 pt-4">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Volver atrás
          </button>
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-7xl font-black text-[#0A2240] uppercase italic mb-4">
              ¡GANADORES!
            </h2>
            <p className="text-slate-600 font-medium text-lg max-w-2xl mx-auto mb-8">
              ¡Felicitamos a todos los afortunados ganadores de nuestros sorteos! Aquí podrás verificar la transparencia de cada entrega.
            </p>

            {/* Búsqueda por DNI */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2 mb-8">
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


          {/* FILTROS (Originales) */}
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
                <span className="text-emerald-600">{totalFilteredWinners}</span> resultados mostrados
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

          {/* LISTA DE GANADORES (Grilla Única Constante) */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="p-6 md:p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allCurrentWinners.map((winner) => (
                  <div key={winner.id} className="bg-slate-50 rounded-[1.5rem] p-6 relative flex flex-col hover:shadow-md hover:bg-white transition-all group border border-slate-100 hover:border-emerald-200">
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-widest bg-emerald-100 text-emerald-800">
                        Ticket # {winner.ticket}
                      </span>
                    </div>

                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-white border-4 border-slate-100 shadow-sm flex items-center justify-center text-2xl font-black text-slate-400 group-hover:bg-amber-400 group-hover:text-slate-900 group-hover:border-amber-200 transition-colors mb-3">
                        {winner.user.charAt(0)}
                      </div>
                      <p className="font-black text-slate-800 text-base leading-tight mb-1">{winner.user}</p>
                      <p className="text-xs text-slate-500 mb-1">DNI: ••••{winner.dni.slice(-4)}</p>
                      {winner.departamento && (
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1">
                          📍 {winner.departamento}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">Premio Ganado</p>
                      <p className="font-black text-[#0A2240] text-sm">{winner.premio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {totalFilteredWinners === 0 && (
            <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-slate-100 mt-8">
              <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-lg">No se encontraron ganadores con esos criterios.</p>
            </div>
          )}

          {/* Paginación de Sorteos */}
          {paginationLinks.length > 3 && (
            <div className="mt-12 flex items-center justify-center">
              <div className="flex gap-2 flex-wrap justify-center">
                {paginationLinks.map((link, idx) => (
                  <div key={idx}>
                    {link.url === null ? (
                        <span className="px-5 py-2.5 border border-slate-200 text-slate-400 rounded-xl bg-white cursor-not-allowed text-sm font-bold block min-w-[44px] text-center" dangerouslySetInnerHTML={{ __html: link.label }} />
                    ) : (
                        <button
                          type="button"
                          onClick={() => router.get(link.url, { search: searchTerm }, { preserveState: true })}
                          className={`px-5 py-2.5 border rounded-xl transition-all text-sm font-bold min-w-[44px] text-center shadow-sm ${
                            link.active ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 border-slate-200'
                          }`}
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </PublicLayout>
  );
}
