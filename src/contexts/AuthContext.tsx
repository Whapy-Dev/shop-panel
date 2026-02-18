import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    province?: string;
    city?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'shop_panel_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { token, user: storedUser } = JSON.parse(stored);
        if (token) {
          authAPI
            .me()
            .then((freshUser) => {
              if (['retailer', 'wholesaler', 'admin'].includes(freshUser.role)) {
                setUser(freshUser);
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: freshUser }));
              } else {
                localStorage.removeItem(STORAGE_KEY);
              }
            })
            .catch(() => {
              localStorage.removeItem(STORAGE_KEY);
            })
            .finally(() => setIsLoading(false));
          return;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, user: loggedUser } = await authAPI.login(email, password);

      if (!['retailer', 'wholesaler', 'admin'].includes(loggedUser.role)) {
        return { success: false, error: 'Solo minoristas, mayoristas y administradores pueden acceder a este panel' };
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: loggedUser }));
      setUser(loggedUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al iniciar sesion' };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    province?: string;
    city?: string;
  }) => {
    try {
      if (!['retailer', 'wholesaler'].includes(data.role)) {
        return { success: false, error: 'Rol invalido. Selecciona Minorista o Mayorista.' };
      }

      await authAPI.register(data);
      // Auto-login after register
      return await login(data.email, data.password);
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al registrarse' };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
