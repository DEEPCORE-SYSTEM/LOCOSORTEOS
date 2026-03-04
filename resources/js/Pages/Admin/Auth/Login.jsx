import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ShieldAlert, KeyRound, UserCircle } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 font-sans relative overflow-hidden">
            {/* Efectos de fondo hiper modernos */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-slate-800/40 rounded-full blur-[120px]"></div>
            </div>

            <Head title="Acceso Restringido | Panel Admin" />

            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 transition-all duration-500 hover:border-indigo-500/30 hover:shadow-indigo-900/20">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-white mb-2 text-center">
                        Acceso Restringido
                    </h2>
                    <p className="text-slate-400 text-sm font-medium text-center">
                        Área de gestión y control exclusivo para equipo administrativo.
                    </p>
                </div>

                {status && (
                    <div className="mb-6 font-bold text-sm text-indigo-400 bg-indigo-950/50 p-3 rounded-lg border border-indigo-900/50 text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">ID Administrativo</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <UserCircle className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                id="loginUser"
                                type="text"
                                name="loginUser"
                                value={data.loginUser}
                                className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                                autoComplete="username"
                                autoFocus
                                required
                                placeholder="DNI, Celular o Email"
                                onChange={(e) => setData('loginUser', e.target.value)}
                            />
                        </div>
                        {errors.loginUser && <span className="text-red-400 text-xs font-bold block mt-1">{errors.loginUser}</span>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Clave de Seguridad</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <KeyRound className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                                autoComplete="current-password"
                                required
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                        </div>
                        {errors.password && <span className="text-red-400 text-xs font-bold block mt-1">{errors.password}</span>}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center group cursor-pointer">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded bg-slate-800 border-slate-700 text-indigo-600 shadow-sm focus:ring-indigo-500/50 focus:ring-offset-slate-900 group-hover:border-indigo-500 transition-colors cursor-pointer"
                            />
                            <span className="ms-2 text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Mantener sesión activa</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider ${processing ? 'scale-[0.98]' : ''}`}
                    >
                        {processing ? 'Verificando Credenciales...' : 'Acceder al Sistema'}
                    </button>
                    
                    <div className="text-center mt-6 p-4 border-t border-slate-800/50">
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            El acceso a este módulo está monitorizado. Solo el personal explícitamente autorizado puede hacer uso de estas herramientas.
                        </p>
                    </div>
                </form>
            </div>
            
            <div className="absolute bottom-6 left-0 w-full text-center z-10">
                <p className="text-slate-600 text-xs font-medium">Campoagro Platform © 2026. Todos los derechos reservados.</p>
            </div>
        </div>
    );
}
