export type JobSource = 'indeed' | 'remoteok' | 'remotive' | 'arbeitnow' | 'hn'

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote' | 'hybrid'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  salary: string | null
  description: string
  tags: string[]
  url: string
  postedAt: string          // ISO date string
  closingDate: string | null // ISO date string — null if unknown
  source: JobSource
  visaSponsorship: boolean
  jobType: JobType | null
  companyLogo: string | null
}

export interface SearchParams {
  query: string
  location: string
  remote: boolean
  sources: JobSource[]
}
