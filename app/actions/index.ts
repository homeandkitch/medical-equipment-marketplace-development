'use server'

// Permissions are enforced by RLS policies and the guard triggers in
// scripts/001_schema.sql. Each action only authenticates the caller, performs
// the Supabase call as that user, and treats "zero rows affected" as a denial
// (RLS filters rows silently instead of raising an error).

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { DeviceType, ListingType } from '@/lib/types'

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string }

export interface CreateListingInput {
  type: ListingType
  title: string
  device_type: DeviceType
  condition_description: string
  photos: string[]
  price: number | null
  governorate: string
}

const AVAILABILITY_BY_TYPE: Record<ListingType, 'sold' | 'rented' | 'donated'> = {
  sell: 'sold',
  rent: 'rented',
  donate: 'donated',
}

async function getAuthedClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user ? { supabase, user } : null
}

function failure(error: { code?: string; message: string } | null, fallback = 'action_failed'): ActionResult {
  if (error?.code === '23505') return { ok: false, error: 'duplicate' }
  if (error?.code === '42501') return { ok: false, error: 'forbidden' }
  console.error('[actions]', error?.code, error?.message)
  return { ok: false, error: fallback }
}

function revalidateMarketplace() {
  revalidatePath('/listings')
  revalidatePath('/listings/[id]', 'page')
  revalidatePath('/dashboard/seller')
  revalidatePath('/dashboard/buyer')
  revalidatePath('/admin')
}

export async function createListing(input: CreateListingInput): Promise<ActionResult> {
  const auth = await getAuthedClient()
  if (!auth) return { ok: false, error: 'unauthenticated' }

  const { data, error } = await auth.supabase
    .from('listings')
    .insert({
      seller_id: auth.user.id,
      type: input.type,
      title: input.title.trim(),
      device_type: input.device_type,
      condition_description: input.condition_description.trim(),
      photos: input.photos,
      price: input.type === 'donate' ? null : input.price,
      governorate: input.governorate,
      certification_status: 'pending',
    })
    .select('id')
    .single()

  if (error || !data) return failure(error)

  revalidatePath('/dashboard/seller')
  revalidatePath('/admin')
  return { ok: true, id: data.id }
}

export async function createRequest(input: {
  listingId: string
  message: string | null
  documentPath: string | null
}): Promise<ActionResult> {
  const auth = await getAuthedClient()
  if (!auth) return { ok: false, error: 'unauthenticated' }

  const { data: request, error } = await auth.supabase
    .from('requests')
    .insert({
      listing_id: input.listingId,
      buyer_id: auth.user.id,
      status: 'pending',
      message: input.message?.trim() || null,
    })
    .select('id')
    .single()

  if (error || !request) return failure(error)

  if (input.documentPath) {
    const { error: docError } = await auth.supabase
      .from('validation_documents')
      .insert({ request_id: request.id, file_url: input.documentPath })

    if (docError) {
      // Buyers cannot delete requests, so withdraw it to avoid a request missing its required document.
      await auth.supabase.from('requests').update({ status: 'cancelled_by_buyer' }).eq('id', request.id)
      return failure(docError)
    }
  }

  revalidateMarketplace()
  return { ok: true, id: request.id }
}

export async function cancelRequest(requestId: string): Promise<ActionResult> {
  const auth = await getAuthedClient()
  if (!auth) return { ok: false, error: 'unauthenticated' }

  const { data, error } = await auth.supabase
    .from('requests')
    .update({ status: 'cancelled_by_buyer' })
    .eq('id', requestId)
    .eq('status', 'pending')
    .select('id')

  if (error) return failure(error)
  if (!data?.length) return { ok: false, error: 'not_allowed' }

  revalidateMarketplace()
  return { ok: true, id: requestId }
}

export async function respondToRequest(
  requestId: string,
  decision: 'accepted' | 'rejected',
): Promise<ActionResult> {
  if (decision !== 'accepted' && decision !== 'rejected') return { ok: false, error: 'invalid_decision' }

  const auth = await getAuthedClient()
  if (!auth) return { ok: false, error: 'unauthenticated' }

  const { data, error } = await auth.supabase
    .from('requests')
    .update({ status: decision })
    .eq('id', requestId)
    .eq('status', 'pending')
    .select('id')

  if (error) return failure(error)
  if (!data?.length) return { ok: false, error: 'not_allowed' }

  revalidateMarketplace()
  return { ok: true, id: requestId }
}

export async function completeRequest(requestId: string): Promise<ActionResult> {
  const auth = await getAuthedClient()
  if (!auth) return { ok: false, error: 'unauthenticated' }

  const { data, error } = await auth.supabase
    .from('requests')
    .update({ status: 'completed' })
    .eq('id', requestId)
    .eq('status', 'accepted')
    .select('id, listing_id')

  if (error) return failure(error)
  if (!data?.length) return { ok: false, error: 'not_allowed' }

  const listingId = data[0].listing_id
  const { data: listing, error: listingError } = await auth.supabase
    .from('listings')
    .select('type')
    .eq('id', listingId)
    .single()

  if (listingError || !listing) return failure(listingError)

  const { error: availabilityError } = await auth.supabase
    .from('listings')
    .update({ availability: AVAILABILITY_BY_TYPE[listing.type as ListingType] })
    .eq('id', listingId)

  if (availabilityError) return failure(availabilityError)

  revalidateMarketplace()
  return { ok: true, id: requestId }
}

export async function reviewListing(
  listingId: string,
  decision: 'certified' | 'rejected',
): Promise<ActionResult> {
  if (decision !== 'certified' && decision !== 'rejected') return { ok: false, error: 'invalid_decision' }

  const auth = await getAuthedClient()
  if (!auth) return { ok: false, error: 'unauthenticated' }

  const { data, error } = await auth.supabase
    .from('listings')
    .update({ certification_status: decision })
    .eq('id', listingId)
    .select('id')

  if (error) return failure(error)
  if (!data?.length) return { ok: false, error: 'not_allowed' }

  revalidateMarketplace()
  return { ok: true, id: listingId }
}

export async function reviewDocument(
  documentId: string,
  decision: 'approved' | 'rejected',
): Promise<ActionResult> {
  if (decision !== 'approved' && decision !== 'rejected') return { ok: false, error: 'invalid_decision' }

  const auth = await getAuthedClient()
  if (!auth) return { ok: false, error: 'unauthenticated' }

  const { data, error } = await auth.supabase
    .from('validation_documents')
    .update({ review_status: decision })
    .eq('id', documentId)
    .select('id')

  if (error) return failure(error)
  if (!data?.length) return { ok: false, error: 'not_allowed' }

  revalidatePath('/admin')
  revalidatePath('/dashboard/buyer')
  return { ok: true, id: documentId }
}
