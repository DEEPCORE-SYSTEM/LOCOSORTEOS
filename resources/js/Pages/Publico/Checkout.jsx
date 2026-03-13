import PublicLayout from '@/Layouts/PublicLayout';
import { Head, router, usePage } from '@inertiajs/react';
import CheckoutView from '../User/views/CheckoutView';

export default function CheckoutPublic({
  sorteo,
  sorteosActivos = [],
  tickets = [],
  settings = {},
}) {
  const currentUser = null;

  return (
    <PublicLayout isLoggedIn={false} currentUser={null}>
      <Head title="Comprar Tickets | Sorteos CampoAgro" />

      <CheckoutView
        currentUser={currentUser}
        sorteo={sorteo}
        sorteosActivos={sorteosActivos}
        tickets={tickets}
        settings={settings}
        ticketsRouteName="participar"
        onBack={() => router.get(route('home'))}
      />
    </PublicLayout>
  );
}
