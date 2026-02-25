import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { PlayCircle, Trophy, Ticket, CheckCircle, AlertTriangle, Settings } from 'lucide-react';

export default function Ejecucion({ sorteosData = [] }) {
  const pendingTicketsCount = 0;

  
  const [execDraw, setExecDraw] = useState('');
  const [execPrize, setExecPrize] = useState('');
  const [execCondition, setExecCondition] = useState('1'); 
  const [execAttempt, setExecAttempt] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSpinNumber, setCurrentSpinNumber] = useState('0000');
  const [drawnTicket, setDrawnTicket] = useState(null);
  const [drawnHistory, setDrawnHistory] = useState([]);

  
  const selectedSorteoData = React.useMemo(() => {
    return sorteosData.find(s => s.nombre === execDraw);
  }, [execDraw, sorteosData]);

  
  const [availablePrizes, setAvailablePrizes] = useState([]);

  React.useEffect(() => {
    if (selectedSorteoData) {
      
      setAvailablePrizes(selectedSorteoData.premios || []);
    } else {
      setAvailablePrizes([]);
    }
  }, [selectedSorteoData]);

  const allGeneratedTickets = selectedSorteoData ? selectedSorteoData.tickets : [];
  const validTicketsForDraw = allGeneratedTickets.filter(t => !drawnHistory.some(h => h.number === t.number));

  const startDigitalDraw = () => {
    if (!execDraw || !execPrize) {
      alert("Selecciona el sorteo y el premio a sortear primero.");
      return;
    }
    if (validTicketsForDraw.length === 0) {
      alert("No hay tickets vendidos válidos disponibles para este sorteo.");
      return;
    }

    setIsSpinning(true);
    setDrawnTicket(null);
    let counter = 0;

    const spinInterval = setInterval(() => {
      const randomDisplay = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
      setCurrentSpinNumber(randomDisplay);
      counter++;

      if (counter > 60) {
        clearInterval(spinInterval);
        const finalTicket = validTicketsForDraw[Math.floor(Math.random() * validTicketsForDraw.length)];
        setCurrentSpinNumber(finalTicket.number);
        setDrawnTicket(finalTicket);
        setIsSpinning(false);
      }
    }, 50);
  };

  const confirmDrawnTicket = (isWinner) => {
    const newEntry = {
      ...drawnTicket,
      prize: isWinner ? execPrize : 'AL AGUA',
      attempt: execAttempt
    };

    setDrawnHistory([newEntry, ...drawnHistory]);

    if (isWinner) {
      setAvailablePrizes(prevPrizes =>
        prevPrizes.map(p =>
          p.name === execPrize ? { ...p, qty: p.qty - 1 } : p
        )
      );
      alert(`¡GANADOR REGISTRADO!\nTicket: ${drawnTicket.number}\nNombre: ${drawnTicket.user}\nPremio: ${execPrize}`);
      setExecAttempt(1);
      setExecPrize('');
    } else {
      setExecAttempt(prev => prev + 1);
    }

    setDrawnTicket(null);
    setCurrentSpinNumber('0000');
  };

  return (
    <AdminLayout currentView="admin-ejecucion" pendingTicketsCount={pendingTicketsCount}>
      <Head title="Panel de Ejecución de Sorteo | Admin Finagro" />

      <div className="flex flex-col gap-6">
        
        {/* Cabecera Horizontal: Configuración de Sorteo y Exportación */}
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Panel Izquierdo: Configurar Sorteo Actual */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col justify-center">
            <h3 className="font-black text-lg text-slate-900 mb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Configurar Sorteo Actual
            </h3>
            <p className="text-slate-500 text-sm mb-6">Selecciona el evento para cargar automáticamente todos los tickets válidos en el sistema.</p>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-2">Campaña / Sorteo *</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold bg-white shadow-sm"
                  value={execDraw}
                  onChange={(e) => { setExecDraw(e.target.value); setExecPrize(''); setExecAttempt(1); setDrawnHistory([]); }}
                >
                  <option value="">-- Elige un Sorteo --</option>
                  {sorteosData.map(sorteo => (
                    <option key={sorteo.id} value={sorteo.nombre}>{sorteo.nombre} (Activo)</option>
                  ))}
                </select>
              </div>
              
              <div className="md:w-64">
                <label className="block text-xs font-bold text-slate-700 mb-2">Tickets Válidos Registrados</label>
                <div className="w-full px-4 py-3 rounded-xl border border-emerald-200 text-emerald-800 bg-emerald-50 font-black flex justify-between items-center shadow-inner">
                  <span>{validTicketsForDraw.length} TICKETS</span>
                  <Ticket className="w-4 h-4 text-emerald-500 opacity-50" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Panel Derecho: Sorteo Físico Exportación */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 xl:w-1/3 flex flex-col justify-center text-white">
            <h3 className="font-black text-lg text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Sorteo Físico (Ánfora)
            </h3>
            <p className="text-slate-400 text-sm mb-6">Exporta todos los tickets vendidos de este sorteo para imprimirlos y realizar el sorteo a mano.</p>
            <button 
              disabled={!execDraw || validTicketsForDraw.length === 0}
              className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-200 shadow-md ${
                (!execDraw || validTicketsForDraw.length === 0) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' :
                'bg-amber-500 hover:bg-amber-400 text-slate-900 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1'
              }`}
            >
              Exportar Base Completa
            </button>
          </div>
          
        </div>

          {/* Estado Actual del Intento */}
          {execCondition === '3' && execPrize && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm text-center animate-fade-in shrink-0">
               <p className="text-amber-800 font-bold text-sm mb-1">INTENTO ACTUAL (Hacia la 3ra)</p>
               <div className="flex justify-center gap-2 mt-2">
                 {[1,2,3].map(num => (
                   <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-colors ${
                     num < execAttempt ? 'bg-red-500 text-white shadow-inner' : 
                     num === execAttempt ? 'bg-amber-400 text-slate-900 shadow-md ring-4 ring-amber-200' : 
                     'bg-white text-amber-300 border-2 border-amber-200' 
                   }`}>
                     {num}
                   </div>
                 ))}
               </div>
               <p className="text-xs text-amber-700 mt-2 font-medium">
                 {execAttempt < 3 ? 'El ticket saldrá AL AGUA (Descalificado)' : '¡EL TICKET QUE SALGA SERÁ EL GANADOR!'}
               </p>
            </div>
          )}
        </div>

        {/* Parte Inferior: Ruleta de Ejecución Integrada y Registro */}
        <div className="bg-[#0A1628] rounded-[2rem] p-8 flex flex-col items-center justify-center min-h-[400px] shadow-2xl relative overflow-hidden transition-all duration-500 overflow-y-auto w-full">
            
            {/* Título de la pantalla */}
            <div className="text-center z-10 mb-8 w-full mt-4">
              <h2 className="text-3xl md:text-5xl font-black text-amber-500 italic uppercase px-4 leading-tight tracking-wider mb-2 drop-shadow-lg">
                Sorteo Digital En Vivo
              </h2>
              <p className="text-slate-400 text-sm">Selecciona el premio y haz girar la ruleta para conocer al ganador.</p>
            </div>
            
            <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch justify-center z-10">
              
              {/* Bloque Izquierdo del Ánfora: Parámetros */}
              <div className="lg:w-1/3 bg-[#111C30]/80 backdrop-blur-md rounded-2xl p-6 border-2 border-slate-800/50 flex flex-col justify-center">
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-3">¿QUÉ ESTAMOS SORTEANDO?</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-bold bg-[#050C17] appearance-none"
                      value={execPrize}
                      onChange={(e) => setExecPrize(e.target.value)}
                      disabled={!execDraw}
                    >
                      <option value="">-- Seleccionar Premio --</option>
                      {availablePrizes.map(prize => (
                        <option key={prize.id} value={prize.name} disabled={prize.qty === 0}>
                          {prize.name} ({prize.qty} Disp.)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-3">CONDICIÓN DEL GANADOR</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-bold bg-[#050C17] appearance-none"
                      value={execCondition}
                      onChange={(e) => setExecCondition(e.target.value)}
                      disabled={!execDraw}
                    >
                      <option value="1">Gana a la primera (1er Intento)</option>
                      <option value="3">A la 3ra (Agua)</option>
                    </select>
                  </div>

                  {/* Estado Actual del Intento dentro de parámetros */}
                  {execCondition === '3' && execPrize && (
                    <div className="bg-[#1A263D] border border-[#2D3A54] p-4 rounded-xl shadow-sm text-center animate-fade-in mt-4">
                      <p className="text-amber-500 font-bold text-xs mb-2">INTENTO ACTUAL (Hacia la 3ra)</p>
                      <div className="flex justify-center gap-2 mt-2">
                        {[1,2,3].map(num => (
                          <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-colors ${
                            num < execAttempt ? 'bg-red-500 text-white shadow-inner' : // Al agua
                            num === execAttempt ? 'bg-amber-400 text-slate-900 shadow-md ring-2 ring-amber-200/50' : // Intentando
                            'bg-[#050C17] text-slate-500 border border-slate-700' // Pendiente
                          }`}>
                            {num}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-3 font-medium">
                        {execAttempt < 3 ? 'El ticket saldrá AL AGUA (Descalificado)' : '¡EL TICKET QUE SALGA SERÁ REGISTRADO!'}
                      </p>
                    </div>
                  )}

                  {!drawnTicket ? (
                    <button 
                      onClick={startDigitalDraw}
                      disabled={!execDraw || !execPrize || isSpinning}
                      className={`w-full py-4 mt-2 rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-xl ${
                        (!execDraw || !execPrize) ? 'bg-[#3A4354] text-slate-400 cursor-not-allowed border-b-4 border-[#2D3545]' :
                        isSpinning ? 'bg-amber-500 text-white border-b-0 translate-y-1' :
                        'bg-[#4B5A73] hover:bg-[#566681] text-white border-b-4 border-[#3A4354] active:border-b-0 active:translate-y-1'
                      }`}
                    >
                      {isSpinning ? (
                        <>Mezclando... <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div></>
                      ) : (
                        <><PlayCircle className="w-6 h-6" /> ¡SACAR GANADOR!</>
                      )}
                    </button>
                  ) : (
                    <div className="w-full bg-[#1A263D] p-5 rounded-xl border border-[#2D3A54] shadow-xl text-center animate-fade-in-up mt-2">
                      <p className="text-amber-400 font-bold mb-1 uppercase tracking-widest text-[10px]">Resultado Extraído</p>
                      <p className="text-xl font-black text-white mb-4 leading-tight">{drawnTicket.user}</p>
                      
                      {execCondition === '1' || execAttempt === 3 ? (
                        <div className="flex flex-col gap-2">
                          <button onClick={() => confirmDrawnTicket(true)} className="w-full bg-[#25D366] hover:bg-[#1fa14f] text-white font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
                            <Trophy className="w-4 h-4" /> Confirmar Premio
                          </button>
                          <button onClick={() => { setDrawnTicket(null); setCurrentSpinNumber('0000'); }} className="w-full py-2 bg-[#2D3A54] hover:bg-[#3A4A6B] text-slate-300 font-bold rounded-lg transition-colors text-xs">
                            Anular Selección
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => confirmDrawnTicket(false)} className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
                          <AlertTriangle className="w-4 h-4" /> Quemar al Agua (Intento {execAttempt})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* CONTENEDOR CENTRAL: PANTALLA DE DÍGITOS TIPO SLOT MACHINE */}
              <div className="text-center w-full z-10 mb-8 flex flex-col items-center">
                <span className="text-amber-500 text-xs font-black tracking-widest uppercase mb-3 block">Ticket Seleccionado</span>
                <div className={`relative bg-[#050C17] p-6 md:p-10 rounded-2xl shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] border-2 border-slate-800 transition-all duration-300 flex justify-center w-full max-w-[500px] ${isSpinning ? 'ring-2 ring-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)]' : ''}`}>
                  
                  <div className="flex gap-4">
                    {currentSpinNumber.split('').map((digit, index) => (
                      <div key={index} className="w-14 h-20 md:w-20 md:h-28 bg-white rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                        <span className={`text-5xl md:text-7xl font-black text-slate-900 font-mono tracking-tighter ${isSpinning ? 'blur-[1px] opacity-80 animate-pulse' : ''}`}>{digit}</span>
                        {/* Línea decorativa del centro del slot */}
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 shadow-[0_1px_0_white]"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div> {/* Fin de lg:flex-row gap-8 (Contenedor Parámetros + Ánfora) */}

            {/* Historial en Vivo (Log del Sorteo) flotante en la parte inferior */}
            <div className="w-full mt-8 pt-8 border-t border-slate-800 flex flex-col items-center">
              <h3 className="font-black text-amber-500/80 uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                 Registro Histórico de la Sesión
              </h3>
              
              <div className="w-full flex-1 max-h-[200px] overflow-y-auto custom-scrollbar flex flex-col items-center">
                {drawnHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600/50 space-y-2 py-4">
                    <p className="font-bold text-xs text-center">Inicia el sorteo para llenar el registro de seleccionados.</p>
                  </div>
                ) : (
                  <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-3">
                    {drawnHistory.map((item, index) => (
                      <div key={index} className={`p-4 rounded-xl border flex items-center justify-between gap-3 animate-fade-in ${
                        item.prize === 'AL AGUA' ? 'bg-red-950/20 border-red-900/30' : 'bg-emerald-950/20 border-emerald-900/30'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg py-1 px-2 flex flex-col items-center justify-center border bg-[#050C17] ${
                            item.prize === 'AL AGUA' ? 'border-red-900/50 text-red-500' : 'border-emerald-900/50 text-emerald-500'
                          }`}>
                            <span className="text-[9px] uppercase font-bold leading-none mb-0.5 opacity-80">Ticket</span>
                            <span className="text-sm font-black font-mono leading-none">{item.number}</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-200 text-sm truncate max-w-[150px]">{item.user}</p>
                            <p className={`text-[10px] font-black uppercase tracking-wider ${item.prize === 'AL AGUA' ? 'text-red-500/80' : 'text-amber-500'}`}>
                              {item.prize === 'AL AGUA' ? `Al Agua (${item.attempt})` : `GANADOR: ${item.prize}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div> {/* Fin Historial Vivo */}

        </div> {/* Fin bg-[#0A1628] Parte Inferior Completa */}

    </AdminLayout>
  );
}
