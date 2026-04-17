import { NextRequest, NextResponse } from 'next/server'
import { scrapeIndeed } from '@/lib/scrapers/indeed'
import { scrapeRemoteOK } from '@/lib/scrapers/remoteok'
import { scrapeRemotive } from '@/lib/scrapers/remotive'
import { scrapeArbeitnow } from '@/lib/scrapers/arbeitnow'
import { scrapeHN } from '@/lib/scrapers/hn'
import { Job } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const query = searchParams.get('q') || ''
  const location = searchParams.get('location') || 'India'
  const remote = searchParams.get('remote') === 'true'
  const closing = searchParams.get('closing') === 'true' // closing soon filter

  // Run all scrapers in parallel
  const [indeed, remoteok, remotive, arbeitnow, hn] = await Promise.allSettled([
    scrapeIndeed(query, location),
    scrapeRemoteOK(query),
    scrapeRemotive(query),
    scrapeArbeitnow(query),
    scrapeHN(query),
  ])

  const extract = (r: PromiseSettledResult<Job[]>) =>
    r.status === 'fulfilled' ? r.value : []

  let jobs: Job[] = [
    ...extract(indeed),
    ...(remote ? [] : []), // local-only mode skips remote-only sources partially
    ...extract(remoteok),
    ...extract(remotive),
    ...extract(arbeitnow),
    ...extract(hn),
  ]

  // Deduplicate by title+company
  const seen = new Set<string>()
  jobs = jobs.filter(j => {
    const key = `${j.title.toLowerCase()}-${j.company.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Filter: remote only
  if (remote) {
    jobs = jobs.filter(j => j.remote)
  }

  // Sort: closing soon first, then by date
  const now = Date.now()
  const sevenDays = 7 * 24 * 60 * 60 * 1000

  const closingSoon = jobs.filter(j => {
    if (!j.closingDate) return false
    const diff = new Date(j.closingDate).getTime() - now
    return diff > 0 && diff <= sevenDays
  })

  const rest = jobs.filter(j => {
    if (!j.closingDate) return true
    const diff = new Date(j.closingDate).getTime() - now
    return !(diff > 0 && diff <= sevenDays)
  })

  // Sort rest by posted date descending
  rest.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())

  const sorted = [...closingSoon, ...rest]

  return NextResponse.json({
    jobs: sorted,
    meta: {
      total: sorted.length,
      closingSoon: closingSoon.length,
      sources: {
        indeed: extract(indeed).length,
        remoteok: extract(remoteok).length,
        remotive: extract(remotive).length,
        arbeitnow: extract(arbeitnow).length,
        hn: extract(hn).length,
      }
    }
  })
}
