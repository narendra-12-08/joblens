import { Job } from '@/lib/types'

export async function scrapeRemoteOK(query: string): Promise<Job[]> {
  try {
    const res = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobLens/1.0)' },
      next: { revalidate: 1800 },
    })
    if (!res.ok) return []
    const data = await res.json()
    const jobs = data.filter((j: any) => j.id && j.company) // first item is metadata

    const q = query.toLowerCase()
    const filtered = q
      ? jobs.filter((j: any) =>
          [j.position, j.company, ...(j.tags || [])].join(' ').toLowerCase().includes(q)
        )
      : jobs

    return filtered.slice(0, 20).map((j: any): Job => ({
      id: `remoteok-${j.id}`,
      title: j.position || 'Software Engineer',
      company: j.company || 'Unknown',
      location: 'Remote',
      remote: true,
      salary: j.salary_min && j.salary_max
        ? `$${(j.salary_min / 1000).toFixed(0)}k – $${(j.salary_max / 1000).toFixed(0)}k`
        : j.salary_min ? `$${(j.salary_min / 1000).toFixed(0)}k+` : null,
      description: (j.description || '').replace(/<[^>]+>/g, '').slice(0, 300),
      tags: (j.tags || []).slice(0, 6),
      url: j.url || `https://remoteok.com/remote-jobs/${j.id}`,
      postedAt: j.date ? new Date(j.date).toISOString() : new Date().toISOString(),
      closingDate: null,
      source: 'remoteok',
      visaSponsorship: false,
      jobType: 'remote',
      companyLogo: j.company_logo || null,
    }))
  } catch {
    return []
  }
}
