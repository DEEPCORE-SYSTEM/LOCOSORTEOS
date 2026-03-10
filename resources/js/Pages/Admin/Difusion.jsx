import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
  Plus, Settings, Globe, Link2, Phone, Facebook,
  MessageCircle, X, Send, Megaphone, BellRing, CheckCircle,
  QrCode, Banknote, Instagram, Youtube
} from 'lucide-react';
import axios from 'axios';

const InputField = ({ label, value, onChange, placeholder, type = 'text', hint }) => (
  <div>
    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none text-sm text-slate-800 placeholder-slate-300 transition-all"
    />
    {hint && <p className="text-[10px] text-slate-400 mt-1 leading-snug">{hint}</p>}
  </div>
);

const Modal = ({ title, icon: Icon, iconColor, onClose, onSave, saving, saveMsg, children }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100">
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
        <h2 className={`font-extrabold text-slate-800 flex items-center gap-2 text-base`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
          {title}
        </h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">
        {children}
        {saveMsg && (
          <div className={`flex items-center gap-2 text-xs font-bold rounded-lg px-3 py-2 ${saveMsg.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
            <CheckCircle className="w-3.5 h-3.5" /> {saveMsg}
          </div>
        )}
      </div>
      <div className="px-6 pb-5 flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors">
          Cancelar
        </button>
        <button onClick={onSave} disabled={saving}
          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-60 transition-colors shadow-sm">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  </div>
);

export default function Difusion({ broadcastMessagesPaginated, filters = {} }) {
  const pendingTicketsCount = 0;
  
  const broadcastMessagesData = broadcastMessagesPaginated?.data || [];
  const paginationLinks = broadcastMessagesPaginated?.links || [];
  const [perPage, setPerPage] = useState(filters.perPage || 25);

  const handlePerPageChange = (e) => {
    const val = e.target.value;
    setPerPage(val);
    router.get('/admin/difusion', { perPage: val }, { preserveState: true, replace: true });
  };

  
  const { data, setData, post, processing, reset, errors } = useForm({
    title: '',
    content: '',
    type: 'alert',
  });

  const handleCreateMessage = (e) => {
    e.preventDefault();
    post('/admin/difusion', { onSuccess: () => reset() });
  };

  
  const [settings, setSettings] = useState({
    link_redes: '', tiktok_url: '', whatsapp: '', yape_numero: '', plin_numero: '',
  });
  const [activeModal, setActiveModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    axios.get('/admin/configuracion').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const openModal = (m) => { setSaveMsg(''); setActiveModal(m); };
  const closeModal = () => setActiveModal(null);

  const saveSettings = async (keys) => {
    setSaving(true); setSaveMsg('');
    const payload = {};
    keys.forEach(k => { payload[k] = settings[k]; });
    try {
      await axios.post('/admin/configuracion', payload);
      setSaveMsg('¡Configuración guardada exitosamente!');
      setTimeout(() => { setSaveMsg(''); closeModal(); }, 1500);
    } catch {
      setSaveMsg('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const typeConfig = {
    alert: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Alerta' },
    news: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Noticia' },
    promo: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400', label: 'Promo' },
  };

  const configItems = [
    {
      key: 'redes',
      icon: Link2,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Redes Sociales',
      desc: 'Facebook, TikTok, WhatsApp y enlace QR del talonario',
      badge: settings.link_redes || settings.tiktok_url ? '✓ Configurado' : 'Sin configurar',
      badgeOk: !!(settings.link_redes || settings.tiktok_url),
    },
    {
      key: 'pagos',
      icon: Banknote,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      title: 'Métodos de Pago',
      desc: 'Números de Yape, Plin y WhatsApp de contacto',
      badge: settings.yape_numero ? '✓ Configurado' : 'Sin configurar',
      badgeOk: !!settings.yape_numero,
    },
  ];

  return (
    <AdminLayout currentView="admin-difusion" pendingTicketsCount={pendingTicketsCount}>
      <Head title="Difusión | Admin CampoAgro" />

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-black text-slate-800">Difusión y Configuración</h1>
        <p className="text-sm text-slate-400 mt-1">Publica mensajes a tus clientes y gestiona los datos de contacto y redes sociales.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── IZQUIERDA: Crear Mensaje ── */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm leading-tight">Nuevo Mensaje de Difusión</h3>
                <p className="text-[11px] text-slate-400">Visible para todos los clientes en la plataforma</p>
              </div>
            </div>

            <form onSubmit={handleCreateMessage} className="p-6 space-y-4">
              {/* Tipo */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Tipo de Aviso</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(typeConfig).map(([value, cfg]) => (
                    <button
                      key={value} type="button"
                      onClick={() => setData('type', value)}
                      className={`relative py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all text-center ${
                        data.type === value
                          ? `${cfg.bg} ${cfg.text} border-current`
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5 align-middle`}></span>
                      {cfg.label}
                    </button>
                  ))}
                </div>
                {errors.type && <p className="text-red-500 text-xs mt-2">{errors.type}</p>}
              </div>

              {/* Título */}
              <InputField
                label="Título del Anuncio"
                value={data.title}
                onChange={e => setData('title', e.target.value)}
                placeholder="Ej: ¡Últimos tickets disponibles!"
              />
              {errors.title && <p className="text-red-500 text-xs -mt-2">{errors.title}</p>}

              {/* Contenido */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Mensaje</label>
                <textarea
                  rows={4}
                  value={data.content}
                  onChange={e => setData('content', e.target.value)}
                  placeholder="Escribe el contenido del mensaje que verán tus clientes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none text-sm text-slate-800 placeholder-slate-300 resize-none transition-all"
                />
                {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                {processing ? 'Publicando...' : 'Publicar Mensaje'}
              </button>
            </form>

            {/* Historial reciente (si hay mensajes) */}
            {broadcastMessagesData.length > 0 && (
              <div className="border-t border-slate-100 px-6 pb-5 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Historial de Mensajes</p>
                  <select
                    value={perPage}
                    onChange={handlePerPageChange}
                    className="border border-slate-200 text-xs font-bold text-slate-600 py-1.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500"
                  >
                    <option value="25">25 Filas</option>
                    <option value="50">50 Filas</option>
                    <option value="100">100 Filas</option>
                    <option value="500">500 Filas</option>
                    <option value="1000">1000 Filas</option>
                    <option value="todos">Todos</option>
                  </select>
                </div>
                <div className="space-y-2">
                  {broadcastMessagesData.map(msg => {
                    const cfg = typeConfig[msg.type] || typeConfig.news;
                    return (
                      <div key={msg.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`}></span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{msg.title}</p>
                          <p className="text-[10px] text-slate-400">{msg.date}</p>
                        </div>
                        <span className={`shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {paginationLinks.length > 3 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-xs text-slate-500 font-bold">
                      Mostrando {broadcastMessagesPaginated.current_page} de {broadcastMessagesPaginated.last_page} ({broadcastMessagesPaginated.total} totales)
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {paginationLinks.map((link, idx) => (
                        <div key={idx}>
                          {link.url === null ? (
                              <span className="px-2 py-1 border border-slate-200 text-slate-400 rounded-md bg-white cursor-not-allowed text-[10px] font-bold" dangerouslySetInnerHTML={{ __html: link.label }} />
                          ) : (
                              <button
                                type="button"
                                onClick={() => router.get(link.url, { perPage }, { preserveState: true })}
                                className={`px-2 py-1 border border-slate-200 rounded-md transition-colors text-[10px] font-bold ${link.active ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                              />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── DERECHA: Configuración ── */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5">

          {/* Config cards */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center">
                <Settings className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm leading-tight">Configuración del Sistema</h3>
                <p className="text-[11px] text-slate-400">Datos de contacto, pagos y redes sociales</p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {configItems.map(item => (
                <div
                  key={item.key}
                  className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50/50 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-sm text-slate-800 leading-tight">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{item.desc}</p>
                    <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeOk ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                  <button
                    onClick={() => openModal(item.key)}
                    className="shrink-0 text-emerald-600 font-extrabold text-xs px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
                  >
                    Editar
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── MODAL: Redes Sociales ── */}
      {activeModal === 'redes' && (
        <Modal
          title="Redes Sociales"
          icon={Globe}
          iconColor="text-purple-600"
          onClose={closeModal}
          onSave={() => saveSettings(['link_redes', 'tiktok_url', 'whatsapp'])}
          saving={saving}
          saveMsg={saveMsg}
        >
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
              <p className="text-xs text-purple-700 font-bold flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" /> El link de Facebook genera el código QR del talonario
              </p>
            </div>
            <InputField
              label="📘  Facebook (URL de la página)"
              value={settings.link_redes}
              onChange={e => setSettings(s => ({...s, link_redes: e.target.value}))}
              placeholder="https://facebook.com/TuPaginaOficial"
              type="url"
              hint="Esta URL se codifica como el código QR visible en los tickets físicos impresos."
            />
            <InputField
              label="🎵  TikTok (URL del perfil)"
              value={settings.tiktok_url}
              onChange={e => setSettings(s => ({...s, tiktok_url: e.target.value}))}
              placeholder="https://tiktok.com/@TuPerfil"
              type="url"
            />
            <InputField
              label="💬  WhatsApp de atención"
              value={settings.whatsapp}
              onChange={e => setSettings(s => ({...s, whatsapp: e.target.value}))}
              placeholder="+51 999 999 999"
              hint="Número al que los clientes escriben para consultas y confirmación de pago."
            />
          </div>
        </Modal>
      )}

      {/* ── MODAL: Métodos de Pago ── */}
      {activeModal === 'pagos' && (
        <Modal
          title="Métodos de Pago y Contacto"
          icon={Banknote}
          iconColor="text-emerald-600"
          onClose={closeModal}
          onSave={() => saveSettings(['whatsapp', 'yape_numero', 'plin_numero'])}
          saving={saving}
          saveMsg={saveMsg}
        >
          <div className="space-y-4">
            <InputField
              label="WhatsApp de Atención"
              value={settings.whatsapp}
              onChange={e => setSettings(s => ({...s, whatsapp: e.target.value}))}
              placeholder="+51 999 999 999"
              hint="Número al que se dirige a los clientes para consultas y confirmación de pagos."
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Número Yape"
                value={settings.yape_numero}
                onChange={e => setSettings(s => ({...s, yape_numero: e.target.value}))}
                placeholder="+51 9xx xxx xxx"
              />
              <InputField
                label="Número Plin"
                value={settings.plin_numero}
                onChange={e => setSettings(s => ({...s, plin_numero: e.target.value}))}
                placeholder="+51 9xx xxx xxx"
              />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[10px] text-slate-500 leading-snug">
                <strong className="text-slate-700">Importante:</strong> Asegúrate de que los números registrados sean los correctos. Los clientes usarán estos datos para realizar sus pagos.
              </p>
            </div>
          </div>
        </Modal>
      )}

    </AdminLayout>
  );
}
