/**
 * BlueWave Outboard Motors - Central Data Types & Schemas
 */

export type OutboardBrand = 'Yamaha' | 'Suzuki' | 'Honda' | 'Mercury' | 'Tohatsu' | 'Other';
export type MotorCondition = 'New' | 'Used' | 'Certified Pre-Owned' | 'Either';
export type ShaftLength = '15" (Short)' | '20" (Long)' | '25" (Extra Long)' | '30" (Ultra Long)' | 'Other / Custom';
export type MotorAvailability = 'Available' | 'Sold' | 'Pending Sale';

export interface OutboardMotorListing {
  id: string;
  brand: OutboardBrand;
  model: string;
  horsepower: number;
  year: number;
  condition: MotorCondition;
  engineHours?: number;
  shaftLength: ShaftLength;
  fuelType?: string;
  price?: number;
  isCallForPrice?: boolean;
  location: string;
  deliveryAvailable: boolean;
  availability: MotorAvailability;
  stockCount?: number;
  productPhotos: string[];
  description: string;
  specs?: Record<string, string>;
  featured?: boolean;
  createdAt?: string;
}

export interface BusinessInfo {
  businessName: string;
  tagline: string;
  phone: string;
  secondaryPhone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  location?: string;
  businessHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  currency: string;
  facebookUrl: string;
  instagramUrl: string;
  websiteUrl: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'admin' | 'customer';
  profile?: CustomerProfile | null;
}

export interface CustomerProfile {
  deliveryAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CartItem {
  productId: string;
  brand: string;
  model: string;
  horsepower: number;
  price: number;
  isCallForPrice?: boolean;
  photo: string;
  quantity: number;
  shaftLength?: string;
  condition?: string;
}

export type OrderPaymentStatus =
  | 'PAYMENT NOT STARTED'
  | 'AWAITING PAYMENT'
  | 'RECEIPT SUBMITTED'
  | 'AWAITING VERIFICATION'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'PAYMENT REJECTED'
  | 'REFUNDED'
  | 'PARTIALLY REFUNDED';

export type OrderShippingStatus =
  | 'NEW'
  | 'PAID'
  | 'PROCESSING'
  | 'READY FOR DELIVERY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderShippingStatus;
  notes?: string;
  rejectionReason?: string;
  receipts?: PaymentReceipt[];
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentReceipt {
  id: string;
  orderId: string;
  paymentMethod: string;
  amount: number;
  receiptImage: string;
  customerNotes?: string;
  status: 'Awaiting Verification' | 'Approved' | 'Rejected';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  type: 'gateway' | 'manual';
  status: string;
  description: string;
  config: {
    beneficiaryName?: string;
    accountNumber?: string;
    bankName?: string;
    routingNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    paymentInstructions?: string;
    walletAddress?: string;
    clientId?: string;
    clientSecret?: string;
    mode?: string;
  };
}

export interface MessageReply {
  id: string;
  senderRole: 'admin' | 'customer';
  senderName: string;
  content: string;
  createdAt: string;
}

export interface CustomerMessage {
  id: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  productId?: string;
  productName?: string;
  orderId?: string;
  subject: string;
  status: 'UNREAD' | 'READ' | 'REPLIED';
  createdAt: string;
  updatedAt: string;
  replies: MessageReply[];
}

export interface SupportTicketReply {
  id: string;
  senderRole: 'admin' | 'customer';
  senderName: string;
  content: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  category: string;
  orderId?: string;
  subject: string;
  status: 'OPEN' | 'IN PROGRESS' | 'WAITING FOR CUSTOMER' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  replies: SupportTicketReply[];
}

export interface AdminStats {
  cards: {
    totalProducts: number;
    availableProducts: number;
    soldProducts: number;
    totalOrders: number;
    pendingOrders: number;
    paidOrders: number;
    unreadMessages: number;
    openSupportTickets: number;
    pendingReceipts: number;
  };
  recent: {
    orders: any[];
    receipts: any[];
    messages: any[];
    tickets: any[];
  };
}
