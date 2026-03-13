import React from 'react';
import { router } from '@inertiajs/react';
import { Search, Upload, Edit, Trash2, Eye, X } from 'lucide-react';

export default function HistorialTickets({ 
    comprasPaginated, 
    searchQuery, 
    setSearchQuery, 
    perPage, 
    handlePerPageChange,
    onEditCompra,
    onDeleteCompra
}) {
  const [viewModalOpen, setViewModalOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState(null);

  const handleOpenView = (ticket) => {
    setSelectedTicket(ticket);
    setViewModalOpen(true);
  };
  const filteredHistory = comprasPaginated?.data || [];
  const paginationLinks = comprasPaginated?.links || [];

  const handleExportCsv = () => {
      const params = new URLSearchParams();

      if (searchQuery?.trim()) {
        params.set('search', searchQuery.trim());
      }

      window.location.href = `/admin/export/compras?${params.toString()}`;
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 transition-colors duration-300">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select value={perPage} onChange={handlePerPageChange} className="w-full md:w-auto border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 font-bold text-slate-600 dark:text-slate-300 focus:ring-emerald-500">
            <option value="25">25 Filas</option>
            <option value="50">50 Filas</option>
            <option value="100">100 Filas</option>
            <option value="500">500 Filas</option>
            <option value="1000">1000 Filas</option>
            <option value="todos">Todos</option>
          </select>
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por DNI o Nombre..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" 
            />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={handleExportCsv} className="flex-1 md:flex-none bg-slate-800 dark:bg-slate-900 hover:bg-slate-900 dark:hover:bg-black text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Upload className="w-4 h-4" /> Exportar a Excel
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Cliente / DNI</th>
                <th className="p-4 font-bold">Sorteo Asignado</th>
                <th className="p-4 font-bold">Transacción Base</th>
                <th className="p-4 font-bold text-center">Tickets Asignados</th>
                <th className="p-4 font-bold">Fecha de Generación</th>
                <th className="p-4 font-bold">Estado</th>
                <th className="p-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
              {filteredHistory.map((ticket, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900 dark:text-white">{ticket.user}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">DNI: {ticket.user_dni}</p>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-bold">{ticket.sorteo}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-xs">COMPRA-{ticket.id}</td>
                  <td className="p-4">
                      <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto">
                          {ticket.detalles?.tickets ? ticket.detalles.tickets.map(t => (
                            <span key={t} className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">{t}</span>
                          )) : <span className="text-slate-400 dark:text-slate-500">-</span>}
                      </div>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{ticket.fecha}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${ticket.estado === 'aprobado' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                      {ticket.estado}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenView(ticket)} 
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Ver Detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEditCompra(ticket)} 
                        className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                        title="Editar Compra"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteCompra(ticket)} 
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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
                      <td colSpan="7" className="p-8 text-center text-slate-500 dark:text-slate-400 font-bold">
                          No hay resultados en el historial histórico de base de tickets.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {paginationLinks.length > 3 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              Mostrando página {comprasPaginated.current_page} de {comprasPaginated.last_page} ({comprasPaginated.total} registros)
            </p>
            <div className="flex gap-1 flex-wrap justify-end">
              {paginationLinks.map((link, idx) => {
                let url = link.url;
                if (url) {
                  const urlObj = new URL(url);
                  if (searchQuery) urlObj.searchParams.set('search', searchQuery);
                  if (perPage && perPage !== 25) urlObj.searchParams.set('perPage', perPage);
                  
                  urlObj.searchParams.set('tab', 'admin-lista-tickets');
                  url = urlObj.toString();
                }

                return (
                  <div key={idx}>
                    {url === null ? (
                        <span className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 rounded-lg bg-white dark:bg-slate-700 cursor-not-allowed text-xs font-bold ring-1 ring-transparent" dangerouslySetInnerHTML={{ __html: link.label }} />
                    ) : (
                        <button
                          type="button"
                          onClick={() => router.get(url, {}, { preserveScroll: true })}
                          className={`px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg transition-colors text-xs font-bold ${link.active ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
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

      {/* MODAL DE VISTA DETALLADA */}
      {viewModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-transparent dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                  <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">Detalle de COMPRA-{selectedTicket.id}</h3>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Info Cliente */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Información del Cliente</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-600">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Nombre</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{selectedTicket.user}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">DNI</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{selectedTicket.user_dni}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Sorteo</p>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{selectedTicket.sorteo}</p>
                  </div>
                </div>
              </div>

              {/* Info Pago */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Detalle del Pago</h4>
                <div className="grid grid-cols-2 gap-4 border border-slate-100 dark:border-slate-700 p-4 rounded-xl">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Monto Total</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">S/ {parseFloat(selectedTicket.total || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Método</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{selectedTicket.metodo_pago}</p>
                  </div>
                  {selectedTicket.detalles?.pago?.comprobante && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Comprobante</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{selectedTicket.detalles.pago.comprobante}</p>
                    </div>
                  )}
                  {selectedTicket.detalles?.pago?.monto !== undefined && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Efectivo</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">S/ {parseFloat(selectedTicket.detalles.pago.monto || 0).toFixed(2)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Fecha</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedTicket.fecha}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Estado</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${selectedTicket.estado === 'aprobado' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedTicket.estado}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tickets */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex justify-between items-center">
                  <span>Tickets Asignados</span>
                  <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-[10px]">{selectedTicket.detalles?.tickets?.length || 0} unid.</span>
                </h4>
                <div className="flex flex-wrap gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                  {selectedTicket.detalles?.tickets ? selectedTicket.detalles.tickets.map(t => (
                    <span key={t} className="bg-white dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 text-xs font-black px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-sm">{t}</span>
                  )) : <p className="text-slate-400 text-sm font-bold italic">No hay tickets registrados en el JSON de detalles.</p>}
                </div>
              </div>

              {/* Comprobante if exists */}
              {selectedTicket.comprobante_url && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Comprobante de Pago</h4>
                  <a href={selectedTicket.comprobante_url} target="_blank" rel="noreferrer" className="block group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors">
                    <img src={selectedTicket.comprobante_url} alt="Comprobante" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="text-white w-8 h-8" />
                    </div>
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button 
                onClick={() => {
                   setViewModalOpen(false);
                   onEditCompra(selectedTicket);
                }} 
                className="px-5 py-2 font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Editar
              </button>
              <button onClick={() => setViewModalOpen(false)} className="px-5 py-2 font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
