import { SearchClient } from '@/components/search-client'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <SearchClient user={user} />
}
