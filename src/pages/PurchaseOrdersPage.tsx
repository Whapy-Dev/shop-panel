import { useState } from 'react';
import {
  Plus,
  Send,
  PackageCheck,
  X,
  Eye,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  usePurchaseOrders,
  useCreatePurchaseOrder,
  useSendPurchaseOrder,
  useReceivePurchaseOrder,
  useCancelPurchaseOrder,
} from '@/hooks/usePurchaseOrders';
import { useSuppliers } from '@/hooks/useSuppliers';
import type { PurchaseOrder, PurchaseOrderItem } from '@/services/api';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  partially_received: 'Parcial',
  received: 'Recibida',
  cancelled: 'Cancelada',
};

const statusColors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  sent: 'default',
  partially_received: 'outline',
  received: 'default',
  cancelled: 'destructive',
};

export default function PurchaseOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const { data, isLoading } = usePurchaseOrders({
    status: statusFilter || undefined,
    page,
    limit: 15,
  });
  const { data: suppliersData } = useSuppliers({ isActive: true, limit: 100 });
  const createMutation = useCreatePurchaseOrder();
  const sendMutation = useSendPurchaseOrder();
  const receiveMutation = useReceivePurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();

  const orders = data?.data || [];
  const pagination = data?.pagination;
  const suppliers = suppliersData?.data || [];

  // Create form state
  const [createForm, setCreateForm] = useState({
    supplierId: '',
    notes: '',
    items: [{ productName: '', quantity: 1, unitCost: 0 }] as { productId?: string; productName: string; quantity: number; unitCost: number }[],
  });

  // Receive form state
  const [receiveItems, setReceiveItems] = useState<{ itemId: string; receivedQuantity: number; name: string; max: number }[]>([]);

  const addItem = () => {
    setCreateForm({
      ...createForm,
      items: [...createForm.items, { productName: '', quantity: 1, unitCost: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (createForm.items.length <= 1) return;
    setCreateForm({
      ...createForm,
      items: createForm.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const items = [...createForm.items];
    items[index] = { ...items[index], [field]: value };
    setCreateForm({ ...createForm, items });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.supplierId) {
      toast.error('Selecciona un proveedor');
      return;
    }
    if (createForm.items.some((i) => !i.productName.trim())) {
      toast.error('Todos los items deben tener nombre');
      return;
    }

    try {
      await createMutation.mutateAsync({
        supplierId: createForm.supplierId,
        notes: createForm.notes || undefined,
        items: createForm.items.map((i) => ({
          ...i,
          productName: i.productName.trim(),
        })),
      });
      toast.success('Orden de compra creada');
      setCreateOpen(false);
      setCreateForm({ supplierId: '', notes: '', items: [{ productName: '', quantity: 1, unitCost: 0 }] });
    } catch (err: any) {
      toast.error(err.message || 'Error al crear orden');
    }
  };

  const handleSend = async (id: string) => {
    try {
      await sendMutation.mutateAsync(id);
      toast.success('Orden enviada');
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar');
    }
  };

  const openReceive = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setReceiveItems(
      po.items.map((item) => ({
        itemId: item.id,
        receivedQuantity: 0,
        name: item.productName,
        max: item.quantity - item.receivedQuantity,
      })),
    );
    setReceiveOpen(true);
  };

  const handleReceive = async () => {
    if (!selectedPO) return;
    const itemsToReceive = receiveItems
      .filter((i) => i.receivedQuantity > 0)
      .map((i) => ({ itemId: i.itemId, receivedQuantity: i.receivedQuantity }));

    if (itemsToReceive.length === 0) {
      toast.error('Indica al menos una cantidad recibida');
      return;
    }

    try {
      const result = await receiveMutation.mutateAsync({ id: selectedPO.id, items: itemsToReceive });
      toast.success(result.message);
      setReceiveOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar recepcion');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('¿Cancelar esta orden de compra?')) return;
    try {
      await cancelMutation.mutateAsync(id);
      toast.success('Orden cancelada');
    } catch (err: any) {
      toast.error(err.message || 'Error al cancelar');
    }
  };

  const openDetail = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setDetailOpen(true);
  };

  const createTotal = createForm.items.reduce((s, i) => s + i.quantity * i.unitCost, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ordenes de Compra</h1>
          <p className="text-gray-600 mt-1">Notas de pedido a tus proveedores</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Orden
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="sent">Enviada</SelectItem>
                <SelectItem value="partially_received">Parcial</SelectItem>
                <SelectItem value="received">Recibida</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay ordenes de compra
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead># Orden</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-mono text-sm">{po.orderNumber}</TableCell>
                      <TableCell>{po.supplierName || '-'}</TableCell>
                      <TableCell>
                        {new Date(po.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[po.status] || 'secondary'}>
                          {statusLabels[po.status] || po.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(po.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openDetail(po)} title="Ver detalle">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {po.status === 'draft' && (
                            <Button variant="ghost" size="icon" onClick={() => handleSend(po.id)} title="Enviar">
                              <Send className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                          {(po.status === 'sent' || po.status === 'partially_received') && (
                            <Button variant="ghost" size="icon" onClick={() => openReceive(po)} title="Recibir">
                              <PackageCheck className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {(po.status === 'draft' || po.status === 'sent') && (
                            <Button variant="ghost" size="icon" onClick={() => handleCancel(po.id)} title="Cancelar">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-500">
                    Pagina {pagination.page} de {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create PO Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Compra</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Proveedor *</Label>
              <Select value={createForm.supplierId} onValueChange={(v) => setCreateForm({ ...createForm, supplierId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notas</Label>
              <Textarea
                value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={2}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-3 w-3 mr-1" /> Agregar
                </Button>
              </div>
              <div className="space-y-3">
                {createForm.items.map((item, index) => (
                  <div key={index} className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Label className="text-xs">Producto</Label>
                      <Input
                        value={item.productName}
                        onChange={(e) => updateItem(index, 'productName', e.target.value)}
                        placeholder="Nombre del producto"
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">Cantidad</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="w-32">
                      <Label className="text-xs">Costo unitario</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-28 text-right text-sm font-medium pt-5">
                      {formatCurrency(item.quantity * item.unitCost)}
                    </div>
                    {createForm.items.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-right font-bold mt-2">
                Total: {formatCurrency(createTotal)}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Crear Orden
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Orden {selectedPO?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Proveedor:</span> {selectedPO.supplierName}</div>
                <div><span className="text-gray-500">Estado:</span> <Badge variant={statusColors[selectedPO.status]}>{statusLabels[selectedPO.status]}</Badge></div>
                <div><span className="text-gray-500">Fecha:</span> {new Date(selectedPO.createdAt).toLocaleDateString('es-AR')}</div>
                <div><span className="text-gray-500">Total:</span> {formatCurrency(selectedPO.totalAmount)}</div>
              </div>
              {selectedPO.notes && (
                <div className="text-sm"><span className="text-gray-500">Notas:</span> {selectedPO.notes}</div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Recibido</TableHead>
                    <TableHead className="text-right">Costo unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPO.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.receivedQuantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receive Dialog */}
      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Recibir Mercaderia - {selectedPO?.orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Indica la cantidad recibida de cada item. Si un producto esta vinculado a tu inventario, el stock se actualizara automaticamente.
            </p>
            {receiveItems.map((item, index) => (
              <div key={item.itemId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">Pendiente: {item.max} unidades</p>
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    min={0}
                    max={item.max}
                    value={item.receivedQuantity}
                    onChange={(e) => {
                      const val = Math.min(parseInt(e.target.value) || 0, item.max);
                      const updated = [...receiveItems];
                      updated[index] = { ...updated[index], receivedQuantity: val };
                      setReceiveItems(updated);
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setReceiveOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleReceive} disabled={receiveMutation.isPending}>
                Confirmar Recepcion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
