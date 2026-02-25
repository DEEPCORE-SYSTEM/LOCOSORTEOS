import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  Sprout, LayoutDashboard, Trophy, PlayCircle, 
  Ticket, Users, Megaphone, ArrowLeft, BellRing 
} from 'lucide-react';

export default function AdminLayout({ children, currentView = 'admin-dashboard', pendingTicketsCount = 0 }) {
  const { flash } = usePage().props;
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success'); // 'success' | 'error'

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
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col md:flex-row font-sans text-slate-900">
      {/* Admin Sidebar - VERDE AGRÓNOMO ORIGINAL */}
      <aside className="w-full md:w-64 bg-[#064E3B] text-slate-300 flex flex-col shrink-0 md:h-screen md:sticky md:top-0">
        <div className="p-4 md:p-6 border-b border-emerald-800/50 flex justify-between items-center">
          <div>
            <span className="text-xl font-black italic uppercase text-white flex items-center gap-2">
              <Sprout className="w-5 h-5 text-amber-400" />
              Sorteos <span className="text-amber-400">Finagro</span>
            </span>
            <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase mt-1">Panel Administrativo</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-2 md:gap-0 [&::-webkit-scrollbar]:hidden text-sm">
          <Link href="/admin/dashboard" className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${currentView === 'admin-dashboard' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5"/> <span className="inline">Resumen</span>
          </Link>
          <Link href="/admin/sorteos" className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${['admin-sorteos', 'admin-nuevo-sorteo'].includes(currentView) ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
            <Trophy className="w-5 h-5"/> <span className="inline">Gestión Sorteos</span>
          </Link>
          <Link href="/admin/ejecucion" className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors text-amber-400 ${currentView === 'admin-ejecucion' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-amber-300'}`}>
            <PlayCircle className="w-5 h-5"/> <span className="inline uppercase">Ejecutar Sorteo</span>
          </Link>
          <Link href="/admin/tickets" className={`flex items-center justify-between shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${['admin-tickets', 'admin-lista-tickets', 'admin-talonario'].includes(currentView) ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
            <div className="flex items-center gap-3"><Ticket className="w-5 h-5"/> <span className="inline">Pagos y Tickets</span></div>
            {pendingTicketsCount > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingTicketsCount}</span>}
          </Link>
          <Link href="/admin/usuarios" className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${currentView === 'admin-users' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
            <Users className="w-5 h-5"/> <span className="inline">Usuarios Registrados</span>
          </Link>
          <Link href="/admin/difusion" className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${currentView === 'admin-difusion' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
            <Megaphone className="w-5 h-5"/> <span className="inline">Difusión y Contenido</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-emerald-800/50 hidden md:block">
          <Link href="/" className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-emerald-800 hover:text-white transition-colors text-emerald-400">
            <ArrowLeft className="w-5 h-5"/> <span>Volver a la Web</span>
          </Link>
        </div>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 w-full max-w-full overflow-y-auto p-4 md:p-8">
        {/* Header Superior del Main */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900">
            {currentView === 'admin-dashboard' && 'Resumen del Sistema'}
            {currentView === 'admin-sorteos' && 'Administrar Sorteos'}
            {currentView === 'admin-nuevo-sorteo' && 'Crear Sorteo'}
            {currentView === 'admin-ejecucion' && 'Panel de Ejecución de Sorteo'}
            {currentView === 'admin-tickets' && 'Validación de Pagos (Bouchers)'}
            {currentView === 'admin-lista-tickets' && 'Base de Datos de Tickets'}
            {currentView === 'admin-talonario' && 'Talonario y Ventas Offline'}
            {currentView === 'admin-users' && 'Gestión de Usuarios'}
            {currentView === 'admin-difusion' && 'Canal de Difusión'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="bg-white p-2 rounded-full shadow-sm text-slate-500 hover:text-emerald-600 relative transition-colors">
              <BellRing className="w-5 h-5" />
              {pendingTicketsCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>}
            </button>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-200 transition-colors">
              <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center text-emerald-700 font-bold">A</div>
              <span className="font-bold text-sm hidden md:block text-slate-700">Admin Finagro</span>
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
