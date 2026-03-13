import React, { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Shield,
  ShoppingBag,
  Ticket,
  Trash2,
  Upload,
  Users,
  X,
  XCircle,
} from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  dni: '',
  phone: '',
  department: '',
  address: '',
  status: 'activo',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const participantStatusClasses = {
  activo: 'bg-green-50 text-green-700 border-green-200',
  bloqueado: 'bg-red-50 text-red-700 border-red-200',
};

const purchaseStatusClasses = {
  aprobado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  rechazado: 'bg-rose-50 text-rose-700 border-rose-200',
};

function InputField({ label, value, onChange, placeholder, error, maxLength, required = false }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-100 ${
          error ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-emerald-500'
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, error }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <textarea
        rows={3}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-emerald-100 ${
          error ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-emerald-500'
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, error }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-100 ${
          error ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-emerald-500'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const classes = participantStatusClasses[status] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${classes}`}>
      {status === 'activo' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {status}
    </span>
  );
}

function PurchaseStatusBadge({ status }) {
  const classes = purchaseStatusClasses[status] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${classes}`}>
      {status}
    </span>
  );
}

function ParticipantFormModal({ mode, data, setData, errors, processing, onClose, onSubmit }) {
  const isEdit = mode === 'edit';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">
              Participantes
            </p>
            <h2 className="text-lg font-black text-slate-900">
              {isEdit ? 'Editar participante' : 'Nuevo participante'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Nombre completo"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="Ej: Juan Perez Quispe"
              error={errors.name}
              required
            />
            <InputField
              label="DNI"
              value={data.dni}
              onChange={(e) => setData('dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="12345678"
              error={errors.dni}
              maxLength={8}
              required
            />
            <InputField
              label="Telefono"
              value={data.phone}
              onChange={(e) => setData('phone', e.target.value)}
              placeholder="987654321"
              error={errors.phone}
              maxLength={20}
            />
            <InputField
              label="Departamento"
              value={data.department}
              onChange={(e) => setData('department', e.target.value)}
              placeholder="Ej: Lima"
              error={errors.department}
              maxLength={100}
            />
          </div>

          <TextAreaField
            label="Direccion"
            value={data.address}
            onChange={(e) => setData('address', e.target.value)}
            placeholder="Av., calle, referencia o dirección completa"
            error={errors.address}
          />

          <SelectField
            label="Estado de cuenta"
            value={data.status}
            onChange={(e) => setData('status', e.target.value)}
            options={[
              { value: 'activo', label: 'Activo' },
              { value: 'bloqueado', label: 'Bloqueado' },
            ]}
            error={errors.status}
          />

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-60 transition-colors shadow-sm"
            >
              {processing ? 'Guardando...' : isEdit ? 'Actualizar participante' : 'Crear participante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-emerald-600" />
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900 break-words">{value || 'No registrado'}</p>
    </div>
  );
}

function ParticipantDetailModal({ participant, onClose, onEdit }) {
  const history = participant?.history || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl ${participant.status === 'bloqueado' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {(participant.name || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">
                Ficha del participante
              </p>
              <h2 className="text-lg font-black text-slate-900">{participant.name}</h2>
              <p className="text-sm text-slate-500 font-medium">DNI: {participant.dni}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={participant.status} />
            <button
              onClick={() => onEdit(participant)}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Compras</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{participant.totalCompras}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Tickets</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{participant.totalTickets}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Total gastado</p>
              <p className="mt-2 text-2xl font-black text-emerald-700">{formatCurrency(participant.totalGastado)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Ultima compra</p>
              <p className="mt-2 text-sm font-black text-slate-900">{participant.lastPurchaseDate || 'Sin compras'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow icon={Phone} label="Telefono" value={participant.phone} />
            <DetailRow icon={MapPin} label="Departamento" value={participant.department} />
            <DetailRow icon={ShoppingBag} label="Direccion" value={participant.address} />
            <DetailRow icon={Calendar} label="Registro" value={participant.registeredAt} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Historial de compras
                </p>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {history.length} compra{history.length === 1 ? '' : 's'}
                </h3>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {history.length > 0 ? (
                history.map((purchase) => (
                  <div key={purchase.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-slate-900">{purchase.codigo}</p>
                          <PurchaseStatusBadge status={purchase.estado} />
                        </div>
                        <p className="text-sm font-bold text-slate-700 mt-2">{purchase.sorteo}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {purchase.fecha} · Metodo: {purchase.metodoPago}
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                          Monto
                        </p>
                        <p className="text-lg font-black text-emerald-700">{formatCurrency(purchase.total)}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                        Tickets ({purchase.ticketsCount})
                      </p>
                      {purchase.tickets?.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {purchase.tickets.map((ticketNumber) => (
                            <span
                              key={`${purchase.id}-${ticketNumber}`}
                              className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-700"
                            >
                              {ticketNumber}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-400 italic">Sin tickets asignados todavía.</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-bold">No hay compras registradas para este participante.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Usuarios({
  adminUsersPaginated,
  participantStats = {},
  sorteosData = [],
  filters = {},
}) {
  const { flash } = usePage().props;

  const adminUsers = adminUsersPaginated?.data || [];
  const paginationLinks = adminUsersPaginated?.links || [];
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');

  const [userSearchQuery, setUserSearchQuery] = useState(params.get('search') || '');
  const [userStatusFilter, setUserStatusFilter] = useState(params.get('status') || 'todos');
  const [userDrawFilter, setUserDrawFilter] = useState(params.get('draw') || 'todos');
  const [userPerPage, setUserPerPage] = useState(filters.perPage || 25);
  const [detailUser, setDetailUser] = useState(null);
  const [participantModalMode, setParticipantModalMode] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm(EMPTY_FORM);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentSearch = params.get('search') || '';
      const currentStatus = params.get('status') || 'todos';
      const currentDraw = params.get('draw') || 'todos';
      const currentPerPage = (params.get('perPage') || '25').toString();

      if (
        userSearchQuery !== currentSearch ||
        userStatusFilter !== currentStatus ||
        userDrawFilter !== currentDraw ||
        userPerPage.toString() !== currentPerPage
      ) {
        router.get('/admin/usuarios', {
          search: userSearchQuery,
          status: userStatusFilter,
          draw: userDrawFilter,
          perPage: userPerPage,
        }, {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [userSearchQuery, userStatusFilter, userDrawFilter, userPerPage]);

  const openCreateModal = () => {
    setParticipantModalMode('create');
    setEditingUserId(null);
    clearErrors();
    reset();
    setData({ ...EMPTY_FORM });
  };

  const openEditModal = (user) => {
    setParticipantModalMode('edit');
    setEditingUserId(user.id);
    clearErrors();
    setData({
      name: user.name || '',
      dni: user.dni || '',
      phone: user.phone === '-' ? '' : (user.phone || ''),
      department: user.department || '',
      address: user.address || '',
      status: user.status || 'activo',
    });
    setDetailUser(null);
  };

  const closeParticipantModal = () => {
    setParticipantModalMode(null);
    setEditingUserId(null);
    clearErrors();
    reset();
    setData({ ...EMPTY_FORM });
  };

  const submitParticipantForm = (e) => {
    e.preventDefault();

    if (participantModalMode === 'edit' && editingUserId) {
      put(`/admin/usuarios/${editingUserId}`, {
        preserveScroll: true,
        onSuccess: closeParticipantModal,
      });
      return;
    }

    post('/admin/usuarios', {
      preserveScroll: true,
      onSuccess: closeParticipantModal,
    });
  };

  const handleToggleUserStatus = (userId, currentStatus, userName) => {
    const newStatus = currentStatus === 'activo' ? 'bloqueado' : 'activo';
    const actionText = newStatus === 'bloqueado'
      ? `¿Bloquear a ${userName}? No podrá registrar nuevas compras mientras siga bloqueado.`
      : `¿Reactivar a ${userName}?`;

    if (window.confirm(actionText)) {
      router.post(`/admin/usuarios/${userId}/toggle-status`, {}, {
        preserveScroll: true,
      });
    }
  };

  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`¿Eliminar definitivamente a ${userName}?\nSolo se puede si no tiene compras activas o pendientes.`)) {
      router.delete(`/admin/usuarios/${userId}`, {
        preserveScroll: true,
      });
    }
  };

  const exportUsersToCsv = () => {
    if (!adminUsers.length) {
      window.alert('No hay participantes para exportar con los filtros actuales.');
      return;
    }

    const headers = [
      'ID',
      'Nombre',
      'DNI',
      'Telefono',
      'Departamento',
      'Direccion',
      'FechaRegistro',
      'Estado',
      'TotalCompras',
      'TotalTickets',
      'TotalGastado',
      'SorteosParticipados',
    ];

    const rows = adminUsers.map((user) => [
      user.id,
      user.name || '',
      user.dni || '',
      user.phone || '',
      user.department || '',
      user.address || '',
      user.registeredAt || '',
      user.status || '',
      user.totalCompras ?? 0,
      user.totalTickets ?? 0,
      Number(user.totalGastado || 0).toFixed(2),
      Array.isArray(user.draws) ? user.draws.join(' | ') : '',
    ]);

    const escapeCell = (value) => `"${(value ?? '').toString().replace(/"/g, '""')}"`;
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `participantes_campoagro_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const totalParticipantes = participantStats.total ?? adminUsersPaginated?.total ?? 0;
  const participantesActivos = participantStats.activeWithPurchases ?? 0;
  const cuentasBaneadas = participantStats.blocked ?? 0;

  return (
    <AdminLayout currentView="admin-users">
      <Head title="Gestión de Participantes | Admin Campoagro" />

      {flash?.success && (
        <div className="mb-4 text-sm text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 font-bold">
          {flash.success}
        </div>
      )}
      {flash?.error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200 font-bold">
          {flash.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-xl">
            <Users className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Participantes</p>
            <p className="text-3xl font-black text-slate-900">{totalParticipantes}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-amber-100 p-4 rounded-xl">
            <Ticket className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Participantes Activos</p>
            <p className="text-3xl font-black text-slate-900">{participantesActivos}</p>
            <p className="text-xs text-slate-400 font-medium">Con al menos una compra registrada</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-red-100 p-4 rounded-xl">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Cuentas Bloqueadas</p>
            <p className="text-3xl font-black text-red-600">{cuentasBaneadas}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 mb-6">
        <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, DNI, celular o direccion..."
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
              {sorteosData.map((sorteo) => (
                <option key={sorteo.id} value={sorteo.nombre}>
                  {sorteo.nombre}
                </option>
              ))}
            </select>

            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
              className="border border-slate-200 text-sm font-bold text-slate-600 py-2.5 px-4 rounded-xl focus:outline-none focus:border-emerald-500"
            >
              <option value="todos">Todos los Participantes</option>
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
              <Upload className="w-4 h-4" />
              Exportar DB
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nuevo participante
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-[0.18em]">CRUD completo</p>
          <p className="text-sm font-medium text-emerald-900 mt-1">
            Desde esta pantalla ya puedes crear, ver detalle, editar, bloquear/reactivar y eliminar participantes.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1220px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 font-bold">Participante</th>
                <th className="p-4 font-bold">Documento</th>
                <th className="p-4 font-bold">Contacto</th>
                <th className="p-4 font-bold">Compras / Tickets</th>
                <th className="p-4 font-bold">Sorteos</th>
                <th className="p-4 font-bold text-center">Estado</th>
                <th className="p-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-slate-100">
              {adminUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`transition-colors ${user.status === 'bloqueado' ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg ${user.status === 'bloqueado' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {(user.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold text-base ${user.status === 'bloqueado' ? 'text-red-900' : 'text-slate-900'}`}>
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">Registrado: {user.date}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <p className="font-mono font-bold text-slate-700">{user.dni}</p>
                    <p className="text-xs text-slate-400 font-medium">ID #{user.id}</p>
                  </td>

                  <td className="p-4">
                    <div className="space-y-1.5">
                      <p className="text-slate-700 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        {user.phone || 'Sin telefono'}
                      </p>
                      <p className="text-slate-500 text-xs flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        {user.department || 'Sin departamento'}
                      </p>
                      {user.phone && user.phone !== '-' && (
                        <a
                          href={`https://wa.me/51${user.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-600 hover:underline font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="text-slate-900 font-black">{user.totalCompras} compra{user.totalCompras === 1 ? '' : 's'}</p>
                      <p className="text-slate-600 text-xs font-bold">{user.totalTickets} tickets vinculados</p>
                      <p className="text-emerald-700 text-xs font-black">{formatCurrency(user.totalGastado)}</p>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(user.draws) && user.draws.length > 0 ? (
                        user.draws.map((drawName) => (
                          <span
                            key={`${user.id}-${drawName}`}
                            className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 max-w-[160px] truncate"
                            title={drawName}
                          >
                            {drawName}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Sin sorteos todavía</span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <StatusBadge status={user.status} />
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 p-2 rounded-lg transition-colors shadow-sm"
                        title="Ver detalle"
                        onClick={() => setDetailUser(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 p-2 rounded-lg transition-colors shadow-sm"
                        title="Editar participante"
                        onClick={() => openEditModal(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className={`border p-2 rounded-lg transition-colors shadow-sm ${
                          user.status === 'activo'
                            ? 'bg-white hover:bg-red-50 text-red-600 border-red-200'
                            : 'bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200'
                        }`}
                        title={user.status === 'activo' ? 'Bloquear participante' : 'Reactivar participante'}
                        onClick={() => handleToggleUserStatus(user.id, user.status, user.name)}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="bg-white hover:bg-red-50 text-red-600 border border-red-200 p-2 rounded-lg transition-colors shadow-sm"
                        title="Eliminar participante"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {adminUsers.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">No se encontraron participantes con esos filtros.</p>
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
                  <span
                    className="px-3 py-1.5 border border-slate-200 text-slate-400 rounded-lg bg-white cursor-not-allowed text-xs font-bold"
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => router.get(link.url, {
                      search: userSearchQuery,
                      status: userStatusFilter,
                      draw: userDrawFilter,
                      perPage: userPerPage,
                    }, {
                      preserveState: true,
                      preserveScroll: true,
                    })}
                    className={`px-3 py-1.5 border border-slate-200 rounded-lg transition-colors text-xs font-bold ${
                      link.active ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {participantModalMode && (
        <ParticipantFormModal
          mode={participantModalMode}
          data={data}
          setData={setData}
          errors={errors}
          processing={processing}
          onClose={closeParticipantModal}
          onSubmit={submitParticipantForm}
        />
      )}

      {detailUser && (
        <ParticipantDetailModal
          participant={detailUser}
          onClose={() => setDetailUser(null)}
          onEdit={openEditModal}
        />
      )}
    </AdminLayout>
  );
}
