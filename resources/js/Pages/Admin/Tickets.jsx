import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Ticket, Search, CheckCircle, FileText, Loader2, Edit, Trash2 } from 'lucide-react';
import ValidarPagos from './Tickets/ValidarPagos';
import HistorialTickets from './Tickets/HistorialTickets';
import Talonario from './Tickets/Talonario';

export default function Tickets({ comprasPaginated, pendientesPaginated, sorteos = [], ticketsData = {}, filters = {} }) {
  const { flash } = usePage().props;
  
  // URL params state
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [activeTab, setActiveTab] = useState(params.get('tab') || 'admin-tickets'); 
  const [searchQuery, setSearchQuery] = useState(params.get('search') || '');
  const [perPage, setPerPage] = useState(filters.perPage || 25);
  
  // Talonario State
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
    // Re-fetch logic or just rely on reactivity if using websockets
    // Inertia partial reload is possible but might be heavy. For now, offlinePage changes re-render local computations
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

  // CRUD Actions for History
  const [showEditModal, setShowEditModal] = useState(false);
  const [compraToEdit, setCompraToEdit] = useState(null);

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
  );
}
