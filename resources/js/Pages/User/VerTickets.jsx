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
          header, footer, .no-print, .print\\:hidden { display: none !important; }
          body { background: #fff; }
          .print-area { box-shadow: none; border: 1px solid #e2e8f0; }
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

          <div className="print-area bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:rounded-lg">
            <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="bg-amber-100 p-2 rounded-xl">
                  <Ticket className="w-6 h-6 text-amber-700" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-black text-slate-900">
                    Mis tickets — {compra?.transaccion}
                  </h1>
                  <p className="text-slate-500 font-medium text-sm">
                    {sorteo?.nombre ?? 'Sorteo'} · {compra?.fecha} · S/ {compra?.total?.toFixed(2)}
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-xs font-bold ${estadoStyle}`}>
                    {estadoLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {tickets.map((t, index) => (
                    <div
                      key={t.id ?? index}
                      className="border-2 border-slate-200 rounded-xl p-4 text-center bg-slate-50/50 print:break-inside-avoid"
                    >
                      <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">
                        Nº
                      </p>
                      <p className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                        {t.numero}
                      </p>
                      <p className="text-[10px] font-bold mt-1 uppercase">
                        <span className={
                          t.estado === 'vendido' ? 'text-emerald-600' :
                          t.estado === 'pendiente' ? 'text-amber-600' :
                          t.estado === 'rechazado' ? 'text-red-600' : 'text-slate-500'
                        }>
                          {t.estado === 'vendido' ? 'Vendido' : (ESTADO_LABEL[t.estado] ?? t.estado)}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                Sorteos CampoAgro · Transacción {compra?.transaccion} · Conserva este comprobante.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
