import { useState, useEffect, useRef } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";
import {
  Ticket, ShieldCheck, Upload, X, Trophy, ChevronRight,
  Loader2, CheckCircle, AlertCircle, Info
} from "lucide-react";

export default function Index({ sorteo, tickets: initialTickets, auth, user, settings = {} }) {
  const { flash } = usePage().props;
  const [tickets, setTickets] = useState(initialTickets || []);
  const [seleccionados, setSeleccionados] = useState([]);
  const [metodoPago, setMetodoPago] = useState("yape");
  const [comprobante, setComprobante] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); 
  const fileRef = useRef(null);

  const isLoggedIn  = !!user;
  const currentUser = user;
  const razonSocial = settings.razon_social || 'INVERSIONES CampoAgro E.I.R.L.';


  
  useEffect(() => {
    if (!window.Echo) return;
    const channel = window.Echo.channel(`sorteo.${sorteo.id}`);
    channel.listen("TicketVendido", (e) => {
      setTickets(prev =>
        prev.map(t => t.id === e.ticketId ? { ...t, estado: "vendido" } : t)
      );
      setSeleccionados(prev => prev.filter(id => id !== e.ticketId));
    });
    return () => window.Echo.leave(`sorteo.${sorteo.id}`);
  }, [sorteo.id]);

  const toggle = (id) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleComprobanteChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setComprobante(file);
    setComprobantePreview(URL.createObjectURL(file));
  };

  const total = seleccionados.length * sorteo.precio_ticket;
  const vendidos  = tickets.filter(t => t.estado === "vendido").length;
  const disponibles = tickets.filter(t => t.estado === "disponible").length;
  const pct = tickets.length > 0 ? Math.round((vendidos / tickets.length) * 100) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (seleccionados.length === 0) return;
    setSubmitting(true);

    const formData = new FormData();
    seleccionados.forEach(id => formData.append("tickets[]", id));
    formData.append("metodo_pago", metodoPago);
    formData.append("sorteo_id", sorteo.id);
    formData.append("total", total);
    if (comprobante) formData.append("comprobante", comprobante);

    router.post("/comprar", formData, {
      forceFormData: true,
      onSuccess: () => { setSubmitting(false); setSeleccionados([]); setStep(1); },
      onError: () => setSubmitting(false),
    });
  };

  
  const ticketClass = (ticket) => {
    if (ticket.estado === "vendido") return "bg-red-400 text-white cursor-not-allowed opacity-70 scale-95 dark:opacity-50";
    if (seleccionados.includes(ticket.id)) return "bg-emerald-500 text-white ring-2 ring-emerald-300 scale-105 shadow-lg shadow-emerald-200 dark:shadow-emerald-900";
    return "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400";
  };

  return (
    <PublicLayout isLoggedIn={isLoggedIn} currentUser={currentUser}>
      <Head title={`${sorteo.nombre} | Sorteos CampoAgro`} />

      {flash?.success && (
        <div className="container mx-auto px-4 max-w-6xl mt-6">
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl font-bold">
            <CheckCircle className="w-5 h-5 shrink-0" /> {flash.success}
          </div>
        </div>
      )}
      {flash?.error && (
        <div className="container mx-auto px-4 max-w-6xl mt-6">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" /> {flash.error}
          </div>
        </div>
      )}

      {/* ── BANNER DEL SORTEO ── */}
      <div className="relative overflow-hidden bg-emerald-950 py-10 md:py-14">
        {sorteo.imagen_hero && (
          <img src={sorteo.imagen_hero} alt={sorteo.nombre} className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/80 to-emerald-900/70" />
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 bg-red-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> En Vivo
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{sorteo.nombre}</h1>
              {sorteo.descripcion && <p className="text-emerald-200 font-medium max-w-xl">{sorteo.descripcion}</p>}
            </div>
            {/* Stats */}
            <div className="flex gap-4 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-center">
                <p className="text-2xl font-black text-white">{disponibles.toLocaleString()}</p>
                <p className="text-xs text-emerald-200 font-bold uppercase tracking-wide">Disponibles</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-center">
                <p className="text-2xl font-black text-amber-400">S/ {Math.floor(sorteo.precio_ticket)}</p>
                <p className="text-xs text-emerald-200 font-bold uppercase tracking-wide">Por ticket</p>
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-8">
            <div className="flex justify-between text-xs font-bold text-emerald-300 mb-2">
              <span>{vendidos.toLocaleString()} vendidos</span>
              <span>{pct}% completado</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-10">
        <div className="flex flex-col xl:flex-row gap-8">

          {/* ════ PANEL IZQUIERDO: GRID DE TICKETS ════ */}
          <div className="flex-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Selecciona tus Números</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Haz click en los números que quieres. Verde = seleccionado, Rojo = vendido.</p>
                </div>
                <div className="flex gap-3 text-xs font-bold shrink-0 dark:text-slate-300">
                  <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 inline-block" /> Libre</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-emerald-500 inline-block" /> Selec.</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-red-400 inline-block" /> Vendido</span>
                </div>
              </div>

              <div className="p-4 max-h-[520px] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
                  {tickets.map(ticket => (
                    <button
                      key={ticket.id}
                      disabled={ticket.estado === "vendido"}
                      onClick={() => toggle(ticket.id)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${ticketClass(ticket)}`}
                    >
                      {ticket.numero}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pie del grid */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-3 items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-bold">
                  {seleccionados.length === 0
                    ? "No has seleccionado ningún número"
                    : `${seleccionados.length} número${seleccionados.length > 1 ? 's' : ''} seleccionado${seleccionados.length > 1 ? 's' : ''}`}
                </p>
                {seleccionados.length > 0 && (
                  <button
                    onClick={() => setSeleccionados([])}
                    className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Limpiar selección
                  </button>
                )}
              </div>
            </div>

            {/* Premios del sorteo */}
            {sorteo.premios?.length > 0 && (
              <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 transition-colors duration-300">
                <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" /> Premios de este Sorteo
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {sorteo.premios.map((premio, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 overflow-hidden text-center p-3 transition-colors duration-300">
                      {premio.imagen && (
                        <img src={premio.imagen} alt={premio.nombre} className="w-full h-20 object-cover rounded-lg mb-2" />
                      )}
                      <p className="font-black text-slate-800 dark:text-slate-200 text-sm">{premio.nombre}</p>
                      {premio.descripcion && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{premio.descripcion}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ════ PANEL DERECHO: RESUMEN + PAGO ════ */}
          <div className="w-full xl:w-96 shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 sticky top-24 transition-colors duration-300">
              {/* Resumen */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-black text-slate-900 dark:text-white text-lg mb-4">Resumen de Compra</h3>

                {seleccionados.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                    <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-sm">Selecciona números del panel izquierdo</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar">
                      {seleccionados.map(id => {
                        const t = tickets.find(t => t.id === id);
                        return (
                          <span key={id} className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border dark:border-emerald-800 text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
                            #{t?.numero}
                            <button onClick={() => toggle(id)} className="hover:text-red-500 dark:hover:text-red-400 ml-0.5 transition-colors"><X className="w-3 h-3" /></button>
                          </span>
                        );
                      })}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600 space-y-2 text-sm transition-colors duration-300">
                      <div className="flex justify-between font-medium text-slate-600 dark:text-slate-400">
                        <span>Tickets</span><span className="dark:text-white">{seleccionados.length}</span>
                      </div>
                      <div className="flex justify-between font-medium text-slate-600 dark:text-slate-400">
                        <span>Precio c/u</span><span className="dark:text-white">S/ {sorteo.precio_ticket}</span>
                      </div>
                      <div className="flex justify-between font-black text-slate-900 dark:text-white text-lg pt-2 border-t border-slate-200 dark:border-slate-600">
                        <span>Total</span><span className="text-emerald-700 dark:text-emerald-400">S/ {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Formulario de pago */}
              {!isLoggedIn ? (
                <div className="p-6 text-center">
                  <Info className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="font-bold text-slate-700 dark:text-slate-300 mb-4">Debes iniciar sesión para comprar</p>
                  <a href="/login" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Ticket className="w-5 h-5" /> Iniciar Sesión para Comprar
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Método de pago */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-wider">Método de Pago</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "yape", label: "YAPE", color: "bg-[#742284] hover:bg-[#5e1a6a]" },
                        { value: "plin", label: "PLIN", color: "bg-[#00B4A0] hover:bg-[#009487]" },
                      ].map(m => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setMetodoPago(m.value)}
                          className={`py-3 rounded-xl font-black text-white transition-all text-sm ${m.color} ${metodoPago === m.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-[1.02]' : 'opacity-70'}`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-600 text-center transition-colors duration-300">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Transferir a nombre de:</p>
                      <p className="font-black text-sm text-slate-800 dark:text-slate-200 mt-1">{razonSocial}</p>
                    </div>
                  </div>

                  {/* Subir comprobante */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-wider">Comprobante de Pago</label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${comprobantePreview ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30' : 'border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                    >
                      {comprobantePreview ? (
                        <div className="relative">
                          <img src={comprobantePreview} alt="Comprobante" className="mx-auto max-h-32 rounded-lg object-cover" />
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setComprobante(null); setComprobantePreview(null); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-slate-300 dark:text-slate-500 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Click para subir captura</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">JPG, PNG, WEBP hasta 5MB</p>
                        </div>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleComprobanteChange}
                      />
                    </div>
                  </div>

                  {/* Botón comprar */}
                  <button
                    type="submit"
                    disabled={seleccionados.length === 0 || submitting}
                    className="w-full bg-[#25D366] hover:bg-[#20B858] text-white font-black text-lg py-4 rounded-2xl shadow-[0_6px_0_#1DA851] active:shadow-[0_0px_0] active:translate-y-[6px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {submitting
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                      : <><Ticket className="w-6 h-6" /> {seleccionados.length === 0 ? 'Selecciona números' : `Confirmar Compra · S/ ${total.toFixed(2)}`}</>
                    }
                  </button>

                  <p className="text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Compra 100% Segura y Verificada
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
