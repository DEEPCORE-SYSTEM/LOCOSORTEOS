import React, { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Search, Loader2 } from 'lucide-react';

export default function LoginRegister({ renderMode = 'login', status, canResetPassword }) {
  const [isLoginMode, setIsLoginMode] = useState(renderMode === 'login');
  
  // Estados para Login
  const loginForm = useForm({
    loginUser: '',
    password: '',
  });
  
  // Estados para Registro
  const regForm = useForm({
    dni: '',
    name: '',
    telefono: '',
    departamento: '',
    password: '',
  });

  const [isConsultingDni, setIsConsultingDni] = useState(false);

  const locationsList = [
    'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 
    'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 
    'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
  ];

  const handleConsultarDni = () => {
    if (regForm.data.dni.length === 8) {
      setIsConsultingDni(true);
      // Simulación de consulta a API de RENIEC
      setTimeout(() => {
        regForm.setData('name', 'JUAN CARLOS PEREZ GOMEZ');
        setIsConsultingDni(false);
      }, 1500);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginForm.post(route('login'));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    regForm.post(route('register'));
  };

  return (
    <PublicLayout isLoggedIn={false} currentUser={null}>
      <Head title={isLoginMode ? 'Iniciar Sesión | Sorteos Finagro' : 'Registro | Sorteos Finagro'} />
      
      <section className="py-12 md:py-24 bg-[#F8FAFC] flex items-center justify-center px-4 min-h-[80vh]">
        <div className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-400 p-4 rounded-2xl shadow-sm transform -rotate-3">
              <User className="w-8 h-8 text-emerald-900" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-center text-slate-900 mb-2">
            {isLoginMode ? 'Ingresa a tu cuenta' : 'Crea tu cuenta participativa'}
          </h2>
          <p className="text-center text-slate-500 mb-8 text-sm font-medium">
            {isLoginMode ? 'Verifica el estado de tus tickets y transacciones' : 'Registra tus datos reales para poder reclamar tus premios.'}
          </p>
          
          {isLoginMode ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">DNI o Nro. de Celular</label>
                <input 
                  type="text" 
                  required 
                  value={loginForm.data.loginUser}
                  onChange={(e) => loginForm.setData('loginUser', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-all font-medium text-slate-700" 
                  placeholder="Ej. 72345678 o 987654321" 
                />
                {loginForm.errors.loginUser && <div className="text-red-500 text-xs mt-1 font-bold">{loginForm.errors.loginUser}</div>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
                <input 
                  type="password" 
                  required 
                  value={loginForm.data.password}
                  onChange={(e) => loginForm.setData('password', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-all font-medium text-slate-700" 
                  placeholder="••••••••" 
                />
                {loginForm.errors.password && <div className="text-red-500 text-xs mt-1 font-bold">{loginForm.errors.password}</div>}
              </div>
              <button type="submit" disabled={loginForm.processing} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg py-3.5 rounded-xl shadow-[0_4px_0_#047857] active:shadow-none active:translate-y-1 transition-all mt-4 disabled:opacity-50">
                {loginForm.processing ? 'Ingresando...' : 'Ingresar a mi panel'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Documento de Identidad (DNI) *</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required 
                    maxLength="8"
                    value={regForm.data.dni}
                    onChange={(e) => regForm.setData('dni', e.target.value.replace(/\D/g, ''))} // Solo números
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-all font-mono font-bold text-slate-700 tracking-widest" 
                    placeholder="Ej. 72345678" 
                  />
                  <button 
                    type="button" 
                    onClick={handleConsultarDni}
                    disabled={isConsultingDni || regForm.data.dni.length !== 8}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 rounded-xl shadow-sm transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    {isConsultingDni ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
                    Consultar
                  </button>
                </div>
                {regForm.errors.dni && <div className="text-red-500 text-xs mt-1 font-bold">{regForm.errors.dni}</div>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombres y Apellidos Completos *</label>
                <input 
                  type="text" 
                  required 
                  value={regForm.data.name}
                  onChange={(e) => regForm.setData('name', e.target.value)}
                  readOnly={!!regForm.data.name} // Se vuelve de solo lectura si la simulacion (API) lo llena
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all font-bold ${regForm.data.name ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-700 focus:bg-white focus:border-emerald-500'}`} 
                  placeholder="Se autocompletará con tu DNI" 
                />
                {regForm.errors.name && <div className="text-red-500 text-xs mt-1 font-bold">{regForm.errors.name}</div>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nº Celular *</label>
                  <input 
                    type="text" 
                    required 
                    maxLength="9"
                    value={regForm.data.telefono}
                    onChange={(e) => regForm.setData('telefono', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-all font-medium text-slate-700" 
                    placeholder="987654321" 
                  />
                  {regForm.errors.telefono && <div className="text-red-500 text-xs mt-1 font-bold">{regForm.errors.telefono}</div>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Departamento *</label>
                  <select 
                    required 
                    value={regForm.data.departamento}
                    onChange={(e) => regForm.setData('departamento', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-all font-medium text-slate-700"
                  >
                    <option value="">Selecciona...</option>
                    {locationsList.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  {regForm.errors.departamento && <div className="text-red-500 text-xs mt-1 font-bold">{regForm.errors.departamento}</div>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Crea una Contraseña *</label>
                <input 
                  type="password" 
                  required 
                  value={regForm.data.password}
                  onChange={(e) => regForm.setData('password', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-all font-medium text-slate-700" 
                  placeholder="Mínimo 6 caracteres" 
                />
                {regForm.errors.password && <div className="text-red-500 text-xs mt-1 font-bold">{regForm.errors.password}</div>}
              </div>

              <button type="submit" disabled={!regForm.data.name || regForm.processing} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg py-3.5 rounded-xl shadow-[0_4px_0_#047857] active:shadow-none active:translate-y-1 transition-all mt-4 disabled:bg-emerald-300 disabled:shadow-[0_4px_0_#A7F3D0] disabled:cursor-not-allowed">
                {regForm.processing ? 'Registrando...' : 'Registrarme y continuar'}
              </button>
            </form>
          )}
          
          <div className="mt-6 text-center space-y-3">
            <button 
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                loginForm.reset();
                loginForm.clearErrors();
                regForm.reset();
                regForm.clearErrors();
              }} 
              className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
            >
              {isLoginMode ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
            {isLoginMode && (
              <div className="block">
                <Link href="#" className="text-xs font-bold text-emerald-600 hover:underline">¿Olvidaste tu contraseña?</Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
