// API Service for Shop Panel
// Uses native fetch API with localStorage token management

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'client' | 'retailer' | 'wholesaler' | 'admin';
  province?: string;
  city?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  id: string;
  name: string;
  description?: string;
  address?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  type: 'retailer' | 'wholesaler';
  category: string;
  status: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: any;
  banner?: any;
  promotionalBanner?: any;
  schedule?: any;
  businessName?: string;
  cuit?: string;
  taxType?: string;
  fiscalAddress?: string;
  iibb?: string;
  convenioMultilateral?: boolean;
  bankAccounts?: {
    id: string;
    bankName: string;
    bankAccount: string;
    bankAlias: string;
    accountHolder: string;
    isDefault: boolean;
  }[];
  bankAccount?: string;
  bankAlias?: string;
  accountHolder?: string;
  bankName?: string;
  clickCount: number;
  shopCode?: string;
  isActive: boolean;
  isHighlighted?: boolean;
  subscriptionPlan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  order?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
  subcategories?: Subcategory[];
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  priceRetail: number;
  priceWholesale?: number;
  stock: number;
  images: string[];
  characteristics?: { name: string; value: string }[];
  isActive: boolean;
  shopId: string;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ShopOrder {
  id: string;
  status: string;
  fulfillmentStatus: string;
  deliveryType?: string;
  paymentMethod?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryProvince?: string;
  deliveryBarrio?: string;
  notes?: string;
  shopSubtotal: number;
  totalAmount: number;
  buyer?: { id: string; name: string; email: string; phone?: string };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  user?: { id: string; name: string };
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  plan: string;
  status: string;
  billingCycle: string;
  amount: number;
  startDate?: string;
  nextPaymentDate?: string;
  lastPaymentDate?: string;
  autoRenew: boolean;
  initPoint?: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle?: string;
  features: string[];
  quarterlyPrice?: number | null;
  semestralPrice?: number | null;
  semestralInstallmentPrice?: number | null;
  currency?: string;
  description?: string;
  targetRole?: string;
  maxProducts?: number;
  maxImages?: number;
  hasAnalytics?: boolean;
  hasBanners?: boolean;
  hasHighlight?: boolean;
  hasSearchPriority?: boolean;
  recommended?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

export interface SubscriptionPlanAdmin {
  id: string;
  name: string;
  slug: string;
  targetRole: string;
  price: number;
  semestralPrice?: number | null;
  semestralInstallmentPrice?: number | null;
  quarterlyPrice?: number | null;
  features: string[];
  maxProducts: number;
  maxImages: number;
  hasAnalytics: boolean;
  hasBanners: boolean;
  hasHighlight: boolean;
  hasSearchPriority: boolean;
  isActive: boolean;
  displayOrder: number;
  description?: string;
  recommended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  shopId: string;
  imageUrl: string;
  title?: string;
  status: string;
  placement?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  message: string;
  senderRole: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  revenue: number;
  pendingOrders: number;
  activeProducts: number;
  avgRating: number;
  totalReviews: number;
  totalOrders: number;
  clickCount: number;
}

// ─── CRM Types ────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  shopId: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  linkedShopId?: string | null;
  linkedShopName?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  shopId: string;
  type: 'sale_deduction' | 'purchase_receive' | 'manual_adjustment' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  productName?: string | null;
  productImage?: string | null;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId?: string | null;
  productName: string;
  quantity: number;
  unitCost: number;
  receivedQuantity: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  shopId: string;
  supplierId: string;
  supplierName?: string | null;
  orderNumber: string;
  status: 'draft' | 'sent' | 'partially_received' | 'received' | 'cancelled';
  notes?: string | null;
  totalAmount: number;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AccountsSummary {
  totalSales: number;
  totalPurchases: number;
  balance: number;
  salesCount: number;
  purchasesCount: number;
  period: { from: string; to: string };
}

export interface PurchaseVsSales {
  months: number;
  data: { month: string; sales: number; purchases: number; balance: number }[];
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  sku?: string;
  image?: string | null;
}

export interface RevenueTrend {
  period: string;
  groupBy: string;
  data: { date: string; revenue: number; orders: number }[];
}

export interface TopProduct {
  productId: string;
  productName: string;
  revenue: number;
  unitsSold: number;
  currentStock?: number;
  image?: string;
  isActive?: boolean;
}

// ============================================================================
// Core Fetch Helper
// ============================================================================

function getToken(): string | null {
  const stored = localStorage.getItem('shop_panel_user');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed.token || null;
  } catch {
    return null;
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    localStorage.removeItem('shop_panel_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  // Handle non-2xx responses
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Return JSON response
  return response.json();
}

// Helper for FormData requests (no Content-Type header)
async function fetchAPIFormData<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('shop_panel_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// ============================================================================
// Auth API
// ============================================================================

export const authAPI = {
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    return fetchAPI<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    province?: string;
    city?: string;
  }): Promise<{ user: User }> {
    return fetchAPI<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async me(): Promise<User> {
    const response = await fetchAPI<{ user: User }>('/auth/me');
    return response.user;
  },
};

// ============================================================================
// Shop API
// ============================================================================

export const shopAPI = {
  async getMyShop(): Promise<Shop> {
    return fetchAPI<Shop>('/shops/me');
  },

  async createShop(
    data: Partial<Shop>
  ): Promise<{ message: string; shop: Shop }> {
    return fetchAPI<{ message: string; shop: Shop }>('/shops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateShop(
    id: string,
    data: Partial<Shop>
  ): Promise<{ message: string; shop: Shop }> {
    return fetchAPI<{ message: string; shop: Shop }>(`/shops/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async updatePromotionalBanner(id: string, data: any): Promise<any> {
    return fetchAPI<any>(`/shops/${id}/promotional-banner`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async searchWholesalers(search: string): Promise<{ data: Shop[]; pagination: any }> {
    const query = new URLSearchParams();
    query.append('type', 'wholesaler');
    query.append('limit', '10');
    if (search) query.append('search', search);
    return fetchAPI<{ data: Shop[]; pagination: any }>(`/shops?${query.toString()}`);
  },
};

// ============================================================================
// Products API
// ============================================================================

export const productsAPI = {
  async getByShop(
    shopId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: string;
      includeInactive?: boolean;
    }
  ): Promise<{ data: Product[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.includeInactive !== undefined)
      query.append('includeInactive', params.includeInactive.toString());

    const queryString = query.toString();
    const endpoint = `/products/shop/${shopId}${
      queryString ? `?${queryString}` : ''
    }`;
    return fetchAPI<{ data: Product[]; pagination: any }>(endpoint);
  },

  async create(
    shopId: string,
    data: any
  ): Promise<{ message: string; product: Product }> {
    return fetchAPI<{ message: string; product: Product }>(
      `/products/shop/${shopId}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async update(
    id: string,
    data: any
  ): Promise<{ message: string; product: Product }> {
    return fetchAPI<{ message: string; product: Product }>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Orders API
// ============================================================================

export const ordersAPI = {
  async getShopOrders(params?: {
    page?: number;
    limit?: number;
    fulfillmentStatus?: string;
    status?: string;
    search?: string;
  }): Promise<{ data: ShopOrder[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.fulfillmentStatus)
      query.append('fulfillmentStatus', params.fulfillmentStatus);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    const endpoint = `/orders/shop-orders${queryString ? `?${queryString}` : ''}`;
    return fetchAPI<{ data: ShopOrder[]; pagination: any }>(endpoint);
  },

  async getShopOrderDetail(orderId: string): Promise<ShopOrder> {
    return fetchAPI<ShopOrder>(`/orders/shop-orders/${orderId}`);
  },

  async updateFulfillment(
    orderId: string,
    fulfillmentStatus: string
  ): Promise<{ message: string; orderId: string; fulfillmentStatus: string }> {
    return fetchAPI<{
      message: string;
      orderId: string;
      fulfillmentStatus: string;
    }>(`/orders/shop-orders/${orderId}/fulfillment`, {
      method: 'PATCH',
      body: JSON.stringify({ fulfillmentStatus }),
    });
  },
};

// ============================================================================
// Reviews API
// ============================================================================

export const reviewsAPI = {
  async getByShop(
    shopId: string
  ): Promise<{ data: Review[]; total: number; averageRating: number; ratingDistribution: Record<number, number> }> {
    return fetchAPI<{ data: Review[]; total: number; averageRating: number; ratingDistribution: Record<number, number> }>(
      `/reviews/shop/${shopId}`
    );
  },
};

// ============================================================================
// Subscriptions API
// ============================================================================

export const subscriptionsAPI = {
  async getMe(): Promise<Subscription> {
    return fetchAPI<Subscription>('/subscriptions/me');
  },

  async getPlans(): Promise<SubscriptionPlan[]> {
    return fetchAPI<SubscriptionPlan[]>('/subscriptions/plans');
  },

  async create(data: {
    plan: string;
    billingCycle: string;
  }): Promise<{ initPoint: string; subscriptionId: string }> {
    return fetchAPI<{ initPoint: string; subscriptionId: string }>(
      '/subscriptions',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async getHistory(): Promise<any[]> {
    return fetchAPI<any[]>('/subscriptions/history');
  },

  async cancel(): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>('/subscriptions/me', {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Subscription Plans Admin API (admin only)
// ============================================================================

export const subscriptionPlansAdminAPI = {
  async getAll(): Promise<SubscriptionPlanAdmin[]> {
    return fetchAPI<SubscriptionPlanAdmin[]>('/subscriptions/plans/admin');
  },

  async getById(id: string): Promise<SubscriptionPlanAdmin> {
    return fetchAPI<SubscriptionPlanAdmin>(`/subscriptions/plans/admin/${id}`);
  },

  async create(data: Partial<SubscriptionPlanAdmin>): Promise<SubscriptionPlanAdmin> {
    return fetchAPI<SubscriptionPlanAdmin>('/subscriptions/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<SubscriptionPlanAdmin>): Promise<SubscriptionPlanAdmin> {
    return fetchAPI<SubscriptionPlanAdmin>(`/subscriptions/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>(`/subscriptions/plans/${id}`, {
      method: 'DELETE',
    });
  },

  async seed(): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>('/subscriptions/plans/seed', {
      method: 'POST',
    });
  },
};

// ============================================================================
// Banners API
// ============================================================================

export const bannersAPI = {
  async requestBanner(
    data: FormData | any
  ): Promise<{ message: string; banner: Banner }> {
    // If data is FormData, use fetchAPIFormData
    if (data instanceof FormData) {
      return fetchAPIFormData<{ message: string; banner: Banner }>(
        '/banners/request',
        {
          method: 'POST',
          body: data,
        }
      );
    }
    // Otherwise, use regular fetchAPI with JSON
    return fetchAPI<{ message: string; banner: Banner }>('/banners/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyRequest(): Promise<Banner> {
    return fetchAPI<Banner>('/banners/my-request');
  },
};

// ============================================================================
// Tickets API
// ============================================================================

export const ticketsAPI = {
  async getMyTickets(): Promise<{ data: Ticket[] }> {
    return fetchAPI<{ data: Ticket[] }>('/tickets/my-tickets');
  },

  async create(data: {
    subject: string;
    category: string;
    priority: string;
    message: string;
  }): Promise<{ message: string; ticket: Ticket }> {
    return fetchAPI<{ message: string; ticket: Ticket }>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async reply(id: string, message: string): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>(`/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};

// ============================================================================
// Categories API
// ============================================================================

export const categoriesAPI = {
  async getAll(): Promise<{ total: number; categories: Category[] }> {
    return fetchAPI<{ total: number; categories: Category[] }>('/categories');
  },
};

// ============================================================================
// Analytics API
// ============================================================================

export const analyticsAPI = {
  async getDashboard(): Promise<DashboardMetrics> {
    return fetchAPI<DashboardMetrics>('/analytics/shop/dashboard');
  },

  async getRevenueTrend(
    days?: number,
    groupBy?: string
  ): Promise<RevenueTrend> {
    const query = new URLSearchParams();
    if (days) query.append('days', days.toString());
    if (groupBy) query.append('groupBy', groupBy);

    const queryString = query.toString();
    const endpoint = `/analytics/shop/revenue-trend${
      queryString ? `?${queryString}` : ''
    }`;
    return fetchAPI<RevenueTrend>(endpoint);
  },

  async getTopProducts(limit?: number): Promise<TopProduct[]> {
    const query = new URLSearchParams();
    if (limit) query.append('limit', limit.toString());

    const queryString = query.toString();
    const endpoint = `/analytics/shop/top-products${
      queryString ? `?${queryString}` : ''
    }`;
    return fetchAPI<TopProduct[]>(endpoint);
  },

  async getPurchaseVsSales(months?: number): Promise<PurchaseVsSales> {
    const query = new URLSearchParams();
    if (months) query.append('months', months.toString());
    const qs = query.toString();
    return fetchAPI<PurchaseVsSales>(`/analytics/shop/purchase-vs-sales${qs ? `?${qs}` : ''}`);
  },

  async getAccountsSummary(from?: string, to?: string): Promise<AccountsSummary> {
    const query = new URLSearchParams();
    if (from) query.append('from', from);
    if (to) query.append('to', to);
    const qs = query.toString();
    return fetchAPI<AccountsSummary>(`/analytics/shop/accounts-summary${qs ? `?${qs}` : ''}`);
  },

  async getLowStock(threshold?: number): Promise<LowStockProduct[]> {
    const query = new URLSearchParams();
    if (threshold) query.append('threshold', threshold.toString());
    const qs = query.toString();
    return fetchAPI<LowStockProduct[]>(`/analytics/shop/low-stock${qs ? `?${qs}` : ''}`);
  },

  async getStockMovements(params?: {
    type?: string;
    productId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: StockMovement[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.productId) query.append('productId', params.productId);
    if (params?.from) query.append('from', params.from);
    if (params?.to) query.append('to', params.to);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const qs = query.toString();
    return fetchAPI<{ data: StockMovement[]; pagination: any }>(`/analytics/shop/stock-movements${qs ? `?${qs}` : ''}`);
  },
};

// ============================================================================
// Suppliers API
// ============================================================================

export const suppliersAPI = {
  async getAll(params?: {
    search?: string;
    isActive?: boolean;
    linkedOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Supplier[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.isActive !== undefined) query.append('isActive', params.isActive.toString());
    if (params?.linkedOnly) query.append('linkedOnly', 'true');
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const qs = query.toString();
    return fetchAPI<{ data: Supplier[]; pagination: any }>(`/suppliers${qs ? `?${qs}` : ''}`);
  },

  async getById(id: string): Promise<Supplier> {
    return fetchAPI<Supplier>(`/suppliers/${id}`);
  },

  async create(data: {
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    linkedShopId?: string;
  }): Promise<Supplier> {
    return fetchAPI<Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<{
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    linkedShopId?: string;
  }>): Promise<Supplier> {
    return fetchAPI<Supplier>(`/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Purchase Orders API
// ============================================================================

export const purchaseOrdersAPI = {
  async getAll(params?: {
    status?: string;
    supplierId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: PurchaseOrder[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.supplierId) query.append('supplierId', params.supplierId);
    if (params?.from) query.append('from', params.from);
    if (params?.to) query.append('to', params.to);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const qs = query.toString();
    return fetchAPI<{ data: PurchaseOrder[]; pagination: any }>(`/purchase-orders${qs ? `?${qs}` : ''}`);
  },

  async getById(id: string): Promise<PurchaseOrder> {
    return fetchAPI<PurchaseOrder>(`/purchase-orders/${id}`);
  },

  async create(data: {
    supplierId: string;
    notes?: string;
    items: { productId?: string; productName: string; quantity: number; unitCost: number }[];
  }): Promise<PurchaseOrder> {
    return fetchAPI<PurchaseOrder>('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: {
    supplierId?: string;
    notes?: string;
  }): Promise<PurchaseOrder> {
    return fetchAPI<PurchaseOrder>(`/purchase-orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async send(id: string): Promise<{ message: string; orderId: string; status: string }> {
    return fetchAPI<{ message: string; orderId: string; status: string }>(`/purchase-orders/${id}/send`, {
      method: 'PATCH',
    });
  },

  async receive(id: string, items: { itemId: string; receivedQuantity: number }[]): Promise<{ message: string; orderId: string; status: string }> {
    return fetchAPI<{ message: string; orderId: string; status: string }>(`/purchase-orders/${id}/receive`, {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    });
  },

  async cancel(id: string): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>(`/purchase-orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Inventory API (stock movements + adjustments via products controller)
// ============================================================================

export const inventoryAPI = {
  async getStockMovements(productId: string, params?: {
    type?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: StockMovement[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.from) query.append('from', params.from);
    if (params?.to) query.append('to', params.to);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const qs = query.toString();
    return fetchAPI<{ data: StockMovement[]; pagination: any }>(`/products/${productId}/stock-movements${qs ? `?${qs}` : ''}`);
  },

  async adjustStock(productId: string, data: {
    quantity: number;
    notes?: string;
  }): Promise<{ message: string; productId: string; previousStock: number; adjustment: number; newStock: number }> {
    return fetchAPI<any>(`/products/${productId}/stock-adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
