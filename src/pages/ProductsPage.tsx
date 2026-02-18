import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Upload, X, Package } from 'lucide-react';
import { toast } from 'sonner';

import { useMyShop } from '@/hooks/useShop';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { uploadProductImage } from '@/services/supabase';
import { Product, Category } from '@/services/api';

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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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

interface CharacteristicInput {
  name: string;
  value: string;
}

export default function ProductsPage() {
  const { data: shop, isLoading: shopLoading } = useMyShop();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>(
    'all'
  );
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Products query
  const {
    data: productsData,
    isLoading: productsLoading,
    refetch,
  } = useProducts({
    shopId: shop?.id || '',
    page,
    limit,
    search: search || undefined,
    categoryId: selectedSubcategory || selectedParentCategory || undefined,
    includeInactive,
  });

  // Mutations
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogProduct, setDeleteDialogProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    brand: '',
    priceRetail: '',
    priceWholesale: '',
    stock: '',
    categoryId: '',
    isActive: true,
  });
  const [formParentCategory, setFormParentCategory] = useState('');
  const [characteristics, setCharacteristics] = useState<CharacteristicInput[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category helpers - API returns nested { subcategories: [...] } inside each parent
  const parentCategories = useMemo(() => {
    if (!categoriesData?.categories) return [];
    return categoriesData.categories;
  }, [categoriesData]);

  const subcategories = useMemo(() => {
    if (!categoriesData?.categories || !selectedParentCategory) return [];
    const parent = categoriesData.categories.find((c) => c.id === selectedParentCategory);
    return parent?.subcategories || [];
  }, [categoriesData, selectedParentCategory]);

  const formSubcategories = useMemo(() => {
    if (!categoriesData?.categories || !formParentCategory) return [];
    const parent = categoriesData.categories.find((c) => c.id === formParentCategory);
    return parent?.subcategories || [];
  }, [categoriesData, formParentCategory]);

  // Filter products by stock
  const filteredProducts = useMemo(() => {
    if (!productsData?.data) return [];
    if (stockFilter === 'all') return productsData.data;
    if (stockFilter === 'in-stock')
      return productsData.data.filter((p) => p.stock > 0);
    if (stockFilter === 'out-of-stock')
      return productsData.data.filter((p) => p.stock === 0);
    return productsData.data;
  }, [productsData, stockFilter]);

  // Handlers
  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      // Determine parent category: check if categoryId belongs to a subcategory
      const parent = categoriesData?.categories?.find(
        (c) => c.id === product.categoryId || c.subcategories?.some((s) => s.id === product.categoryId)
      );
      if (parent) {
        const isSub = parent.subcategories?.some((s) => s.id === product.categoryId);
        setFormParentCategory(parent.id);
        // If categoryId is the parent itself (no sub selected), keep it
        if (!isSub) setFormData((prev) => ({ ...prev, categoryId: parent.id }));
      }
      setFormData({
        name: product.name,
        sku: product.sku || '',
        barcode: product.barcode || '',
        brand: product.brand || '',
        priceRetail: product.priceRetail.toString(),
        priceWholesale: product.priceWholesale?.toString() || '',
        stock: product.stock.toString(),
        categoryId: product.categoryId,
        isActive: product.isActive,
      });
      setCharacteristics(
        product.characteristics?.map((c) => ({ name: c.name, value: c.value })) ||
          []
      );
      setExistingImages(product.images || []);
      setImageFiles([]);
    } else {
      setEditingProduct(null);
      setFormParentCategory('');
      setFormData({
        name: '',
        sku: '',
        barcode: '',
        brand: '',
        priceRetail: '',
        priceWholesale: '',
        stock: '',
        categoryId: '',
        isActive: true,
      });
      setCharacteristics([]);
      setExistingImages([]);
      setImageFiles([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleAddCharacteristic = () => {
    setCharacteristics([...characteristics, { name: '', value: '' }]);
  };

  const handleRemoveCharacteristic = (index: number) => {
    setCharacteristics(characteristics.filter((_, i) => i !== index));
  };

  const handleCharacteristicChange = (
    index: number,
    field: 'name' | 'value',
    value: string
  ) => {
    const updated = [...characteristics];
    updated[index][field] = value;
    setCharacteristics(updated);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const totalImages = existingImages.length + imageFiles.length + newFiles.length;
    if (totalImages > 5) {
      toast.error('Máximo 5 imágenes permitidas');
      return;
    }
    setImageFiles([...imageFiles, ...newFiles]);
  };

  const handleRemoveNewImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (url: string) => {
    setExistingImages(existingImages.filter((img) => img !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }
    if (!formData.priceRetail || parseFloat(formData.priceRetail) <= 0) {
      toast.error('El precio minorista es obligatorio y debe ser mayor a 0');
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error('El stock es obligatorio y no puede ser negativo');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Debe seleccionar una categoría');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare product data
      const productData: any = {
        name: formData.name.trim(),
        sku: formData.sku.trim() || undefined,
        barcode: formData.barcode.trim() || undefined,
        brand: formData.brand.trim() || undefined,
        priceRetail: parseFloat(formData.priceRetail),
        priceWholesale: formData.priceWholesale
          ? parseFloat(formData.priceWholesale)
          : undefined,
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId,
        isActive: formData.isActive,
        characteristics: characteristics
          .filter((c) => c.name.trim() && c.value.trim())
          .map((c) => ({ name: c.name.trim(), value: c.value.trim() })),
      };

      if (editingProduct) {
        // UPDATE FLOW
        // 1. Upload new images to Supabase if any
        let uploadedImageUrls: string[] = [];
        if (imageFiles.length > 0) {
          toast.info('Subiendo imágenes...');
          uploadedImageUrls = await Promise.all(
            imageFiles.map((file) => uploadProductImage(file, shop.id))
          );
        }

        // 2. Combine existing and new images
        const allImages = [...existingImages, ...uploadedImageUrls];
        productData.images = allImages;

        // 3. Update product
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          data: productData,
        });

        toast.success('Producto actualizado correctamente');
      } else {
        // CREATE FLOW (Two-phase)
        // 1. Create product without images
        const createResult = await createMutation.mutateAsync({
          shopId: shop.id,
          data: productData,
        });

        const newProduct = createResult.product;

        // 2. Upload images to Supabase if any
        if (imageFiles.length > 0) {
          toast.info('Subiendo imágenes...');
          const uploadedImageUrls = await Promise.all(
            imageFiles.map((file) => uploadProductImage(file, shop.id))
          );

          // 3. PATCH product with image URLs
          await updateMutation.mutateAsync({
            id: newProduct.id,
            data: { images: uploadedImageUrls },
          });
        }

        toast.success('Producto creado correctamente');
      }

      handleCloseModal();
      refetch();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogProduct) return;
    try {
      await deleteMutation.mutateAsync(deleteDialogProduct.id);
      toast.success('Producto eliminado correctamente');
      setDeleteDialogProduct(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el producto');
    }
  };

  // Loading state
  if (shopLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // No shop state
  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sin tienda</h2>
            <p className="text-gray-600 mb-4">
              Primero debes crear tu tienda para poder gestionar productos
            </p>
            <Button asChild>
              <Link to="/shop">Crear tienda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Parent Category */}
            <Select
              value={selectedParentCategory || '__all__'}
              onValueChange={(val) => {
                setSelectedParentCategory(val === '__all__' ? '' : val);
                setSelectedSubcategory('');
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoría principal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas las categorías</SelectItem>
                {parentCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Subcategory */}
            <Select
              value={selectedSubcategory || '__all__'}
              onValueChange={(val) => {
                setSelectedSubcategory(val === '__all__' ? '' : val);
                setPage(1);
              }}
              disabled={!selectedParentCategory || subcategories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Subcategoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas las subcategorías</SelectItem>
                {subcategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stock Filter */}
            <Select
              value={stockFilter}
              onValueChange={(val: any) => {
                setStockFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="in-stock">En stock</SelectItem>
                <SelectItem value="out-of-stock">Sin stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include Inactive Toggle */}
          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="include-inactive"
              checked={includeInactive}
              onCheckedChange={(checked) => {
                setIncludeInactive(checked);
                setPage(1);
              }}
            />
            <Label htmlFor="include-inactive">Incluir productos inactivos</Label>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredProducts.length} producto(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imagen</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-gray-600">
                          {product.sku || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>
                              ${Number(product.priceRetail).toFixed(2)}
                              {shop.type === 'retailer' && (
                                <span className="text-xs text-gray-500 ml-1">
                                  (min.)
                                </span>
                              )}
                            </div>
                            {shop.type === 'wholesaler' &&
                              product.priceWholesale && (
                                <div className="text-sm text-gray-600">
                                  ${Number(product.priceWholesale).toFixed(2)}
                                  <span className="text-xs text-gray-500 ml-1">
                                    (may.)
                                  </span>
                                </div>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              product.stock === 0
                                ? 'text-red-600 font-semibold'
                                : product.stock < 10
                                ? 'text-yellow-600 font-semibold'
                                : ''
                            }
                          >
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModal(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteDialogProduct(product)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {productsData?.pagination && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Página {productsData.pagination.page} de{' '}
                    {productsData.pagination.totalPages} ({productsData.pagination.total}{' '}
                    productos en total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= productsData.pagination.totalPages}
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

      {/* Create/Edit Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceRetail">
                  Precio Minorista <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="priceRetail"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.priceRetail}
                  onChange={(e) =>
                    setFormData({ ...formData, priceRetail: e.target.value })
                  }
                  required
                />
              </div>

              {shop.type === 'wholesaler' && (
                <div className="space-y-2">
                  <Label htmlFor="priceWholesale">Precio Mayorista</Label>
                  <Input
                    id="priceWholesale"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.priceWholesale}
                    onChange={(e) =>
                      setFormData({ ...formData, priceWholesale: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="stock">
                  Stock <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Category Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentCategory">
                  Categoría Principal <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formParentCategory}
                  onValueChange={(val) => {
                    setFormParentCategory(val);
                    const parent = categoriesData?.categories?.find((c) => c.id === val);
                    const hasSubs = (parent?.subcategories?.length || 0) > 0;
                    // If no subcategories, set categoryId to parent; otherwise clear so user picks one
                    setFormData({ ...formData, categoryId: hasSubs ? '' : val });
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formSubcategories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">
                    Subcategoría <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(val) =>
                      setFormData({ ...formData, categoryId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar subcategoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {formSubcategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Characteristics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Características</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCharacteristic}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
              {characteristics.map((char, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Nombre"
                    value={char.name}
                    onChange={(e) =>
                      handleCharacteristicChange(index, 'name', e.target.value)
                    }
                  />
                  <Input
                    placeholder="Valor"
                    value={char.value}
                    onChange={(e) =>
                      handleCharacteristicChange(index, 'value', e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveCharacteristic(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Imágenes (máximo 5)</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Click para subir imágenes
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                      disabled={existingImages.length + imageFiles.length >= 5}
                    />
                  </label>
                </div>

                {/* Preview existing images */}
                {existingImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Imágenes actuales:</p>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {existingImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Existing ${index}`}
                            className="h-20 w-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(url)}
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview new images */}
                {imageFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Nuevas imágenes:</p>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${index}`}
                            className="h-20 w-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Producto activo</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Guardando...'
                  : editingProduct
                  ? 'Actualizar'
                  : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteDialogProduct}
        onOpenChange={() => setDeleteDialogProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el producto "
              {deleteDialogProduct?.name}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
