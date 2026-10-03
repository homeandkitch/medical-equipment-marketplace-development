import { redirect } from 'next/navigation'
import { getCurrentProfile, homeForRole } from '@/lib/auth'

export default async function DashboardIndex() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login?next=/dashboard')
  redirect(homeForRole(profile.role))
}
