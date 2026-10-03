'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createRequest } from '@/app/actions'
import { createClient } from '@/lib/supabase/client'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const MAX_DOC_BYTES = 5 * 1024 * 1024

export function RequestForm({
  listingId,
  userId,
  isDonation,
  t,
}: {
  listingId: string
  userId: string
  isDonation: boolean
  t: Dictionary
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const file = form.get('document') as File | null
    const message = String(form.get('message') ?? '').trim() || null
    setError(null)

    if (isDonation && (!file || file.size === 0)) {
      setError(t.newListing.required)
      return
    }
    if (file && file.size > MAX_DOC_BYTES) {
      setError(t.newListing.photosHelp)
      return
    }

    startTransition(async () => {
      let documentPath: string | null = null
      if (file && file.size > 0) {
        const supabase = createClient()
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `${userId}/${crypto.randomUUID()}-${safeName}`
        const { error: uploadError } = await supabase.storage.from('validation-docs').upload(path, file)
        if (uploadError) {
          setError(t.auth.unexpected)
          return
        }
        documentPath = path
      }
      const result = await createRequest({ listingId, message, documentPath })
      if (result.ok) {
        toast.success(t.request.sent)
        router.push('/dashboard/buyer')
      } else {
        toast.error(result.error === 'not_implemented' ? t.common.notImplemented : t.auth.unexpected)
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="message">{t.request.message}</Label>
        <Textarea
          id="message"
          name="message"
          rows={3}
          maxLength={1000}
          placeholder={t.request.messagePlaceholder}
        />
      </div>
      {isDonation && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="document">{t.request.docLabel}</Label>
          <Input id="document" name="document" type="file" accept="image/*,application/pdf" required className="h-10" />
          <p className="text-xs text-muted-foreground text-pretty">{t.request.docHelp}</p>
        </div>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="h-10" disabled={pending}>
        {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
        {t.request.send}
      </Button>
    </form>
  )
}
