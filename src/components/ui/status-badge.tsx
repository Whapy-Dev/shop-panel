import { SubscriptionStatus, TicketStatus, TicketPriority, TicketCategory, UserRole } from "@/lib/data";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: SubscriptionStatus | TicketStatus;
  className?: string;
}

const statusConfig: Record<SubscriptionStatus | TicketStatus, { label: string; className: string }> = {
  confirmed: { label: "Confirmada", className: "bg-status-confirmed/10 text-status-confirmed border-status-confirmed/20" },
  pending: { label: "Pendiente", className: "bg-status-pending/10 text-status-pending border-status-pending/20" },
  cancelled: { label: "Cancelada", className: "bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20" },
  open: { label: "Abierto", className: "bg-status-open/10 text-status-open border-status-open/20" },
  in_progress: { label: "En progreso", className: "bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20" },
  resolved: { label: "Resuelto", className: "bg-status-resolved/10 text-status-resolved border-status-resolved/20" },
  closed: { label: "Cerrado", className: "bg-status-closed/10 text-status-closed border-status-closed/20" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", config.className, className)}>
      {config.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  high: { label: "Alta", className: "bg-priority-high/10 text-priority-high border-priority-high/20" },
  medium: { label: "Media", className: "bg-priority-medium/10 text-priority-medium border-priority-medium/20" },
  low: { label: "Baja", className: "bg-mint-200/50 text-mint-700 border-mint-300/50" },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", config.className, className)}>
      {config.label}
    </span>
  );
}

interface CategoryBadgeProps {
  category: TicketCategory;
  className?: string;
}

const categoryLabels: Record<TicketCategory, string> = {
  billing: "Facturación",
  technical: "Técnico",
  account: "Cuenta",
  general: "General",
  feature_request: "Sugerencia",
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground", className)}>
      {categoryLabels[category]}
    </span>
  );
}

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  client: { label: "Cliente", className: "bg-mint-100 text-mint-700 border-mint-200" },
  retailer: { label: "Minorista", className: "bg-mint-200 text-mint-800 border-mint-300" },
  wholesaler: { label: "Mayorista", className: "bg-mint-300 text-mint-900 border-mint-400" },
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role];
  
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", config.className, className)}>
      {config.label}
    </span>
  );
}
