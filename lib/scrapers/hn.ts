import { Job } from '@/lib/types'

// HN "Who is Hiring" — latest monthly thread via Algolia HN API
export async function scrapeHN(query: string): Promise<Job[]> {
  try {
    // Find the latest "Ask HN: Who is hiring?" thread
    const searchRes = await fetch(
      'https://hn.algolia.com/api/v1/search?query=Ask+HN+Who+is+hiring&tags=story,ask_hn&hitsPerPage=1',
      { next: { revalidate: 3600 } }
    )
    if (!searchRes.ok) return []
    const searchData = await searchRes.json()
    const threadId = searchData.hits?.[0]?.objectID
    if (!threadId) return []

    // Fetch comments (each comment = one job post)
    const commentsRes = await fetch(
      `https://hn.algolia.com/api/v1/search?tags=comment,story_${threadId}&hitsPerPage=50`,
      { next: { revalidate: 3600 } }
    )
    if (!commentsRes.ok) return []
    const commentsData = await commentsRes.json()

    const q = query.toLowerCase()
    const comments = (commentsData.hits || []).filter((c: any) => {
      if (!c.comment_text) return false
      if (q) return c.comment_text.toLowerCase().includes(q)
      return true
    })

    return comments.slice(0, 15).map((c: any, i: number): Job => {
      const text = (c.comment_text || '').replace(/<[^>]+>/g, '').trim()
      const lines = text.split('\n').filter(Boolean)

      // First line usually has company | role | location | remote
      const firstLine = lines[0] || ''
      const parts = firstLine.split('|').map((p: string) => p.trim())

      const company = parts[0] || 'Startup'
      const title = parts[1] || 'Software Engineer'
      const location = parts.find((p: string) => /remote|onsite|hybrid|india|usa|uk|europe/i.test(p)) || 'Remote'

      const salary = extractHNSalary(text)
      const tags = extractHNTags(text)

      return {
        id: `hn-${c.objectID || i}`,
        title,
        company,
        location,
        remote: /remote/i.test(text),
        salary,
        description: text.slice(0, 300),
        tags,
        url: `https://news.ycombinator.com/item?id=${c.objectID}`,
        postedAt: c.created_at || new Date().toISOString(),
        closingDate: null,
        source: 'hn',
        visaSponsorship: /visa/i.test(text),
        jobType: detectJobType(text),
        companyLogo: null,
      }
    })
  } catch {
    return []
  }
}

function extractHNSalary(text: string): string | null {
  const m = text.match(/\$[\d,]+(?:k)?(?:\s*[-–]\s*\$[\d,]+(?:k)?)?(?:\s*\/\s*(?:yr|year|mo|month))?/i)
  return m ? m[0] : null
}

function extractHNTags(text: string): string[] {
  const tech = ['React','Node','Python','Go','Rust','TypeScript','AWS','Kubernetes','ML','AI','iOS','Android','Rails','Django','Vue','Elixir','Java','Scala','Swift','Kotlin']
  return tech.filter(t => new RegExp(t, 'i').test(text)).slice(0, 6)
}

function detectJobType(text: string): Job['jobType'] {
  if (/intern/i.test(text)) return 'internship'
  if (/contract/i.test(text)) return 'contract'
  if (/part.?time/i.test(text)) return 'part-time'
  if (/remote/i.test(text)) return 'remote'
  if (/hybrid/i.test(text)) return 'hybrid'
  return 'full-time'
}
