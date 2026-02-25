import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import {
  Users, Search, Edit, AlertTriangle, CheckCircle, XCircle,
  Eye, Upload, Ticket, MessageCircle
} from 'lucide-react';

export default function Usuarios({ adminUsersData = [], sorteosData = [] }) {
  const pendingTicketsCount = 0;

  const [adminUsers, setAdminUsers] = useState(adminUsersData);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('todos');
  const [userDrawFilter, setUserDrawFilter] = useState('todos');

  // Edit State
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', dni: '', phone: '' });

  const filteredAdminUsers = adminUsers.filter(user => {
    const matchSearch =
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.dni.includes(userSearchQuery) ||
      user.phone.includes(userSearchQuery);

    const matchStatus =
      userStatusFilter === 'todos' ? true :
      userStatusFilter === 'activos' ? user.status === 'activo' :
      userStatusFilter === 'baneados' ? user.status === 'bloqueado' :
      userStatusFilter === 'sin_compras' ? user.totalTickets === 0 : true;

    const matchDraw =
      userDrawFilter === 'todos' ? true :
      Array.isArray(user.draws) && user.draws.includes(userDrawFilter);

    return matchSearch && matchStatus && matchDraw;
  });

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

  const totalClientes = adminUsers.length;
  const clientesActivos = adminUsers.filter(u => u.totalTickets > 0).length;
  const cuentasBaneadas = adminUsers.filter(u => u.status === 'bloqueado').length;

  // Draw filter uses backend-provided sorteos list

  return (
    <AdminLayout currentView="admin-users" pendingTicketsCount={pendingTicketsCount}>
      <Head title="Gestión de Usuarios | Admin Finagro" />

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
          <button className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
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
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <p className="text-xs text-slate-500 font-bold">
            Mostrando {filteredAdminUsers.length} de {adminUsers.length} usuarios
          </p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-slate-200 text-slate-400 rounded-lg bg-white cursor-not-allowed text-xs font-bold">Anterior</button>
            <button className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg bg-white hover:bg-slate-100 transition-colors text-xs font-bold">Siguiente</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
