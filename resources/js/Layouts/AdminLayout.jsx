import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  LayoutDashboard, Trophy, PlayCircle, 
  Ticket, Users, Megaphone, ArrowLeft, BellRing, Award
} from 'lucide-react';
import ThemeToggle from '../Components/ThemeToggle';

export default function AdminLayout({ children, currentView = 'admin-dashboard' }) {
  const { flash, globalPendingTicketsCount = 0, globalPendingTickets = [] } = usePage().props;
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success'); 
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (flash?.success) {
      setToastMessage(flash.success);
      setToastType('success');
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    } else if (flash?.error) {
      setToastMessage(flash.error);
      setToastType('error');
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-slate-900 flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Admin Sidebar - VERDE AGRÓNOMO ORIGINAL */}
      <aside className="w-full md:w-64 bg-[#064E3B] dark:bg-emerald-950 text-slate-300 flex flex-col shrink-0 md:h-screen md:sticky md:top-0 transition-colors duration-300">
        <div className="p-4 md:p-4 border-b border-emerald-800/50 flex justify-between items-center">
          <div className="w-full">
            <Link href="/" className="block w-full">
              <div className="bg-white rounded-xl border-2 border-emerald-300 overflow-hidden   flex items-center justify-center gap-2 w-full">

                <img src="/images/nombre.jpg" alt="CampoAgro" className="h-18 w-auto object-contain flex-shrink-0" />
              </div>
            </Link>
           </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-2 md:gap-0 [&::-webkit-scrollbar]:hidden text-sm">
          <Link href="/admin/dashboard" className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${currentView === 'admin-dashboard' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5"/> <span className="inline">Dashboard</span>
          </Link>
          <Link href="/admin/sorteos" className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${['admin-sorteos', 'admin-nuevo-sorteo'].includes(currentView) ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
            <Trophy className="w-5 h-5"/> <span className="inline">Gestión Sorteos</span>
          </Link>
          <Link href="/admin/ejecucion" className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors text-amber-400 ${currentView === 'admin-ejecucion' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-amber-300'}`}>
            <PlayCircle className="w-5 h-5"/> <span className="inline uppercase">Ejecutar Sorteo</span>
          </Link>
          <Link href="/admin/tickets" className={`flex items-center justify-between shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${['admin-tickets', 'admin-lista-tickets', 'admin-talonario'].includes(currentView) ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
            <div className="flex items-center gap-3"><Ticket className="w-5 h-5"/> <span className="inline">Pagos y Tickets</span></div>
            {globalPendingTicketsCount > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{globalPendingTicketsCount}</span>}
          </Link>
          <Link href="/admin/usuarios" className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${currentView === 'admin-users' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
            <Users className="w-5 h-5"/> <span className="inline">Participantes</span>
          </Link>
          <Link href="/admin/ganadores" className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors text-amber-300 ${currentView === 'admin-ganadores' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-amber-200'}`}>
            <Award className="w-5 h-5"/> <span className="inline">Ganadores</span>
          </Link>
          <Link href="/admin/difusion" className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${currentView === 'admin-difusion' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
            <Megaphone className="w-5 h-5"/> <span className="inline">Difusión y Contenido</span>
          </Link>
        </nav>
     
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 w-full max-w-full overflow-y-auto p-8 md:p-8">
        {/* Header Superior del Main */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {currentView === 'admin-dashboard' }
            {currentView === 'admin-sorteos' && 'Administrar Sorteos'}
            {currentView === 'admin-nuevo-sorteo' && 'Crear Sorteo'}
            {currentView === 'admin-ejecucion' && 'Panel de Ejecución de Sorteo'}
            {currentView === 'admin-tickets' && 'Validación de Pagos (Bouchers)'}
            {currentView === 'admin-lista-tickets' && 'Base de Datos de Tickets'}
            {currentView === 'admin-talonario' && 'Talonario y Ventas Offline'}
            {currentView === 'admin-users' && 'Gestión de Participantes'}
            {currentView === 'admin-ganadores' && '🏆 Gestión de Ganadores'}
            {currentView === 'admin-difusion' && 'Canal de Difusión'}
          </h2>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* Notificaciones */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 rounded-full shadow-sm relative transition-colors ${isNotificationsOpen ? 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
              >
                <BellRing className="w-5 h-5" />
                {globalPendingTicketsCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>}
              </button>
              
              {/* Dropdown de Notificaciones */}
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden transform origin-top-right animate-in fade-in scale-95 duration-200">
                    <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Notificaciones</h3>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">{globalPendingTicketsCount} nuevas</span>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {globalPendingTickets.length > 0 ? (
                        <div className="divide-y divide-slate-50">
                          {globalPendingTickets.map((ticket, idx) => (
                            <Link 
                              key={idx} 
                              href="/admin/tickets" 
                              className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors group block"
                            >
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                <Ticket className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 leading-tight">
                                  Nueva compra de <span className="text-emerald-600">{ticket.user_name}</span>
                                </p>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Monto total: <span className="text-slate-700 font-bold">S/ {ticket.total}</span></p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1.5">{ticket.time_ago}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-center flex flex-col items-center justify-center">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <BellRing className="w-6 h-6 text-slate-300" />
                          </div>
                          <p className="text-sm font-bold text-slate-500">No hay notificaciones nuevas</p>
                          <p className="text-xs text-slate-400 mt-1">Todos los pagos están validados.</p>
                        </div>
                      )}
                    </div>
                    
                    {globalPendingTickets.length > 0 && (
                      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-center">
                        <Link href="/admin/tickets" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">
                          Ver todas las validaciones pendientes →
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="relative group">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                <div className="bg-emerald-100 dark:bg-emerald-900/50 w-8 h-8 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">A</div>
                <span className="font-bold text-sm hidden md:block text-slate-700 dark:text-slate-200">Admin CampoAgro</span>
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right scale-95 group-hover:scale-100">
                <Link 
                  href="/admin/perfil" 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <Users className="w-4 h-4" /> Mi Perfil
                </Link>
                <div className="h-px bg-slate-100 my-1"></div>
                <Link 
                  href="/logout" 
                  method="post" 
                  as="button"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Cerrar Sesión
                </Link>
              </div>
            </div>
            <Link href="/" className="md:hidden p-2 text-slate-500 hover:text-rose-600">
              <ArrowLeft className="w-5 h-5"/>
            </Link>
          </div>
        </div>

        {children}
      </main>

      {/* Global Flash Toast */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl text-white font-bold shadow-2xl flex items-center gap-3 z-50 animate-bounce transition-all ${
          toastType === 'error' ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}
    </div>
  );
}
