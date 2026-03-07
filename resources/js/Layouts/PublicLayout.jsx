import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  Ticket, Megaphone, Trophy, Users, LogOut, Menu, X, 
  AlertTriangle, Facebook, MessageCircle, Settings, Send 
} from 'lucide-react';
import ThemeToggle from '../Components/ThemeToggle';

export default function PublicLayout({ children, isLoggedIn = false, currentUser = null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings = {} } = usePage().props;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 pb-20 md:pb-0 transition-colors duration-300">
      
      {/* HEADER CLARO Y AMIGABLE - AGRÓNOMO */}
      <header className="bg-white dark:bg-slate-900/95 dark:backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo + Nombre empresa */}
          <div className="flex items-center gap-3">
            <Link href="/" className="cursor-pointer flex items-center gap-3">
              <img src="/images/logo-campoagro.png" alt="Campoagro Logo" className="h-14 md:h-16 w-auto" />
              <img src="/images/nombre.jpg" alt="CampoAgro" className="h-12 md:h-16 w-auto" />
            </Link>
          </div>

          {/* Menú Desktop */}
          <nav className="hidden lg:flex items-center gap-5 font-bold text-sm text-slate-600 dark:text-slate-300">
            <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              <Ticket className="w-4 h-4" /> Mis Tickets
            </Link>
            <Link href="/difusion" className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              <Megaphone className="w-4 h-4" /> Canal Difusión
            </Link>
            <Link href="/ganadores" className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              <Trophy className="w-4 h-4 text-amber-500" /> Ganadores
            </Link>
            
            <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
               <ThemeToggle />
            </div>
           
            {isLoggedIn ? (
              <div className="flex items-center gap-3 ml-2 border-l border-slate-200 pl-4">
                <span className="text-emerald-700 font-black flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
                    <Users className="w-4 h-4" />
                  </div>
                  {currentUser?.name?.split(' ')[0] || 'Hola'}
                </span>
                <Link href="/logout" method="post" as="button" className="flex items-center gap-1.5 text-red-500 hover:text-red-700 transition bg-red-50 px-3 py-1.5 rounded-full">
                  <LogOut className="w-4 h-4" /> Salir
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2 border-l border-slate-200 pl-4">
                <Link href="/login" className="text-slate-600 hover:text-emerald-600 transition">Ingresar</Link>
                <Link href="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition shadow-sm border-b-2 border-emerald-800">Crear Cuenta</Link>
              </div>
            )}
          </nav>

            {/* Menú Hamburguesa Mobile */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle />
              <button 
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
        </div>

        {/* Menú Mobile Desplegable */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 px-4 py-4 space-y-4 border-t border-gray-100 dark:border-slate-800 shadow-lg absolute w-full z-50">
            {isLoggedIn && (
               <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3 mb-4 border border-emerald-100">
                  <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-800">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Bienvenido</p>
                    <p className="font-black text-emerald-900">{currentUser?.name}</p>
                  </div>
               </div>
            )}
            
            <Link href="/dashboard" className="w-full text-left flex items-center gap-2 font-bold text-slate-700"><Ticket className="w-5 h-5"/> Mis Tickets</Link>
            <Link href="/difusion" className="w-full text-left flex items-center gap-2 font-bold text-slate-700"><Megaphone className="w-5 h-5"/> Canal Difusión</Link>
            <Link href="/ganadores" className="w-full text-left flex items-center gap-2 font-bold text-slate-700"><Trophy className="w-5 h-5 text-amber-500"/> Ganadores</Link>
          
            {isLoggedIn ? (
              <Link href="/logout" method="post" as="button" className="w-full text-left flex items-center gap-2 font-bold text-red-500 mt-4 pt-4 border-t border-gray-100">
                <LogOut className="w-5 h-5" /> Cerrar Sesión
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                <Link href="/login" className="text-center font-bold text-slate-600 bg-slate-50 py-3 rounded-xl border border-slate-200">Ingresar</Link>
                <Link href="/register" className="text-center font-bold text-white bg-emerald-600 py-3 rounded-xl shadow-sm border-b-2 border-emerald-800">Crear Cuenta</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ALERTA DE SEGURIDAD */}
      <div className="bg-[#FFF4F4] border-b border-[#FFE0E0] py-3 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-2 text-center md:text-left">
          <AlertTriangle className="w-6 h-6 shrink-0 text-red-600 animate-pulse hidden md:block" />
          <div className="text-red-700">
            <p className="font-bold text-sm md:text-base">⚠️ ¡ALERTA DE SEGURIDAD! No te dejes engañar ⚠️</p>
            <p className="text-xs md:text-sm mt-0.5">
              Verifica siempre que al realizar el pago salga a nombre de: <strong className="bg-red-600 px-1.5 py-0.5 rounded text-white inline-block mt-1 md:mt-0">AGROINVERSIONES PERUVIAN ECOLOGIC S.A.C</strong>. Si sale otro nombre, ¡ESTÁS SIENDO ESTAFADO!
            </p>
          </div>
        </div>
      </div>

      <main>{children}</main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pt-16 pb-8 text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-3 gap-10 text-center md:text-left mb-12">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <img src="/images/logo-campoagro.png" alt="Campoagro Logo" className="h-10 w-auto" />
              <img src="/images/nombre.jpg" alt="CampoAgro" className="h-8 w-auto" />
            </div>
            <p className="mb-6 text-slate-500">Participa con confianza y gana grandes premios vehiculares, efectivo y tecnología con el sorteo más transparente, respaldado por el sector agrario.</p>
          </div>
          <div>
            <h4 className="text-slate-900 font-bold uppercase mb-4 tracking-wider text-xs">Enlaces Rápidos</h4>
            <ul className="space-y-3 font-medium">
              <li><Link href="/dashboard" className="hover:text-emerald-600 transition">Ver Mis Tickets</Link></li>
              <li><Link href="/difusion" className="hover:text-emerald-600 transition">Canal de Difusión</Link></li>
              <li><Link href="/ganadores" className="hover:text-emerald-600 transition">Ganadores</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 font-bold uppercase mb-4 tracking-wider text-xs">Empresa Operadora</h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-emerald-100">
              <p className="font-black text-slate-800 mb-1">AGROINVERSIONES PERUVIAN ECOLOGIC S.A.C</p>
              <p className="text-xs text-slate-500 mb-3">RUC: 20606235926</p>
              <p className="text-red-600 font-bold text-xs flex items-center gap-1 justify-center md:justify-start">
                <AlertTriangle className="w-4 h-4" /> Nunca deposites a personas naturales.
              </p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 max-w-6xl border-t border-gray-100 pt-8 text-center text-slate-400 font-medium">
          <p>© 2026 Sorteos Campoagro. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* REDES SOCIALES FLOTANTES */}
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex flex-col gap-3">
        {settings.link_redes && (
          <a href={settings.link_redes} target="_blank" rel="noopener noreferrer" className="bg-[#1877F2] text-white p-3 md:p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center group relative">
            <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">Síguenos en Facebook</span>
            <Facebook className="w-6 h-6 md:w-7 md:h-7 fill-current" />
          </a>
        )}
        
        {settings.tiktok_url && (
          <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="bg-black text-white p-3 md:p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center group relative">
            <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">Síguenos en TikTok</span>
            <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </a>
        )}
        
        {settings.whatsapp && (
          <a href={settings.whatsapp.startsWith('http') ? settings.whatsapp : `https://wa.me/${settings.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center group relative">
            <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">Escríbenos al WhatsApp</span>
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
          </a>
        )}
      </div>

      {/* MOBILE STICKY CTA BOTÓN */}
      <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 z-50 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
        <Link href="/dashboard" className="w-full bg-[#25D366] text-white font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_0_#1DA851] active:shadow-none active:translate-y-1 transition-all">
          <Ticket className="w-6 h-6" /> ¡Comprar Ticket S/40!
        </Link>
      </div>
    </div>
  );
}
