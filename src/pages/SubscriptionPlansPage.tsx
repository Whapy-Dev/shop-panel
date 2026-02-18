import { useState } from 'react';
import { toast } from 'sonner';
import {
  useSubscriptionPlans,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  useSeedSubscriptionPlans,
} from '@/hooks/useSubscriptionPlans';
import { SubscriptionPlanAdmin } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Database, Loader2 } from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  slug: '',
  targetRole: 'retailer',
  price: '',
  semestralPrice: '',
  semestralInstallmentPrice: '',
  description: '',
  maxProducts: '50',
  maxImages: '5',
  hasAnalytics: false,
  hasBanners: false,
  hasHighlight: false,
  hasSearchPriority: false,
  recommended: false,
  isActive: true,
  displayOrder: '0',
  features: '',
};

type FormState = typeof EMPTY_FORM;

export default function SubscriptionPlansPage() {
  const { data: plans, isLoading } = useSubscriptionPlans();
  const createMutation = useCreateSubscriptionPlan();
  const updateMutation = useUpdateSubscriptionPlan();
  const deleteMutation = useDeleteSubscriptionPlan();
  const seedMutation = useSeedSubscriptionPlans();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanAdmin | null>(null);
  const [deleteDialogPlan, setDeleteDialogPlan] = useState<SubscriptionPlanAdmin | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (plan: SubscriptionPlanAdmin) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      targetRole: plan.targetRole,
      price: String(plan.price),
      semestralPrice: plan.semestralPrice ? String(plan.semestralPrice) : '',
      semestralInstallmentPrice: plan.semestralInstallmentPrice ? String(plan.semestralInstallmentPrice) : '',
      description: plan.description || '',
      maxProducts: String(plan.maxProducts),
      maxImages: String(plan.maxImages),
      hasAnalytics: plan.hasAnalytics,
      hasBanners: plan.hasBanners,
      hasHighlight: plan.hasHighlight,
      hasSearchPriority: plan.hasSearchPriority,
      recommended: plan.recommended,
      isActive: plan.isActive,
      displayOrder: String(plan.displayOrder),
      features: plan.features.join('\n'),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.slug || !form.price) {
      toast.error('Nombre, slug y precio son requeridos');
      return;
    }

    const data: Partial<SubscriptionPlanAdmin> = {
      name: form.name,
      slug: form.slug,
      targetRole: form.targetRole,
      price: Number(form.price),
      semestralPrice: form.semestralPrice ? Number(form.semestralPrice) : undefined,
      semestralInstallmentPrice: form.semestralInstallmentPrice ? Number(form.semestralInstallmentPrice) : undefined,
      description: form.description || undefined,
      maxProducts: Number(form.maxProducts),
      maxImages: Number(form.maxImages),
      hasAnalytics: form.hasAnalytics,
      hasBanners: form.hasBanners,
      hasHighlight: form.hasHighlight,
      hasSearchPriority: form.hasSearchPriority,
      recommended: form.recommended,
      isActive: form.isActive,
      displayOrder: Number(form.displayOrder),
      features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
    };

    try {
      if (editingPlan) {
        await updateMutation.mutateAsync({ id: editingPlan.id, data });
        toast.success('Plan actualizado');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Plan creado');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el plan');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogPlan) return;
    try {
      await deleteMutation.mutateAsync(deleteDialogPlan.id);
      toast.success('Plan eliminado');
      setDeleteDialogPlan(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el plan');
    }
  };

  const handleSeed = async () => {
    try {
      await seedMutation.mutateAsync();
      toast.success('Planes iniciales creados');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear planes iniciales');
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planes de Suscripcion</h1>
          <p className="text-sm text-gray-500">Gestiona los planes disponibles para minoristas y mayoristas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeed} disabled={seedMutation.isPending}>
            {seedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Seed Inicial
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Plan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planes Activos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !plans || plans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay planes configurados.</p>
              <p className="text-sm mt-1">Usa "Seed Inicial" para crear los planes base o crea uno nuevo.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Semestral</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {plan.name}
                      {plan.recommended && (
                        <Badge variant="secondary" className="ml-2 text-xs">Recomendado</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{plan.slug}</TableCell>
                    <TableCell>
                      <Badge variant={plan.targetRole === 'wholesaler' ? 'default' : 'outline'}>
                        {plan.targetRole === 'wholesaler' ? 'Mayorista' : 'Minorista'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number(plan.price).toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {plan.semestralPrice ? `$${Number(plan.semestralPrice).toLocaleString('es-AR')}` : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {plan.features.length} items
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.isActive ? 'default' : 'destructive'}>
                        {plan.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => openEdit(plan)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteDialogPlan(plan)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Plan Basico" />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Ej: basico-retailer" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rol Objetivo</Label>
                <Select value={form.targetRole} onValueChange={v => setForm({ ...form, targetRole: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retailer">Minorista</SelectItem>
                    <SelectItem value="wholesaler">Mayorista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Orden de Display</Label>
                <Input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>Descripcion</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descripcion corta del plan" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Precio Mensual * (ARS)</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="35000" />
              </div>
              <div>
                <Label>Precio Semestral (ARS)</Label>
                <Input type="number" value={form.semestralPrice} onChange={e => setForm({ ...form, semestralPrice: e.target.value })} placeholder="105000" />
              </div>
              <div>
                <Label>Semestral en Cuotas (ARS)</Label>
                <Input type="number" value={form.semestralInstallmentPrice} onChange={e => setForm({ ...form, semestralInstallmentPrice: e.target.value })} placeholder="120000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Productos</Label>
                <Input type="number" value={form.maxProducts} onChange={e => setForm({ ...form, maxProducts: e.target.value })} />
              </div>
              <div>
                <Label>Max Imagenes por Producto</Label>
                <Input type="number" value={form.maxImages} onChange={e => setForm({ ...form, maxImages: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>Features (una por linea)</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.features}
                onChange={e => setForm({ ...form, features: e.target.value })}
                placeholder={"Catalogo de productos\nPresencia en el mapa\nCodigo unico de tienda"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Estadisticas avanzadas</Label>
                <Switch checked={form.hasAnalytics} onCheckedChange={v => setForm({ ...form, hasAnalytics: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Banners</Label>
                <Switch checked={form.hasBanners} onCheckedChange={v => setForm({ ...form, hasBanners: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Destacado en mapa</Label>
                <Switch checked={form.hasHighlight} onCheckedChange={v => setForm({ ...form, hasHighlight: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Prioridad en busquedas</Label>
                <Switch checked={form.hasSearchPriority} onCheckedChange={v => setForm({ ...form, hasSearchPriority: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Recomendado</Label>
                <Switch checked={form.recommended} onCheckedChange={v => setForm({ ...form, recommended: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Activo</Label>
                <Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingPlan ? 'Guardar Cambios' : 'Crear Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialogPlan} onOpenChange={() => setDeleteDialogPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro que deseas eliminar el plan "{deleteDialogPlan?.name}"? Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
