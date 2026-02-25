import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Trophy, Plus, Eye, Edit, Trash2, Search, Upload } from 'lucide-react';

export default function Sorteos({ adminSorteos = [] }) {
  const pendingTicketsCount = 0;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const filtered = adminSorteos.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      statusFilter === 'todos' ? true :
      statusFilter === 'activo' ? s.status === 'Activo' :
      statusFilter === 'borrador' ? s.status === 'Borrador' :
      statusFilter === 'finalizado' ? s.status === 'Finalizado' : true;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`¿Estás seguro de que deseas ELIMINAR el sorteo "${name}"?\nEsta acción es irreversible y requiere que no tenga tickets vendidos.`)) {
      router.delete(route('admin.sorteos.destroy', id), { preserveScroll: true });
    }
  };

  return (
    <AdminLayout currentView="admin-sorteos" pendingTicketsCount={pendingTicketsCount}>
      <Head title="Gestión de Sorteos | Admin Finagro" />

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar sorteo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 text-sm font-bold text-slate-600 py-2 px-3 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="activo">Activos</option>
            <option value="borrador">Borradores</option>
            <option value="finalizado">Finalizados</option>
          </select>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Upload className="w-4 h-4" /> Exportar Excel
          </button>
          <Link
            href="/admin/sorteos/crear"
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" /> Nuevo Sorteo
          </Link>
        </div>
      </div>

      {/* Grid de Sorteos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((sorteo) => {
          const pct = sorteo.total > 0 ? Math.round((sorteo.sold / sorteo.total) * 100) : 0;
          const isActivo = sorteo.status === 'Activo';
          const isBorrador = sorteo.status === 'Borrador';

          return (
            <div key={sorteo.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
              {/* Status badge */}
              <div className={`absolute top-4 right-4 text-xs font-black px-2 py-1 rounded-md uppercase ${
                isActivo ? 'bg-green-100 text-green-700' :
                isBorrador ? 'bg-slate-200 text-slate-600' :
                'bg-amber-100 text-amber-700'
              }`}>
                {sorteo.status}
              </div>

              <div className="p-6 border-b border-slate-100">
                <h3 className="font-black text-xl text-slate-900 mb-1 pr-24">{sorteo.name}</h3>
                <p className="text-slate-500 text-sm mb-2">📅 Fecha cierre: {sorteo.date}</p>
                <span className="inline-block bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">
                  {sorteo.type}
                </span>
              </div>

              <div className="p-6 bg-slate-50 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Tickets Vendidos</p>
                  <p className="font-black text-emerald-600">{sorteo.sold} / {sorteo.total}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Recaudado</p>
                  <p className="font-black text-slate-800">S/ {Number(sorteo.revenue).toLocaleString()}</p>
                </div>
              </div>

              {/* Barra progreso */}
              <div className="px-6 pb-4 pt-2 bg-slate-50">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-500 uppercase tracking-wide">Avance Tickets</span>
                  <span className={`font-black ${isActivo ? 'text-emerald-600' : 'text-amber-500'}`}>{pct}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isActivo ? 'bg-emerald-500' : isBorrador ? 'bg-amber-400' : 'bg-slate-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex gap-2">
                <Link
                  href={route('admin.sorteos.editar', sorteo.id)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg flex justify-center items-center gap-2 transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" /> Editar
                </Link>
                {isActivo ? (
                  <button className="flex-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-700 font-bold py-2 rounded-lg flex justify-center items-center gap-2 transition-colors text-sm">
                    Cerrar Ventas
                  </button>
                ) : isBorrador ? (
                  <button className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-2 rounded-lg flex justify-center items-center gap-2 transition-colors text-sm">
                    Publicar
                  </button>
                ) : (
                  <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-lg flex justify-center items-center gap-2 transition-colors text-sm">
                    <Eye className="w-4 h-4" /> Ver Resultados
                  </button>
                )}
                <button
                  onClick={() => handleDelete(sorteo.id, sorteo.name)}
                  className="px-4 border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl transition-colors shrink-0 flex items-center justify-center"
                  title="Eliminar Sorteo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="md:col-span-2 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-lg">No hay sorteos con esos filtros</p>
            <Link href="/admin/sorteos/crear" className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline">
              <Plus className="w-4 h-4" /> Crear nuevo sorteo
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
