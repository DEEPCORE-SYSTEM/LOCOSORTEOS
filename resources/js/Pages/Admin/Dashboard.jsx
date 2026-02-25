import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, Trophy, Ticket, CheckCircle, Clock, Banknote, LineChart } from 'lucide-react';

export default function Dashboard({ pendingTicketsCount = 0 }) {
  const dashboardStats = [
    {
      title: 'Recaudación Total',
      value: 'S/ 45,200',
      subtitle: '+12.5% esta semana',
      icon: <Banknote className="w-4 h-4 text-green-600" />,
      iconBg: 'bg-green-100',
      subtitleClass: 'text-emerald-600'
    },
    {
      title: 'Tickets Vendidos',
      value: '1,130',
      subtitle: '+84 hoy',
      icon: <Ticket className="w-4 h-4 text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      subtitleClass: 'text-emerald-600'
    },
    {
      title: 'Pagos Pendientes',
      value: pendingTicketsCount.toString(),
      subtitle: 'Requieren validación',
      icon: <Clock className="w-4 h-4 text-red-600" />,
      iconBg: 'bg-red-100',
      subtitleClass: 'text-slate-400',
      alert: pendingTicketsCount > 0
    },
    {
      title: 'Sorteos Activos',
      value: '2',
      subtitle: 'En curso',
      icon: <Trophy className="w-4 h-4 text-amber-600" />,
      iconBg: 'bg-amber-100',
      subtitleClass: 'text-slate-400'
    },
  ];

  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const barValues = [45, 60, 30, 85, 55, 100, 75];

  return (
    <AdminLayout currentView="admin-dashboard" pendingTicketsCount={pendingTicketsCount}>
      <Head title="Panel de Administración | Sorteos Finagro" />

      {/* 4 Tarjetas de Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {dashboardStats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
              <div className={`${stat.iconBg} p-1.5 rounded-lg`}>{stat.icon}</div>
            </div>
            <div>
              <p className={`text-3xl font-black ${stat.alert ? 'text-slate-900' : 'text-slate-900'}`}>
                {stat.value}
              </p>
              <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${stat.subtitleClass}`}>
                {stat.subtitleClass === 'text-emerald-600' && <LineChart className="w-3 h-3" />}
                {stat.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfico de Ventas de la Semana */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-lg text-slate-900">Ventas de la Semana</h3>
              <p className="text-sm text-slate-500">Tickets vendidos en los últimos 7 días</p>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-2 sm:gap-4 h-48 border-b border-slate-100 pb-2 relative">
            <div className="absolute w-full border-t border-slate-100 border-dashed bottom-1/2" />
            <div className="absolute w-full border-t border-slate-100 border-dashed top-0" />
            {barValues.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 relative z-10 h-full justify-end">
                <div
                  className="w-full max-w-[40px] bg-emerald-100 rounded-t-md relative group cursor-pointer transition-all duration-500"
                  style={{ height: `${val}%` }}
                >
                  <div className="absolute inset-0 bg-emerald-500 rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {val * 2} Tickets
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel lateral: próximo sorteo y accesos rápidos */}
        <div className="space-y-6">
          <div className="bg-[#064E3B] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                </span>
                <p className="font-bold text-emerald-200 text-sm tracking-widest uppercase">Próximo Sorteo</p>
              </div>
              <h3 className="text-3xl font-black mb-1 text-white tracking-tight leading-none">28 de Feb</h3>
              <p className="text-emerald-100 font-medium mb-6 text-sm">214 Premios a repartir</p>
              <Link
                href="/admin/ejecucion"
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform transform hover:-translate-y-1"
              >
                Ejecutar Sorteo Ahora
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-900 mb-4 text-lg">Pagos Pendientes</h3>
            {pendingTicketsCount > 0 ? (
              <div className="space-y-3">
                {[...Array(Math.min(pendingTicketsCount, 3))].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-tight">Pago pendiente</p>
                        <p className="text-xs text-slate-500 font-medium">Requiere validación</p>
                      </div>
                    </div>
                    <Link href="/admin/tickets" className="text-emerald-600 font-bold text-xs hover:underline">Ver</Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-slate-500 font-bold text-sm">¡Todo al día!</p>
                <p className="text-slate-400 text-xs">No hay pagos por validar</p>
              </div>
            )}
            <Link
              href="/admin/tickets"
              className="mt-4 block w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm py-2.5 rounded-xl transition-colors border border-slate-200"
            >
              Ver todos los pagos
            </Link>
          </div>
        </div>
      </div>

      {/* Origen de Pagos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-black text-lg text-slate-900 mb-5">Origen de Pagos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'YAPE', letter: 'Y', color: 'bg-[#742284]/10 text-[#742284]', amount: 'S/ 28,024', pct: '62%', bar: 'bg-[#742284]', width: '62%' },
            { label: 'PLIN', letter: 'P', color: 'bg-[#00E0C6]/10 text-[#0A2240]', amount: 'S/ 14,012', pct: '31%', bar: 'bg-[#00B4D8]', width: '31%' },
            { label: 'Transferencia', letter: 'T', color: 'bg-slate-100 text-slate-500', amount: 'S/ 3,164', pct: '7%', bar: 'bg-slate-400', width: '7%' },
          ].map(p => (
            <div key={p.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${p.color} flex items-center justify-center font-black text-xs`}>{p.letter}</div>
                <span className="font-bold text-slate-700 text-sm">{p.label}</span>
              </div>
              <div className="text-right">
                <p className="font-black text-slate-900 text-sm">{p.amount}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{p.pct} del total</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
