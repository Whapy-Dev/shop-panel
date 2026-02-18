import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Star,
  TrendingUp,
  ArrowRight,
  ArrowDownCircle,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMyShop } from '@/hooks/useShop';
import {
  useDashboardMetrics,
  useRevenueTrend,
  useTopProducts,
} from '@/hooks/useDashboard';
import { useShopOrders } from '@/hooks/useOrders';
import { useAccountsSummary, useLowStockProducts } from '@/hooks/useInventory';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(value);
};

const DashboardPage = () => {
  const { data: shop, isLoading: shopLoading, error: shopError } = useMyShop();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: revenueTrend, isLoading: revenueTrendLoading } =
    useRevenueTrend();
  const { data: topProducts, isLoading: topProductsLoading } = useTopProducts(5);
  const { data: ordersData, isLoading: ordersLoading } = useShopOrders({ limit: 5 });
  const { data: accounts, isLoading: accountsLoading } = useAccountsSummary();
  const { data: lowStock, isLoading: lowStockLoading } = useLowStockProducts(5);

  const orders = ordersData?.data || [];

  // No shop state
  if (shopLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (shopError || !shop) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto mt-12">
          <CardHeader>
            <CardTitle className="text-2xl">Bienvenido a tu Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Aún no tienes un negocio registrado. Crea tu tienda para comenzar
              a vender y gestionar tus productos.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Crear mi negocio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Resumen de tu negocio: {shop.name}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics?.revenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total acumulado
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pending Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos Nuevos
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <div
                  className={`text-2xl font-bold ${
                    (metrics?.pendingOrders || 0) > 0
                      ? 'text-orange-600'
                      : ''
                  }`}
                >
                  {metrics?.pendingOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(metrics?.pendingOrders || 0) > 0
                    ? 'Por confirmar'
                    : 'Todo al día'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Products Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productos Activos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {metrics?.activeProducts || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  En tu catálogo
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Average Rating Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rating Promedio
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold flex items-center gap-1">
                  {(metrics?.avgRating || 0).toFixed(1)}
                  <span className="text-base text-gray-500">/ 5</span>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Calificación de clientes
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CRM KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras del Mes</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(accounts?.totalPurchases || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {accounts?.purchasesCount || 0} ordenes de compra
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance del Mes</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${(accounts?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(accounts?.balance || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ventas - Compras
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Link to="/inventory">
          <Card className="hover:border-orange-300 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Stock Bajo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {lowStockLoading ? (
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
              ) : (
                <>
                  <div className={`text-2xl font-bold ${(lowStock?.length || 0) > 0 ? 'text-orange-600' : ''}`}>
                    {lowStock?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(lowStock?.length || 0) > 0 ? 'Requieren reposicion' : 'Stock saludable'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencia de Ingresos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Últimos 30 días
          </p>
        </CardHeader>
        <CardContent>
          {revenueTrendLoading ? (
            <div className="h-80 bg-gray-100 animate-pulse rounded" />
          ) : !revenueTrend?.data || revenueTrend.data.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No hay datos de ingresos disponibles
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueTrend.data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString('es-AR');
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <p className="text-sm text-muted-foreground">Top 5 del mes</p>
          </CardHeader>
          <CardContent>
            {topProductsLoading ? (
              <div className="h-80 bg-gray-100 animate-pulse rounded" />
            ) : !topProducts || topProducts.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No hay datos de ventas disponibles
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="productName"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [value, 'Unidades vendidas']}
                  />
                  <Bar dataKey="unitsSold" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Últimos 5 pedidos
            </p>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No hay pedidos recientes
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          Pedido #{order.id.slice(0, 8)}
                        </p>
                        <Badge
                          variant={
                            order.fulfillmentStatus === 'pending'
                              ? 'default'
                              : order.fulfillmentStatus === 'delivered'
                              ? 'outline'
                              : 'secondary'
                          }
                        >
                          {order.fulfillmentStatus === 'pending'
                            ? 'Pendiente'
                            : order.fulfillmentStatus === 'delivered'
                            ? 'Completado'
                            : order.fulfillmentStatus}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(order.shopSubtotal)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {orders && orders.length > 0 && (
              <Link
                to="/orders"
                className="mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                Ver todos los pedidos
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
