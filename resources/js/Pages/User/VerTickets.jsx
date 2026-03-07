import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Ticket, ArrowLeft, Printer } from 'lucide-react';

const ESTADO_LABEL = {
  pendiente: 'Pendiente de validación',
  aprobado:  'Aprobado',
  rechazado: 'Rechazado',
};

const ESTADO_STYLE = {
  pendiente: 'bg-amber-100 text-amber-800',
  aprobado:  'bg-emerald-100 text-emerald-800',
  rechazado: 'bg-red-100 text-red-800',
};

/**
 * Página para ver e imprimir los números de una compra (cualquier estado).
 */
export default function VerTickets({ compra, sorteo, tickets = [], auth }) {
  const handlePrint = () => window.print();
  const estado = compra?.estado ?? 'pendiente';
  const estadoLabel = ESTADO_LABEL[estado] ?? estado;
  const estadoStyle = ESTADO_STYLE[estado] ?? 'bg-slate-100 text-slate-800';

  return (
    <AppLayout currentUser={auth?.user}>
      <Head title={`Tickets - ${compra?.transaccion ?? 'Compra'}`} />

      <style>{`
        @media print {
          @page { margin: 1cm; }
          body { background: #fff !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide everything first */
          body * {
            visibility: hidden;
          }
          /* Show only print-area and its children */
          .print-area, .print-area * {
            visibility: visible;
          }
          /* Position print-area at top-left of page */
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Specific utility to hide inside print-area if needed */
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      <section className="py-8 md:py-12 bg-[#F8FAFC] min-h-screen print:py-0 print:bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
            <Link
              href={route('dashboard')}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold transition"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a mi panel
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm transition"
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>
          </div>

          <div className="print-area relative bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-slate-300 print:rounded-lg mx-auto max-w-2xl mt-4 md:mt-8">
            {/* Cutouts for the ticket effect */}
            <div className="absolute top-[16.5rem] md:top-[15.5rem] -left-4 w-8 h-8 bg-[#F8FAFC] rounded-full shadow-[inset_-2px_0_4px_rgba(0,0,0,0.05)] print:hidden z-20"></div>
            <div className="absolute top-[16.5rem] md:top-[15.5rem] -right-4 w-8 h-8 bg-[#F8FAFC] rounded-full shadow-[inset_2px_0_4px_rgba(0,0,0,0.05)] print:hidden z-20"></div>
            
            <div className="p-6 md:p-10 bg-gradient-to-br from-emerald-900 to-emerald-950 text-white relative">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="bg-emerald-800/80 p-3 md:p-4 rounded-2xl mb-4 text-emerald-300 ring-1 ring-emerald-500/30 shadow-lg">
                  <Ticket className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black mb-1 tracking-tight">
                  Transacción {compra?.transaccion}
                </h1>
                <p className="text-emerald-200/80 font-medium text-sm mb-2">
                  {sorteo?.nombre ?? 'Sorteo'} · {compra?.fecha}
                </p>
                <div className="text-emerald-100/90 text-xs mb-6 md:mb-8 flex flex-col items-center gap-1">
                  <p><span className="font-bold">Cliente:</span> {compra?.user} - DNI {compra?.user_dni}</p>
                  <p><span className="font-bold">Contacto:</span> {compra?.user_phone} · {compra?.user_dept}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                  <div className="bg-black/20 rounded-xl px-5 py-2.5 border border-white/10 backdrop-blur-sm">
                    <p className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-widest mb-0.5">Total Pagado</p>
                    <p className="text-xl font-black">S/ {compra?.total?.toFixed(2)}</p>
                  </div>
                  <div className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest border backdrop-blur-sm shadow-inner ${
                    estado === 'aprobado' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    estado === 'pendiente' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}>
                    {estadoLabel}
                  </div>
                </div>
              </div>
            </div>

            {/* Dashed line separator */}
            <div className="relative h-0 border-t-2 border-dashed border-slate-200 w-full z-10"></div>

            <div className="p-6 md:p-8 bg-white relative">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                {compra?.estado === 'aprobado' ? 'Números asignados' : 'Tus números'}
                {' '}({tickets.length})
              </p>
              {tickets.length === 0 ? (
                <p className="text-slate-500 font-medium py-4">
                  {compra?.estado === 'pendiente'
                    ? 'Se asignarán los números al validar tu pago.'
                    : 'No hay números registrados para esta compra.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tickets.map((t, index) => {
                    const isVendido = t.estado === 'vendido';
                    const isPendiente = t.estado === 'pendiente';
                    const isRechazado = t.estado === 'rechazado';
                    
                    const statusColor = isVendido ? 'text-emerald-600' : isPendiente ? 'text-amber-500' : isRechazado ? 'text-red-600' : 'text-slate-500';
                    const statusBg = isVendido ? 'bg-emerald-50' : isPendiente ? 'bg-amber-50' : isRechazado ? 'bg-red-50' : 'bg-slate-50';

                    return (
                      <div
                        key={t.id ?? index}
                        className="flex border-2 border-slate-300 rounded-lg overflow-hidden shadow-sm bg-white print:break-inside-avoid relative"
                      >
                         {/* Stub / Talón */}
                        <div className={`w-1/3 border-r-2 border-dashed border-slate-300 p-3 flex flex-col justify-between relative ${statusBg}`}>
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase text-center mb-1">
                              {isVendido ? 'TICKET VALIDO' : 'TICKET ' + t.estado}
                            </p>
                            <p className="text-sm font-black text-slate-900 text-center mb-1 border-b border-slate-200 pb-1">
                              Nº {t.numero}
                            </p>
                            <div className="space-y-1 mt-2 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase ${statusColor} bg-white border border-current shadow-sm`}>
                                {(ESTADO_LABEL[t.estado] ?? t.estado)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 text-center">
                            <p className="text-[7px] text-slate-400 uppercase">Sorteos CampoAgro</p>
                          </div>
                          {/* Tijera (simulated) */}
                          <div className="text-slate-300 absolute -right-2 top-1/2 -translate-y-1/2 bg-white text-[8px] z-10 w-4 h-4 flex items-center justify-center rounded-full leading-none select-none">✂</div>
                        </div>

                        {/* Main Ticket */}
                        <div className="w-2/3 p-4 flex flex-col relative overflow-hidden bg-white">
                          {/* Watermark leaf */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                            <svg className="w-24 h-24 text-emerald-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-1.25 6-7.5 6-10.5M10.5 4.5c.5-1.5 2.5-1.5 3 0 .25 1 2 2.5 3.5 2.5s3.5-1 3.5-3.5S18.5.5 17 2M5 14.5c-.5-1.5-2.5-1.5-3 0-.25 1-2 2.5-3.5 2.5S-5 16-5 13.5 -3 10.5-1.5 12"/></svg>
                          </div>

                          <div className="flex justify-between items-start mb-2 relative z-10 w-full">
                            <div className="flex flex-1 items-center gap-1.5">
                                <div className="bg-amber-400 p-0.5 rounded">
                                    <svg className="w-3 h-3 text-emerald-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-1.25 6-7.5 6-10.5M10.5 4.5c.5-1.5 2.5-1.5 3 0 .25 1 2 2.5 3.5 2.5s3.5-1 3.5-3.5S18.5.5 17 2M5 14.5c-.5-1.5-2.5-1.5-3 0-.25 1-2 2.5-3.5 2.5S-5 16-5 13.5 -3 10.5-1.5 12"/></svg>
                                </div>
                                <span className="text-[9px] font-black italic uppercase text-slate-900 leading-none truncate max-w-[80px]">Sorteos<br/><span className="text-emerald-600">CampoAgro</span></span>
                            </div>
                            <div className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">
                                S/ {sorteo?.precio_ticket ? Number(sorteo.precio_ticket).toFixed(2) : (Number(compra?.total)/tickets.length).toFixed(2)}
                            </div>
                          </div>

                          <div className="text-center my-auto relative z-10 py-1">
                            <h4 className="text-xs font-black text-slate-900 uppercase leading-tight truncate px-1">
                              {sorteo?.nombre ?? 'Sorteo Especial'}
                            </h4>
                            <p className="text-[8px] text-emerald-700 font-bold mt-1 uppercase tracking-wide">Transacción {compra?.transaccion}</p>
                            <p className="text-xl md:text-2xl font-black font-mono text-slate-800 tracking-widest mt-1 border-y border-slate-100 py-1">
                              Nº {t.numero}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 md:px-8 pb-8 pt-6 border-t-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center">
              
              <p className="text-xs text-slate-500 text-center font-bold tracking-wide uppercase">
                Sorteos CampoAgro<br/><span className="text-slate-400 font-medium normal-case">Transacción {compra?.transaccion}</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
