/**
 * Upload a security document (CDL, BOL, biometric) to iron-vault and log in verification_logs.
 * Path: iron-vault/{load_id}/{driver_id}/{type}.jpg
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export type SecurityDocType = 'cdl' | 'bol' | 'biometric'

const BUCKET = 'iron-vault'

export async function uploadSecurityDoc(
  supabase: SupabaseClient,
  params: {
    loadId: string
    driverId: string
    file: File
    type: SecurityDocType
  }
): Promise<{ path: string; error: Error | null }> {
  const { loadId, driverId, file, type } = params
  const path = `${loadId}/${driverId}/${type}.jpg`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (uploadError) return { path: '', error: uploadError as unknown as Error }

  const { error: logError } = await supabase.from('verification_logs').insert({
    load_id: loadId,
    driver_id: driverId,
    doc_type: type,
    file_path: path,
  })
  if (logError) return { path, error: logError as unknown as Error }

  return { path, error: null }
}
