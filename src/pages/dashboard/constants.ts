export const mono = "'JetBrains Mono', monospace"

export type ReviewStatus = 'not_started' | 'in_progress' | 'submitted' | 'approved'

export interface StatusConfig {
  label: string
  color: string
  bg: string
  border: string
}

export const statusMap: Record<ReviewStatus, StatusConfig> = {
  not_started: { label: 'Not Started', color: '#4A6080', bg: '#1A1E2A', border: '#2A3A50' },
  in_progress: { label: 'In Progress', color: '#F5A623', bg: '#1F1A0D', border: '#4A3A10' },
  submitted: { label: 'Submitted', color: '#4285F4', bg: '#0D1520', border: '#1A3050' },
  approved: { label: 'Approved', color: '#00C47A', bg: '#0D1F16', border: '#1A4030' },
}

const STORAGE_KEY = 'sniffer_review_statuses'

export function getStatuses(): Record<string, ReviewStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getStatus(platformId: string): ReviewStatus {
  return getStatuses()[platformId] ?? 'not_started'
}

export function setStatus(platformId: string, status: ReviewStatus) {
  const all = getStatuses()
  all[platformId] = status
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}
