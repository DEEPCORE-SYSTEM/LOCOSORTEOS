import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Save, ArrowLeft, Image as ImageIcon, Calendar, Tag, DollarSign, Target } from 'lucide-react';

export default function SorteoForm({ sorteo }) {
  const isEditing = !!sorteo;
  
  // Format dates for local datetime-local input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const { data, setData, post, put, processing, errors } = useForm({
    nombre: sorteo?.nombre || '',
    tipo: sorteo?.tipo || 'General',
    imagen_hero: sorteo?.imagen_hero || '',
    descripcion: sorteo?.descripcion || '',
    fecha_inicio: formatDateForInput(sorteo?.fecha_inicio) || '',
    fecha_fin: formatDateForInput(sorteo?.fecha_fin) || '',
    cantidad_tickets: sorteo?.cantidad_tickets || 5000,
    precio_ticket: sorteo?.precio_ticket || 40,
    estado: sorteo?.estado || 'borrador', // borrador, programado, activo, finalizado
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      put(route('admin.sorteos.update', sorteo.id));
    } else {
      post(route('admin.sorteos.store'));
    }
  };

  return (
    <AdminLayout currentView="admin-sorteos" pendingTicketsCount={0}>
      <Head title={`${isEditing ? 'Editar' : 'Crear'} Sorteo | Admin Finagro`} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href={route('admin.sorteos')} className="p-2 border border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h3 className="text-xl font-black text-slate-900">
            {isEditing ? 'Editar Configuración del Sorteo' : 'Crear Nuevo Sorteo'}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {/* SECCIÓN 1: DATOS GENERALES */}
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Tag className="w-4 h-4 text-emerald-600"/> Identificación y Aspecto
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Evento</label>
                <input 
                  type="text" 
                  value={data.nombre}
                  onChange={e => setData('nombre', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-400 font-bold" 
                  placeholder="Ej: Gran Sorteo 28 de Febrero" 
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Sorteo</label>
                <select 
                  value={data.tipo}
                  onChange={e => setData('tipo', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-slate-700 font-bold"
                >
                  <option value="General">Sorteo General (Vehículos y Efectivo)</option>
                  <option value="Relámpago">Sorteo Relámpago (Efectivo Rápido)</option>
                  <option value="Especial">Especial (Fechas Fectivas)</option>
                </select>
                {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Descripción (Para portada)</label>
                <textarea 
                  value={data.descripcion}
                  onChange={e => setData('descripcion', e.target.value)}
                  rows="3" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-400 font-medium" 
                  placeholder="Breve llamado a la acción..." 
                ></textarea>
                {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">URL Imagen Hero (Fondo de Pantalla)</label>
                <div className="flex gap-4 items-center">
                  <div className="bg-slate-100 h-20 w-32 rounded-lg border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {data.imagen_hero ? (
                      <img src={data.imagen_hero} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="w-full">
                    <input 
                      type="text" 
                      value={data.imagen_hero}
                      onChange={e => setData('imagen_hero', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-400 font-medium text-sm" 
                      placeholder="https://images.unsplash.com/..." 
                    />
                    <p className="text-xs text-slate-500 mt-1">Pega aquí el enlace de internet de la imagen de alta calidad.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: PARÁMETROS FINANCIEROS Y DE TIEMPO */}
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 mt-8">
              <Target className="w-4 h-4 text-emerald-600"/> Parámetros de Operación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <label className="block text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4"/> Precio por Ticket (S/)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">S/</span>
                  <input 
                    type="number" 
                    step="0.10"
                    value={data.precio_ticket}
                    onChange={e => setData('precio_ticket', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-emerald-200 shadow-sm focus:border-emerald-500 focus:outline-none placeholder-slate-400 font-black text-emerald-700 text-lg" 
                  />
                </div>
                {errors.precio_ticket && <p className="text-red-500 text-xs mt-1">{errors.precio_ticket}</p>}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-2">Cantidad Total de Tickets a Emitir</label>
                <input 
                  type="number" 
                  value={data.cantidad_tickets}
                  onChange={e => setData('cantidad_tickets', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 shadow-sm focus:border-emerald-500 focus:outline-none placeholder-slate-400 font-black text-slate-700 text-lg" 
                  placeholder="Ej: 5000" 
                />
                {errors.cantidad_tickets && <p className="text-red-500 text-xs mt-1">{errors.cantidad_tickets}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4"/> Fecha y Hora de Inicio
                </label>
                <input 
                  type="datetime-local" 
                  value={data.fecha_inicio}
                  onChange={e => setData('fecha_inicio', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-slate-700 font-medium" 
                />
                {errors.fecha_inicio && <p className="text-red-500 text-xs mt-1">{errors.fecha_inicio}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500"/> Fecha y Hora del Gran Sorteo (Fin)
                </label>
                <input 
                  type="datetime-local" 
                  value={data.fecha_fin}
                  onChange={e => setData('fecha_fin', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-red-200 bg-red-50/30 focus:border-red-500 focus:outline-none text-red-700 font-black" 
                />
                <p className="text-xs text-red-500 mt-1">Este valor controlará el contador regresivo en la página principal.</p>
                {errors.fecha_fin && <p className="text-red-500 text-xs mt-1">{errors.fecha_fin}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Estado del Sorteo</label>
                <div className="flex flex-wrap gap-4 pt-2">
                  {['borrador', 'programado', 'activo', 'finalizado'].map(estado => (
                    <label key={estado} className={`cursor-pointer border-2 rounded-xl px-4 py-3 flex items-center gap-3 transition-colors ${data.estado === estado ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}>
                      <input 
                        type="radio" 
                        name="estado" 
                        value={estado}
                        checked={data.estado === estado}
                        onChange={e => setData('estado', e.target.value)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" 
                      />
                      <span className="font-bold text-sm text-slate-700 uppercase">{estado}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Link href={route('admin.sorteos')} className="px-6 py-3 rounded-xl font-bold bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={processing}
              className="px-8 py-3 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" /> 
              {processing ? 'Guardando...' : (isEditing ? 'Actualizar Sorteo' : 'Crear Sorteo')}
            </button>
          </div>

        </form>
      </div>

    </AdminLayout>
  );
}
