import { useState } from 'react';
import { format } from 'date-fns';
import {
  Search,
  Eye,
  ShoppingCart,
  Truck,
  Package,
  X,
} from 'lucide-react';
import { useShopOrders, useUpdateFulfillment } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type FulfillmentStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'pending_whatsapp' | 'paid' | 'failed' | 'cancelled';

interface ShopOrder {
  id: string;
  status: string;
  fulfillmentStatus: string;
  deliveryType?: string;
  paymentMethod?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryProvince?: string;
  deliveryBarrio?: string;
  notes?: string;
  shopSubtotal: number;
  totalAmount: number;
  buyer?: { id: string; name: string; email: string; phone?: string };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

const TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'ready', 'shipped', 'delivered', 'cancelled'],
  preparing: ['ready', 'shipped', 'delivered', 'cancelled'],
  ready: ['shipped', 'delivered', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const FULFILLMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  pending_whatsapp: 'Pendiente (WhatsApp)',
  paid: 'Pagado',
  failed: 'Fallido',
  cancelled: 'Cancelado',
};

const getFulfillmentBadgeVariant = (status: string) => {
  const variants: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    confirmed: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    preparing: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
    ready: 'bg-green-100 text-green-800 hover:bg-green-100',
    shipped: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    delivered: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    cancelled: 'bg-red-100 text-red-800 hover:bg-red-100',
  };
  return variants[status];
};

const getPaymentBadgeVariant = (status: string) => {
  const variants: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    pending_whatsapp: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    paid: 'bg-green-100 text-green-800 hover:bg-green-100',
    failed: 'bg-red-100 text-red-800 hover:bg-red-100',
    cancelled: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  };
  return variants[status];
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(value);
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [newFulfillmentStatus, setNewFulfillmentStatus] = useState<string | null>(null);

  const limit = 10;

  const { data, isLoading, error } = useShopOrders({
    page,
    limit,
    search: searchTerm || undefined,
    fulfillmentStatus: fulfillmentFilter !== 'all' ? fulfillmentFilter : undefined,
    status: paymentFilter !== 'all' ? paymentFilter : undefined,
  });

  const updateFulfillmentMutation = useUpdateFulfillment();

  const handleResetFilters = () => {
    setSearchTerm('');
    setFulfillmentFilter('all');
    setPaymentFilter('all');
    setPage(1);
  };

  const handleViewOrder = (order: ShopOrder) => {
    setSelectedOrder(order);
    setNewFulfillmentStatus(order.fulfillmentStatus);
  };

  const handleQuickAdvance = async (order: ShopOrder) => {
    const quickMap: Record<string, string> = {
      pending: 'confirmed',
      confirmed: 'delivered',
      preparing: 'delivered',
      ready: 'delivered',
      shipped: 'delivered',
    };
    const nextStatus = quickMap[order.fulfillmentStatus];
    if (!nextStatus) return;
    try {
      await updateFulfillmentMutation.mutateAsync({
        orderId: order.id,
        fulfillmentStatus: nextStatus,
      });
      toast.success(`Pedido actualizado a: ${FULFILLMENT_STATUS_LABELS[nextStatus]}`);
    } catch {
      toast.error('Error al actualizar el pedido');
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setNewFulfillmentStatus(null);
  };

  const handleUpdateFulfillment = async () => {
    if (!selectedOrder || !newFulfillmentStatus) return;

    try {
      await updateFulfillmentMutation.mutateAsync({
        orderId: selectedOrder.id,
        fulfillmentStatus: newFulfillmentStatus,
      });
      toast.success('Estado de cumplimiento actualizado correctamente');
      handleCloseModal();
    } catch (err) {
      toast.error('Error al actualizar el estado de cumplimiento');
    }
  };

  const allowedTransitions = selectedOrder
    ? TRANSITIONS[selectedOrder.fulfillmentStatus]
    : [];

  const canUpdateFulfillment =
    selectedOrder &&
    newFulfillmentStatus &&
    newFulfillmentStatus !== selectedOrder.fulfillmentStatus &&
    allowedTransitions.includes(newFulfillmentStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">
            Administra los pedidos de tu tienda
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por comprador o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado de cumplimiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="preparing">Preparando</SelectItem>
                <SelectItem value="ready">Listo</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="pending_whatsapp">Pendiente (WhatsApp)</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleResetFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando pedidos...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error al cargar los pedidos
            </div>
          ) : !data?.data?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron pedidos
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pedido</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Subtotal Tienda</TableHead>
                    <TableHead>Estado Pago</TableHead>
                    <TableHead>Estado Cumplimiento</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>{order.buyer?.name || 'Sin nombre'}</TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(order.shopSubtotal)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentBadgeVariant(order.status)}>
                          {PAYMENT_STATUS_LABELS[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getFulfillmentBadgeVariant(order.fulfillmentStatus)}>
                          {FULFILLMENT_STATUS_LABELS[order.fulfillmentStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {order.fulfillmentStatus === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleQuickAdvance(order)}
                              disabled={updateFulfillmentMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Confirmar
                            </Button>
                          )}
                          {['confirmed', 'preparing', 'ready', 'shipped'].includes(order.fulfillmentStatus) && (
                            <Button
                              size="sm"
                              onClick={() => handleQuickAdvance(order)}
                              disabled={updateFulfillmentMutation.isPending}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              Entregado
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {data.data.length} de {data.pagination?.total || 0} pedidos
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= (data.pagination?.totalPages || 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detalle del Pedido
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Información del Comprador</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Nombre:</span>{' '}
                      {selectedOrder.buyer?.name || 'Sin nombre'}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Email:</span>{' '}
                      {selectedOrder.buyer?.email || '-'}
                    </p>
                    {selectedOrder.buyer?.phone && (
                      <p>
                        <span className="text-muted-foreground">Teléfono:</span>{' '}
                        {selectedOrder.buyer.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Información de Entrega
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Tipo:</span>{' '}
                      {selectedOrder.deliveryType}
                    </p>
                    {selectedOrder.deliveryAddress && (
                      <>
                        <p>
                          <span className="text-muted-foreground">Dirección:</span>{' '}
                          {selectedOrder.deliveryAddress}
                        </p>
                        {selectedOrder.deliveryBarrio && (
                          <p>
                            <span className="text-muted-foreground">Barrio:</span>{' '}
                            {selectedOrder.deliveryBarrio}
                          </p>
                        )}
                        {selectedOrder.deliveryCity && (
                          <p>
                            <span className="text-muted-foreground">Ciudad:</span>{' '}
                            {selectedOrder.deliveryCity}
                          </p>
                        )}
                        {selectedOrder.deliveryProvince && (
                          <p>
                            <span className="text-muted-foreground">Provincia:</span>{' '}
                            {selectedOrder.deliveryProvince}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Información de Pago</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Método:</span>{' '}
                    {selectedOrder.paymentMethod}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Estado:</span>{' '}
                    <Badge className={getPaymentBadgeVariant(selectedOrder.status)}>
                      {PAYMENT_STATUS_LABELS[selectedOrder.status]}
                    </Badge>
                  </p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notas</h3>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Productos</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-semibold">
                        Subtotal Tienda:
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {formatCurrency(selectedOrder.shopSubtotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Actualizar Estado de Cumplimiento</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Select
                      value={newFulfillmentStatus || ''}
                      onValueChange={(value) => setNewFulfillmentStatus(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={selectedOrder.fulfillmentStatus}>
                          {FULFILLMENT_STATUS_LABELS[selectedOrder.fulfillmentStatus]} (actual)
                        </SelectItem>
                        {allowedTransitions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {FULFILLMENT_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleUpdateFulfillment}
                    disabled={!canUpdateFulfillment || updateFulfillmentMutation.isPending}
                  >
                    {updateFulfillmentMutation.isPending ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                </div>
                {allowedTransitions.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    No hay transiciones disponibles desde el estado actual.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
