import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Star,
  CreditCard,
  Image,
  Megaphone,
  LifeBuoy,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Truck,
  ClipboardList,
  Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  wholesalerOnly?: boolean;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Mi Tienda', path: '/shop', icon: Store },
  { label: 'Productos', path: '/products', icon: Package },
  { label: 'Pedidos', path: '/orders', icon: ShoppingCart },
  { label: 'Resenas', path: '/reviews', icon: Star },
  { label: 'Proveedores', path: '/suppliers', icon: Truck },
  { label: 'Ordenes de Compra', path: '/purchase-orders', icon: ClipboardList },
  { label: 'Inventario', path: '/inventory', icon: Warehouse },
  { label: 'Suscripcion', path: '/subscription', icon: CreditCard },
  { label: 'Banners', path: '/banners', icon: Image, wholesalerOnly: true },
  { label: 'Banner Promocional', path: '/promotional', icon: Megaphone, wholesalerOnly: true },
  { label: 'Soporte', path: '/support', icon: LifeBuoy },
  { label: 'Gestionar Planes', path: '/admin/plans', icon: Settings, adminOnly: true },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter((item) => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    if (item.wholesalerOnly && user?.role !== 'wholesaler') return false;
    return true;
  });

  return (
    <aside
      className={cn(
        'flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        <Logo collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1 hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {filteredItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
          const Icon = item.icon;

          const link = (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                collapsed && 'justify-center px-2',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return link;
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent">
            <Store className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-muted truncate">
                {user?.role === 'admin' ? 'Administrador' : user?.role === 'retailer' ? 'Minorista' : 'Mayorista'}
              </p>
            </div>
          )}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className="rounded p-1.5 hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Cerrar sesion</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
