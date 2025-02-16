// src/types/logistics.types.ts

export type LogisticsStatus = 'pending' | 'in_progress' | 'delivered' | 'cancelled';

export interface Logistics {
  id: number;
  orderId: number;
  pickupLocation: string;
  deliveryLocation: string;
  status: LogisticsStatus;
  estimatedDeliveryDate: Date | null;
  actualDeliveryDate: Date | null;
  deliveredAt: Date | null;
}

export interface LogisticsCreateInput {
  orderId: number;
  pickupLocation: string;
  deliveryLocation: string;
  estimatedDeliveryDate?: Date;
}

export interface LogisticsUpdateInput {
  status?: LogisticsStatus;
  actualDeliveryDate?: Date;
  deliveredAt?: Date;
}

export interface LogisticsFilter {
  status?: LogisticsStatus;
  orderId?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface DeliveryPartner {
  id: string;
  name: string;
  location: string;
  vehicleTypes: string[];
  rating: number;
  availability: boolean;
}