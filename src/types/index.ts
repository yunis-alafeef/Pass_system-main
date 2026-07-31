export type TripType = 'internal' | 'international';
export type BusType = 'VIP الممتاز' | 'عادي المطور' | 'VIP ديلوكس';

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
}

export type SeatStatus = 'available' | 'booked' | 'selected' | 'women';

export interface Seat {
  id: string;
  seatNumber: string;
  status: SeatStatus;
  isVip?: boolean;
  row: number;
  col: number;
}

export interface Passenger {
  seatNumber: string;
  fullName: string;
  identityNumber: string;
  phone: string;
  gender: 'male' | 'female';
}

export type PaymentMethod = 'kureimi' | 'tadamon' | 'jawwal' | 'visa' | 'cash';

export interface Booking {
  id: string;
  bookingCode: string;
  trip: Trip;
  seats: string[];
  passengers: Passenger[];
  totalPriceYER: number;
  totalPriceSAR: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'failed';
  bookingDate: string;
}

export interface Vendor {
  id: string;
  name: string;
  city: string;
  phone: string;
  rating: number;
  totalTrips: number;
  verified: boolean;
}
