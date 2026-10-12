import { supabase } from './supabase'
import { ContentItem, LiveStream, User } from './types'

export async function getContentItems(options?: {
  type?: ContentItem['type']
  limit?: number
  offset?: number
  publishedOnly?: boolean
}): Promise<{ data: ContentItem[] | null; error: Error | null }> {
  let query = supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false })

  if (options?.publishedOnly) {
    query = query.eq('is_published', true)
  }

  if (options?.type) {
    query = query.eq('type', options.type)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data, error } = await query
  return { data: data as ContentItem[] | null, error: error as Error | null }
}

export async function getContentItem(id: string): Promise<{ data: ContentItem | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single()

  return { data: data as ContentItem | null, error: error as Error | null }
}

export async function createContentItem(item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount'>): Promise<{ data: ContentItem | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('content')
    .insert([{
      ...item,
      view_count: 0,
      like_count: 0,
    }])
    .select()
    .single()

  return { data: data as ContentItem | null, error: error as Error | null }
}

export async function updateContentItem(id: string, updates: Partial<ContentItem>): Promise<{ data: ContentItem | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('content')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data: data as ContentItem | null, error: error as Error | null }
}

export async function deleteContentItem(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id)

  return { error: error as Error | null }
}

export async function incrementViewCount(id: string): Promise<void> {
  await supabase.rpc('increment_view_count', { content_id: id })
}

export async function getLiveStreams(): Promise<{ data: LiveStream[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('live_streams')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: data as LiveStream[] | null, error: error as Error | null }
}

export async function createLiveStream(stream: Omit<LiveStream, 'id' | 'createdAt' | 'updatedAt' | 'viewerCount' | 'maxViewers'>): Promise<{ data: LiveStream | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('live_streams')
    .insert([{
      ...stream,
      viewer_count: 0,
      max_viewers: 0,
    }])
    .select()
    .single()

  return { data: data as LiveStream | null, error: error as Error | null }
}

export async function updateLiveStream(id: string, updates: Partial<LiveStream>): Promise<{ data: LiveStream | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('live_streams')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data: data as LiveStream | null, error: error as Error | null }
}

export async function getUserProfile(userId: string): Promise<{ data: User | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return { data: data as User | null, error: error as Error | null }
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<{ data: User | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { data: data as User | null, error: error as Error | null }
}