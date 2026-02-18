import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Link2,
  User,
  X,
  Store,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from '@/hooks/useSuppliers';
import type { Supplier, Shop } from '@/services/api';
import { shopAPI } from '@/services/api';

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data, isLoading } = useSuppliers({ search: search || undefined, page, limit: 15 });
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const suppliers = data?.data || [];
  const pagination = data?.pagination;

  const [form, setForm] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    linkedShopId: '',
  });

  // Shop search state
  const [shopSearch, setShopSearch] = useState('');
  const [shopResults, setShopResults] = useState<Shop[]>([]);
  const [shopSearching, setShopSearching] = useState(false);
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [selectedShopName, setSelectedShopName] = useState('');
  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const shopSearchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const searchWholesalers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setShopResults([]);
      return;
    }
    setShopSearching(true);
    try {
      const res = await shopAPI.searchWholesalers(query);
      setShopResults(res.data || []);
    } catch {
      setShopResults([]);
    } finally {
      setShopSearching(false);
    }
  }, []);

  const handleShopSearchChange = (value: string) => {
    setShopSearch(value);
    setShowShopDropdown(true);
    if (shopSearchTimeout.current) clearTimeout(shopSearchTimeout.current);
    shopSearchTimeout.current = setTimeout(() => searchWholesalers(value), 300);
  };

  const selectShop = (shop: Shop) => {
    setForm({ ...form, linkedShopId: shop.id });
    setSelectedShopName(shop.name);
    setShopSearch('');
    setShowShopDropdown(false);
    setShopResults([]);
  };

  const clearLinkedShop = () => {
    setForm({ ...form, linkedShopId: '' });
    setSelectedShopName('');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.target as Node)) {
        setShowShopDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openCreate = () => {
    setEditingSupplier(null);
    setForm({ name: '', contactName: '', phone: '', email: '', address: '', notes: '', linkedShopId: '' });
    setSelectedShopName('');
    setShopSearch('');
    setShopResults([]);
    setDialogOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setForm({
      name: s.name,
      contactName: s.contactName || '',
      phone: s.phone || '',
      email: s.email || '',
      address: s.address || '',
      notes: s.notes || '',
      linkedShopId: s.linkedShopId || '',
    });
    setSelectedShopName(s.linkedShopName || '');
    setShopSearch('');
    setShopResults([]);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    const payload = {
      name: form.name.trim(),
      contactName: form.contactName.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      notes: form.notes.trim() || undefined,
      linkedShopId: form.linkedShopId.trim() || undefined,
    };

    try {
      if (editingSupplier) {
        await updateMutation.mutateAsync({ id: editingSupplier.id, data: payload });
        toast.success('Proveedor actualizado');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Proveedor creado');
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar proveedor');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Desactivar al proveedor "${name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Proveedor desactivado');
    } catch (err: any) {
      toast.error(err.message || 'Error al desactivar');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proveedores</h1>
          <p className="text-gray-600 mt-1">Gestiona tus proveedores externos y mayoristas Wallmapu</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar proveedor..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay proveedores registrados
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Telefono</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.contactName || '-'}</TableCell>
                      <TableCell>{s.phone || '-'}</TableCell>
                      <TableCell>
                        {s.linkedShopId ? (
                          <Badge variant="default" className="gap-1">
                            <Link2 className="h-3 w-3" />
                            Wallmapu
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <User className="h-3 w-3" />
                            Externo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.isActive ? 'default' : 'secondary'}>
                          {s.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {s.isActive && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id, s.name)}>
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
                    Pagina {pagination.page} de {pagination.totalPages} ({pagination.total} proveedores)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre del proveedor"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contacto</Label>
                <Input
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="Nombre del contacto"
                />
              </div>
              <div>
                <Label>Telefono</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+54 ..."
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@proveedor.com"
              />
            </div>
            <div>
              <Label>Direccion</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Direccion del proveedor"
              />
            </div>
            <div>
              <Label>Vincular Mayorista Wallmapu (opcional)</Label>
              {form.linkedShopId ? (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-green-50 border-green-200">
                  <Store className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm font-medium text-green-800 flex-1 truncate">
                    {selectedShopName || form.linkedShopId}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={clearLinkedShop}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="relative" ref={shopDropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={shopSearch}
                      onChange={(e) => handleShopSearchChange(e.target.value)}
                      onFocus={() => shopSearch && setShowShopDropdown(true)}
                      placeholder="Buscar mayorista por nombre..."
                      className="pl-10"
                    />
                  </div>
                  {showShopDropdown && shopSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {shopSearching ? (
                        <div className="p-3 text-sm text-gray-500 text-center">Buscando...</div>
                      ) : shopResults.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">
                          No se encontraron mayoristas
                        </div>
                      ) : (
                        shopResults.map((shop) => (
                          <button
                            key={shop.id}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                            onClick={() => selectShop(shop)}
                          >
                            <Store className="h-4 w-4 text-gray-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{shop.name}</p>
                              {shop.city && (
                                <p className="text-xs text-gray-500 truncate">
                                  {shop.city}{shop.province ? `, ${shop.province}` : ''}
                                </p>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Busca un mayorista registrado en Wallmapu para vincularlo
              </p>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingSupplier ? 'Guardar Cambios' : 'Crear Proveedor'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
