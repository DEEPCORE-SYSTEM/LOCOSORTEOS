import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Plus, Search, Upload, ChevronRight, Ticket, X, Dices, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Talonario({ 
  sorteos, 
  offlineSorteoId, 
  setOfflineSorteoId,
  offlinePage,
  setOfflinePage,
  maxTickets,
  totalPages,
  startTicket,
  endTicket,
  currentTicketsData,
  countVendidos,
  countImpresos,
  countReservados,
  countLibres,
  fetchTicketsPage,
  activeSorteo,
  setExportModalOpen,
  isLoadingTickets,
}) {
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [selectedOfflineTicket, setSelectedOfflineTicket] = useState('');
  const [offlineProcessing, setOfflineProcessing] = useState(false);
  const [isConsultandoDni, setIsConsultandoDni] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    sorteo_id: offlineSorteoId || '',
    modo_seleccion: 'manual',
    numeros_text: '',
    cantidad: 1,
    nombre: '',
    dni: '',
    telefono: '',
    departamento: '',
    provincia_distrito: '',
    direccion: '',
    medio_pago_fisico: 'Cobro en Efectivo (Caja Oficina)',
    quien_realizo: '',
    total: 0
  });

  
  useEffect(() => {
    let cant = 1;
    if (data.modo_seleccion === 'manual' && data.numeros_text) {
        cant = data.numeros_text.split(',').filter(n => n.trim() !== '').length;
    } else if (data.modo_seleccion === 'random') {
        cant = parseInt(data.cantidad) || 1;
    }
    const precio = activeSorteo?.precio_ticket || 0;
    setData('total', cant * precio);
  }, [data.numeros_text, data.cantidad, data.modo_seleccion, activeSorteo]);


  const consultarDni = async (dni = data.dni) => {
    if (!dni || dni.length !== 8) return;
    setIsConsultandoDni(true);
    try {
        const response = await axios.post('/api/consultar-dni', { dni });
        if (response.data.success && response.data.data) {
            setData(d => ({ ...d, nombre: response.data.data.nombre_completo }));
        }
    } catch (error) {
        console.error('Error al consultar DNI:', error);
    } finally {
        setIsConsultandoDni(false);
    }
  };

  const submitOffline = (e) => {
    e.preventDefault();
    setOfflineProcessing(true);
    post('/admin/tickets/offline', {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setShowOfflineModal(false);
        reset();
        fetchTicketsPage(offlinePage);
        alert('✅ Venta manual registrada exitosamente. Los tickets ya están marcados como vendidos.');
      },
      onError: (errs) => {
          if (errs.error) {
              alert('Error: ' + errs.error);
          }
      },
      onFinish: () => setOfflineProcessing(false)
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-3">
                Pool de Números:
                <select 
                  value={offlineSorteoId || ''} 
                  onChange={(e) => { setOfflineSorteoId(Number(e.target.value)); setOfflinePage(1); }}
                  className="text-sm border-slate-200 rounded-lg py-1 pl-3 pr-8 focus:ring-emerald-500 focus:border-emerald-500 font-bold bg-slate-50 cursor-pointer"
                >
                  {sorteos.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </h3>
              <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm font-bold">
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-100">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 block shadow-sm"></span>
                  <span className="text-base md:text-lg">{countVendidos}</span> Vendidos
                </div>
                <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-lg border border-purple-100" title="Impresos y entregados a vendedores de campo">
                  <span className="w-3 h-3 rounded-full bg-purple-500 block shadow-sm"></span>
                  <span className="text-base md:text-lg">{countImpresos}</span> En Calle
                </div>
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg border border-amber-100" title="Pendientes de validación online">
                  <span className="w-3 h-3 rounded-full bg-amber-400 block shadow-sm"></span>
                  <span className="text-base md:text-lg">{countReservados}</span> Reservas Web
                </div>
                <div className="flex items-center gap-2 bg-slate-50 text-slate-600 px-3 py-2 rounded-lg border border-slate-200">
                  <span className="w-3 h-3 rounded-full bg-white block border-2 border-slate-300 shadow-sm"></span>
                  <span className="text-base md:text-lg">{countLibres}</span> Libres
                </div>
              </div>
            </div>
            <button onClick={() => { setSelectedOfflineTicket(''); setShowOfflineModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md transform hover:-translate-y-0.5 hidden md:flex shrink-0">
              <Plus className="w-5 h-5" /> Venta Directa
            </button>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar número específico..." className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <button onClick={() => { setSelectedOfflineTicket(''); setShowOfflineModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold p-3 rounded-xl shadow-md md:hidden">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-sm border border-slate-700 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-slate-700 p-2 rounded-lg"><Upload className="w-5 h-5 text-emerald-400" /></div>
              <h3 className="font-black text-lg">Exportar (Imprenta)</h3>
            </div>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Bloquea un lote de números libres pasándolos a estado <span className="text-purple-300 font-bold">"En Calle"</span> para imprimirlos y dárselos a tus vendedores.
            </p>
          </div>

          <button onClick={() => setExportModalOpen(true)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm px-4 py-3 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2 relative z-10">
            Configurar Exportación <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-slate-500 font-medium">Haz clic en un número <span className="font-bold text-slate-700">Libre (Blanco)</span> para venta en oficina, o en uno <span className="font-bold text-purple-700">Impreso (Morado)</span> para registrar la venta de calle.</p>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Rango visible: {String(startTicket).padStart(4, '0')} - {String(endTicket).padStart(4, '0')}</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-2 relative min-h-[100px]">
          {isLoadingTickets && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-lg">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                <span className="text-sm font-bold text-slate-500">Cargando tickets...</span>
             </div>
          )}
          {maxTickets > 0 && Array.from({ length: endTicket - startTicket + 1 }).map((_, i) => {
            const ticketIndex = startTicket + i;
            const num = String(ticketIndex).padStart(4, '0');
            const status = currentTicketsData[num] || 'libre';

            let bgClass = "bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700 hover:shadow-sm";
            if (status === 'vendido') bgClass = "bg-emerald-500 text-white border-emerald-600 shadow-sm opacity-90 cursor-not-allowed";
            if (status === 'reservado') bgClass = "bg-amber-400 text-amber-900 border-amber-500 shadow-sm opacity-90 cursor-not-allowed";
            if (status === 'impreso') bgClass = "bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-500 hover:text-white transition-colors cursor-pointer shadow-sm";

            return (
              <button
                type="button"
                key={num}
                onClick={() => {
                  if (status === 'libre' || status === 'impreso') {
                    setSelectedOfflineTicket(num);
                    setData(d => ({
                        ...d,
                        sorteo_id: activeSorteo.id,
                        modo_seleccion: 'manual',
                        numeros_text: d.numeros_text ? d.numeros_text + `, ${num}` : num,
                        cantidad: 1,
                        total: activeSorteo.precio_ticket || 0
                    }));
                    setShowOfflineModal(true);
                  } else if (status === 'vendido') {
                    alert(`Ticket ${num} ya ha sido VENDIDO. No puedes modificarlo desde aquí.`);
                  } else {
                    alert(`Ticket ${num} está RESERVADO (esperando validación de pago web).`);
                  }
                }}
                className={`py-2.5 rounded-lg font-mono font-bold text-sm border-2 transition-all ${bgClass}`}
                title={status === 'libre' ? 'Venta en Oficina' : status === 'impreso' ? 'Registrar retorno de Vendedor' : status === 'vendido' ? 'Ticket Vendido' : 'Reserva Web'}
              >
                {num}
              </button>
            );
          })}
        </div>

        {maxTickets > 0 && totalPages > 1 && (
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <div className="inline-flex gap-1 items-center">
              <button 
                onClick={() => setOfflinePage(p => Math.max(1, p - 1))}
                disabled={offlinePage === 1}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-l-lg hover:bg-slate-50 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                Anterior
              </button>
              
              <span className="px-4 py-2 border-y border-slate-200 text-slate-700 font-bold bg-slate-50 text-sm">
                Página {offlinePage} de {totalPages}
              </span>
              
              <button 
                onClick={() => setOfflinePage(p => Math.min(totalPages, p + 1))}
                disabled={offlinePage === totalPages}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-r-lg disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {showOfflineModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col my-8">
            <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center text-slate-900 rounded-t-2xl relative">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100"><Ticket className="w-6 h-6 text-emerald-600" /></div>
                <div>
                  <h3 className="font-black text-xl text-slate-800">Registro de Venta Manual</h3>
                  <p className="text-sm text-slate-500 font-bold">Venta en Oficina o Retorno de Vendedor</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowOfflineModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors absolute top-6 right-6"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-8">
              <form id="offlineSaleForm" className="space-y-8" onSubmit={submitOffline}>
                
                {/* 1. Tickets a Registrar */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">1</span> Tickets a Registrar
                  </h4>
                  
                  <div className="mb-4">
                      <select value={data.sorteo_id} onChange={e => setData('sorteo_id', e.target.value)} className="w-full md:w-1/2 px-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm bg-white font-bold text-slate-600" required>
                          <option value="">-- Seleccionar Sorteo --</option>
                          {sorteos.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                      </select>
                      {errors.sorteo_id && <p className="text-red-500 text-xs mt-1">{errors.sorteo_id}</p>}
                  </div>

                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Número(s) de Ticket *</label>
                      {data.modo_seleccion === 'manual' ? (
                          <input
                            type="text"
                            required
                            placeholder="Ej: 0045, 0046, 0047"
                            value={data.numeros_text}
                            onChange={e => setData('numeros_text', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-emerald-500 focus:border-emerald-600 focus:outline-none font-mono text-slate-800 text-sm ring-4 ring-emerald-50"
                          />
                      ) : (
                          <input
                            type="number"
                            min="1"
                            required
                            placeholder="Cantidad aleatoria (ej: 5)"
                            value={data.cantidad}
                            onChange={e => setData('cantidad', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none font-mono text-slate-800 text-sm"
                          />
                      )}
                      
                    </div>
                    <button
                      type="button"
                      onClick={() => setData('modo_seleccion', data.modo_seleccion === 'manual' ? 'random' : 'manual')}
                      className={`px-5 py-3 rounded-xl flex items-center gap-2 font-bold text-sm transition-colors border ${data.modo_seleccion === 'random' ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                    >
                      <Dices className="w-5 h-5" /> {data.modo_seleccion === 'manual' ? 'Al azar' : 'Manual'}
                    </button>
                  </div>
                  {data.modo_seleccion === 'manual' ? (
                     <p className="text-xs text-slate-500 mt-2 font-medium">Ingresa los números separados por comas si es un lote.</p>
                  ) : (
                     <p className="text-xs text-slate-500 mt-2 font-medium">El sistema asignará aleatoriamente esta cantidad de números libres.</p>
                  )}
                  {errors.numeros_manuales && <p className="text-red-500 text-xs mt-1">{errors.numeros_manuales}</p>}
                </div>

                {/* 2. Datos del Comprador */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">2</span> Datos del Comprador
                  </h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between">
                         <span>DNI *</span>
                         {isConsultandoDni && <span className="text-[10px] text-emerald-600 animate-pulse">Buscando...</span>}
                      </label>
                      <input 
                        type="text" 
                        required 
                        maxLength="8" 
                        value={data.dni} 
                        onChange={e => {
                            const newDni = e.target.value;
                            setData('dni', newDni);
                            if(newDni.length === 8) {
                                consultarDni(newDni);
                            }
                        }}
                        onBlur={() => consultarDni()}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" 
                      />
                      {errors.dni && <span className="text-xs text-red-500 block mt-1">{errors.dni}</span>}
                    </div>
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nombres y Apellidos *</label>
                      <input type="text" required value={data.nombre} onChange={e => setData('nombre', e.target.value)} placeholder="Ej. Juan Pérez" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                      {errors.nombre && <span className="text-xs text-red-500 block mt-1">{errors.nombre}</span>}
                    </div>
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Celular *</label>
                      <input type="text" required value={data.telefono} onChange={e => setData('telefono', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                       {errors.telefono && <span className="text-xs text-red-500 block mt-1">{errors.telefono}</span>}
                    </div>
                    
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Departamento</label>
                      <select value={data.departamento} onChange={e => setData('departamento', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm bg-white text-slate-600">
                        <option value="">Seleccionar...</option>
                        <option value="Amazonas">Amazonas</option>
                        <option value="Ancash">Ancash</option>
                        <option value="Arequipa">Arequipa</option>
                        <option value="Cusco">Cusco</option>
                        <option value="Lima">Lima</option>
                        {/* More options... */}
                      </select>
                    </div>
                    <div className="lg:col-span-2">
                       <label className="block text-sm font-bold text-slate-700 mb-2">Provincia / Distrito</label>
                       <input type="text" value={data.provincia_distrito} onChange={e => setData('provincia_distrito', e.target.value)} placeholder="Ej: Chanchamayo / La Merced" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                    </div>
                    
                    <div className="md:col-span-2 lg:col-span-3">
                       <label className="block text-sm font-bold text-slate-700 mb-2">Dirección Exacta</label>
                       <input type="text" value={data.direccion} onChange={e => setData('direccion', e.target.value)} placeholder="Ej: Av. Principal 123" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                    </div>
                  </div>
                </div>

                {/* 3. Detalles Internos de Venta */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">3</span> Detalles Internos de Venta
                  </h4>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Medio de Pago Físico *</label>
                      <select required value={data.medio_pago_fisico} onChange={e => setData('medio_pago_fisico', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm bg-white text-slate-700">
                        <option value="Cobro en Efectivo (Caja Oficina)">Cobro en Efectivo (Caja Oficina)</option>
                        <option value="Efectivo (Entregado por Vendedor)">Efectivo (Entregado por Vendedor)</option>
                        <option value="Yape (Hacia el vendedor)">Yape (Hacia el vendedor)</option>
                        <option value="Plin (Hacia el vendedor)">Plin (Hacia el vendedor)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">¿Quién realizó esta venta? *</label>
                      <input type="text" required value={data.quien_realizo} onChange={e => setData('quien_realizo', e.target.value)} placeholder="Ej: Oficina Central, o Juan (Vendedor)" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                      {errors.quien_realizo && <span className="text-xs text-red-500 block mt-1">{errors.quien_realizo}</span>}
                    </div>
                  </div>
                </div>
                
                <div className="hidden">
                   <input type="hidden" name="total" value={data.total} />
                </div>

              </form>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-center md:justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setShowOfflineModal(false)} className="px-6 py-3 font-bold text-slate-600 bg-transparent hover:text-slate-900 rounded-xl transition-colors">Cancelar</button>
              <button form="offlineSaleForm" disabled={offlineProcessing} type="submit" className="px-8 py-3 font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-transform transform shadow-md flex items-center gap-2 disabled:opacity-50 text-sm">
                {offlineProcessing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><CheckCircle className="w-5 h-5" /> Finalizar Registro</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
