import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DashboardView  from './views/DashboardView';
import ProfileView    from './views/ProfileView';
import CheckoutView   from './views/CheckoutView';

/**
 * Página principal del panel de usuario.
 * Orquesta las tres vistas: dashboard, perfil y checkout.
 */
export default function Checkout({
  currentUser,
  initialTransactions = [],
  sorteo,
  sorteosActivos = [],
  tickets = [],
  settings = {},
}) {
  const [currentView, setCurrentView] = useState('dashboard');

  const pageTitles = {
    dashboard: 'Mi Panel | Sorteos CampoAgro',
    profile:   'Mi Perfil | Sorteos CampoAgro',
    checkout:  'Checkout | Sorteos CampoAgro',
  };

  return (
    <AppLayout currentUser={currentUser}>
      <Head title={pageTitles[currentView]} />

      {currentView === 'dashboard' && (
        <DashboardView
          currentUser={currentUser}
          transactions={initialTransactions}
          onBuyClick={() => setCurrentView('checkout')}
          onProfileClick={() => setCurrentView('profile')}
        />
      )}

      {currentView === 'profile' && (
        <ProfileView
          currentUser={currentUser}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'checkout' && (
        <CheckoutView
          currentUser={currentUser}
          sorteo={sorteo}
          sorteosActivos={sorteosActivos}
          tickets={tickets}
          settings={settings}
          onBack={() => setCurrentView('dashboard')}
        />
      )}
    </AppLayout>
  );
}
