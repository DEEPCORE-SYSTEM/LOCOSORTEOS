import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Save, ArrowLeft, Image as ImageIcon, Calendar, Tag, DollarSign, Target, Plus, Trash2, Upload } from 'lucide-react';
import axios from 'axios';

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
    prefijo_ticket: sorteo?.prefijo_ticket || '',
    digitos_ticket: sorteo?.digitos_ticket || 3,
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

  const [uploadingImg, setUploadingImg] = useState({});

  const uploadFile = async (file, fieldName, extraHandler) => {
    if (!file) return;
    setUploadingImg(prev => ({ ...prev, [fieldName]: true }));
    try {
      const form = new FormData();
      form.append('image', file);
      const { data: res } = await axios.post('/admin/upload-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (extraHandler) extraHandler(res.url);
      else setData(fieldName, res.url);
    } catch (err) {
      alert('Error al subir la imagen. Verifica el formato y tamaño (máx 10MB).');
    } finally {
      setUploadingImg(prev => ({ ...prev, [fieldName]: false }));
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
      <Head title={`${isEditing ? 'Editar' : 'Crear'} Sorteo | Admin Campoagro`} />

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
                  placeholder="Ej: Gran Sorteo Nacional Campoagro 2026" 
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Descripción (Visible para el cliente)</label>
                <textarea 
                  value={data.descripcion || ''}
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
                  value={data.fecha_fin || ''}
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

          {/* SECCIÓN 3: CÓDIGO DEL TICKET */}
          <div>
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <span className="text-emerald-600 bg-emerald-50 rounded-full w-6 h-6 flex items-center justify-center">3</span> Formato del Código de Ticket
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Prefijo (opcional)</label>
                <input
                  type="text"
                  value={data.prefijo_ticket}
                  onChange={e => setData('prefijo_ticket', e.target.value)}
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none font-mono text-sm uppercase"
                  placeholder="Ej: CD-"
                />
                <p className="text-xs text-slate-400 mt-1">Letras, números, guión. Ej: <code className="bg-slate-100 px-1 rounded">CD-</code></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Dígitos del número (1–10)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={data.digitos_ticket}
                  onChange={e => setData('digitos_ticket', Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                />
                <p className="text-xs text-slate-400 mt-1">Cantidad de dígitos con ceros a la izquierda.</p>
              </div>

              {/* Preview en vivo */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Vista previa</p>
                <p className="font-mono font-black text-2xl text-emerald-800 tracking-wider">
                  {(data.prefijo_ticket || '') + String(1).padStart(Math.max(1, parseInt(data.digitos_ticket) || 3), '0')}
                </p>
                <p className="text-xs text-slate-400 mt-1">Primer ticket generado</p>
              </div>

            </div>
            {errors.prefijo_ticket && <p className="text-red-500 text-xs mt-2">{errors.prefijo_ticket}</p>}
            {errors.digitos_ticket && <p className="text-red-500 text-xs mt-2">{errors.digitos_ticket}</p>}
          </div>

          {/* SECCIÓN 4: IMÁGENES Y BANNERS */}
          <div>
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
               <span className="text-emerald-600 bg-emerald-50 rounded-full w-6 h-6 flex items-center justify-center">4</span> Imágenes y Banners
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Imagen Principal (Hero) */}
              <div className="border border-slate-200 hover:border-emerald-500 transition-colors rounded-xl p-5 flex flex-col items-center justify-center text-center bg-slate-50 relative overflow-hidden group min-h-[140px]">
                {data.imagen_hero ? (
                  <>
                    <img src={data.imagen_hero} alt="hero" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="z-10 relative">
                      <p className="text-xs font-bold text-emerald-700 mb-2">✓ Imagen subida</p>
                      <button type="button" onClick={() => setData('imagen_hero', '')} className="text-[10px] text-red-500 hover:text-red-700 font-bold">Eliminar</button>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer z-10 relative flex flex-col items-center w-full">
                    {uploadingImg['imagen_hero'] ? (
                      <p className="text-xs text-slate-500 font-bold animate-pulse">Subiendo...</p>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm font-bold text-slate-700 block mb-1">Imagen Principal (Hero)</span>
                        <span className="text-[10px] text-slate-400 block mb-2">JPG, WEBP, PNG. Ideal 1000x1000px</span>
                        <span className="text-xs text-emerald-600 font-bold underline">Haz clic para subir</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => uploadFile(e.target.files[0], 'imagen_hero')} />
                  </label>
                )}
              </div>

              {/* Banner Promocional */}
              <div className="border border-slate-200 hover:border-emerald-500 transition-colors rounded-xl p-5 flex flex-col items-center justify-center text-center bg-slate-50 relative overflow-hidden group min-h-[140px]">
                {data.banner_promocional ? (
                  <>
                    <img src={data.banner_promocional} alt="banner" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="z-10 relative">
                      <p className="text-xs font-bold text-emerald-700 mb-2">✓ Banner subido</p>
                      <button type="button" onClick={() => setData('banner_promocional', '')} className="text-[10px] text-red-500 hover:text-red-700 font-bold">Eliminar</button>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer z-10 relative flex flex-col items-center w-full">
                    {uploadingImg['banner_promocional'] ? (
                      <p className="text-xs text-slate-500 font-bold animate-pulse">Subiendo...</p>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm font-bold text-slate-700 block mb-1">Banner Promocional</span>
                        <span className="text-[10px] text-slate-400 block mb-2">JPG, WEBP, PNG. Ideal 1920x820px</span>
                        <span className="text-xs text-emerald-600 font-bold underline">Haz clic para subir</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => uploadFile(e.target.files[0], 'banner_promocional')} />
                  </label>
                )}
              </div>

            </div>
          </div>

          {/* SECCIÓN 5: PREMIOS OFRECIDOS */}
          <div>
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <span className="text-emerald-600 bg-emerald-50 rounded-full w-6 h-6 flex items-center justify-center">5</span> Plan de Premios Ofrecidos
            </h4>
            
            <div className="space-y-4">
              {data.premios.map((premio, index) => (
                <div key={premio.id || index} className="flex flex-col md:flex-row gap-3 items-center border border-slate-200 p-3 rounded-xl bg-white shadow-sm">
                  
                  {/* Photo Upload Real */}
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center overflow-hidden shrink-0 relative">
                    {uploadingImg[`premio_${index}`] ? (
                      <span className="text-[8px] text-slate-400 animate-pulse font-bold text-center px-1">Subiendo...</span>
                    ) : premio.imagen ? (
                      <img src={premio.imagen} alt="premio" className="w-full h-full object-cover" />
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                        <Upload className="w-4 h-4 text-slate-400 mb-0.5" />
                        <span className="text-[8px] text-slate-400 font-bold uppercase text-center leading-tight">Subir<br/>Foto</span>
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => uploadFile(e.target.files[0], `premio_${index}`, (url) => updatePremio(index, 'imagen', url))} />
                      </label>
                    )}
                    {premio.imagen && (
                      <button type="button" onClick={() => updatePremio(index, 'imagen', '')} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl text-[9px] px-0.5 leading-tight">✕</button>
                    )}
                  </div>

                  {/* Number / Position */}
                  <div className="w-12 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-600 shrink-0">
                    {index + 1}
                  </div>

                  {/* Name / Category */}
                  <select 
                    value={premio.nombre || 'Vehículo'} 
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
                    value={premio.descripcion || ''} 
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
              {processing ? 'Procesando...' : (
                <>
                  <Save className="w-5 h-5" /> Guardar y Procesar Sorteo
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </AdminLayout>
  );
}
