import { useState, useMemo } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  useStockMovements,
  useLowStockProducts,
  useAccountsSummary,
  usePurchaseVsSales,
} from '@/hooks/useInventory';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

const movementTypeLabels: Record<string, string> = {
  sale_deduction: 'Venta',
  purchase_receive: 'Compra',
  manual_adjustment: 'Ajuste Manual',
  return: 'Devolucion',
};

const movementTypeColors: Record<string, string> = {
  sale_deduction: 'text-red-600',
  purchase_receive: 'text-green-600',
  manual_adjustment: 'text-blue-600',
  return: 'text-orange-600',
};

export default function InventoryPage() {
  const [movementsPage, setMovementsPage] = useState(1);
  const [movementType, setMovementType] = useState<string>('');
  const [threshold, setThreshold] = useState(5);

  // Current month dates for accounts
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const { data: movementsData, isLoading: movementsLoading } = useStockMovements({
    type: movementType || undefined,
    page: movementsPage,
    limit: 20,
  });

  const { data: lowStock, isLoading: lowStockLoading } = useLowStockProducts(threshold);
  const { data: accounts, isLoading: accountsLoading } = useAccountsSummary(monthStart, monthEnd);
  const { data: purchaseVsSales, isLoading: pvLoading } = usePurchaseVsSales(6);

  const movements = movementsData?.data || [];
  const movPagination = movementsData?.pagination;

  const monthName = now.toLocaleString('es-AR', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventario</h1>
        <p className="text-gray-600 mt-1">Movimientos de stock, alertas y cuentas corrientes</p>
      </div>

      <Tabs defaultValue="movements">
        <TabsList>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="low-stock">Stock Bajo</TabsTrigger>
          <TabsTrigger value="accounts">Cuentas</TabsTrigger>
        </TabsList>

        {/* Tab: Movimientos */}
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historial de Movimientos</CardTitle>
                <Select value={movementType} onValueChange={(v) => { setMovementType(v === 'all' ? '' : v); setMovementsPage(1); }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="sale_deduction">Ventas</SelectItem>
                    <SelectItem value="purchase_receive">Compras</SelectItem>
                    <SelectItem value="manual_adjustment">Ajustes</SelectItem>
                    <SelectItem value="return">Devoluciones</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {movementsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : movements.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No hay movimientos de stock
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Stock Anterior</TableHead>
                        <TableHead className="text-right">Stock Nuevo</TableHead>
                        <TableHead>Nota</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="text-sm">
                            {new Date(m.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="font-medium">{m.productName || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={movementTypeColors[m.type]}>
                              {movementTypeLabels[m.type] || m.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-mono ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {m.quantity > 0 ? '+' : ''}{m.quantity}
                          </TableCell>
                          <TableCell className="text-right">{m.previousStock}</TableCell>
                          <TableCell className="text-right">{m.newStock}</TableCell>
                          <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">{m.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {movPagination && movPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-gray-500">
                        Pagina {movPagination.page} de {movPagination.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={movementsPage <= 1} onClick={() => setMovementsPage(movementsPage - 1)}>
                          Anterior
                        </Button>
                        <Button variant="outline" size="sm" disabled={movementsPage >= movPagination.totalPages} onClick={() => setMovementsPage(movementsPage + 1)}>
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Stock Bajo */}
        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Productos con Stock Bajo
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Umbral:</span>
                  <Input
                    type="number"
                    min={1}
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value) || 5)}
                    className="w-20"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {lowStockLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : !lowStock || lowStock.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Todos los productos tienen stock suficiente
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Stock Actual</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStock.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="font-mono text-sm">{p.sku || '-'}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${p.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                            {p.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.stock === 0 ? 'destructive' : 'outline'}>
                            {p.stock === 0 ? 'Sin stock' : 'Stock bajo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Cuentas */}
        <TabsContent value="accounts" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(accounts?.totalSales || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {accounts?.salesCount || 0} ordenes - {monthName}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

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
                      {accounts?.purchasesCount || 0} ordenes - {monthName}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
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
                      Ventas - Compras ({monthName})
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Purchase vs Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Compras vs Ventas (ultimos 6 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pvLoading ? (
                <div className="h-80 bg-gray-100 animate-pulse rounded" />
              ) : !purchaseVsSales?.data || purchaseVsSales.data.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No hay datos suficientes
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={purchaseVsSales.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => {
                        const [y, m] = v.split('-');
                        return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('es-AR', { month: 'short' });
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'sales' ? 'Ventas' : name === 'purchases' ? 'Compras' : 'Balance',
                      ]}
                    />
                    <Legend formatter={(v) => (v === 'sales' ? 'Ventas' : v === 'purchases' ? 'Compras' : 'Balance')} />
                    <Line type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="purchases" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
