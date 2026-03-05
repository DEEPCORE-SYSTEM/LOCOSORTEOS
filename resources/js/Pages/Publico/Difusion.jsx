import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Megaphone, BellRing, Facebook, MessageCircle, Send } from 'lucide-react';

export default function Difusion({ broadcastMessages = [] }) {
  const { auth, settings = {} } = usePage().props;

  return (
    <PublicLayout isLoggedIn={!!auth?.user} currentUser={auth?.user}>
      <Head title="Canal de Difusión | Sorteos CampoAgro" />
      <section className="py-12 bg-[#F8FAFC] min-h-[60vh]">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors w-max">
            <ArrowLeft className="w-5 h-5" /> Volver al inicio
          </Link>

          {/* Header del Canal - Verde Botánico */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-8 text-center shadow-lg relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400 opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

            <div className="relative z-10">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                <Megaphone className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Canal de Difusión Oficial</h2>
              <p className="text-emerald-100 font-medium max-w-lg mx-auto mb-8">
                Únete a nuestras comunidades para enterarte antes que nadie sobre nuevos sorteos, promociones relámpago y transmisiones en vivo.
              </p>

              <div className="flex justify-center gap-4 flex-wrap">
                {settings.whatsapp && (
                  <a href={settings.whatsapp.startsWith('http') ? settings.whatsapp : `https://wa.me/${settings.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#20B858] text-white font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105">
                    <MessageCircle className="w-6 h-6" /> Unirme a WhatsApp
                  </a>
                )}
                {settings.link_redes && (
                  <a href={settings.link_redes} target="_blank" rel="noopener noreferrer" className="bg-[#1877F2] hover:bg-[#155fc2] text-white font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105">
                    <Facebook className="w-6 h-6" /> Ver Facebook
                  </a>
                )}
                {settings.tiktok_url && (
                  <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="bg-black hover:bg-zinc-800 text-white font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                    Seguir en TikTok
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Feed de Anuncios */}
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <BellRing className="w-6 h-6 text-amber-500" /> Últimos Anuncios
            </h3>

            <div className="space-y-4">
              {broadcastMessages.length > 0 ? (
                broadcastMessages.map((msg) => (
                  <div key={msg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${msg.type === 'alert' ? 'bg-red-500' :
                        msg.type === 'promo' ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}></div>

                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3 pl-2">
                      <h4 className="font-black text-lg text-slate-900">{msg.title}</h4>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full w-max">{msg.date}</span>
                    </div>

                    <p className="text-slate-600 font-medium leading-relaxed pl-2 whitespace-pre-wrap">
                      {msg.content}
                    </p>

                    <div className="mt-4 flex gap-3 pl-2">
                      {settings.link_redes && (
                        <a href={settings.link_redes} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-800 transition-colors">
                          <Facebook className="w-4 h-4" /> Ver en Facebook
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-slate-500 font-bold">Sin anuncios recientes.</p>
                </div>
              )}
            </div>

            {broadcastMessages.length > 5 && (
              <div className="text-center mt-8">
                <button className="border-2 border-slate-200 text-slate-500 font-bold px-6 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                  Cargar mensajes anteriores
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
