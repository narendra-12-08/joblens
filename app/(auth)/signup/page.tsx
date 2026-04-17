'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Zap } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Check your email to confirm.')
      router.push("/"); router.refresh()
      router.refresh()
    }
    setLoading(false)
  }

  const inputStyle = {
    background: 'var(--glass-input)',
    border: '1px solid var(--border-glass)',
    color: 'var(--text-primary)',
    backdropFilter: 'blur(8px)',
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center btn-aurora">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>JobTrack</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-7"
          style={{
            background: 'var(--glass-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-glass)',
          }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create account</h1>
          <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>Start tracking your job search for free</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Full Name
              </label>
              <input type="text" placeholder="Jane Smith" required
                value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                style={inputStyle} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <input type="email" placeholder="you@example.com" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                style={inputStyle} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <input type="password" placeholder="Min 6 characters" required minLength={6}
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                style={inputStyle} />
            </div>
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-sm font-bold btn-aurora flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : 'Create account'}
            </motion.button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: '#818CF8' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
