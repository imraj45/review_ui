import type { Platform } from '../data/platforms'
import type { FieldValues } from '../pages/review/constants'
import type { AiReviewResponse } from '../store/reviewApi'

// Map from API section titles to internal tab names (G2)
const g2SectionToTab: Record<string, string> = {
  'Recommendation Score': 'Q1',
  'What You Like Best': 'Q2',
  'What You Dislike': 'Q3',
  'Problems Solved': 'Q4',
  'Purpose of Use': 'Q5',
  'Title for your review': 'Q6',
  'Review Title': 'Q6',
  'Feature Review': 'Q7',
  'Ratings & AI Trust': 'Q8',
  'About You': 'About You',
  'Your Role & Alternatives': 'About You 2',
  'Your Details & Experience': 'About You 3',
  'Switching Details': 'About You 4',
  'Integrations': 'About You 5',
  'Your Organization': 'About Org',
}

// Capterra uses tab titles that match tab names directly
const capterraSectionToTab: Record<string, string> = {
  'My Experience': 'My Experience',
  'My Usage': 'My Usage',
  'Product Rating': 'Product Rating',
  'Feature Rating': 'Feature Rating',
  'Setup': 'Setup',
  'Work Information': 'Work Information',
}

// Product Hunt uses tab names that match directly
const phSectionToTab: Record<string, string> = {
  'Review': 'Review',
  'AI Questions': 'AI Questions',
  'Ratings': 'Ratings',
}

const tpSectionToTab: Record<string, string> = {
  'Review': 'Review',
}

const cwsSectionToTab: Record<string, string> = {
  'Review': 'Review',
}

const sectionMaps: Record<string, Record<string, string>> = {
  g2: g2SectionToTab,
  capterra: capterraSectionToTab,
  ph: phSectionToTab,
  tp: tpSectionToTab,
  cws: cwsSectionToTab,
}

// Convert API feature_table response {name: rating} to internal format
function transformFeatureTable(val: Record<string, unknown>): string {
  const result: Record<string, { importance: string; rating: number; text: string; removed: boolean }> = {}
  for (const [name, rating] of Object.entries(val)) {
    if (typeof rating === 'number') {
      result[name] = { importance: 'Important', rating, text: '', removed: false }
    }
  }
  return JSON.stringify(result)
}

// Convert API integration_rating response {name: {selected, rating}} to internal format
function transformIntegrationRating(val: Record<string, unknown>): string {
  const selected: string[] = []
  const ratings: Record<string, { importance: string; rating: number }> = {}
  for (const [name, info] of Object.entries(val)) {
    if (info && typeof info === 'object' && 'selected' in info) {
      const entry = info as { selected: boolean; rating: number }
      if (entry.selected) {
        selected.push(name)
        ratings[name] = { importance: 'Important', rating: entry.rating ?? 0 }
      }
    }
  }
  return JSON.stringify({ selected, ratings })
}

// Convert API review_preview "confirmed" to internal format
function transformReviewPreview(val: unknown): string {
  if (val === 'confirmed') {
    return JSON.stringify({ anonymous: false, certified: true })
  }
  if (typeof val === 'object' && val !== null) {
    return JSON.stringify(val)
  }
  return JSON.stringify({ anonymous: false, certified: false })
}

export function mapAiResponseToFieldValues(
  platform: Platform,
  response: AiReviewResponse
): FieldValues {
  const values: FieldValues = {}
  // Support both response shapes: { data: {...} } and { review: { reviewData: {...} } }
  const data = response.data ?? response.review?.reviewData
  if (!data) return values
  const sectionToTab = sectionMaps[platform.id] ?? {}

  for (const [sectionTitle, sectionData] of Object.entries(data)) {
    // Try explicit mapping first, then fall back to matching by tab title or tab name
    let tabName = sectionToTab[sectionTitle]
    if (!tabName) {
      const found = platform.tabs.find((t) => t.title === sectionTitle || t.name === sectionTitle)
      if (found) tabName = found.name
      else continue
    }

    const tab = platform.tabs.find((t) => t.name === tabName)
    if (!tab) continue

    // Special case: G2 Feature Review — the section data IS the feature_rating object
    if (platform.id === 'g2' && tabName === 'Q7') {
      values[`${tabName}::0`] = JSON.stringify(sectionData)
      continue
    }

    // Special case: PH ai_questions — the section data IS the answers object
    if (tabName === 'AI Questions' && tab.fields[0]?.type === 'ai_questions') {
      values[`${tabName}::0`] = JSON.stringify(sectionData)
      continue
    }

    // Special case: PH ph_multi_rating — the section data IS the ratings object
    if (tabName === 'Ratings' && tab.fields[0]?.type === 'ph_multi_rating') {
      values[`${tabName}::0`] = JSON.stringify(sectionData)
      continue
    }

    // General case: match by field label
    const apiKeys = Object.keys(sectionData)
    const apiProductName = response.productName ?? response.review?.productName ?? ''

    for (let i = 0; i < tab.fields.length; i++) {
      const field = tab.fields[i]
      let val = sectionData[field.label]
      // Fallback: swap productName in label to match API key (e.g. if platform labels differ)
      if (val == null && apiProductName && platform.productName) {
        const swappedLabel = field.label.replace(new RegExp(platform.productName, 'gi'), apiProductName)
        val = sectionData[swappedLabel]
      }
      // Fallback: normalize both sides by stripping product names
      if (val == null) {
        const normalize = (s: string) => s.toLowerCase().replace(new RegExp(`\\b(${platform.productName}|${apiProductName})\\b`, 'gi'), '').replace(/\s+/g, ' ').trim()
        const normalizedLabel = normalize(field.label)
        const matchedKey = apiKeys.find((k) => normalize(k) === normalizedLabel)
        if (matchedKey) val = sectionData[matchedKey]
      }
      // Last resort: match by field type name (API sometimes returns type as key instead of label)
      if (val == null && field.type) {
        val = sectionData[field.type]
      }
      if (val == null) continue

      const key = `${tabName}::${i}`

      // rating_na / scale / nps_scale: clamp numeric values to valid range
      if ((field.type === 'rating_na' || field.type === 'scale' || field.type === 'nps_scale') && typeof val === 'number') {
        const min = field.scaleStart ?? (field.type === 'nps_scale' ? 0 : 1)
        const max = field.scaleMax ?? (field.type === 'nps_scale' ? 10 : 7)
        values[key] = String(Math.min(Math.max(val, min), max))
        continue
      }

      // tag_textarea: wrap plain string into {tags:[], text:"..."}
      if (field.type === 'tag_textarea' && typeof val === 'string') {
        values[key] = JSON.stringify({ tags: [], text: val })
      }
      // feature_table: transform {name: rating} to {name: {importance, rating, text, removed}}
      else if (field.type === 'feature_table' && typeof val === 'object' && !Array.isArray(val)) {
        values[key] = transformFeatureTable(val as Record<string, unknown>)
      }
      // integration_rating: transform {name: {selected, rating}} to {selected: [], ratings: {}}
      else if (field.type === 'integration_rating' && typeof val === 'object' && !Array.isArray(val)) {
        values[key] = transformIntegrationRating(val as Record<string, unknown>)
      }
      // review_preview: transform "confirmed" to {anonymous, certified}
      else if (field.type === 'review_preview') {
        values[key] = transformReviewPreview(val)
      }
      // multi_dropdown with hasSubRating needs wrapping
      else if (field.type === 'multi_dropdown' && field.hasSubRating && Array.isArray(val)) {
        values[key] = JSON.stringify({ selected: val, ratings: {} })
      }
      // arrays (multi_select, multi_dropdown)
      else if (Array.isArray(val)) {
        values[key] = JSON.stringify(val)
      }
      // other objects
      else if (typeof val === 'object') {
        values[key] = JSON.stringify(val)
      }
      // primitives (strings, numbers)
      else {
        values[key] = String(val)
      }
    }
  }

  return values
}
