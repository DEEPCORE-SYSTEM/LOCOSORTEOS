import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { 
  User, Calendar, Ticket, CheckCircle, Clock, 
  ArrowRight, Dices, MousePointerClick, Minus, Plus, Upload 
} from 'lucide-react';

export default function Checkout({ currentUser, initialTransactions = [], sorteo }) {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'checkout'
  
  // Estados Checkout
  const ticketInfo = sorteo ? `${sorteo.nombre} - ${sorteo.tipo}` : '';
  const ticketPrice = sorteo?.precio_ticket ? parseFloat(sorteo.precio_ticket) : 40.00;

  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [selectionMethod, setSelectionMethod] = useState('random');
  const [selectedDraw, setSelectedDraw] = useState(ticketInfo);
  const [selectedNumbers, setSelectedNumbers] = useState([]);

  const mockTransactions = initialTransactions.length ? initialTransactions : [
    { id: 'TX-98214', date: '2026-02-15 14:30', amount: 40.00, status: 'Aprobado', draw: 'Sorteo 28 Feb' },
    { id: 'TX-98302', date: '2026-02-16 09:15', amount: 120.00, status: 'Pendiente', draw: 'Sorteo 28 Feb' },
  ];

  const handleBuyClick = () => {
    setCurrentView('checkout');
    setTicketQuantity(1);
    setSelectedNumbers([]);
    setSelectionMethod('random');
  };

  const handleIncreaseQty = () => {
    if (ticketQuantity < 10) setTicketQuantity(prev => prev + 1);
  };

  const handleDecreaseQty = () => {
    if (ticketQuantity > 1) {
      setTicketQuantity(prev => prev - 1);
      // Si reduce la cantidad y tenia numeros elegidos, recortamos la lista
      if (selectedNumbers.length > ticketQuantity - 1) {
        setSelectedNumbers(prev => prev.slice(0, ticketQuantity - 1));
      }
    }
  };

  const toggleNumber = (numStr) => {
    if (selectedNumbers.includes(numStr)) {
      setSelectedNumbers(prev => prev.filter(n => n !== numStr));
    } else {
      if (selectedNumbers.length < ticketQuantity) {
        setSelectedNumbers(prev => [...prev, numStr]);
      } else {
        alert(`Ya has seleccionado tus ${ticketQuantity} números. Aumenta la cantidad si deseas más.`);
      }
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (selectionMethod === 'manual' && selectedNumbers.length !== ticketQuantity) {
      alert(`Por favor, selecciona exactamente ${ticketQuantity} números o cambia a selección al azar.`);
      return;
    }
    console.log('Procesando compra:', {
      draw: selectedDraw,
      qty: ticketQuantity,
      method: selectionMethod,
      numbers: selectionMethod === 'manual' ? selectedNumbers : 'Al azar',
      total: ticketQuantity * ticketPrice
    });
    // Aquí iría el envío al backend (Inertia post a /comprar)
    alert("Simulación: Compra enviada a validación.");
    setCurrentView('dashboard');
  };

  return (
    <AppLayout currentUser={currentUser}>
      <Head title={currentView === 'dashboard' ? 'Mi Panel | Sorteos Finagro' : 'Checkout | Sorteos Finagro'} />
      
      {currentView === 'dashboard' ? (
        <section className="py-8 md:py-12 bg-[#F8FAFC] min-h-[70vh]">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Cabecera del Dashboard */}
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
              <button onClick={handleBuyClick} className="w-full md:w-auto bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-500 shadow-sm transition-colors flex items-center justify-center gap-2 mt-2 md:mt-0">
                <Ticket className="w-5 h-5" /> Comprar más tickets
              </button>
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
                    {mockTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">
                          No tienes transacciones registradas aún.
                        </td>
                      </tr>
                    ) : (
                      mockTransactions.map((tx) => (
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
                    {/* Selección de Sorteo */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Sorteo y Categoría</label>
                      <select 
                        value={selectedDraw}
                        onChange={(e) => setSelectedDraw(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
                      >
                        {sorteo && <option value={ticketInfo}>{ticketInfo}</option>}
                        <option value="VIP">Categoría VIP (Sólo si está habilitada)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Cantidad */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Cantidad de Tickets</label>
                        <div className="flex items-center justify-between gap-4 bg-white border-2 border-slate-200 rounded-xl p-1.5 w-full">
                          <button type="button" onClick={handleDecreaseQty} className="w-12 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold transition-colors"><Minus className="w-5 h-5" /></button>
                          <span className="text-center font-black text-xl">{ticketQuantity}</span>
                          <button type="button" onClick={handleIncreaseQty} className="w-12 h-10 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 rounded-lg text-emerald-700 font-bold transition-colors"><Plus className="w-5 h-5" /></button>
                        </div>
                      </div>

                      {/* Método de Selección */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Método de selección</label>
                        <div className="flex bg-slate-200 p-1.5 rounded-xl h-[56px]">
                          <button type="button" onClick={() => setSelectionMethod('random')} className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2 px-2 md:px-3 rounded-lg font-bold text-xs md:text-sm transition-all ${selectionMethod === 'random' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Dices className="w-4 h-4" /> Al azar
                          </button>
                          <button type="button" onClick={() => setSelectionMethod('manual')} className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2 px-2 md:px-3 rounded-lg font-bold text-xs md:text-sm transition-all ${selectionMethod === 'manual' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <MousePointerClick className="w-4 h-4" /> Elegir
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Grilla de números si es manual */}
                    {selectionMethod === 'manual' && (
                      <div className="mt-4 border-t border-slate-200 pt-5">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-3 gap-2 md:gap-0">
                          <p className="text-sm font-bold text-slate-700">Elige tus números (Muestra interactiva):</p>
                          <span className="text-xs font-bold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                            {selectedNumbers.length} de {ticketQuantity} elegidos
                          </span>
                        </div>
                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                          {Array.from({length: 30}).map((_, i) => {
                            const num = String(i + 1).padStart(3, '0');
                            const isSelected = selectedNumbers.includes(num);
                            return (
                              <button 
                                type="button"
                                key={num} 
                                onClick={() => toggleNumber(num)} 
                                className={`py-2 rounded-lg font-bold text-xs md:text-sm border-2 transition-all ${isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'}`}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                        {selectedNumbers.length > 0 && (
                          <div className="mt-4 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                             <p className="text-xs text-emerald-800 font-medium leading-relaxed">Números seleccionados: <br/><strong className="text-emerald-900 text-sm">{selectedNumbers.join(', ')}</strong></p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Resumen Total */}
                  <div className="mt-4 bg-[#FFF4F4] border-2 border-[#FFE0E0] p-4 md:p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
                    <span className="font-bold text-red-700 text-center md:text-left">Total a Pagar ({ticketQuantity} ticket{ticketQuantity > 1 ? 's' : ''}):</span>
                    <span className="text-3xl font-black text-red-700">S/ {(ticketQuantity * ticketPrice).toFixed(2)}</span>
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
                        {currentUser?.name || 'JUAN CARLOS PEREZ GOMEZ'}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white rounded-xl p-3 border border-emerald-50">
                        <div className="text-sm">
                           <span className="block text-[10px] uppercase text-slate-400 font-bold">Documento</span>
                           <span className="font-bold text-slate-700">{currentUser?.dni || '72345678'}</span>
                        </div>
                        <div className="text-sm border-t md:border-t-0 md:border-l border-emerald-50 pt-2 md:pt-0 pl-0 md:pl-3">
                           <span className="block text-[10px] uppercase text-slate-400 font-bold">Celular</span>
                           <span className="font-bold text-slate-700">{currentUser?.phone || '987 654 321'}</span>
                        </div>
                        <div className="text-sm border-t md:border-t-0 md:border-l border-emerald-50 pt-2 md:pt-0 pl-0 md:pl-3">
                           <span className="block text-[10px] uppercase text-slate-400 font-bold">Ubicación</span>
                           <span className="font-bold text-slate-700">{currentUser?.dept || 'LIMA'}</span>
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
                    <div className="border-2 border-[#742284] rounded-2xl p-5 text-center bg-white relative overflow-hidden group hover:bg-[#742284]/5 transition-colors">
                      <div className="absolute top-0 right-0 bg-[#742284] text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm">YAPE</div>
                      <p className="text-slate-500 text-xs font-bold mb-1 mt-2 uppercase tracking-wide">Número oficial</p>
                      <p className="text-3xl font-black text-[#742284] tracking-tight">987 654 321</p>
                    </div>
                    <div className="border-2 border-[#00E0C6] rounded-2xl p-5 text-center bg-white relative overflow-hidden group hover:bg-[#00E0C6]/5 transition-colors">
                      <div className="absolute top-0 right-0 bg-[#00E0C6] text-[#0A2240] text-[10px] font-black tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm">PLIN</div>
                      <p className="text-slate-500 text-xs font-bold mb-1 mt-2 uppercase tracking-wide">Número oficial</p>
                      <p className="text-3xl font-black text-[#0A2240] tracking-tight">987 654 321</p>
                    </div>
                  </div>
                  <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-xl mt-4 text-center">
                    <p className="text-xs md:text-sm font-medium">
                      ⚠️ Verifica siempre que el titular sea: <strong className="font-black">INVERSIONES FINAGRO E.I.R.L.</strong>
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
                    <div className="bg-white w-16 h-16 rounded-full shadow-md flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-all">
                      <Upload className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="font-black text-emerald-800 mb-1 text-lg">Toca aquí para subir captura</p>
                    <p className="text-xs text-emerald-600 font-medium">Formatos soportados: JPG, PNG o PDF (Máx. 5MB)</p>
                    <input type="file" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#25D366] hover:bg-[#20B858] text-white font-black text-xl py-4 md:py-5 rounded-2xl shadow-[0_6px_0_#1DA851] active:shadow-[0_0px_0_#1DA851] active:translate-y-[6px] transition-all flex items-center justify-center gap-2 group mt-6">
                  <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Confirmar Participación - S/ {(ticketQuantity * ticketPrice).toFixed(2)}
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
