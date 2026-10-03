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

export function parseTimestamp(value: string | null | undefined): Date | null {
  if (!value) return null
  // Timestamps without an offset are UTC in Postgres; without "Z" browsers parse them as local time.
  const hasZone = /(Z|[+-]\d{2}(:?\d{2})?)$/.test(value)
  const date = new Date(hasZone ? value : `${value.replace(' ', 'T')}Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value: string | null | undefined, locale: Locale) {
  const date = parseTimestamp(value)
  if (!date) return locale === 'ar' ? 'قيد الانتظار' : 'Pending'
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Cairo',
  }).format(date)
}

export function governorateName(id: string, locale: Locale) {
  const g = GOVERNORATES.find((x) => x.id === id)
  return g ? g[locale] : id
}
