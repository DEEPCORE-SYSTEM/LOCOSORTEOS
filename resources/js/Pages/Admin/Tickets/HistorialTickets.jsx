import React from 'react';
import { router } from '@inertiajs/react';
import { Search, Upload, Edit, Trash2 } from 'lucide-react';

export default function HistorialTickets({ 
    comprasPaginated, 
    searchQuery, 
    setSearchQuery, 
    perPage, 
    handlePerPageChange,
    onEditCompra,
    onDeleteCompra
}) {
  const filteredHistory = comprasPaginated?.data || [];
  const paginationLinks = comprasPaginated?.links || [];

  const handleExportCsv = () => {
      // Export logic to be implemented or passed from parent if needed
      alert('Funcionalidad de exportación en desarrollo.');
  };

  return (
    <>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select value={perPage} onChange={handlePerPageChange} className="w-full md:w-auto border-slate-200 rounded-lg text-sm bg-white font-bold text-slate-600 focus:ring-emerald-500">
            <option value="25">25 Filas</option>
            <option value="50">50 Filas</option>
            <option value="100">100 Filas</option>
            <option value="500">500 Filas</option>
            <option value="1000">1000 Filas</option>
            <option value="todos">Todos</option>
          </select>
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por DNI o Nombre..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
            />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={handleExportCsv} className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Upload className="w-4 h-4" /> Exportar a Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Cliente / DNI</th>
                <th className="p-4 font-bold">Sorteo Asignado</th>
                <th className="p-4 font-bold">Transacción Base</th>
                <th className="p-4 font-bold text-center">Tickets Asignados</th>
                <th className="p-4 font-bold">Fecha de Generación</th>
                <th className="p-4 font-bold">Estado</th>
                <th className="p-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredHistory.map((ticket, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{ticket.user}</p>
                    <p className="text-xs text-slate-500">DNI: {ticket.user_dni}</p>
                  </td>
                  <td className="p-4 text-slate-600 font-bold">{ticket.sorteo}</td>
                  <td className="p-4 text-slate-500 font-mono text-xs">COMPRA-{ticket.id}</td>
                  <td className="p-4">
                      <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto">
                          {ticket.detalles?.tickets ? ticket.detalles.tickets.map(t => (
                            <span key={t} className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-emerald-200">{t}</span>
                          )) : <span className="text-slate-400">-</span>}
                      </div>
                  </td>
                  <td className="p-4 text-slate-500">{ticket.fecha}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${ticket.estado === 'aprobado' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {ticket.estado}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => onEditCompra(ticket)} 
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Editar Compra"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteCompra(ticket)} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Anular / Eliminar Compra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                  <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500 font-bold">
                          No hay resultados en el historial histórico de base de tickets.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {paginationLinks.length > 3 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <p className="text-xs text-slate-500 font-bold">
              Mostrando página {comprasPaginated.current_page} de {comprasPaginated.last_page} ({comprasPaginated.total} registros)
            </p>
            <div className="flex gap-1 flex-wrap justify-end">
              {paginationLinks.map((link, idx) => {
                let url = link.url;
                if (url) {
                  const urlObj = new URL(url);
                  if (searchQuery) urlObj.searchParams.set('search', searchQuery);
                  if (perPage && perPage !== 25) urlObj.searchParams.set('perPage', perPage);
                  // Keep us on the correct tab
                  urlObj.searchParams.set('tab', 'admin-lista-tickets');
                  url = urlObj.toString();
                }

                return (
                  <div key={idx}>
                    {url === null ? (
                        <span className="px-3 py-1.5 border border-slate-200 text-slate-400 rounded-lg bg-white cursor-not-allowed text-xs font-bold ring-1 ring-transparent" dangerouslySetInnerHTML={{ __html: link.label }} />
                    ) : (
                        <button
                          type="button"
                          onClick={() => router.get(url, {}, { preserveScroll: true })}
                          className={`px-3 py-1.5 border border-slate-200 rounded-lg transition-colors text-xs font-bold ${link.active ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
