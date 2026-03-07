import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Search, Eye, Loader2, Check, XCircle, AlertTriangle } from 'lucide-react';

export default function ValidarPagos({ pendientesPaginated, searchQuery, setSearchQuery, perPage, handlePerPageChange }) {
  const { flash } = usePage().props;
  const adminPendingTickets = pendientesPaginated?.data || [];
  const pendientesLinks = pendientesPaginated?.links || [];
  
  const [processingId, setProcessingId] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [ticketToReject, setTicketToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApproveTicket = (id) => {
    if (confirm('¿Estás seguro de aprobar este pago y generar los tickets correspondientes?')) {
      setProcessingId(id);
      router.post(`/admin/tickets/${id}/approve`, {}, {
        onFinish: () => setProcessingId(null)
      });
    }
  };

  const openRejectModal = (ticket) => {
    setTicketToReject(ticket);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const confirmRejectTicket = () => {
    if (!rejectReason) {
      alert('Por favor, selecciona un motivo de rechazo.');
      return;
    }
    
    setProcessingId(ticketToReject.id);
    setRejectModalOpen(false);
    
    router.post(`/admin/tickets/${ticketToReject.id}/reject`, { motivo: rejectReason }, {
      onFinish: () => {
        setProcessingId(null);
        setTicketToReject(null);
      }
    });
  };

  return (
    <>
      {flash?.success && <div className="mb-4 text-sm text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">{flash.success}</div>}
      {flash?.error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">{flash.error}</div>}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col relative overflow-hidden mb-6 transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-slate-800/50 relative z-10">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Validación de Pagos Pendientes</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Revisa el comprobante y aprueba para generar los tickets automáticamente.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select value={perPage} onChange={handlePerPageChange} className="w-full md:w-auto border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 font-bold text-slate-600 dark:text-slate-300 focus:ring-emerald-500">
               <option value="25">25 Filas</option>
               <option value="50">50 Filas</option>
               <option value="100">100 Filas</option>
               <option value="500">500 Filas</option>
               <option value="1000">1000 Filas</option>
               <option value="todos">Todos</option>
            </select>
            <div className="relative flex-1 md:flex-none">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input type="text" placeholder="Buscar DNI o Código..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">ID / Fecha</th>
                <th className="p-4 font-bold">Usuario y DNI</th>
                <th className="p-4 font-bold">Compra</th>
                <th className="p-4 font-bold">Método</th>
                <th className="p-4 font-bold">Boucher</th>
                <th className="p-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
              {adminPendingTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <p className="font-black text-slate-900 dark:text-white">COMPRA-{ticket.id}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{ticket.fecha}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400 text-base">{ticket.user}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">DNI: {ticket.user_dni}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-black text-slate-900 dark:text-white">{ticket.detalles?.cantidad || 1} Tickets</p>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400">S/ {parseFloat(ticket.total).toFixed(2)}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${ticket.metodo_pago === 'YAPE' ? 'bg-[#742284]/10 text-[#742284] dark:bg-[#742284]/30 dark:text-[#E0A0EC]' : ticket.metodo_pago === 'PLIN' ? 'bg-[#00E0C6]/10 text-[#0A2240] dark:bg-[#00E0C6]/20 dark:text-[#00E0C6]' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {ticket.metodo_pago}
                    </span>
                  </td>
                  <td className="p-4">
                    {ticket.comprobante_url ? (
                        <a href={ticket.comprobante_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg text-xs w-max">
                          <Eye className="w-4 h-4" /> Ver Imagen
                        </a>
                    ) : <span className="text-xs text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">Sin Imagen</span>}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {processingId === ticket.id ? (
                          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                      ) : (
                          <>
                            <button onClick={() => handleApproveTicket(ticket.id)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg shadow-sm" title="Aprobar Pago y Generar Tickets">
                              <Check className="w-5 h-5" />
                            </button>
                            <button onClick={() => openRejectModal(ticket)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm" title="Rechazar Pago">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {adminPendingTickets.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500 dark:text-slate-400 font-bold text-lg">
                    🎉 ¡Todo al día! No hay pagos pendientes por validar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación Pendientes */}
        {pendientesLinks.length > 3 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              Mostrando página {pendientesPaginated.current_page} de {pendientesPaginated.last_page} ({pendientesPaginated.total} registros)
            </p>
            <div className="flex gap-1 flex-wrap justify-end">
              {pendientesLinks.map((link, idx) => {
                
                let url = link.url;
                if (url) {
                  const urlObj = new URL(url);
                  if (searchQuery) urlObj.searchParams.set('search', searchQuery);
                  if (perPage && perPage !== 25) urlObj.searchParams.set('perPage', perPage);
                  
                  urlObj.searchParams.set('tab', 'admin-tickets');
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
        
        {/* MODAL DE RECHAZO DE PAGO */}
        {rejectModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-transparent dark:border-slate-700">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-red-50 dark:bg-red-900/20 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <h3 className="font-black text-lg text-red-900 dark:text-red-400">Rechazar Participación</h3>
              </div>
              <div className="p-6 space-y-4 text-left">
                <p className="text-sm text-slate-600 dark:text-slate-300">Estás a punto de rechazar la solicitud <strong className="font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">COMPRA-{ticketToReject?.id}</strong> de <strong className="dark:text-white">{ticketToReject?.user}</strong>. Selecciona el motivo exacto para el registro de auditoría:</p>
                <div className="mt-4">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Motivo del Rechazo</label>
                  <select
                    value={rejectReason || ''}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-red-500 dark:focus:border-red-500 focus:outline-none bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Selecciona un motivo --</option>
                    <option value="Pago no encontrado">Pago no encontrado en cuenta bancaria</option>
                    <option value="Monto incorrecto">Monto transferido es incorrecto</option>
                    <option value="Comprobante inválido">Comprobante falso, borroso o inválido</option>
                    <option value="Datos incorrectos">El cliente ingresó datos incorrectos</option>
                    <option value="Error de usuario">Error del usuario o cancelación</option>
                  </select>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                <button onClick={() => setRejectModalOpen(false)} className="px-5 py-2 font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors">Cancelar</button>
                <button onClick={confirmRejectTicket} className="px-5 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">Confirmar Rechazo</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
