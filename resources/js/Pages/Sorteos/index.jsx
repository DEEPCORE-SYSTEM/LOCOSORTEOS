import { Head, Link } from "@inertiajs/react";

export default function Index({ sorteos }) {
    return (
        <>
            <Head title="Sorteos" />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Sorteos</h1>

                <div className="grid gap-4">
                    {sorteos.map((sorteo) => (
                        <div key={sorteo.id} className="p-4 border rounded">
                            <h2 className="font-semibold">{sorteo.nombre}</h2>
                            <p>Precio: S/ {sorteo.precio_ticket}</p>
                            <p>Estado: {sorteo.estado}</p>

                            <Link
                                href={`/sorteos/${sorteo.id}`}
                                className="text-blue-600 underline"
                            >
                                Ver números
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
