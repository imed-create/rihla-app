export type OrderStatus = 'pending' | 'preparing' | 'on_the_way' | 'delivered';

export type MenuCategory = 'drinks' | 'food' | 'snacks';

export type OrderItem = {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  nameAr?: string;
  quantity: number;
  priceDZD: number;
};

export type Order = {
  id: string;
  userId: string;
  beachId: string;
  bookingId?: string;
  spotLabel?: string;
  status: OrderStatus;
  totalDZD: number;
  paid: boolean;
  createdAt: string;
  items: OrderItem[];
};

export type MenuItem = {
  id: string;
  beachId: string;
  name: string;
  nameAr: string;
  priceDZD: number;
  category: MenuCategory;
  imageUrl?: string;
  emoji?: string;
  isAvailable: boolean;
};

export type CreateOrderParams = Omit<Order, 'id' | 'createdAt' | 'status'> & {
  status?: OrderStatus;
};
