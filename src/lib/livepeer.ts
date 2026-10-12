const LIVEPEER_API_KEY = process.env.LIVEPEER_API_KEY || ''
const LIVEPEER_API_URL = 'https://livepeer.studio/api'

export interface LivepeerStream {
  streamKey: string
  playbackUrl: string
  providerId: string
}

/**
 * Creates a stream on Livepeer (free tier: 1000 streaming minutes/month).
 * Returns null when the API key is missing so callers can surface a clear error.
 */
export async function createLivepeerStream(name: string): Promise<LivepeerStream | null> {
  if (!LIVEPEER_API_KEY) return null

  const res = await fetch(`${LIVEPEER_API_URL}/stream`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${LIVEPEER_API_KEY}`,
    },
    body: JSON.stringify({ name, record: true }),
    cache: 'no-store',
  })

  if (!res.ok) {
    console.error('Livepeer stream creation failed:', res.status, await res.text())
    return null
  }

  const data = await res.json()
  return {
    streamKey: data.streamKey,
    playbackUrl: data.playbackUrl,
    providerId: data.id,
  }
}