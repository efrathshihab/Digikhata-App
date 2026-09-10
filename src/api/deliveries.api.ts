import { apiClient } from './client';

export interface Driver {
  id: string;
  driverCode: string;
  name: string;
  phone: string;
  licenseNo?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  notes?: string | null;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  type: string;
  capacity?: string | null;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'INACTIVE';
  notes?: string | null;
  createdAt: string;
}

export interface DeliveryItem {
  id: string;
  deliveryNumber: string;
  purchaseId?: string | null;
  invoiceId?: string | null;
  customerId: string;
  driverId?: string | null;
  vehicleId?: string | null;
  addressSnapshot: string;
  contactSnapshot: string;
  scheduledAt?: string | null;
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  transportCharge: string;
  notes?: string | null;
  startedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  driver?: Driver;
  vehicle?: Vehicle;
}

export interface DeliveryListResponse {
  success: boolean;
  data: DeliveryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface DriverListResponse {
  success: boolean;
  data: Driver[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface VehicleListResponse {
  success: boolean;
  data: Vehicle[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateDeliveryInput {
  purchaseId?: string;
  invoiceId?: string;
  customerId: string;
  driverId?: string;
  vehicleId?: string;
  addressSnapshot: string;
  contactSnapshot: string;
  scheduledAt?: string;
  transportCharge?: string;
  notes?: string;
}

export interface CreateDriverInput {
  name: string;
  phone: string;
  licenseNo?: string;
  notes?: string;
}

export interface CreateVehicleInput {
  registrationNumber: string;
  type: string;
  capacity?: string;
  notes?: string;
}

export const deliveriesApi = {
  getDeliveries: async (params?: { page?: number; limit?: number; status?: string }): Promise<{ items: DeliveryItem[]; meta: DeliveryListResponse['meta'] }> => {
    const response = await apiClient.get<DeliveryListResponse>('/deliveries', { params });
    const items = Array.isArray(response.data.data) ? response.data.data : ((response.data.data as any)?.items || []);
    const meta = response.data.meta || (response.data.data as any)?.meta || { total: items.length, page: 1, limit: 20, pages: 1 };
    return { items, meta };
  },

  getDelivery: async (id: string): Promise<DeliveryItem> => {
    const response = await apiClient.get<{ success: boolean; data: DeliveryItem }>(`/deliveries/${id}`);
    return response.data.data;
  },

  createDelivery: async (data: CreateDeliveryInput, idempotencyKey?: string): Promise<DeliveryItem> => {
    const key = idempotencyKey || `delivery_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const response = await apiClient.post<{ success: boolean; data: DeliveryItem }>('/deliveries', data, {
      headers: { 'Idempotency-Key': key }
    });
    return response.data.data;
  },

  updateDeliveryStatus: async (id: string, status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED', note?: string): Promise<DeliveryItem> => {
    const key = `delv_status_${id}_${Date.now()}`;
    const response = await apiClient.patch<{ success: boolean; data: DeliveryItem }>(`/deliveries/${id}/status`, { status, note }, {
      headers: { 'Idempotency-Key': key }
    });
    return response.data.data;
  },

  getDrivers: async (params?: { page?: number; limit?: number }): Promise<{ items: Driver[]; meta: DriverListResponse['meta'] }> => {
    const response = await apiClient.get<DriverListResponse>('/deliveries/drivers', { params });
    const items = Array.isArray(response.data.data) ? response.data.data : ((response.data.data as any)?.items || []);
    const meta = response.data.meta || (response.data.data as any)?.meta || { total: items.length, page: 1, limit: 20, pages: 1 };
    return { items, meta };
  },

  createDriver: async (data: CreateDriverInput): Promise<Driver> => {
    const response = await apiClient.post<{ success: boolean; data: Driver }>('/deliveries/drivers', data);
    return response.data.data;
  },

  updateDriver: async (id: string, status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'): Promise<Driver> => {
    const response = await apiClient.patch<{ success: boolean; data: Driver }>(`/deliveries/drivers/${id}`, { status });
    return response.data.data;
  },

  getVehicles: async (params?: { page?: number; limit?: number }): Promise<{ items: Vehicle[]; meta: VehicleListResponse['meta'] }> => {
    const response = await apiClient.get<VehicleListResponse>('/deliveries/vehicles', { params });
    const items = Array.isArray(response.data.data) ? response.data.data : ((response.data.data as any)?.items || []);
    const meta = response.data.meta || (response.data.data as any)?.meta || { total: items.length, page: 1, limit: 20, pages: 1 };
    return { items, meta };
  },

  createVehicle: async (data: CreateVehicleInput): Promise<Vehicle> => {
    const response = await apiClient.post<{ success: boolean; data: Vehicle }>('/deliveries/vehicles', data);
    return response.data.data;
  },

  updateVehicle: async (id: string, status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'INACTIVE'): Promise<Vehicle> => {
    const response = await apiClient.patch<{ success: boolean; data: Vehicle }>(`/deliveries/vehicles/${id}`, { status });
    return response.data.data;
  },
};
