import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { User, Mail, IdCard, Phone, Lock, Save, KeyRound } from 'lucide-react';

export default function Profile({ status, user }) {
  const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
    name: user.name,
    email: user.email,
    dni: user.dni,
    telefono: user.telefono || '',
  });

  const { data: passData, setData: setPassData, put: putPass, processing: passProcessing, errors: passErrors, recentlySuccessful: passRecentlySuccessful, reset: resetPass } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const submitProfile = (e) => {
    e.preventDefault();
    patch(route('admin.profile.update'));
  };

  const submitPassword = (e) => {
    e.preventDefault();
    putPass(route('admin.profile.password.update'), {
      onSuccess: () => resetPass(),
    });
  };

  return (
    <AdminLayout currentView="admin-profile">
      <Head title="Mi Perfil | Admin Campoagro" />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-slate-900 mb-8 font-['Nunito',sans-serif]">Configuración de Perfil</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-3xl font-black mb-4">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">{user.name}</h2>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mt-1">Administrador Campoagro</p>
              
              <div className="w-full mt-8 space-y-4 text-left">
                <div className="flex items-center gap-3 text-slate-500">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-medium truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <IdCard className="w-4 h-4" />
                  <span className="text-xs font-medium">DNI: {user.dni}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forms Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Info Form */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <User className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Información Personal</h3>
              </div>

              <form onSubmit={submitProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Nombre Completo</label>
                    <div className={`flex items-center gap-3 bg-slate-50 border ${errors.name ? 'border-red-300' : 'border-slate-100'} rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-emerald-500 transition-all`}>
                      <User className="w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={data.name} 
                        onChange={(e) => setData('name', e.target.value)}
                        className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 w-full focus:ring-0" 
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>
                    {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Correo Electrónico</label>
                    <div className={`flex items-center gap-3 bg-slate-50 border ${errors.email ? 'border-red-300' : 'border-slate-100'} rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-emerald-500 transition-all`}>
                      <Mail className="w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        value={data.email} 
                        onChange={(e) => setData('email', e.target.value)}
                        className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 w-full focus:ring-0" 
                        placeholder="admin@ejemplo.com"
                      />
                    </div>
                    {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">DNI</label>
                    <div className={`flex items-center gap-3 bg-slate-50 border ${errors.dni ? 'border-red-300' : 'border-slate-100'} rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-emerald-500 transition-all`}>
                      <IdCard className="w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={data.dni} 
                        onChange={(e) => setData('dni', e.target.value)}
                        className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 w-full focus:ring-0" 
                        maxLength="8"
                        placeholder="8 dígitos"
                      />
                    </div>
                    {errors.dni && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.dni}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Teléfono</label>
                    <div className={`flex items-center gap-3 bg-slate-50 border ${errors.telefono ? 'border-red-300' : 'border-slate-100'} rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-emerald-500 transition-all`}>
                      <Phone className="w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={data.telefono} 
                        onChange={(e) => setData('telefono', e.target.value)}
                        className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 w-full focus:ring-0" 
                        placeholder="Ej. 987654321"
                      />
                    </div>
                    {errors.telefono && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.telefono}</p>}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    disabled={processing}
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> {processing ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Form */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Lock className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Seguridad</h3>
              </div>

              <form onSubmit={submitPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Contraseña Actual</label>
                  <div className={`flex items-center gap-3 bg-slate-50 border ${passErrors.current_password ? 'border-red-300' : 'border-slate-100'} rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-emerald-500 transition-all`}>
                    <KeyRound className="w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      value={passData.current_password} 
                      onChange={(e) => setPassData('current_password', e.target.value)}
                      className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 w-full focus:ring-0" 
                    />
                  </div>
                  {passErrors.current_password && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{passErrors.current_password}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Nueva Contraseña</label>
                    <div className={`flex items-center gap-3 bg-slate-50 border ${passErrors.password ? 'border-red-300' : 'border-slate-100'} rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-emerald-500 transition-all`}>
                      <Lock className="w-4 h-4 text-slate-400" />
                      <input 
                        type="password" 
                        value={passData.password} 
                        onChange={(e) => setPassData('password', e.target.value)}
                        className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 w-full focus:ring-0" 
                      />
                    </div>
                    {passErrors.password && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{passErrors.password}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Confirmar Contraseña</label>
                    <div className={`flex items-center gap-3 bg-slate-50 border ${passErrors.password_confirmation ? 'border-red-300' : 'border-slate-100'} rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-emerald-500 transition-all`}>
                      <Lock className="w-4 h-4 text-slate-400" />
                      <input 
                        type="password" 
                        value={passData.password_confirmation} 
                        onChange={(e) => setPassData('password_confirmation', e.target.value)}
                        className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 w-full focus:ring-0" 
                      />
                    </div>
                    {passErrors.password_confirmation && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{passErrors.password_confirmation}</p>}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    disabled={passProcessing}
                    type="submit" 
                    className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-2xl shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" /> {passProcessing ? 'Actualizando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
