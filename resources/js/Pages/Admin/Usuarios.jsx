import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
  Users, Search, Edit, AlertTriangle, CheckCircle, XCircle,
  Eye, Upload, Ticket, MessageCircle, Trash2, X, ShoppingBag
} from 'lucide-react';

export default function Usuarios({ adminUsersPaginated, sorteosData = [], filters = {} }) {
  const pendingTicketsCount = 0;

  const { flash } = usePage().props;

  const adminUsers = adminUsersPaginated?.data || [];
  const paginationLinks = adminUsersPaginated?.links || [];
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [userSearchQuery, setUserSearchQuery] = useState(params.get('search') || '');
  const [userStatusFilter, setUserStatusFilter] = useState(params.get('status') || 'todos');
  const [userDrawFilter, setUserDrawFilter] = useState(params.get('draw') || 'todos');
  const [userPerPage, setUserPerPage] = useState(filters.perPage || 25);
  const [historialModal, setHistorialModal] = useState(null); // user obj

  // Edit State
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', dni: '', phone: '' });

  const filteredAdminUsers = adminUsers;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentSearch = params.get('search') || '';
      const currentStatus = params.get('status') || 'todos';
      const currentDraw = params.get('draw') || 'todos';

      if (userSearchQuery !== currentSearch || userStatusFilter !== currentStatus || userDrawFilter !== currentDraw || userPerPage.toString() !== (params.get('perPage') || '25').toString()) {
          router.get('/admin/usuarios', {
            search: userSearchQuery,
            status: userStatusFilter,
            draw: userDrawFilter,
            perPage: userPerPage
          }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
          });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [userSearchQuery, userStatusFilter, userDrawFilter, userPerPage]);

  const exportUsersToCsv = () => {
    if (!filteredAdminUsers || filteredAdminUsers.length === 0) {
      alert('No hay usuarios para exportar con los filtros actuales.');
      return;
    }

    const headers = [
      'ID',
      'Nombre',
      'DNI',
      'Telefono',
      'FechaRegistro',
      'TotalTickets',
      'Estado',
      'SorteosParticipados',
    ];

    const rows = filteredAdminUsers.map((u) => {
      const draws = Array.isArray(u.draws) ? u.draws.join(' | ') : '';
      return [
        u.id,
        u.name || '',
        u.dni || '',
        u.phone || '',
        u.date || '',
        u.totalTickets ?? 0,
        u.status || '',
        draws,
      ];
    });

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
      `usuarios_campoagro_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleToggleUserStatus = (userId, currentStatus, userName) => {
    const newStatus = currentStatus === 'activo' ? 'bloqueado' : 'activo';
    const actionText =
      newStatus === 'bloqueado'
        ? `¿Estás seguro que deseas BLOQUEAR a ${userName}? No podrá iniciar sesión ni comprar tickets.`
        : `¿Deseas REACTIVAR la cuenta de ${userName}?`;

    if (window.confirm(actionText)) {
      router.post(`/admin/usuarios/${userId}/toggle-status`, {}, {
        preserveScroll: true,
        onSuccess: () => {
          setAdminUsers(prev =>
            prev.map(user =>
              user.id === userId ? { ...user, status: newStatus } : user
            )
          );
        }
      });
    }
  };

  const startEditing = (user) => {
    setEditingUserId(user.id);
    setEditForm({ name: user.name, dni: user.dni, phone: user.phone });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditForm({ name: '', dni: '', phone: '' });
  };

  const saveEditing = (userId) => {
    router.put(`/admin/usuarios/${userId}`, editForm, {
      preserveScroll: true,
      onSuccess: () => {
        setAdminUsers(prev =>
          prev.map(user =>
            user.id === userId
              ? { ...user, name: editForm.name, dni: editForm.dni, phone: editForm.phone }
              : user
          )
        );
        setEditingUserId(null);
      }
    });
  };

  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`¿Eliminar definitivamente la cuenta de ${userName}?\nSolo se puede si no tiene compras activas.`)) {
      router.delete(`/admin/usuarios/${userId}`, {
        preserveScroll: true,
        onSuccess: () => setAdminUsers(prev => prev.filter(u => u.id !== userId)),
      });
    }
  };

  const totalClientes = adminUsers.length;
  const clientesActivos = adminUsers.filter(u => u.totalTickets > 0).length;
  const cuentasBaneadas = adminUsers.filter(u => u.status === 'bloqueado').length;

  // Draw filter uses backend-provided sorteos list

  return (
    <AdminLayout currentView="admin-users" pendingTicketsCount={pendingTicketsCount}>
      <Head title="Gestión de Usuarios | Admin Campoagro" />

      {flash?.success && <div className="mb-4 text-sm text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 font-bold">{flash.success}</div>}
      {flash?.error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200 font-bold">{flash.error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-xl">
            <Users className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Clientes</p>
            <p className="text-3xl font-black text-slate-900">{totalClientes}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-amber-100 p-4 rounded-xl">
            <Ticket className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Clientes Activos</p>
            <p className="text-3xl font-black text-slate-900">{clientesActivos}</p>
            <p className="text-xs text-slate-400 font-medium">Compraron al menos 1 vez</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-red-100 p-4 rounded-xl">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Cuentas Baneadas</p>
            <p className="text-3xl font-black text-red-600">{cuentasBaneadas}</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Nombre, DNI o Celular..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <select
            value={userPerPage}
            onChange={(e) => setUserPerPage(e.target.value)}
            className="border border-slate-200 text-sm font-bold text-slate-600 py-2.5 px-4 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="25">25 Filas</option>
            <option value="50">50 Filas</option>
            <option value="100">100 Filas</option>
            <option value="500">500 Filas</option>
            <option value="1000">1000 Filas</option>
            <option value="todos">Todos</option>
          </select>
          <select
            value={userDrawFilter}
            onChange={(e) => setUserDrawFilter(e.target.value)}
            className="border border-slate-200 text-sm font-bold text-slate-600 py-2.5 px-4 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="todos">Todos los Sorteos</option>
            {sorteosData.map(sorteo => (
              <option key={sorteo.id} value={sorteo.nombre}>{sorteo.nombre}</option>
            ))}
          </select>
          <select
            value={userStatusFilter}
            onChange={(e) => setUserStatusFilter(e.target.value)}
            className="border border-slate-200 text-sm font-bold text-slate-600 py-2.5 px-4 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="todos">Todos los Usuarios</option>
            <option value="activos">Solo Activos</option>
            <option value="baneados">Solo Baneados</option>
            <option value="sin_compras">Sin Compras</option>
          </select>
        </div>
        <div className="flex gap-2 w-full xl:w-auto">
          <button
            type="button"
            onClick={exportUsersToCsv}
            className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" /> Exportar DB
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 font-bold">Cliente / Registro</th>
                <th className="p-4 font-bold">Documento (DNI)</th>
                <th className="p-4 font-bold">Contacto</th>
                <th className="p-4 font-bold">Sorteos Participados</th>
                <th className="p-4 font-bold text-center">Tickets</th>
                <th className="p-4 font-bold text-center">Estado de Cuenta</th>
                <th className="p-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredAdminUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`transition-colors ${user.status === 'bloqueado' ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}
                >
                  {/* Cliente / Registro */}
                  <td className="p-4">
                    {editingUserId === user.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500"
                          placeholder="Nombre completo"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${user.status === 'bloqueado' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className={`font-bold text-base ${user.status === 'bloqueado' ? 'text-red-900 line-through opacity-70' : 'text-slate-900'}`}>
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">Registrado: {user.date}</p>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* DNI */}
                  <td className="p-4 font-mono font-bold text-slate-700">
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editForm.dni}
                        onChange={e => setEditForm({ ...editForm, dni: e.target.value })}
                        className="w-28 text-sm border border-slate-200 rounded-lg px-2 py-1.5 font-mono focus:outline-none focus:border-emerald-500"
                        placeholder="DNI"
                        maxLength="8"
                      />
                    ) : (
                      user.dni
                    )}
                  </td>

                  {/* Contacto */}
                  <td className="p-4">
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500"
                        placeholder="Teléfono"
                      />
                    ) : (
                      <>
                        <p className="text-slate-700 font-medium flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-emerald-500" /> {user.phone}
                        </p>
                        {user.phone && user.phone !== '-' && (
                          <a
                            href={`https://wa.me/51${user.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-emerald-600 hover:underline font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 mt-1 inline-block"
                          >
                            WhatsApp
                          </a>
                        )}
                      </>
                    )}
                  </td>

                  {/* Sorteos */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(user.draws) && user.draws.length > 0 ? (
                        user.draws.map((d, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 truncate max-w-[120px]"
                            title={d}
                          >
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Ninguno</span>
                      )}
                    </div>
                  </td>

                  {/* Tickets */}
                  <td className="p-4 text-center">
                    <span className="bg-slate-100 text-slate-800 font-black px-3 py-1.5 rounded-lg border border-slate-200">
                      {user.totalTickets}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      user.status === 'activo'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {user.status === 'activo'
                        ? <CheckCircle className="w-3.5 h-3.5" />
                        : <XCircle className="w-3.5 h-3.5" />}
                      {user.status}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="p-4">
                    {editingUserId === user.id ? (
                      <div className="flex justify-center gap-2 flex-col sm:flex-row">
                        <button
                          onClick={() => saveEditing(user.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-300 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 p-2 rounded-lg transition-colors shadow-sm"
                            title="Ver Historial de Compras"
                            onClick={() => setHistorialModal(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => startEditing(user)}
                            className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 p-2 rounded-lg transition-colors shadow-sm"
                            title="Editar Datos"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.status, user.name)}
                            className={`p-2 rounded-lg transition-colors shadow-sm text-white ${
                              user.status === 'activo'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-emerald-500 hover:bg-emerald-600'
                            }`}
                            title={user.status === 'activo' ? 'Suspender/Banear Usuario' : 'Reactivar Usuario'}
                          >
                            {user.status === 'activo'
                              ? <AlertTriangle className="w-4 h-4" />
                              : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 p-2 rounded-lg transition-colors shadow-sm"
                            title="Eliminar Usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredAdminUsers.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-bold">
                    No se encontraron usuarios que coincidan con estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 flex-col md:flex-row gap-4">
          <p className="text-xs text-slate-500 font-bold text-center md:text-left">
            Mostrando página {adminUsersPaginated.current_page} de {adminUsersPaginated.last_page} ({adminUsersPaginated.total} registros totales)
          </p>
          <div className="flex gap-1 flex-wrap justify-center md:justify-end">
            {paginationLinks.length > 3 && paginationLinks.map((link, idx) => (
              <div key={idx}>
                {link.url === null ? (
                    <span className="px-3 py-1.5 border border-slate-200 text-slate-400 rounded-lg bg-white cursor-not-allowed text-xs font-bold ring-1 ring-transparent" dangerouslySetInnerHTML={{ __html: link.label }} />
                ) : (
                    <button
                      type="button"
                      onClick={() => router.get(link.url, { search: userSearchQuery, status: userStatusFilter, draw: userDrawFilter, perPage: userPerPage }, { preserveState: true })}
                      className={`px-3 py-1.5 border border-slate-200 rounded-lg transition-colors text-xs font-bold ${link.active ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Historial de Compras */}
      {historialModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setHistorialModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-black text-slate-900">{historialModal.name}</p>
                  <p className="text-xs text-slate-500">DNI: {historialModal.dni}</p>
                </div>
              </div>
              <button onClick={() => setHistorialModal(null)} className="text-slate-400 hover:text-red-500 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm font-bold text-slate-600 mb-3">Sorteos participados ({historialModal.draws?.length || 0})</p>
              {historialModal.draws?.length > 0 ? (
                <div className="space-y-2">
                  {historialModal.draws.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <Ticket className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-sm font-bold text-slate-800">{d}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">Sin compras registradas</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-bold">Total tickets: <span className="text-slate-900">{historialModal.totalTickets}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
