import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Trophy, Plus, Settings, Eye, Edit, Trash2 } from 'lucide-react';

export default function Sorteos({ adminSorteos }) {
  // Datos mockeados
  const pendingTicketsCount = 0;

  return (
    <AdminLayout currentView="admin-sorteos" pendingTicketsCount={pendingTicketsCount}>
      <Head title="Gestión de Sorteos | Admin Finagro" />

      {/* Acciones Superiores */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
           <p className="text-sm text-slate-500 font-medium">Administra los eventos, premios y configuraciones.</p>
        </div>
        <Link href="/admin/sorteos/crear" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-transform hover:-translate-y-0.5 whitespace-nowrap">
          <Plus className="w-5 h-5"/> Crear Nuevo Sorteo
        </Link>
      </div>

      {/* Lista de Sorteos (Grid) */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {adminSorteos.map((sorteo) => (
          <div key={sorteo.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow">
            <div className={`p-4 flex justify-between items-center bg-slate-50 border-b border-slate-100`}>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-black uppercase rounded-lg ${
                  sorteo.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' :
                  sorteo.status === 'Borrador' ? 'bg-slate-200 text-slate-600' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {sorteo.status}
                </span>
                <span className="text-xs font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded bg-white">
                  {sorteo.type}
                </span>
              </div>
              <button className="text-slate-400 hover:text-emerald-600 transition-colors p-1" title="Opciones">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight group-hover:text-emerald-700 transition-colors">{sorteo.name}</h3>
              <p className="text-slate-500 font-medium text-sm mb-6 flex items-center gap-1">📍 Fecha de juego: {sorteo.date}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#F8FAFC] p-4 rounded-xl text-center border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Avance</p>
                  <p className="text-lg font-black text-emerald-700">
                    {Math.round((sorteo.sold / sorteo.total) * 100)}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{sorteo.sold} / {sorteo.total}</p>
                </div>
                <div className="bg-[#F8FAFC] p-4 rounded-xl text-center border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Recaudado</p>
                  <p className="text-lg font-black text-slate-900">
                    S/ {(sorteo.revenue / 1000).toFixed(1)}k
                  </p>
                </div>
              </div>

              {/* Barra de progreso visual */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full ${sorteo.status === 'Finalizado' ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${(sorteo.sold / sorteo.total) * 100}%` }}
                ></div>
              </div>

              <div className="flex gap-2">
                <Link href={route('admin.sorteos.editar', sorteo.id)} className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" /> Editar
                </Link>
                <button className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" /> Previa
                </button>
                <button className="px-4 border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl transition-colors shrink-0 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </AdminLayout>
  );
}
