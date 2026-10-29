export type TripType = 'internal' | 'international';
export type BusType = 'VIP الممتاز' | 'عادي المطور' | 'VIP ديلوكس';
export type TripLifecycleStatus = 'SCHEDULED' | 'BOARDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface RouteStop {
  stationName: string;
  cityName: string;
  estimatedArrivalMinutes: number;
  isMainTerminal?: boolean;
}

export interface Trip {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorRating: number;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  priceYER: number;
  priceSAR: number;
  availableSeats: number;
  totalSeats: number;
  busType: BusType;
  tripType: TripType;
  features: string[];
  status?: TripLifecycleStatus;
  stops?: RouteStop[];
  recurrence?: 'daily' | 'weekly' | 'none';
  vipSeatExtraYER?: number;
}

export type SeatStatus = 'available' | 'booked' | 'selected' | 'women' | 'held' | 'disabled';
export type SeatClassification = 'standard' | 'vip' | 'window' | 'aisle';

export interface Seat {
  id: string;
  seatNumber: string;
  status: SeatStatus;
  isVip?: boolean;
  classification?: SeatClassification;
  row: number;
  col: number;
  heldUntil?: number; // epoch ms
  heldByUserId?: string;
  extraPriceYER?: number;
}

export interface Passenger {
  seatNumber: string;
  fullName: string;
  identityNumber: string;
  phone: string;
  gender: 'male' | 'female';
  birthDate?: string;
  nationality?: string;
  specialAssistance?: boolean;
  specialAssistanceNote?: string;
}

export type PaymentMethod = 'kureimi' | 'tadamon' | 'jawwal' | 'visa' | 'cash' | 'bank_transfer';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';

export interface Invoice {
  invoiceNumber: string;
  issueDate: string;
  subtotalYER: number;
  vatTaxYER: number;
  serviceFeeYER: number;
  platformCommissionYER: number;
  vendorNetYER: number;
  totalYER: number;
  totalSAR: number;
  currency: 'YER' | 'SAR';
  exchangeRate: number; // YER per SAR
}

export interface Booking {
  id: string;
  bookingCode: string;
  trip: Trip;
  seats: string[];
  passengers: Passenger[];
  totalPriceYER: number;
  totalPriceSAR: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  status?: BookingStatus;
  bookingDate: string;
  baggageCount?: number;
  baggageExtraFeeYER?: number;
  specialAssistance?: boolean;
  cancellationDate?: string;
  cancellationFeeYER?: number;
  refundedAmountYER?: number;
  cancellationReason?: string;
  invoice?: Invoice;
}

export type VendorTier = 'برونزي' | 'فضي' | 'ذهبي' | 'بلاتيني';
export type VendorApprovalStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

export interface VendorKYCDocuments {
  commercialRegistryNumber?: string;
  transportLicenseNumber?: string;
  taxNumber?: string;
  licenseExpiryDate?: string;
  verifiedAt?: string;
}

export interface VendorContract {
  contractId: string;
  commissionRate: number; // e.g. 5%
  startDate: string;
  endDate: string;
  isActive: boolean;
  autoRenew: boolean;
}

export interface VendorPayout {
  id: string;
  payoutNumber: string;
  amountYER: number;
  amountSAR: number;
  requestedAt: string;
  processedAt?: string;
  status: 'PENDING' | 'PROCESSED' | 'REJECTED';
  bankOrWallet: string;
  referenceNumber?: string;
}

export interface Vendor {
  id: string;
  name: string;
  city: string;
  phone: string;
  rating: number;
  totalTrips: number;
  verified: boolean;
  status?: VendorApprovalStatus;
  tier?: VendorTier;
  commissionRate?: number; // e.g. 5
  documents?: VendorKYCDocuments;
  contract?: VendorContract;
  branches?: string[];
  busFleetCount?: number;
}

