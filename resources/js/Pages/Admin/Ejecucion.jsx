import React, { useState, useRef, useCallback } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
  PlayCircle, Trophy, Ticket, AlertTriangle, Download,
  Maximize2, Minimize2, CheckCircle2, XCircle, AwardIcon, FlagIcon
} from 'lucide-react';

// Lee CSRF de cookie
function getCsrfToken() {
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

export default function Ejecucion({ sorteosData = [] }) {
  // ── Configuración del sorteo ─────────────────────────────────────────────
  const [execDrawId, setExecDrawId]     = useState('');    // ID del sorteo
  const [execPrize, setExecPrize]       = useState('');    // nombre del premio
  const [execPrizeId, setExecPrizeId]   = useState('');    // ID del premio
  const [execCondition, setExecCondition] = useState('1');
  const [execAttempt, setExecAttempt]   = useState(1);

  // ── Estado de la ruleta ──────────────────────────────────────────────────
  const [isSpinning, setIsSpinning]         = useState(false);
  const [currentSpinNumber, setCurrentSpinNumber] = useState('0000');
  const [drawnTicket, setDrawnTicket]       = useState(null);
  const [drawnHistory, setDrawnHistory]     = useState([]);
  const [savingWinner, setSavingWinner]     = useState(false);
  const [serverValidTicketsCount, setServerValidTicketsCount] = useState(null);

  // ── Pantalla completa ────────────────────────────────────────────────────
  const [fullscreen, setFullscreen]  = useState(false);
  const rouletteRef                  = useRef(null);

  const toggleFullscreen = useCallback(() => {
    if (!fullscreen) {
      rouletteRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(f => !f);
  }, [fullscreen]);

  // ── Datos calculados ─────────────────────────────────────────────────────
  const selectedSorteoData = React.useMemo(
    () => sorteosData.find(s => String(s.id) === String(execDrawId)),
    [execDrawId, sorteosData]
  );

  const [availablePrizes, setAvailablePrizes] = useState([]);

  React.useEffect(() => {
    if (selectedSorteoData) {
      setAvailablePrizes(selectedSorteoData.premios || []);
    } else {
      setAvailablePrizes([]);
    }
  }, [selectedSorteoData]);

  const winnersDrawn = drawnHistory.filter(h => h.prize !== 'AL AGUA').length;
  const totalValidTickets = serverValidTicketsCount ?? selectedSorteoData?.valid_tickets_count ?? 0;
  const sessionRemainingTickets = Math.max(0, totalValidTickets - drawnHistory.length);
  const validTicketsCount = totalValidTickets;

  React.useEffect(() => {
    setDrawnHistory([]);
    setDrawnTicket(null);
    setCurrentSpinNumber('0000');
    setExecAttempt(1);
    setServerValidTicketsCount(null);
  }, [selectedSorteoData?.id]);

  React.useEffect(() => {
    if (!selectedSorteoData?.id) {
      return;
    }

    let cancelled = false;

    axios
      .get(`/admin/api/tickets-status/${selectedSorteoData.id}`)
      .then((res) => {
        if (cancelled) return;

        const statusMap = res?.data || {};
        const total = Object.values(statusMap).filter((estado) =>
          estado === 'vendido' || estado === 'reservado'
        ).length;

        setServerValidTicketsCount(total);
      })
      .catch(() => {
        if (cancelled) return;
        setServerValidTicketsCount(selectedSorteoData.valid_tickets_count ?? 0);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSorteoData?.id, selectedSorteoData?.valid_tickets_count]);

  // ── Girar ruleta ─────────────────────────────────────────────────────────
  const startDigitalDraw = async () => {
    if (!execDrawId || !execPrize) {
      alert('Selecciona el sorteo y el premio primero.');
      return;
    }
    if (sessionRemainingTickets <= 0) {
      alert('No hay tickets válidos disponibles para este sorteo.');
      return;
    }
    setIsSpinning(true);
    setDrawnTicket(null);

    let fetchedWinner = null;
    let fetchError    = false;
    try {
      const res     = await axios.post('/admin/api/draw-ticket', {
        sorteo_id:    selectedSorteoData.id,
        drawn_numbers: drawnHistory.map(h => h.number),
      });
      fetchedWinner = res.data;
    } catch (e) {
      console.error(e);
      fetchError = true;
    }

    let counter = 0;
    const spinInterval = setInterval(() => {
      setCurrentSpinNumber(String(Math.floor(Math.random() * 9999)).padStart(4, '0'));
      counter++;
      if (counter > 60) {
        clearInterval(spinInterval);
        if (fetchError || !fetchedWinner) {
          alert('Error al obtener el ticket ganador del servidor.');
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

  // ── Confirmar / descartar resultado ──────────────────────────────────────
  const confirmDrawnTicket = async (isWinner) => {
    const newEntry = {
      ...drawnTicket,
      prize:   isWinner ? execPrize : 'AL AGUA',
      attempt: execAttempt,
    };
    setDrawnHistory(prev => [newEntry, ...prev]);

    if (isWinner) {
      setSavingWinner(true);
      try {
        // Guardar en la tabla ganadores automáticamente
        await axios.post('/admin/ganadores', {
          sorteo_id:    selectedSorteoData.id,
          premio_id:    execPrizeId,
          ticket_id:    drawnTicket.ticket_id,
          fecha_sorteo: new Date().toISOString().slice(0, 10),
          tipo:         'automatico',
        }, {
          headers: {
            'X-XSRF-TOKEN': getCsrfToken(),
            'X-Inertia': false,
            'Content-Type': 'application/json',
          },
        });
      } catch (e) {
        console.error('Error guardando ganador:', e);
      } finally {
        setSavingWinner(false);
      }

      // Restar disponibilidad del premio en la UI
      setAvailablePrizes(prev =>
        prev.map(p => p.id === Number(execPrizeId) ? { ...p, qty: (p.qty ?? 1) - 1 } : p)
      );
      setExecAttempt(1);
      setExecPrize('');
      setExecPrizeId('');
    } else {
      setExecAttempt(prev => prev + 1);
    }

    setDrawnTicket(null);
    setCurrentSpinNumber('0000');
  };

  // ── Finalizar sorteo ─────────────────────────────────────────────────────
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const handleFinalizeSorteo = async () => {
    if (!selectedSorteoData) return;
    setFinalizing(true);
    try {
      await axios.post(
        `/admin/sorteos/${selectedSorteoData.id}/estado`,
        { estado: 'finalizado' },
        { headers: { 'X-XSRF-TOKEN': getCsrfToken() } }
      );
      setShowFinalizeConfirm(false);
      alert(`✅ El sorteo "${selectedSorteoData.nombre}" ha sido marcado como FINALIZADO.`);
      router.visit('/admin/sorteos');
    } catch (e) {
      alert('Error al finalizar el sorteo. Intenta de nuevo.');
    } finally {
      setFinalizing(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminLayout currentView="admin-ejecucion">
      <Head title="Panel de Ejecución de Sorteo | Admin Campoagro" />

      <div className="flex flex-col gap-6">

        {/* ── Fila superior: config + exportar ── */}
        <div className="flex flex-col xl:flex-row gap-6">

          {/* Configurar Sorteo */}
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
                  value={execDrawId}
                  onChange={(e) => {
                    setExecDrawId(e.target.value);
                    setExecPrize(''); setExecPrizeId('');
                    setExecAttempt(1); setDrawnHistory([]);
                    setDrawnTicket(null); setCurrentSpinNumber('0000');
                  }}
                >
                  <option value="">-- Elige un Sorteo --</option>
                  {sorteosData.map(sorteo => (
                    <option key={sorteo.id} value={sorteo.id}>{sorteo.nombre} (Activo)</option>
                  ))}
                </select>
              </div>
              <div className="md:w-64">
                <label className="block text-xs font-bold text-slate-700 mb-2">Tickets Válidos Disponibles</label>
                <div className="w-full px-4 py-3 rounded-xl border border-emerald-200 text-emerald-800 bg-emerald-50 font-black flex justify-between items-center shadow-inner">
                  <span>{validTicketsCount} TICKETS</span>
                  <Ticket className="w-4 h-4 text-emerald-500 opacity-50" />
                </div>
              </div>
            </div>

            {/* Ganadores registrados en esta sesión */}
            {winnersDrawn > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
                <AwardIcon className="w-4 h-4" />
                {winnersDrawn} ganador{winnersDrawn > 1 ? 'es' : ''} registrado{winnersDrawn > 1 ? 's' : ''} en esta sesión
              </div>
            )}
          </div>

          {/* Panel exportar + botones de acción */}
          <div className="flex flex-col gap-3 xl:w-1/3">
            <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 flex-1 flex flex-col justify-center text-white">
              <h3 className="font-black text-lg text-white mb-2 flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-500" /> Sorteo Físico (Ánfora)
              </h3>
              <p className="text-slate-400 text-sm mb-4">Exporta todos los tickets vendidos en PDF para recortar.</p>
              <button
                disabled={!execDrawId || validTicketsCount === 0}
                onClick={() => {
                  if (selectedSorteoData) window.location.href = `/admin/export/sorteo?sorteo_id=${selectedSorteoData.id}`;
                }}
                className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-200 shadow-md ${
                  (!execDrawId || validTicketsCount === 0)
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                }`}
              >
                Exportar Tickets (PDF)
              </button>
            </div>

            {/* Botón Finalizar Sorteo */}
            <button
              disabled={!selectedSorteoData}
              onClick={() => setShowFinalizeConfirm(true)}
              className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                !selectedSorteoData
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-md'
              }`}
            >
              <FlagIcon className="w-4 h-4" /> Finalizar y Cerrar Sorteo
            </button>
          </div>
        </div>

        {/* ── Ruleta (con botón pantalla completa) ── */}
        <div
          ref={rouletteRef}
          className={`transition-all duration-500 flex flex-col items-center justify-center relative w-full ${
            execDrawId ? 'bg-[#0f1b29]' : 'bg-slate-50'
          } ${
            fullscreen 
              ? 'fixed inset-0 z-50 rounded-none p-4 md:p-10 w-screen h-screen overflow-y-auto' 
              : 'rounded-[2rem] p-8 shadow-sm border min-h-[500px] ' + (execDrawId ? 'border-[#1e2f45]' : 'border-slate-100')
          }`}
        >
          {/* Botón pantalla completa */}
          <button
            onClick={toggleFullscreen}
            title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa (solo ruleta)'}
            className="absolute top-5 right-5 z-20 bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors"
          >
            {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Título */}
          <div className={`text-center z-10 w-full transition-all ${fullscreen ? 'mb-6 md:mb-12 mt-0' : 'mb-10 mt-4'}`}>
            <h2 className={`text-3xl lg:text-5xl font-black italic uppercase px-4 leading-tight tracking-wider mb-2 transition-colors ${
              execDrawId ? 'text-amber-500' : 'text-amber-400'
            }`}>
              SORTEO DIGITAL EN VIVO
            </h2>
            <p className={`text-slate-400 font-medium ${fullscreen ? 'text-base lg:text-lg' : 'text-sm'}`}>
              Selecciona el premio y haz girar la ruleta para conocer al ganador.
            </p>
          </div>

          <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-10 items-stretch justify-center z-10 flex-col-reverse lg:flex-row">

            {/* Bloque Izquierdo: controles */}
            <div className={`lg:w-[45%] flex flex-col justify-center space-y-6 w-full p-8 rounded-3xl transition-colors ${
              execDrawId ? 'bg-[#142336] border border-[#1e324a] shadow-lg' : 'bg-transparent border-transparent px-0 shadow-none'
            }`}>

              {/* Selector de Premio */}
              <div>
                <label className={`block text-[11px] font-black uppercase tracking-widest mb-3 ${execDrawId ? 'text-amber-500' : 'text-slate-500'}`}>
                  ¿QUÉ ESTAMOS SORTEANDO?
                </label>
                <select
                  className={`w-full px-4 py-3.5 rounded-xl font-bold appearance-none shadow-sm cursor-pointer transition-colors ${
                    execDrawId
                      ? 'border border-amber-500/50 text-white focus:border-amber-400 bg-[#1a2c42] hover:border-amber-400'
                      : 'border border-slate-300 text-slate-500 bg-slate-200 pointer-events-none'
                  }`}
                  value={execPrizeId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setExecPrizeId(pid);
                    const p = availablePrizes.find(x => String(x.id) === pid);
                    setExecPrize(p?.name ?? '');
                  }}
                  disabled={!execDrawId}
                >
                  <option value="">-- Seleccionar Premio --</option>
                  {availablePrizes.map(prize => (
                    <option key={prize.id} value={prize.id} disabled={(prize.qty ?? 0) === 0}>
                      {prize.name} ({prize.qty ?? 0} disp.)
                    </option>
                  ))}
                </select>
              </div>

              {/* Condición */}
              <div>
                <label className={`block text-[11px] font-black uppercase tracking-widest mb-3 ${execDrawId ? 'text-amber-500' : 'text-slate-500'}`}>
                  CONDICIÓN DEL GANADOR
                </label>
                <select
                  className={`w-full px-4 py-3.5 rounded-xl font-bold appearance-none shadow-sm cursor-pointer transition-colors ${
                    execDrawId
                      ? 'border border-[#2a3f5a] text-white focus:border-amber-400 bg-[#1a2c42] hover:border-[#3b5578]'
                      : 'border border-slate-300 text-slate-500 bg-slate-200 pointer-events-none'
                  }`}
                  value={execCondition}
                  onChange={(e) => setExecCondition(e.target.value)}
                  disabled={!execDrawId}
                >
                  <option value="1">Gana a la primera (1er intento)</option>
                  <option value="3">Gana a la tercera (3er intento)</option>
                </select>
              </div>

              {/* Botones: sortear / confirmar */}
              {!drawnTicket ? (
                <button
                  onClick={startDigitalDraw}
                  disabled={!execDrawId || !execPrizeId || isSpinning}
                  className={`w-full py-4 mt-2 rounded-xl font-black text-base flex items-center justify-center gap-3 transition-colors shadow-md ${
                    (!execDrawId || !execPrizeId)
                      ? (execDrawId ? 'bg-[#21354d] text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
                      : isSpinning ? 'bg-[#10b981] text-white shadow-inner'
                      : 'bg-[#10b981] hover:bg-[#059669] text-white'
                  }`}
                >
                  {isSpinning
                    ? <><span>Girando...</span><div className="w-6 h-6 border-4 border-white/40 border-t-white rounded-full animate-spin" /></>
                    : <><PlayCircle className="w-7 h-7" /> ¡SACAR GANADOR!</>
                  }
                </button>
              ) : (
                <div className={`w-full p-6 rounded-xl border shadow-md text-center animate-fade-in-up mt-2 ${
                  execDrawId ? 'bg-[#142336] border-[#1e324a]' : 'bg-white border-slate-200'
                }`}>
                  <p className="text-amber-500 font-extrabold mb-1 uppercase tracking-widest text-xs">Resultado Extraído</p>
                  <p className={`text-2xl font-black mb-1 leading-tight ${execDrawId ? 'text-white' : 'text-slate-800'}`}>{drawnTicket.user || 'Participante'}</p>
                  <p className={`text-xs font-mono mb-5 ${execDrawId ? 'text-slate-400' : 'text-slate-500'}`}>Ticket #{drawnTicket.number}</p>

                  {execCondition === '1' || execAttempt === 3 ? (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => confirmDrawnTicket(true)}
                        disabled={savingWinner}
                        className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-60 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
                      >
                        {savingWinner
                          ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Guardando...</>
                          : <><CheckCircle2 className="w-5 h-5" /> Confirmar Ganador</>
                        }
                      </button>
                      <button
                        onClick={() => { setDrawnTicket(null); setCurrentSpinNumber('0000'); }}
                        className={`w-full py-2.5 font-bold rounded-xl transition-colors text-sm ${
                          execDrawId ? 'bg-[#1e324a] hover:bg-[#2a415d] text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        Anular Selección
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => confirmDrawnTicket(false)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
                    >
                      <AlertTriangle className="w-5 h-5" /> Al Agua (Intento {execAttempt} de 3)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bloque Derecho: dígitos */}
            <div className="lg:w-[55%] flex justify-center lg:justify-end w-full">
              <div className={`rounded-[2rem] p-8 md:p-14 w-full md:min-w-[550px] shadow-2xl flex flex-col items-center justify-center min-h-[350px] relative transition-colors ${
                execDrawId ? 'bg-[#0b141e] border border-[#1a2c42]' : 'bg-[#59626f] border border-[#59626f]'
              } ${fullscreen ? 'lg:min-h-[450px]' : ''}`}>
                <span className={`text-sm md:text-base font-black tracking-widest uppercase mb-10 block text-center ${
                  execDrawId ? 'text-amber-500' : 'text-amber-400 drop-shadow-sm'
                }`}>TICKET SELECCIONADO</span>

                <div className="flex gap-4 md:gap-6 justify-center w-full">
                  {currentSpinNumber.split('').map((digit, index) => (
                    <div key={index} className="flex-1 max-w-[90px] lg:max-w-[110px] h-28 md:h-36 lg:h-44 bg-white rounded-[1.25rem] flex items-center justify-center shadow-inner relative overflow-hidden shrink-0">
                      <span className={`text-6xl md:text-[5.5rem] lg:text-[7rem] font-black font-mono tracking-tighter ${
                        isSpinning ? 'blur-[1px] opacity-80 animate-pulse' : ''
                      } ${execDrawId ? 'text-[#0b141e]' : 'text-[#5C6675]'}`}>{digit}</span>
                      <div className={`absolute top-1/2 left-0 w-3 h-4 rounded-r-full -translate-y-1/2 ${execDrawId ? 'bg-[#0b141e]' : 'bg-[#606775]'}`} />
                      <div className={`absolute top-1/2 right-0 w-3 h-4 rounded-l-full -translate-y-1/2 ${execDrawId ? 'bg-[#0b141e]' : 'bg-[#606775]'}`} />
                      <div className="absolute top-1/2 left-4 right-4 h-[2px] border-t-2 border-dashed border-slate-300 opacity-60 -translate-y-1/2" />
                    </div>
                  ))}
                </div>

                {/* Indicador de intentos */}
                {execCondition === '3' && execPrizeId && (
                  <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full shadow-lg text-sm font-bold whitespace-nowrap border flex items-center gap-3 transition-colors ${
                    execDrawId ? 'bg-[#142336] text-slate-300 border-[#1e324a]' : 'bg-white text-slate-700 border-slate-100'
                  }`}>
                    Intento:
                    <span className="flex gap-2">
                      {[1, 2, 3].map(num => (
                        <span key={num} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          num < execAttempt  ? 'bg-red-500 text-white' :
                          num === execAttempt ? (execDrawId ? 'bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-amber-400 text-slate-900 ring-2 ring-amber-200') :
                          (execDrawId ? 'bg-[#0b141e] text-slate-600' : 'bg-slate-200 text-slate-400')
                        }`}>{num}</span>
                      ))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Historial en vivo */}
          {drawnHistory.length > 0 && (
            <div className="w-full mt-16 pt-8 border-t border-[#1e324a] flex flex-col items-center">
              <h3 className="font-bold text-slate-500 tracking-wider text-xs mb-4 uppercase">ÚLTIMOS TICKETS EXTRAÍDOS</h3>
              <div className="flex flex-wrap gap-2 justify-center max-w-4xl">
                {drawnHistory.slice(0, 10).map((item, index) => (
                  <div key={index} className={`px-4 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 ${
                    item.prize === 'AL AGUA'
                      ? 'bg-red-950/30 text-red-500 border-red-900/50'
                      : 'bg-emerald-950/30 text-emerald-500 border-emerald-900/50'
                  }`}>
                    <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded">{item.number}</span>
                    <span>{item.prize === 'AL AGUA' ? '💧 Al Agua' : `🏆 ${item.prize}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ══ Modal Confirmar Finalizar Sorteo ══ */}
      {showFinalizeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <FlagIcon className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="font-black text-slate-800 text-xl mb-2">¿Finalizar el sorteo?</h3>
            <p className="text-slate-500 text-sm mb-2">
              El sorteo <strong>{selectedSorteoData?.nombre}</strong> será marcado como <strong className="text-red-600">FINALIZADO</strong>.
            </p>
            <p className="text-xs text-slate-400 mb-6">
              Los ganadores ya registrados en esta sesión quedan guardados. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinalizeConfirm(false)}
                className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalizeSorteo}
                disabled={finalizing}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                {finalizing
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Finalizando...</>
                  : '✅ Sí, Finalizar Sorteo'
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
