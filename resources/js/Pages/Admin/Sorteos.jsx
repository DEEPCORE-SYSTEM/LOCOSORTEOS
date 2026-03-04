import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
  Trophy, Plus, Eye, Edit, Trash2, Search, Upload,
  CheckCircle, XCircle, X, Save, Image as ImageIcon, Loader2
} from 'lucide-react';

export default function Sorteos({ adminSorteosPaginated, filters = {} }) {
  const pendingTicketsCount = 0;
  const { flash } = usePage().props;

  const adminSorteos = adminSorteosPaginated?.data || [];
  const paginationLinks = adminSorteosPaginated?.links || [];

  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [searchQuery, setSearchQuery] = useState(params.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(params.get('status') || 'todos');
  const [perPage, setPerPage] = useState(filters.perPage || 25);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentSearch = params.get('search') || '';
      const currentStatus = params.get('status') || 'todos';

      if (searchQuery !== currentSearch || statusFilter !== currentStatus || perPage.toString() !== (params.get('perPage') || '25').toString()) {
          router.get('/admin/sorteos', {
            search: searchQuery,
            status: statusFilter,
            perPage: perPage
          }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
          });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, perPage]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  // ── Filtros ──
  const filtered = adminSorteos;

  const exportSorteosToCsv = () => {
    if (!filtered || filtered.length === 0) {
      alert('No hay sorteos para exportar con los filtros actuales.');
      return;
    }

    const headers = [
      'ID',
      'Nombre',
      'Estado',
      'Tipo',
      'FechaCierre',
      'TicketsVendidos',
      'TotalTickets',
      'Recaudado',
    ];

    const rows = filtered.map((s) => [
      s.id,
      s.name || '',
      s.status || '',
      s.type || '',
      s.date || '',
      s.sold ?? 0,
      s.total ?? 0,
      s.revenue ?? 0,
    ]);

    const escapeCell = (value) =>
      `"${(value ?? '').toString().replace(/"/g, '""')}"`;

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(','))
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `sorteos_campoagro_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`¿Eliminar "${name}"? Esta acción es irreversible y requiere que no tenga tickets vendidos.`)) {
      router.delete(route('admin.sorteos.destroy', id), { preserveScroll: true });
    }
  };

  const handleToggleEstado = (id, nuevoEstado, label) => {
    if (window.confirm(`¿Confirmas ${label} este sorteo?`)) {
      router.post(route('admin.sorteos.estado', id), { estado: nuevoEstado }, { preserveScroll: true });
    }
  };

  return (
    <AdminLayout currentView="admin-sorteos" pendingTicketsCount={pendingTicketsCount}>
      <Head title="Gestión de Sorteos | Admin Campoagro" />

      {flash?.success && <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 font-bold">{flash.success}</div>}
      {flash?.error   && <div className="mb-4 text-sm text-red-700   bg-red-50   px-4 py-3 rounded-xl border border-red-200   font-bold">{flash.error}</div>}

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <select
            value={perPage}
            onChange={(e) => setPerPage(e.target.value)}
            className="w-full md:w-auto border-slate-200 text-sm font-bold text-slate-600 py-2.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            <option value="25">25 Filas</option>
            <option value="50">50 Filas</option>
            <option value="100">100 Filas</option>
            <option value="500">500 Filas</option>
            <option value="1000">1000 Filas</option>
            <option value="todos">Todos</option>
          </select>
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
            <option value="programado">Programados</option>
            <option value="finalizado">Finalizados</option>
          </select>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={exportSorteosToCsv}
            className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" /> Exportar Excel
          </button>
          <a
            href="/admin/sorteos/crear"
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" /> Nuevo Sorteo
          </a>
        </div>
      </div>

      {/* Grid de Sorteos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((sorteo) => {
          const pct = sorteo.total > 0 ? Math.round((sorteo.sold / sorteo.total) * 100) : 0;
          const isActivo   = sorteo.status === 'Activo';
          const isProgramado = sorteo.status === 'Programado';

          return (
            <div key={sorteo.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
              <div className={`absolute top-4 right-4 text-xs font-black px-2 py-1 rounded-md uppercase ${
                isActivo      ? 'bg-green-100 text-green-700' :
                isProgramado  ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700'
              }`}>
                {sorteo.status}
              </div>

              <div className="p-6 border-b border-slate-100">
                <h3 className="font-black text-xl text-slate-900 mb-1 pr-24">{sorteo.name}</h3>
                <p className="text-slate-500 text-sm mb-2">📅 Fecha cierre: {sorteo.date}</p>
                <span className="inline-block bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">{sorteo.type}</span>
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

              <div className="px-6 pb-4 pt-2 bg-slate-50">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-500 uppercase tracking-wide">Avance Tickets</span>
                  <span className={`font-black ${isActivo ? 'text-emerald-600' : 'text-amber-500'}`}>{pct}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isActivo
                        ? 'bg-emerald-500'
                        : isProgramado
                          ? 'bg-amber-400'
                          : 'bg-slate-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex gap-2">
                {/* Editar → va a la página completa SorteoForm */}
                <a
                  href={`/admin/sorteos/${sorteo.id}/editar`}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg flex justify-center items-center gap-2 transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" /> Editar
                </a>

                {isActivo ? (
                  <button
                    onClick={() => handleToggleEstado(sorteo.id, 'finalizado', 'CERRAR VENTAS de')}
                    className="flex-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-700 font-bold py-2 rounded-lg flex justify-center items-center gap-2 transition-colors text-sm"
                  >
                    <XCircle className="w-4 h-4" /> Cerrar Ventas
                  </button>
                ) : isProgramado ? (
                  <button
                    onClick={() => handleToggleEstado(sorteo.id, 'activo', 'PUBLICAR')}
                    className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-2 rounded-lg flex justify-center items-center gap-2 transition-colors text-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Publicar
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleEstado(sorteo.id, 'activo', 'REACTIVAR')}
                    className="flex-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 font-bold py-2 rounded-lg flex justify-center items-center gap-2 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" /> Reactivar
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
            <a href="/admin/sorteos/crear" className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline">
              <Plus className="w-4 h-4" /> Crear nuevo sorteo
            </a>
          </div>
        )}
      </div>

      {/* Paginación */}
      {paginationLinks.length > 3 && (
        <div className="mt-6 p-4 border border-slate-100 rounded-2xl flex items-center justify-between flex-wrap gap-4 bg-white shadow-sm">
          <p className="text-xs text-slate-500 font-bold w-full text-center md:text-left md:w-auto">
            Mostrando {adminSorteosPaginated.current_page} de {adminSorteosPaginated.last_page} ({adminSorteosPaginated.total} totales)
          </p>
          <div className="flex gap-1 flex-wrap justify-center w-full md:justify-end md:w-auto">
            {paginationLinks.map((link, idx) => (
              <div key={idx}>
                {link.url === null ? (
                    <span className="px-3 py-1.5 border border-slate-200 text-slate-400 rounded-lg bg-slate-50 cursor-not-allowed text-xs font-bold" dangerouslySetInnerHTML={{ __html: link.label }} />
                ) : (
                    <button
                      type="button"
                      onClick={() => router.get(link.url, { search: searchQuery, status: statusFilter, perPage: perPage }, { preserveState: true })}
                      className={`px-3 py-1.5 border border-slate-200 rounded-lg transition-colors text-xs font-bold ${link.active ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
