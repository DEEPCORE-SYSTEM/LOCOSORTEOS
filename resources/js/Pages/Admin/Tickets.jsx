import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Ticket, Search, Upload, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function Tickets() {
  const [adminPendingTickets, setAdminPendingTickets] = useState([
    { id: 'TX-1001', user: 'Carlos Mendoza', dni: '72345678', qty: 2, total: 80, date: '21 Feb 2026 10:30 AM', status: 'pending', method: 'YAPE' },
    { id: 'TX-1002', user: 'Ana Silva', dni: '45678912', qty: 1, total: 40, date: '21 Feb 2026 10:15 AM', status: 'pending', method: 'PLIN' },
  ]);

  const allGeneratedTickets = [
    { number: '0045', txId: 'TX-0990', user: 'María Perez', dni: '74125896', draw: 'Gran Sorteo 28 de Febrero', status: 'Vendido', date: '21 Feb 2026 08:00 AM' },
    { number: '1023', txId: 'TX-0990', user: 'María Perez', dni: '74125896', draw: 'Gran Sorteo 28 de Febrero', status: 'Vendido', date: '21 Feb 2026 08:00 AM' },
    { number: '0888', txId: 'TX-0989', user: 'Pedro Gomez', dni: '15975346', draw: 'Gran Sorteo 28 de Febrero', status: 'Vendido', date: '20 Feb 2026 05:30 PM' },
  ];

  const handleApproveTicket = (id, qty) => {
    setAdminPendingTickets(adminPendingTickets.filter(t => t.id !== id));
    alert(`✅ Pago ${id} APROBADO.\nSe han generado y asignado automáticamente ${qty} tickets.`);
  };

  const handleRejectTicket = (id) => {
    setAdminPendingTickets(adminPendingTickets.filter(t => t.id !== id));
    alert(`❌ Pago ${id} RECHAZADO.`);
  };

  return (
    <AdminLayout currentView="admin-tickets" pendingTicketsCount={adminPendingTickets.length}>
      <Head title="Validación de Pagos | Admin Finagro" />

      <div className="space-y-6">
        {/* Botonera Tabs (Simulada) */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm">Validar Pagos Pendientes</button>
          <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors">Historial de Vendidos</button>
          <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors">Talonario (Offline)</button>
        </div>

        {/* Sección de Validación de Pagos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2 relative z-10">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Pagos por Validar <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{adminPendingTickets.length}</span>
            </h3>
            <p className="text-sm text-slate-500 font-medium relative z-10">Revisa la cuenta bancaria antes de aprobar. Una vez aprobado, el sistema generará y enviará los tickets al cliente vía WhatsApp/Email.</p>
          </div>
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors relative z-10">
            Exportar Pendientes CSV
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Transacción / Fecha</th>
                  <th className="p-4 font-bold">Cliente</th>
                  <th className="p-4 font-bold">Método / Monto</th>
                  <th className="p-4 font-bold">Reserva Web</th>
                  <th className="p-4 font-bold">Ver Voucher</th>
                  <th className="p-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {adminPendingTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold font-mono text-slate-700">{ticket.id}</p>
                      <p className="text-xs text-slate-400">{ticket.date}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-base">{ticket.user}</p>
                      <p className="text-xs text-slate-500">DNI: {ticket.dni}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-emerald-700 text-lg">S/ {ticket.total.toFixed(2)}</p>
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase mt-1 border border-slate-200">{ticket.method}</span>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      <span className="font-black text-slate-700 mx-1">{ticket.qty}</span> tickets reservados
                    </td>
                    <td className="p-4">
                      <button className="text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-colors">
                        📷 Ver Imagen
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleApproveTicket(ticket.id, ticket.qty)} className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg shadow-sm" title="Aprobar y Generar Tickets">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleRejectTicket(ticket.id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm" title="Rechazar Pago">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {adminPendingTickets.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 font-bold">
                      🎉 ¡Todo al día! No hay pagos pendientes por validar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla Rápida Historial */}
        <div className="mt-8">
           <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
             <Ticket className="w-5 h-5 text-slate-400" /> Últimos Tickets Generados
           </h3>
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-sm">
             <table className="w-full text-left">
               <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                 <tr>
                   <th className="p-3">N° Ticket</th>
                   <th className="p-3">Cliente</th>
                   <th className="p-3">Sorteo</th>
                   <th className="p-3">Estado</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {allGeneratedTickets.slice(0, 3).map((t, i) => (
                   <tr key={i} className="hover:bg-slate-50">
                     <td className="p-3 font-bold font-mono text-emerald-700">{t.number}</td>
                     <td className="p-3">{t.user}</td>
                     <td className="p-3 text-slate-500">{t.draw}</td>
                     <td className="p-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">{t.status}</span></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </AdminLayout>
  );
}
