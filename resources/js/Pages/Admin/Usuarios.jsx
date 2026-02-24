import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Users, Search, Edit, Trash2 } from 'lucide-react';

export default function Usuarios() {
  const pendingTicketsCount = 0;

  const [adminUsers, setAdminUsers] = useState([
    { id: 'U-1001', name: 'María Perez', dni: '74125896', phone: '987654321', date: '10 Ene 2026', totalTickets: 15, status: 'activo', draws: ['Gran Sorteo 28 de Febrero', 'Sorteo 31 de Enero'] },
    { id: 'U-1004', name: 'Ana Silva', dni: '45678912', phone: '955444333', date: '20 Feb 2026', totalTickets: 5, status: 'baneado', draws: ['Sorteo Día de la Madre'] },
    { id: 'U-1005', name: 'Jorge Tapia', dni: '12345678', phone: '911222333', date: '21 Feb 2026', totalTickets: 10, status: 'activo', draws: ['Gran Sorteo 28 de Febrero'] },
  ]);

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('todos');

  const filteredAdminUsers = adminUsers.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || user.dni.includes(userSearchQuery) || user.phone.includes(userSearchQuery);
    const matchStatus = userStatusFilter === 'todos' ? true :
                        userStatusFilter === 'activos' ? user.status === 'activo' :
                        userStatusFilter === 'baneados' ? user.status === 'baneado' :
                        userStatusFilter === 'sin_compras' ? user.totalTickets === 0 : true;
    return matchSearch && matchStatus;
  });

  const handleToggleUserStatus = (userId, currentStatus, userName) => {
    const newStatus = currentStatus === 'activo' ? 'baneado' : 'activo';
    const actionText = newStatus === 'baneado' ? `¿Estás seguro que deseas BANEAR a ${userName}?` : `¿Deseas REACTIVAR la cuenta de ${userName}?`;
    
    if (window.confirm(actionText)) {
      setAdminUsers(adminUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    }
  };

  return (
    <AdminLayout currentView="admin-users" pendingTicketsCount={pendingTicketsCount}>
      <Head title="Gestión de Usuarios | Admin Finagro" />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600" /> Directorio de Clientes
        </h3>
        <button className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg shadow-sm">Exportar BD</button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, DNI o teléfono..." 
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={userStatusFilter}
            onChange={(e) => setUserStatusFilter(e.target.value)}
            className="border border-slate-200 text-sm font-bold text-slate-600 py-2 px-3 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="activos">Solo Activos</option>
            <option value="baneados">Baneados</option>
            <option value="sin_compras">Sin Compras</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-bold">Cliente</th>
                <th className="p-4 font-bold">Contacto</th>
                <th className="p-4 font-bold">Registro</th>
                <th className="p-4 font-bold text-center">Tickets Netos</th>
                <th className="p-4 font-bold">Estado</th>
                <th className="p-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredAdminUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">DNI: {user.dni}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-700">{user.phone}</p>
                    <a href={`https://wa.me/51${user.phone}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:underline font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">WhatsApp</a>
                  </td>
                  <td className="p-4 text-slate-500">{user.date}</td>
                  <td className="p-4 text-center">
                    <span className="font-black text-lg text-emerald-700">{user.totalTickets}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-black uppercase rounded-lg ${
                      user.status === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 border border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleUserStatus(user.id, user.status, user.name)}
                        className={`p-2 border border-slate-200 rounded-lg transition-colors ${
                          user.status === 'activo' ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                        }`} 
                        title={user.status === 'activo' ? "Banear Usuario" : "Reactivar Usuario"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAdminUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-bold">
                    No se encontraron usuarios con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 text-center text-slate-500 text-sm font-bold bg-slate-50">
          Mostrando {filteredAdminUsers.length} de {adminUsers.length} usuarios
        </div>
      </div>
    </AdminLayout>
  );
}
