import React, { useCallback, useRef, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
  AlertCircleIcon,
  AwardIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
  EyeIcon,
  FilterIcon,
  ImageIcon,
  LoaderIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  TicketIcon,
  Trash2Icon,
  TrophyIcon,
  UploadIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';

const getToday = () => new Date().toISOString().slice(0, 10);

const getDefaultForm = () => ({
  sorteo_id: '',
  premio_id: '',
  ticket_id: '',
  fecha_sorteo: getToday(),
  imagen: '',
  tipo: 'manual',
  destacado: false,
});

const winnerTypeStyles = {
  automatico: 'bg-emerald-100 text-emerald-700',
  manual: 'bg-blue-100 text-blue-700',
};

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function getWinnerInitial(name) {
  return name && name !== '—' ? name.charAt(0).toUpperCase() : '?';
}

function WinnerBadge({ tipo }) {
  const classes = winnerTypeStyles[tipo] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${classes}`}>
      {tipo === 'automatico' ? 'Ruleta' : 'Manual'}
    </span>
  );
}

function WinnerDetailModal({ winner, onClose, onEdit, onDelete, onPreview }) {
  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">
              Ficha del ganador
            </p>
            <h2 className="text-xl font-black text-slate-900 mt-1">{winner.cliente}</h2>
            <p className="text-sm text-slate-500 mt-1">
              Ticket {winner.ticket} · {winner.sorteo}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(winner)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <EditIcon className="w-4 h-4" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(winner)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2Icon className="w-4 h-4" />
              Eliminar
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <XIcon className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Ganador</p>
              <p className="mt-2 text-lg font-black text-slate-900">{winner.cliente}</p>
              <p className="text-xs text-slate-500 mt-1">DNI: {winner.dni}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Premio</p>
              <p className="mt-2 text-lg font-black text-slate-900">{winner.premio}</p>
              <p className="text-xs text-slate-500 mt-1">{winner.sorteo}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Ticket</p>
              <p className="mt-2 text-lg font-black text-slate-900 font-mono">{winner.ticket}</p>
              <p className="text-xs text-slate-500 mt-1">Fecha: {winner.fecha_sorteo}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Estado visual</p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <WinnerBadge tipo={winner.tipo} />
                {winner.destacado && (
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                    Destacado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">Registrado: {winner.created_at}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Datos del participante</p>
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-bold text-slate-900">Nombre: <span className="font-medium">{winner.cliente}</span></p>
                <p className="font-bold text-slate-900">DNI: <span className="font-medium">{winner.dni}</span></p>
                <p className="font-bold text-slate-900">Telefono: <span className="font-medium">{winner.telefono}</span></p>
                <p className="font-bold text-slate-900">Departamento: <span className="font-medium">{winner.departamento}</span></p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Foto del ganador</p>
              <div className="mt-3">
                {winner.imagen ? (
                  <button type="button" onClick={() => onPreview(winner.imagen)} className="group relative">
                    <img
                      src={winner.imagen}
                      alt={winner.cliente}
                      className="w-full max-h-72 object-cover rounded-2xl border-2 border-slate-200 group-hover:border-emerald-400 transition-colors"
                    />
                    <span className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                      <EyeIcon className="w-6 h-6 text-white" />
                    </span>
                  </button>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-4 py-10 text-center text-slate-400">
                    <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-bold">Sin foto registrada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WinnerFormModal({
  mode,
  formData,
  setFormData,
  sorteos,
  premios,
  dniInput,
  setDniInput,
  clienteInfo,
  clienteTickets,
  dniError,
  dniLoading,
  uploading,
  previewImg,
  submitting,
  fileRef,
  onClose,
  onSubmit,
  onSorteoChange,
  onBuscarDni,
  onUpload,
  onRemoveImage,
}) {
  const isEditing = mode === 'edit';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AwardIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="font-black text-slate-800 text-lg">
              {isEditing ? 'Editar ganador' : 'Registrar ganador manual'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">
                <TrophyIcon className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                Sorteo *
              </label>
              <select
                required
                value={formData.sorteo_id}
                onChange={(e) => onSorteoChange(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="">— Selecciona el sorteo —</option>
                {sorteos.map((sorteo) => (
                  <option key={sorteo.id} value={sorteo.id}>{sorteo.nombre} ({sorteo.estado})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">
                <AwardIcon className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                Tipo de registro *
              </label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => setFormData((prev) => ({ ...prev, tipo: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="manual">Manual</option>
                <option value="automatico">Automatico</option>
              </select>
            </div>
          </div>

          {formData.sorteo_id && (
            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">
                <UserIcon className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
                DNI del ganador *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dniInput}
                  onChange={(e) => {
                    setDniInput(e.target.value.replace(/\D/g, '').slice(0, 8));
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onBuscarDni())}
                  placeholder="Ingresa el DNI..."
                  maxLength={8}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
                <button
                  type="button"
                  onClick={onBuscarDni}
                  disabled={dniLoading}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
                >
                  {dniLoading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
                  Buscar
                </button>
              </div>
              {dniError && (
                <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1">
                  <AlertCircleIcon className="w-3.5 h-3.5" />
                  {dniError}
                </p>
              )}
            </div>
          )}

          {clienteInfo && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-black shrink-0">
                {getWinnerInitial(clienteInfo.name)}
              </div>
              <div>
                <p className="font-black text-emerald-800 text-sm">{clienteInfo.name}</p>
                <p className="text-xs text-emerald-600">
                  DNI: {clienteInfo.dni} · Tel: {clienteInfo.telefono} · Loc: {clienteInfo.departamento || '—'}
                </p>
              </div>
              <CheckCircle2Icon className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />
            </div>
          )}

          {clienteTickets.length > 1 && (
            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">
                <TicketIcon className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />
                Ticket ganador *
              </label>
              <select
                required
                value={formData.ticket_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, ticket_id: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="">— Selecciona el ticket ganador —</option>
                {clienteTickets.map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    Ticket #{ticket.numero} ({ticket.estado})
                  </option>
                ))}
              </select>
            </div>
          )}

          {clienteTickets.length === 1 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
              <TicketIcon className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-sm font-bold text-indigo-800">
                Ticket seleccionado: <span className="font-mono">#{clienteTickets[0].numero}</span>
              </span>
              <CheckCircle2Icon className="w-4 h-4 text-indigo-500 ml-auto shrink-0" />
            </div>
          )}

          {formData.sorteo_id && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">
                  <AwardIcon className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                  Premio *
                </label>
                {premios.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Este sorteo no tiene premios configurados.</p>
                ) : (
                  <select
                    required
                    value={formData.premio_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, premio_id: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    <option value="">— Selecciona el premio —</option>
                    {premios.map((premio) => (
                      <option key={premio.id} value={premio.id}>{premio.nombre}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                  Fecha del sorteo *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_sorteo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fecha_sorteo: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
            </div>
          )}

          {formData.sorteo_id && (
            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">
                <ImageIcon className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                Foto del ganador / entrega (opcional)
              </label>
              <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={onUpload} />
              {previewImg ? (
                <div className="relative inline-block">
                  <img src={previewImg} alt="preview" className="h-28 w-auto rounded-xl border-2 border-emerald-300 object-cover" />
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors w-full justify-center"
                >
                  {uploading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
                  {uploading ? 'Subiendo imagen...' : 'Haz clic para subir una foto'}
                </button>
              )}
            </div>
          )}

          {formData.sorteo_id && (
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">Destacar en carrusel</p>
                <p className="text-xs text-slate-500">Aparecerá en la sección de ganadores destacados del sitio.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.destacado}
                  onChange={(e) => setFormData((prev) => ({ ...prev, destacado: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.sorteo_id || !formData.ticket_id || !formData.premio_id}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              {submitting ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <CheckCircle2Icon className="w-4 h-4" />}
              {isEditing ? 'Guardar cambios' : 'Registrar ganador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Ganadores({ ganadores, sorteos, stats, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search || '');
  const [sorteoFil, setSorteoFil] = useState(filters.sorteo_id || '');
  const [tipoFil, setTipoFil] = useState(filters.tipo || '');

  const [modalMode, setModalMode] = useState(null);
  const [editingWinner, setEditingWinner] = useState(null);
  const [detailWinner, setDetailWinner] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [winnerToDelete, setWinnerToDelete] = useState(null);

  const [formData, setFormData] = useState(getDefaultForm());
  const [dniInput, setDniInput] = useState('');
  const [clienteInfo, setClienteInfo] = useState(null);
  const [clienteTickets, setClienteTickets] = useState([]);
  const [premios, setPremios] = useState([]);
  const [dniError, setDniError] = useState('');
  const [dniLoading, setDniLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImg, setPreviewImg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const applyFilters = useCallback(() => {
    router.get('/admin/ganadores', {
      search: search || undefined,
      sorteo_id: sorteoFil || undefined,
      tipo: tipoFil || undefined,
      perPage: filters.perPage,
    }, { preserveState: true, replace: true });
  }, [filters.perPage, search, sorteoFil, tipoFil]);

  const resetFormState = () => {
    setFormData(getDefaultForm());
    setDniInput('');
    setClienteInfo(null);
    setClienteTickets([]);
    setPremios([]);
    setDniError('');
    setDniLoading(false);
    setUploading(false);
    setPreviewImg('');
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const closeFormModal = () => {
    setModalMode(null);
    setEditingWinner(null);
    resetFormState();
  };

  const fetchPremios = async (sorteoId) => {
    if (!sorteoId) {
      setPremios([]);
      return [];
    }

    try {
      const response = await fetch(`/admin/api/ganadores/premios/${sorteoId}`);
      const data = await response.json();
      setPremios(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch {
      setPremios([]);
      return [];
    }
  };

  const fetchClienteTickets = async ({ dni, sorteoId, preferredTicketId = '' }) => {
    if (!sorteoId) {
      setDniError('Primero selecciona un sorteo.');
      return false;
    }

    if (!dni.trim()) {
      setDniError('Ingresa el DNI.');
      return false;
    }

    setDniLoading(true);
    setDniError('');
    setClienteInfo(null);
    setClienteTickets([]);
    setFormData((prev) => ({ ...prev, ticket_id: '' }));

    try {
      const response = await fetch(`/admin/api/ganadores/cliente-tickets?dni=${encodeURIComponent(dni.trim())}&sorteo_id=${sorteoId}`);
      const data = await response.json();

      if (!response.ok) {
        setDniError(data.error || 'Error al buscar el cliente.');
        return false;
      }

      setClienteInfo(data.user);
      setClienteTickets(data.tickets);

      const normalizedPreferred = preferredTicketId ? String(preferredTicketId) : '';
      const preferredExists = normalizedPreferred && data.tickets.some((ticket) => String(ticket.id) === normalizedPreferred);
      const selectedTicketId = preferredExists
        ? normalizedPreferred
        : data.tickets.length === 1
          ? String(data.tickets[0].id)
          : '';

      setFormData((prev) => ({ ...prev, ticket_id: selectedTicketId }));
      return true;
    } catch {
      setDniError('Error de conexión. Intenta de nuevo.');
      return false;
    } finally {
      setDniLoading(false);
    }
  };

  const openCreateModal = () => {
    resetFormState();
    setModalMode('create');
    setEditingWinner(null);
  };

  const openEditModal = async (winner) => {
    setDetailWinner(null);
    setModalMode('edit');
    setEditingWinner(winner);
    resetFormState();

    setFormData({
      sorteo_id: winner.sorteo_id ? String(winner.sorteo_id) : '',
      premio_id: winner.premio_id ? String(winner.premio_id) : '',
      ticket_id: winner.ticket_id ? String(winner.ticket_id) : '',
      fecha_sorteo: winner.fecha_sorteo_input || getToday(),
      imagen: winner.imagen_path || '',
      tipo: winner.tipo || 'manual',
      destacado: Boolean(winner.destacado),
    });

    setPreviewImg(winner.imagen || '');

    const currentDni = winner.dni && winner.dni !== '—' ? winner.dni : '';
    if (currentDni) {
      setDniInput(currentDni);
    }

    if (winner.cliente && winner.cliente !== '—') {
      setClienteInfo({
        id: winner.cliente_id || null,
        name: winner.cliente,
        dni: currentDni || '—',
        telefono: winner.telefono || '—',
        departamento: winner.departamento || '—',
      });
    }

    await fetchPremios(winner.sorteo_id);

    if (currentDni) {
      const found = await fetchClienteTickets({
        dni: currentDni,
        sorteoId: winner.sorteo_id,
        preferredTicketId: winner.ticket_id,
      });

      if (!found) {
        setClienteInfo({
          id: winner.cliente_id || null,
          name: winner.cliente,
          dni: currentDni,
          telefono: winner.telefono || '—',
          departamento: winner.departamento || '—',
        });
        setClienteTickets(winner.ticket_id ? [{
          id: winner.ticket_id,
          numero: winner.ticket,
          estado: 'ganador actual',
        }] : []);
        setFormData((prev) => ({ ...prev, ticket_id: winner.ticket_id ? String(winner.ticket_id) : '' }));
      }
    } else if (winner.ticket_id) {
      setClienteTickets([{
        id: winner.ticket_id,
        numero: winner.ticket,
        estado: 'ganador actual',
      }]);
    }
  };

  const handleSorteoChange = async (sorteoId) => {
    setFormData((prev) => ({
      ...prev,
      sorteo_id: sorteoId,
      premio_id: '',
      ticket_id: '',
    }));
    setClienteInfo(null);
    setClienteTickets([]);
    setDniInput('');
    setDniError('');
    await fetchPremios(sorteoId);
  };

  const handleBuscarDni = async () => {
    await fetchClienteTickets({
      dni: dniInput,
      sorteoId: formData.sorteo_id,
    });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const payload = new FormData();
    payload.append('image', file);

    try {
      const response = await fetch('/admin/ganadores/upload-image', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': getCsrfToken() },
        body: payload,
      });
      const data = await response.json();
      setFormData((prev) => ({ ...prev, imagen: data.path }));
      setPreviewImg(data.url);
    } catch {
      // noop
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImg('');
    setFormData((prev) => ({ ...prev, imagen: '' }));
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      imagen: formData.imagen || '',
    };

    const options = {
      preserveScroll: true,
      onSuccess: () => closeFormModal(),
      onFinish: () => setSubmitting(false),
    };

    if (modalMode === 'edit' && editingWinner) {
      router.put(`/admin/ganadores/${editingWinner.id}`, payload, options);
      return;
    }

    router.post('/admin/ganadores', payload, options);
  };

  const toggleDestacado = (winner) => {
    router.put(`/admin/ganadores/${winner.id}`, {
      destacado: !winner.destacado,
    }, {
      preserveScroll: true,
    });
  };

  const confirmDelete = () => {
    if (!winnerToDelete) return;

    router.delete(`/admin/ganadores/${winnerToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setWinnerToDelete(null);
        setDetailWinner(null);
      },
    });
  };

  const { data: rows, current_page, last_page, prev_page_url, next_page_url, from, to, total } = ganadores;

  const goToPage = (url) => {
    if (!url) return;
    const params = new URL(url, window.location.origin).searchParams;
    router.get('/admin/ganadores', Object.fromEntries(params), { preserveState: true, replace: true });
  };

  return (
    <AdminLayout currentView="admin-ganadores">
      <Head title="Gestión de Ganadores | Sorteos Campoagro" />

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Gestión de Ganadores</h1>
          <p className="text-slate-500 text-sm mt-1">Registro, edición y consulta detallada de ganadores por sorteo.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Registrar Ganador
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Ganadores', value: stats.total, icon: <AwardIcon className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-50', color: 'text-amber-700' },
          { label: 'Automáticos (Ruleta)', value: stats.automaticos, icon: <TrophyIcon className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-50', color: 'text-emerald-700' },
          { label: 'Registrados Manual', value: stats.manuales, icon: <UserIcon className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50', color: 'text-blue-700' },
        ].map((card, index) => (
          <div key={index} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`${card.bg} p-3 rounded-xl shrink-0`}>{card.icon}</div>
            <div>
              <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
              <p className="text-xs font-bold text-slate-500 leading-tight">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Buscar</label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Nombre, DNI o N° ticket..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>

        <div className="min-w-[180px]">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Sorteo</label>
          <select
            value={sorteoFil}
            onChange={(e) => setSorteoFil(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="">Todos los sorteos</option>
            {sorteos.map((sorteo) => (
              <option key={sorteo.id} value={sorteo.id}>{sorteo.nombre}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[150px]">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Tipo</label>
          <select
            value={tipoFil}
            onChange={(e) => setTipoFil(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="">Todos</option>
            <option value="automatico">Automatico</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <button
          onClick={applyFilters}
          className="flex items-center gap-2 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-emerald-700 transition-colors"
        >
          <FilterIcon className="w-4 h-4" />
          Filtrar
        </button>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 mb-6">
        <p className="text-xs font-bold text-emerald-700 uppercase tracking-[0.18em]">CRUD completo</p>
        <p className="text-sm font-medium text-emerald-900 mt-1">
          Aquí ya puedes crear, ver detalle, editar completamente, destacar y eliminar ganadores.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1180px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Ganador', 'Sorteo', 'Premio', 'N° Ticket', 'Tipo', 'Fecha', 'Foto', 'Dest.', 'Acciones'].map((header) => (
                  <th key={header} className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400">
                    <AwardIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">No hay ganadores registrados aún.</p>
                    <p className="text-xs mt-1">Los ganadores de la ruleta y los registros manuales aparecerán aquí.</p>
                  </td>
                </tr>
              )}

              {rows.map((winner) => (
                <tr key={winner.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
                        {getWinnerInitial(winner.cliente)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{winner.cliente}</p>
                        <p className="text-xs text-slate-400">DNI: {winner.dni} · Loc: {winner.departamento}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-700 text-xs leading-tight block max-w-[150px] line-clamp-2">{winner.sorteo}</span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {winner.premio_imagen && (
                        <img src={winner.premio_imagen} alt={winner.premio} className="w-7 h-7 rounded-lg object-cover border border-slate-100" />
                      )}
                      <span className="font-semibold text-slate-700 text-xs">{winner.premio}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">{winner.ticket}</span>
                  </td>

                  <td className="px-4 py-3">
                    <WinnerBadge tipo={winner.tipo} />
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500">{winner.fecha_sorteo}</span>
                  </td>

                  <td className="px-4 py-3">
                    {winner.imagen ? (
                      <button type="button" onClick={() => setLightbox(winner.imagen)} className="group relative">
                        <img src={winner.imagen} alt={winner.cliente} className="w-10 h-10 rounded-xl object-cover border-2 border-slate-200 group-hover:border-emerald-400 transition-colors" />
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 rounded-xl transition-opacity">
                          <EyeIcon className="w-4 h-4 text-white" />
                        </span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-300 italic">Sin foto</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleDestacado(winner)}
                      className={`p-2 rounded-xl transition-all ${winner.destacado ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-slate-50 text-slate-300 hover:text-slate-400'}`}
                      title={winner.destacado ? 'Quitar de destacados' : 'Marcar como destacado'}
                    >
                      <StarIcon className={`w-5 h-5 ${winner.destacado ? 'fill-amber-500' : ''}`} />
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailWinner(winner)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Ver detalle"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(winner)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Editar ganador"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setWinnerToDelete(winner)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {last_page > 1 && (
          <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
            <span>Mostrando {from}–{to} de {total} ganadores</span>
            <div className="flex gap-1">
              <button
                onClick={() => goToPage(prev_page_url)}
                disabled={!prev_page_url}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold">{current_page}/{last_page}</span>
              <button
                onClick={() => goToPage(next_page_url)}
                disabled={!next_page_url}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalMode && (
        <WinnerFormModal
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          sorteos={sorteos}
          premios={premios}
          dniInput={dniInput}
          setDniInput={setDniInput}
          clienteInfo={clienteInfo}
          clienteTickets={clienteTickets}
          dniError={dniError}
          dniLoading={dniLoading}
          uploading={uploading}
          previewImg={previewImg}
          submitting={submitting}
          fileRef={fileRef}
          onClose={closeFormModal}
          onSubmit={handleSubmit}
          onSorteoChange={handleSorteoChange}
          onBuscarDni={handleBuscarDni}
          onUpload={handleUpload}
          onRemoveImage={handleRemoveImage}
        />
      )}

      {detailWinner && (
        <WinnerDetailModal
          winner={detailWinner}
          onClose={() => setDetailWinner(null)}
          onEdit={openEditModal}
          onDelete={(winner) => setWinnerToDelete(winner)}
          onPreview={setLightbox}
        />
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="ganador" className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl" />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {winnerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2Icon className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-2">¿Eliminar ganador?</h3>
            <p className="text-sm text-slate-500 mb-2">{winnerToDelete.cliente} · Ticket {winnerToDelete.ticket}</p>
            <p className="text-sm text-slate-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setWinnerToDelete(null)}
                className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
