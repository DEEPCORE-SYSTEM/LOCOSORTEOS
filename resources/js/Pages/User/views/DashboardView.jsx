import { User, Ticket, Settings } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import TransactionTable from '../components/TransactionTable';

/**
 * Vista principal del panel del usuario.
 */
export default function DashboardView({ currentUser, transactions, onBuyClick, onProfileClick }) {
  const { flash } = usePage().props;

  return (
    <section className="py-8 md:py-12 bg-[#F8FAFC] min-h-[70vh]">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Mi Panel de Tickets</h2>
              <p className="text-slate-500 font-medium text-sm md:text-base">Administra tus compras y boletos aquí.</p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end w-full md:w-auto mt-2 md:mt-0 gap-2">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button
                onClick={onProfileClick}
                className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" /> Editar Perfil
              </button>
              <button
                onClick={onBuyClick}
                className="w-full sm:w-auto bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-500 shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Ticket className="w-5 h-5" /> Comprar tickets
              </button>
            </div>

            {flash?.success && (
              <div className="mt-4 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                {flash.success}
              </div>
            )}
            {flash?.error && (
              <div className="mt-4 text-red-600 font-bold text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                {flash.error}
              </div>
            )}
          </div>
        </div>

        {/* Tabla */}
        <TransactionTable transactions={transactions} />
      </div>
    </section>
  );
}
