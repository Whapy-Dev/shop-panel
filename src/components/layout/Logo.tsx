interface LogoProps {
  collapsed?: boolean;
}

export default function Logo({ collapsed }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo-wallmapu.png" alt="Wallmapu" className="h-8 w-8" />
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-tight">wallmapu</span>
          <span className="text-xs text-sidebar-muted leading-tight">Panel de Tienda</span>
        </div>
      )}
    </div>
  );
}
