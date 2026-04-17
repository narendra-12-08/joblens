'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Job, JobSource } from '@/lib/types'
import { JobCard } from './job-card'
import { Search, MapPin, Wifi, Filter, AlertCircle, Loader2, Zap, Clock, X } from 'lucide-react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface Props { user: User | null }

const SOURCE_LABELS: Record<JobSource, string> = {
  indeed: 'Indeed',
  remoteok: 'RemoteOK',
  remotive: 'Remotive',
  arbeitnow: 'Arbeitnow',
  hn: 'HN Hiring',
}

const SOURCE_COLORS: Record<JobSource, string> = {
  indeed: '#2557A7',
  remoteok: '#24292e',
  remotive: '#404EED',
  arbeitnow: '#FF4B00',
  hn: '#FF6600',
}

const POPULAR = ['React Developer', 'Python Engineer', 'Product Manager', 'Data Scientist', 'DevOps Engineer', 'UI Designer']

export function SearchClient({ user }: Props) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('India')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [meta, setMeta] = useState<{ total: number; closingSoon: number; sources: Record<string, number> } | null>(null)
  const [activeSource, setActiveSource] = useState<JobSource | 'all'>('all')
  const [showSalaryOnly, setShowSalaryOnly] = useState(false)
  const [visaOnly, setVisaOnly] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const closingSoon = jobs.filter(j => {
    if (!j.closingDate) return false
    const diff = new Date(j.closingDate).getTime() - Date.now()
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000
  })

  const filtered = jobs.filter(j => {
    if (activeSource !== 'all' && j.source !== activeSource) return false
    if (showSalaryOnly && !j.salary) return false
    if (visaOnly && !j.visaSponsorship) return false
    return true
  })

  const search = useCallback(async (q: string, loc: string, remote: boolean) => {
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams({ q, location: loc, remote: String(remote) })
      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()
      setJobs(data.jobs || [])
      setMeta(data.meta || null)
    } catch {
      setJobs([])
    }
    setLoading(false)
  }, [])

  // Auto-search on load with empty query
  useEffect(() => {
    search('', 'India', false)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    search(query, location, remoteOnly)
  }

  function handleQueryChange(val: string) {
    setQuery(val)
    clearTimeout(debounceRef.current)
    if (val.length > 2) {
      debounceRef.current = setTimeout(() => search(val, location, remoteOnly), 600)
    }
  }

  const glassCard = {
    background: 'var(--glass-card)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid var(--border-glass)',
    boxShadow: 'var(--shadow-glass)',
  }

  const inputStyle = {
    background: 'var(--glass-input)',
    border: '1px solid var(--border-glass)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3"
        style={{ background: 'rgba(5,7,15,0.85)', backdropFilter: 'blur(30px)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center btn-aurora">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>JobLens</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/saved" className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(129,140,248,0.12)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.2)' }}>
                Saved Jobs
              </Link>
            ) : (
              <Link href="/login" className="text-xs font-semibold px-3 py-1.5 rounded-xl btn-aurora text-white">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 pb-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Find your next{' '}
            <span style={{ background: 'var(--aurora)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              opportunity
            </span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Local + remote jobs from Indeed, RemoteOK, Remotive, Arbeitnow & HN — all in one place
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <form onSubmit={handleSearch} className="rounded-2xl p-3 space-y-3" style={glassCard}>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Query */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none"
                  style={inputStyle}
                  placeholder="Job title, skill, or company…"
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                />
              </div>
              {/* Location */}
              <div className="relative sm:w-44">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none"
                  style={inputStyle}
                  placeholder="City or country"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
              <button type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-bold btn-aurora text-white flex items-center justify-center gap-2 sm:w-28">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </button>
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <button type="button" onClick={() => { setRemoteOnly(!remoteOnly); search(query, location, !remoteOnly) }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: remoteOnly ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)',
                  color: remoteOnly ? '#34D399' : 'var(--text-muted)',
                  border: remoteOnly ? '1px solid rgba(52,211,153,0.3)' : '1px solid var(--border-glass)',
                }}>
                <Wifi className="h-3 w-3" /> Remote only
              </button>
              <button type="button" onClick={() => setShowSalaryOnly(!showSalaryOnly)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: showSalaryOnly ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                  color: showSalaryOnly ? '#FBBF24' : 'var(--text-muted)',
                  border: showSalaryOnly ? '1px solid rgba(251,191,36,0.3)' : '1px solid var(--border-glass)',
                }}>
                💰 Salary shown
              </button>
              <button type="button" onClick={() => setVisaOnly(!visaOnly)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: visaOnly ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.04)',
                  color: visaOnly ? '#818CF8' : 'var(--text-muted)',
                  border: visaOnly ? '1px solid rgba(129,140,248,0.3)' : '1px solid var(--border-glass)',
                }}>
                ✈️ Visa sponsorship
              </button>
            </div>
          </form>
        </motion.div>

        {/* Popular searches */}
        {!searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2">
            {POPULAR.map(p => (
              <button key={p} onClick={() => { setQuery(p); search(p, location, remoteOnly) }}
                className="px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border-glass)' }}>
                {p}
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#818CF8' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Searching across all sources…</span>
          </div>
        )}

        {!loading && searched && (
          <>
            {/* Meta / source pills */}
            {meta && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{filtered.length}</span> jobs found
                    {meta.closingSoon > 0 && (
                      <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171', border: '1px solid rgba(248,113,113,0.25)' }}>
                        {meta.closingSoon} closing soon
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', ...Object.keys(meta.sources)] as (JobSource | 'all')[]).map(src => {
                      const count = src === 'all' ? meta.total : meta.sources[src] || 0
                      if (src !== 'all' && count === 0) return null
                      return (
                        <button key={src} onClick={() => setActiveSource(src)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: activeSource === src ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.04)',
                            color: activeSource === src ? '#818CF8' : 'var(--text-muted)',
                            border: activeSource === src ? '1px solid rgba(129,140,248,0.3)' : '1px solid var(--border-glass)',
                          }}>
                          {src === 'all' ? `All (${count})` : `${SOURCE_LABELS[src as JobSource]} (${count})`}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Closing soon alert section */}
            {closingSoon.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" style={{ color: '#F87171' }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#F87171' }}>
                    Closing Soon — Apply Now
                  </h2>
                </div>
                <div className="space-y-3">
                  {closingSoon.map((job, i) => (
                    <JobCard key={job.id} job={job} user={user} index={i} urgent />
                  ))}
                </div>
                <div className="my-6 border-t" style={{ borderColor: 'var(--border-glass)' }} />
              </motion.div>
            )}

            {/* Main results */}
            {filtered.filter(j => !closingSoon.includes(j)).length > 0 ? (
              <div className="space-y-3">
                {filtered.filter(j => !closingSoon.includes(j)).map((job, i) => (
                  <JobCard key={job.id} job={job} user={user} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-2">
                <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>No jobs found</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try a different search term or location</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
