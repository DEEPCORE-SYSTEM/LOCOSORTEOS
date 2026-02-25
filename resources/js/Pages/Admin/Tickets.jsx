import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { Ticket, Search, Upload, CheckCircle, XCircle, AlertTriangle, Loader2, Eye, Check, Plus, ChevronRight, Facebook, QrCode, Scissors, Sprout, FileText, LineChart, X, Dices } from 'lucide-react';

export default function Tickets({ compras = [], sorteos = [], ticketsData = {} }) {
  const { flash } = usePage().props;
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('admin-tickets'); 
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [ticketToReject, setTicketToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedOfflineTicket, setSelectedOfflineTicket] = useState('');
  
  const [offlineSorteoId, setOfflineSorteoId] = useState(sorteos.length > 0 ? sorteos[0].id : null);
  const [offlinePage, setOfflinePage] = useState(1);
  const ticketsPerPage = 120;

  const activeSorteo = sorteos.find(s => s.id === offlineSorteoId) || sortedSorteos[0] || null;
  const maxTickets = activeSorteo ? activeSorteo.cantidad_tickets : 0;
  const currentTicketsData = activeSorteo ? (ticketsData[activeSorteo.id] || {}) : {};
  
  const countVendidos = Object.values(currentTicketsData).filter(s => s === 'vendido').length;
  const countImpresos = Object.values(currentTicketsData).filter(s => s === 'impreso').length;
  const countReservados = Object.values(currentTicketsData).filter(s => s === 'reservado').length;
  const countLibres = maxTickets - countVendidos - countImpresos - countReservados;
  
  const totalPages = Math.ceil(maxTickets / ticketsPerPage) || 1;
  const startTicket = (offlinePage - 1) * ticketsPerPage;
  const endTicket = Math.min(startTicket + ticketsPerPage - 1, maxTickets - 1);

  const { data, setData, post, processing: offlineProcessing, errors, reset } = useForm({
      sorteo_id: sorteos.length > 0 ? sorteos[0].id : '',
      dni: '',
      nombre: '',
      cantidad: 1,
      total: sorteos.length > 0 ? sorteos[0].precio_ticket : 0
  });

  
  const adminPendingTickets = compras.filter(c => c.estado === 'pendiente');

  
  const allGeneratedTickets = compras.filter(c => c.estado !== 'pendiente');

  const handleApproveTicket = (id, quantity) => {
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

  const submitOffline = (e) => {
      e.preventDefault();
      post('/admin/tickets/offline', {
          onSuccess: () => {
              setShowOfflineModal(false);
              reset();
          }
      });
  };

  const [searchQuery, setSearchQuery] = useState('');
  
  
  const filteredHistory = allGeneratedTickets.filter(t => {
      if(!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (t.user && t.user.toLowerCase().includes(q)) || 
             (t.user_dni && t.user_dni.includes(q)) ||
             (t.detalles?.tickets && t.detalles.tickets.some(num => num.includes(q))) ||
             (`COMPRA-${t.id}`.toLowerCase().includes(q));
  });

  return (
    <AdminLayout currentView={activeTab} pendingTicketsCount={adminPendingTickets.length}>
      <Head title="Validación de Pagos | Admin Finagro" />

      <div className="space-y-6">
        {/* Botonera Superior Tickets */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('admin-tickets')} 
            className={`${activeTab === 'admin-tickets' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'} font-bold px-6 py-2.5 rounded-xl transition-colors`}
          >
            Validar Pagos Pendientes
          </button>
          <button 
            onClick={() => setActiveTab('admin-lista-tickets')} 
            className={`${activeTab === 'admin-lista-tickets' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'} font-bold px-6 py-2.5 rounded-xl transition-colors`}
          >
            Historial de Vendidos
          </button>
          <button 
            onClick={() => setActiveTab('admin-talonario')} 
            className={`${activeTab === 'admin-talonario' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'} font-bold px-6 py-2.5 rounded-xl transition-colors`}
          >
            Talonario (Ventas Offline)
          </button>
        </div>

        {activeTab === 'admin-tickets' ? (
            
            <>
              {flash?.success && <div className="mb-4 text-sm text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">{flash.success}</div>}
              {flash?.error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">{flash.error}</div>}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Validación de Pagos Pendientes</h3>
                    <p className="text-sm text-slate-500">Revisa el comprobante y aprueba para generar los tickets automáticamente.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Buscar DNI o Código..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">ID / Fecha</th>
                        <th className="p-4 font-bold">Usuario y DNI</th>
                        <th className="p-4 font-bold">Compra</th>
                        <th className="p-4 font-bold">Método</th>
                        <th className="p-4 font-bold">Boucher</th>
                        <th className="p-4 font-bold text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {adminPendingTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <p className="font-black text-slate-900">COMPRA-{ticket.id}</p>
                            <p className="text-xs text-slate-500">{ticket.fecha}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-emerald-700 text-base">{ticket.user}</p>
                            <p className="text-xs text-slate-500">DNI: {ticket.user_dni}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-black text-slate-900">{ticket.detalles?.cantidad || 1} Tickets</p>
                            <p className="text-xs font-bold text-green-600">S/ {parseFloat(ticket.total).toFixed(2)}</p>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${ticket.metodo_pago === 'YAPE' ? 'bg-[#742284]/10 text-[#742284]' : ticket.metodo_pago === 'PLIN' ? 'bg-[#00E0C6]/10 text-[#0A2240]' : 'bg-slate-200 text-slate-700'}`}>
                              {ticket.metodo_pago}
                            </span>
                          </td>
                          <td className="p-4">
                            {ticket.comprobante_url ? (
                                <a href={ticket.comprobante_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg text-xs w-max">
                                  <Eye className="w-4 h-4" /> Ver Imagen
                                </a>
                            ) : <span className="text-xs text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-lg">Sin Imagen</span>}
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
                          <td colSpan="6" className="p-12 text-center text-slate-500 font-bold text-lg">
                            🎉 ¡Todo al día! No hay pagos pendientes por validar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* MODAL DE RECHAZO DE PAGO */}
                {rejectModalOpen && (
                  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                      <div className="p-6 border-b border-slate-100 bg-red-50 flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <h3 className="font-black text-lg text-red-900">Rechazar Participación</h3>
                      </div>
                      <div className="p-6 space-y-4 text-left">
                        <p className="text-sm text-slate-600">Estás a punto de rechazar la solicitud <strong className="font-mono text-slate-900 bg-slate-100 px-1 py-0.5 rounded">COMPRA-{ticketToReject?.id}</strong> de <strong>{ticketToReject?.user}</strong>. Selecciona el motivo exacto para el registro de auditoría:</p>
                        <div className="mt-4">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Motivo del Rechazo</label>
                          <select
                            value={rejectReason || ''}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-none bg-slate-50"
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
                      <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                        <button onClick={() => setRejectModalOpen(false)} className="px-5 py-2 font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                        <button onClick={confirmRejectTicket} className="px-5 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">Confirmar Rechazo</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
        ) : activeTab === 'admin-lista-tickets' ? (
            
            <>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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
                    <button className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <Upload className="w-4 h-4" /> Exportar a Excel
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                          <th className="p-4 font-bold">Cliente / DNI</th>
                          <th className="p-4 font-bold">Sorteo Asignado</th>
                          <th className="p-4 font-bold">Transacción Base</th>
                          <th className="p-4 font-bold text-center">Tickets Asignados</th>
                          <th className="p-4 font-bold">Fecha de Generación</th>
                          <th className="p-4 font-bold">Estado</th>
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
                          </tr>
                        ))}
                        {filteredHistory.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500 font-bold">
                                    No hay resultados en el historial histórico de base de tickets.
                                </td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
            </>
        ) : (
            
            <div className="space-y-6">
              {/* Controles del Talonario y Exportación en Bloque */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Resumen del Sorteo */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-3">
                        Pool de Números:
                        <select 
                          value={offlineSorteoId || ''} 
                          onChange={(e) => { setOfflineSorteoId(Number(e.target.value)); setOfflinePage(1); }}
                          className="text-sm border-slate-200 rounded-lg py-1 pl-3 pr-8 focus:ring-emerald-500 focus:border-emerald-500 font-bold bg-slate-50 cursor-pointer"
                        >
                          {sorteos.map(s => (
                            <option key={s.id} value={s.id}>{s.nombre}</option>
                          ))}
                        </select>
                      </h3>
                      <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm font-bold">
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-100">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 block shadow-sm"></span>
                          <span className="text-base md:text-lg">{countVendidos}</span> Vendidos
                        </div>
                        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-lg border border-purple-100" title="Impresos y entregados a vendedores de campo">
                          <span className="w-3 h-3 rounded-full bg-purple-500 block shadow-sm"></span>
                          <span className="text-base md:text-lg">{countImpresos}</span> En Calle
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg border border-amber-100" title="Pendientes de validación online">
                          <span className="w-3 h-3 rounded-full bg-amber-400 block shadow-sm"></span>
                          <span className="text-base md:text-lg">{countReservados}</span> Reservas Web
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 text-slate-600 px-3 py-2 rounded-lg border border-slate-200">
                          <span className="w-3 h-3 rounded-full bg-white block border-2 border-slate-300 shadow-sm"></span>
                          <span className="text-base md:text-lg">{countLibres}</span> Libres
                        </div>
                      </div>
                    </div>
                    {/* Botón Nueva Venta Manual */}
                    <button onClick={() => { setSelectedOfflineTicket(''); setShowOfflineModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md transform hover:-translate-y-0.5 hidden md:flex shrink-0">
                      <Plus className="w-5 h-5" /> Venta Directa
                    </button>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Buscar número específico..." className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                    <button onClick={() => { setSelectedOfflineTicket(''); setShowOfflineModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold p-3 rounded-xl shadow-md md:hidden">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Módulo de Exportación Física */}
                <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-sm border border-slate-700 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-slate-700 p-2 rounded-lg"><Upload className="w-5 h-5 text-emerald-400" /></div>
                      <h3 className="font-black text-lg">Exportar (Imprenta)</h3>
                    </div>
                    <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                      Bloquea un lote de números libres pasándolos a estado <span className="text-purple-300 font-bold">"En Calle"</span> para imprimirlos y dárselos a tus vendedores.
                    </p>
                  </div>

                  <button onClick={() => setExportModalOpen(true)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm px-4 py-3 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2 relative z-10">
                    Configurar Exportación <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grilla Interactiva del Talonario */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-slate-500 font-medium">Haz clic en un número <span className="font-bold text-slate-700">Libre (Blanco)</span> para venta en oficina, o en uno <span className="font-bold text-purple-700">Impreso (Morado)</span> para registrar la venta de calle.</p>
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Rango visible: {String(startTicket).padStart(4, '0')} - {String(endTicket).padStart(4, '0')}</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-2">
                  {maxTickets > 0 && Array.from({ length: endTicket - startTicket + 1 }).map((_, i) => {
                    const ticketIndex = startTicket + i;
                    const num = String(ticketIndex).padStart(4, '0');
                    const status = currentTicketsData[num] || 'libre';

                    let bgClass = "bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700 hover:shadow-sm";
                    if (status === 'vendido') bgClass = "bg-emerald-500 text-white border-emerald-600 shadow-sm opacity-90 cursor-not-allowed";
                    if (status === 'reservado') bgClass = "bg-amber-400 text-amber-900 border-amber-500 shadow-sm opacity-90 cursor-not-allowed";
                    if (status === 'impreso') bgClass = "bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-500 hover:text-white transition-colors cursor-pointer shadow-sm";

                    return (
                      <button
                        type="button"
                        key={num}
                        onClick={() => {
                          if (status === 'libre' || status === 'impreso') {
                            
                            setSelectedOfflineTicket(num);
                            setData('sorteo_id', activeSorteo.id);
                            setShowOfflineModal(true);
                          } else if (status === 'vendido') {
                            alert(`Ticket ${num} ya ha sido VENDIDO. No puedes modificarlo desde aquí.`);
                          } else {
                            alert(`Ticket ${num} está RESERVADO (esperando validación de pago web).`);
                          }
                        }}
                        className={`py-2.5 rounded-lg font-mono font-bold text-sm border-2 transition-all ${bgClass}`}
                        title={status === 'libre' ? 'Venta en Oficina' : status === 'impreso' ? 'Registrar retorno de Vendedor' : status === 'vendido' ? 'Ticket Vendido' : 'Reserva Web'}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                {maxTickets > 0 && totalPages > 1 && (
                  <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <div className="inline-flex gap-1 items-center">
                      <button 
                        onClick={() => setOfflinePage(p => Math.max(1, p - 1))}
                        disabled={offlinePage === 1}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-l-lg hover:bg-slate-50 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                      >
                        Anterior
                      </button>
                      
                      <span className="px-4 py-2 border-y border-slate-200 text-slate-700 font-bold bg-slate-50 text-sm">
                        Página {offlinePage} de {totalPages}
                      </span>
                      
                      <button 
                        onClick={() => setOfflinePage(p => Math.min(totalPages, p + 1))}
                        disabled={offlinePage === totalPages}
                        className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-r-lg disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
        )}

      </div>

      {/* Modal de Venta Offline COMPLETAMENTE REDISEÑADO */}
      {showOfflineModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col my-8">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-slate-900 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg"><Ticket className="w-6 h-6 text-emerald-600" /></div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">Registro de Venta Manual</h3>
                  <p className="text-xs text-slate-500 font-bold">Venta en Oficina o Retorno de Vendedor</p>
                </div>
              </div>
              <button onClick={() => setShowOfflineModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><XCircle className="w-6 h-6" /></button>
            </div>

            <div className="p-6">
              <form id="offlineSaleForm" className="space-y-6" onSubmit={submitOffline}>

                {/* Sección de Tickets */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <span className="bg-slate-200 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">1</span> Configuración del Número
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Sorteo Activo *</label>
                        <select value={data.sorteo_id} onChange={e => {
                            const sId = e.target.value;
                            const sorteoObj = sorteos.find(s => s.id == sId);
                            setData(d => ({ ...d, sorteo_id: sId, total: (d.cantidad * (sorteoObj?.precio_ticket || 0)) }));
                        }} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm bg-white" required>
                            <option value="">Seleccione Sorteo</option>
                            {sorteos.map(s => <option key={s.id} value={s.id}>{s.nombre} (S/ {s.precio_ticket})</option>)}
                        </select>
                        {errors.sorteo_id && <p className="text-red-500 text-xs mt-1">{errors.sorteo_id}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cantidad de Tickets *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={data.cantidad}
                        onChange={e => {
                            const qty = parseInt(e.target.value) || 1;
                            const sorteoObj = sorteos.find(s => s.id == data.sorteo_id);
                            setData(d => ({ ...d, cantidad: qty, total: qty * (sorteoObj?.precio_ticket || 0) }));
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none font-mono text-emerald-700 font-bold"
                      />
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">El sistema asignará aleatoriamente esta cantidad de números libres.</p>
                    </div>
                  </div>
                </div>

                {/* Sección Datos del Cliente */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <span className="bg-slate-200 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">2</span> Datos del Comprador Físico
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">DNI (Para validar premio) *</label>
                      <input type="text" required maxLength="8" value={data.dni} onChange={e => setData('dni', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                      {errors.dni && <span className="text-xs text-red-500">{errors.dni}</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nombres y Apellidos *</label>
                      <input type="text" required value={data.nombre} onChange={e => setData('nombre', e.target.value)} placeholder="Ej. Juan Pérez" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                      {errors.nombre && <span className="text-xs text-red-500">{errors.nombre}</span>}
                    </div>
                  </div>
                </div>

                {/* Sección Venta */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <span className="bg-slate-200 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">3</span> Detalles Internos de Venta
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Medio de Pago Físico *</label>
                      <select required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm bg-white">
                        <option value="oficina">Cobro en Efectivo (Caja Oficina)</option>
                        <option value="efectivo_vendedor">Efectivo (Entregado por Vendedor)</option>
                        <option value="yape_vendedor">Yape (Hacia el vendedor)</option>
                        <option value="plin_vendedor">Plin (Hacia el vendedor)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Importe Recibido Real (S/)</label>
                      <input type="number" step="0.01" required value={data.total} onChange={e => setData('total', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 focus:border-emerald-500 focus:outline-none text-sm font-black text-emerald-900" />
                      {errors.total && <span className="text-xs text-red-500">{errors.total}</span>}
                    </div>
                  </div>
                </div>

              </form>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setShowOfflineModal(false)} className="px-6 py-2.5 font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
              <button form="offlineSaleForm" disabled={offlineProcessing} type="submit" className="px-8 py-2.5 font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-transform transform hover:-translate-y-0.5 shadow-lg flex items-center gap-2 disabled:opacity-50">
                {offlineProcessing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><CheckCircle className="w-5 h-5" /> Finalizar Registro</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exportación de Talonarios CON VISTA PREVIA DEL TICKET */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-800 flex justify-between items-center text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3"></div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg"><Upload className="w-6 h-6 text-emerald-400" /></div>
                <div>
                  <h3 className="font-black text-xl">Exportar Talonario Físico</h3>
                  <p className="text-xs text-slate-300 font-medium">Extraer números libres para impresión</p>
                </div>
              </div>
              <button onClick={() => setExportModalOpen(false)} className="relative z-10 text-slate-400 hover:text-white transition-colors p-1"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col lg:flex-row gap-8">
              {/* Left: Configuration Form */}
              <div className="flex-1 space-y-6">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">
                    Al generar el talonario, los números libres seleccionados cambiarán a estado <span className="font-bold text-purple-700">"Impreso / En Calle"</span> y ya no podrán ser comprados por internet.
                  </p>
                </div>

                <form id="exportForm" className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  setExportModalOpen(false);
                  alert("Generando PDF... Los números del rango seleccionado ahora figuran como 'Impresos' en el sistema.");
                }}>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">1. Rango de Tickets a Imprimir</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <span className="text-xs text-slate-500 font-bold uppercase mb-1 block">Desde el Nº</span>
                        <input type="number" required placeholder="0000" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-center font-mono font-bold text-lg" />
                      </div>
                      <span className="text-slate-300 font-black text-2xl mt-4">-</span>
                      <div className="flex-1">
                        <span className="text-xs text-slate-500 font-bold uppercase mb-1 block">Hasta el Nº</span>
                        <input type="number" required placeholder="0100" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-center font-mono font-bold text-lg" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">2. Formato de Exportación</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="border-2 border-emerald-500 bg-emerald-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                        <input type="radio" name="exportFormat" value="pdf" className="sr-only" defaultChecked />
                        <FileText className="w-8 h-8 text-emerald-600 mb-2" />
                        <span className="font-bold text-emerald-800 text-sm">PDF (Imprenta)</span>
                        <span className="text-[10px] text-emerald-600/70 text-center mt-1">Con código QR</span>
                      </label>
                      <label className="border-2 border-slate-200 hover:border-emerald-300 bg-white rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all opacity-60 hover:opacity-100">
                        <input type="radio" name="exportFormat" value="excel" className="sr-only" />
                        <LineChart className="w-8 h-8 text-slate-500 mb-2" />
                        <span className="font-bold text-slate-700 text-sm">Excel / CSV</span>
                        <span className="text-[10px] text-slate-500 text-center mt-1">Lista de datos crudos</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">3. Asignar Lote a Vendedor (Opcional)</label>
                    <input type="text" placeholder="Ej: Vendedor Centro - Juan" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                    <p className="text-xs text-slate-400 mt-1">Permite saber a quién le entregaste físicamente estos números.</p>
                  </div>

                </form>
              </div>

              {/* Right: Ticket Design Preview */}
              <div className="flex-1 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600" /> Vista Previa del Diseño a Imprimir
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-center min-h-[300px] overflow-hidden">

                  {/* THE PHYSICAL TICKET UI */}
                  <div className="bg-white border-2 border-slate-300 w-full max-w-md rounded-lg shadow-sm flex flex-row overflow-hidden relative">
                    {/* Talón (Stub) */}
                    <div className="w-1/3 border-r-2 border-dashed border-slate-300 p-3 flex flex-col justify-between relative bg-slate-50">
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase text-center mb-2">Talón Vendedor</p>
                        <p className="text-xs font-black text-slate-900 text-center mb-2 border-b border-slate-200 pb-1">Nº 0045</p>
                        <div className="space-y-2 mt-2">
                          <div className="border-b border-slate-300 pb-0.5"><p className="text-[7px] text-slate-400">Nombre:</p></div>
                          <div className="border-b border-slate-300 pb-0.5"><p className="text-[7px] text-slate-400">DNI:</p></div>
                          <div className="border-b border-slate-300 pb-0.5"><p className="text-[7px] text-slate-400">Celular:</p></div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-[6px] text-slate-400 text-center">Firma/Sello</p>
                      </div>
                      <Scissors className="w-3 h-3 text-slate-300 absolute -right-[7px] top-1/2 -translate-y-1/2 bg-white" />
                    </div>

                    {/* Main Ticket */}
                    <div className="w-2/3 p-4 flex flex-col relative overflow-hidden">
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <Sprout className="w-32 h-32 text-emerald-900" />
                      </div>

                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="flex items-center gap-1">
                          <div className="bg-amber-400 p-1 rounded">
                            <Sprout className="w-3 h-3 text-emerald-900" />
                          </div>
                          <span className="text-[10px] font-black italic uppercase text-slate-900 leading-none">Sorteos<br /><span className="text-emerald-600">Finagro</span></span>
                        </div>
                        <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                          S/ 40.00
                        </div>
                      </div>

                      <div className="text-center my-auto relative z-10">
                        <h4 className="text-sm font-black text-slate-900 uppercase leading-tight">Gran Sorteo 28 Feb</h4>
                        <p className="text-[9px] text-emerald-700 font-bold mt-0.5">214 Grandes Premios</p>
                        <p className="text-2xl font-black font-mono text-slate-800 tracking-widest mt-2 border-y-2 border-slate-100 py-1">Nº 0045</p>
                      </div>

                      <div className="flex items-end justify-between mt-3 relative z-10">
                        <div>
                          <p className="text-[7px] text-slate-500 font-bold mb-0.5">Transmisión en vivo por:</p>
                          <p className="text-[8px] font-black text-blue-600 flex items-center gap-0.5"><Facebook className="w-2.5 h-2.5" /> SorteosFinagroOficial</p>
                        </div>
                        <div className="bg-white p-0.5 border border-slate-200 rounded">
                          <QrCode className="w-8 h-8 text-slate-800" />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                <p className="text-xs text-slate-500 text-center mt-3">El diseño final del PDF incluirá una hoja A4 con 10 tickets listos para recortar por la línea punteada.</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setExportModalOpen(false)} className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
              <button form="exportForm" type="submit" className="px-8 py-2.5 font-black text-white bg-slate-900 hover:bg-black rounded-xl transition-transform transform hover:-translate-y-0.5 shadow-lg flex items-center gap-2">
                <Upload className="w-4 h-4" /> Exportar y Bloquear Lote
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
