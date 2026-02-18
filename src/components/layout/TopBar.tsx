import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/shop': 'Mi Tienda',
  '/products': 'Productos',
  '/orders': 'Pedidos',
  '/reviews': 'Resenas',
  '/subscription': 'Suscripcion',
  '/banners': 'Banners',
  '/promotional': 'Banner Promocional',
  '/support': 'Soporte',
};

export default function TopBar() {
  const location = useLocation();
  const title = titles[location.pathname] || 'Panel de Tienda';

  return (
    <header className="flex h-16 items-center border-b bg-card px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
