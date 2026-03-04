import React, { useState, useEffect, useRef } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Link, Head, usePage } from '@inertiajs/react';
import { 
  ShieldCheck, Car, Smartphone, Banknote, Ticket, 
  ChevronRight, ChevronLeft, Trophy, Image as ImageIcon 
} from 'lucide-react';

export default function Welcome({ sorteo, otrosSorteos = [], ganadores = [] }) {
  const [timeLeft, setTimeLeft] = useState({ meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const carouselRef = useRef(null);

  const heroBackgrounds = sorteo?.imagen_hero ? [sorteo.imagen_hero] : [
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1920'
  ];

  useEffect(() => {
    const bgTimer = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 5000);
    return () => clearInterval(bgTimer);
  }, [heroBackgrounds.length]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!sorteo?.fecha_fin) return { meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 };
      
      const targetDate = new Date(sorteo.fecha_fin);
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        return {
          meses: Math.floor(difference / (1000 * 60 * 60 * 24 * 30)),
          dias: Math.floor((difference / (1000 * 60 * 60 * 24)) % 30),
          horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutos: Math.floor((difference / 1000 / 60) % 60),
          segundos: Math.floor((difference / 1000) % 60),
        };
      }
      return { meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 260;
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const prizes = sorteo?.premios?.map(p => ({
    id: p.id, 
    qty: p.cantidad, 
    name: p.nombre, 
    type: p.tipo, 
    image: p.imagen || 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=600'
  })) || [];

  const totalPrizesCount = prizes.reduce((acc, curr) => acc + parseInt(curr.qty || 1), 0);
  
  const vehiculosCount = prizes.filter(p => ['Auto', 'Camioneta', 'Pick-up', 'Motocicleta'].includes(p.type))
                               .reduce((acc, curr) => acc + parseInt(curr.qty || 1), 0);
  
  const efectivoCount = prizes.filter(p => p.type === 'Efectivo')
                              .reduce((acc, curr) => acc + parseInt(curr.qty || 1), 0);
                              
  const tecnologiaCount = prizes.filter(p => ['Tecnología', 'Smartphone'].includes(p.type))
                                .reduce((acc, curr) => acc + parseInt(curr.qty || 1), 0);

  const grandWinners = ganadores;
  const { auth } = usePage().props;

  return (
    <PublicLayout isLoggedIn={!!auth?.user} currentUser={auth?.user}>
      <Head title="Sorteos Campoagro | Gana increíbles premios" />

      {/* HERO SECTION MEJORADO CON CARRUSEL AGRÓNOMO */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden flex items-center bg-emerald-950">
        
        {/* Carrusel de Imágenes de Fondo */}
        {heroBackgrounds.map((bg, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBgIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={bg} alt={`Fondo Campoagro ${idx + 1}`} className="w-full h-full object-cover" />
            {/* Overlay oscuro/verde para que resalte el texto frontal */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#064E3B]/95 via-[#064E3B]/80 to-black/60 backdrop-blur-[1px]"></div>
          </div>
        ))}
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 max-w-6xl mx-auto">
            
            {/* Textos y Títulos (Izquierda en Desktop) adaptados para fondo oscuro */}
            <div className="text-center lg:text-left flex-1">
              {sorteo && (
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full shadow-lg mb-6">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <p className="text-white font-bold uppercase tracking-widest text-xs md:text-sm">
                    {new Date(sorteo.fecha_fin).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
              
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                {!sorteo && (
                  <span className="[text-shadow:_0_4px_8px_rgba(0,0,0,0.5)]">
                    PRÓXIMO <br className="hidden md:block"/>
                  </span>
                )}
                <span className="text-[#ffd60a] uppercase [text-shadow:_0_4px_16px_rgba(0,0,0,0.8)]">
                  {sorteo ? sorteo.nombre : 'EVENTO'}
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-emerald-50 mb-8 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed [text-shadow:_0_2px_4px_rgba(0,0,0,0.5)]">
                {sorteo ? 
                  `¡Participa por ${totalPrizesCount} premios increíbles, incluyendo autos, camionetas, motos y efectivo! Todo 100% seguro respaldado por` 
                  : 'Mantente atento a nuestras redes para la siguiente gran oportunidad de cambiar tu vida respaldada por'
                } <strong className="text-amber-400">AGROINVERSIONES PERUVIAN ECOLOGIC S.A.C</strong>
              </p>
              
              {/* CONTEO REGRESIVO SOLO SI HAY FECHA */}
              {sorteo?.fecha_fin && (
                <div className="mb-10">
                  <p className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-3 [text-shadow:_0_1px_2px_rgba(0,0,0,0.5)]">Tiempo restante para participar:</p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3">
                    {[
                      { label: 'Meses', value: timeLeft.meses },
                      { label: 'Días', value: timeLeft.dias },
                      { label: 'Horas', value: timeLeft.horas },
                      { label: 'Minutos', value: timeLeft.minutos },
                      { label: 'Segundos', value: timeLeft.segundos },
                    ].map((item, index) => (
                      <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 md:p-4 text-center min-w-[65px] md:min-w-[80px] shadow-lg transform transition-transform hover:-translate-y-1">
                        <span className="text-2xl md:text-3xl font-black text-white font-mono [text-shadow:_0_2px_4px_rgba(0,0,0,0.5)]">
                          {String(item.value).padStart(2, '0')}
                        </span>
                        <span className="block text-[10px] md:text-xs uppercase font-bold text-emerald-200 mt-1">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Resumen rápido de premios en hero, solo si hay sorteo activo con premios */}
              {sorteo && totalPrizesCount > 0 && (
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8 lg:mb-0">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 hover:bg-white/20 transition-colors">
                    <Car className="w-6 h-6 text-amber-400" />
                    <div className="text-left">
                      <p className="font-black text-white leading-none">{vehiculosCount > 0 ? vehiculosCount : 0}</p>
                      <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">Vehículos</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 hover:bg-white/20 transition-colors">
                    <Banknote className="w-6 h-6 text-amber-400" />
                    <div className="text-left">
                      <p className="font-black text-white leading-none">{efectivoCount > 0 ? efectivoCount : 0}</p>
                      <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">Premios Efe.</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 hover:bg-white/20 transition-colors">
                    <Smartphone className="w-6 h-6 text-amber-400" />
                    <div className="text-left">
                      <p className="font-black text-white leading-none">{tecnologiaCount > 0 ? tecnologiaCount : 0}</p>
                      <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">Tecnología</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tarjeta de Compra (Solo visible si hay sorteo) */}
            {sorteo && (
              <div className="w-full max-w-md shrink-0 relative mt-12 lg:mt-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-300 rounded-[2.5rem] blur opacity-40"></div>
                
                <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white relative relative z-10 transform transition-transform hover:-translate-y-2 duration-300">
                  
                  <div className="absolute -top-5 right-6 bg-[#FF0000] text-white px-4 py-2 rounded-xl shadow-lg transform rotate-3 font-black text-lg border-2 border-white">
                    ¡SOLO S/ {Math.floor(sorteo.precio_ticket)}!
                  </div>

                  <div className="text-center mb-6 pt-4">
                    <p className="text-emerald-700 font-bold uppercase tracking-wider text-sm mb-2">Compra tu ticket digital</p>
                    <div className="flex items-start justify-center gap-1 text-slate-900">
                      <span className="text-3xl mt-2 font-bold">S/</span>
                      <span className="text-7xl font-black tracking-tighter text-emerald-900">{Math.floor(sorteo.precio_ticket)}</span>
                      <span className="text-3xl mt-2 font-bold">.00</span>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50/50 rounded-2xl p-5 mb-6 border border-emerald-100">
                    <p className="text-xs text-emerald-800 font-bold mb-3 uppercase text-center tracking-wider">Métodos de pago oficiales</p>
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-white p-2 rounded-2xl shadow-inner border border-emerald-100">
                        <img src="/images/qr-yape.png" alt="Yape QR" className="w-48 h-48 object-contain" />
                      </div>
                      <div className="flex justify-center gap-3 w-full">
                        <div className="bg-[#742284] text-white px-6 py-2.5 rounded-xl font-black shadow-sm flex items-center justify-center w-full">
                          YAPE
                        </div>
                       
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-emerald-100 text-center">
                      <p className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider mb-1">A nombre de:</p>
                      <p className="text-sm font-black text-slate-800">AGROINVERSIONES PERUVIAN ECOLOGIC S.A.C</p>
                    </div>
                  </div>
                  
                  <Link href="/login" className="w-full bg-[#25D366] hover:bg-[#20B858] text-white font-black text-xl py-5 rounded-2xl shadow-[0_6px_0_#1DA851] active:shadow-[0_0px_0_#1DA851] active:translate-y-[6px] transition-all flex items-center justify-center gap-2 group">
                    <Ticket className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    ¡Participar Ahora!
                  </Link>
                  
                  <p className="text-center text-xs font-bold text-slate-400 mt-5 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Compra 100% Segura y Verificada
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* SECCIÓN: OTROS SORTEOS ACTIVOS */}
      {otrosSorteos.length > 0 && (
        <section className="py-14 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 uppercase">Más Sorteos Activos</h2>
              <div className="w-16 h-1.5 bg-emerald-500 mx-auto rounded-full mt-4"></div>
              <p className="text-slate-500 mt-4 font-medium">¡Tienes más oportunidades de ganar! Participa en varios sorteos a la vez.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otrosSorteos.map((s) => {
                const totalP = s.premios?.reduce((acc, p) => acc + parseInt(p.cantidad || 1), 0) || 0;
                return (
                  <div key={s.id} className="bg-white rounded-2xl border-2 border-slate-100 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
                    {/* Banner superior */}
                    <div className="relative h-36 bg-gradient-to-br from-emerald-800 to-emerald-600 flex items-center justify-center overflow-hidden">
                      {s.imagen_hero ? (
                        <img src={s.imagen_hero} alt={s.nombre} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-2 right-4 w-24 h-24 rounded-full bg-white/30"></div>
                          <div className="absolute bottom-2 left-4 w-16 h-16 rounded-full bg-white/20"></div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent"></div>
                      <div className="relative z-10 text-center px-4">
                        <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block"></span> En Vivo
                        </span>
                        <p className="text-white font-black text-lg leading-tight line-clamp-2">{s.nombre}</p>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Precio por ticket</p>
                          <p className="text-2xl font-black text-emerald-700">S/ {parseFloat(s.precio_ticket).toFixed(2)}</p>
                        </div>
                        {totalP > 0 && (
                          <div className="text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total premios</p>
                            <p className="text-2xl font-black text-slate-800">{totalP}</p>
                          </div>
                        )}
                      </div>

                      {s.fecha_fin && (
                        <p className="text-xs text-slate-500 font-medium mb-4 flex items-center gap-1.5">
                          <span className="text-amber-500">📅</span>
                          Sorteo: {new Date(s.fecha_fin).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      )}

                      <Link
                        href="/login"
                        className="mt-auto w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm group-hover:shadow-md"
                      >
                        <Ticket className="w-5 h-5" /> Participar en este sorteo
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* LISTA DE PREMIOS (Solo si hay premios en el DB) */}
      {prizes.length > 0 && (
        <section id="premios" className="py-16 bg-[#F8FAFC]">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase">
                Gana Uno de los
                <span className="block text-emerald-600 font-black mt-1">
                  {totalPrizesCount} Premios
                </span>
              </h2>
              <div className="w-16 h-1.5 bg-amber-400 mx-auto rounded-full mt-6"></div>
              <p className="text-slate-500 mt-4 font-medium text-lg">Más de {totalPrizesCount} oportunidades de ganar en nuestro sorteo.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {prizes.map((prize) => (
                <div key={prize.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group hover:-translate-y-1 hover:border-emerald-200 cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img 
                      src={prize.image} 
                      alt={prize.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="absolute top-2 right-2 bg-[#FF0000] text-white font-black text-sm md:text-base px-2.5 py-1 rounded-lg shadow-md border-2 border-white z-10">
                      x{prize.qty}
                    </div>
                  </div>
                  
                  <div className="p-4 text-center">
                    <h3 className="font-black text-slate-800 text-sm md:text-base leading-tight mb-1">
                      {prize.name}
                    </h3>
                    <p className="text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 inline-block px-2 py-1 rounded-md">
                      {prize.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link href="/dashboard" className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-xl transition-colors shadow-sm inline-flex items-center gap-2">
                <Ticket className="w-5 h-5"/> ¡Quiero participar por estos premios!
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* GANADORES ANTERIORES CAROUSEL */}
      {grandWinners.length > 0 && (
        <section id="ganadores" className="py-16 bg-white border-t border-slate-100 overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-900 uppercase flex justify-center items-center gap-3">
                <Trophy className="text-amber-500 w-8 h-8"/> Premios Mayores
              </h2>
              <p className="text-slate-500 mt-2">Los ganadores más afortunados de nuestras últimas ediciones.</p>
            </div>

            <div className="relative group/carousel mb-10">
              <button 
                onClick={() => scrollCarousel('left')} 
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-20 bg-white p-3 rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all hidden md:flex opacity-0 group-hover/carousel:opacity-100 items-center justify-center"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div 
                ref={carouselRef}
                className="flex overflow-x-auto gap-4 md:gap-6 snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {grandWinners.map((winner) => (
                  <div key={winner.id} className="min-w-[160px] md:min-w-[240px] shrink-0 snap-start bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group relative hover:border-emerald-200 transition-colors">
                    <div className="bg-slate-100 aspect-square flex items-center justify-center relative overflow-hidden">
                      <ImageIcon className="w-12 h-12 text-slate-300" />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                      <div className="absolute top-2 right-2 bg-amber-400 text-slate-900 text-xs font-black px-2 py-1 rounded-md shadow-sm">
                        {winner.date}
                      </div>
                    </div>
                    <div className="p-4 text-center">
                      <p className="font-bold text-slate-800 text-sm mb-1">{winner.name}</p>
                      <p className="text-emerald-600 font-black text-sm mb-3">{winner.prize}</p>
                      <button className="text-slate-500 text-xs font-bold uppercase hover:text-emerald-700 transition-colors flex items-center justify-center gap-1 mx-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                        Ver publicación <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => scrollCarousel('right')} 
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-20 bg-white p-3 rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all hidden md:flex opacity-0 group-hover/carousel:opacity-100 items-center justify-center"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center">
              <Link href="/ganadores" className="border-2 border-emerald-600 text-emerald-600 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors inline-flex items-center gap-2">
                Ver lista de todos los ganadores <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

    </PublicLayout>
  );
}
