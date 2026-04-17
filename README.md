<div align="center">

# 🔍 JobLens

**Search jobs from every source — local & remote — in one place.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-joblens--black.vercel.app-818CF8?style=for-the-badge&logo=vercel)](https://joblens-black.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

JobLens aggregates jobs from **Indeed, RemoteOK, Remotive, Arbeitnow and Hacker News** — no API keys required, completely free. Search local jobs in your city alongside remote opportunities worldwide.

[**Live Demo →**](https://joblens-black.vercel.app) · [**Report Bug**](https://github.com/narendra-12-08/joblens/issues) · [**Request Feature**](https://github.com/narendra-12-08/joblens/issues)

</div>

---

## ✨ Features

- **🌏 Local + Remote** — Searches Indeed (India/global) for local jobs alongside 4 remote-first sources simultaneously
- **⏰ Closing Soon Alerts** — Jobs with expiring deadlines are surfaced at the top automatically
- **💰 Salary Filter** — Show only listings that display a salary range
- **✈️ Visa Sponsorship Filter** — One click to filter jobs offering visa sponsorship
- **🏷️ Tech Stack Tags** — Auto-extracted from job descriptions (React, Python, AWS, etc.)
- **📡 5 Sources at Once** — Indeed · RemoteOK · Remotive · Arbeitnow · HN Who's Hiring
- **🔖 Save to JobTrack** — One click saves any job to your [JobTrack](https://github.com/narendra-12-08/jobtrack) pipeline
- **🚫 No API keys needed** — All sources are free, public endpoints or RSS feeds
- **📱 Mobile first** — Clean responsive UI with Fluid Glass aesthetic
- **⚡ Fast** — All 5 sources fetched in parallel, results in ~2s

## 📡 Data Sources

| Source | Type | Auth Required | Coverage |
|---|---|---|---|
| [Indeed](https://indeed.com) | RSS Feed | None | Local jobs worldwide |
| [RemoteOK](https://remoteok.com) | Public JSON API | None | Remote tech jobs |
| [Remotive](https://remotive.com) | Public JSON API | None | Remote jobs all categories |
| [Arbeitnow](https://arbeitnow.com) | Public JSON API | None | Europe + remote, visa info |
| [HN Who's Hiring](https://news.ycombinator.com) | Algolia HN API | None | Startup jobs, direct contact |

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Turbopack) |
| Auth + Database | Supabase |
| Styling | Tailwind CSS v4 + Fluid Glass design system |
| Animations | Framer Motion |
| Icons | Lucide React |
| Deployment | Vercel |

## 🖥️ Getting Started

### 1. Clone & install
```bash
git clone https://github.com/narendra-12-08/joblens.git
cd joblens
npm install
```

### 2. Environment variables (optional — only needed for Save to JobTrack)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run
```bash
npm run dev
```

Search works immediately with no credentials. Supabase is only needed for the "Save to JobTrack" feature.

## 📁 Project Structure

```
app/
  page.tsx              # Home — server fetches user session
  api/jobs/route.ts     # Aggregator API — runs all scrapers in parallel
  (auth)/               # Login, signup, reset password
components/
  search-client.tsx     # Main search UI — query, filters, results
  job-card.tsx          # Individual job card with save action
lib/
  scrapers/
    indeed.ts           # Indeed RSS feed parser
    remoteok.ts         # RemoteOK JSON API
    remotive.ts         # Remotive JSON API
    arbeitnow.ts        # Arbeitnow JSON API
    hn.ts               # HN Who's Hiring via Algolia
  types.ts              # Job, JobSource interfaces
```

## 🔗 Pair with JobTrack

JobLens and [JobTrack](https://github.com/narendra-12-08/jobtrack) share the same Supabase project. Sign in once, find jobs on JobLens, save them with one click, then manage your pipeline on JobTrack.

## 🤝 Contributing

1. Fork the repo
2. Create your branch: `git checkout -b feature/new-source`
3. Add your scraper in `lib/scrapers/`
4. Register it in `app/api/jobs/route.ts`
5. Open a Pull Request

New job source integrations are especially welcome!

## 📄 License

MIT — free to use, modify and distribute.

---

<div align="center">
Made with ❤️ · Pair it with <a href="https://github.com/narendra-12-08/jobtrack">JobTrack</a> to manage your applications
</div>
