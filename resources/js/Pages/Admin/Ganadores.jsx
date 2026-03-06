import React, { useState, useCallback, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
  AwardIcon, PlusIcon, SearchIcon, FilterIcon, Trash2Icon,
  ImageIcon, XIcon, CheckCircle2Icon, UserIcon, TicketIcon,
  TrophyIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon,
  EditIcon, UploadIcon, EyeIcon, AlertCircleIcon, LoaderIcon, StarIcon
} from 'lucide-react';

// Lee el CSRF token de la cookie XSRF-TOKEN que Laravel configura automáticamente
function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export default function Ganadores({ ganadores, sorteos, stats, filters }) {
  const { flash } = usePage().props;

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [search, setSearch]     = useState(filters.search || '');
  const [sorteoFil, setSorteoFil] = useState(filters.sorteo_id || '');
  const [tipoFil, setTipoFil]   = useState(filters.tipo || '');

  const applyFilters = useCallback(() => {
    router.get('/admin/ganadores', {
      search: search || undefined,
      sorteo_id: sorteoFil || undefined,
      tipo: tipoFil || undefined,
      perPage: filters.perPage,
    }, { preserveState: true, replace: true });
  }, [search, sorteoFil, tipoFil, filters.perPage]);

  // ── Modal Nuevo Ganador ──────────────────────────────────────────────────
  const [showModal, setShowModal]   = useState(false);
  const [formData, setFormData]     = useState({
    sorteo_id: '', premio_id: '', ticket_id: '', user_id: '',
    fecha_sorteo: new Date().toISOString().slice(0, 10), imagen: '',
    destacado: false,
  });
  const [dniInput, setDniInput]     = useState('');
  const [clienteInfo, setClienteInfo] = useState(null);
  const [clienteTickets, setClienteTickets] = useState([]);
  const [premios, setPremios]       = useState([]);
  const [dniError, setDniError]     = useState('');
  const [dniLoading, setDniLoading] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [previewImg, setPreviewImg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  // Modal editar imagen
  const [showEditModal, setShowEditModal]   = useState(false);
  const [editGanador, setEditGanador]       = useState(null);
  const [editImg, setEditImg]               = useState('');
  const [editPreview, setEditPreview]       = useState('');
  const [editUploading, setEditUploading]   = useState(false);
  const editFileRef = useRef();

  // Modal ver imagen
  const [lightbox, setLightbox] = useState(null);

  // ── Confirmar eliminar ───────────────────────────────────────────────────
  const [deleteId, setDeleteId] = useState(null);

  // ── Al cambiar sorteo en el modal → limpiar cliente y cargar premios ─────
  const handleSorteoChange = async (sorteoId) => {
    setFormData(f => ({ ...f, sorteo_id: sorteoId, premio_id: '', ticket_id: '', user_id: '' }));
    setClienteInfo(null);
    setClienteTickets([]);
    setDniInput('');
    setDniError('');
    setPremios([]);

    if (!sorteoId) return;

    try {
      const res = await fetch(`/admin/api/ganadores/premios/${sorteoId}`);
      const data = await res.json();
      setPremios(data);
    } catch {
      setPremios([]);
    }
  };

  // ── Buscar cliente por DNI ────────────────────────────────────────────────
  const handleDniBuscar = async () => {
    if (!formData.sorteo_id) { setDniError('Primero selecciona un sorteo.'); return; }
    if (!dniInput.trim())    { setDniError('Ingresa el DNI.'); return; }

    setDniLoading(true);
    setDniError('');
    setClienteInfo(null);
    setClienteTickets([]);
    setFormData(f => ({ ...f, ticket_id: '', user_id: '' }));

    try {
      const res  = await fetch(`/admin/api/ganadores/cliente-tickets?dni=${encodeURIComponent(dniInput.trim())}&sorteo_id=${formData.sorteo_id}`);
      const data = await res.json();

      if (!res.ok) {
        setDniError(data.error || 'Error al buscar el cliente.');
      } else {
        setClienteInfo(data.user);
        setClienteTickets(data.tickets);
        const uid = data.user.id;
        const firstTicket = data.tickets.length === 1 ? data.tickets[0].id : '';
        setFormData(f => ({ ...f, user_id: uid, ticket_id: firstTicket.toString() }));
      }
    } catch {
      setDniError('Error de conexión. Intenta de nuevo.');
    } finally {
      setDniLoading(false);
    }
  };

  // ── Upload imagen (modal nuevo) ──────────────────────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res  = await fetch('/admin/ganadores/upload-image', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': getCsrfToken() },
        body: fd,
      });
      const data = await res.json();
      setFormData(f => ({ ...f, imagen: data.path }));
      setPreviewImg(data.url);
    } catch { /* noop */ } finally {
      setUploading(false);
    }
  };

  // ── Submit nuevo ganador ─────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    router.post('/admin/ganadores', formData, {
      onSuccess: () => {
        setShowModal(false);
        resetModal();
      },
      onFinish: () => setSubmitting(false),
    });
  };

  const resetModal = () => {
    setFormData({ sorteo_id: '', premio_id: '', ticket_id: '', user_id: '',
      fecha_sorteo: new Date().toISOString().slice(0, 10), imagen: '', destacado: false });
    setDniInput(''); setClienteInfo(null); setClienteTickets([]);
    setDniError(''); setPremios([]); setPreviewImg(''); setUploading(false);
  };

  const toggleDestacado = (ganador) => {
    router.put(`/admin/ganadores/${ganador.id}`, { 
      destacado: !ganador.destacado 
    }, { preserveScroll: true });
  };

  // ── Upload imagen (modal editar) ─────────────────────────────────────────
  const handleEditUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res  = await fetch('/admin/ganadores/upload-image', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': getCsrfToken() },
        body: fd,
      });
      const data = await res.json();
      setEditImg(data.path);
      setEditPreview(data.url);
    } catch { /* noop */ } finally {
      setEditUploading(false);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    router.put(`/admin/ganadores/${editGanador.id}`, { imagen: editImg }, {
      onSuccess: () => { setShowEditModal(false); setEditGanador(null); setEditImg(''); setEditPreview(''); },
    });
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────
  const confirmDelete = () => {
    if (!deleteId) return;
    router.delete(`/admin/ganadores/${deleteId}`, {
      onSuccess: () => setDeleteId(null),
    });
  };

  // ── Paginación ────────────────────────────────────────────────────────────
  const { data: rows, current_page, last_page, prev_page_url, next_page_url, from, to, total } = ganadores;

  const goToPage = (url) => {
    if (!url) return;
    const params = new URL(url, window.location.origin).searchParams;
    router.get('/admin/ganadores', Object.fromEntries(params), { preserveState: true, replace: true });
  };

  return (
    <AdminLayout currentView="admin-ganadores">
      <Head title="Gestión de Ganadores | Sorteos Campoagro" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Gestión de Ganadores</h1>
          <p className="text-slate-500 text-sm mt-1">Registro de ganadores por sorteo — automáticos y manuales</p>
        </div>
        <button
          onClick={() => { setShowModal(true); resetModal(); }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" /> Registrar Ganador
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Ganadores', value: stats.total, icon: <AwardIcon className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-50', color: 'text-amber-700' },
          { label: 'Automáticos (Ruleta)', value: stats.automaticos, icon: <TrophyIcon className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-50', color: 'text-emerald-700' },
          { label: 'Registrados Manual', value: stats.manuales, icon: <UserIcon className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50', color: 'text-blue-700' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-xl shrink-0`}>{s.icon}</div>
            <div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs font-bold text-slate-500 leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Buscar</label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder="Nombre, DNI o Nº ticket..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>
        <div className="min-w-[180px]">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Sorteo</label>
          <select
            value={sorteoFil}
            onChange={e => setSorteoFil(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="">Todos los sorteos</option>
            {sorteos.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
        <div className="min-w-[150px]">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Tipo</label>
          <select
            value={tipoFil}
            onChange={e => setTipoFil(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="">Todos</option>
            <option value="automatico">Automático (Ruleta)</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <button
          onClick={applyFilters}
          className="flex items-center gap-2 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-emerald-700 transition-colors"
        >
          <FilterIcon className="w-4 h-4" /> Filtrar
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Ganador', 'Sorteo', 'Premio', 'N° Ticket', 'Tipo', 'Fecha', 'Foto', 'Dest.', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    <AwardIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">No hay ganadores registrados aún.</p>
                    <p className="text-xs mt-1">Los ganadores de la ruleta aparecerán aquí automáticamente.</p>
                  </td>
                </tr>
              )}
              {rows.map(g => (
                <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Ganador */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
                        {g.cliente.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{g.cliente}</p>
                        <p className="text-xs text-slate-400">DNI: {g.dni} • Loc: {g.departamento}</p>
                      </div>
                    </div>
                  </td>
                  {/* Sorteo */}
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-700 text-xs leading-tight block max-w-[150px] line-clamp-2">{g.sorteo}</span>
                  </td>
                  {/* Premio */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {g.premio_imagen && (
                        <img src={g.premio_imagen} alt="" className="w-7 h-7 rounded-lg object-cover border border-slate-100" />
                      )}
                      <span className="font-semibold text-slate-700 text-xs">{g.premio}</span>
                    </div>
                  </td>
                  {/* Ticket */}
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">{g.ticket}</span>
                  </td>
                  {/* Tipo */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${g.tipo === 'automatico' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {g.tipo === 'automatico' ? '🎰 Ruleta' : '✍️ Manual'}
                    </span>
                  </td>
                  {/* Fecha */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500">{g.fecha_sorteo}</span>
                  </td>
                  {/* Foto */}
                  <td className="px-4 py-3">
                    {g.imagen ? (
                      <button onClick={() => setLightbox(g.imagen)} className="group relative">
                        <img src={g.imagen} alt="ganador" className="w-10 h-10 rounded-xl object-cover border-2 border-slate-200 group-hover:border-emerald-400 transition-colors" />
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 rounded-xl transition-opacity">
                          <EyeIcon className="w-4 h-4 text-white" />
                        </span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-300 italic">Sin foto</span>
                    )}
                  </td>
                  {/* Destacado (Carrucel) */}
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => toggleDestacado(g)}
                      className={`p-2 rounded-xl transition-all ${g.destacado ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-slate-50 text-slate-300 hover:text-slate-400'}`}
                      title={g.destacado ? 'Quitar de destacados' : 'Marcar como destacado (Carrusel)'}
                    >
                      <StarIcon className={`w-5 h-5 ${g.destacado ? 'fill-amber-500' : ''}`} />
                    </button>
                  </td>
                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditGanador(g); setEditImg(g.imagen || ''); setEditPreview(g.imagen || ''); setShowEditModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Editar imagen"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(g.id)}
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

        {/* Paginación */}
        {last_page > 1 && (
          <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
            <span>Mostrando {from}–{to} de {total} ganadores</span>
            <div className="flex gap-1">
              <button onClick={() => goToPage(prev_page_url)} disabled={!prev_page_url}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold">{current_page}/{last_page}</span>
              <button onClick={() => goToPage(next_page_url)} disabled={!next_page_url}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════ MODAL: Nuevo Ganador ══════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AwardIcon className="w-5 h-5 text-emerald-600" />
                <h2 className="font-black text-slate-800 text-lg">Registrar Ganador Manual</h2>
              </div>
              <button onClick={() => { setShowModal(false); resetModal(); }} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* 1. Sorteo */}
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">
                  <TrophyIcon className="w-3.5 h-3.5 inline mr-1 text-amber-500" />Sorteo *
                </label>
                <select
                  required
                  value={formData.sorteo_id}
                  onChange={e => handleSorteoChange(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <option value="">— Selecciona el sorteo —</option>
                  {sorteos.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre} ({s.estado})</option>
                  ))}
                </select>
              </div>

              {/* 2. DNI del ganador */}
              {formData.sorteo_id && (
                <div>
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">
                    <UserIcon className="w-3.5 h-3.5 inline mr-1 text-blue-500" />DNI del Ganador *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={dniInput}
                      onChange={e => { setDniInput(e.target.value); setDniError(''); }}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleDniBuscar())}
                      placeholder="Ingresa el DNI..."
                      maxLength={15}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                    <button
                      type="button"
                      onClick={handleDniBuscar}
                      disabled={dniLoading}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
                    >
                      {dniLoading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
                      Buscar
                    </button>
                  </div>
                  {dniError && (
                    <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1">
                      <AlertCircleIcon className="w-3.5 h-3.5" />{dniError}
                    </p>
                  )}
                </div>
              )}

              {/* Info del cliente encontrado */}
              {clienteInfo && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-black shrink-0">
                    {clienteInfo.name.charAt(0).toUpperCase()}
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

              {/* 3. Selector de ticket (solo si tiene más de 1) */}
              {clienteTickets.length > 1 && (
                <div>
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">
                    <TicketIcon className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />
                    Ticket Ganador * — <span className="text-indigo-600 normal-case font-semibold">{clienteTickets.length} tickets encontrados</span>
                  </label>
                  <select
                    required
                    value={formData.ticket_id}
                    onChange={e => setFormData(f => ({ ...f, ticket_id: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    <option value="">— Selecciona el ticket ganador —</option>
                    {clienteTickets.map(t => (
                      <option key={t.id} value={t.id}>Ticket #{t.numero} ({t.estado})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Si tiene 1 solo ticket → mostrar info del ticket */}
              {clienteTickets.length === 1 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                  <TicketIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-sm font-bold text-indigo-800">
                    Ticket seleccionado: <span className="font-mono">#{clienteTickets[0].numero}</span>
                  </span>
                  <CheckCircle2Icon className="w-4 h-4 text-indigo-500 ml-auto shrink-0" />
                </div>
              )}

              {/* 4. Premio */}
              {formData.sorteo_id && (
                <div>
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">
                    <AwardIcon className="w-3.5 h-3.5 inline mr-1 text-amber-500" />Premio *
                  </label>
                  {premios.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Este sorteo no tiene premios configurados.</p>
                  ) : (
                    <select
                      required
                      value={formData.premio_id}
                      onChange={e => setFormData(f => ({ ...f, premio_id: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                      <option value="">— Selecciona el premio —</option>
                      {premios.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* 5. Fecha del sorteo */}
              {formData.sorteo_id && (
                <div>
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 inline mr-1 text-slate-500" />Fecha del sorteo *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_sorteo}
                    onChange={e => setFormData(f => ({ ...f, fecha_sorteo: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
              )}

              {/* 6. Imagen opcional */}
              {formData.sorteo_id && (
                <div>
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">
                    <ImageIcon className="w-3.5 h-3.5 inline mr-1 text-slate-500" />Foto del ganador / entrega (opcional)
                  </label>
                  <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload} />
                  {previewImg ? (
                    <div className="relative inline-block">
                      <img src={previewImg} alt="preview" className="h-28 w-auto rounded-xl border-2 border-emerald-300 object-cover" />
                      <button type="button" onClick={() => { setPreviewImg(''); setFormData(f => ({ ...f, imagen: '' })); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">✕</button>
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

              {/* 7. Destacado */}
              {formData.sorteo_id && (
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">Destacar en Carrusel</p>
                    <p className="text-xs text-slate-500">Aparecerá en la sección "Premios Mayores" de la página de inicio.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.destacado}
                      onChange={e => setFormData(f => ({ ...f, destacado: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetModal(); }}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.sorteo_id || !formData.user_id || !formData.ticket_id || !formData.premio_id}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {submitting ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <CheckCircle2Icon className="w-4 h-4" />}
                  Registrar Ganador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: Editar imagen ══════════════ */}
      {showEditModal && editGanador && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-black text-slate-800 text-lg">Actualizar foto del ganador</h2>
              <button onClick={() => { setShowEditModal(false); setEditGanador(null); }} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-bold text-slate-700 text-sm">{editGanador.cliente}</p>
                <p className="text-xs text-slate-400">DNI: {editGanador.dni} · {editGanador.sorteo}</p>
              </div>

              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-1.5">Foto del ganador</label>
                <input type="file" ref={editFileRef} className="hidden" accept="image/*" onChange={handleEditUpload} />
                {editPreview ? (
                  <div className="relative inline-block">
                    <img src={editPreview} alt="preview" className="h-28 w-auto rounded-xl border-2 border-emerald-300 object-cover" />
                    <button type="button" onClick={() => { setEditPreview(''); setEditImg(''); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => editFileRef.current?.click()} disabled={editUploading}
                    className="flex items-center gap-2 border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors w-full justify-center">
                    {editUploading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
                    {editUploading ? 'Subiendo...' : 'Subir nueva foto'}
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowEditModal(false); setEditGanador(null); }}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-50 text-sm">Cancelar</button>
                <button type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ LIGHTBOX imagen ══════════════ */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="ganador" className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl" />
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ══════════════ MODAL: Confirmar eliminar ══════════════ */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2Icon className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="font-black text-slate-800 text-lg mb-2">¿Eliminar ganador?</h3>
            <p className="text-sm text-slate-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-50 text-sm">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
