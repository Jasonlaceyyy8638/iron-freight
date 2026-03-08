import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null | undefined = undefined

export function getSupabase(): SupabaseClient | null {
  if (_client !== undefined) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  _client = url && key ? createClient(url, key) : null
  return _client
}

export const supabase = getSupabase()
