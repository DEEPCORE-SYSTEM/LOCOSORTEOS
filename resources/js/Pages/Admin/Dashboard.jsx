import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { BanknoteIcon, TicketIcon, ClockAlertIcon, CheckCircle2Icon, TrophyIcon, PlusIcon, ChevronRightIcon } from 'lucide-react';

export default function Dashboard({ 
  stats, 
  ventasSemana, 
  rendimientoSorteos, 
  transacciones, 
  origenPagos,
  topDepartamentos 
}) {
  const dashboardStats = [
    {
      title: 'RECAUDACIÓN TOTAL',
      value: `S/ ${stats.revenue.total}`,
      subtitle: stats.revenue.subtitle,
      icon: <BanknoteIcon className="w-5 h-5 text-emerald-500" />,
      iconBg: 'bg-emerald-50',
      subtitleClass: 'text-emerald-500'
    },
    {
      title: 'TICKETS VENDIDOS',
      value: stats.tickets.total,
      subtitle: stats.tickets.subtitle,
      icon: <TicketIcon className="w-5 h-5 text-emerald-500" />,
      iconBg: 'bg-emerald-50',
      subtitleClass: 'text-emerald-500'
    },
    {
      title: 'PAGOS PENDIENTES',
      value: stats.pending.toString(),
      subtitle: 'Requieren validación',
      icon: <ClockAlertIcon className="w-5 h-5 text-red-500" />,
      iconBg: 'bg-red-50',
      subtitleClass: 'text-slate-400',
    },
    {
      title: 'SORTEOS ACTIVOS',
      value: stats.activeDraws.toString(),
      subtitle: 'En curso',
      icon: <TrophyIcon className="w-5 h-5 text-amber-500" />,
      iconBg: 'bg-amber-50',
      subtitleClass: 'text-slate-400'
    },
  ];

  // Helper function to figure out the max tickets for scaling the bar chart nicely
  const maxWeeklyTickets = Math.max(...ventasSemana.map(v => v.tickets), 1);

  return (
    <AdminLayout currentView="admin-dashboard" pendingTicketsCount={stats.pending}>
      <Head title="Panel de Administración | Sorteos Campoagro" />

      {/* Título de la sección */}
      <h1 className="text-2xl font-black text-slate-900 mb-6 font-['Nunito',sans-serif]">Resumen del Sistema</h1>

      {/* 4 Tarjetas de Estadísticas Top */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {dashboardStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.title}</p>
              <div className={`${stat.iconBg} p-1.5 rounded-lg`}>{stat.icon}</div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight font-['Nunito',sans-serif]">
                {stat.value}
              </p>
              <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${stat.subtitleClass}`}>
                {/* Flecha solo para los de subida */}
                {stat.subtitleClass === 'text-emerald-500' && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                )}
                {stat.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfico de Ventas de la Semana */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-black text-slate-800 text-base font-['Nunito',sans-serif]">Ventas de la Semana</h3>
              <p className="text-xs text-slate-400 font-medium">Tickets vendidos en los últimos 7 días</p>
            </div>
            <select className="bg-slate-50 border-none text-slate-600 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer outline-none focus:ring-0">
              <option>Esta semana</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end gap-2 sm:gap-6 h-48 border-b border-slate-100 pb-2 relative mt-4">
            {/* Líneas horizontales fondo */}
            <div className="absolute w-full border-t border-slate-100 bottom-1/2" />
            
            {ventasSemana.map((dia, i) => {
              const heightPct = maxWeeklyTickets > 0 ? (dia.tickets / maxWeeklyTickets) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 relative z-10 h-full justify-end group">
                  <div
                    className="w-full max-w-[32px] bg-emerald-100 group-hover:bg-emerald-200 rounded-t-lg relative cursor-pointer transition-colors duration-300 flex items-end justify-center pb-2"
                    style={{ height: `${Math.max(10, heightPct)}%` }} // min 10% para q se vea la barra
                  >
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 group-hover:text-slate-600 transition-colors">{dia.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rendimiento por Sorteo */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="font-black text-slate-800 text-base font-['Nunito',sans-serif] mb-6">Rendimiento por Sorteo</h3>
          
          <div className="flex-1 space-y-6">
            {rendimientoSorteos.map(sorteo => (
              <div key={sorteo.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{sorteo.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">Precio: S/ {Number(sorteo.price).toFixed(2)} c/u</p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${sorteo.status === 'Activo' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {sorteo.status}
                  </span>
                </div>
                
                <div className="flex justify-between mb-1 mt-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AVANCE TICKETS</span>
                  <span className="text-[10px] font-black text-emerald-600">{sorteo.progress}%</span>
                </div>
                
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(sorteo.progress, 100)}%` }}></div>
                </div>
                
                <div className="flex justify-between text-xs">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">TICKETS</p>
                    <p className="font-bold text-slate-800">{sorteo.sold} / {sorteo.total_tickets}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">RECAUDADO</p>
                    <p className="font-bold text-slate-800">S/ {formatCurrency(sorteo.revenue)}</p>
                  </div>
                </div>
              </div>
            ))}

            {rendimientoSorteos.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No hay sorteos activos en este momento.</p>
            )}
          </div>
          
          {/* Botón lanzar nueva campaña */}
          <Link href="/admin/sorteos/crear" className="mt-6 flex items-center justify-center gap-1.5 text-emerald-600 font-black text-xs uppercase tracking-widest hover:text-emerald-700 transition-colors pt-4 border-t border-slate-50">
            <PlusIcon className="w-4 h-4" /> Lanzar nueva campaña
          </Link>
        </div>
      </div>

      {/* Bloque inferior: Transacciones y Pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Transacciones Recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 text-base font-['Nunito',sans-serif]">Transacciones Recientes</h3>
            <Link href="/admin/tickets" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center hover:underline">
              Ver todas <ChevronRightIcon className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {transacciones.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  {/* Icono estado */}
                  {tx.status === 'Aprobado' ? (
                     <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                       <CheckCircle2Icon className="w-4 h-4" />
                     </div>
                  ) : tx.status === 'Pendiente' ? (
                     <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                       <ClockAlertIcon className="w-4 h-4" />
                     </div>
                  ) : (
                     <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                       <ClockAlertIcon className="w-4 h-4" />
                     </div>
                  )}
                  
                  <div>
                    <p className="font-bold text-slate-800 text-sm leading-tight">{tx.user_name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {tx.status === 'Aprobado' ? 'Pago validado y tickets generados' : `Envio comprobante por ${tx.method.toUpperCase()}`}
                    </p>
                  </div>
                </div>
                
                <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  {tx.status === 'Aprobado' ? tx.time_ago : tx.date}
                </div>
                
                <div className="flex items-center gap-6 text-right shrink-0 min-w[140px] justify-end">
                  <span className="font-black text-slate-800 text-sm">+ S/ {Number(tx.amount).toFixed(2)}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest w-20 text-center ${
                    tx.status === 'Aprobado' ? 'bg-emerald-50 text-emerald-600' : 
                    tx.status === 'Pendiente' ? 'bg-amber-50 text-amber-600' : 
                    'bg-red-50 text-red-600'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Origen de Pagos y Top Departamentos */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="font-black text-slate-800 text-base font-['Nunito',sans-serif] mb-6">Origen de Pagos</h3>
          
          <div className="space-y-4 mb-8">
            {/* Array de mapeo para pintar rápido */}
            {[
              { id: 'yape', label: 'YAPE', bg: 'bg-[#742284]/10', color: 'text-[#742284]', initial: 'Y' },
              { id: 'plin', label: 'PLIN', bg: 'bg-[#00E0C6]/10', color: 'text-[#0A2240]', initial: 'P' },
              { id: 'transferencia', label: 'Transf.', bg: 'bg-slate-100', color: 'text-slate-500', initial: '⮂' },
            ].map(method => (
              <div key={method.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${method.bg} ${method.color} flex items-center justify-center font-black text-xs`}>
                    {method.initial}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{method.label}</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 text-sm">S/ {formatCurrency(origenPagos[method.id]?.amount ?? 0)}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{origenPagos[method.id]?.pct ?? 0}% DEL TOTAL</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t border-slate-100 mt-auto">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">TOP DEPARTAMENTOS (VENTAS)</h4>
            
            <div className="space-y-4">
              {topDepartamentos.map((depto, idx) => {
                const max = Math.max(...topDepartamentos.map(d => d.total));
                const pct = max > 0 ? (depto.total / max) * 100 : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-700">{depto.departamento}</span>
                      <span className="font-bold text-emerald-600">{depto.total} tickets</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1">
                      <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>

      </div>
    </AdminLayout>
  );
}

// Formatea un número como moneda (ej: 1234 → '1,234')
function formatCurrency(number) {
    if (!number) return '0';
    return Number(number).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}
