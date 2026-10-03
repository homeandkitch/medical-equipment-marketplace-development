export function safeNext(next: string | null | undefined, fallback = '/dashboard') {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback
  return next
}

export function authRedirect(next: string) {
  const base =
    process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`
  return `${base}${base.includes('?') ? '&' : '?'}next=${encodeURIComponent(next)}`
}
