import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Megaphone, MessageCircle, Send, Plus, Trash2, Edit, AlertTriangle } from 'lucide-react';

export default function Contenido() {
  const pendingTicketsCount = 0;

  const [broadcastMessages, setBroadcastMessages] = useState([
    { id: 1, date: '21 Feb 2026 - 09:30 AM', title: '🔥 ¡ÚLTIMOS TICKETS!', content: 'Gente, se nos acaban los tickets para el Gran Sorteo del 28 de Febrero. ¡Asegura el tuyo antes de que se agoten!', type: 'alert' },
    { id: 2, date: '19 Feb 2026 - 04:15 PM', title: '🏆 Nueva Camioneta Entregada', content: 'Ayer entregamos la Hilux al ganador #120 en la ciudad de Lima. Pueden ver la transmisión completa en nuestro Facebook oficial.', type: 'news' },
    { id: 3, date: '15 Feb 2026 - 11:00 AM', title: '🎁 SORTEO RELÁMPAGO', content: 'Hoy sorteamos 5 fajos de S/1,200 EXCLUSIVAMENTE entre todos los que compren 3 tickets o más antes de las 6:00 PM.', type: 'promo' }
  ]);

  const [newMessage, setNewMessage] = useState({ title: '', content: '', type: 'news' });

  const handleCreateMessage = (e) => {
    e.preventDefault();
    if(!newMessage.title || !newMessage.content) {
      alert("Por favor completa el título y el contenido del mensaje.");
      return;
    }
    const msg = {
      id: Date.now(),
      date: new Date().toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }),
      ...newMessage
    };
    setBroadcastMessages([msg, ...broadcastMessages]);
    setNewMessage({ title: '', content: '', type: 'news' });
    alert("Publicación creada. Aparecerá en el Canal de Difusión Público de los clientes.");
  };

  const handleDeleteMessage = (id) => {
    if(window.confirm("¿Seguro que deseas eliminar esta publicación del canal público?")) {
      setBroadcastMessages(broadcastMessages.filter(msg => msg.id !== id));
    }
  };

  return (
    <AdminLayout currentView="admin-content" pendingTicketsCount={pendingTicketsCount}>
      <Head title="Contenido y Difusión | Admin Finagro" />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Editor de Mensajes */}
        <div className="w-full xl:w-1/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="font-black text-lg text-slate-900 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> Nuevo Comunicado
            </h3>
            
            <form onSubmit={handleCreateMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Aviso</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setNewMessage({...newMessage, type: 'news'})} className={`py-2 rounded-xl text-xs font-bold transition-all border ${newMessage.type === 'news' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`}>Noticia</button>
                  <button type="button" onClick={() => setNewMessage({...newMessage, type: 'alert'})} className={`py-2 rounded-xl text-xs font-bold transition-all border ${newMessage.type === 'alert' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-red-300'}`}>Alerta</button>
                  <button type="button" onClick={() => setNewMessage({...newMessage, type: 'promo'})} className={`py-2 rounded-xl text-xs font-bold transition-all border ${newMessage.type === 'promo' ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'}`}>Promo</button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="title">Título Principal</label>
                <input 
                  type="text" 
                  id="title"
                  value={newMessage.title}
                  onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-400 font-bold" 
                  placeholder="Ej: 🔥 SORTEO RELÁMPAGO HOY" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="content">Cuerpo del Mensaje</label>
                <textarea 
                  id="content"
                  rows="4" 
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-400 resize-none text-sm" 
                  placeholder="Escribe el detalle del comunicado aquí..."
                ></textarea>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <input type="checkbox" id="pushNotif" className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" defaultChecked />
                <label htmlFor="pushNotif" className="text-xs font-bold text-slate-600">Enviar notificación a la web (Campanita)</label>
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
                <Megaphone className="w-5 h-5"/> Publicar en Canal
              </button>
            </form>
          </div>
        </div>

        {/* Muro de Transmisión */}
        <div className="w-full xl:w-2/3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-xl text-slate-900 group flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-amber-500" /> Muro del Canal de Difusión
            </h3>
            <div className="flex gap-2">
              <a href="#" className="bg-white p-2 border border-slate-200 rounded-lg hover:border-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366] transition-colors text-slate-400 shadow-sm"><MessageCircle className="w-5 h-5"/></a>
              <a href="#" className="bg-white p-2 border border-slate-200 rounded-lg hover:border-[#0088cc] hover:bg-[#0088cc]/10 hover:text-[#0088cc] transition-colors text-slate-400 shadow-sm"><Send className="w-5 h-5"/></a>
            </div>
          </div>

          <div className="space-y-4">
            {broadcastMessages.map((msg) => (
              <div key={msg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  msg.type === 'alert' ? 'bg-red-500' : 
                  msg.type === 'promo' ? 'bg-amber-400' : 'bg-emerald-500'
                }`}></div>
                
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-black text-lg text-slate-900">{msg.title}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1 ${
                      msg.type === 'alert' ? 'bg-red-100 text-red-700' : 
                      msg.type === 'promo' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {msg.type === 'alert' && <AlertTriangle className="w-3 h-3"/>}
                      {msg.type === 'promo' && <Trophy className="w-3 h-3"/>}
                      {msg.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full w-max">{msg.date}</span>
                    <button onClick={() => handleDeleteMessage(msg.id)} className="text-slate-300 hover:text-red-500 transition-colors bg-white hover:bg-red-50 p-1.5 rounded-lg border border-transparent hover:border-red-100">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                    <button className="text-slate-300 hover:text-emerald-600 transition-colors bg-white hover:bg-emerald-50 p-1.5 rounded-lg border border-transparent hover:border-emerald-100">
                      <Edit className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
                
                <p className="text-slate-600 font-medium leading-relaxed">
                  {msg.content}
                </p>
              </div>
            ))}
            
            {broadcastMessages.length === 0 && (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center">
                <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold text-lg">No hay comunicados activos</p>
                <p className="text-slate-400 text-sm">Crea una Noticia, Promo o Alerta para mantener a tus clientes informados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
