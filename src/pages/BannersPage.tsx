import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useMyShop } from '@/hooks/useShop';
import { useMyBannerRequest, useRequestBanner } from '@/hooks/useBanners';
import { uploadBannerImage } from '@/services/supabase';
import { toast } from 'sonner';

export default function BannersPage() {
  const { user } = useAuth();
  const { data: shop } = useMyShop();
  const { data: bannerRequest, isLoading, error } = useMyBannerRequest();
  const requestBanner = useRequestBanner();

  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Check if user is wholesaler (block if neither role nor shop type is wholesaler)
  if (user?.role !== 'wholesaler' && user?.role !== 'retailer' && shop?.type !== 'wholesaler' && shop?.type !== 'retailer') {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen');
        return;
      }
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error('Debes seleccionar una imagen');
      return;
    }

    try {
      setUploading(true);

      // Upload image to Supabase
      const imageUrl = await uploadBannerImage(imageFile, shop?.id || '');

      // Submit banner request
      await requestBanner.mutateAsync({
        title: title || undefined,
        imageUrl,
      });

      toast.success('Solicitud de banner enviada exitosamente');
      setTitle('');
      setImageFile(null);
    } catch (error) {
      console.error('Error submitting banner request:', error);
      toast.error('Error al enviar la solicitud');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pendiente' },
      active: { variant: 'default', label: 'Activo' },
      rejected: { variant: 'destructive', label: 'Rechazado' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show request form if no banner exists (404 error)
  const hasBanner = bannerRequest && !error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Banners Publicitarios</h1>
        <p className="text-muted-foreground">
          Solicita un banner para promocionar tu tienda
        </p>
      </div>

      {!hasBanner ? (
        // Request Form
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Solicitar Banner</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del banner"
              />
            </div>

            <div>
              <Label htmlFor="image">Imagen del Banner</Label>
              <div className="mt-2">
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
                >
                  {imageFile ? (
                    <div className="relative w-full h-full">
                      <img
                        src={URL.createObjectURL(imageFile)}
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

            <Button type="submit" disabled={uploading || !imageFile}>
              {uploading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </form>
        </Card>
      ) : (
        // Status Card
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold">Estado de la Solicitud</h2>
            {getStatusBadge(bannerRequest.status)}
          </div>

          <div className="space-y-4">
            {bannerRequest.imageUrl && (
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={bannerRequest.imageUrl}
                  alt="Banner"
                  className="w-full h-auto"
                />
              </div>
            )}

            {bannerRequest.title && (
              <div>
                <Label>Título</Label>
                <p className="mt-1">{bannerRequest.title}</p>
              </div>
            )}

            {bannerRequest.status === 'rejected' && bannerRequest.rejectionReason && (
              <div>
                <Label className="text-destructive">Motivo del Rechazo</Label>
                <p className="mt-1 text-muted-foreground">
                  {bannerRequest.rejectionReason}
                </p>
              </div>
            )}

            {bannerRequest.status === 'pending' && (
              <p className="text-sm text-muted-foreground">
                Tu solicitud está siendo revisada por un administrador.
              </p>
            )}

            {bannerRequest.status === 'active' && (
              <p className="text-sm text-green-600">
                ¡Tu banner está activo y visible para los usuarios!
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
