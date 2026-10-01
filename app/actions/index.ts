'use server'

// Server Action stubs — signatures are wired into the UI; implement the bodies.
// RLS + triggers in scripts/001_schema.sql already enforce ownership and valid
// status transitions, so each body can be a single Supabase call followed by
// revalidatePath(). Return { ok: false, error } to surface a toast in the UI.

import type { DeviceType, ListingType } from '@/lib/types'

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string }

const notImplemented: ActionResult = { ok: false, error: 'not_implemented' }

export interface CreateListingInput {
  type: ListingType
  title: string
  device_type: DeviceType
  condition_description: string
  photos: string[]
  price: number | null
  governorate: string
}

export async function createListing(_input: CreateListingInput): Promise<ActionResult> {
  // TODO: insert into listings with seller_id = auth user; certification_status defaults to 'pending'.
  return notImplemented
}

export async function createRequest(_input: {
  listingId: string
  message: string | null
  documentPath: string | null
}): Promise<ActionResult> {
  // TODO: insert into requests; if documentPath, insert validation_documents { request_id, file_url: documentPath }.
  return notImplemented
}

export async function cancelRequest(_requestId: string): Promise<ActionResult> {
  // TODO: update requests set status = 'cancelled_by_buyer' where id = requestId.
  return notImplemented
}

export async function respondToRequest(
  _requestId: string,
  _decision: 'accepted' | 'rejected',
): Promise<ActionResult> {
  // TODO: update requests set status = decision (seller only, enforced by RLS + trigger).
  return notImplemented
}

export async function completeRequest(_requestId: string): Promise<ActionResult> {
  // TODO: update requests set status = 'completed'; update listing availability (rented/sold/donated).
  return notImplemented
}

export async function reviewListing(
  _listingId: string,
  _decision: 'certified' | 'rejected',
): Promise<ActionResult> {
  // TODO: admin-only update of listings.certification_status.
  return notImplemented
}

export async function reviewDocument(
  _documentId: string,
  _decision: 'approved' | 'rejected',
): Promise<ActionResult> {
  // TODO: admin-only update of validation_documents.review_status.
  return notImplemented
}
