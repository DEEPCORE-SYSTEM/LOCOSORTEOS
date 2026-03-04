import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { PlayCircle, Trophy, Ticket, CheckCircle, AlertTriangle, Settings, Download } from 'lucide-react';

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

  const validTicketsCount = selectedSorteoData ? (selectedSorteoData.valid_tickets_count - drawnHistory.length) : 0;

  const startDigitalDraw = async () => {
    if (!execDraw || !execPrize) {
      alert("Selecciona el sorteo y el premio a sortear primero.");
      return;
    }
    if (validTicketsCount <= 0) {
      alert("No hay tickets vendidos válidos disponibles para este sorteo.");
      return;
    }

    setIsSpinning(true);
    setDrawnTicket(null);
    
    // Obtener ganador del backend silenciosamente mientras la UI gira
    let fetchedWinner = null;
    let fetchError = false;
    try {
      const response = await axios.post('/admin/api/draw-ticket', {
        sorteo_id: selectedSorteoData.id,
        drawn_numbers: drawnHistory.map(h => h.number)
      });
      fetchedWinner = response.data;
    } catch (error) {
      console.error(error);
      fetchError = true;
    }

    let counter = 0;
    const spinInterval = setInterval(() => {
      const randomDisplay = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
      setCurrentSpinNumber(randomDisplay);
      counter++;

      if (counter > 60) {
        clearInterval(spinInterval);
        
        if (fetchError || !fetchedWinner) {
            alert("Error al obtener ticket ganador del servidor.");
            setIsSpinning(false);
            setCurrentSpinNumber('0000');
            return;
        }

        setCurrentSpinNumber(fetchedWinner.number);
        setDrawnTicket(fetchedWinner);
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
      <Head title="Panel de Ejecución de Sorteo | Admin Campoagro" />

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
                  <span>{validTicketsCount} TICKETS</span>
                  <Ticket className="w-4 h-4 text-emerald-500 opacity-50" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Panel Derecho: Sorteo Físico Exportación */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 xl:w-1/3 flex flex-col justify-center text-white">
            <h3 className="font-black text-lg text-white mb-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-500" /> Sorteo Físico (Ánfora)
            </h3>
            <p className="text-slate-400 text-sm mb-6">Exporta todos los tickets vendidos de este sorteo en un documento PDF listo para imprimir y recortar.</p>
            <button 
              disabled={!execDraw || validTicketsCount === 0}
              onClick={() => {
                if (selectedSorteoData) {
                  window.location.href = `/admin/export/sorteo?sorteo_id=${selectedSorteoData.id}`;
                }
              }}
              className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-200 shadow-md ${
                (!execDraw || validTicketsCount === 0) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' :
                'bg-[#f59e0b] hover:bg-amber-400 text-slate-900 border-none hover:shadow-lg'
              }`}
            >
              Exportar Tickets para Recortar (PDF)
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
        {/* Parte Inferior: Sorteo Digital En Vivo (Estilo Prototipo) */}
        {/* Parte Inferior: Sorteo Digital En Vivo (Estilo Prototipo Condicional) */}
        <div className={`transition-all duration-500 rounded-[2rem] p-8 flex flex-col items-center min-h-[500px] shadow-sm relative w-full mt-6 ${
          execDraw ? 'bg-[#0f1b29] border border-[#1e2f45]' : 'bg-slate-50 border border-slate-100'
        }`}>
            
            {/* Título de la pantalla */}
            <div className="text-center z-10 mb-10 w-full mt-4">
              <h2 className={`text-3xl md:text-5xl font-black italic uppercase px-4 leading-tight tracking-wider mb-2 transition-colors ${
                execDraw ? 'text-amber-500' : 'text-amber-400'
              }`}>
                SORTEO DIGITAL EN VIVO
              </h2>
              <p className="text-slate-400 text-sm font-medium">Selecciona el premio y haz girar la ruleta para conocer al ganador.</p>
            </div>
            
            <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10 items-start justify-between z-10">
              
              {/* Bloque Izquierdo: Parámetros del Sorteo */}
              <div className={`lg:w-[45%] flex flex-col justify-start space-y-6 w-full p-8 rounded-3xl transition-colors ${
                execDraw ? 'bg-[#142336] border border-[#1e324a] shadow-lg' : 'bg-transparent border-transparent px-0 shadow-none'
              }`}>
                
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-3 ${
                    execDraw ? 'text-amber-500' : 'text-slate-500'
                  }`}>¿QUÉ ESTAMOS SORTEANDO?</label>
                  <select 
                    className={`w-full px-4 py-3.5 rounded-xl font-bold appearance-none shadow-sm cursor-pointer transition-colors ${
                      execDraw 
                      ? 'border border-amber-500/50 text-white focus:border-amber-400 bg-[#1a2c42] hover:border-amber-400'
                      : 'border border-slate-300 text-slate-500 bg-slate-200 pointer-events-none'
                    }`}
                    value={execPrize}
                    onChange={(e) => setExecPrize(e.target.value)}
                    disabled={!execDraw}
                  >
                    <option value="">-- Seleccionar Premio --</option>
                    {availablePrizes.map(prize => (
                      <option key={prize.id} value={prize.name} disabled={prize.qty === 0}>
                        {prize.name} ({prize.qty} disp.)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-widest mb-3 ${
                    execDraw ? 'text-amber-500' : 'text-slate-500'
                  }`}>CONDICIÓN DEL GANADOR</label>
                  <select 
                    className={`w-full px-4 py-3.5 rounded-xl font-bold appearance-none shadow-sm cursor-pointer transition-colors ${
                      execDraw 
                      ? 'border border-[#2a3f5a] text-white focus:border-amber-400 bg-[#1a2c42] hover:border-[#3b5578]'
                      : 'border border-slate-300 text-slate-500 bg-slate-200 pointer-events-none'
                    }`}
                    value={execCondition}
                    onChange={(e) => setExecCondition(e.target.value)}
                    disabled={!execDraw}
                  >
                    <option value="1">Gana a la primera (1er intento)</option>
                    <option value="3">Gana a la tercera (3er intento)</option>
                  </select>
                </div>

                {!drawnTicket ? (
                  <button 
                    onClick={startDigitalDraw}
                    disabled={!execDraw || !execPrize || isSpinning}
                    className={`w-full py-4 mt-2 rounded-xl font-black text-base flex items-center justify-center gap-3 transition-colors shadow-md ${
                      (!execDraw || !execPrize) ? (execDraw ? 'bg-[#21354d] text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed') :
                      isSpinning ? 'bg-[#10b981] text-white shadow-inner' :
                      'bg-[#10b981] hover:bg-[#059669] text-white'
                    }`}
                  >
                    {isSpinning ? (
                      <>Girando... <div className="w-6 h-6 border-4 border-white/40 border-t-white rounded-full animate-spin"></div></>
                    ) : (
                      <><PlayCircle className="w-7 h-7" /> ¡SACAR GANADOR!</>
                    )}
                  </button>
                ) : (
                  <div className={`w-full p-6 rounded-xl border shadow-md text-center animate-fade-in-up mt-2 ${
                    execDraw ? 'bg-[#142336] border-[#1e324a]' : 'bg-white border-slate-200'
                  }`}>
                    <p className="text-amber-500 font-extrabold mb-1 uppercase tracking-widest text-xs">Resultado Extraído</p>
                    <p className={`text-2xl font-black mb-6 leading-tight ${execDraw ? 'text-white' : 'text-slate-800'}`}>{drawnTicket.user}</p>
                    
                    {execCondition === '1' || execAttempt === 3 ? (
                      <div className="flex flex-col gap-3">
                        <button onClick={() => confirmDrawnTicket(true)} className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm">
                          <Trophy className="w-5 h-5" /> Confirmar Ganador
                        </button>
                        <button onClick={() => { setDrawnTicket(null); setCurrentSpinNumber('0000'); }} className={`w-full py-2.5 font-bold rounded-xl transition-colors text-sm ${
                          execDraw ? 'bg-[#1e324a] hover:bg-[#2a415d] text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}>
                          Anular Selección
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => confirmDrawnTicket(false)} className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm">
                        <AlertTriangle className="w-5 h-5" /> Al Agua (Intento {execAttempt} de 3)
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Bloque Derecho: Cajón de Dígitos (Ticket Seleccionado) */}
              <div className="lg:w-[55%] flex justify-center lg:justify-end w-full h-full">
                <div className={`rounded-[2rem] p-8 md:p-14 w-full md:min-w-[550px] shadow-2xl flex flex-col items-center justify-center min-h-[350px] relative transition-colors ${
                  execDraw ? 'bg-[#0b141e] border border-[#1a2c42]' : 'bg-[#59626f] border border-[#59626f]'
                }`}>
                  <span className={`text-sm font-black tracking-widest uppercase mb-10 block text-center ${
                    execDraw ? 'text-amber-500' : 'text-amber-400 drop-shadow-sm'
                  }`}>TICKET SELECCIONADO</span>
                  
                  <div className="flex gap-4 md:gap-6 justify-center w-full">
                    {currentSpinNumber.split('').map((digit, index) => (
                      <div key={index} className="flex-1 max-w-[90px] h-28 md:h-36 bg-white rounded-[1.25rem] flex items-center justify-center shadow-inner relative overflow-hidden shrink-0">
                        <span className={`text-6xl md:text-[5.5rem] font-black font-mono tracking-tighter ${
                          isSpinning ? 'blur-[1px] opacity-80 animate-pulse' : ''
                        } ${execDraw ? 'text-[#0b141e]' : 'text-[#5C6675]'}`}>{digit}</span>
                        {/* Líneas perforadas centro */}
                        <div className={`absolute top-1/2 left-0 w-3 h-4 rounded-r-full -translate-y-1/2 ${execDraw ? 'bg-[#0b141e]' : 'bg-[#606775]'}`}></div>
                        <div className={`absolute top-1/2 right-0 w-3 h-4 rounded-l-full -translate-y-1/2 ${execDraw ? 'bg-[#0b141e]' : 'bg-[#606775]'}`}></div>
                        <div className={`absolute top-1/2 left-4 right-4 h-[2px] border-t-2 border-dashed border-slate-300 opacity-60 -translate-y-1/2`}></div>
                      </div>
                    ))}
                  </div>

                  {/* Mostramos Intento Actual si está en modo Al Agua */}
                  {execCondition === '3' && execPrize && (
                    <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full shadow-lg text-sm font-bold whitespace-nowrap border flex items-center gap-3 transition-colors ${
                      execDraw ? 'bg-[#142336] text-slate-300 border-[#1e324a]' : 'bg-white text-slate-700 border-slate-100'
                    }`}>
                       Intento: 
                       <span className="flex gap-2">
                         {[1,2,3].map(num => (
                           <span key={num} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                             num < execAttempt ? 'bg-red-500 text-white' : 
                             num === execAttempt ? (execDraw ? 'bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-amber-400 text-slate-900 ring-2 ring-amber-200') : 
                             (execDraw ? 'bg-[#0b141e] text-slate-600' : 'bg-slate-200 text-slate-400')
                           }`}>{num}</span>
                         ))}
                       </span>
                    </div>
                  )}

                </div>
              </div>

            </div> {/* Fin layout columnas principales */}

            {/* Historial en Vivo (Opcional, minimalista debajo) */}
            {drawnHistory.length > 0 && (
              <div className="w-full mt-16 pt-8 border-t border-[#1e324a] flex flex-col items-center">
                <h3 className="font-bold text-slate-500 tracking-wider text-xs mb-4 uppercase">
                  ÚLTIMOS TICKETS EXTRAÍDOS
                </h3>
                <div className="flex flex-wrap gap-2 justify-center max-w-4xl">
                  {drawnHistory.slice(0, 5).map((item, index) => (
                    <div key={index} className={`px-4 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 ${
                      item.prize === 'AL AGUA' ? 'bg-red-950/30 text-red-500 border-red-900/50' : 'bg-emerald-950/30 text-emerald-500 border-emerald-900/50'
                    }`}>
                      <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded">{item.number}</span>
                      <span>{item.prize === 'AL AGUA' ? 'Al Agua' : 'Ganador'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

        </div> {/* Fin bg-[#0A1628] Parte Inferior Completa */}

    </AdminLayout>
  );
}
