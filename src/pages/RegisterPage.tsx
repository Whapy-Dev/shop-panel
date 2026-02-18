import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Store, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  role: z.enum(['retailer', 'wholesaler'], {
    required_error: 'Debes seleccionar un tipo de tienda',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { user, register: registerUser, login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const selectedRole = watch('role');

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role,
      });

      if (result.success) {
        toast.success('Cuenta creada exitosamente');
        navigate('/');
      } else {
        toast.error(result.error || 'Error al crear la cuenta');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branded section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 to-emerald-700 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-emerald-600">W</span>
            </div>
            <span className="text-3xl font-bold">Wallmapu</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Panel de Tienda</h1>
          <p className="text-lg text-emerald-50">
            Únete a nuestra red de comerciantes y lleva tu negocio al siguiente nivel
          </p>
        </div>
        <div className="text-sm text-emerald-100">
          © 2026 Wallmapu. Todos los derechos reservados.
        </div>
      </div>

      {/* Right form section */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
              <CardDescription>
                Completa el formulario para registrar tu tienda
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    placeholder="Juan Pérez"
                    {...register('name')}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono (Opcional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    {...register('phone')}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Tipo de Tienda</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Card
                      className={cn(
                        'cursor-pointer transition-all hover:border-emerald-500',
                        selectedRole === 'retailer' && 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500'
                      )}
                      onClick={() => !isLoading && setValue('role', 'retailer', { shouldValidate: true })}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                        <Store className={cn(
                          'h-8 w-8',
                          selectedRole === 'retailer' ? 'text-emerald-600' : 'text-gray-400'
                        )} />
                        <span className={cn(
                          'text-sm font-medium',
                          selectedRole === 'retailer' ? 'text-emerald-700' : 'text-gray-600'
                        )}>
                          Minorista
                        </span>
                      </CardContent>
                    </Card>

                    <Card
                      className={cn(
                        'cursor-pointer transition-all hover:border-emerald-500',
                        selectedRole === 'wholesaler' && 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500'
                      )}
                      onClick={() => !isLoading && setValue('role', 'wholesaler', { shouldValidate: true })}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                        <Package className={cn(
                          'h-8 w-8',
                          selectedRole === 'wholesaler' ? 'text-emerald-600' : 'text-gray-400'
                        )} />
                        <span className={cn(
                          'text-sm font-medium',
                          selectedRole === 'wholesaler' ? 'text-emerald-700' : 'text-gray-600'
                        )}>
                          Mayorista
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>
                <div className="text-sm text-center text-gray-600">
                  ¿Ya tienes una cuenta?{' '}
                  <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Inicia sesión aquí
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
