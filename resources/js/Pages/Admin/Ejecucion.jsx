import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { PlayCircle, Trophy, Ticket, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Ejecucion({ sorteosData = [] }) {
  const pendingTicketsCount = 0;

  // Estados de Ejecución
  const [execDraw, setExecDraw] = useState('');
  const [execPrize, setExecPrize] = useState('');
  const [execCondition, setExecCondition] = useState('1'); // 1 = gana al primer intento, 3 = gana al 3er intento
  const [execAttempt, setExecAttempt] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSpinNumber, setCurrentSpinNumber] = useState('0000');
  const [drawnTicket, setDrawnTicket] = useState(null);
  const [drawnHistory, setDrawnHistory] = useState([]);

  // Derivar premios y tickets válidos basados en el sorteo seleccionado
  const selectedSorteoData = React.useMemo(() => {
    return sorteosData.find(s => s.nombre === execDraw);
  }, [execDraw, sorteosData]);

  // Estado local para los premios (para ir restando la cantidad conforme salen ganadores durante la sesión en vivo)
  const [availablePrizes, setAvailablePrizes] = useState([]);

  React.useEffect(() => {
    if (selectedSorteoData) {
      // Iniciar con los premios que vienen de BD
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

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Lado Izquierdo: Configuración y Resultados */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          {/* Panel de Configuración */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
            <h3 className="font-black text-lg text-slate-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" /> Parámetros del Sorteo
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">1. Seleccionar Sorteo Activo</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold bg-slate-50"
                  value={execDraw}
                  onChange={(e) => { setExecDraw(e.target.value); setExecPrize(''); setExecAttempt(1); setDrawnHistory([]); }}
                >
                  <option value="">-- Elige un Sorteo --</option>
                  {sorteosData.map(sorteo => (
                    <option key={sorteo.id} value={sorteo.nombre}>{sorteo.nombre}</option>
                  ))}
                </select>
                {execDraw && (
                  <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {validTicketsForDraw.length} tickets habilitados en ánfora.
                  </p>
                )}
              </div>

              {execDraw && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">2. Condición de Victoria</label>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button 
                      onClick={() => setExecCondition('1')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${execCondition === '1' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      A la 1ra (Directo)
                    </button>
                    <button 
                      onClick={() => setExecCondition('3')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${execCondition === '3' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      A la 3ra (Agua)
                    </button>
                  </div>
                </div>
              )}

              {execDraw && (
                <div className="animate-fade-in border-t border-slate-100 pt-5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">3. ¿Qué premio se sorteará?</label>
                  
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {availablePrizes.map(prize => (
                      <button 
                        key={prize.id}
                        onClick={() => prize.qty > 0 ? setExecPrize(prize.name) : null}
                        disabled={prize.qty === 0}
                        className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                          prize.qty === 0 ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed' :
                          execPrize === prize.name ? 'bg-emerald-50 stroke-emerald-500 border-emerald-500 shadow-sm' : 'bg-white border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div>
                          <p className={`font-bold text-sm ${execPrize === prize.name ? 'text-emerald-800' : 'text-slate-700'}`}>{prize.name}</p>
                          <p className="text-xs text-slate-400 font-medium">Quedan disponibles</p>
                        </div>
                        <span className={`text-lg font-black ${execPrize === prize.name ? 'text-emerald-600' : 'text-slate-400'}`}>{prize.qty}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estado Actual del Intento */}
          {execCondition === '3' && execPrize && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm text-center animate-fade-in shrink-0">
               <p className="text-amber-800 font-bold text-sm mb-1">INTENTO ACTUAL (Hacia la 3ra)</p>
               <div className="flex justify-center gap-2 mt-2">
                 {[1,2,3].map(num => (
                   <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-colors ${
                     num < execAttempt ? 'bg-red-500 text-white shadow-inner' : // Al agua
                     num === execAttempt ? 'bg-amber-400 text-slate-900 shadow-md ring-4 ring-amber-200' : // Intentando
                     'bg-white text-amber-300 border-2 border-amber-200' // Pendiente
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

        {/* Lado Derecho: Ruleta de Ejecución y Ganadores */}
        <div className="w-full xl:w-2/3 flex flex-col gap-6">
          {/* CONTENEDOR DE RULETA DIGITAL (Ánfora Mágica) */}
          <div className="bg-gradient-to-br from-[#064E3B] to-[#0f766e] rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] shadow-2xl relative overflow-hidden border border-emerald-800/50">
            {/* Efectos de luz de fondo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.15)_0%,transparent_60%)] pointer-events-none"></div>
            
            {/* Título de la pantalla */}
            <div className="text-center z-10 mb-8 w-full">
              <span className="bg-emerald-900/80 text-emerald-300 text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-emerald-500/30 backdrop-blur-sm shadow-inner inline-block mb-3">
                Sorteo En Vivo
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white px-4 leading-tight">
                {execPrize ? `Sorteando: ${execPrize}` : 'Esperando Configuración...'}
              </h2>
            </div>
            
            {/* PANTALLA DE DÍGITOS TIPO SLOT MACHINE */}
            <div className={`relative z-10 bg-slate-900 p-4 md:p-8 rounded-2xl shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] border-4 border-slate-800 mb-8 transition-all duration-300 min-w-[280px] md:min-w-[400px] flex justify-center ${isSpinning ? 'ring-4 ring-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.2)]' : ''}`}>
              
              {/* Reflejo de pantalla (Estilo vidrio curvo) */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none h-1/2"></div>
              
              <div className="flex gap-2">
                {currentSpinNumber.split('').map((digit, index) => (
                  <div key={index} className="w-16 h-20 md:w-20 md:h-24 bg-gradient-to-b from-white via-slate-100 to-slate-200 rounded-lg flex items-center justify-center shadow-[inset_0_-2px_6px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.5)] border border-slate-300 relative overflow-hidden">
                    <span className={`text-5xl md:text-6xl font-black text-slate-800 font-mono tracking-tighter ${isSpinning ? 'blur-[1px] opacity-80 animate-pulse' : ''}`}>{digit}</span>
                    {/* Línea decorativa del centro del slot */}
                    <div className="absolute top-1/2 w-full h-px bg-slate-300 shadow-[0_1px_0_white]"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTÓN MAESTRO DE INICIO/RESULTADO */}
            <div className="z-10 w-full max-w-sm flex flex-col items-center">
              {!drawnTicket ? (
                <button 
                  onClick={startDigitalDraw}
                  disabled={!execDraw || !execPrize || isSpinning}
                  className={`w-full py-4 rounded-xl font-black text-lg sm:text-xl md:text-2xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-200 shadow-xl ${
                    (!execDraw || !execPrize) ? 'bg-slate-700 text-slate-500 cursor-not-allowed border-b-4 border-slate-800' :
                    isSpinning ? 'bg-amber-500 text-amber-900 border-b-0 translate-y-1' :
                    'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1'
                  }`}
                >
                  {isSpinning ? (
                    <>Mezclando Ánfora... <div className="w-5 h-5 border-4 border-amber-900/30 border-t-amber-900 rounded-full animate-spin"></div></>
                  ) : (
                    <><PlayCircle className="w-6 h-6 md:w-8 md:h-8" /> Generar Ganador</>
                  )}
                </button>
              ) : (
                <div className="w-full bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl text-center animate-fade-in-up">
                  <p className="text-emerald-400 font-bold mb-1 uppercase tracking-widest text-xs">Resultado Extraído</p>
                  <p className="text-2xl font-black text-white mb-4 leading-tight">{drawnTicket.user}</p>
                  
                  {execCondition === '1' || execAttempt === 3 ? (
                    // ES UN GANADOR CONFIRMADO
                    <div className="flex gap-3">
                      <button onClick={() => confirmDrawnTicket(true)} className="flex-1 bg-[#25D366] hover:bg-[#1fa14f] text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                        <Trophy className="w-5 h-5" /> Confirmar Premio
                      </button>
                      <button onClick={() => { setDrawnTicket(null); setCurrentSpinNumber('0000'); }} className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition-colors text-sm">
                        Anular
                      </button>
                    </div>
                  ) : (
                    // ES AL AGUA
                    <button onClick={() => confirmDrawnTicket(false)} className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-500/20">
                      <AlertTriangle className="w-5 h-5" /> Quemar al Agua (Intento {execAttempt})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Historial en Vivo (Log del Sorteo) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col flex-1 min-h-[300px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center rounded-t-2xl">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-600" /> Registro en Vivo
              </h3>
              <span className="text-xs font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded-full uppercase">Sesión Actual</span>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
              {drawnHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-10">
                  <div className="bg-slate-50 p-4 rounded-full border border-slate-100"><Trophy className="w-8 h-8 opacity-50" /></div>
                  <p className="font-bold text-sm text-center">El historial está vacío.<br/>Inicia el sorteo para ver los resultados aquí.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {drawnHistory.map((item, index) => (
                    <div key={index} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in ${
                      item.prize === 'AL AGUA' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-200 shadow-sm'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg py-1 px-2 flex flex-col items-center justify-center border bg-white ${
                          item.prize === 'AL AGUA' ? 'border-red-200 text-red-700' : 'border-green-300 text-green-700 font-extrabold shadow-[0_2px_0_#86efac]'
                        }`}>
                          <span className="text-[10px] uppercase font-bold leading-none mb-0.5">Ticket</span>
                          <span className="text-sm font-black font-mono leading-none">{item.number}</span>
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{item.user}</p>
                          <p className={`text-xs font-bold uppercase ${item.prize === 'AL AGUA' ? 'text-red-600' : 'text-emerald-700'}`}>
                            {item.prize === 'AL AGUA' ? `Al Agua (Intento ${item.attempt})` : `GANADOR: ${item.prize}`}
                          </p>
                        </div>
                      </div>
                      {item.prize !== 'AL AGUA' && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-200 px-2 py-1 rounded w-max self-start sm:self-auto">Verificado</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
