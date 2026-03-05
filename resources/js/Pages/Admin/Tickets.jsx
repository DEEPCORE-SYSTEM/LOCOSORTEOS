import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Ticket, Search, CheckCircle, FileText, Loader2, Edit, Trash2, Upload, X, AlertTriangle, Eye, Scissors, Sprout } from 'lucide-react';
import ValidarPagos from './Tickets/ValidarPagos';
import HistorialTickets from './Tickets/HistorialTickets';
import Talonario from './Tickets/Talonario';

export default function Tickets({ comprasPaginated, pendientesPaginated, sorteos = [], ticketsData = {}, filters = {} }) {
  const { flash } = usePage().props;
  
  
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [activeTab, setActiveTab] = useState(params.get('tab') || 'admin-tickets'); 
  const [searchQuery, setSearchQuery] = useState(params.get('search') || '');
  const [perPage, setPerPage] = useState(filters.perPage || 25);
  
  
  const [offlineSorteoId, setOfflineSorteoId] = useState(sorteos.length > 0 ? sorteos[0].id : null);
  const [offlinePage, setOfflinePage] = useState(1);
  const ticketsPerPage = 120;
  
  const activeSorteo = sorteos.find(s => s.id === offlineSorteoId) || sorteos[0] || null;
  const maxTickets = activeSorteo ? activeSorteo.cantidad_tickets : 0;
  const currentTicketsData = activeSorteo ? (ticketsData[activeSorteo.id] || {}) : {};
  
  const countVendidos = Object.values(currentTicketsData).filter(s => s === 'vendido').length;
  const countImpresos = Object.values(currentTicketsData).filter(s => s === 'impreso').length;
  const countReservados = Object.values(currentTicketsData).filter(s => s === 'reservado').length;
  const countLibres = maxTickets - countVendidos - countImpresos - countReservados;
  
  const totalPages = Math.ceil(maxTickets / ticketsPerPage) || 1;
  const startTicket = (offlinePage - 1) * ticketsPerPage;
  const endTicket = Math.min(startTicket + ticketsPerPage - 1, maxTickets - 1);

  const fetchTicketsPage = (page) => {
    
    
    setOfflinePage(page);
  };

  const handlePerPageChange = (e) => {
    const val = e.target.value;
    setPerPage(val);
    router.get('/admin/tickets', { search: searchQuery, perPage: val, tab: activeTab }, { preserveState: true, replace: true });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentSearch = params.get('search') || '';
      if (searchQuery !== currentSearch) {
          router.get('/admin/tickets', {
            search: searchQuery,
            perPage: perPage,
            tab: activeTab
          }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
          });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab]);

  
  const [showEditModal, setShowEditModal] = useState(false);
  const [compraToEdit, setCompraToEdit] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportDesde, setExportDesde] = useState('');
  const [exportHasta, setExportHasta] = useState('');

  const handleEditCompra = (compra) => {
    setCompraToEdit(compra);
    setShowEditModal(true);
  };

  const submitEditCompra = (e) => {
    e.preventDefault();
    router.put(`/admin/compras/${compraToEdit.id}`, compraToEdit, {
      preserveScroll: true,
      onSuccess: () => setShowEditModal(false)
    });
  };

  const handleDeleteCompra = (compra) => {
     if(confirm(`¿Estás seguro de anular la COMPRA-${compra.id}? Sus tickets volverán a estar libres.`)) {
         router.delete(`/admin/compras/${compra.id}`, { preserveScroll: true });
     }
  };

  return (
    <>
    <AdminLayout>
      <Head title="Gestión de Tickets" />

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Gestión de Tickets y Talonarios
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Valida pagos online, revisa el historial de ventas o asigna tickets para venta física en calle.
            </p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex space-x-2 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('admin-tickets');
              router.get('/admin/tickets', { tab: 'admin-tickets' }, { preserveState: true, replace: true });
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'admin-tickets'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Validar Pagos Pendientes
            {pendientesPaginated?.total > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm animate-pulse ml-1">
                {pendientesPaginated.total}
              </span>
            )}
          </button>
          
          <button
            onClick={() => {
              setActiveTab('admin-lista-tickets');
              router.get('/admin/tickets', { tab: 'admin-lista-tickets' }, { preserveState: true, replace: true });
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'admin-lista-tickets'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Search className="w-4 h-4" />
            Historial de Vendidos
          </button>

          <button
            onClick={() => {
              setActiveTab('admin-talonario');
              router.get('/admin/tickets', { tab: 'admin-talonario' }, { preserveState: true, replace: true });
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'admin-talonario'
                ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Ticket className="w-4 h-4" />
            Ventas Offline (Talonario)
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'admin-tickets' && (
           <ValidarPagos 
              pendientesPaginated={pendientesPaginated} 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              perPage={perPage}
              handlePerPageChange={handlePerPageChange}
           />
        )}

        {activeTab === 'admin-lista-tickets' && (
           <HistorialTickets 
              comprasPaginated={comprasPaginated}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              perPage={perPage}
              handlePerPageChange={handlePerPageChange}
              onEditCompra={handleEditCompra}
              onDeleteCompra={handleDeleteCompra}
           />
        )}

        {activeTab === 'admin-talonario' && (
           <Talonario 
              sorteos={sorteos}
              offlineSorteoId={offlineSorteoId}
              setOfflineSorteoId={setOfflineSorteoId}
              offlinePage={offlinePage}
              setOfflinePage={setOfflinePage}
              maxTickets={maxTickets}
              totalPages={totalPages}
              startTicket={startTicket}
              endTicket={endTicket}
              currentTicketsData={currentTicketsData}
              countVendidos={countVendidos}
              countImpresos={countImpresos}
              countReservados={countReservados}
              countLibres={countLibres}
              fetchTicketsPage={fetchTicketsPage}
              activeSorteo={activeSorteo}
              setExportModalOpen={setExportModalOpen}
           />
        )}
      </div>

      {/* Modal Reutilizable de Edición de Compra */}
      {showEditModal && compraToEdit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Edit className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-lg text-slate-900">Editar Venta COMPRA-{compraToEdit.id}</h3>
              </div>
            </div>
            <form onSubmit={submitEditCompra} id="editCompraForm" className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Cliente</label>
                <input 
                  type="text" 
                  required
                  value={compraToEdit.user || ''} 
                  onChange={(e) => setCompraToEdit({...compraToEdit, user: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none bg-white text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">DNI</label>
                    <input 
                      type="text" 
                      required
                      maxLength="8"
                      value={compraToEdit.user_dni || ''} 
                      onChange={(e) => setCompraToEdit({...compraToEdit, user_dni: e.target.value})} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none bg-white text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Método Pago</label>
                    <select 
                      value={compraToEdit.metodo_pago || ''} 
                      onChange={(e) => setCompraToEdit({...compraToEdit, metodo_pago: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none bg-white text-sm"
                    >
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="YAPE">Yape</option>
                        <option value="PLIN">Plin</option>
                        <option value="IZIPAY">Izipay</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                  </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Número(s) de Tickets (Lectura)</label>
                <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-sm font-mono text-slate-500 break-words">
                  {compraToEdit.detalles?.tickets ? compraToEdit.detalles.tickets.join(', ') : 'Ninguno'}
                </div>
                <p className="text-[10px] text-red-500 font-bold mt-1">Para cambiar los números, debe anular la compra y registrar una nueva.</p>
              </div>
            </form>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setShowEditModal(false)} className="px-5 py-2 font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
              <button form="editCompraForm" type="submit" className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>

      {/* Export Talonario Modal — rendered OUTSIDE AdminLayout to escape overflow-y-auto */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[95vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-800 flex justify-between items-center text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3"></div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg"><Upload className="w-6 h-6 text-emerald-400" /></div>
                <div>
                  <h3 className="font-black text-xl">Exportar Talonario Físico</h3>
                </div>
              </div>
              <button onClick={() => setExportModalOpen(false)} className="relative z-10 text-slate-400 hover:text-white transition-colors p-1"><X className="w-6 h-6" /></button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex flex-col lg:flex-row gap-8">
              {/* Left: Configuration Form */}
              <div className="flex-1 space-y-6">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">
                    Al generar el talonario, los números libres seleccionados cambiarán a estado{' '}
                    <span className="font-bold text-purple-700">"Impreso / En Calle"</span> y ya no podrán ser comprados por internet.
                  </p>
                </div>

                <form id="exportForm" className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  setExportModalOpen(false);
                  alert("Generando PDF... Los números del rango seleccionado ahora figuran como 'Impresos' en el sistema.");
                }}>
                  {/* 1. Rango */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">1. Rango de Tickets a Imprimir</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <span className="text-xs text-slate-500 font-bold uppercase mb-1 block">Desde el Nº</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          maxLength="6"
                          placeholder="0000"
                          value={exportDesde}
                          onInput={(e) => setExportDesde(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-center font-mono font-bold text-lg [appearance:textfield]"
                        />
                      </div>
                      <span className="text-slate-300 font-black text-2xl mt-5">-</span>
                      <div className="flex-1">
                        <span className="text-xs text-slate-500 font-bold uppercase mb-1 block">Hasta el Nº</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          maxLength="6"
                          placeholder="0100"
                          value={exportHasta}
                          onInput={(e) => setExportHasta(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-center font-mono font-bold text-lg [appearance:textfield]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Formato */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">2. Formato de Exportación</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="border-2 border-emerald-500 bg-emerald-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer">
                        <input type="radio" name="exportFormat" value="pdf" className="sr-only" defaultChecked />
                        <FileText className="w-8 h-8 text-emerald-600 mb-2" />
                        <span className="font-bold text-emerald-800 text-sm">PDF (Imprenta)</span>
                      </label>
                      <label className="border-2 border-slate-200 hover:border-emerald-300 bg-white rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer opacity-60 hover:opacity-100">
                        <input type="radio" name="exportFormat" value="excel" className="sr-only" />
                        <Upload className="w-8 h-8 text-slate-500 mb-2" />
                        <span className="font-bold text-slate-700 text-sm">Excel / CSV</span>
                      </label>
                    </div>
                  </div>

                  {/* 3. Vendedor */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">3. Asignar Lote a Vendedor (Opcional)</label>
                    <input type="text" placeholder="Ej: Vendedor Centro - Juan"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                  </div>
                </form>
              </div>

              {/* Right: Ticket Design Preview */}
              <div className="flex-1 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600" /> Vista Previa del Diseño a Imprimir
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-center min-h-[260px] overflow-hidden">
                  <div className="bg-white border-2 border-slate-300 w-full max-w-md rounded-lg shadow-sm flex flex-row overflow-hidden relative">
                    {/* Stub */}
                    <div className="w-1/3 border-r-2 border-dashed border-slate-300 p-3 flex flex-col justify-between relative bg-slate-50">
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase text-center mb-2">Talón Vendedor</p>
                        <p className="text-xs font-black text-slate-900 text-center mb-2 border-b border-slate-200 pb-1">
                          Nº {exportDesde ? String(exportDesde).padStart(4, '0') : '0000'}
                        </p>
                        <div className="space-y-2 mt-2">
                          <div className="border-b border-slate-300 pb-0.5"><p className="text-[7px] text-slate-400">Nombre:</p></div>
                          <div className="border-b border-slate-300 pb-0.5"><p className="text-[7px] text-slate-400">DNI:</p></div>
                          <div className="border-b border-slate-300 pb-0.5"><p className="text-[7px] text-slate-400">Celular:</p></div>
                        </div>
                      </div>
                      <div className="mt-4"><p className="text-[6px] text-slate-400 text-center">Firma/Sello</p></div>
                      <Scissors className="w-3 h-3 text-slate-300 absolute -right-[7px] top-1/2 -translate-y-1/2 bg-white" />
                    </div>
                    {/* Main Ticket */}
                    <div className="w-2/3 p-4 flex flex-col relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <Sprout className="w-32 h-32 text-emerald-900" />
                      </div>
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="flex items-center gap-1">
                          <div className="bg-amber-400 p-1 rounded"><Sprout className="w-3 h-3 text-emerald-900" /></div>
                          <span className="text-[10px] font-black italic uppercase text-slate-900 leading-none">
                            Sorteos<br /><span className="text-emerald-600">CampoAgro</span>
                          </span>
                        </div>
                        <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                          S/ {parseFloat(activeSorteo?.precio_ticket || 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center my-auto relative z-10">
                        <h4 className="text-sm font-black text-slate-900 uppercase leading-tight">{activeSorteo?.nombre || 'Sorteo'}</h4>
                        {activeSorteo?.premios_descripcion && (
                          <p className="text-[9px] text-emerald-600 font-bold mt-0.5">{activeSorteo.premios_descripcion}</p>
                        )}
                        <p className="text-2xl font-black font-mono text-slate-800 tracking-widest mt-2 border-y-2 border-slate-100 py-1">
                          Nº {exportDesde ? String(exportDesde).padStart(4, '0') : '0000'}
                        </p>
                      </div>
                      <div className="flex items-end justify-between mt-3 relative z-10">
                        <div>
                          <p className="text-[7px] text-slate-500 font-bold mb-0.5">Transmisión en vivo por:</p>
                          <p className="text-[8px] font-black text-blue-600">SorteosCampoAgroOficial</p>
                        </div>
                        <div className="bg-white p-1 border border-slate-200 rounded">
                          <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                            <span className="text-[6px] font-black text-slate-600">QR</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setExportModalOpen(false)} className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
              <button form="exportForm" type="submit" className="px-8 py-2.5 font-black text-white bg-slate-900 hover:bg-black rounded-xl transition-transform transform hover:-translate-y-0.5 shadow-lg flex items-center gap-2">
                <Upload className="w-4 h-4" /> Exportar y Bloquear Lote
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
