import { Job } from '@/lib/types'

const INDEED_RSS = 'https://in.indeed.com/rss'

export async function scrapeIndeed(query: string, location: string): Promise<Job[]> {
  try {
    const url = `${INDEED_RSS}?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}&sort=date&radius=25`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobLens/1.0)' },
      next: { revalidate: 1800 }, // cache 30 min
    })
    if (!res.ok) return []
    const xml = await res.text()
    return parseIndeedRSS(xml)
  } catch {
    return []
  }
}

function parseIndeedRSS(xml: string): Job[] {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
  return items.slice(0, 20).map((item, i) => {
    const get = (tag: string) => {
      const m = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
      return m ? (m[1] || m[2] || '').trim() : ''
    }

    const title = get('title')
    const link = get('link') || get('guid')
    const pubDate = get('pubDate')
    const description = get('description').replace(/<[^>]+>/g, '').trim()

    // Extract company & location from title pattern "Job Title - Company (Location)"
    const titleMatch = title.match(/^(.+?)\s*[-–]\s*(.+?)(?:\s*[\(\-]\s*(.+?)\s*\)?)?$/)
    const jobTitle = titleMatch ? titleMatch[1].trim() : title
    const company = titleMatch ? titleMatch[2].trim() : 'Unknown'
    const loc = titleMatch?.[3]?.trim() || 'India'

    const salary = extractSalary(description)
    const tags = extractTags(title + ' ' + description)
    const closingDate = extractClosingDate(description)

    return {
      id: `indeed-${i}-${Date.now()}`,
      title: jobTitle,
      company,
      location: loc,
      remote: /remote/i.test(title + description),
      salary,
      description: description.slice(0, 300),
      tags,
      url: link,
      postedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      closingDate,
      source: 'indeed' as const,
      visaSponsorship: false,
      jobType: detectJobType(title + description),
      companyLogo: null,
    }
  }).filter(j => j.title && j.url)
}

function extractSalary(text: string): string | null {
  const m = text.match(/(?:₹|Rs\.?|INR|USD|\$)\s?[\d,]+(?:\s*[-–]\s*[\d,]+)?(?:\s*(?:per\s+(?:month|year|annum|hr|hour)|LPA|PA|p\.a\.))?/i)
  return m ? m[0].trim() : null
}

function extractTags(text: string): string[] {
  const techKeywords = [
    'React','Node','Python','Java','TypeScript','JavaScript','Angular','Vue',
    'AWS','Docker','Kubernetes','SQL','MongoDB','PostgreSQL','Redis','GraphQL',
    'Next.js','Django','Spring','Flutter','Swift','Kotlin','Go','Rust','PHP',
    'Machine Learning','AI','DevOps','CI/CD','Figma','HTML','CSS','REST','API',
  ]
  return techKeywords.filter(k => new RegExp(k, 'i').test(text)).slice(0, 6)
}

function extractClosingDate(text: string): string | null {
  const m = text.match(/(?:apply\s+by|last\s+date|closing\s+date|deadline)[:\s]+(\w+\s+\d{1,2},?\s*\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
  if (m) {
    const d = new Date(m[1])
    if (!isNaN(d.getTime())) return d.toISOString()
  }
  return null
}

function detectJobType(text: string): Job['jobType'] {
  if (/intern/i.test(text)) return 'internship'
  if (/contract|freelance/i.test(text)) return 'contract'
  if (/part.?time/i.test(text)) return 'part-time'
  if (/remote/i.test(text)) return 'remote'
  if (/hybrid/i.test(text)) return 'hybrid'
  return 'full-time'
}
