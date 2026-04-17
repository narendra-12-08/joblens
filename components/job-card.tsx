'use client'

import { motion } from 'framer-motion'
import { Job, JobSource } from '@/lib/types'
import { MapPin, Clock, Wifi, ExternalLink, Bookmark, DollarSign, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'

interface Props {
  job: Job
  user: User | null
  index: number
  urgent?: boolean
}

const SOURCE_LABELS: Record<JobSource, string> = {
  indeed: 'Indeed',
  remoteok: 'RemoteOK',
  remotive: 'Remotive',
  arbeitnow: 'Arbeitnow',
  hn: 'HN Hiring',
}

const SOURCE_COLORS: Record<JobSource, string> = {
  indeed: '#2557A7',
  remoteok: '#34D399',
  remotive: '#818CF8',
  arbeitnow: '#F87171',
  hn: '#FB923C',
}

const avatarColors = ['#818CF8', '#F472B6', '#34D399', '#FBBF24', '#38BDF8', '#C084FC', '#F87171']

function getColor(name: string) {
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % avatarColors.length
  return avatarColors[idx]
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  const days = Math.floor(diff / 86400)
  if (days > 30) return `${Math.floor(days / 30)}mo ago`
  return `${days}d ago`
}

function daysUntil(iso: string) {
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
  if (diff <= 0) return 'Closed'
  if (diff === 1) return '1 day left'
  return `${diff} days left`
}

export function JobCard({ job, user, index, urgent }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const color = getColor(job.company)
  const srcColor = SOURCE_COLORS[job.source]

  async function saveToJobTrack() {
    if (!user) { toast.error('Sign in to save jobs to JobTrack'); return }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('job_applications').insert({
      user_id: user.id,
      company: job.company,
      role: job.title,
      location: job.location,
      remote: job.remote,
      job_url: job.url,
      status: 'applied',
      currency: 'INR',
      applied_date: new Date().toISOString().split('T')[0],
      notes: job.description,
    })
    if (error) { toast.error(error.message) } else {
      toast.success(`Saved "${job.title}" to JobTrack`)
      setSaved(true)
    }
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 30 }}
      className="rounded-2xl p-4 transition-all hover:scale-[1.005]"
      style={{
        background: urgent ? 'rgba(248,113,113,0.04)' : 'var(--glass-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: urgent ? '1px solid rgba(248,113,113,0.2)' : '1px solid var(--border-glass)',
        boxShadow: 'var(--shadow-glass)',
      }}
    >
      <div className="flex gap-3">
        {/* Company avatar / logo */}
        <div className="flex-shrink-0">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company}
              className="w-11 h-11 rounded-xl object-contain"
              style={{ background: 'rgba(255,255,255,0.05)', padding: '4px' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${color}CC, ${color}66)` }}>
              {job.company.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                {job.title}
              </h3>
              <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
                {job.company}
              </p>
            </div>
            {/* Source badge */}
            <span className="flex-shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide"
              style={{ background: `${srcColor}18`, color: srcColor, border: `1px solid ${srcColor}30` }}>
              {SOURCE_LABELS[job.source]}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {job.location && (
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <MapPin className="h-3 w-3" />
                <span>{job.location}</span>
              </div>
            )}
            {job.remote && (
              <div className="flex items-center gap-1 text-xs" style={{ color: '#34D399' }}>
                <Wifi className="h-3 w-3" />
                <span>Remote</span>
              </div>
            )}
            {job.salary && (
              <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#FBBF24' }}>
                <DollarSign className="h-3 w-3" />
                <span>{job.salary}</span>
              </div>
            )}
            {job.visaSponsorship && (
              <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                style={{ background: 'rgba(129,140,248,0.1)', color: '#818CF8' }}>
                ✈️ Visa
              </span>
            )}
            {job.closingDate && (
              <span className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: '#F87171' }}>
                <Clock className="h-3 w-3" />
                {daysUntil(job.closingDate)}
              </span>
            )}
          </div>

          {/* Tags */}
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {job.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions row */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {timeAgo(job.postedAt)}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={saveToJobTrack} disabled={saving || saved}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: saved ? 'rgba(52,211,153,0.12)' : 'rgba(129,140,248,0.10)',
                  color: saved ? '#34D399' : '#818CF8',
                  border: saved ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(129,140,248,0.2)',
                }}>
                <Bookmark className="h-3.5 w-3.5" />
                {saved ? 'Saved!' : 'Save to JobTrack'}
              </button>
              <a href={job.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold btn-aurora text-white">
                Apply
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
