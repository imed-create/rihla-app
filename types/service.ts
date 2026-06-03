export type ServiceType =
  | 'massage'
  | 'jetski'
  | 'pedalo'
  | 'games'
  | 'parking'
  | 'photos'
  | 'powerbank'
  | 'showers';

export type ServiceRequestStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type Service = {
  id: string;
  partnerId: string;
  type: ServiceType;
  name: string;
  priceDZD: number;
  isAvailable: boolean;
};

export type ServiceRequest = {
  id: string;
  userId: string;
  serviceId: string;
  serviceType: ServiceType;
  customerName: string;
  status: ServiceRequestStatus;
  date: string;
  totalDZD: number;
  createdAt: string;
};
