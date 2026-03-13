import PublicLayout from '@/Layouts/PublicLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Ticket, Trophy, AlertCircle, Download } from 'lucide-react';

export default function MisTickets({ dni = '', user = null, compras = [], ganadores = [], error = null, settings = {} }) {
  const [dniInput, setDniInput] = useState(dni || '');
  const liveLink = getLiveLink(settings);
  const qrUrl = getQrUrl(liveLink);
  const { flash } = usePage().props;

  const onSubmit = (e) => {
    e.preventDefault();
    const clean = String(dniInput || '').replace(/\D/g, '').slice(0, 8);
    router.get(route('mis_tickets'), { dni: clean }, { preserveState: true, preserveScroll: true });
  };

  return (
    <PublicLayout isLoggedIn={false} currentUser={null}>
      <Head title="Mis Tickets | Sorteos CampoAgro" />

      <section className="py-10 md:py-14 bg-[#F8FAFC] min-h-[70vh]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">Mis Tickets</h1>
              <p className="text-slate-600 font-medium mt-1">Ingresa tu DNI para ver tus compras, tickets y premios ganados.</p>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">DNI</label>
                  <input
                    value={dniInput}
                    onChange={(e) => setDniInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-mono font-black tracking-widest text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    placeholder="72345678"
                    inputMode="numeric"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="sm:self-end h-[52px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-[0_4px_0_#047857] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" /> Buscar
                </button>
              </form>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                </div>
              )}

              {flash?.error && !error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0" /> {flash.error}
                </div>
              )}

              {flash?.success && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl font-bold">
                  <Ticket className="w-5 h-5 shrink-0" /> {flash.success}
                </div>
              )}

              {user && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                  <p className="text-[10px] uppercase tracking-wider font-black text-emerald-700">Cliente</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{user.name}</p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white rounded-xl p-3 border border-emerald-100">
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-bold">DNI</span>
                      <span className="font-bold text-slate-700">{user.dni}</span>
                    </div>
                    <div className="sm:border-l sm:pl-3 border-emerald-100">
                      <span className="block text-[10px] uppercase text-slate-400 font-bold">Celular</span>
                      <span className="font-bold text-slate-700">{user.telefono || '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              {ganadores?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <h2 className="font-black text-slate-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-600" /> Premios Ganados
                  </h2>
                  <div className="mt-4 space-y-3">
                    {ganadores.map((g) => (
                      <div key={g.id} className="bg-white border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="font-black text-slate-900">{g.premio}</p>
                          <p className="text-xs font-bold text-slate-500">Sorteo: {g.sorteo}</p>
                        </div>
                        <div className="text-sm font-black text-amber-700">
                          Ticket: {g.ticket} {g.fecha ? `| ${g.fecha}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {compras?.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="font-black text-slate-900 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-emerald-600" /> Compras
                  </h2>
                  {compras.map((c) => (
                    <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">{c.transaccion}</p>
                          <p className="text-xs font-bold text-slate-500">{c.fecha}</p>
                          <p className="text-xs font-bold text-slate-500 mt-1">Sorteo: {c.sorteo}</p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${statusClass(c.estado)}`}>
                            {c.estado_label}
                          </span>
                          <span className="text-lg font-black text-slate-900">S/ {Number(c.total).toFixed(2)}</span>
                          {dni && c.estado === 'aprobado' && Array.isArray(c.tickets) && c.tickets.length > 0 && (
                            <a
                              href={route('mis_tickets.export', { compra: c.id, dni })}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-black transition-colors"
                            >
                              <Download className="w-4 h-4" /> Exportar PDF
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <p className="text-xs font-black text-slate-600 uppercase tracking-wider">Tickets</p>
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {Array.isArray(c.tickets) ? c.tickets.length : 0} ticket{Array.isArray(c.tickets) && c.tickets.length === 1 ? '' : 's'}
                          </span>
                        </div>

                        {Array.isArray(c.tickets) && c.tickets.length > 0 ? (
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {c.tickets.map((numero, index) => (
                              <TicketCard
                                key={`${c.id}-${numero}-${index}`}
                                numero={numero}
                                sorteo={c.sorteo}
                                sorteoFecha={c.sorteo_fecha}
                                precioTicket={c.precio_ticket}
                                liveLink={liveLink}
                                qrUrl={qrUrl}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <p className="font-black text-slate-900 text-sm">No hay tickets disponibles para mostrar.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                dni && !error && (
                  <div className="text-center py-10 text-slate-400">
                    <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">No se encontraron compras para este DNI.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function statusClass(estado) {
  if (estado === 'aprobado') return 'bg-emerald-100 text-emerald-800';
  if (estado === 'rechazado') return 'bg-red-100 text-red-800';
  return 'bg-amber-100 text-amber-800';
}

function TicketCard({ numero, sorteo, sorteoFecha, precioTicket, liveLink, qrUrl }) {
  const isPendingNumber = numero === 'Por asignar';
  const priceLabel = typeof precioTicket === 'number' && Number.isFinite(precioTicket)
    ? `S/ ${Number(precioTicket).toFixed(2)}`
    : null;

  return (
    <div className="rounded-[28px] border border-emerald-100 shadow-[0_18px_45px_-30px_rgba(22,101,52,0.45)] overflow-hidden bg-[linear-gradient(140deg,#f4faec_0%,#ffffff_42%,#fff8e5_100%)]">
      <div className="min-h-[220px] p-4 md:p-5 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 right-8 h-28 w-28 rounded-full bg-amber-200/45 blur-2xl" />
          <div className="absolute -bottom-10 left-0 h-36 w-52 rounded-full bg-emerald-200/45 blur-2xl" />
          <div
            className="absolute inset-x-0 bottom-0 h-24 opacity-45"
            style={{
              backgroundImage: 'repeating-linear-gradient(165deg, rgba(34, 197, 94, 0.18) 0 10px, transparent 10px 22px)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
            <img src="/images/logo-campoagro.png" alt="" className="w-28 h-28 object-contain" />
          </div>
        </div>

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="bg-white/90 p-1.5 rounded-xl border border-emerald-100 shadow-sm shrink-0 backdrop-blur-sm">
            <img src="/images/logo-campoagro.png" alt="CampoAgro" className="w-14 h-14 object-contain" />
          </div>

          {priceLabel && (
            <div className="bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm">
              {priceLabel}
            </div>
          )}
        </div>

        <div className="relative z-10 my-auto text-center">
          <h3 className="mt-2 text-sm md:text-base font-black text-slate-900 uppercase leading-tight">
            {sorteo}
          </h3>
          {sorteoFecha && (
            <p className="mt-1 text-[11px] font-bold text-emerald-700">
              Sorteo: {sorteoFecha}
            </p>
          )}

          <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 backdrop-blur-sm py-4 px-3 shadow-sm">
            {isPendingNumber ? (
              <p className="text-lg font-black text-amber-700 leading-tight">Pendiente de asignacion</p>
            ) : (
              <p className="text-2xl md:text-3xl font-black font-mono tracking-[0.18em] text-slate-800">
                Nº {numero}
              </p>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-slate-600">Transmision en vivo por:</p>
            <a
              href={liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black text-emerald-800 break-all underline underline-offset-2 hover:text-emerald-900"
            >
              {liveLink}
            </a>
          </div>

          <div className="w-14 h-14 rounded-xl border border-emerald-100 bg-white/90 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1">
            <img src={qrUrl} alt="QR de transmisión" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}

function getLiveLink(settings) {
  const rawUrl = settings?.tiktok_url || settings?.link_redes || '';

  if (!rawUrl) {
    return 'https://tiktok.com/@campoagrooficial';
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  return `https://${rawUrl}`;
}

function getQrUrl(link) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(link)}`;
}
