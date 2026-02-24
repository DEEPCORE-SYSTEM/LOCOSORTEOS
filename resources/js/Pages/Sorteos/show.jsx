import { useState } from "react";
import { router } from "@inertiajs/react";

export default function Show({ sorteo, tickets }) {
    const [seleccionados, setSeleccionados] = useState([]);

    const toggle = (id) => {
        setSeleccionados((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    const comprar = () => {
        router.post("/comprar", {
            tickets: seleccionados,
            metodo_pago: "efectivo",
            precio_ticket: sorteo.precio_ticket
        });
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">{sorteo.nombre}</h1>

            <div className="grid grid-cols-10 gap-2">
                {tickets.map((ticket) => (
                    <button
                        key={ticket.id}
                        disabled={ticket.estado !== "disponible"}
                        onClick={() => toggle(ticket.id)}
                        className={`p-2 border rounded
                        ${ticket.estado === "vendido" ? "bg-red-400" : ""}
                        ${seleccionados.includes(ticket.id) ? "bg-green-400" : ""}
                        `}
                    >
                        {ticket.numero}
                    </button>
                ))}
            </div>

            <button
                onClick={comprar}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
                Comprar seleccionados
            </button>
        </div>
    );
}
