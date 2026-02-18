import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useMyShop, useUpdatePromotionalBanner } from '@/hooks/useShop';
import { uploadShopImage } from '@/services/supabase';
import { toast } from 'sonner';

export default function PromotionalBannerPage() {
  const { user } = useAuth();
  const { data: shop, isLoading } = useMyShop();
  const updateBanner = useUpdatePromotionalBanner();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Initialize form with existing banner data
  useEffect(() => {
    if (shop?.promotionalBanner) {
      setTitle(shop.promotionalBanner.title || '');
      setSubtitle(shop.promotionalBanner.subtitle || '');
      setIsActive(shop.promotionalBanner.isActive || false);
      setImagePreview(shop.promotionalBanner.imageUrl || null);
    }
  }, [shop]);

  // Check if user is wholesaler
  if (user?.role !== 'wholesaler' && shop?.type !== 'wholesaler') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Esta sección es solo para mayoristas
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUploading(true);

      let imageUrl = shop?.promotionalBanner?.imageUrl || '';

      // Upload new image if selected
      if (imageFile && shop) {
        imageUrl = await uploadShopImage(imageFile, shop.id, 'banner');
      }

      // Update promotional banner
      if (!shop) return;
      await updateBanner.mutateAsync({
        id: shop.id,
        data: { title, subtitle, imageUrl, isActive },
      });

      toast.success('Banner promocional actualizado exitosamente');
      setImageFile(null);
    } catch (error) {
      console.error('Error updating promotional banner:', error);
      toast.error('Error al actualizar el banner');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Banner Promocional</h1>
        <p className="text-muted-foreground">
          Crea un banner destacado para tu tienda
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label htmlFor="image">Imagen del Banner</Label>
            <div className="mt-2">
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click para subir</span> o arrastra aquí
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP (recomendado: 1200x400px)
                    </p>
                  </div>
                )}
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: ¡Ofertas Especiales!"
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ej: Hasta 50% de descuento en productos seleccionados"
              required
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Banner Activo</Label>
              <p className="text-sm text-muted-foreground">
                El banner se mostrará en tu página de tienda
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <Button type="submit" disabled={uploading}>
            {uploading ? 'Guardando...' : 'Guardar Banner'}
          </Button>
        </form>
      </Card>

      {/* Preview */}
      {(imagePreview || title || subtitle) && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Vista Previa</h2>
          <div className="rounded-lg overflow-hidden border bg-gradient-to-r from-primary/10 to-primary/5">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Banner preview"
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              {title && (
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
              )}
              {subtitle && (
                <p className="text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {!isActive && (
            <p className="text-sm text-muted-foreground mt-2">
              El banner está inactivo y no se mostrará a los usuarios
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
