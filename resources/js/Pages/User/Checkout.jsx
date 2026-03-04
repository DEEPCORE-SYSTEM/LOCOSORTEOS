import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { 
  User, Calendar, Ticket, CheckCircle, Clock, 
  ArrowRight, Dices, MousePointerClick, Minus, Plus, Upload, Loader2 
} from 'lucide-react';

export default function Checkout({ currentUser, initialTransactions = [], sorteo, tickets = [], settings = {} }) {
  const { flash } = usePage().props;
  const [currentView, setCurrentView] = useState('dashboard'); 
  
  const ticketPrice = sorteo?.precio_ticket ? parseFloat(sorteo.precio_ticket) : 0;
  const ticketInfo  = sorteo ? `${sorteo.nombre}${sorteo.tipo ? ' - ' + sorteo.tipo : ''}` : '';

  // Datos de pago desde el backend (nunca hardcodeados)
  const yapeNumero   = settings.yape_numero  || '—';
  const plinNumero   = settings.plin_numero   || '—';
  const razonSocial  = settings.razon_social  || 'INVERSIONES CampoAgro E.I.R.L.';

  const { data, setData, post, processing, errors, reset } = useForm({
    sorteo_id:            sorteo?.id || '',
    cantidad:             1,
    modo_seleccion:       'random',
    numeros_seleccionados: [],
    metodo_pago:          '',
    comprobante:          null,
    total:                ticketPrice,
  });

  const [selectionMethod, setSelectionMethod] = useState('random');
  const [selectedDraw,    setSelectedDraw]    = useState(ticketInfo);
  const [previewUrl,      setPreviewUrl]      = useState(null);

  const transactions = initialTransactions;

  const handleBuyClick = () => {
    setCurrentView('checkout');
    reset();
    setData(prev => ({ ...prev, cantidad: 1, numeros_seleccionados: [], modo_seleccion: 'random', total: ticketPrice }));
    setPreviewUrl(null);
  };

  const handleIncreaseQty = () => {
    if (data.cantidad < 10) {
      const newQty = data.cantidad + 1;
      setData(prev => ({ ...prev, cantidad: newQty, total: newQty * ticketPrice }));
    }
  };

  const handleDecreaseQty = () => {
    if (data.cantidad > 1) {
      const newQty  = data.cantidad - 1;
      const nums    = data.numeros_seleccionados.slice(0, newQty);
      setData(prev => ({ ...prev, cantidad: newQty, numeros_seleccionados: nums, total: newQty * ticketPrice }));
    }
  };

  const toggleNumber = (ticketId) => {
    const current = data.numeros_seleccionados;
    if (current.includes(ticketId)) {
      setData('numeros_seleccionados', current.filter(n => n !== ticketId));
    } else {
      if (current.length < data.cantidad) {
        setData('numeros_seleccionados', [...current, ticketId]);
      } else {
        alert(`Ya seleccionaste ${data.cantidad} número${data.cantidad > 1 ? 's' : ''}. Aumenta la cantidad para elegir más.`);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('comprobante', file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();

    if (data.modo_seleccion === 'manual' && data.numeros_seleccionados.length !== data.cantidad) {
      alert(`Por favor selecciona exactamente ${data.cantidad} número${data.cantidad > 1 ? 's' : ''} o cambia a selección al azar.`);
      return;
    }
    if (!data.metodo_pago) {
      alert('Por favor selecciona un método de pago.');
      return;
    }
    if (!data.comprobante) {
      alert('Por favor sube la captura de tu comprobante de pago.');
      return;
    }

    post('/comprar', {
      onSuccess: () => {
        setCurrentView('dashboard');
        reset();
        setPreviewUrl(null);
      },
    });
  };

  // Tickets disponibles para selección manual (excluye vendidos y reservados)
  const ticketsDisponibles = tickets.filter(t => t.estado === 'disponible');
  const ticketMap = Object.fromEntries(tickets.map(t => [t.id, t]));

  return (
    <AppLayout currentUser={currentUser}>
      <Head title={currentView === 'dashboard' ? 'Mi Panel | Sorteos CampoAgro' : 'Checkout | Sorteos CampoAgro'} />
      
      {currentView === 'dashboard' ? (
        <section className="py-8 md:py-12 bg-[#F8FAFC] min-h-[70vh]">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <User className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Mi Panel de Tickets</h2>
                  <p className="text-slate-500 font-medium text-sm md:text-base">Administra tus compras y boletos aquí.</p>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end w-full md:w-auto mt-2 md:mt-0">
                <button onClick={handleBuyClick} className="w-full md:w-auto bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-500 shadow-sm transition-colors flex items-center justify-center gap-2">
                  <Ticket className="w-5 h-5" /> Comprar más tickets
                </button>
                {flash?.success && (
                  <div className="mt-4 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                    {flash.success}
                  </div>
                )}
                {flash?.error && (
                  <div className="mt-4 text-red-600 font-bold text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                    {flash.error}
                  </div>
                )}
              </div>
            </div>

            {/* Tabla de Transacciones */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" /> Historial de Transacciones
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold border-b border-slate-100">ID Ticket</th>
                      <th className="p-4 font-bold border-b border-slate-100">Fecha de Compra</th>
                      <th className="p-4 font-bold border-b border-slate-100">Sorteo</th>
                      <th className="p-4 font-bold border-b border-slate-100">Monto</th>
                      <th className="p-4 font-bold border-b border-slate-100">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">
                          No tienes transacciones registradas aún.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-black text-slate-700">{tx.id}</td>
                          <td className="p-4 text-slate-600 font-medium">{tx.date}</td>
                          <td className="p-4 text-slate-600 font-medium">{tx.draw}</td>
                          <td className="p-4 font-bold text-slate-900">S/ {tx.amount.toFixed(2)}</td>
                          <td className="p-4">
                            {tx.status === 'Aprobado' ? (
                              <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs">
                                <CheckCircle className="w-4 h-4" /> Aprobado
                              </span>
                            ) : tx.status === 'Rechazado' ? (
                              <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-xs">
                                <Clock className="w-4 h-4" /> Rechazado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold text-xs">
                                <Clock className="w-4 h-4" /> En validación
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-8 md:py-12 bg-[#F8FAFC] min-h-[70vh]">
          <div className="container mx-auto px-4 max-w-3xl">
            <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors">
              <span className="bg-white p-2 rounded-full shadow-sm"><User className="w-4 h-4"/></span> Volver a mi panel
            </button>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 text-center bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Completa tu compra</h2>
                <p className="text-slate-600 font-medium text-sm md:text-base">Sigue los pasos para asegurar tus tickets.</p>
              </div>
              
              <form className="p-6 md:p-8 space-y-8" onSubmit={handleCheckoutSubmit}>
                {/* Paso 1: Configurar Compra */}
                <div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-sm">1</span> 
                    Configura tu participación
                  </h3>
                  <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 space-y-5">
                    {/* Sorteo seleccionado */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Sorteo</label>
                      <div className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-medium text-slate-700">
                        {ticketInfo || 'Sin sorteo activo'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Cantidad */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Cantidad de Tickets</label>
                        <div className="flex items-center justify-between gap-4 bg-white border-2 border-slate-200 rounded-xl p-1.5 w-full">
                          <button type="button" onClick={handleDecreaseQty} className="w-12 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold transition-colors"><Minus className="w-5 h-5" /></button>
                          <span className="text-center font-black text-xl">{data.cantidad}</span>
                          <button type="button" onClick={handleIncreaseQty} className="w-12 h-10 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 rounded-lg text-emerald-700 font-bold transition-colors"><Plus className="w-5 h-5" /></button>
                        </div>
                      </div>

                      {/* Método de Selección */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Método de selección</label>
                        <div className="flex bg-slate-200 p-1.5 rounded-xl h-[56px]">
                          <button type="button" onClick={() => setData('modo_seleccion', 'random')} className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2 px-2 md:px-3 rounded-lg font-bold text-xs md:text-sm transition-all ${data.modo_seleccion === 'random' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Dices className="w-4 h-4" /> Al azar
                          </button>
                          <button type="button" onClick={() => setData('modo_seleccion', 'manual')} className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2 px-2 md:px-3 rounded-lg font-bold text-xs md:text-sm transition-all ${data.modo_seleccion === 'manual' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <MousePointerClick className="w-4 h-4" /> Elegir
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Grilla de tickets reales */}
                    {data.modo_seleccion === 'manual' && (
                      <div className="mt-4 border-t border-slate-200 pt-5">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-3 gap-2 md:gap-0">
                          <p className="text-sm font-bold text-slate-700">
                            Elige tus números ({ticketsDisponibles.length} disponibles):
                          </p>
                          <span className="text-xs font-bold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                            {data.numeros_seleccionados.length} de {data.cantidad} elegidos
                          </span>
                        </div>

                        {tickets.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-6">No hay tickets disponibles en este momento.</p>
                        ) : (
                          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto pr-1">
                            {tickets.map((ticket) => {
                              const isVendido   = ticket.estado !== 'disponible';
                              const isSelected  = data.numeros_seleccionados.includes(ticket.id);
                              return (
                                <button
                                  type="button"
                                  key={ticket.id}
                                  disabled={isVendido}
                                  onClick={() => toggleNumber(ticket.id)}
                                  className={`py-2 rounded-lg font-bold text-xs md:text-sm border-2 transition-all
                                    ${isVendido   ? 'bg-red-100 text-red-400 border-red-100 cursor-not-allowed opacity-60'
                                    : isSelected  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'}`}
                                >
                                  {ticket.numero}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {data.numeros_seleccionados.length > 0 && (
                          <div className="mt-4 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                            <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                              Números seleccionados: <br />
                              <strong className="text-emerald-900 text-sm">
                                {data.numeros_seleccionados
                                  .map(id => ticketMap[id]?.numero ?? id)
                                  .join(', ')}
                              </strong>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Resumen Total */}
                  <div className="mt-4 bg-[#FFF4F4] border-2 border-[#FFE0E0] p-4 md:p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
                    <span className="font-bold text-red-700 text-center md:text-left">Total a Pagar ({data.cantidad} ticket{data.cantidad > 1 ? 's' : ''}):</span>
                    <span className="text-3xl font-black text-red-700">S/ {(data.cantidad * ticketPrice).toFixed(2)}</span>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Paso 2: Datos Personales */}
                <div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-sm">2</span> 
                    Datos del Participante
                  </h3>
                  <div className="bg-emerald-50 p-4 md:p-6 rounded-2xl border border-emerald-100 flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                    <div className="bg-white p-4 rounded-full shadow-sm shrink-0 border border-emerald-50 flex items-center justify-center">
                      <User className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <p className="text-[10px] md:text-xs text-emerald-800 font-black uppercase tracking-wider bg-emerald-100 px-2 py-1 rounded-md">Perfil Verificado</p>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="font-black text-slate-900 text-lg md:text-xl leading-tight mb-3">
                        {currentUser?.name || '—'}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white rounded-xl p-3 border border-emerald-50">
                        <div className="text-sm">
                          <span className="block text-[10px] uppercase text-slate-400 font-bold">Documento</span>
                          <span className="font-bold text-slate-700">{currentUser?.dni || '—'}</span>
                        </div>
                        <div className="text-sm border-t md:border-t-0 md:border-l border-emerald-50 pt-2 md:pt-0 pl-0 md:pl-3">
                          <span className="block text-[10px] uppercase text-slate-400 font-bold">Celular</span>
                          <span className="font-bold text-slate-700">{currentUser?.phone || '—'}</span>
                        </div>
                        <div className="text-sm border-t md:border-t-0 md:border-l border-emerald-50 pt-2 md:pt-0 pl-0 md:pl-3">
                          <span className="block text-[10px] uppercase text-slate-400 font-bold">Ubicación</span>
                          <span className="font-bold text-slate-700">{currentUser?.dept || '—'}</span>
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-emerald-700 mt-3 font-medium flex items-start justify-center md:justify-start gap-1">
                        <span className="mt-0.5">ℹ️</span> Estos datos se utilizarán para contactarte si resultas ganador.
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Paso 3: Pago */}
                <div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-sm">3</span> 
                    Realiza el pago
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* YAPE */}
                    <div onClick={() => setData('metodo_pago', 'yape')} className={`cursor-pointer border-2 ${data.metodo_pago === 'yape' ? 'border-[#742284] bg-[#742284]/10 shadow-md ring-2 ring-[#742284]/50 scale-105' : 'border-slate-200 bg-white hover:border-[#742284]/50'} rounded-2xl p-5 text-center relative overflow-hidden transition-all duration-200`}>
                      <div className={`absolute top-0 right-0 ${data.metodo_pago === 'yape' ? 'bg-[#742284]' : 'bg-slate-300'} text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm transition-colors`}>YAPE</div>
                      <p className="text-slate-500 text-xs font-bold mb-1 mt-2 uppercase tracking-wide">Número oficial</p>
                      <p className={`text-3xl font-black ${data.metodo_pago === 'yape' ? 'text-[#742284]' : 'text-slate-700'} tracking-tight`}>{yapeNumero}</p>
                    </div>
                    {/* PLIN */}
                    <div onClick={() => setData('metodo_pago', 'plin')} className={`cursor-pointer border-2 ${data.metodo_pago === 'plin' ? 'border-[#00E0C6] bg-[#00E0C6]/10 shadow-md ring-2 ring-[#00E0C6]/50 scale-105' : 'border-slate-200 bg-white hover:border-[#00E0C6]/50'} rounded-2xl p-5 text-center relative overflow-hidden transition-all duration-200`}>
                      <div className={`absolute top-0 right-0 ${data.metodo_pago === 'plin' ? 'bg-[#00E0C6]' : 'bg-slate-300'} text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm transition-colors`}>PLIN</div>
                      <p className="text-slate-500 text-xs font-bold mb-1 mt-2 uppercase tracking-wide">Número oficial</p>
                      <p className={`text-3xl font-black ${data.metodo_pago === 'plin' ? 'text-[#0A2240]' : 'text-slate-700'} tracking-tight`}>{plinNumero}</p>
                    </div>
                  </div>
                  <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-xl mt-4 text-center">
                    <p className="text-xs md:text-sm font-medium">
                      ⚠️ Verifica siempre que el titular sea: <strong className="font-black">{razonSocial}</strong>
                    </p>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Paso 4: Comprobante */}
                <div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-sm">4</span> 
                    Sube tu boucher
                  </h3>
                  <div className="relative border-2 border-dashed border-emerald-300 rounded-2xl p-8 md:p-10 text-center bg-emerald-50/50 hover:bg-emerald-50 transition-colors cursor-pointer group">
                    {previewUrl ? (
                      <div className="relative">
                        <img src={previewUrl} alt="Comprobante" className="max-h-64 mx-auto rounded-lg shadow-md object-contain" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                          <span className="text-white font-bold bg-black/50 px-3 py-1.5 rounded-md">Cambiar Imagen</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-white w-16 h-16 rounded-full shadow-md flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-all">
                          <Upload className="w-8 h-8 text-emerald-500" />
                        </div>
                        <p className="font-black text-emerald-800 mb-1 text-lg">Toca aquí para subir captura</p>
                        <p className="text-xs text-emerald-600 font-medium">Formatos soportados: JPG, PNG o PDF (Máx. 5MB)</p>
                      </>
                    )}
                    <input type="file" required onChange={handleFileChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  </div>
                  {errors.comprobante && <p className="text-red-500 text-sm mt-2">{errors.comprobante}</p>}
                </div>

                <button disabled={processing} type="submit" className="w-full bg-[#25D366] hover:bg-[#20B858] disabled:opacity-75 disabled:cursor-not-allowed text-white font-black text-xl py-4 md:py-5 rounded-2xl shadow-[0_6px_0_#1DA851] active:shadow-[0_0px_0_#1DA851] active:translate-y-[6px] transition-all flex items-center justify-center gap-2 group mt-6">
                  {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                  {processing ? 'Enviando comprobante...' : `Confirmar Participación - S/ ${(data.cantidad * ticketPrice).toFixed(2)}`}
                </button>
              </form>
            </div>
            
            <p className="text-center text-xs text-slate-400 mt-6 font-medium">Al hacer clic en confirmar, aceptas nuestros Términos y Condiciones, y Políticas de Privacidad.</p>
          </div>
        </section>
      )}
    </AppLayout>
  );
}
