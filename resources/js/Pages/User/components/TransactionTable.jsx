import { Calendar, Eye } from 'lucide-react';
import { Link } from '@inertiajs/react';
import StatusBadge from './StatusBadge';

/**
 * Tabla de historial de transacciones del usuario.
 */
export default function TransactionTable({ transactions = [] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" /> Historial de Transacciones
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-bold border-b border-slate-100">ID Transacción</th>
              <th className="p-4 font-bold border-b border-slate-100">Fecha de Compra</th>
              <th className="p-4 font-bold border-b border-slate-100">Sorteo</th>
              <th className="p-4 font-bold border-b border-slate-100">Monto</th>
              <th className="p-4 font-bold border-b border-slate-100">Estado</th>
              <th className="p-4 font-bold border-b border-slate-100 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">
                  No tienes transacciones registradas aún.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-black text-slate-700">{tx.id}</td>
                  <td className="p-4 text-slate-600 font-medium">{tx.date}</td>
                  <td className="p-4 text-slate-600 font-medium">{tx.draw}</td>
                  <td className="p-4 font-bold text-slate-900">S/ {tx.amount.toFixed(2)}</td>
                  <td className="p-4"><StatusBadge status={tx.status} /></td>
                  <td className="p-4 text-right">
                    {tx.compra_id && (
                      <Link
                        href={route('user.compras.tickets', tx.compra_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg hover:bg-emerald-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver tickets
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
