import React from 'react';
import { Link } from '@inertiajs/react';
import { Ticket, Calendar, DollarSign, LogOut } from 'lucide-react';

export default function AppLayout({ children, currentUser }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* Header Autenticado (Usuario) */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center max-w-5xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo-campoagro.png" alt="Campoagro Logo" className="h-8 md:h-10 w-auto" />
            <img src="/images/nombre.jpg" alt="CampoAgro" className="h-6 md:h-8 w-auto" />
          </Link>

          {/* User Info / Links */}
          <div className="flex items-center gap-4">
            <span className="font-bold text-sm text-slate-600 hidden md:block">
              Hola, <span className="text-emerald-700">{currentUser?.name?.split(' ')[0] || 'Usuario'}</span>
            </span>
            <Link href="/dashboard" className="flex items-center gap-1.5 font-bold text-sm text-slate-600 hover:text-emerald-600 transition">
              <Ticket className="w-4 h-4" /> Mis Tickets
            </Link>
            <Link href="/logout" method="post" as="button" className="flex items-center gap-1.5 text-red-500 hover:text-red-700 font-bold text-sm transition bg-red-50 px-3 py-1.5 rounded-full">
              <LogOut className="w-4 h-4" /> Salir
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer Simple */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-slate-400 font-medium text-xs mt-auto">
        <div className="container mx-auto px-4">
          <p>© 2026 Sorteos Campoagro. AGROINVERSIONES PERUVIAN ECOLOGIC S.A.C</p>
        </div>
      </footer>
    </div>
  );
}
