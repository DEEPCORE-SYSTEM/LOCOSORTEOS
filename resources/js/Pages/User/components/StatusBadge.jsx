import { CheckCircle, Clock } from 'lucide-react';

/**
 * Badge de estado para transacciones.
 */
export default function StatusBadge({ status }) {
  if (status === 'Aprobado') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs">
        <CheckCircle className="w-4 h-4" /> Aprobado
      </span>
    );
  }
  if (status === 'Rechazado') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-xs">
        <Clock className="w-4 h-4" /> Rechazado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold text-xs">
      <Clock className="w-4 h-4" /> En validación
    </span>
  );
}
