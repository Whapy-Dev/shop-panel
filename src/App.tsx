import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import ShopSettingsPage from '@/pages/ShopSettingsPage';
import ProductsPage from '@/pages/ProductsPage';
import OrdersPage from '@/pages/OrdersPage';
import ReviewsPage from '@/pages/ReviewsPage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import BannersPage from '@/pages/BannersPage';
import PromotionalBannerPage from '@/pages/PromotionalBannerPage';
import SupportPage from '@/pages/SupportPage';
import SubscriptionPlansPage from '@/pages/SubscriptionPlansPage';
import SuppliersPage from '@/pages/SuppliersPage';
import PurchaseOrdersPage from '@/pages/PurchaseOrdersPage';
import InventoryPage from '@/pages/InventoryPage';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
    },
  },
});

function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster position="top-right" />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<ProtectedPage><DashboardPage /></ProtectedPage>} />
              <Route path="/shop" element={<ProtectedPage><ShopSettingsPage /></ProtectedPage>} />
              <Route path="/products" element={<ProtectedPage><ProductsPage /></ProtectedPage>} />
              <Route path="/orders" element={<ProtectedPage><OrdersPage /></ProtectedPage>} />
              <Route path="/reviews" element={<ProtectedPage><ReviewsPage /></ProtectedPage>} />
              <Route path="/suppliers" element={<ProtectedPage><SuppliersPage /></ProtectedPage>} />
              <Route path="/purchase-orders" element={<ProtectedPage><PurchaseOrdersPage /></ProtectedPage>} />
              <Route path="/inventory" element={<ProtectedPage><InventoryPage /></ProtectedPage>} />
              <Route path="/subscription" element={<ProtectedPage><SubscriptionPage /></ProtectedPage>} />
              <Route path="/banners" element={<ProtectedPage><BannersPage /></ProtectedPage>} />
              <Route path="/promotional" element={<ProtectedPage><PromotionalBannerPage /></ProtectedPage>} />
              <Route path="/support" element={<ProtectedPage><SupportPage /></ProtectedPage>} />
              <Route path="/admin/plans" element={<ProtectedPage><SubscriptionPlansPage /></ProtectedPage>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
