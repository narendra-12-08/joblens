import { Job } from '@/lib/types'

export async function scrapeRemotive(query: string): Promise<Job[]> {
  try {
    const url = query
      ? `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=20`
      : 'https://remotive.com/api/remote-jobs?limit=20'
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json()
    return (data.jobs || []).slice(0, 20).map((j: any): Job => ({
      id: `remotive-${j.id}`,
      title: j.title || '',
      company: j.company_name || '',
      location: j.candidate_required_location || 'Remote',
      remote: true,
      salary: j.salary || null,
      description: (j.description || '').replace(/<[^>]+>/g, '').slice(0, 300),
      tags: (j.tags || []).slice(0, 6),
      url: j.url || '',
      postedAt: j.publication_date ? new Date(j.publication_date).toISOString() : new Date().toISOString(),
      closingDate: null,
      source: 'remotive',
      visaSponsorship: false,
      jobType: 'remote',
      companyLogo: j.company_logo || null,
    }))
  } catch {
    return []
  }
}
