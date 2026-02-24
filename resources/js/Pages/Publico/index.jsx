import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";

export default function Index({ sorteo, tickets: initialTickets }) {

    // ⚡ tickets ahora son dinámicos (para tiempo real)
    const [tickets, setTickets] = useState(initialTickets);

    const [seleccionados, setSeleccionados] = useState([]);

    const [form, setForm] = useState({
        nombre: '',
        dni: '',
        telefono: ''
    });

    // 🎧 ESCUCHAR VENTAS EN TIEMPO REAL
    useEffect(() => {

        window.Echo.channel('sorteo')
            .listen('TicketVendido', (e) => {

                setTickets(prev =>
                    prev.map(t =>
                        t.id === e.ticketId
                            ? { ...t, estado: 'vendido' }
                            : t
                    )
                );

                // Si el usuario tenía ese número seleccionado → lo quitamos
                setSeleccionados(prev => prev.filter(id => id !== e.ticketId));
            });

        return () => {
            window.Echo.leave('sorteo');
        };

    }, []);

    // Seleccionar / deseleccionar número
    const toggle = (id) => {
        setSeleccionados(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    // Comprar
    const comprar = () => {

        if (!form.nombre || !form.dni || !form.telefono) {
            alert("Completa tus datos");
            return;
        }

        if (seleccionados.length === 0) {
            alert("Selecciona al menos un número");
            return;
        }

        router.post('/rifa/comprar', {
            ...form,
            tickets: seleccionados,
            precio: sorteo.precio_ticket
        });

        setSeleccionados([]);
    };

    const total = seleccionados.length * sorteo.precio_ticket;

    return (
        <div className="p-6 max-w-6xl mx-auto">

            {/* INFO DEL SORTEO */}
            <h1 className="text-3xl font-bold">{sorteo.nombre}</h1>
            <p className="text-lg">Precio por número: S/ {sorteo.precio_ticket}</p>

            {/* GRID DE NÚMEROS */}
            <div className="grid grid-cols-10 gap-2 mt-6">
                {tickets.map(t => {

                    const vendido = t.estado === 'vendido';
                    const seleccionado = seleccionados.includes(t.id);

                    return (
                        <button
                            key={t.id}
                            disabled={vendido}
                            onClick={() => toggle(t.id)}
                            className={`
                                p-2 rounded border text-sm font-medium
                                ${vendido ? 'bg-red-400 text-white cursor-not-allowed' : ''}
                                ${seleccionado ? 'bg-green-500 text-white' : ''}
                                ${!vendido && !seleccionado ? 'bg-white hover:bg-gray-100' : ''}
                            `}
                        >
                            {t.numero}
                        </button>
                    );
                })}
            </div>

            {/* PANEL DE COMPRA */}
            <div className="mt-8 border p-4 rounded bg-gray-50">

                <h2 className="text-xl font-semibold mb-3">
                    Tus números: {seleccionados.length}
                </h2>

                <p className="mb-4 font-bold">
                    Total: S/ {total.toFixed(2)}
                </p>

                <div className="grid gap-3 max-w-md">
                    <input
                        className="border p-2 rounded"
                        placeholder="Nombre completo"
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                    />

                    <input
                        className="border p-2 rounded"
                        placeholder="DNI"
                        onChange={e => setForm({ ...form, dni: e.target.value })}
                    />

                    <input
                        className="border p-2 rounded"
                        placeholder="Teléfono"
                        onChange={e => setForm({ ...form, telefono: e.target.value })}
                    />

                    <button
                        onClick={comprar}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    >
                        Comprar ahora
                    </button>
                </div>
            </div>

        </div>
    );
}
