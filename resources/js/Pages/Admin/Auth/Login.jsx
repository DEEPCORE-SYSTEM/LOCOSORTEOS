import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Lock, ShieldAlert, LogIn } from 'lucide-react';

export default function AdminLogin({ status }) {
  const { data, setData, post, processing, errors } = useForm({
    loginUser: '',
    password: '',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('admin.login.submit'));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <Head title="Admin Login | Finagro" />
      
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-emerald-700"></div>
        <div className="p-8 pb-6 text-center border-b border-gray-100">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Panel de Administración</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">Ingreso exclusivo para personal autorizado</p>
        </div>

        <form onSubmit={submit} className="p-8 space-y-5 bg-slate-50">
          {status && <div className="mb-4 font-bold text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{status}</div>}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-400" /> DNI / Identificador
            </label>
            <input
              type="text"
              name="loginUser"
              value={data.loginUser}
              className="mt-1 block w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:bg-white focus:border-emerald-500 focus:ring-0 transition-colors font-bold text-slate-800"
              autoComplete="username"
              onChange={(e) => setData('loginUser', e.target.value)}
              placeholder="Ej. 72345678"
            />
            {errors.loginUser && <p className="mt-2 text-sm font-bold text-red-600">{errors.loginUser}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={data.password}
              className="mt-1 block w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:bg-white focus:border-emerald-500 focus:ring-0 transition-colors font-bold text-slate-800"
              autoComplete="current-password"
              onChange={(e) => setData('password', e.target.value)}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-2 text-sm font-bold text-red-600">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                name="remember"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
                className="w-5 h-5 rounded border-2 border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-colors cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Recordarme</span>
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={processing}
              className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-4 rounded-xl shadow-[0_4px_0_#047857] active:shadow-none active:translate-y-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all"
            >
              <LogIn className="w-5 h-5" /> {processing ? 'Verificando...' : 'Autenticar Administrador'}
            </button>
          </div>
        </form>
      </div>
      <p className="mt-8 text-slate-500 text-sm font-medium">Sorteos Finagro © 2026. Todos los derechos reservados.</p>
    </div>
  );
}
