import { Job } from '@/lib/types'

export async function scrapeArbeitnow(query: string): Promise<Job[]> {
  try {
    const url = query
      ? `https://arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}`
      : 'https://arbeitnow.com/api/job-board-api'
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json()
    return (data.data || []).slice(0, 20).map((j: any): Job => ({
      id: `arbeitnow-${j.slug}`,
      title: j.title || '',
      company: j.company_name || '',
      location: j.location || 'Remote',
      remote: j.remote || false,
      salary: null,
      description: (j.description || '').replace(/<[^>]+>/g, '').slice(0, 300),
      tags: (j.tags || []).slice(0, 6),
      url: j.url || '',
      postedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
      closingDate: null,
      source: 'arbeitnow',
      visaSponsorship: j.visa_sponsorship || false,
      jobType: j.job_types?.[0] || 'full-time',
      companyLogo: null,
    }))
  } catch {
    return []
  }
}
