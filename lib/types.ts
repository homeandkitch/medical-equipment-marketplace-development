export type UserRole = 'buyer' | 'seller' | 'admin'
export type ListingType = 'sell' | 'rent' | 'donate'
export type CertificationStatus = 'pending' | 'certified' | 'rejected'
export type Availability = 'available' | 'rented' | 'sold' | 'donated'
export type RequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled_by_buyer'
  | 'completed'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type DeviceType =
  | 'wheelchair'
  | 'oxygen_concentrator'
  | 'hospital_bed'
  | 'crutches'
  | 'walker'
  | 'other'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole | null
}

export interface Listing {
  id: string
  seller_id: string
  type: ListingType
  title: string
  device_type: DeviceType
  condition_description: string
  photos: string[]
  price: number | null
  governorate: string
  certification_status: CertificationStatus
  availability: Availability
  created_at: string
}

export interface MarketRequest {
  id: string
  listing_id: string
  buyer_id: string
  status: RequestStatus
  message: string | null
  created_at: string
}

export interface ValidationDocument {
  id: string
  request_id: string
  file_url: string
  review_status: ReviewStatus
  created_at: string
}

export const DEVICE_TYPES: DeviceType[] = [
  'wheelchair',
  'oxygen_concentrator',
  'hospital_bed',
  'crutches',
  'walker',
  'other',
]

export const LISTING_TYPES: ListingType[] = ['sell', 'rent', 'donate']

export const GOVERNORATES: { id: string; en: string; ar: string }[] = [
  { id: 'cairo', en: 'Cairo', ar: 'القاهرة' },
  { id: 'giza', en: 'Giza', ar: 'الجيزة' },
  { id: 'alexandria', en: 'Alexandria', ar: 'الإسكندرية' },
  { id: 'qalyubia', en: 'Qalyubia', ar: 'القليوبية' },
  { id: 'sharqia', en: 'Sharqia', ar: 'الشرقية' },
  { id: 'dakahlia', en: 'Dakahlia', ar: 'الدقهلية' },
  { id: 'gharbia', en: 'Gharbia', ar: 'الغربية' },
  { id: 'monufia', en: 'Monufia', ar: 'المنوفية' },
  { id: 'beheira', en: 'Beheira', ar: 'البحيرة' },
  { id: 'kafr_el_sheikh', en: 'Kafr El Sheikh', ar: 'كفر الشيخ' },
  { id: 'damietta', en: 'Damietta', ar: 'دمياط' },
  { id: 'port_said', en: 'Port Said', ar: 'بورسعيد' },
  { id: 'ismailia', en: 'Ismailia', ar: 'الإسماعيلية' },
  { id: 'suez', en: 'Suez', ar: 'السويس' },
  { id: 'north_sinai', en: 'North Sinai', ar: 'شمال سيناء' },
  { id: 'south_sinai', en: 'South Sinai', ar: 'جنوب سيناء' },
  { id: 'faiyum', en: 'Faiyum', ar: 'الفيوم' },
  { id: 'beni_suef', en: 'Beni Suef', ar: 'بني سويف' },
  { id: 'minya', en: 'Minya', ar: 'المنيا' },
  { id: 'asyut', en: 'Asyut', ar: 'أسيوط' },
  { id: 'sohag', en: 'Sohag', ar: 'سوهاج' },
  { id: 'qena', en: 'Qena', ar: 'قنا' },
  { id: 'luxor', en: 'Luxor', ar: 'الأقصر' },
  { id: 'aswan', en: 'Aswan', ar: 'أسوان' },
  { id: 'red_sea', en: 'Red Sea', ar: 'البحر الأحمر' },
  { id: 'new_valley', en: 'New Valley', ar: 'الوادي الجديد' },
  { id: 'matrouh', en: 'Matrouh', ar: 'مطروح' },
]
