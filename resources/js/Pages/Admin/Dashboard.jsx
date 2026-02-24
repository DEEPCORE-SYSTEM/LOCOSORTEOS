import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { 
  Users, Trophy, Ticket, CheckCircle, Clock 
} from 'lucide-react';

export default function Dashboard({ pendingTicketsCount = 0 }) {
  // Datos mockeados para la demostración
  const dashboardStats = [
    { title: 'Sorteo Activo', value: '14 Feb', subtitle: 'Categoría General', icon: <Trophy className="w-6 h-6 text-amber-500" /> },
    { title: 'Tickets Vendidos', value: '1,245', subtitle: 'Para el sorteo activo', icon: <Ticket className="w-6 h-6 text-emerald-500" /> },
    { title: 'Pagos Pendientes', value: pendingTicketsCount.toString(), subtitle: 'Requieren validación', icon: <Clock className="w-6 h-6 text-red-500" />, alert: pendingTicketsCount > 0 },
    { title: 'Usuarios Reg.', value: '856', subtitle: 'Ventas de último mes', icon: <Users className="w-6 h-6 text-blue-500" /> },
  ];

  return (
    <AdminLayout currentView="admin-dashboard" pendingTicketsCount={pendingTicketsCount}>
      <Head title="Panel de Administración | Sorteos Finagro" />
      
      {/* 4 Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {dashboardStats.map((stat, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-2xl shadow-sm border ${stat.alert ? 'border-red-200 shadow-red-100' : 'border-slate-100'} flex items-start justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform`}>
            {stat.alert && <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-2xl"></div>}
            <div>
              <p className="text-slate-500 font-bold text-sm mb-1">{stat.title}</p>
              <h3 className={`text-3xl font-black ${stat.alert ? 'text-red-600' : 'text-slate-900'} tracking-tight mb-2`}>{stat.value}</h3>
              <p className="text-slate-400 text-xs font-medium">{stat.subtitle}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.alert ? 'bg-red-50' : 'bg-slate-50'} group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Gráfico/Actividad (Ocupa 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-emerald-600" /> Ingresos Recientes
            </h3>
            {/* Gráfico Placeholder */}
            <div className="h-64 flex items-end justify-between gap-2 px-2 pb-6 border-b border-slate-100/50">
              {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-2 group relative">
                  {/* Tooltip Hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded w-max shadow-lg pointer-events-none">
                    S/ {h * 40}
                  </div>
                  <div 
                    className="w-full bg-emerald-100 group-hover:bg-emerald-500 transition-colors rounded-t-lg" 
                    style={{ height: `${h}%` }}
                  ></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Día {i+1}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500 font-bold mb-1">Total Semana</p>
                <p className="text-xl font-black text-emerald-700">S/ 4,500.00</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500 font-bold mb-1">Total Mes</p>
                <p className="text-xl font-black text-slate-800">S/ 18,240.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Acciones Rápidas y Alertas */}
        <div className="space-y-6">
          <div className="bg-[#064E3B] text-white p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-between">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-400/[0.15] rounded-full blur-xl"></div>
            <div className="relative z-10 w-full">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-3 w-3 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <p className="font-bold text-emerald-200 text-sm tracking-widest uppercase">Próximo Sorteo</p>
              </div>
              <h3 className="text-3xl font-black mb-1 text-white tracking-tight leading-none">28 de Feb</h3>
              <p className="text-emerald-100 font-medium mb-6 text-sm">214 Premios a repartir</p>
              
              <Link href="/admin/ejecucion" className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform transform hover:-translate-y-1">
                 Ejecutar Sorteo Ahora
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-900 mb-4 text-lg">Últimos Pagos (Bouchers)</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                      {i === 0 ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm leading-tight">YAPE S/ 40.00</p>
                      <p className="text-xs text-slate-500 font-medium">Hace 5 min</p>
                    </div>
                  </div>
                  <Link href="/admin/tickets" className="text-emerald-600 font-bold text-xs hover:underline">Ver</Link>
                </div>
              ))}
            </div>
            
            <Link href="/admin/tickets" className="mt-4 block w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm py-2.5 rounded-xl transition-colors border border-slate-200">
              Ver todos los pagos
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
