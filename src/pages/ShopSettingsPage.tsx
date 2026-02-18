import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useMyShop, useCreateShop, useUpdateShop } from '@/hooks/useShop';
import { uploadShopImage } from '@/services/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload, Plus, Trash2, Star, Pencil } from 'lucide-react';
import LocationPicker, { type LocationPickerValue } from '@/components/LocationPicker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

type DaySchedule = {
  active: boolean;
  shifts: Array<{ open: string; close: string }>;
};

type WeekSchedule = {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
};

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

const defaultDaySchedule: DaySchedule = {
  active: false,
  shifts: [
    { open: '09:00', close: '18:00' },
  ],
};

export default function ShopSettingsPage() {
  const { data: shop, isLoading } = useMyShop();
  const createShop = useCreateShop();
  const updateShop = useUpdateShop();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!shop) {
    return <CreateShopForm onSuccess={() => {}} />;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Configuración del Comercio</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="schedule">Horarios</TabsTrigger>
          <TabsTrigger value="fiscal">Datos Fiscales</TabsTrigger>
          <TabsTrigger value="banking">Datos Bancarios</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab shop={shop} />
        </TabsContent>

        <TabsContent value="schedule">
          <ScheduleTab shop={shop} />
        </TabsContent>

        <TabsContent value="fiscal">
          <FiscalTab shop={shop} />
        </TabsContent>

        <TabsContent value="banking">
          <BankingTab shop={shop} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Create Shop Form Component
function CreateShopForm({ onSuccess }: { onSuccess: () => void }) {
  const createShop = useCreateShop();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: '',
      address: '',
      phone: '',
      latitude: 0,
      longitude: 0,
      province: '',
      city: '',
      postalCode: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await createShop.mutateAsync(data);
      toast.success('Comercio creado exitosamente');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear el comercio');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Crear Comercio</CardTitle>
          <CardDescription>
            Completa la información básica para crear tu comercio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Comercio</Label>
              <Input
                id="name"
                {...register('name', { required: 'El nombre es requerido' })}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                {...register('category', { required: 'La categoría es requerida' })}
              />
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.category.message as string}
                </p>
              )}
            </div>

            <div>
              <Label>Ubicación</Label>
              <LocationPicker
                value={{
                  address: watch('address'),
                  latitude: watch('latitude'),
                  longitude: watch('longitude'),
                  province: watch('province'),
                  city: watch('city'),
                  postalCode: watch('postalCode'),
                }}
                onChange={(loc: LocationPickerValue) => {
                  const opts = { shouldDirty: true } as const;
                  setValue('address', loc.address, opts);
                  setValue('latitude', loc.latitude, opts);
                  setValue('longitude', loc.longitude, opts);
                  setValue('province', loc.province, opts);
                  setValue('city', loc.city, opts);
                  setValue('postalCode', loc.postalCode, opts);
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="create-province">Provincia</Label>
                <Input id="create-province" {...register('province')} />
              </div>
              <div>
                <Label htmlFor="create-city">Ciudad</Label>
                <Input id="create-city" {...register('city')} />
              </div>
              <div>
                <Label htmlFor="create-postalCode">Código Postal</Label>
                <Input id="create-postalCode" {...register('postalCode')} />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createShop.isPending}
            >
              {createShop.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Crear Comercio
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// General Tab Component
function GeneralTab({ shop }: { shop: any }) {
  const updateShop = useUpdateShop();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: shop.name || '',
      description: shop.description || '',
      address: shop.address || '',
      latitude: shop.latitude || 0,
      longitude: shop.longitude || 0,
      province: shop.province || '',
      city: shop.city || '',
      postalCode: shop.postalCode || '',
      phone: shop.phone || '',
      email: shop.email || '',
      website: shop.website || '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      // Strip empty strings → undefined so backend @IsOptional() skips validation
      const cleaned = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === '' ? undefined : v])
      );
      await updateShop.mutateAsync({ id: shop.id, data: cleaned });
      toast.success('Información actualizada exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    try {
      setUploading(true);
      const url = await uploadShopImage(file, shop.id, type);
      await updateShop.mutateAsync({
        id: shop.id,
        data: { [type]: url },
      });
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} actualizado exitosamente`);
      if (type === 'logo') setLogoFile(null);
      else setBannerFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información General</CardTitle>
        <CardDescription>
          Actualiza la información básica de tu comercio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div>
          <Label>Logo del Comercio</Label>
          <div className="flex items-center gap-4 mt-2">
            {shop.logo && (
              <img
                src={shop.logo}
                alt="Logo"
                className="w-20 h-20 object-cover rounded-lg border"
              />
            )}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setLogoFile(file);
                }}
              />
              {logoFile && (
                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleImageUpload(logoFile, 'logo')}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Subir Logo
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Banner Upload */}
        <div>
          <Label>Banner del Comercio</Label>
          <div className="flex items-center gap-4 mt-2">
            {shop.banner && (
              <img
                src={shop.banner}
                alt="Banner"
                className="w-40 h-20 object-cover rounded-lg border"
              />
            )}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setBannerFile(file);
                }}
              />
              {bannerFile && (
                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleImageUpload(bannerFile, 'banner')}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Subir Banner
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del Comercio</Label>
              <Input
                id="name"
                {...register('name', { required: 'El nombre es requerido' })}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" type="tel" {...register('phone')} />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>

          <div>
            <Label>Ubicación</Label>
            <LocationPicker
              value={{
                address: watch('address'),
                latitude: watch('latitude'),
                longitude: watch('longitude'),
                province: watch('province'),
                city: watch('city'),
                postalCode: watch('postalCode'),
              }}
              onChange={(loc: LocationPickerValue) => {
                const opts = { shouldDirty: true } as const;
                setValue('address', loc.address, opts);
                setValue('latitude', loc.latitude, opts);
                setValue('longitude', loc.longitude, opts);
                setValue('province', loc.province, opts);
                setValue('city', loc.city, opts);
                setValue('postalCode', loc.postalCode, opts);
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="province">Provincia</Label>
              <Input id="province" {...register('province')} />
            </div>

            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" {...register('city')} />
            </div>

            <div>
              <Label htmlFor="postalCode">Código Postal</Label>
              <Input id="postalCode" {...register('postalCode')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
            </div>

            <div>
              <Label htmlFor="website">Sitio Web</Label>
              <Input id="website" type="url" {...register('website')} />
            </div>
          </div>

          <Button type="submit" disabled={updateShop.isPending}>
            {updateShop.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Guardar Cambios
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Schedule Tab Component
function ScheduleTab({ shop }: { shop: any }) {
  const updateShop = useUpdateShop();
  const [schedule, setSchedule] = useState<WeekSchedule>(() => {
    const defaults: WeekSchedule = {
      monday: { ...defaultDaySchedule, shifts: [...defaultDaySchedule.shifts.map(s => ({ ...s }))] },
      tuesday: { ...defaultDaySchedule, shifts: [...defaultDaySchedule.shifts.map(s => ({ ...s }))] },
      wednesday: { ...defaultDaySchedule, shifts: [...defaultDaySchedule.shifts.map(s => ({ ...s }))] },
      thursday: { ...defaultDaySchedule, shifts: [...defaultDaySchedule.shifts.map(s => ({ ...s }))] },
      friday: { ...defaultDaySchedule, shifts: [...defaultDaySchedule.shifts.map(s => ({ ...s }))] },
      saturday: { ...defaultDaySchedule, shifts: [...defaultDaySchedule.shifts.map(s => ({ ...s }))] },
      sunday: { ...defaultDaySchedule, shifts: [...defaultDaySchedule.shifts.map(s => ({ ...s }))] },
    };
    if (!shop.schedule || typeof shop.schedule !== 'object') return defaults;
    // Merge each day with defaults to handle partial schedule objects
    for (const day of Object.keys(defaults) as Array<keyof WeekSchedule>) {
      if (shop.schedule[day] && typeof shop.schedule[day] === 'object') {
        defaults[day] = {
          active: shop.schedule[day].active ?? false,
          shifts: Array.isArray(shop.schedule[day].shifts) && shop.schedule[day].shifts.length > 0
            ? shop.schedule[day].shifts
            : defaults[day].shifts,
        };
      }
    }
    return defaults;
  });

  const handleSave = async () => {
    try {
      await updateShop.mutateAsync({
        id: shop.id,
        data: { schedule },
      });
      toast.success('Horarios actualizados exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar horarios');
    }
  };

  const updateDaySchedule = (day: keyof WeekSchedule, updates: Partial<DaySchedule>) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...updates },
    }));
  };

  const updateShift = (
    day: keyof WeekSchedule,
    shiftIndex: number,
    field: 'open' | 'close',
    value: string
  ) => {
    setSchedule((prev) => {
      const daySchedule = prev[day];
      const newShifts = [...daySchedule.shifts];
      newShifts[shiftIndex] = { ...newShifts[shiftIndex], [field]: value };
      return {
        ...prev,
        [day]: { ...daySchedule, shifts: newShifts },
      };
    });
  };

  const addShift = (day: keyof WeekSchedule) => {
    setSchedule((prev) => {
      const daySchedule = prev[day];
      const lastShift = daySchedule.shifts[daySchedule.shifts.length - 1];
      return {
        ...prev,
        [day]: {
          ...daySchedule,
          shifts: [...daySchedule.shifts, { open: lastShift?.close || '14:00', close: '20:00' }],
        },
      };
    });
  };

  const removeShift = (day: keyof WeekSchedule, shiftIndex: number) => {
    setSchedule((prev) => {
      const daySchedule = prev[day];
      return {
        ...prev,
        [day]: {
          ...daySchedule,
          shifts: daySchedule.shifts.filter((_, i) => i !== shiftIndex),
        },
      };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horarios de Atención</CardTitle>
        <CardDescription>
          Configura los horarios de apertura y cierre de tu comercio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {DAYS.map(({ key, label }) => {
          const daySchedule = schedule[key];
          return (
            <div key={key} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">{label}</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`${key}-active`} className="text-sm">
                    Abierto
                  </Label>
                  <Switch
                    id={`${key}-active`}
                    checked={daySchedule.active}
                    onCheckedChange={(checked) =>
                      updateDaySchedule(key, { active: checked })
                    }
                  />
                </div>
              </div>

              {daySchedule.active && (
                <div className="space-y-3">
                  {daySchedule.shifts.map((shift, index) => (
                    <div key={index} className="flex items-center gap-4">
                      {daySchedule.shifts.length > 1 && (
                        <span className="text-sm text-gray-600 w-16">
                          Turno {index + 1}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={shift.open}
                          onChange={(e) =>
                            updateShift(key, index, 'open', e.target.value)
                          }
                          className="w-32"
                        />
                        <span className="text-gray-400">-</span>
                        <Input
                          type="time"
                          value={shift.close}
                          onChange={(e) =>
                            updateShift(key, index, 'close', e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                      {daySchedule.shifts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive h-8 w-8"
                          onClick={() => removeShift(key, index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addShift(key)}
                    className="mt-1"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar corte (ej: cierre de mediodía)
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        <Button onClick={handleSave} disabled={updateShop.isPending}>
          {updateShop.isPending && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Guardar Horarios
        </Button>
      </CardContent>
    </Card>
  );
}

// Fiscal Tab Component
function FiscalTab({ shop }: { shop: any }) {
  const updateShop = useUpdateShop();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      businessName: shop.businessName || '',
      cuit: shop.cuit || '',
      taxType: shop.taxType || 'monotributo',
      fiscalAddress: shop.fiscalAddress || '',
      iibb: shop.iibb || '',
      convenioMultilateral: shop.convenioMultilateral || false,
    },
  });

  const convenioMultilateral = watch('convenioMultilateral');

  const onSubmit = async (data: any) => {
    try {
      await updateShop.mutateAsync({ id: shop.id, data });
      toast.success('Datos fiscales actualizados exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos Fiscales</CardTitle>
        <CardDescription>
          Información fiscal y tributaria de tu comercio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="businessName">Razón Social</Label>
            <Input
              id="businessName"
              {...register('businessName')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cuit">CUIT</Label>
              <Input
                id="cuit"
                {...register('cuit')}
                placeholder="XX-XXXXXXXX-X"
              />
            </div>

            <div>
              <Label htmlFor="taxType">Condición Fiscal</Label>
              <Select
                value={watch('taxType')}
                onValueChange={(value) => setValue('taxType', value)}
              >
                <SelectTrigger id="taxType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monotributo">Monotributo</SelectItem>
                  <SelectItem value="responsable_inscripto">
                    Responsable Inscripto
                  </SelectItem>
                  <SelectItem value="exento">Exento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="fiscalAddress">Domicilio Fiscal</Label>
            <Input
              id="fiscalAddress"
              {...register('fiscalAddress')}
            />
          </div>

          <div>
            <Label htmlFor="iibb">Ingresos Brutos</Label>
            <Input
              id="iibb"
              {...register('iibb')}
              placeholder="Número de IIBB"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="convenioMultilateral"
              checked={convenioMultilateral}
              onCheckedChange={(checked) =>
                setValue('convenioMultilateral', checked)
              }
            />
            <Label htmlFor="convenioMultilateral" className="cursor-pointer">
              Convenio Multilateral
            </Label>
          </div>

          <Button type="submit" disabled={updateShop.isPending}>
            {updateShop.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Guardar Datos Fiscales
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Bank Account type
type BankAccount = {
  id: string;
  bankName: string;
  bankAccount: string;
  bankAlias: string;
  accountHolder: string;
  isDefault: boolean;
};

// Banking Tab Component
function BankingTab({ shop }: { shop: any }) {
  const updateShop = useUpdateShop();
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    if (shop.bankAccounts && shop.bankAccounts.length > 0) {
      return shop.bankAccounts;
    }
    // Migrar legacy
    if (shop.bankAccount || shop.bankAlias) {
      return [{
        id: crypto.randomUUID(),
        bankName: shop.bankName || '',
        bankAccount: shop.bankAccount || '',
        bankAlias: shop.bankAlias || '',
        accountHolder: shop.accountHolder || '',
        isDefault: true,
      }];
    }
    return [];
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<BankAccount, 'id' | 'isDefault'>>({
    defaultValues: { bankName: '', bankAccount: '', bankAlias: '', accountHolder: '' },
  });

  const openAdd = () => {
    setEditingAccount(null);
    reset({ bankName: '', bankAccount: '', bankAlias: '', accountHolder: '' });
    setDialogOpen(true);
  };

  const openEdit = (account: BankAccount) => {
    setEditingAccount(account);
    reset({
      bankName: account.bankName,
      bankAccount: account.bankAccount,
      bankAlias: account.bankAlias,
      accountHolder: account.accountHolder,
    });
    setDialogOpen(true);
  };

  const saveAccounts = async (newAccounts: BankAccount[]) => {
    setSaving(true);
    try {
      await updateShop.mutateAsync({ id: shop.id, data: { bankAccounts: newAccounts } });
      setAccounts(newAccounts);
      toast.success('Cuentas bancarias actualizadas');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const onSubmitForm = async (data: Omit<BankAccount, 'id' | 'isDefault'>) => {
    let newAccounts: BankAccount[];
    if (editingAccount) {
      newAccounts = accounts.map(a =>
        a.id === editingAccount.id ? { ...a, ...data } : a
      );
    } else {
      const newAccount: BankAccount = {
        id: crypto.randomUUID(),
        ...data,
        isDefault: accounts.length === 0,
      };
      newAccounts = [...accounts, newAccount];
    }
    await saveAccounts(newAccounts);
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const toDelete = accounts.find(a => a.id === id);
    let newAccounts = accounts.filter(a => a.id !== id);
    // Si era default y quedan cuentas, marcar la primera como default
    if (toDelete?.isDefault && newAccounts.length > 0) {
      newAccounts = newAccounts.map((a, i) => ({ ...a, isDefault: i === 0 }));
    }
    await saveAccounts(newAccounts);
  };

  const handleSetDefault = async (id: string) => {
    const newAccounts = accounts.map(a => ({ ...a, isDefault: a.id === id }));
    await saveAccounts(newAccounts);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cuentas Bancarias</CardTitle>
              <CardDescription>
                Agregá las cuentas donde querés recibir pagos. Los compradores podrán elegir a cuál transferir.
              </CardDescription>
            </div>
            <Button onClick={openAdd} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Agregar Cuenta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tenés cuentas bancarias cargadas.</p>
              <p className="text-sm mt-1">Agregá al menos una para que tus clientes puedan pagarte por transferencia.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`border rounded-lg p-4 ${account.isDefault ? 'border-primary bg-primary/5' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{account.bankName || 'Sin banco'}</span>
                        {account.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Principal
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        {account.bankAlias && <p>Alias: <span className="text-foreground">{account.bankAlias}</span></p>}
                        {account.bankAccount && <p>CBU/CVU: <span className="text-foreground font-mono text-xs">{account.bankAccount}</span></p>}
                        <p>Titular: <span className="text-foreground">{account.accountHolder}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!account.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Marcar como principal"
                          onClick={() => handleSetDefault(account.id)}
                          disabled={saving}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(account)}
                        disabled={saving}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(account.id)}
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Editar Cuenta' : 'Agregar Cuenta Bancaria'}</DialogTitle>
            <DialogDescription>
              {editingAccount ? 'Modificá los datos de esta cuenta.' : 'Completá los datos de la nueva cuenta bancaria.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <div>
              <Label htmlFor="bankName">Banco *</Label>
              <Input
                id="bankName"
                {...register('bankName', { required: 'El banco es obligatorio' })}
                placeholder="Ej: Banco Galicia, Mercado Pago"
              />
              {errors.bankName && <p className="text-xs text-destructive mt-1">{errors.bankName.message}</p>}
            </div>
            <div>
              <Label htmlFor="bankAccount">CBU / CVU *</Label>
              <Input
                id="bankAccount"
                {...register('bankAccount', { required: 'El CBU/CVU es obligatorio' })}
                placeholder="22 dígitos"
                maxLength={22}
              />
              {errors.bankAccount && <p className="text-xs text-destructive mt-1">{errors.bankAccount.message}</p>}
            </div>
            <div>
              <Label htmlFor="bankAlias">Alias</Label>
              <Input
                id="bankAlias"
                {...register('bankAlias')}
                placeholder="mi.alias.mp"
              />
            </div>
            <div>
              <Label htmlFor="accountHolder">Titular *</Label>
              <Input
                id="accountHolder"
                {...register('accountHolder', { required: 'El titular es obligatorio' })}
                placeholder="Nombre del titular"
              />
              {errors.accountHolder && <p className="text-xs text-destructive mt-1">{errors.accountHolder.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingAccount ? 'Guardar Cambios' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
