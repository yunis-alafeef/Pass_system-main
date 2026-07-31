import { Trip, Vendor } from '../types';

export const mockVendors: Vendor[] = [
  {
    id: 'v1',
    name: 'شركة البراق للنقل الدولي والمحلي',
    city: 'صنعاء',
    phone: '+967 770 000 111',
    rating: 4.9,
    totalTrips: 1420,
    verified: true,
  },
  {
    id: 'v2',
    name: 'شركة الرويشان للنقل الجماعي',
    city: 'عدن',
    phone: '+967 730 222 333',
    rating: 4.8,
    totalTrips: 980,
    verified: true,
  },
  {
    id: 'v3',
    name: 'شركة الأفضل للسفريات والسياحة',
    city: 'تعز',
    phone: '+967 710 444 555',
    rating: 4.7,
    totalTrips: 760,
    verified: true,
  },
  {
    id: 'v4',
    name: 'شركة البركة الدولية للنقل',
    city: 'المكلا',
    phone: '+967 777 888 999',
    rating: 4.9,
    totalTrips: 1150,
    verified: true,
  }
];

export const mockTrips: Trip[] = [
  {
    id: 'trip-101',
    vendorId: 'v1',
    vendorName: 'شركة البراق للنقل الدولي',
    vendorRating: 4.9,
    origin: 'صنعاء',
    destination: 'الرياض (السعودية)',
    departureTime: '08:00 صباحاً',
    arrivalTime: '02:00 صباحاً (اليوم التالي)',
    duration: '18 ساعة',
    priceYER: 180000,
    priceSAR: 450,
    availableSeats: 12,
    totalSeats: 45,
    busType: 'VIP الممتاز',
    tripType: 'international',
    features: ['شاشة عرض لكل مقعد', 'واي فاي مجاني', 'وجبات ضيافة', 'منفذ شاحن USB', 'مقاعد جلدية مريحة']
  },
  {
    id: 'trip-102',
    vendorId: 'v2',
    vendorName: 'شركة الرويشان للنقل الجماعي',
    vendorRating: 4.8,
    origin: 'صنعاء',
    destination: 'عدن',
    departureTime: '07:30 صباحاً',
    arrivalTime: '03:30 مساءً',
    duration: '8 ساعات',
    priceYER: 35000,
    priceSAR: 90,
    availableSeats: 18,
    totalSeats: 45,
    busType: 'VIP الممتاز',
    tripType: 'internal',
    features: ['مكيف هواء متطور', 'واي فاي', 'شاحن لكل مقعد']
  },
  {
    id: 'trip-103',
    vendorId: 'v3',
    vendorName: 'شركة الأفضل للسفريات',
    vendorRating: 4.7,
    origin: 'تعز',
    destination: 'المكلا',
    departureTime: '06:00 صباحاً',
    arrivalTime: '06:00 مساءً',
    duration: '12 ساعة',
    priceYER: 45000,
    priceSAR: 115,
    availableSeats: 8,
    totalSeats: 40,
    busType: 'عادي المطور',
    tripType: 'internal',
    features: ['مكيف هواء', 'مشروبات مجانية']
  },
  {
    id: 'trip-104',
    vendorId: 'v4',
    vendorName: 'شركة البركة الدولية للنقل',
    vendorRating: 4.9,
    origin: 'إب',
    destination: 'جدة (السعودية)',
    departureTime: '09:00 صباحاً',
    arrivalTime: '05:00 صباحاً (اليوم التالي)',
    duration: '20 ساعة',
    priceYER: 210000,
    priceSAR: 520,
    availableSeats: 15,
    totalSeats: 45,
    busType: 'VIP ديلوكس',
    tripType: 'international',
    features: ['شاشة ذكية', 'إنترنت فضائي', 'وجبة عشاء خفيفة', 'مقاعد مساج']
  },
  {
    id: 'trip-105',
    vendorId: 'v1',
    vendorName: 'شركة البراق للنقل الدولي',
    vendorRating: 4.9,
    origin: 'الحديدة',
    destination: 'صنعاء',
    departureTime: '02:00 مساءً',
    arrivalTime: '07:00 مساءً',
    duration: '5 ساعات',
    priceYER: 25000,
    priceSAR: 65,
    availableSeats: 22,
    totalSeats: 45,
    busType: 'VIP الممتاز',
    tripType: 'internal',
    features: ['مكيف هواء', 'شاحن مقعد']
  }
];

export const yemeniCities = [
  'صنعاء',
  'عدن',
  'تعز',
  'المكلا',
  'إب',
  'الحديدة',
  'ذمار',
  'مأرب',
  'سيئون',
  'الغيضة',
  'عتق'
];

export const internationalCities = [
  'الرياض (السعودية)',
  'جدة (السعودية)',
  'شرورة (السعودية)',
  'مكة المكرمة (السعودية)',
  'الدمام (السعودية)',
  'المدينة المنورة (السعودية)'
];
