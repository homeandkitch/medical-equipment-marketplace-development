'use client'

import { Check, Undo2, X } from 'lucide-react'
import { ActionButton } from '@/components/action-button'
import {
  cancelRequest,
  completeRequest,
  respondToRequest,
  reviewDocument,
  reviewListing,
} from '@/app/actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

function messages(t: Dictionary) {
  return {
    successMessage: t.common.done,
    notImplementedMessage: t.common.notImplemented,
    errorMessage: t.auth.unexpected,
  }
}

export function SellerRequestActions({
  requestId,
  status,
  t,
}: {
  requestId: string
  status: string
  t: Dictionary
}) {
  const m = messages(t)
  if (status === 'pending') {
    return (
      <div className="flex flex-wrap gap-2">
        <ActionButton {...m} icon={<Check data-icon="inline-start" aria-hidden="true" />} action={() => respondToRequest(requestId, 'accepted')}>
          {t.seller.accept}
        </ActionButton>
        <ActionButton {...m} variant="outline" icon={<X data-icon="inline-start" aria-hidden="true" />} action={() => respondToRequest(requestId, 'rejected')}>
          {t.seller.reject}
        </ActionButton>
      </div>
    )
  }
  if (status === 'accepted') {
    return (
      <ActionButton {...m} variant="secondary" action={() => completeRequest(requestId)}>
        {t.seller.markCompleted}
      </ActionButton>
    )
  }
  return null
}

export function BuyerCancelButton({ requestId, t }: { requestId: string; t: Dictionary }) {
  return (
    <ActionButton
      {...messages(t)}
      variant="outline"
      icon={<Undo2 data-icon="inline-start" aria-hidden="true" />}
      action={() => cancelRequest(requestId)}
    >
      {t.buyer.cancel}
    </ActionButton>
  )
}

export function AdminListingActions({ listingId, t }: { listingId: string; t: Dictionary }) {
  const m = messages(t)
  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton {...m} icon={<Check data-icon="inline-start" aria-hidden="true" />} action={() => reviewListing(listingId, 'certified')}>
        {t.admin.approve}
      </ActionButton>
      <ActionButton {...m} variant="outline" icon={<X data-icon="inline-start" aria-hidden="true" />} action={() => reviewListing(listingId, 'rejected')}>
        {t.admin.reject}
      </ActionButton>
    </div>
  )
}

export function AdminDocumentActions({ documentId, t }: { documentId: string; t: Dictionary }) {
  const m = messages(t)
  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton {...m} icon={<Check data-icon="inline-start" aria-hidden="true" />} action={() => reviewDocument(documentId, 'approved')}>
        {t.admin.approve}
      </ActionButton>
      <ActionButton {...m} variant="outline" icon={<X data-icon="inline-start" aria-hidden="true" />} action={() => reviewDocument(documentId, 'rejected')}>
        {t.admin.reject}
      </ActionButton>
    </div>
  )
}
