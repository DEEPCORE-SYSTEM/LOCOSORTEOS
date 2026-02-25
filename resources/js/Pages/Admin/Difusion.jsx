import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Megaphone, MessageCircle, Send, Plus, Trash2, Edit, AlertTriangle, Trophy, Loader2 } from 'lucide-react';

export default function Difusion({ broadcastMessagesData = [] }) {
  const pendingTicketsCount = 0;

  const [editingId, setEditingId] = useState(null);

  const { data, setData, post, put, processing, reset } = useForm({
    title: '',
    content: '',
    type: 'news'
  });

  const handleCreateOrUpdateMessage = (e) => {
    e.preventDefault();
    if (editingId) {
      put(`/admin/difusion/${editingId}`, {
        onSuccess: () => {
          reset();
          setEditingId(null);
        }
      });
    } else {
      post('/admin/difusion', {
        onSuccess: () => reset()
      });
    }
  };

  const handleEditMessage = (msg) => {
    setEditingId(msg.id);
    setData({
      title: msg.title,
      content: msg.content,
      type: msg.type
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const handleDeleteMessage = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta publicación del canal público?')) {
      router.delete(`/admin/difusion/${id}`, {
        preserveScroll: true
      });
    }
  };

  return (
    <AdminLayout currentView="admin-difusion" pendingTicketsCount={pendingTicketsCount}>
      <Head title="Difusión | Admin Finagro" />

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Editor de Mensajes */}
        <div className="w-full xl:w-1/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 xl:sticky xl:top-24">
            <h3 className="font-black text-lg text-slate-900 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              {editingId ? 'Editar Comunicado' : 'Nuevo Comunicado'}
            </h3>

            <form onSubmit={handleCreateOrUpdateMessage} className="space-y-4">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Etiqueta</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setData('type', 'news')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      data.type === 'news'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'
                    }`}
                  >
                    Noticia
                  </button>
                  <button
                    type="button"
                    onClick={() => setData('type', 'alert')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      data.type === 'alert'
                        ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-red-300'
                    }`}
                  >
                    Alerta
                  </button>
                  <button
                    type="button"
                    onClick={() => setData('type', 'promo')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      data.type === 'promo'
                        ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'
                    }`}
                  >
                    Promo
                  </button>
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="title">
                  Título del Anuncio
                </label>
                <input
                  type="text"
                  id="title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-400 font-bold"
                  placeholder="Ej: 🔥 ¡ÚLTIMOS TICKETS!"
                  required
                />
              </div>

              {/* Contenido */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="content">
                  Contenido
                </label>
                <textarea
                  id="content"
                  rows="4"
                  value={data.content}
                  onChange={(e) => setData('content', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-400 resize-none text-sm"
                  placeholder="Escribe el mensaje detallado..."
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2"
                >
                  {processing
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : editingId ? <Edit className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                  {editingId ? 'Actualizar' : 'Publicar Mensaje'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors shrink-0"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Muro de Transmisión */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-amber-500" /> Muro del Canal de Difusión
            </h3>
            <div className="flex gap-2">
              <a
                href="#"
                className="bg-white p-2 border border-slate-200 rounded-lg hover:border-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366] transition-colors text-slate-400 shadow-sm"
                title="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-white p-2 border border-slate-200 rounded-lg hover:border-[#0088cc] hover:bg-[#0088cc]/10 hover:text-[#0088cc] transition-colors text-slate-400 shadow-sm"
                title="Telegram"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            {broadcastMessagesData.map((msg) => (
              <div
                key={msg.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow"
              >
                {/* Color stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${
                  msg.type === 'alert' ? 'bg-red-500' :
                  msg.type === 'promo' ? 'bg-amber-400' : 'bg-emerald-500'
                }`} />

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-black text-lg text-slate-900">{msg.title}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1 ${
                      msg.type === 'alert' ? 'bg-red-100 text-red-700' :
                      msg.type === 'promo' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {msg.type === 'alert' && <AlertTriangle className="w-3 h-3" />}
                      {msg.type === 'promo' && <Trophy className="w-3 h-3" />}
                      {msg.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full w-max">
                      {msg.date}
                    </span>
                    <button
                      onClick={() => handleEditMessage(msg)}
                      className="text-slate-300 hover:text-emerald-600 transition-colors bg-white hover:bg-emerald-50 p-1.5 rounded-lg border border-transparent hover:border-emerald-100"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors bg-white hover:bg-red-50 p-1.5 rounded-lg border border-transparent hover:border-red-100"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 font-medium leading-relaxed pl-0">
                  {msg.content}
                </p>
              </div>
            ))}

            {broadcastMessagesData.length === 0 && (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center">
                <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold text-lg">No hay comunicados activos</p>
                <p className="text-slate-400 text-sm">
                  Crea una Noticia, Promo o Alerta para mantener a tus clientes informados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
