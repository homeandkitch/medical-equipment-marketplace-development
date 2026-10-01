import { GOVERNORATES, type ListingType } from './types'
import type { Dictionary, Locale } from './i18n/dictionaries'

export function formatPrice(
  price: number | null,
  type: ListingType,
  locale: Locale,
  t: Dictionary,
) {
  if (type === 'donate' || price === null) return t.listings.free
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(price)
  return type === 'rent' ? `${formatted} ${t.listings.perMonth}` : formatted
}

export function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function governorateName(id: string, locale: Locale) {
  const g = GOVERNORATES.find((x) => x.id === id)
  return g ? g[locale] : id
}
