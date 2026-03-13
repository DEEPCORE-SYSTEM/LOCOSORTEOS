import {
  User, CheckCircle, Dices, MousePointerClick,
  Minus, Plus, Upload, Loader2, Search
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { PERU_DEPARTAMENTOS } from '../constants/locations';

const TERMS_CONTENT = [
  ['Organizador', 'El sorteo es organizado por CAMPOAGRO.'],
  ['Participación', 'Participan todas las personas mayores de 18 años que cuenten con un ticket oficial del sorteo, disponible en www.campo-agro.com.'],
  ['Fecha del sorteo', 'El sorteo se realizará el 30 de abril mediante selección aleatoria entre todos los tickets participantes.'],
  ['Reclamo del premio', 'Los ganadores deberán presentar su ticket ganador y DNI para reclamar el premio dentro del plazo establecido por la organización.'],
  ['Condiciones', 'Los premios no son transferibles ni canjeables por dinero. La participación implica la aceptación de estos términos y condiciones.'],
];

/**
 * Vista del formulario de compra de tickets.
 */
export default function CheckoutView({
  currentUser,
  sorteo,
  sorteosActivos = [],
  tickets = [],
  settings = {},
  onBack,
  ticketsRouteName = 'participar',
}) {
  const ticketPrice = sorteo?.precio_ticket ? parseFloat(sorteo.precio_ticket) : 0;
  const paymentOptions = [
    settings.yape_numero ? 'yape' : null,
    settings.plin_numero ? 'plin' : null,
  ].filter(Boolean);
  const defaultPaymentMethod = paymentOptions.length === 1 ? paymentOptions[0] : '';

  const yapeNumero  = settings.yape_numero  || '—';
  const plinNumero  = settings.plin_numero  || '—';
  const razonSocial = settings.razon_social || 'INVERSIONES CampoAgro E.I.R.L.';

  const {
    data, setData, processing, errors,
    previewUrl,
    handleIncreaseQty, handleDecreaseQty,
    toggleNumber, handleFileChange,
    handleCheckoutSubmit,
  } = useCheckoutForm({ sorteo, ticketPrice, currentUser, defaultPaymentMethod });

  const handleSorteoChange = (e) => {
    const newSorteoId = e.target.value;
    if (!newSorteoId) return;
    router.get(route(ticketsRouteName), { sorteo_id: newSorteoId }, {
      preserveState: true,
      preserveScroll: true,
      only: ['sorteo', 'tickets', 'flash'],
    });
  };

  const [loadedTickets, setLoadedTickets] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Sincronizar búsqueda con el backend (debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (sorteo?.id) {
        router.get(route(ticketsRouteName), { 
          sorteo_id: sorteo.id,
          ticket_search: searchQuery
        }, {
          preserveState: true,
          preserveScroll: true,
          only: ['tickets'],
        });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, sorteo?.id]);

  // Sincronizar lista cuando cambia el sorteo. No poner [tickets] para evitar bucle infinito (nueva referencia en cada render).
  useEffect(() => {
    if (tickets && tickets.data) {
      setLoadedTickets(tickets.data);
      setNextPageUrl(tickets.next_page_url ?? null);
    } else if (Array.isArray(tickets)) {
      setLoadedTickets(tickets);
      setNextPageUrl(null);
    } else {
      setLoadedTickets([]);
      setNextPageUrl(null);
    }
  }, [tickets]);

  const loadMoreTickets = async () => {
    if (!nextPageUrl || loadingMore || !sorteo?.id) return;
    setLoadingMore(true);
    try {
      // Modify the nextPageUrl to point to our JSON API endpoint instead of the Inertia route
      const urlObj = new URL(nextPageUrl, window.location.origin);
      urlObj.pathname = `/api/sorteos/${sorteo.id}/tickets`;
      
      const response = await axios.get(urlObj.toString(), {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      // Append the new tickets and update the next page URL
      if (response.data && response.data.tickets && response.data.tickets.data) {
        setLoadedTickets(prev => [...prev, ...response.data.tickets.data]);
        setNextPageUrl(response.data.tickets.next_page_url);
      }
    } catch (error) {
      console.error("Error loading more tickets:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const onSubmit = (e) => handleCheckoutSubmit(e);

  const [isConsultingDni, setIsConsultingDni] = useState(false);
  const preferRemoteDni = !currentUser || currentUser?.is_admin;
  const canConsultarDni = String(data.buyer_dni || '').replace(/\D/g, '').length === 8 && !currentUser;

  const handleConsultarDni = async () => {
    if (!canConsultarDni) return;
    setIsConsultingDni(true);
    try {
      const response = await axios.post('/api/consultar-dni', {
        dni: String(data.buyer_dni).replace(/\D/g, ''),
        prefer_remote: preferRemoteDni,
      });
      if (response.data?.success && response.data?.nombre) {
        // API devuelve "nombre" ya concatenado
        setData('buyer_name', response.data.nombre);
      }
    } catch {
      // Silencioso: el usuario puede completar manualmente.
    } finally {
      setIsConsultingDni(false);
    }
  };

  return (
    <section className="py-8 md:py-12 bg-[#F8FAFC] min-h-[70vh]">
      <div className="container mx-auto px-4 max-w-3xl">

        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors">
          <span className="bg-white p-2 rounded-full shadow-sm"><User className="w-4 h-4" /></span> Volver
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-100 text-center bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-amber-400" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-200/40 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-12 -left-10 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl animate-pulse" />

            <div className="inline-flex items-center gap-2 bg-white/80 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
              Paso a paso
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-3 mb-2">Registrate </h2>
           
          </div>

          <form className="p-6 md:p-8 space-y-8" onSubmit={onSubmit}>

            {/* ── Paso 1: Configurar Compra ────────────────────────────── */}
            <div>
              <StepTitle number={1} label="Configura tu participación" />
              <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 space-y-5">

                {/* Sorteo */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Sorteo a participar</label>
                  <select
                    value={String(sorteo?.id ?? '')}
                    onChange={handleSorteoChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-medium text-slate-700 cursor-pointer focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none outline-none transition-all"
                  >
                    {sorteosActivos.length > 0 ? (
                      sorteosActivos.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}{s.tipo ? ' - ' + s.tipo : ''}
                        </option>
                      ))
                    ) : (
                      <option value="">Sin sorteos activos</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Cantidad */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Cantidad de Tickets</label>
                    <div className="flex items-center justify-between gap-4 bg-white border-2 border-slate-200 rounded-xl p-1.5 w-full">
                      <button type="button" onClick={handleDecreaseQty} className="w-12 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold transition-colors touch-manipulation">
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="text-center font-black text-xl">{data.cantidad}</span>
                      <button type="button" onClick={handleIncreaseQty} className="w-12 h-10 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 rounded-lg text-emerald-700 font-bold transition-colors touch-manipulation">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Método de selección */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Método de selección</label>
                    <div className="flex bg-slate-200 p-1.5 rounded-xl h-[56px]">
                      <button type="button" onClick={() => setData('modo_seleccion', 'random')}
                        className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2 px-2 md:px-3 rounded-lg font-bold text-xs md:text-sm transition-all ${data.modo_seleccion === 'random' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Dices className="w-4 h-4" /> Al azar
                      </button>
                      <button type="button" onClick={() => setData('modo_seleccion', 'manual')}
                        className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2 px-2 md:px-3 rounded-lg font-bold text-xs md:text-sm transition-all ${data.modo_seleccion === 'manual' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <MousePointerClick className="w-4 h-4" /> Elegir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grilla de tickets */}
                {data.modo_seleccion === 'manual' && (
                  <div key={sorteo?.id} className="mt-4 border-t border-slate-200 pt-5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-3 gap-2 md:gap-0">
                      <p className="text-sm font-bold text-slate-700">
                        Elige tus números:
                      </p>
                      <span className="text-xs font-bold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                        {data.numeros_seleccionados.length} de {data.cantidad} elegidos
                      </span>
                    </div>

                    {/* Buscador de tickets */}
                    <div className="mb-4 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar número específico..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                      />
                    </div>

                    {loadedTickets.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-6">No se encontraron tickets con ese número o no hay tickets disponibles en este momento.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[350px] overflow-y-auto pr-2 pb-2">
                          {loadedTickets.map((ticket) => {
                            const isVendido  = ticket.estado !== 'disponible';
                            const isSelected = data.numeros_seleccionados.includes(ticket.numero);
                            return (
                              <button
                                type="button"
                                key={ticket.id}
                                disabled={isVendido}
                                onClick={() => toggleNumber(ticket.numero)}
                                className={`py-2 px-1 rounded-lg font-bold text-[10px] sm:text-xs md:text-sm border-2 transition-all break-all leading-tight
                                  ${isVendido  ? 'bg-red-100 text-red-400 border-red-100 cursor-not-allowed opacity-60'
                                  : isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                                  :              'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:shadow-sm'} touch-manipulation`}
                              >
                                {ticket.numero}
                              </button>
                            );
                          })}
                        </div>
                        {nextPageUrl && (
                          <button
                            type="button"
                            disabled={loadingMore}
                            onClick={loadMoreTickets}
                            className="mx-auto mt-2 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                          >
                            {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loadingMore ? 'Cargando...' : 'Cargar más tickets'}
                          </button>
                        )}
                      </div>
                    )}

                    {data.numeros_seleccionados.length > 0 && (
                      <div className="mt-4 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                        <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                          Números seleccionados:<br />
                          <strong className="text-emerald-900 text-sm">
                            {data.numeros_seleccionados.join(', ')}
                          </strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="mt-4 bg-[#FFF4F4] border-2 border-[#FFE0E0] p-4 md:p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
                <span className="font-bold text-red-700 text-center md:text-left">
                  Total a Pagar ({data.cantidad} ticket{data.cantidad > 1 ? 's' : ''}):
                </span>
                <span className="text-3xl font-black text-red-700">
                  S/ {(data.cantidad * ticketPrice).toFixed(2)}
                </span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* ── Paso 2: Datos Personales ─────────────────────────────── */}
            <div>
              <StepTitle number={2} label="Datos del Participante" />
              {currentUser ? (
                <div className="bg-emerald-50 p-4 md:p-6 rounded-2xl border border-emerald-100 flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                  <div className="bg-white p-4 rounded-full shadow-sm shrink-0 border border-emerald-50 flex items-center justify-center">
                    <User className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <p className="text-[10px] md:text-xs text-emerald-800 font-black uppercase tracking-wider bg-emerald-100 px-2 py-1 rounded-md">Datos cargados</p>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="font-black text-slate-900 text-lg md:text-xl leading-tight mb-3">{currentUser?.name || '—'}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white rounded-xl p-3 border border-emerald-50">
                      {[
                        { label: 'Documento', value: currentUser?.dni },
                        { label: 'Celular',   value: currentUser?.telefono },
                        { label: 'Ubicación', value: currentUser?.departamento },
                      ].map(({ label, value }, i) => (
                        <div key={label} className={`text-lg md:text-xl ${i > 0 ? 'border-t md:border-t-0 md:border-l border-emerald-50 pt-2 md:pt-0 pl-0 md:pl-3' : ''}`}>
                          <span className="block text-[10px] uppercase text-slate-400 font-bold">{label}</span>
                          <span className="font-bold text-slate-700">{value || '—'}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-3 font-medium flex items-start justify-center md:justify-start gap-1">
                      Estos datos se utilizarán para contactarte si resultas ganador.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 p-4 md:p-6 rounded-2xl border border-emerald-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">DNI *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={data.buyer_dni}
                          inputMode="numeric"
                          autoComplete="off"
                          pattern="[0-9]*"
                          onChange={(e) => setData('buyer_dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-mono font-bold tracking-widest text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                          placeholder="72345678"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleConsultarDni}
                          disabled={!canConsultarDni || isConsultingDni}
                          className="px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                        >
                          {isConsultingDni ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                          Consultar
                        </button>
                      </div>
                      {errors.buyer_dni && <p className="text-red-500 text-sm mt-2">{errors.buyer_dni}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nombres y apellidos *</label>
                      <input
                        type="text"
                        value={data.buyer_name}
                        onChange={(e) => setData('buyer_name', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        placeholder="Nombre completo"
                        required
                      />
                      {errors.buyer_name && <p className="text-red-500 text-sm mt-2">{errors.buyer_name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Celular *</label>
                      <input
                        type="tel"
                        value={data.buyer_telefono}
                        inputMode="tel"
                        autoComplete="tel"
                        onChange={(e) => setData('buyer_telefono', e.target.value.replace(/\D/g, '').slice(0, 20))}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        placeholder="987654321"
                        required
                      />
                      {errors.buyer_telefono && <p className="text-red-500 text-sm mt-2">{errors.buyer_telefono}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Departamento *</label>
                      <select
                        value={data.buyer_departamento}
                        onChange={(e) => setData('buyer_departamento', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-700 cursor-pointer focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none outline-none transition-all"
                        required
                      >
                        <option value="">Selecciona...</option>
                        {PERU_DEPARTAMENTOS.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                      {errors.buyer_departamento && <p className="text-red-500 text-sm mt-2">{errors.buyer_departamento}</p>}
                    </div>
                  </div>

                  <p className="text-[10px] text-emerald-700 mt-3 font-medium">
                    Estos datos se utilizarán para contactarte si resultas ganador.
                  </p>
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* ── Paso 3: Pago ─────────────────────────────────────────── */}
            <div>
              <StepTitle number={3} label="Realiza el pago" />
              

              {paymentOptions.length === 0 && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-bold text-amber-800">
                    No hay metodos de pago configurados en este momento.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {settings.yape_numero && (
                  <div
                    onClick={() => paymentOptions.length > 1 && setData('metodo_pago', 'yape')}
                    className={`${paymentOptions.length > 1 ? 'cursor-pointer' : 'cursor-default'} border-2 ${data.metodo_pago === 'yape' ? 'border-[#742284] shadow-md ring-2 ring-[#742284]/50' : 'border-slate-200 bg-white hover:border-[#742284]/50'} rounded-2xl p-4 text-center relative overflow-hidden transition-all duration-200 flex flex-col items-center justify-center gap-3`}
                  >
                    {data.metodo_pago === 'yape' && (
                      <div className="absolute top-0 right-0 bg-[#742284] text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-bl-xl">
                        {paymentOptions.length === 1 ? '' : '✓ YAPE'}
                      </div>
                    )}
                    <img src="/images/qryape.png" alt="QR Yape" className="w-full max-w-sm h-auto object-contain rounded-xl" />
                    <div className={`w-full py-2.5 rounded-xl font-black shadow-sm flex flex-col items-center justify-center ${data.metodo_pago === 'yape' ? 'bg-[#742284] text-white' : 'bg-slate-100 text-slate-700'} transition-colors`}>
                      <span className="text-xs uppercase tracking-widest font-bold opacity-80">Número Yape</span>
                      <span className="text-2xl tracking-widest mt-0.5">{yapeNumero}</span>
                    </div>
                  </div>
                )}

                {settings.plin_numero && (
                  <div
                    onClick={() => paymentOptions.length > 1 && setData('metodo_pago', 'plin')}
                    className={`${paymentOptions.length > 1 ? 'cursor-pointer' : 'cursor-default'} border-2 ${data.metodo_pago === 'plin' ? 'border-[#00E0C6] bg-[#00E0C6]/10 shadow-md ring-2 ring-[#00E0C6]/50 scale-105' : 'border-slate-200 bg-white hover:border-[#00E0C6]/50'} rounded-2xl p-5 text-center relative overflow-hidden transition-all duration-200`}
                  >
                    <div className={`absolute top-0 right-0 ${data.metodo_pago === 'plin' ? 'bg-[#00E0C6]' : 'bg-slate-300'} text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm transition-colors`}>
                      {data.metodo_pago === 'plin' && paymentOptions.length === 1 ? 'AUTOMATICO' : 'PLIN'}
                    </div>
                    <p className="text-slate-500 text-xs font-bold mb-1 mt-2 uppercase tracking-wide">Número oficial</p>
                    <p className={`text-3xl font-black ${data.metodo_pago === 'plin' ? 'text-[#0A2240]' : 'text-slate-700'} tracking-tight`}>{plinNumero}</p>
                  </div>
                )}
              </div>

              <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-xl mt-4 text-center">
                <p className="text-xs md:text-sm font-medium">
                  ⚠️ Verifica siempre que el titular sea: <strong className="font-black">{razonSocial}</strong>
                </p>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* ── Paso 4: Comprobante ───────────────────────────────────── */}
            <div>
              <StepTitle number={4} label="Sube tu voucher" />
              <div className="relative border-2 border-dashed border-emerald-300 rounded-2xl p-8 md:p-10 text-center bg-emerald-50/50 hover:bg-emerald-50 transition-colors cursor-pointer group">
                {previewUrl ? (
                  <div className="relative">
                    <img src={previewUrl} alt="Comprobante" className="max-h-64 mx-auto rounded-lg shadow-md object-contain" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                      <span className="text-white font-bold bg-black/50 px-3 py-1.5 rounded-md">Cambiar Imagen</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-white w-16 h-16 rounded-full shadow-md flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-all">
                      <Upload className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="font-black text-emerald-800 mb-1 text-lg">Toca aquí para subir captura</p>
                    <p className="text-xs text-emerald-600 font-medium">Formatos soportados: JPG, PNG o PDF (Máx. 5MB)</p>
                  </>
                )}
                <input type="file" required onChange={handleFileChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              </div>
              {errors.comprobante && <p className="text-red-500 text-sm mt-2">{errors.comprobante}</p>}
            </div>

            {/* ── Términos y Condiciones ─────────────────────────────── */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5">
              <div className="mb-4">
                <h4 className="text-sm md:text-base font-black text-slate-900">Términos y Condiciones</h4>
                <p className="mt-2 text-sm text-slate-600">
                  Haz clic en el texto para leer los términos completos antes de aceptar.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={!!data.accept_terms}
                  onChange={(e) => setData('accept_terms', e.target.checked)}
                  className="mt-0.5 w-5 h-5 appearance-none rounded-full border-2 border-slate-300 bg-white checked:bg-emerald-600 checked:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                />
                <div className="text-sm font-bold text-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
                  >
                    Leer Términos y Condiciones
                  </button>
                  <p className="mt-1 text-slate-600 font-medium">
                    {data.accept_terms ? 'Ya aceptaste los términos del sorteo.' : 'Debes aceptarlos para confirmar tu participación.'}
                  </p>
                </div>
              </div>
              {errors.accept_terms && <p className="text-red-500 text-sm mt-2">{errors.accept_terms}</p>}
            </div>

            {/* Submit */}
            <button
              disabled={processing || !data.accept_terms}
              type="submit"
              className="w-full bg-[#25D366] hover:bg-[#20B858] disabled:opacity-75 disabled:cursor-not-allowed text-white font-black text-xl py-4 md:py-5 rounded-2xl shadow-[0_6px_0_#1DA851] active:shadow-[0_0px_0_#1DA851] active:translate-y-[6px] transition-all flex items-center justify-center gap-2 group mt-6"
            >
              {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />}
              {processing ? 'Enviando comprobante...' : `Confirmar Participación - S/ ${(data.cantidad * ticketPrice).toFixed(2)}`}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Al hacer clic en confirmar, aceptas los Términos y Condiciones del sorteo.
        </p>
      </div>

      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm px-4 py-6 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">Términos y Condiciones</h3>
              <p className="mt-1 text-sm text-slate-600">Lee el contenido y luego cierra o acepta los términos.</p>
            </div>

            <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 space-y-3 text-sm text-slate-700">
                {TERMS_CONTENT.map(([title, content]) => (
                  <p key={title}>
                    <span className="font-black text-slate-900">{title}:</span> {content}
                  </p>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setData('accept_terms', true);
                  setIsTermsModalOpen(false);
                }}
                className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-colors"
              >
                Aceptar términos
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/** Título de paso numerado reutilizable */
function StepTitle({ number, label }) {
  return (
    <h3 className="text-base md:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 group">
      <span className="relative bg-emerald-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-sm ring-4 ring-emerald-100 transition-transform group-hover:scale-105">
        <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-pulse" />
        <span className="relative">{number}</span>
      </span>
      {label}
    </h3>
  );
}
