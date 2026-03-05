import { User, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { PERU_DEPARTAMENTOS } from '../constants/locations';

/**
 * Vista de edición de perfil del usuario.
 */
export default function ProfileView({ currentUser, onBack }) {
  const { data, setData, post, processing, errors } = useForm({
    phone: currentUser?.phone || '',
    dept:  currentUser?.dept  || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/perfil/actualizar', {
      onSuccess: onBack,
      preserveScroll: true,
    });
  };

  return (
    <section className="py-8 md:py-12 bg-[#F8FAFC] min-h-[70vh]">
      <div className="container mx-auto px-4 max-w-2xl">

        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors">
          <span className="bg-white p-2 rounded-full shadow-sm"><User className="w-4 h-4" /></span> Volver a mi panel
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-100 text-center bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Mi Perfil</h2>
            <p className="text-slate-600 font-medium text-sm md:text-base">Actualiza tus datos de contacto.</p>
          </div>

          {/* Formulario */}
          <form className="p-6 md:p-8 space-y-6" onSubmit={handleSubmit}>
            {/* Nombre (solo lectura) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 opacity-70">Nombre Completo (Solo Lectura)</label>
              <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-500 cursor-not-allowed">
                {currentUser?.name}
              </div>
            </div>

            {/* DNI (solo lectura) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 opacity-70">DNI / Documento (Solo Lectura)</label>
              <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-500 cursor-not-allowed">
                {currentUser?.dni}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wide">
                Por seguridad, el documento de identidad no puede cambiarse.
              </p>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Número de Celular</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium text-slate-700 transition-all outline-none"
                  placeholder="Ej: 999 999 999"
                  value={data.phone}
                  onChange={e => setData('phone', e.target.value.replace(/\D/g, ''))}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Departamento */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ubicación / Departamento</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <select
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium text-slate-700 transition-all outline-none appearance-none"
                  value={data.dept}
                  onChange={e => setData('dept', e.target.value)}
                >
                  <option value="">Selecciona tu departamento...</option>
                  {PERU_DEPARTAMENTOS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              {errors.dept && <p className="text-red-500 text-sm mt-1">{errors.dept}</p>}
            </div>

            {/* Submit */}
            <div className="pt-4 mt-6 border-t border-slate-100">
              <button
                disabled={processing}
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-75 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-xl shadow-md active:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-5 h-5" />}
                {processing ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
