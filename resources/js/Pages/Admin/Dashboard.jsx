import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
  BanknoteIcon, TicketIcon, ClockAlertIcon, CheckCircle2Icon,
  TrophyIcon, PlusIcon, ChevronRightIcon, TrendingUpIcon,
  UsersIcon, PercentIcon, CalendarIcon, ZapIcon, ArrowUpIcon
} from 'lucide-react';

export default function Dashboard({
  stats,
  ventasSemana,
  rendimientoSorteos,
  transacciones,
  origenPagos,
  topDepartamentos
}) {
  // KPIs principales
  const mainStats = [
    {
      title: 'Recaudación Total',
      value: `S/ ${stats.revenue.total}`,
      subtitle: stats.revenue.subtitle,
      icon: <BanknoteIcon className="w-7 h-7 text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      valueColor: 'text-emerald-700',
      border: 'border-l-emerald-500',
    },
    {
      title: 'Tickets Vendidos',
      value: stats.tickets.total,
      subtitle: stats.tickets.subtitle,
      icon: <TicketIcon className="w-7 h-7 text-blue-600" />,
      iconBg: 'bg-blue-100',
      valueColor: 'text-blue-700',
      border: 'border-l-blue-500',
    },
    {
      title: 'Pagos Pendientes',
      value: stats.pending.toString(),
      subtitle: 'Requieren validación',
      icon: <ClockAlertIcon className="w-7 h-7 text-red-600" />,
      iconBg: 'bg-red-100',
      valueColor: 'text-red-700',
      border: 'border-l-red-500',
    },
    {
      title: 'Sorteos Activos',
      value: stats.activeDraws.toString(),
      subtitle: 'En curso',
      icon: <TrophyIcon className="w-7 h-7 text-amber-600" />,
      iconBg: 'bg-amber-100',
      valueColor: 'text-amber-700',
      border: 'border-l-amber-500',
    },
  ];

  // KPIs secundarios calculados
  const totalTicketsDisponibles = rendimientoSorteos.reduce((a, s) => a + (s.total_tickets || 0), 0);
  const totalVendidos = rendimientoSorteos.reduce((a, s) => a + (s.sold || 0), 0);
  const tasaLlenado = totalTicketsDisponibles > 0 ? Math.round((totalVendidos / totalTicketsDisponibles) * 100) : 0;
  const ticketsHoy = ventasSemana.length > 0 ? ventasSemana[ventasSemana.length - 1]?.tickets ?? 0 : 0;
  const revenueNum = parseFloat(String(stats.revenue.total).replace(/,/g, '')) || 0;
  const ticketsNum = parseInt(stats.tickets.total) || 1;
  const promedioPorTicket = revenueNum > 0 ? (revenueNum / ticketsNum).toFixed(2) : '0.00';
  const totalVentasSemana = ventasSemana.reduce((a, d) => a + d.tickets, 0);

  const secondaryStats = [
    {
      title: 'Tickets Hoy',
      value: ticketsHoy,
      subtitle: 'Vendidos este día',
      icon: <CalendarIcon className="w-6 h-6 text-indigo-600" />,
      iconBg: 'bg-indigo-100',
      valueColor: 'text-indigo-700',
    },
    {
      title: 'Ventas esta Semana',
      value: totalVentasSemana,
      subtitle: 'Últimos 7 días',
      icon: <TrendingUpIcon className="w-6 h-6 text-cyan-600" />,
      iconBg: 'bg-cyan-100',
      valueColor: 'text-cyan-700',
    },
    {
      title: 'Tasa de Llenado',
      value: `${tasaLlenado}%`,
      subtitle: `${totalVendidos} de ${totalTicketsDisponibles} tickets`,
      icon: <PercentIcon className="w-6 h-6 text-violet-600" />,
      iconBg: 'bg-violet-100',
      valueColor: 'text-violet-700',
    },
    {
      title: 'Ingreso por Ticket',
      value: `S/ ${promedioPorTicket}`,
      subtitle: 'Promedio general',
      icon: <ZapIcon className="w-6 h-6 text-orange-600" />,
      iconBg: 'bg-orange-100',
      valueColor: 'text-orange-700',
    },
  ];

  const maxWeeklyTickets = Math.max(...ventasSemana.map(v => v.tickets), 1);

  // Datos del donut de pagos
  const yapeAmt = origenPagos?.yape?.amount ?? 0;
  const plinAmt = origenPagos?.plin?.amount ?? 0;
  const transAmt = origenPagos?.transferencia?.amount ?? 0;
  const totalPagos = yapeAmt + plinAmt + transAmt || 1;
  const yapePct = Math.round((yapeAmt / totalPagos) * 100);
  const plinPct = Math.round((plinAmt / totalPagos) * 100);
  const transPct = 100 - yapePct - plinPct;

  return (
    <AdminLayout currentView="admin-dashboard" pendingTicketsCount={stats.pending}>
      <Head title="Panel de Administración | Sorteos Campoagro" />

      <h1 className="text-3xl font-black text-slate-800 mb-6">Dashboard.</h1>

      {/* ── FILA 1: KPIs Principales ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {mainStats.map((stat, idx) => (
          <div key={idx} className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4 ${stat.border} flex flex-col gap-3`}>
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide leading-tight">{stat.title}</p>
              <div className={`${stat.iconBg} p-2 rounded-xl`}>{stat.icon}</div>
            </div>
            <div>
              <p className={`text-3xl font-black tracking-tight ${stat.valueColor}`}>{stat.value}</p>
              <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1">
                <ArrowUpIcon className="w-3 h-3" />{stat.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILA 2: KPIs Secundarios ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {secondaryStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`${stat.iconBg} p-3 rounded-xl shrink-0`}>{stat.icon}</div>
            <div>
              <p className={`text-2xl font-black ${stat.valueColor}`}>{stat.value}</p>
              <p className="text-xs font-bold text-slate-500 leading-tight">{stat.title}</p>
              <p className="text-[11px] text-slate-400">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILA 3: Gráficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Gráfico de barras — Ventas Semana */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="mb-5">
            <h3 className="font-black text-slate-800 text-lg">Ventas de la Semana</h3>
            <p className="text-sm text-slate-400 mt-0.5">Tickets vendidos en los últimos 7 días</p>
          </div>
          <div className="flex items-end gap-3 h-48 border-b-2 border-slate-100 pb-2 relative">
            <div className="absolute w-full border-t border-dashed border-slate-100 bottom-1/2" />
            <div className="absolute w-full border-t border-dashed border-slate-50 bottom-3/4" />
            {ventasSemana.map((dia, i) => {
              const heightPct = (dia.tickets / maxWeeklyTickets) * 100;
              const isToday = i === ventasSemana.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative z-10">
                  <span className="text-xs font-black text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-50 px-2 py-0.5 rounded-lg absolute -top-6">{dia.tickets}</span>
                  <div
                    className={`w-full rounded-t-xl transition-colors duration-300 ${isToday ? 'bg-emerald-500 group-hover:bg-emerald-600' : 'bg-emerald-200 group-hover:bg-emerald-400'}`}
                    style={{ height: `${Math.max(6, heightPct)}%` }}
                  />
                  <span className={`text-xs font-bold ${isToday ? 'text-emerald-600' : 'text-slate-400'}`}>{dia.day}</span>
                </div>
              );
            })}
          </div>
          {/* Leyenda */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 text-xs text-slate-500"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span> Hoy</div>
            <div className="flex items-center gap-2 text-xs text-slate-500"><span className="w-3 h-3 rounded-sm bg-emerald-200 inline-block"></span> Días anteriores</div>
          </div>
        </div>

        {/* Donut de Métodos de Pago */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="font-black text-slate-800 text-lg mb-2">Métodos de Pago</h3>
          <p className="text-sm text-slate-400 mb-5">Distribución por canal</p>

          {/* Gráfico Donut CSS */}
          <div className="flex justify-center mb-5">
            <div
              className="w-36 h-36 rounded-full relative"
              style={{
                background: `conic-gradient(
                  #7e22ce ${yapePct}%,
                  #0d9488 ${yapePct}% ${yapePct + plinPct}%,
                  #94a3b8 ${yapePct + plinPct}% 100%
                )`
              }}
            >
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-500">Total</span>
                <span className="text-sm font-black text-slate-800">S/ {formatCurrency(yapeAmt + plinAmt + transAmt)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'YAPE', pct: yapePct, amount: yapeAmt, color: 'bg-purple-600' },
              { label: 'PLIN', pct: plinPct, amount: plinAmt, color: 'bg-teal-500' },
              { label: 'Transferencia', pct: transPct, amount: transAmt, color: 'bg-slate-400' },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${m.color} inline-block`}></span>
                  <span className="text-sm font-bold text-slate-700">{m.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-800">S/ {formatCurrency(m.amount)}</span>
                  <span className="text-xs text-slate-400 ml-2">{m.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILA 4: Progreso de Sorteos + Transacciones ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Progreso de cada sorteo — barras horizontales */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-black text-slate-800 text-lg">Avance de Sorteos</h3>
            <Link href="/admin/sorteos/crear" className="flex items-center gap-1 text-emerald-600 font-bold text-sm hover:underline">
              <PlusIcon className="w-4 h-4" /> Nuevo
            </Link>
          </div>
          <div className="space-y-5">
            {rendimientoSorteos.map(sorteo => (
              <div key={sorteo.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1">{sorteo.name}</h4>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${sorteo.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {sorteo.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{sorteo.sold}/{sorteo.total_tickets} tickets</span>
                  <span className="font-black text-emerald-600">{sorteo.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${sorteo.progress >= 75 ? 'bg-emerald-500' : sorteo.progress >= 40 ? 'bg-blue-500' : 'bg-amber-400'}`}
                    style={{ width: `${Math.min(sorteo.progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Recaudado: <strong className="text-emerald-700">S/ {formatCurrency(sorteo.revenue)}</strong></p>
              </div>
            ))}
            {rendimientoSorteos.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No hay sorteos activos.</p>
            )}
          </div>
        </div>

        {/* Transacciones Recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-black text-slate-800 text-lg">Transacciones Recientes</h3>
            <Link href="/admin/tickets" className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:underline">
              Ver todas <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {transacciones.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  {tx.status === 'Aprobado' ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2Icon className="w-5 h-5" />
                    </div>
                  ) : tx.status === 'Pendiente' ? (
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <ClockAlertIcon className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <ClockAlertIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{tx.user_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {tx.status === 'Aprobado' ? `✓ Validado · ${tx.time_ago}` : `${tx.method?.toUpperCase()} · ${tx.date}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-black text-slate-800 text-sm">S/ {Number(tx.amount).toFixed(2)}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    tx.status === 'Aprobado' ? 'bg-emerald-100 text-emerald-700' :
                    tx.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILA 5: Top Departamentos ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-black text-slate-800 text-lg mb-5">🗺️ Top Departamentos por Ventas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          {topDepartamentos.map((depto, idx) => {
            const max = Math.max(...topDepartamentos.map(d => d.total), 1);
            const pct = Math.round((depto.total / max) * 100);
            const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
            const color = colors[idx % colors.length];
            return (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 font-black text-xs shrink-0">
                  #{idx + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-slate-700">{depto.departamento}</span>
                    <span className="font-black text-emerald-600">{depto.total} tickets</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className={`${color} h-2.5 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </AdminLayout>
  );
}

function formatCurrency(number) {
  if (!number) return '0';
  return Number(number).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
