import React, { useState, useRef, useEffect } from 'react';
import { Ticket, AlertTriangle, ShieldCheck, Car, Smartphone, Banknote, Menu, X, ChevronRight, ChevronLeft, Trophy, Megaphone, Users, Facebook, MessageCircle, Image as ImageIcon, LogOut, User, Calendar, CheckCircle, Clock, Upload, ArrowLeft, Minus, Plus, Dices, MousePointerClick, Send, BellRing, LayoutDashboard, Check, XCircle, Edit, Trash2, Eye, Search, FileText, Settings, LineChart, Sprout, PlayCircle, Download, QrCode, Scissors, Loader2 } from 'lucide-react';

export default function App() {
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [intendedView, setIntendedView] = useState('dashboard');

  
  const [loginUser, setLoginUser] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  
  const [regDni, setRegDni] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [isConsultingDni, setIsConsultingDni] = useState(false);

  
  const [currentUser, setCurrentUser] = useState(null);

  
  const handleConsultarDni = () => {
    if (regDni.length !== 8) {
      alert('Por favor ingresa un DNI válido de 8 dígitos.');
      return;
    }
    setIsConsultingDni(true);
    setRegName('');

    
    setTimeout(() => {
      setIsConsultingDni(false);
      
      const nombresSimulados = ['JUAN CARLOS PEREZ GOMEZ', 'MARIA FERNANDA SILVA RIOS', 'LUIS ALBERTO TAPIA CONDORI', 'ANA LUCIA MENDOZA VARGAS', 'CARLOS ENRIQUE FLORES CHUQUIMIA'];
      const nombreAleatorio = nombresSimulados[Math.floor(Math.random() * nombresSimulados.length)];
      setRegName(nombreAleatorio);
    }, 1500);
  };

  
  const [timeLeft, setTimeLeft] = useState({ meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  
  const heroBackgrounds = [
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1920', 
    'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=1920', 
    'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5980?auto=format&fit=crop&q=80&w=1920'  
  ];

  
  useEffect(() => {
    const bgTimer = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 5000); 
    return () => clearInterval(bgTimer);
  }, [heroBackgrounds.length]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      
      const targetDate = new Date('2026-02-28T20:00:00');
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      let newTimeLeft = { meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 };

      if (difference > 0) {
        newTimeLeft = {
          meses: Math.floor(difference / (1000 * 60 * 60 * 24 * 30)),
          dias: Math.floor((difference / (1000 * 60 * 60 * 24)) % 30),
          horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutos: Math.floor((difference / 1000 / 60) % 60),
          segundos: Math.floor((difference / 1000) % 60),
        };
      }
      return newTimeLeft;
    };

    
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [selectionMethod, setSelectionMethod] = useState('random');
  const [selectedDraw, setSelectedDraw] = useState('Sorteo 28 de Febrero - General');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const carouselRef = useRef(null);

  
  const [winnersTab, setWinnersTab] = useState('14feb');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterLocation, setFilterLocation] = useState('Todos los departamentos');

  
  const prizes = [
    { id: 1, qty: '1', name: 'FORD - TERRITORY', type: 'Camioneta', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=600' },
    { id: 2, qty: '1', name: 'Toyota Avanza', type: 'Camioneta', image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=600' },
    { id: 3, qty: '8', name: 'Toyota Yaris', type: 'Auto', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=600' },
    { id: 4, qty: '1', name: 'Toyota Rush', type: 'Camioneta', image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600' },
    { id: 5, qty: '1', name: 'Corolla Cross', type: 'Camioneta', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600' },
    { id: 6, qty: '1', name: 'Toyota Rav 4', type: 'Camioneta', image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=600' },
    { id: 7, qty: '1', name: 'Toyota Hilux', type: 'Pick-up', image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=600' },
    { id: 8, qty: '15', name: 'Motos NS200', type: 'Motocicleta', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600' },
    { id: 9, qty: '170', name: 'Fajos S/ 1,200', type: 'Efectivo', image: 'https://images.unsplash.com/photo-1610337673044-720471f83677?auto=format&fit=crop&q=80&w=600' },
    { id: 10, qty: '15', name: 'iPhone 17 Pro Max', type: 'Tecnología', image: 'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?auto=format&fit=crop&q=80&w=600' },
  ];

  const grandWinners = [
    { id: 1, name: 'Alan Panibra Condo', prize: 'Toyota Yaris', ticket: 'TK-1542', date: '14 Feb 2026' },
    { id: 2, name: 'Alexander Mosqueira Julca', prize: 'Toyota Hilux SRV', ticket: 'TK-8921', date: '14 Feb 2026' },
    { id: 3, name: 'Gustavo Berrio Gutierrez', prize: 'Fortuner Adventure', ticket: 'TK-3341', date: '31 Ene 2026' },
    { id: 4, name: 'César Smith Peralta Rojas', prize: 'Toyota Hilux SRV', ticket: 'TK-9920', date: '31 Ene 2026' },
    { id: 5, name: 'Isaac Bruno Moscol Bereche', prize: 'Toyota Yaris', ticket: 'TK-1123', date: '31 Ene 2026' },
  ];

  const allWinners = [
    { id: 1, type: 'EFECTIVO', ticket: '#390299', initial: 'A', name: 'Abel Enrique Tovar Barboza', location: 'Junín', prize: 'S/ 1200' },
    { id: 2, type: 'EFECTIVO', ticket: '#198467', initial: 'A', name: 'Abraham Ramos Escalante', location: 'Cusco', prize: 'S/ 1200' },
    { id: 3, type: 'CARRO', ticket: '#710108', initial: 'A', name: 'Alan Panibra Condo', location: 'Arequipa', prize: 'Yaris' },
    { id: 4, type: 'EFECTIVO', ticket: '#307644', initial: 'A', name: 'Albino Jose Arzapalo Morales', location: 'Junín', prize: 'S/ 1200' },
    { id: 5, type: 'CARRO', ticket: '#667129', initial: 'A', name: 'Alexander Mosqueira Julca', location: 'Lima', prize: 'Hilux SRV' },
    { id: 6, type: 'EFECTIVO', ticket: '#849841', initial: 'A', name: 'Alex Ruben Castillo Zavaleta', location: 'La Libertad', prize: 'S/ 1200' },
    { id: 7, type: 'MOTO', ticket: '#551102', initial: 'B', name: 'Braulio Javier Rondo Villa', location: 'La Libertad', prize: 'Dominar 400' },
    { id: 8, type: 'SMARTPHONE', ticket: '#315201', initial: 'E', name: 'Elmer Martin Torres Ibañez', location: 'La Libertad', prize: 'Iphone 17 Pro Max' },
    { id: 9, type: 'MOTO', ticket: '#663646', initial: 'E', name: 'Evandro Agurto Huancas', location: 'Lambayeque', prize: 'NS400' },
    { id: 10, type: 'SMARTPHONE', ticket: '#408354', initial: 'E', name: 'Evert Apaza Lipa', location: 'Lima', prize: 'Iphone 17 Pro Max' },
    { id: 11, type: 'CARRO', ticket: '#592679', initial: 'G', name: 'Gustavo Berrio Gutierrez', location: 'Cusco', prize: 'Fortuner Adventure' },
    { id: 12, type: 'MOTO', ticket: '#197419', initial: 'J', name: 'Jaime Joel Zela Ccama', location: 'Lima', prize: 'NS400' },
  ];

  const locationsList = ['Todos los departamentos', 'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali', 'Extranjero'];

  const filteredWinners = allWinners.filter(w => {
    const matchCategory = filterCategory === 'Todos' || w.type === filterCategory;
    const matchLocation = filterLocation === 'Todos los departamentos' || w.location === filterLocation;
    return matchCategory && matchLocation;
  });

  const mockTransactions = [
    { id: 'TK-98234', date: '20 Feb 2026', amount: 40, status: 'Aprobado', draw: '28 de Febrero' },
    { id: 'TK-98110', date: '18 Feb 2026', amount: 80, status: 'Aprobado', draw: '28 de Febrero' },
    { id: 'TK-97005', date: '10 Feb 2026', amount: 40, status: 'Pendiente', draw: '28 de Febrero' },
  ];

  const broadcastMessages = [
    { id: 1, date: '21 Feb 2026 - 09:30 AM', title: '🔥 ¡ÚLTIMOS TICKETS!', content: 'Gente, se nos acaban los tickets para el Gran Sorteo del 28 de Febrero. ¡Asegura el tuyo antes de que se agoten!', type: 'alert' },
    { id: 2, date: '19 Feb 2026 - 04:15 PM', title: '🏆 Nueva Camioneta Entregada', content: 'Ayer entregamos la Hilux al ganador #120 en la ciudad de Lima. Pueden ver la transmisión completa en nuestro Facebook oficial. ¡Todo es 100% real y transparente!', type: 'news' },
    { id: 3, date: '15 Feb 2026 - 11:00 AM', title: '🎁 SORTEO RELÁMPAGO', content: 'Hoy sorteamos 5 fajos de S/1,200 EXCLUSIVAMENTE entre todos los que compren 3 tickets o más antes de las 6:00 PM. ¡Participa ya!', type: 'promo' }
  ];

  
  const [adminPendingTickets, setAdminPendingTickets] = useState([
    { id: 'TX-1001', user: 'Carlos Mendoza', dni: '72345678', qty: 2, total: 80, date: '21 Feb 2026 10:30 AM', status: 'pending', method: 'YAPE' },
    { id: 'TX-1002', user: 'Ana Silva', dni: '45678912', qty: 1, total: 40, date: '21 Feb 2026 10:15 AM', status: 'pending', method: 'PLIN' },
    { id: 'TX-1003', user: 'Jorge Tapia', dni: '12345678', qty: 5, total: 200, date: '21 Feb 2026 09:45 AM', status: 'pending', method: 'YAPE' },
    { id: 'TX-1004', user: 'Luis Ramirez', dni: '98765432', qty: 3, total: 120, date: '21 Feb 2026 08:20 AM', status: 'pending', method: 'TRANSFERENCIA' },
  ]);

  
  const [adminUsers, setAdminUsers] = useState([
    { id: 'U-1001', name: 'María Perez', dni: '74125896', phone: '987654321', date: '10 Ene 2026', totalTickets: 15, status: 'activo', draws: ['Gran Sorteo 28 de Febrero', 'Sorteo 31 de Enero'] },
    { id: 'U-1002', name: 'Carlos Mendoza', dni: '72345678', phone: '912345678', date: '12 Ene 2026', totalTickets: 2, status: 'activo', draws: ['Gran Sorteo 28 de Febrero'] },
    { id: 'U-1003', name: 'Luis Ramirez', dni: '98765432', phone: '999888777', date: '15 Feb 2026', totalTickets: 0, status: 'activo', draws: [] },
    { id: 'U-1004', name: 'Ana Silva', dni: '45678912', phone: '955444333', date: '20 Feb 2026', totalTickets: 5, status: 'baneado', draws: ['Sorteo Día de la Madre'] },
    { id: 'U-1005', name: 'Jorge Tapia', dni: '12345678', phone: '911222333', date: '21 Feb 2026', totalTickets: 10, status: 'activo', draws: ['Gran Sorteo 28 de Febrero'] },
  ]);

  
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('todos');
  const [userDrawFilter, setUserDrawFilter] = useState('todos');

  
  const filteredAdminUsers = adminUsers.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || user.dni.includes(userSearchQuery) || user.phone.includes(userSearchQuery);
    const matchStatus = userStatusFilter === 'todos' ? true :
      userStatusFilter === 'activos' ? user.status === 'activo' :
        userStatusFilter === 'baneados' ? user.status === 'baneado' :
          userStatusFilter === 'sin_compras' ? user.totalTickets === 0 : true;
    const matchDraw = userDrawFilter === 'todos' ? true : user.draws.includes(userDrawFilter);
    return matchSearch && matchStatus && matchDraw;
  });

  
  const handleToggleUserStatus = (userId, currentStatus, userName) => {
    const newStatus = currentStatus === 'activo' ? 'baneado' : 'activo';
    const actionText = newStatus === 'baneado' ? `¿Estás seguro que deseas BANEAR a ${userName}? No podrá iniciar sesión ni comprar tickets.` : `¿Deseas REACTIVAR la cuenta de ${userName}?`;

    if (window.confirm(actionText)) {
      setAdminUsers(adminUsers.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    }
  };

  
  const allGeneratedTickets = [
    { number: '0045', txId: 'TX-0990', user: 'María Perez', dni: '74125896', phone: '987654321', draw: 'Gran Sorteo 28 de Febrero', status: 'Vendido', date: '21 Feb 2026 08:00 AM', location: 'Lima' },
    { number: '1023', txId: 'TX-0990', user: 'María Perez', dni: '74125896', phone: '987654321', draw: 'Gran Sorteo 28 de Febrero', status: 'Vendido', date: '21 Feb 2026 08:00 AM', location: 'Lima' },
    { number: '0888', txId: 'TX-0989', user: 'Pedro Gomez', dni: '15975346', phone: '955123456', draw: 'Gran Sorteo 28 de Febrero', status: 'Vendido', date: '20 Feb 2026 05:30 PM', location: 'Junín' },
    { number: '4501', txId: 'TX-0988', user: 'Lucia Fernández', dni: '85236974', phone: '999111222', draw: 'Gran Sorteo 28 de Febrero', status: 'Vendido', date: '20 Feb 2026 02:15 PM', location: 'Cusco' },
    { number: '1005', txId: 'TX-0800', user: 'Carlos Mendoza', dni: '72345678', phone: '912345678', draw: 'Sorteo 31 de Enero', status: 'Histórico', date: '15 Ene 2026 10:00 AM', location: 'Arequipa' },
  ];

  
  const [offlineSaleModal, setOfflineSaleModal] = useState(false);
  const [selectedOfflineTicket, setSelectedOfflineTicket] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false); 

  
  const [execDraw, setExecDraw] = useState('');
  const [execPrize, setExecPrize] = useState('');
  const [execCondition, setExecCondition] = useState('1'); 
  const [execAttempt, setExecAttempt] = useState(1); 

  
  const [availablePrizes, setAvailablePrizes] = useState([
    { id: 'p1', name: 'Camioneta Toyota Hilux 2026', qty: 1 },
    { id: 'p2', name: 'Moto Dominar 400', qty: 3 },
    { id: 'p3', name: 'Fajo S/ 1,200', qty: 5 },
    { id: 'p4', name: 'iPhone 17 Pro Max', qty: 2 }
  ]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSpinNumber, setCurrentSpinNumber] = useState('0000');
  const [drawnTicket, setDrawnTicket] = useState(null); 
  const [drawnHistory, setDrawnHistory] = useState([]); 

  
  const validTicketsForDraw = allGeneratedTickets.filter(t => t.draw === execDraw && t.status === 'Vendido' && !drawnHistory.some(h => h.number === t.number));

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
  

  
  const handleGenerateRandomOffline = () => {
    
    const unavailableTickets = [12, 44, 88, 105, 45, 46, 50, 51, 52, 53, 54, 55, 56, 57, 58];
    const availablePool = [];

    
    for (let i = 0; i < 1000; i++) {
      if (!unavailableTickets.includes(i)) {
        availablePool.push(i);
      }
    }

    if (availablePool.length > 0) {
      const randomInt = availablePool[Math.floor(Math.random() * availablePool.length)];
      setSelectedOfflineTicket(String(randomInt).padStart(4, '0'));
    } else {
      alert("No hay tickets libres disponibles en este sorteo.");
    }
  };

  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [ticketToReject, setTicketToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  
  const [prizeRows, setPrizeRows] = useState([
    { id: 1, qty: 1, type: 'vehiculo', desc: '' }
  ]);

  const handleApproveTicket = (id, qty) => {
    setAdminPendingTickets(adminPendingTickets.filter(t => t.id !== id));
    alert(`✅ Pago ${id} APROBADO.\nSe han generado y asignado automáticamente ${qty} tickets para el usuario.`);
  };

  const openRejectModal = (ticket) => {
    setTicketToReject(ticket);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const confirmRejectTicket = () => {
    if (!rejectReason) {
      alert("Debes seleccionar un motivo de rechazo.");
      return;
    }
    setAdminPendingTickets(adminPendingTickets.filter(t => t.id !== ticketToReject.id));
    setRejectModalOpen(false);
    alert(`❌ Pago ${ticketToReject.id} RECHAZADO.\nMotivo: ${rejectReason}\nNo se han generado tickets y los números reservados han sido liberados.`);
  };

  
  const handleTicketsClick = () => {
    if (isLoggedIn) {
      setCurrentView('dashboard');
    } else {
      setIsLoginMode(true);
      setIntendedView('dashboard');
      setCurrentView('login');
    }
    setMobileMenuOpen(false);
  };

  const handleBuyClick = () => {
    if (isLoggedIn) {
      setCurrentView('checkout');
    } else {
      setIsLoginMode(true);
      setIntendedView('checkout');
      setCurrentView('login');
    }
    setMobileMenuOpen(false);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);

    
    if (!isLoginMode) {
      setCurrentUser({
        name: regName || '',
        dni: regDni || '',
        phone: regPhone || '',
        dept: regDept || ''
      });
    } else {
      
      setCurrentUser({
        name: 'JUAN CARLOS PEREZ GOMEZ',
        dni: loginUser || '72345678',
        phone: '987654321',
        dept: 'Junín'
      });
    }

    setCurrentView(intendedView);
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (selectionMethod === 'manual' && selectedNumbers.length < ticketQuantity) {
      alert(`Por favor selecciona ${ticketQuantity} números en la grilla antes de continuar.`);
      return;
    }
    alert('¡Datos y comprobante enviados con éxito! En breve validaremos tu compra.');
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('home');
    setMobileMenuOpen(false);
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 260;
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleDecreaseQty = () => {
    setTicketQuantity(prev => {
      const newVal = Math.max(1, prev - 1);
      if (selectedNumbers.length > newVal) {
        setSelectedNumbers(selectedNumbers.slice(0, newVal));
      }
      return newVal;
    });
  };

  const handleIncreaseQty = () => {
    setTicketQuantity(prev => prev + 1);
  };

  const toggleNumber = (num) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      if (selectedNumbers.length < ticketQuantity) {
        setSelectedNumbers([...selectedNumbers, num]);
      } else {
        alert(`Ya seleccionaste tus ${ticketQuantity} tickets. Aumenta la cantidad si deseas elegir más números.`);
      }
    }
  };

  
  const handleAddPrizeRow = () => {
    setPrizeRows([...prizeRows, { id: Date.now(), qty: 1, type: 'vehiculo', desc: '' }]);
  };

  const handleRemovePrizeRow = (id) => {
    if (prizeRows.length === 1) {
      alert("El sorteo debe tener al menos un premio.");
      return;
    }
    setPrizeRows(prizeRows.filter(row => row.id !== id));
  };

  
  if (currentView.startsWith('admin-')) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex flex-col md:flex-row font-sans text-slate-900">
        {/* Admin Sidebar - AHORA EN VERDE AGRÓNOMO (Emerald 950) */}
        <aside className="w-full md:w-64 bg-[#064E3B] text-slate-300 flex flex-col shrink-0 md:h-screen md:sticky md:top-0">
          <div className="p-4 md:p-6 border-b border-emerald-800/50 flex justify-between items-center">
            <div>
              <span className="text-xl font-black italic uppercase text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-amber-400" />
                Sorteos <span className="text-amber-400">CampoAgro</span>
              </span>
              <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase mt-1">Panel Administrativo</p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-2 md:gap-0 [&::-webkit-scrollbar]:hidden">
            <button onClick={() => setCurrentView('admin-dashboard')} className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${currentView === 'admin-dashboard' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
              <LayoutDashboard className="w-5 h-5" /> <span className="inline">Resumen</span>
            </button>
            <button onClick={() => setCurrentView('admin-sorteos')} className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${currentView === 'admin-sorteos' || currentView === 'admin-nuevo-sorteo' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
              <Trophy className="w-5 h-5" /> <span className="inline">Gestión Sorteos</span>
            </button>
            <button onClick={() => setCurrentView('admin-ejecucion')} className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors text-amber-400 ${currentView === 'admin-ejecucion' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
              <PlayCircle className="w-5 h-5" /> <span className="inline uppercase">Ejecutar Sorteo</span>
            </button>
            <button onClick={() => setCurrentView('admin-tickets')} className={`flex items-center justify-between shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${currentView === 'admin-tickets' || currentView === 'admin-lista-tickets' || currentView === 'admin-talonario' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
              <div className="flex items-center gap-3"><Ticket className="w-5 h-5" /> <span className="inline">Pagos y Tickets</span></div>
              {adminPendingTickets.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{adminPendingTickets.length}</span>}
            </button>
            <button onClick={() => setCurrentView('admin-users')} className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${currentView === 'admin-users' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
              <Users className="w-5 h-5" /> <span className="inline">Usuarios Registrados</span>
            </button>
            <button onClick={() => setCurrentView('admin-content')} className={`flex items-center gap-3 shrink-0 md:w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${currentView === 'admin-content' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-800 hover:text-white'}`}>
              <Megaphone className="w-5 h-5" /> <span className="inline">Difusión y Contenido</span>
            </button>
          </nav>
          <div className="p-4 border-t border-emerald-800/50 hidden md:block">
            <button onClick={() => setCurrentView('home')} className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-emerald-800 hover:text-white transition-colors text-emerald-400">
              <ArrowLeft className="w-5 h-5" /> <span>Volver a la Web</span>
            </button>
          </div>
        </aside>

        {/* Admin Main Content */}
        <main className="flex-1 w-full max-w-full overflow-y-auto p-4 md:p-8">
          {/* Header Superior del Main */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-900">
              {currentView === 'admin-dashboard' && 'Resumen del Sistema'}
              {currentView === 'admin-sorteos' && 'Administrar Sorteos'}
              {currentView === 'admin-nuevo-sorteo' && 'Crear Sorteo'}
              {currentView === 'admin-ejecucion' && 'Panel de Ejecución de Sorteo'}
              {currentView === 'admin-tickets' && 'Validación de Pagos (Bouchers)'}
              {currentView === 'admin-lista-tickets' && 'Base de Datos de Tickets'}
              {currentView === 'admin-talonario' && 'Talonario y Ventas Offline'}
              {currentView === 'admin-users' && 'Gestión de Usuarios'}
              {currentView === 'admin-content' && 'Contenido y Mensajes'}
            </h2>
            <div className="flex items-center gap-4">
              <button className="bg-white p-2 rounded-full shadow-sm text-slate-500 hover:text-emerald-600 relative">
                <BellRing className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 cursor-pointer">
                <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center text-emerald-700 font-bold">A</div>
                <span className="font-bold text-sm hidden md:block">Admin CampoAgro</span>
              </div>
              <button onClick={() => setCurrentView('home')} className="md:hidden p-2 text-slate-500 hover:text-red-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          {currentView === 'admin-dashboard' && (
            <div className="space-y-6">
              {/* Estadísticas Principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Recaudación Total</p>
                    <div className="bg-green-100 p-1.5 rounded-lg"><Banknote className="w-4 h-4 text-green-600" /></div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900">S/ 45,200</p>
                    <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1"><LineChart className="w-3 h-3" /> +12.5% esta semana</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tickets Vendidos</p>
                    <div className="bg-emerald-100 p-1.5 rounded-lg"><Ticket className="w-4 h-4 text-emerald-600" /></div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900">1,130</p>
                    <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1"><LineChart className="w-3 h-3" /> +84 hoy</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pagos Pendientes</p>
                    <div className="bg-red-100 p-1.5 rounded-lg"><Clock className="w-4 h-4 text-red-600" /></div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900">{adminPendingTickets.length}</p>
                    <p className="text-xs text-slate-400 font-bold mt-1">Requieren validación</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Sorteos Activos</p>
                    <div className="bg-amber-100 p-1.5 rounded-lg"><Trophy className="w-4 h-4 text-amber-600" /></div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900">2</p>
                    <p className="text-xs text-slate-400 font-bold mt-1">En curso</p>
                  </div>
                </div>
              </div>

              {/* Gráficos y Progreso */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico de Ventas (2 columnas) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="font-black text-lg text-slate-900">Ventas de la Semana</h3>
                      <p className="text-sm text-slate-500">Tickets vendidos en los últimos 7 días</p>
                    </div>
                    <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 rounded-lg px-3 py-1.5 focus:outline-none">
                      <option>Esta semana</option>
                      <option>Mes pasado</option>
                    </select>
                  </div>

                  {/* Simulación de Gráfico de Barras con CSS */}
                  <div className="flex-1 flex items-end gap-2 sm:gap-4 mt-auto h-48 border-b border-slate-100 pb-2 relative">
                    {/* Líneas de guía horizontales */}
                    <div className="absolute w-full border-t border-slate-100 border-dashed bottom-1/2"></div>
                    <div className="absolute w-full border-t border-slate-100 border-dashed top-0"></div>

                    {[45, 60, 30, 85, 55, 100, 75].map((val, i) => {
                      const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 relative z-10 h-full justify-end">
                          <div className="w-full max-w-[40px] bg-emerald-100 rounded-t-md relative group cursor-pointer transition-all duration-500" style={{ height: `${val}%` }}>
                            <div className="absolute inset-0 bg-emerald-500 rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                              {val * 2} Tickets
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-400">{days[i]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rendimiento por Sorteo (1 columna) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                  <h3 className="font-black text-lg text-slate-900 mb-4">Rendimiento por Sorteo</h3>

                  <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Sorteo 1 */}
                    <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 rounded-full blur-2xl opacity-10 -translate-y-1/2 translate-x-1/3"></div>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-black text-slate-900 leading-tight">Gran Sorteo 28 Feb</p>
                          <p className="text-[11px] font-bold text-slate-500 mt-0.5">Precio: S/ 40.00 c/u</p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Activo</span>
                      </div>

                      <div className="flex justify-between items-end mb-1 mt-4">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Avance Tickets</p>
                        <span className="text-emerald-600 font-black text-sm">16.8%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mb-4 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '16.8%' }}></div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tickets</p>
                          <p className="font-black text-slate-800 text-sm">842 / 5,000</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Recaudado</p>
                          <p className="font-black text-green-600 text-sm">S/ 33,680</p>
                        </div>
                      </div>
                    </div>

                    {/* Sorteo 2 */}
                    <div className="border border-slate-200 p-4 rounded-xl bg-white opacity-80 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-black text-slate-900 leading-tight">Día de la Madre</p>
                          <p className="text-[11px] font-bold text-slate-500 mt-0.5">Preventa: S/ 25.00 c/u</p>
                        </div>
                        <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Borrador</span>
                      </div>

                      <div className="flex justify-between items-end mb-1 mt-4">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Avance Tickets</p>
                        <span className="text-amber-500 font-black text-sm">0%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mb-4 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: '0%' }}></div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tickets</p>
                          <p className="font-black text-slate-800 text-sm">0 / 2,000</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Recaudado</p>
                          <p className="font-black text-slate-400 text-sm">S/ 0</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 text-center">
                    <button onClick={() => setCurrentView('admin-nuevo-sorteo')} className="text-emerald-600 font-bold text-sm hover:underline flex items-center justify-center gap-1 mx-auto">
                      <Plus className="w-4 h-4" /> Lanzar nueva campaña
                    </button>
                  </div>
                </div>
              </div>

              {/* Sección Inferior: Transacciones y Métricas Adicionales */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Tabla de Actividad Reciente */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-lg text-slate-900">Transacciones Recientes</h3>
                    <button onClick={() => setCurrentView('admin-tickets')} className="text-emerald-600 text-sm font-bold hover:underline flex items-center gap-1">
                      Ver todas <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <tbody className="text-sm divide-y divide-slate-50">
                        {adminPendingTickets.slice(0, 3).map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                                  <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{ticket.user}</p>
                                  <p className="text-xs text-slate-500 truncate max-w-[150px] md:max-w-[200px]">Envió comprobante por {ticket.method}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-slate-500 font-medium hidden sm:table-cell">{ticket.date}</td>
                            <td className="p-4 font-black text-slate-900 whitespace-nowrap">+ S/ {ticket.total.toFixed(2)}</td>
                            <td className="p-4 text-right">
                              <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Pendiente</span>
                            </td>
                          </tr>
                        ))}
                        <tr className="hover:bg-slate-50 transition-colors opacity-60">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">María Perez</p>
                                <p className="text-xs text-slate-500 truncate max-w-[150px] md:max-w-[200px]">Pago validado y tickets generados</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-500 font-medium hidden sm:table-cell">Hace 2 horas</td>
                          <td className="p-4 font-black text-slate-900 whitespace-nowrap">+ S/ 120.00</td>
                          <td className="p-4 text-right">
                            <span className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Completado</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Métodos de Pago y Datos Geográficos */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-lg text-slate-900 mb-5">Origen de Pagos</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#742284]/10 text-[#742284] flex items-center justify-center font-black text-xs">Y</div>
                          <span className="font-bold text-slate-700 text-sm">YAPE</span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-sm">S/ 28,024</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">62% del total</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#00E0C6]/10 text-[#0A2240] flex items-center justify-center font-black text-xs">P</div>
                          <span className="font-bold text-slate-700 text-sm">PLIN</span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-sm">S/ 14,012</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">31% del total</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center"><Banknote className="w-4 h-4" /></div>
                          <span className="font-bold text-slate-700 text-sm">Transf.</span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-sm">S/ 3,164</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">7% del total</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <h3 className="font-black text-[11px] text-slate-400 uppercase tracking-widest mb-3">Top Departamentos (Ventas)</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-bold text-slate-700">Junín</span>
                          <span className="font-black text-emerald-600">450 tickets</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-emerald-500 h-full rounded-full" style={{ width: '53%' }}></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-bold text-slate-700">Lima</span>
                          <span className="font-black text-emerald-600">280 tickets</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-emerald-400 h-full rounded-full" style={{ width: '33%' }}></div></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================= MÓDULO DE EJECUCIÓN DE SORTEO ======================= */}
          {currentView === 'admin-ejecucion' && (
            <div className="space-y-6">

              {/* Sección Superior: Configuración y Exportación Manual */}
              <div className="grid lg:grid-cols-3 gap-6">

                {/* Configuración del Sorteo */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-slate-50 p-10 rounded-bl-full w-48 h-48 -mr-10 -mt-10 pointer-events-none"></div>
                  <h3 className="font-black text-xl text-slate-900 mb-2 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-500" /> Configurar Sorteo Actual
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 relative z-10">Selecciona el evento para cargar automáticamente todos los tickets válidos en el sistema.</p>

                  <div className="grid md:grid-cols-2 gap-4 relative z-10">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Campaña / Sorteo *</label>
                      <select
                        value={execDraw || ''}
                        onChange={(e) => setExecDraw(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none font-bold text-slate-700 bg-white shadow-sm"
                      >
                        <option value="">-- Seleccionar Sorteo --</option>
                        <option value="Gran Sorteo 28 de Febrero">Gran Sorteo 28 de Febrero (Activo)</option>
                        {/* Se eliminó la opción de sorteo en Borrador */}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tickets Válidos Registrados</label>
                      <div className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 font-black text-emerald-800 shadow-inner flex justify-between items-center">
                        <span>{execDraw ? validTicketsForDraw.length : 0} TICKETS</span>
                        <Ticket className="w-5 h-5 opacity-50" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sorteo Manual / Ánfora Físico */}
                <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6 flex flex-col justify-between relative overflow-hidden text-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                  <div>
                    <h3 className="font-black text-lg mb-2 flex items-center gap-2 relative z-10">
                      <Download className="w-5 h-5 text-amber-400" /> Sorteo Físico (Ánfora)
                    </h3>
                    <p className="text-sm text-slate-300 relative z-10 mb-4">Exporta todos los tickets vendidos de este sorteo para imprimirlos y realizar el sorteo a mano.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!execDraw) alert("Selecciona un sorteo primero.");
                      else alert(`Generando PDF con los ${validTicketsForDraw.length} tickets vendidos listos para imprimir y cortar...`);
                    }}
                    className={`w-full font-black text-sm px-4 py-3 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 relative z-10 ${execDraw ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`}
                  >
                    Exportar Base Completa
                  </button>
                </div>
              </div>

              {/* PANEL DE RULETA DIGITAL */}
              <div className={`rounded-3xl shadow-lg border p-6 md:p-10 transition-all duration-700 ${execDraw ? 'bg-[#0A2240] border-[#133A6B]' : 'bg-slate-100 border-slate-200 opacity-60 pointer-events-none'}`}>

                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 uppercase italic mb-2 tracking-tight">
                    Sorteo Digital en Vivo
                  </h2>
                  <p className="text-slate-400 font-medium">Selecciona el premio y haz girar la ruleta para conocer al ganador.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-center">

                  {/* Panel de Control (Izquierda) */}
                  <div className="space-y-5 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                    <div>
                      <label className="block text-xs font-bold text-amber-400 mb-2 uppercase tracking-widest">¿Qué estamos sorteando?</label>
                      <select
                        value={execPrize || ''}
                        onChange={(e) => setExecPrize(e.target.value)}
                        disabled={isSpinning}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#133A6B] bg-[#0F2D54] focus:border-amber-400 focus:outline-none text-white font-bold transition-colors"
                      >
                        <option value="">-- Seleccionar Premio --</option>
                        {availablePrizes.filter(p => p.qty > 0).map(prize => (
                          <option key={prize.id} value={prize.name}>
                            {prize.name} ({prize.qty} disp.)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-400 mb-2 uppercase tracking-widest">Condición del Ganador</label>
                      <select
                        value={execCondition || ''}
                        onChange={(e) => { setExecCondition(e.target.value); setExecAttempt(1); }}
                        disabled={isSpinning}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#133A6B] bg-[#0F2D54] focus:border-amber-400 focus:outline-none text-white font-bold transition-colors"
                      >
                        <option value="1">Gana a la primera (1er intento)</option>
                        <option value="3">Gana a la tercera (3er intento)</option>
                      </select>
                    </div>

                    {execCondition === '3' && (
                      <div className="bg-[#051426] border border-[#133A6B] p-4 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Intento Actual</p>
                        <div className="flex justify-center gap-2 mt-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${execAttempt >= 1 ? 'bg-amber-400 text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'bg-slate-700 text-slate-500'}`}>1</div>
                          <div className="w-4 border-t-2 border-slate-700 mt-4"></div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${execAttempt >= 2 ? 'bg-amber-400 text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'bg-slate-700 text-slate-500'}`}>2</div>
                          <div className="w-4 border-t-2 border-slate-700 mt-4"></div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${execAttempt >= 3 ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-slate-700 text-slate-500'}`}>3</div>
                        </div>
                        <p className="text-xs font-bold mt-3 text-emerald-400">
                          {execAttempt < 3 ? `Vas a sacar el ${execAttempt}º número (AL AGUA)` : '¡Este es el intento GANADOR!'}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={startDigitalDraw}
                      disabled={isSpinning || !execPrize}
                      className={`w-full py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-all ${isSpinning || !execPrize ? 'bg-slate-600 text-slate-400 cursor-not-allowed' :
                          (execCondition === '3' && execAttempt < 3) ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_0_#991B1B] active:shadow-none active:translate-y-1' :
                            'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_0_#065F46] active:shadow-none active:translate-y-1'
                        }`}
                    >
                      <PlayCircle className="w-6 h-6" />
                      {isSpinning ? 'GIRANDO...' : (execCondition === '3' && execAttempt < 3) ? 'SACAR AL AGUA' : '¡SACAR GANADOR!'}
                    </button>
                  </div>

                  {/* La Ruleta (Centro) */}
                  <div className="lg:col-span-2 flex flex-col items-center justify-center">

                    <div className="relative w-full max-w-md">
                      {/* Borde brilloso de la ruleta */}
                      <div className={`absolute -inset-2 bg-gradient-to-r ${isSpinning ? 'from-amber-400 via-yellow-200 to-amber-500 animate-spin-slow blur-md' : drawnTicket ? (execCondition === '3' && execAttempt < 3 ? 'from-red-500 to-red-600 blur' : 'from-emerald-400 to-green-500 blur-lg') : 'from-white/10 to-white/5 blur'} rounded-3xl opacity-70`}></div>

                      {/* Pantalla principal de la ruleta */}
                      <div className="bg-[#051426] border-2 border-[#133A6B] rounded-3xl p-8 md:p-12 relative z-10 flex flex-col items-center justify-center text-center shadow-2xl min-h-[250px]">

                        <p className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4">Ticket Seleccionado</p>

                        <div className="text-7xl md:text-8xl font-black font-mono tracking-widest text-white mb-6" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {currentSpinNumber}
                        </div>

                        {drawnTicket && (
                          <div className={`w-full p-4 rounded-xl border animate-fade-in-up ${execCondition === '3' && execAttempt < 3 ? 'bg-red-900/40 border-red-500/50' : 'bg-emerald-900/40 border-emerald-500/50'}`}>
                            <p className="text-slate-300 text-xs font-bold uppercase mb-1">Pertenece a:</p>
                            <p className="text-white font-black text-xl">{drawnTicket.user}</p>
                            <p className="text-slate-400 text-sm">DNI: {drawnTicket.dni} | {drawnTicket.location}</p>

                            <div className="mt-4 flex gap-3">
                              <button onClick={() => confirmDrawnTicket(execCondition === '1' || execAttempt === 3)} className="flex-1 bg-white text-slate-900 font-bold py-2 rounded-lg hover:bg-slate-200 transition-colors">
                                Confirmar {execCondition === '3' && execAttempt < 3 ? 'Al Agua' : 'Ganador'}
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Historial de la Sesión Actual */}
              {drawnHistory.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-500" /> Historial de esta sesión
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-100">
                          <th className="p-4 font-bold">Ticket</th>
                          <th className="p-4 font-bold">Participante</th>
                          <th className="p-4 font-bold">Condición</th>
                          <th className="p-4 font-bold">Resultado / Premio</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {drawnHistory.map((h, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-4 font-mono font-bold text-slate-700">{h.number}</td>
                            <td className="p-4 font-bold text-slate-900">{h.user} <span className="text-xs font-normal text-slate-500 ml-1">({h.dni})</span></td>
                            <td className="p-4 text-slate-500 text-xs font-bold uppercase">Intento {h.attempt}</td>
                            <td className="p-4">
                              {h.prize === 'AL AGUA' ? (
                                <span className="text-red-600 font-black text-xs uppercase bg-red-50 px-2 py-1 rounded">Descalificado (Al agua)</span>
                              ) : (
                                <span className="text-emerald-700 font-black text-sm bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1 w-max">
                                  <Trophy className="w-3 h-3" /> Ganador: {h.prize}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {currentView === 'admin-tickets' && (
            <div className="space-y-6">
              {/* Botonera Superior Tickets */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm">Validar Pagos Pendientes</button>
                <button onClick={() => setCurrentView('admin-lista-tickets')} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors">Historial de Vendidos</button>
                <button onClick={() => setCurrentView('admin-talonario')} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors">Talonario (Ventas Offline)</button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Validación de Pagos Pendientes</h3>
                    <p className="text-sm text-slate-500">Revisa el comprobante y aprueba para generar los tickets automáticamente.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Buscar DNI o Código..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">ID / Fecha</th>
                        <th className="p-4 font-bold">Usuario y DNI</th>
                        <th className="p-4 font-bold">Compra</th>
                        <th className="p-4 font-bold">Método</th>
                        <th className="p-4 font-bold">Boucher</th>
                        <th className="p-4 font-bold text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {adminPendingTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <p className="font-black text-slate-900">{ticket.id}</p>
                            <p className="text-xs text-slate-500">{ticket.date}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-emerald-700">{ticket.user}</p>
                            <p className="text-xs text-slate-500">DNI: {ticket.dni}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-black text-slate-900">{ticket.qty} Tickets</p>
                            <p className="text-xs font-bold text-green-600">S/ {ticket.total.toFixed(2)}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.method === 'YAPE' ? 'bg-[#742284]/10 text-[#742284]' : ticket.method === 'PLIN' ? 'bg-[#00E0C6]/10 text-[#0A2240]' : 'bg-slate-200 text-slate-700'}`}>
                              {ticket.method}
                            </span>
                          </td>
                          <td className="p-4">
                            <button className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg text-xs">
                              <Eye className="w-4 h-4" /> Ver Imagen
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleApproveTicket(ticket.id, ticket.qty)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg shadow-sm" title="Aprobar Pago y Generar Tickets">
                                <Check className="w-5 h-5" />
                              </button>
                              <button onClick={() => openRejectModal(ticket)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm" title="Rechazar Pago">
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {adminPendingTickets.length === 0 && (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-500 font-bold">
                            🎉 ¡Todo al día! No hay pagos pendientes por validar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MODAL DE RECHAZO DE PAGO */}
                {rejectModalOpen && (
                  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                      <div className="p-6 border-b border-slate-100 bg-red-50 flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <h3 className="font-black text-lg text-red-900">Rechazar Participación</h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <p className="text-sm text-slate-600">Estás a punto de rechazar la solicitud <strong>{ticketToReject?.id}</strong> de {ticketToReject?.user}. Selecciona el motivo exacto para el registro de auditoría:</p>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Motivo del Rechazo</label>
                          <select
                            value={rejectReason || ''}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-none"
                          >
                            <option value="">-- Selecciona un motivo --</option>
                            <option value="Pago no encontrado">Pago no encontrado en cuenta bancaria</option>
                            <option value="Monto incorrecto">Monto transferido es incorrecto</option>
                            <option value="Comprobante inválido">Comprobante falso, borroso o inválido</option>
                            <option value="Datos incorrectos">El cliente ingresó datos incorrectos</option>
                            <option value="Error de usuario">Error del usuario o cancelación</option>
                          </select>
                        </div>
                      </div>
                      <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                        <button onClick={() => setRejectModalOpen(false)} className="px-5 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                        <button onClick={confirmRejectTicket} className="px-5 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">Confirmar Rechazo</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'admin-lista-tickets' && (
            <div className="space-y-6">
              {/* Botonera Superior Tickets */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => setCurrentView('admin-tickets')} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors">Validar Pagos Pendientes</button>
                <button className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm">Historial de Vendidos</button>
                <button onClick={() => setCurrentView('admin-talonario')} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors">Talonario (Ventas Offline)</button>
              </div>

              {/* Filtros Administrativos RF-AD11 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Buscar por DNI o N° Ticket..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <select className="border border-slate-200 text-sm font-bold text-slate-600 py-2 px-3 rounded-lg focus:outline-none focus:border-emerald-500">
                    <option value="todos">Todos los Sorteos</option>
                    <option value="28feb">Gran Sorteo 28 de Febrero</option>
                    {/* Se eliminó la opción de sorteo en Borrador */}
                  </select>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-4 h-4" /> Exportar Excel/CSV
                  </button>
                </div>
              </div>

              {/* Tabla de Todos los Tickets */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">N° Ticket</th>
                        <th className="p-4 font-bold">Cliente</th>
                        <th className="p-4 font-bold">Sorteo Asignado</th>
                        <th className="p-4 font-bold">Transacción Base</th>
                        <th className="p-4 font-bold">Fecha de Generación</th>
                        <th className="p-4 font-bold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {allGeneratedTickets.map((ticket, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-black text-emerald-700 text-lg">{ticket.number}</td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{ticket.user}</p>
                            <p className="text-xs text-slate-500">DNI: {ticket.dni}</p>
                          </td>
                          <td className="p-4 text-slate-600 font-bold">{ticket.draw}</td>
                          <td className="p-4 text-slate-500 font-mono text-xs">{ticket.txId}</td>
                          <td className="p-4 text-slate-500">{ticket.date}</td>
                          <td className="p-4">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${ticket.status === 'Vendido' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                              {ticket.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-slate-100 text-center text-slate-500 text-sm font-bold bg-slate-50">
                  Mostrando 5 de 1,130 tickets generados
                </div>
              </div>
            </div>
          )}

          {currentView === 'admin-talonario' && (
            <div className="space-y-6">
              {/* Botonera Superior Tickets */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => setCurrentView('admin-tickets')} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors">Validar Pagos Pendientes</button>
                <button onClick={() => setCurrentView('admin-lista-tickets')} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors">Historial de Vendidos</button>
                <button className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm">Talonario (Ventas Offline)</button>
              </div>

              {/* Controles del Talonario y Exportación en Bloque */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Resumen del Sorteo */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-lg text-slate-900 mb-4">Pool de Números: Gran Sorteo 28 Feb</h3>
                      <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm font-bold">
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-100">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 block shadow-sm"></span>
                          <span className="text-base md:text-lg">1,130</span> Vendidos
                        </div>
                        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-lg border border-purple-100" title="Impresos y entregados a vendedores de campo">
                          <span className="w-3 h-3 rounded-full bg-purple-500 block shadow-sm"></span>
                          <span className="text-base md:text-lg">200</span> En Calle
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg border border-amber-100" title="Pendientes de validación online">
                          <span className="w-3 h-3 rounded-full bg-amber-400 block shadow-sm"></span>
                          <span className="text-base md:text-lg">14</span> Reservas Web
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 text-slate-600 px-3 py-2 rounded-lg border border-slate-200">
                          <span className="w-3 h-3 rounded-full bg-white block border-2 border-slate-300 shadow-sm"></span>
                          <span className="text-base md:text-lg">3,656</span> Libres
                        </div>
                      </div>
                    </div>
                    {/* Botón Nueva Venta Manual */}
                    <button onClick={() => { setSelectedOfflineTicket(''); setOfflineSaleModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md transform hover:-translate-y-0.5 hidden md:flex shrink-0">
                      <Plus className="w-5 h-5" /> Venta Directa
                    </button>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Buscar número específico..." className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                    <button onClick={() => { setSelectedOfflineTicket(''); setOfflineSaleModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold p-3 rounded-xl shadow-md md:hidden">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Módulo de Exportación Física */}
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

              {/* Grilla Interactiva del Talonario */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-slate-500 font-medium">Haz clic en un número <span className="font-bold text-slate-700">Libre (Blanco)</span> para venta en oficina, o en uno <span className="font-bold text-purple-700">Impreso (Morado)</span> para registrar la venta de calle.</p>
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Rango visible: 0000 - 0119</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-2">
                  {Array.from({ length: 120 }).map((_, i) => {
                    
                    let status = 'libre';
                    if (i === 12 || i === 44 || i === 88 || i === 105) status = 'vendido';
                    if (i === 45 || i === 46) status = 'reservado';
                    if (i >= 50 && i <= 58) status = 'impreso'; 

                    const num = String(i).padStart(4, '0');

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
                            setOfflineSaleModal(true);
                          } else if (status === 'vendido') {
                            alert(`Ticket ${num} ya ha sido VENDIDO de forma online. No puedes modificarlo desde aquí.`);
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

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                  <div className="inline-flex gap-1">
                    <button className="px-4 py-2 border border-slate-200 text-slate-400 rounded-l-lg bg-slate-50 cursor-not-allowed">Anterior</button>
                    <button className="px-4 py-2 border-y border-slate-200 bg-emerald-50 text-emerald-700 font-bold">1</button>
                    <button className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">2</button>
                    <button className="px-4 py-2 border-y border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">3</button>
                    <span className="px-4 py-2 border border-slate-200 text-slate-400">...</span>
                    <button className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors rounded-r-lg">Siguiente</button>
                  </div>
                </div>
              </div>

              {/* Modal de Exportación de Talonarios CON VISTA PREVIA DEL TICKET */}
              {exportModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[95vh]">
                    <div className="p-6 border-b border-slate-100 bg-slate-800 flex justify-between items-center text-white relative overflow-hidden shrink-0">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3"></div>
                      <div className="relative z-10 flex items-center gap-3">
                        <div className="bg-emerald-500/20 p-2 rounded-lg"><Upload className="w-6 h-6 text-emerald-400" /></div>
                        <div>
                          <h3 className="font-black text-xl">Exportar Talonario Físico</h3>
                          <p className="text-xs text-slate-300 font-medium">Extraer números libres para impresión</p>
                        </div>
                      </div>
                      <button onClick={() => setExportModalOpen(false)} className="relative z-10 text-slate-400 hover:text-white transition-colors p-1"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="p-6 overflow-y-auto flex flex-col lg:flex-row gap-8">
                      {/* Left: Configuration Form */}
                      <div className="flex-1 space-y-6">
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
                          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                          <p className="text-sm font-medium leading-relaxed">
                            Al generar el talonario, los números libres seleccionados cambiarán a estado <span className="font-bold text-purple-700">"Impreso / En Calle"</span> y ya no podrán ser comprados por internet.
                          </p>
                        </div>

                        <form id="exportForm" className="space-y-6" onSubmit={(e) => {
                          e.preventDefault();
                          setExportModalOpen(false);
                          alert("Generando PDF... Los números del rango seleccionado ahora figuran como 'Impresos' en el sistema.");
                        }}>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">1. Rango de Tickets a Imprimir</label>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <span className="text-xs text-slate-500 font-bold uppercase mb-1 block">Desde el Nº</span>
                                <input type="number" required placeholder="0000" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-center font-mono font-bold text-lg" />
                              </div>
                              <span className="text-slate-300 font-black text-2xl mt-4">-</span>
                              <div className="flex-1">
                                <span className="text-xs text-slate-500 font-bold uppercase mb-1 block">Hasta el Nº</span>
                                <input type="number" required placeholder="0100" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-center font-mono font-bold text-lg" />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">2. Formato de Exportación</label>
                            <div className="grid grid-cols-2 gap-3">
                              <label className="border-2 border-emerald-500 bg-emerald-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                                <input type="radio" name="exportFormat" value="pdf" className="sr-only" defaultChecked />
                                <FileText className="w-8 h-8 text-emerald-600 mb-2" />
                                <span className="font-bold text-emerald-800 text-sm">PDF (Imprenta)</span>
                                <span className="text-[10px] text-emerald-600/70 text-center mt-1">Con código QR</span>
                              </label>
                              <label className="border-2 border-slate-200 hover:border-emerald-300 bg-white rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all opacity-60 hover:opacity-100">
                                <input type="radio" name="exportFormat" value="excel" className="sr-only" />
                                <LineChart className="w-8 h-8 text-slate-500 mb-2" />
                                <span className="font-bold text-slate-700 text-sm">Excel / CSV</span>
                                <span className="text-[10px] text-slate-500 text-center mt-1">Lista de datos crudos</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">3. Asignar Lote a Vendedor (Opcional)</label>
                            <input type="text" placeholder="Ej: Vendedor Centro - Juan" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                            <p className="text-xs text-slate-400 mt-1">Permite saber a quién le entregaste físicamente estos números.</p>
                          </div>

                        </form>
                      </div>

                      {/* Right: Ticket Design Preview */}
                      <div className="flex-1 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-emerald-600" /> Vista Previa del Diseño a Imprimir
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-center min-h-[300px] overflow-hidden">

                          {/* THE PHYSICAL TICKET UI */}
                          <div className="bg-white border-2 border-slate-300 w-full max-w-md rounded-lg shadow-sm flex flex-row overflow-hidden relative">
                            {/* Talón (Stub) */}
                            <div className="w-1/3 border-r-2 border-dashed border-slate-300 p-3 flex flex-col justify-between relative bg-slate-50">
                              <div>
                                <p className="text-[8px] font-bold text-slate-400 uppercase text-center mb-2">Talón Vendedor</p>
                                <p className="text-xs font-black text-slate-900 text-center mb-2 border-b border-slate-200 pb-1">Nº 0045</p>
                                <div className="space-y-2 mt-2">
                                  <div className="border-b border-slate-300 pb-0.5"><p className="text-[7px] text-slate-400">Nombre:</p></div>
                                  <div className="border-b border-slate-300 pb-0.5"><p className="text-[7px] text-slate-400">DNI:</p></div>
                                  <div className="border-b border-slate-300 pb-0.5"><p className="text-[7px] text-slate-400">Celular:</p></div>
                                </div>
                              </div>
                              <div className="mt-4">
                                <p className="text-[6px] text-slate-400 text-center">Firma/Sello</p>
                              </div>
                              <Scissors className="w-3 h-3 text-slate-300 absolute -right-[7px] top-1/2 -translate-y-1/2 bg-white" />
                            </div>

                            {/* Main Ticket */}
                            <div className="w-2/3 p-4 flex flex-col relative overflow-hidden">
                              {/* Watermark */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                                <Sprout className="w-32 h-32 text-emerald-900" />
                              </div>

                              <div className="flex justify-between items-start mb-2 relative z-10">
                                <div className="flex items-center gap-1">
                                  <div className="bg-amber-400 p-1 rounded">
                                    <Sprout className="w-3 h-3 text-emerald-900" />
                                  </div>
                                  <span className="text-[10px] font-black italic uppercase text-slate-900 leading-none">Sorteos<br /><span className="text-emerald-600">CampoAgro</span></span>
                                </div>
                                <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                                  S/ 40.00
                                </div>
                              </div>

                              <div className="text-center my-auto relative z-10">
                                <h4 className="text-sm font-black text-slate-900 uppercase leading-tight">Gran Sorteo 28 Feb</h4>
                                <p className="text-[9px] text-emerald-700 font-bold mt-0.5">214 Grandes Premios</p>
                                <p className="text-2xl font-black font-mono text-slate-800 tracking-widest mt-2 border-y-2 border-slate-100 py-1">Nº 0045</p>
                              </div>

                              <div className="flex items-end justify-between mt-3 relative z-10">
                                <div>
                                  <p className="text-[7px] text-slate-500 font-bold mb-0.5">Transmisión en vivo por:</p>
                                  <p className="text-[8px] font-black text-blue-600 flex items-center gap-0.5"><Facebook className="w-2.5 h-2.5" /> SorteosCampoAgroOficial</p>
                                </div>
                                <div className="bg-white p-0.5 border border-slate-200 rounded">
                                  <QrCode className="w-8 h-8 text-slate-800" />
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                        <p className="text-xs text-slate-500 text-center mt-3">El diseño final del PDF incluirá una hoja A4 con 10 tickets listos para recortar por la línea punteada.</p>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                      <button type="button" onClick={() => setExportModalOpen(false)} className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                      <button form="exportForm" type="submit" className="px-8 py-2.5 font-black text-white bg-slate-900 hover:bg-black rounded-xl transition-transform transform hover:-translate-y-0.5 shadow-lg flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Exportar y Bloquear Lote
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal de Venta Offline COMPLETAMENTE REDISEÑADO */}
              {offlineSaleModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg"><Ticket className="w-6 h-6 text-emerald-600" /></div>
                        <div>
                          <h3 className="font-black text-lg text-slate-900">Registro de Venta Manual</h3>
                          <p className="text-xs text-slate-500 font-bold">Venta en Oficina o Retorno de Vendedor</p>
                        </div>
                      </div>
                      <button onClick={() => setOfflineSaleModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                      <form id="offlineSaleForm" className="space-y-6" onSubmit={(e) => {
                        e.preventDefault();
                        setOfflineSaleModal(false);
                        alert(`Venta registrada exitosamente para los tickets indicados.`);
                      }}>

                        {/* Sección de Tickets */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <span className="bg-slate-200 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span> Tickets a Registrar
                          </h4>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Número(s) de Ticket *</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                required
                                value={selectedOfflineTicket || ''}
                                onChange={(e) => setSelectedOfflineTicket(e.target.value)}
                                placeholder="Ej: 0045, 0046, 0047"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none font-mono text-emerald-700 font-bold"
                              />
                              <button
                                type="button"
                                onClick={handleGenerateRandomOffline}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors shadow-sm whitespace-nowrap"
                                title="Generar número aleatorio libre"
                              >
                                <Dices className="w-5 h-5" /> Al azar
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Ingresa los números separados por comas si es un lote.</p>
                          </div>
                        </div>

                        {/* Sección Datos del Cliente */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <span className="bg-slate-200 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span> Datos del Comprador
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Nombres y Apellidos *</label>
                              <input type="text" required placeholder="Ej. Juan Pérez" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">DNI *</label>
                                <input type="text" required maxLength="8" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Celular *</label>
                                <input type="text" required maxLength="9" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Departamento</label>
                              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm bg-white">
                                <option value="">Seleccionar...</option>
                                {locationsList.filter(l => l !== 'Todos los departamentos' && l !== 'Extranjero').map(loc => (
                                  <option key={loc} value={loc}>{loc}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Provincia / Distrito</label>
                              <input type="text" placeholder="Ej: Chanchamayo / La Merced" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-700 mb-1">Dirección Exacta</label>
                              <input type="text" placeholder="Ej: Av. Principal 123" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                            </div>
                          </div>
                        </div>

                        {/* Sección Venta */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <span className="bg-slate-200 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">3</span> Detalles Internos de Venta
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Medio de Pago Físico *</label>
                              <select required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm bg-white">
                                <option value="oficina">Cobro en Efectivo (Caja Oficina)</option>
                                <option value="efectivo_vendedor">Efectivo (Entregado por Vendedor)</option>
                                <option value="yape_vendedor">Yape (Hacia el vendedor)</option>
                                <option value="plin_vendedor">Plin (Hacia el vendedor)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">¿Quién realizó esta venta? *</label>
                              <input type="text" required placeholder="Ej: Oficina Central, o Juan (Vendedor)" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm" />
                            </div>
                          </div>
                        </div>

                      </form>
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                      <button type="button" onClick={() => setOfflineSaleModal(false)} className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                      <button form="offlineSaleForm" type="submit" className="px-8 py-2.5 font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-transform transform hover:-translate-y-0.5 shadow-lg flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Finalizar Registro
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'admin-sorteos' && (
            <div className="space-y-6">
              {/* Filtros Administrativos RF-GS11 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Buscar sorteo..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <select className="border border-slate-200 text-sm font-bold text-slate-600 py-2 px-3 rounded-lg focus:outline-none focus:border-emerald-500">
                    <option value="todos">Todos los Estados</option>
                    <option value="activo">Activos</option>
                    <option value="borrador">Borradores</option>
                    <option value="finalizado">Finalizados</option>
                  </select>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-4 h-4" /> Exportar Excel
                  </button>
                  <button onClick={() => setCurrentView('admin-nuevo-sorteo')} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors">
                    <Plus className="w-5 h-5" /> Nuevo Sorteo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                  <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-black px-2 py-1 rounded-md uppercase">ACTIVO</div>
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-black text-xl text-slate-900 mb-1">Gran Sorteo 28 de Febrero</h3>
                    <p className="text-slate-500 text-sm mb-2">Categoría General - Precio: S/ 40.00</p>
                    <span className="inline-block bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">Rango: 0000 - 4999</span>
                  </div>
                  <div className="p-6 bg-slate-50 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Premios Registrados</p>
                      <p className="font-black text-slate-800">214 en Total</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Tickets Vendidos</p>
                      <p className="font-black text-emerald-600">842 / 5000</p>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 flex justify-between gap-2">
                    <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg flex justify-center items-center gap-2"><Edit className="w-4 h-4" /> Editar (Limitado)</button>
                    <button className="flex-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-700 font-bold py-2 rounded-lg flex justify-center items-center gap-2">Cerrar Ventas</button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative opacity-80">
                  <div className="absolute top-4 right-4 bg-slate-200 text-slate-600 text-xs font-black px-2 py-1 rounded-md uppercase">BORRADOR</div>
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-black text-xl text-slate-900 mb-1">Sorteo Día de la Madre</h3>
                    <p className="text-slate-500 text-sm mb-2">Preventa Exclusiva - Precio: S/ 25.00</p>
                    <span className="inline-block bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">Rango: 0000 - 1999</span>
                  </div>
                  <div className="p-6 bg-slate-50 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Premios Registrados</p>
                      <p className="font-black text-slate-800">100 en Total</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Tickets Vendidos</p>
                      <p className="font-black text-emerald-600">0 / 2000</p>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 flex justify-between gap-2">
                    <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg flex justify-center items-center gap-2"><Edit className="w-4 h-4" /> Editar Completo</button>
                    <button className="flex-1 bg-emerald-100 hover:bg-emerald-200 hover:text-emerald-800 text-emerald-700 font-bold py-2 rounded-lg flex justify-center items-center gap-2">Publicar</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'admin-nuevo-sorteo' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <button onClick={() => setCurrentView('admin-sorteos')} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="font-black text-xl text-slate-900">Configuración de Nuevo Sorteo</h3>
                    <p className="text-sm text-slate-500">Parámetros independientes. Este sorteo no afectará el historial de sorteos anteriores.</p>
                  </div>
                </div>
              </div>

              <form
                className="p-6 md:p-8 space-y-10"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('¡Sorteo guardado correctamente!');
                  setCurrentView('admin-sorteos');
                }}
              >
                {/* 1. Información General RF-GS01 */}
                <div>
                  <h4 className="font-black text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Settings className="w-5 h-5 text-emerald-600" /> 1. Información General
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Título Promocional del Sorteo</label>
                      <input type="text" required placeholder="Ej: Gran Sorteo Nacional CampoAgro 2026" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none font-medium" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Descripción (Visible para el cliente)</label>
                      <textarea rows="3" placeholder="Describe brevemente las condiciones o motivo del sorteo..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Estado Inicial de Publicación</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none bg-white font-bold text-slate-700">
                        <option value="borrador">Borrador (Oculto, permite configurar)</option>
                        <option value="activo">Activo (Visible, permite comprar)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Parámetros Numéricos y Fechas RF-GS01 */}
                <div>
                  <h4 className="font-black text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Calendar className="w-5 h-5 text-emerald-600" /> 2. Parámetros y Disponibilidad
                  </h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Precio Fijo del Ticket (S/)</label>
                      <input type="number" step="0.01" required placeholder="Ej: 40.00" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none font-black text-emerald-700" />
                      <p className="text-[10px] text-slate-400 mt-1">No se podrá cambiar luego de la primera venta.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Fecha y Hora de Cierre</label>
                      <input type="datetime-local" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-slate-700 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Rango Numérico Permitido</label>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="Ej: 0000" defaultValue="0" className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-center font-mono" />
                        <span className="text-slate-400 font-bold">-</span>
                        <input type="number" placeholder="Ej: 9999" className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-center font-mono" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">El sistema asignará tickets dentro de este límite exacto.</p>
                    </div>
                  </div>
                </div>

                {/* 3. Recursos Multimedia RF-GS02 */}
                <div>
                  <h4 className="font-black text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <ImageIcon className="w-5 h-5 text-emerald-600" /> 3. Imágenes y Banners
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-pointer">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="font-bold text-slate-700 text-sm mb-1">Subir Imagen Principal (Hero)</p>
                      <p className="text-xs text-slate-500">JPG, WEBP. Ideal 1000x1000px</p>
                    </div>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-pointer">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="font-bold text-slate-700 text-sm mb-1">Subir Banner Promocional</p>
                      <p className="text-xs text-slate-500">JPG, WEBP. Ideal 1920x600px</p>
                    </div>
                  </div>
                </div>

                {/* 4. Resumen de Premios Dinámico */}
                <div>
                  <h4 className="font-black text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Trophy className="w-5 h-5 text-emerald-600" /> 4. Plan de Premios Ofrecidos
                  </h4>
                  <div className="space-y-4">
                    {prizeRows.map((row, index) => (
                      <div key={row.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative">

                        {/* Botón Subir Imagen del Premio */}
                        <div className="flex-shrink-0 w-full md:w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors cursor-pointer group overflow-hidden relative">
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-[10px] font-bold text-center leading-tight">Subir<br />Foto</span>
                        </div>

                        {/* Campos del Premio */}
                        <div className="flex-1 flex flex-col md:flex-row gap-3 w-full">
                          <input type="number" placeholder="Cant." defaultValue={row.qty} className="w-full md:w-24 px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-center font-bold" min="1" />
                          <select defaultValue={row.type} className="w-full md:w-48 px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none">
                            <option value="vehiculo">Vehículo</option>
                            <option value="motocicleta">Motocicleta</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="tecnologia">Tecnología</option>
                            <option value="otro">Otro</option>
                          </select>
                          <input type="text" placeholder="Descripción: Ej. Camioneta Toyota Hilux" defaultValue={row.desc} className="flex-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none" />
                        </div>

                        <button type="button" onClick={() => handleRemovePrizeRow(row.id)} className="text-red-500 p-3 hover:bg-red-50 rounded-xl shrink-0 self-end md:self-auto border border-transparent hover:border-red-100 transition-colors" title="Eliminar Premio">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}

                    <button type="button" onClick={handleAddPrizeRow} className="text-emerald-600 font-bold text-sm flex items-center gap-2 hover:bg-emerald-50 px-4 py-3 rounded-xl transition-colors border border-dashed border-emerald-300 w-full justify-center mt-2">
                      <Plus className="w-5 h-5" /> Agregar nueva fila de premio
                    </button>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-col md:flex-row justify-end gap-4 pt-8 border-t border-slate-100">
                  <button type="button" onClick={() => setCurrentView('admin-sorteos')} className="px-8 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg px-10 py-3 rounded-xl shadow-md shadow-emerald-500/30 transition-transform transform hover:-translate-y-1 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Guardar y Procesar Sorteo
                  </button>
                </div>
              </form>
            </div>
          )}

          {currentView === 'admin-users' && (
            <div className="space-y-6">
              {/* Tarjetas de Resumen de Usuarios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="bg-emerald-100 p-4 rounded-xl">
                    <Users className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Clientes</p>
                    <p className="text-3xl font-black text-slate-900">{adminUsers.length}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="bg-amber-100 p-4 rounded-xl">
                    <Ticket className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Clientes Activos</p>
                    <p className="text-3xl font-black text-slate-900">{adminUsers.filter(u => u.totalTickets > 0).length}</p>
                    <p className="text-xs text-slate-400 font-medium">Compraron al menos 1 vez</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="bg-red-100 p-4 rounded-xl">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Cuentas Baneadas</p>
                    <p className="text-3xl font-black text-red-600">{adminUsers.filter(u => u.status === 'baneado').length}</p>
                  </div>
                </div>
              </div>

              {/* Controles y Búsqueda */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por Nombre, DNI o Celular..."
                      value={userSearchQuery || ''}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <select
                    value={userDrawFilter || ''}
                    onChange={(e) => setUserDrawFilter(e.target.value)}
                    className="border border-slate-200 text-sm font-bold text-slate-600 py-2.5 px-4 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="todos">Todos los Sorteos</option>
                    <option value="Gran Sorteo 28 de Febrero">Gran Sorteo 28 de Febrero</option>
                    <option value="Sorteo Día de la Madre">Sorteo Día de la Madre</option>
                    <option value="Sorteo 31 de Enero">Sorteo 31 de Enero (Histórico)</option>
                  </select>
                  <select
                    value={userStatusFilter || ''}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="border border-slate-200 text-sm font-bold text-slate-600 py-2.5 px-4 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="todos">Todos los Usuarios</option>
                    <option value="activos">Solo Activos</option>
                    <option value="baneados">Solo Baneados</option>
                    <option value="sin_compras">Sin Compras</option>
                  </select>
                </div>
                <div className="flex gap-2 w-full xl:w-auto">
                  <button className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                    <Upload className="w-4 h-4" /> Exportar DB
                  </button>
                </div>
              </div>

              {/* Tabla de Usuarios */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-100">
                        <th className="p-4 font-bold">Cliente / Registro</th>
                        <th className="p-4 font-bold">Documento (DNI)</th>
                        <th className="p-4 font-bold">Contacto</th>
                        <th className="p-4 font-bold">Sorteos Participados</th>
                        <th className="p-4 font-bold text-center">Tickets</th>
                        <th className="p-4 font-bold text-center">Estado de Cuenta</th>
                        <th className="p-4 font-bold text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {filteredAdminUsers.map((user) => (
                        <tr key={user.id} className={`transition-colors ${user.status === 'baneado' ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${user.status === 'baneado' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className={`font-bold text-base ${user.status === 'baneado' ? 'text-red-900 line-through opacity-70' : 'text-slate-900'}`}>{user.name}</p>
                                <p className="text-xs text-slate-500 font-medium">Registrado: {user.date}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-700">
                            {user.dni}
                          </td>
                          <td className="p-4">
                            <p className="text-slate-700 font-medium flex items-center gap-1">
                              <MessageCircle className="w-3 h-3 text-emerald-500" /> {user.phone}
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {user.draws.length > 0 ? user.draws.map((d, i) => (
                                <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 truncate max-w-[120px]" title={d}>
                                  {d}
                                </span>
                              )) : (
                                <span className="text-xs text-slate-400 italic">Ninguno</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="bg-slate-100 text-slate-800 font-black px-3 py-1.5 rounded-lg border border-slate-200">
                              {user.totalTickets}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${user.status === 'activo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                              {user.status === 'activo' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              {user.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 p-2 rounded-lg transition-colors shadow-sm" title="Ver Historial de Compras">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 p-2 rounded-lg transition-colors shadow-sm" title="Editar Datos">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleUserStatus(user.id, user.status, user.name)}
                                className={`p-2 rounded-lg transition-colors shadow-sm text-white ${user.status === 'activo' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                title={user.status === 'activo' ? 'Suspender/Banear Usuario' : 'Reactivar Usuario'}
                              >
                                {user.status === 'activo' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredAdminUsers.length === 0 && (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-500 font-bold">
                            No se encontraron usuarios que coincidan con estos filtros.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                  <p className="text-xs text-slate-500 font-bold">Mostrando {filteredAdminUsers.length} registros</p>
                  <div className="flex gap-1">
                    <button className="px-3 py-1.5 border border-slate-200 text-slate-400 rounded-lg bg-white cursor-not-allowed text-xs font-bold">Anterior</button>
                    <button className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg bg-white hover:bg-slate-100 transition-colors text-xs font-bold">Siguiente</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'admin-content' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-600" /> Crear Anuncio en Difusión</h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Mensaje publicado en el Canal de Difusión.'); }}>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Título del Anuncio</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none" placeholder="Ej: ¡Últimos tickets!" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Etiqueta</label>
                    <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none">
                      <option value="alert">Alerta (Rojo)</option>
                      <option value="promo">Promoción (Amarillo)</option>
                      <option value="news">Noticia (Verde/Azul)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Contenido</label>
                    <textarea className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none" rows="4" placeholder="Escribe el mensaje detallado..." required></textarea>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-sm">
                    Publicar Mensaje
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-slate-600" /> Configuración Web</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">Hero Section (Inicio)</p>
                      <p className="text-xs text-slate-500">Cambiar texto, fecha y premio principal</p>
                    </div>
                    <button className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg">Editar</button>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">Lista de Premios Base</p>
                      <p className="text-xs text-slate-500">Actualizar las tarjetas de la página principal</p>
                    </div>
                    <button className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg">Editar</button>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">Enlaces de Redes y Pagos</p>
                      <p className="text-xs text-slate-500">Actualizar números de Yape/Plin y WhatsApp</p>
                    </div>
                    <button className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg">Editar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20 md:pb-0">

      {/* HEADER CLARO Y AMIGABLE - AGRÓNOMO */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo con Planta/Sprout */}
          <div className="flex items-center gap-2">
            <div className="bg-amber-400 p-1.5 rounded-lg shadow-sm">
              <Sprout className="w-6 h-6 text-emerald-900" />
            </div>
            <span className="cursor-pointer text-xl font-black italic tracking-tight uppercase text-slate-900" onClick={() => setCurrentView('home')}>
              Sorteos <span className="text-emerald-600">CampoAgro</span>
            </span>
          </div>

          {/* Menú Desktop */}
          <nav className="hidden lg:flex items-center gap-5 font-bold text-sm text-slate-600">
            <button onClick={handleTicketsClick} className="flex items-center gap-1.5 hover:text-emerald-600 transition">
              <Ticket className="w-4 h-4" /> Mis Tickets
            </button>
            <button onClick={() => setCurrentView('broadcast')} className="flex items-center gap-1.5 hover:text-emerald-600 transition">
              <Megaphone className="w-4 h-4" /> Canal Difusión
            </button>
            <button onClick={() => setCurrentView('winners')} className="flex items-center gap-1.5 hover:text-emerald-600 transition">
              <Trophy className="w-4 h-4 text-amber-500" /> Ganadores
            </button>

            {isLoggedIn && (
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-500 hover:text-red-700 transition ml-2 bg-red-50 px-3 py-1.5 rounded-full">
                <LogOut className="w-4 h-4" /> Salir
              </button>
            )}
          </nav>

          {/* Menú Hamburguesa Mobile */}
          <button
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú Mobile Desplegable */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white px-4 py-4 space-y-4 border-t border-gray-100 shadow-lg absolute w-full">
            <button onClick={handleTicketsClick} className="w-full text-left flex items-center gap-2 font-bold text-slate-700"><Ticket className="w-5 h-5" /> Mis Tickets</button>
            <button onClick={() => { setCurrentView('broadcast'); setMobileMenuOpen(false); }} className="w-full text-left flex items-center gap-2 font-bold text-slate-700"><Megaphone className="w-5 h-5" /> Canal Difusión</button>
            <button onClick={() => { setCurrentView('winners'); setMobileMenuOpen(false); }} className="w-full text-left flex items-center gap-2 font-bold text-slate-700"><Trophy className="w-5 h-5 text-amber-500" /> Ganadores</button>
            {isLoggedIn && (
              <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 font-bold text-red-500 mt-4 pt-4 border-t border-gray-100">
                <LogOut className="w-5 h-5" /> Cerrar Sesión
              </button>
            )}
          </div>
        )}
      </header>

      {/* ALERTA DE SEGURIDAD */}
      <div className="bg-[#FFF4F4] border-b border-[#FFE0E0] py-3 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-2 text-center md:text-left">
          <AlertTriangle className="w-6 h-6 shrink-0 text-red-600 animate-pulse hidden md:block" />
          <div className="text-red-700">
            <p className="font-bold text-sm md:text-base">⚠️ ¡ALERTA DE SEGURIDAD! No te dejes engañar ⚠️</p>
            <p className="text-xs md:text-sm mt-0.5">
              Verifica siempre que al realizar el pago salga a nombre de: <strong className="bg-red-600 px-1.5 py-0.5 rounded text-white inline-block mt-1 md:mt-0">INVERSIONES CampoAgro E.I.R.L.</strong>. Si sale otro nombre, ¡ESTÁS SIENDO ESTAFADO!
            </p>
          </div>
        </div>
      </div>

      {currentView === 'home' && (
        <>
          {/* HERO SECTION MEJORADO CON CARRUSEL AGRÓNOMO */}
          <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden flex items-center bg-emerald-950">

            {/* Carrusel de Imágenes de Fondo */}
            {heroBackgrounds.map((bg, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBgIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                <img src={bg} alt={`Fondo CampoAgro ${idx + 1}`} className="w-full h-full object-cover" />
                {/* Overlay oscuro/verde para que resalte el texto frontal */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#064E3B]/95 via-[#064E3B]/80 to-black/60 backdrop-blur-[1px]"></div>
              </div>
            ))}

            <div className="container mx-auto px-4 relative z-10">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 max-w-6xl mx-auto">

                {/* Textos y Títulos (Izquierda en Desktop) adaptados para fondo oscuro */}
                <div className="text-center lg:text-left flex-1">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full shadow-lg mb-6">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <p className="text-white font-bold uppercase tracking-widest text-xs md:text-sm">
                      Sorteo 28 de Febrero
                    </p>
                  </div>

                  <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight leading-[1.1] drop-shadow-xl">
                    GANA UNO DE LOS <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                      214 PREMIOS
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl text-emerald-50 mb-8 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed drop-shadow-md">
                    ¡Tu oportunidad de ganar autos, camionetas, motos y miles de soles en efectivo está aquí! Participa hoy de forma 100% segura respaldado por <strong className="text-amber-400">Inversiones CampoAgro E.I.R.L.</strong>
                  </p>

                  {/* CONTEO REGRESIVO (Glassmorphism para fondo imagen) */}
                  <div className="mb-10">
                    <p className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-3 drop-shadow-md">El sorteo se realizará en:</p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3">
                      {[
                        { label: 'Meses', value: timeLeft.meses },
                        { label: 'Días', value: timeLeft.dias },
                        { label: 'Horas', value: timeLeft.horas },
                        { label: 'Minutos', value: timeLeft.minutos },
                        { label: 'Segundos', value: timeLeft.segundos },
                      ].map((item, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 md:p-4 text-center min-w-[65px] md:min-w-[80px] shadow-lg transform transition-transform hover:-translate-y-1">
                          <span className="text-2xl md:text-3xl font-black text-white font-mono drop-shadow-md">
                            {String(item.value).padStart(2, '0')}
                          </span>
                          <span className="block text-[10px] md:text-xs uppercase font-bold text-emerald-200 mt-1">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumen rápido de premios en hero (Glassmorphism) */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8 lg:mb-0">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 hover:bg-white/20 transition-colors">
                      <Car className="w-6 h-6 text-amber-400" />
                      <div className="text-left">
                        <p className="font-black text-white leading-none">20</p>
                        <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">Vehículos</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 hover:bg-white/20 transition-colors">
                      <Banknote className="w-6 h-6 text-amber-400" />
                      <div className="text-left">
                        <p className="font-black text-white leading-none">170</p>
                        <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">Fajos S/1200</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 hover:bg-white/20 transition-colors">
                      <Smartphone className="w-6 h-6 text-amber-400" />
                      <div className="text-left">
                        <p className="font-black text-white leading-none">15</p>
                        <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">iPhones</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tarjeta de Compra (Derecha en Desktop) - Sin cambios estructurales, se mantiene blanca para resaltar */}
                <div className="w-full max-w-md shrink-0 relative mt-12 lg:mt-0">
                  {/* Decoración detrás de la tarjeta - Tonos Ámbar/Sol */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-300 rounded-[2.5rem] blur opacity-40"></div>

                  <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white relative relative z-10 transform transition-transform hover:-translate-y-2 duration-300">

                    {/* Etiqueta flotante de precio */}
                    <div className="absolute -top-5 right-6 bg-[#FF0000] text-white px-4 py-2 rounded-xl shadow-lg transform rotate-3 font-black text-lg border-2 border-white">
                      ¡SOLO S/ 40!
                    </div>

                    <div className="text-center mb-6 pt-4">
                      <p className="text-emerald-700 font-bold uppercase tracking-wider text-sm mb-2">Compra tu ticket digital</p>
                      <div className="flex items-start justify-center gap-1 text-slate-900">
                        <span className="text-3xl mt-2 font-bold">S/</span>
                        <span className="text-7xl font-black tracking-tighter text-emerald-900">40</span>
                        <span className="text-3xl mt-2 font-bold">.00</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 rounded-2xl p-5 mb-6 border border-emerald-100">
                      <p className="text-xs text-emerald-800 font-bold mb-3 uppercase text-center tracking-wider">Métodos de pago oficiales</p>
                      <div className="flex justify-center gap-3">
                        <div className="bg-[#742284] text-white px-6 py-2.5 rounded-xl font-black shadow-sm flex items-center justify-center w-full">
                          YAPE
                        </div>
                        <div className="bg-[#00E0C6] text-[#0A2240] px-6 py-2.5 rounded-xl font-black shadow-sm flex items-center justify-center w-full">
                          PLIN
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-emerald-100 text-center">
                        <p className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider mb-1">A nombre de:</p>
                        <p className="text-sm font-black text-slate-800">INVERSIONES CampoAgro E.I.R.L.</p>
                      </div>
                    </div>

                    <button onClick={handleBuyClick} className="w-full bg-[#25D366] hover:bg-[#20B858] text-white font-black text-xl py-5 rounded-2xl shadow-[0_6px_0_#1DA851] active:shadow-[0_0px_0_#1DA851] active:translate-y-[6px] transition-all flex items-center justify-center gap-2 group">
                      <Ticket className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      ¡Participar Ahora!
                    </button>

                    <p className="text-center text-xs font-bold text-slate-400 mt-5 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-green-500" /> Compra 100% Segura y Verificada
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* LISTA DE PREMIOS */}
          <section id="premios" className="py-16 bg-[#F8FAFC]">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 uppercase">Lista de Premios</h2>
                <div className="w-16 h-1.5 bg-amber-400 mx-auto rounded-full mt-4"></div>
                <p className="text-slate-500 mt-4 font-medium">Más de 200 oportunidades de ganar en nuestro próximo sorteo.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {prizes.map((prize) => (
                  <div key={prize.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group hover:-translate-y-1 hover:border-emerald-200 cursor-pointer">
                    {/* Contenedor de la Imagen */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <img
                        src={prize.image}
                        alt={``}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Efecto de degradado oscuro abajo para la imagen */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {/* Etiqueta de cantidad flotante */}
                      <div className="absolute top-2 right-2 bg-[#FF0000] text-white font-black text-sm md:text-base px-2.5 py-1 rounded-lg shadow-md border-2 border-white z-10">
                        x{prize.qty}
                      </div>
                    </div>

                    {/* Contenedor de Texto */}
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
                <button onClick={handleBuyClick} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-xl transition-colors shadow-sm inline-flex items-center gap-2">
                  <Ticket className="w-5 h-5" /> ¡Quiero participar por estos premios!
                </button>
              </div>
            </div>
          </section>

          {/* GANADORES ANTERIORES CAROUSEL */}
          <section id="ganadores" className="py-16 bg-white border-t border-slate-100 overflow-hidden">
            <div className="container mx-auto px-4 max-w-6xl relative">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-slate-900 uppercase flex justify-center items-center gap-3">
                  <Trophy className="text-amber-500 w-8 h-8" /> Premios Mayores
                </h2>
                <p className="text-slate-500 mt-2">Los ganadores más afortunados de nuestras últimas ediciones.</p>
              </div>

              <div className="relative group/carousel mb-10">
                {/* Botón Izquierda */}
                <button
                  onClick={() => scrollCarousel('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-20 bg-white p-3 rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all hidden md:flex opacity-0 group-hover/carousel:opacity-100 items-center justify-center"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Contenedor del Carrusel */}
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

                {/* Botón Derecha */}
                <button
                  onClick={() => scrollCarousel('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-20 bg-white p-3 rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all hidden md:flex opacity-0 group-hover/carousel:opacity-100 items-center justify-center"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center">
                <button onClick={() => setCurrentView('winners')} className="border-2 border-emerald-600 text-emerald-600 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors inline-flex items-center gap-2">
                  Ver lista de todos los ganadores <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {currentView === 'login' && (
        <section className="py-12 md:py-24 bg-[#F8FAFC] flex items-center justify-center px-4 min-h-[80vh]">
          <div className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 w-full max-w-md">
            <div className="flex justify-center mb-6">
              <div className="bg-amber-400 p-4 rounded-2xl shadow-sm transform -rotate-3">
                <User className="w-8 h-8 text-emerald-900" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-center text-slate-900 mb-2">
              {isLoginMode ? 'Ingresa a tu cuenta' : 'Crea tu cuenta participativa'}
            </h2>
            <p className="text-center text-slate-500 mb-8 text-sm font-medium">
              {isLoginMode ? 'Verifica el estado de tus tickets y transacciones' : 'Registra tus datos reales para poder reclamar tus premios.'}
            </p>

            {isLoginMode ? (
              <form key="form-login" onSubmit={handleAuthSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">DNI o Nro. de Celular</label>
                  <input
                    type="text"
                    required
                    value={loginUser || ''}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-all font-medium text-slate-700"
                    placeholder="Ej. 72345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={loginPassword || ''}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-all font-medium text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg py-3.5 rounded-xl shadow-[0_4px_0_#047857] active:shadow-none active:translate-y-1 transition-all mt-4">
                  Ingresar a mi panel
                </button>
              </form>
            ) : (
              <form key="form-register" onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Documento de Identidad (DNI) *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      maxLength="8"
                      value={regDni || ''}
                      onChange={(e) => setRegDni(e.target.value.replace(/\D/g, ''))} 
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-all font-mono font-bold text-slate-700 tracking-widest"
                      placeholder="Ej. 72345678"
                    />
                    <button
                      type="button"
                      onClick={handleConsultarDni}
                      disabled={isConsultingDni || (regDni || '').length !== 8}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 rounded-xl shadow-sm transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    >
                      {isConsultingDni ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Consultar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nombres y Apellidos Completos *</label>
                  <input
                    type="text"
                    required
                    value={regName || ''}
                    onChange={(e) => setRegName(e.target.value)}
                    readOnly={!!regName} 
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all font-bold ${regName ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-700 focus:bg-white focus:border-emerald-500'}`}
                    placeholder="Se autocompletará con tu DNI"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nº Celular *</label>
                    <input
                      type="text"
                      required
                      maxLength="9"
                      value={regPhone || ''}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-all font-medium text-slate-700"
                      placeholder="987654321"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Departamento *</label>
                    <select
                      required
                      value={regDept || ''}
                      onChange={(e) => setRegDept(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-all font-medium text-slate-700"
                    >
                      <option value="">Selecciona...</option>
                      {locationsList.filter(l => l !== 'Todos los departamentos').map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Crea una Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={regPassword || ''}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-all font-medium text-slate-700"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <button type="submit" disabled={!regName} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg py-3.5 rounded-xl shadow-[0_4px_0_#047857] active:shadow-none active:translate-y-1 transition-all mt-4 disabled:bg-emerald-300 disabled:shadow-[0_4px_0_#A7F3D0] disabled:cursor-not-allowed">
                  Registrarme y continuar
                </button>
              </form>
            )}

            <div className="mt-6 text-center space-y-3">
              <button
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  
                  setLoginUser('');
                  setLoginPassword('');
                  setRegDni('');
                  setRegName('');
                  setRegPhone('');
                  setRegDept('');
                  setRegPassword('');
                }}
                className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
              >
                {isLoginMode ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
              {isLoginMode && (
                <div className="block">
                  <a href="#" className="text-xs font-bold text-emerald-600 hover:underline">¿Olvidaste tu contraseña?</a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {currentView === 'dashboard' && (
        <section className="py-12 bg-[#F8FAFC] min-h-[60vh]">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Cabecera del Dashboard */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <User className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Mi Panel de Tickets</h2>
                  <p className="text-slate-500 font-medium">Hola, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Juan'}. Administra tus compras aquí.</p>
                </div>
              </div>
              <button onClick={handleBuyClick} className="w-full md:w-auto bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-500 shadow-sm transition-colors flex items-center justify-center gap-2">
                <Ticket className="w-5 h-5" /> Comprar más tickets
              </button>
            </div>

            {/* Tabla de Transacciones */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
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
                    {mockTransactions.map((tx) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {currentView === 'checkout' && (
        <section className="py-12 bg-[#F8FAFC] min-h-[60vh]">
          <div className="container mx-auto px-4 max-w-3xl">
            <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5" /> Volver a mi panel
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 text-center bg-slate-50">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Completa tu compra</h2>
                <p className="text-slate-600 font-medium">Sigue los pasos para asegurar tus tickets.</p>
              </div>

              <form className="p-6 md:p-8 space-y-8" onSubmit={handleCheckoutSubmit}>
                {/* Paso 1: Configurar Compra */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    Configura tu participación
                  </h3>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5">
                    {/* Selección de Sorteo */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Sorteo y Categoría</label>
                      <select
                        value={selectedDraw || ''}
                        onChange={(e) => setSelectedDraw(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
                      >
                        <option value="Sorteo 28 de Febrero - General">Sorteo 28 de Febrero - Categoría General</option>
                        <option value="Sorteo 28 de Febrero - VIP">Sorteo 28 de Febrero - Categoría VIP</option>
                      </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
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
                          <button type="button" onClick={() => setSelectionMethod('random')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-sm transition-all ${selectionMethod === 'random' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Dices className="w-4 h-4" /> Al azar
                          </button>
                          <button type="button" onClick={() => setSelectionMethod('manual')} className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-sm transition-all ${selectionMethod === 'manual' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <MousePointerClick className="w-4 h-4" /> Elegir
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Grilla de números si es manual */}
                    {selectionMethod === 'manual' && (
                      <div className="mt-4 border-t border-slate-200 pt-5">
                        <div className="flex justify-between items-end mb-3">
                          <p className="text-sm font-bold text-slate-700">Elige tus números (Muestra):</p>
                          <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg">{selectedNumbers.length} de {ticketQuantity} elegidos</span>
                        </div>
                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                          {Array.from({ length: 20 }).map((_, i) => {
                            const num = String(i + 1).padStart(3, '0');
                            const isSelected = selectedNumbers.includes(num);
                            return (
                              <button
                                type="button"
                                key={num}
                                onClick={() => toggleNumber(num)}
                                className={`py-2 rounded-lg font-bold text-sm border-2 transition-all ${isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'}`}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                        {selectedNumbers.length > 0 && (
                          <p className="text-xs text-slate-500 mt-3 font-medium">Números seleccionados: <strong className="text-emerald-600">{selectedNumbers.join(', ')}</strong></p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Resumen Total */}
                  <div className="mt-4 bg-[#FFF4F4] border-2 border-[#FFE0E0] p-4 rounded-xl flex justify-between items-center">
                    <span className="font-bold text-red-700">Total a Pagar ({ticketQuantity} ticket{ticketQuantity > 1 ? 's' : ''}):</span>
                    <span className="text-2xl font-black text-red-700">S/ {(ticketQuantity * 40).toFixed(2)}</span>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Paso 2: Datos Personales del Participante (USUARIO REGISTRADO) */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                    Tus Datos Personales
                  </h3>
                  <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex items-start gap-4">
                    <div className="bg-white p-3 rounded-full shadow-sm shrink-0 border border-emerald-50">
                      <User className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-emerald-800 font-black uppercase tracking-wider">Participante Verificado</p>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="font-black text-slate-900 text-xl leading-tight mb-2">{currentUser?.name || 'JUAN CARLOS PEREZ GOMEZ'}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 font-medium">
                        <p><strong>DNI:</strong> {currentUser?.dni || '72345678'}</p>
                        <p><strong>Celular:</strong> {currentUser?.phone || '987654321'}</p>
                        <p><strong>Dpto:</strong> {currentUser?.dept || 'Junín'}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-3 font-medium">Estos datos se utilizarán para validar tu identidad en caso de resultar ganador.</p>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Paso 3: Pago */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                    Realiza el pago
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border-2 border-[#742284] rounded-2xl p-4 text-center bg-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-[#742284] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">YAPE</div>
                      <p className="text-slate-500 text-sm font-bold mb-1 mt-2">Número oficial</p>
                      <p className="text-2xl font-black text-[#742284]">987 654 321</p>
                    </div>
                    <div className="border-2 border-[#00E0C6] rounded-2xl p-4 text-center bg-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-[#00E0C6] text-[#0A2240] text-xs font-bold px-3 py-1 rounded-bl-lg">PLIN</div>
                      <p className="text-slate-500 text-sm font-bold mb-1 mt-2">Número oficial</p>
                      <p className="text-2xl font-black text-[#0A2240]">987 654 321</p>
                    </div>
                  </div>
                  <p className="text-center text-sm text-slate-600 font-medium mt-4">
                    A nombre de: <strong className="text-slate-900">INVERSIONES CampoAgro E.I.R.L.</strong>
                  </p>
                </div>

                <hr className="border-slate-100" />

                {/* Paso 4: Comprobante */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
                    Adjunta tu comprobante
                  </h3>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="bg-white w-16 h-16 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="font-bold text-slate-700 mb-1">Haz clic para subir tu boucher</p>
                    <p className="text-sm text-slate-500">Formatos soportados: JPG, PNG o PDF</p>
                    <input type="file" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#25D366] hover:bg-[#20B858] text-white font-black text-xl py-4 rounded-xl shadow-[0_4px_0_#1DA851] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Confirmar Compra por S/ {(ticketQuantity * 40).toFixed(2)}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {currentView === 'winners' && (
        <section className="bg-[#F4F6F9] min-h-screen pb-20">
          {/* HEADER DE SORTEOS (Tabs) */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-[60px] md:top-[68px] z-40">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-6">
                <button onClick={() => setWinnersTab('14feb')} className={`whitespace-nowrap py-4 font-bold text-sm border-b-4 transition-colors ${winnersTab === '14feb' ? 'border-amber-400 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Sorteo del 14 de febrero</button>
                <button onClick={() => setWinnersTab('31ene')} className={`whitespace-nowrap py-4 font-bold text-sm border-b-4 transition-colors ${winnersTab === '31ene' ? 'border-amber-400 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Sorteo del 31 de enero</button>
                <button onClick={() => setWinnersTab('31dic')} className={`whitespace-nowrap py-4 font-bold text-sm border-b-4 transition-colors ${winnersTab === '31dic' ? 'border-amber-400 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Sorteo del 31 de diciembre</button>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 max-w-6xl mt-8">
            <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5" /> Volver al inicio
            </button>

            {/* HERO GANADORES */}
            <div className="text-center mb-8">
              <p className="text-emerald-600 font-black text-lg md:text-xl uppercase tracking-widest mb-1">Sorteo del 14 de febrero</p>
              <h2 className="text-5xl md:text-7xl font-black text-[#0A2240] uppercase italic mb-4">
                ¡GANADORES!
              </h2>
              <p className="text-slate-600 font-medium text-lg">
                ¡Felicitamos a todos los afortunados ganadores de nuestro gran sorteo!
              </p>
            </div>

            {/* RESUMEN DE PREMIOS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-2xl shadow-sm text-center border border-slate-100">
                <p className="text-4xl font-black text-slate-900 mb-1">20</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Carros</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm text-center border border-slate-100">
                <p className="text-4xl font-black text-slate-900 mb-1">12</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Motos</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm text-center border border-slate-100">
                <p className="text-4xl font-black text-slate-900 mb-1">5</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Smartphones</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm text-center border border-slate-100">
                <p className="text-4xl font-black text-slate-900 mb-1">180</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Efectivo</p>
              </div>
            </div>

            {/* FILTROS */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 space-y-4">
              <div className="flex flex-wrap gap-2">
                {['Todos', 'CARRO', 'MOTO', 'SMARTPHONE', 'EFECTIVO'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-2 rounded-full font-bold text-xs md:text-sm transition-colors ${filterCategory === cat ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {cat === 'Todos' ? 'Todos 217' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
                <p className="text-slate-500 font-bold text-sm w-full md:w-auto text-center md:text-left">
                  <span className="text-emerald-600">{filteredWinners.length}</span> resultados
                </p>
                <select
                  value={filterLocation || ''}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full md:w-64 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500"
                >
                  {locationsList.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* GRILLA DE GANADORES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredWinners.map((winner) => (
                <div key={winner.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 relative overflow-hidden flex flex-col hover:shadow-md hover:border-emerald-200 transition-all group">
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider ${winner.type === 'CARRO' ? 'bg-emerald-100 text-emerald-800' :
                        winner.type === 'MOTO' ? 'bg-amber-100 text-amber-800' :
                          winner.type === 'EFECTIVO' ? 'bg-green-100 text-green-800' :
                            'bg-slate-100 text-slate-800'
                      }`}>
                      {winner.type}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{winner.ticket}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-xl font-black text-slate-400 group-hover:bg-amber-400 group-hover:text-slate-900 group-hover:border-amber-400 transition-colors">
                      {winner.initial}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 text-sm truncate leading-tight">{winner.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{winner.location}</p>
                    </div>
                  </div>

                  <div className="mt-auto bg-[#F4F6F9] border border-slate-100 p-3 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Premio</p>
                    <p className="font-black text-slate-900 text-sm">{winner.prize}</p>
                  </div>

                  {/* Etiqueta de Premio Mayor Condicional */}
                  {grandWinners.some(g => g.name === winner.name) && (
                    <div className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-1 rounded shadow-sm opacity-90">
                      Premio Mayor
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredWinners.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
                <p className="text-slate-500 font-bold">No se encontraron ganadores con estos filtros.</p>
              </div>
            )}

            {filteredWinners.length > 0 && (
              <div className="text-center mt-10">
                <button className="bg-white border-2 border-slate-200 text-slate-600 font-bold px-8 py-3 rounded-xl hover:bg-slate-50 hover:border-emerald-300 transition-colors">
                  Cargar más resultados
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {currentView === 'broadcast' && (
        <section className="py-12 bg-[#F8FAFC] min-h-[60vh]">
          <div className="container mx-auto px-4 max-w-3xl">
            <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5" /> Volver al inicio
            </button>

            {/* Header del Canal - Verde Botánico */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-8 text-center shadow-lg relative overflow-hidden mb-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400 opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

              <div className="relative z-10">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                  <Megaphone className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Canal de Difusión Oficial</h2>
                <p className="text-emerald-100 font-medium max-w-lg mx-auto mb-8">
                  Únete a nuestras comunidades para enterarte antes que nadie sobre nuevos sorteos, promociones relámpago y transmisiones en vivo.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a href="#" className="bg-[#25D366] hover:bg-[#20B858] text-white font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105">
                    <MessageCircle className="w-6 h-6" /> Unirme a WhatsApp
                  </a>
                  <a href="#" className="bg-[#0088cc] hover:bg-[#0077b5] text-white font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105">
                    <Send className="w-6 h-6" /> Unirme a Telegram
                  </a>
                </div>
              </div>
            </div>

            {/* Feed de Anuncios */}
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <BellRing className="w-6 h-6 text-amber-500" /> Últimos Anuncios
              </h3>

              <div className="space-y-4">
                {broadcastMessages.map((msg) => (
                  <div key={msg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${msg.type === 'alert' ? 'bg-red-500' :
                        msg.type === 'promo' ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}></div>

                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                      <h4 className="font-black text-lg text-slate-900">{msg.title}</h4>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full w-max">{msg.date}</span>
                    </div>

                    <p className="text-slate-600 font-medium leading-relaxed">
                      {msg.content}
                    </p>

                    <div className="mt-4 flex gap-3">
                      <button className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-800 transition-colors">
                        <Facebook className="w-4 h-4" /> Ver en Facebook
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button className="border-2 border-slate-200 text-slate-500 font-bold px-6 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                  Cargar mensajes anteriores
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8 text-slate-600 text-sm">
        <div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-3 gap-10 text-center md:text-left mb-12">

          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="bg-amber-400 p-1.5 rounded-lg">
                <Sprout className="w-5 h-5 text-emerald-900" />
              </div>
              <span className="text-xl font-black italic uppercase text-slate-900">Sorteos <span className="text-emerald-600">CampoAgro</span></span>
            </div>
            <p className="mb-6 text-slate-500">Participa con confianza y gana grandes premios vehiculares, efectivo y tecnología con el sorteo más transparente, respaldado por el sector agrario.</p>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold uppercase mb-4 tracking-wider text-xs">Enlaces Rápidos</h4>
            <ul className="space-y-3 font-medium">
              <li><button onClick={handleTicketsClick} className="hover:text-emerald-600 transition">Ver Mis Tickets</button></li>
              <li><button onClick={() => setCurrentView('broadcast')} className="hover:text-emerald-600 transition">Canal de Difusión</button></li>
              <li><button onClick={() => setCurrentView('winners')} className="hover:text-emerald-600 transition">Ganadores</button></li>
              <li><button onClick={() => setCurrentView('admin-dashboard')} className="hover:text-emerald-600 transition text-emerald-600 font-bold flex items-center gap-1"><Settings className="w-3 h-3" /> Panel Admin</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold uppercase mb-4 tracking-wider text-xs">Empresa Operadora</h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-emerald-100">
              <p className="font-black text-slate-800 mb-1">INVERSIONES CampoAgro E.I.R.L.</p>
              <p className="text-xs text-slate-500 mb-3">RUC: 20602462758</p>
              <p className="text-red-600 font-bold text-xs flex items-center gap-1 justify-center md:justify-start">
                <AlertTriangle className="w-4 h-4" /> Nunca deposites a personas naturales.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl border-t border-gray-100 pt-8 text-center text-slate-400 font-medium">
          <p>© 2026 Sorteos CampoAgro. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* REDES SOCIALES FLOTANTES */}
      {currentView === 'home' && (
        <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex flex-col gap-3">
          <a href="#" className="bg-[#1877F2] text-white p-3 md:p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center group relative">
            <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
              Síguenos en Facebook
            </span>
            <Facebook className="w-6 h-6 md:w-7 md:h-7 fill-current" />
          </a>

          <a href="#" className="bg-black text-white p-3 md:p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center group relative">
            <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
              Síguenos en TikTok
            </span>
            <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
          </a>

          <a href="#" className="bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center group relative">
            <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
              Escríbenos al WhatsApp
            </span>
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
          </a>
        </div>
      )}

      {/* MOBILE STICKY CTA BOTÓN */}
      {currentView === 'home' && (
        <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 z-50 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
          <button onClick={handleBuyClick} className="w-full bg-[#25D366] text-white font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_0_#1DA851] active:shadow-none active:translate-y-1 transition-all">
            <MessageCircle className="w-6 h-6" />
            ¡Comprar Ticket S/40!
          </button>
        </div>
      )}

    </div>
  );
}