import { useState } from 'react';
import { CreditCard, Calendar, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useMySubscription,
  useSubscriptionPlans,
  useSubscriptionHistory,
  useCreateSubscription,
  useCancelSubscription,
} from '@/hooks/useSubscription';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: subscription, isLoading: subLoading } = useMySubscription();
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: history, isLoading: historyLoading } = useSubscriptionHistory();
  const createSubscription = useCreateSubscription();
  const cancelSubscription = useCancelSubscription();

  const handleSelectPlan = async (planId: string) => {
    try {
      const result = await createSubscription.mutateAsync({
        plan: planId,
        billingCycle: 'monthly',
      });
      if (result.initPoint) {
        window.open(result.initPoint, '_blank');
        toast.success('Redirigiendo a Mercado Pago...');
      }
    } catch (error) {
      toast.error('Error al crear la suscripción');
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription.mutateAsync();
      toast.success('Suscripción cancelada exitosamente');
      setCancelDialogOpen(false);
    } catch (error) {
      toast.error('Error al cancelar la suscripción');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      pending: 'secondary',
      cancelled: 'destructive',
      expired: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status === 'active' && 'Activa'}
        {status === 'pending' && 'Pendiente'}
        {status === 'cancelled' && 'Cancelada'}
        {status === 'expired' && 'Expirada'}
      </Badge>
    );
  };

  if (subLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Suscripción</h1>
        <p className="text-muted-foreground">
          Gestiona tu plan y pagos
        </p>
      </div>

      {/* Current Plan */}
      {subscription && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Plan Actual</h2>
              <p className="text-muted-foreground">{subscription.plan}</p>
            </div>
            {getStatusBadge(subscription.status)}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ciclo de facturación</p>
                <p className="font-semibold">
                  {subscription.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Monto</p>
                <p className="font-semibold">${subscription.amount ?? '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Próximo pago</p>
                <p className="font-semibold">
                  {subscription.nextPaymentDate
                    ? new Date(subscription.nextPaymentDate).toLocaleDateString('es-ES')
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {subscription.status === 'active' && (
            <Button
              variant="destructive"
              onClick={() => setCancelDialogOpen(true)}
            >
              Cancelar Suscripción
            </Button>
          )}
        </Card>
      )}

      {/* Plan Comparison */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {subscription ? 'Cambiar Plan' : 'Planes Disponibles'}
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <Card key={plan.id} className="p-6 flex flex-col">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  ${plan.price?.toLocaleString('es-AR')}
                </span>
                <span className="text-muted-foreground">
                  /mes
                </span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features?.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={subscription?.plan === plan.id || subscription?.plan === plan.name}
                className="w-full"
              >
                {subscription?.plan === plan.id || subscription?.plan === plan.name
                  ? 'Plan Actual'
                  : 'Seleccionar'}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment History */}
      {history && history.length > 0 && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Historial de Pagos</h2>
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar suscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu suscripción se cancelará al final del período de facturación actual.
              Seguirás teniendo acceso hasta el {subscription?.nextPaymentDate ? new Date(subscription.nextPaymentDate).toLocaleDateString('es-ES') : 'fin del período actual'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Cancelación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
