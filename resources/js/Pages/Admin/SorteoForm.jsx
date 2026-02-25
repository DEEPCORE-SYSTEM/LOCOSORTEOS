import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Save, ArrowLeft, Image as ImageIcon, Calendar, Tag, DollarSign, Target, Plus, Trash2, Upload } from 'lucide-react';

export default function SorteoForm({ sorteo }) {
  const isEditing = !!sorteo;
  
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const { data, setData, post, put, processing, errors } = useForm({
    nombre: sorteo?.nombre || '',
    tipo: sorteo?.tipo || 'General',
    imagen_hero: sorteo?.imagen_hero || '',
    banner_promocional: sorteo?.banner_promocional || '',
    descripcion: sorteo?.descripcion || '',
    fecha_inicio: formatDateForInput(sorteo?.fecha_inicio) || formatDateForInput(new Date().toISOString()),
    fecha_fin: formatDateForInput(sorteo?.fecha_fin) || '',
    cantidad_tickets: sorteo?.cantidad_tickets || 10000,
    precio_ticket: sorteo?.precio_ticket || 40,
    estado: sorteo?.estado || 'borrador', 
    premios: sorteo?.premios?.length > 0 ? sorteo.premios : [
      { id: Date.now(), nombre: 'Vehículo', descripcion: '', imagen: '', orden: 1 }
    ],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      put(route('admin.sorteos.update', sorteo.id));
    } else {
      post(route('admin.sorteos.store'));
    }
  };

  const addPremioRow = () => {
    setData('premios', [
      ...data.premios,
      { id: Date.now(), nombre: '', descripcion: '', imagen: '', orden: data.premios.length + 1 }
    ]);
  };

  const removePremioRow = (indexToRemove) => {
    if (data.premios.length > 1) {
      const newPremios = data.premios.filter((_, idx) => idx !== indexToRemove).map((p, idx) => ({ ...p, orden: idx + 1 }));
      setData('premios', newPremios);
    }
  };

  const updatePremio = (index, field, value) => {
    const newPremios = [...data.premios];
    newPremios[index][field] = value;
    setData('premios', newPremios);
  };

  return (
    <AdminLayout currentView="admin-sorteos" pendingTicketsCount={0}>
      <Head title={`${isEditing ? 'Editar' : 'Crear'} Sorteo | Admin Finagro`} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href={route('admin.sorteos')} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {isEditing ? 'Editar Sorteo' : 'Configuración de Nuevo Sorteo'}
            </h3>
            <p className="text-sm text-slate-500 font-medium tracking-tight">Parámetros independientes. Este sorteo no afectará el historial de sorteos anteriores.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-10">
          
          {/* SECCIÓN 1: DATOS GENERALES */}
          <div>
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <span className="text-emerald-600 bg-emerald-50 rounded-full w-6 h-6 flex items-center justify-center">1</span> Información General
            </h4>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Título Promocional del Sorteo</label>
                <input 
                  type="text" 
                  value={data.nombre}
                  onChange={e => setData('nombre', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-400 font-bold" 
                  placeholder="Ej: Gran Sorteo Nacional Finagro 2026" 
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Descripción (Visible para el cliente)</label>
                <textarea 
                  value={data.descripcion}
                  onChange={e => setData('descripcion', e.target.value)}
                  rows="3" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-400 font-medium text-sm" 
                  placeholder="Describe brevemente las condiciones o motivo del sorteo..." 
                ></textarea>
                {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Estado Inicial de Publicación</label>
                <select 
                  value={data.estado}
                  onChange={e => setData('estado', e.target.value)}
                  className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-slate-700 font-bold text-sm bg-white"
                >
                  <option value="borrador">Borrador (Oculto, permite configurar)</option>
                  <option value="programado">Programado (Casi Activo)</option>
                  <option value="activo">Activo (Público)</option>
                  <option value="finalizado">Finalizado</option>
                </select>
                {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: PARÁMETROS FINANCIEROS Y DE TIEMPO */}
          <div>
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <span className="text-emerald-600 bg-emerald-50 rounded-full w-6 h-6 flex items-center justify-center">2</span> Parámetros y Disponibilidad
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Precio Fijo del Ticket (S/)</label>
                <input 
                  type="number" 
                  step="0.10"
                  value={data.precio_ticket}
                  onChange={e => setData('precio_ticket', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-400 font-medium text-sm" 
                  placeholder="Ej: 40.00" 
                />
                <p className="text-[10px] text-slate-400 mt-1">No se podrá cambiar luego de la primera venta.</p>
                {errors.precio_ticket && <p className="text-red-500 text-xs mt-1">{errors.precio_ticket}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Fecha y Hora de Cierre</label>
                <input 
                  type="datetime-local" 
                  value={data.fecha_fin}
                  onChange={e => setData('fecha_fin', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-slate-700 font-medium text-sm bg-white" 
                />
                {errors.fecha_fin && <p className="text-red-500 text-xs mt-1">{errors.fecha_fin}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Rango Numérico Permitido</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={0}
                    disabled
                    className="w-20 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:outline-none font-medium text-sm text-center text-slate-400" 
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input 
                    type="number" 
                    value={data.cantidad_tickets}
                    onChange={e => setData('cantidad_tickets', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none font-medium text-sm" 
                    placeholder="Ej: 9999" 
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">El sistema asignará tickets dentro de este límite exacto.</p>
                {errors.cantidad_tickets && <p className="text-red-500 text-xs mt-1">{errors.cantidad_tickets}</p>}
              </div>

            </div>
          </div>

          {/* SECCIÓN 3: IMÁGENES Y BANNERS */}
          <div>
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
               <span className="text-emerald-600 bg-emerald-50 rounded-full w-6 h-6 flex items-center justify-center">3</span> Imágenes y Banners
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Imagen Principal (Hero) */}
              <div className="border border-slate-200 hover:border-emerald-500 transition-colors rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 relative overflow-hidden group">
                <div className="z-10 relative flex flex-col items-center w-full">
                   <ImageIcon className="w-8 h-8 text-slate-400 mb-3" />
                   <span className="text-sm font-bold text-slate-700 block mb-1">Subir Imagen Principal (Hero)</span>
                   <span className="text-[10px] text-slate-400 block mb-3">JPG, WEBP. Ideal 1000x1000px</span>
                   <input
                     type="text"
                     value={data.imagen_hero}
                     onChange={e => setData('imagen_hero', e.target.value)}
                     placeholder="Pegar URL de la imagen aquí..."
                     className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-center"
                   />
                </div>
                {data.imagen_hero && (
                  <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <img src={data.imagen_hero} alt="bg" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Banner Promocional */}
              <div className="border border-slate-200 hover:border-emerald-500 transition-colors rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 relative overflow-hidden group">
                <div className="z-10 relative flex flex-col items-center w-full">
                   <ImageIcon className="w-8 h-8 text-slate-400 mb-3" />
                   <span className="text-sm font-bold text-slate-700 block mb-1">Subir Banner Promocional</span>
                   <span className="text-[10px] text-slate-400 block mb-3">JPG, WEBP. Ideal 1920x820px</span>
                   <input
                     type="text"
                     value={data.banner_promocional}
                     onChange={e => setData('banner_promocional', e.target.value)}
                     placeholder="Pegar URL del banner aquí..."
                     className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-center"
                   />
                </div>
                {data.banner_promocional && (
                  <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <img src={data.banner_promocional} alt="bg" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* SECCIÓN 4: PREMIOS OFRECIDOS */}
          <div>
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <span className="text-emerald-600 bg-emerald-50 rounded-full w-6 h-6 flex items-center justify-center">4</span> Plan de Premios Ofrecidos
            </h4>
            
            <div className="space-y-4">
              {data.premios.map((premio, index) => (
                <div key={premio.id || index} className="flex flex-col md:flex-row gap-3 items-center border border-slate-200 p-3 rounded-xl bg-white shadow-sm">
                  
                  {/* Photo Upload Simul */}
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 overflow-hidden shrink-0 relative group">
                    {premio.imagen ? (
                      <img src={premio.imagen} alt="premio" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-slate-400 mb-1" />
                        <span className="text-[8px] text-slate-400 font-bold uppercase">Subir<br/>Foto</span>
                      </>
                    )}
                    <input type="text" value={premio.imagen || ''} onChange={(e) => updatePremio(index, 'imagen', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer text-[1px]" title="URL de imagen" />
                  </div>

                  {/* Number / Position */}
                  <div className="w-12 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-600 shrink-0">
                    {index + 1}
                  </div>

                  {/* Name / Category */}
                  <select 
                    value={premio.nombre} 
                    onChange={e => updatePremio(index, 'nombre', e.target.value)}
                    className="w-32 py-2.5 px-3 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:border-emerald-500 text-sm font-bold text-slate-700"
                  >
                    <option value="Vehículo">Vehículo</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Electrónica">Electrónica</option>
                    <option value="Viaje">Viaje</option>
                    <option value="Otro">Otro Premio</option>
                  </select>

                  {/* Description */}
                  <input 
                    type="text" 
                    value={premio.descripcion} 
                    onChange={e => updatePremio(index, 'descripcion', e.target.value)}
                    placeholder="Descripción: Ej. Camioneta Toyota Hilux" 
                    className="flex-1 w-full py-2.5 px-4 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-sm placeholder-slate-400"
                  />

                  {/* Delete Button */}
                  <button 
                    type="button" 
                    onClick={() => removePremioRow(index)}
                    title="Eliminar Premio"
                    className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              {/* Add Fila */}
              <button 
                type="button" 
                onClick={addPremioRow}
                className="w-full py-3 border border-emerald-200 border-dashed rounded-xl text-emerald-600 font-bold text-sm bg-emerald-50/50 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4"/> Agregar nueva fila de premio
              </button>
            </div>
            {errors.premios && <p className="text-red-500 text-xs mt-2 text-center">{errors.premios}</p>}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Link href={route('admin.sorteos')} className="px-6 py-3 rounded-xl font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={processing}
              className="px-8 py-3 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-transform transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
            >
              {processing ? 'Procesando...' : <><Image as={Save} className="w-5 h-5 hidden" /><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Guardar y Procesar Sorteo</>}
            </button>
          </div>

        </form>
      </div>

    </AdminLayout>
  );
}
