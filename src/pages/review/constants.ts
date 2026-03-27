import type { Platform } from '../../data/platforms'

export const mono = "'JetBrains Mono', monospace"

export type FieldValues = Record<string, string>

export function fieldKey(tabName: string, fieldIndex: number): string {
  return `${tabName}::${fieldIndex}`
}

export interface ReviewSubmission {
  platform: string
  platformId: string
  submittedAt: string
  sections: {
    tab: string
    fields: {
      label: string
      type: string
      value: string
    }[]
  }[]
}

export function buildReviewJson(platform: Platform, values: FieldValues): ReviewSubmission {
  return {
    platform: platform.name,
    platformId: platform.id,
    submittedAt: new Date().toISOString(),
    sections: platform.tabs.map((tab) => ({
      tab: tab.name,
      fields: tab.fields.map((field, i) => ({
        label: field.label,
        type: field.type ?? 'text',
        value: values[fieldKey(tab.name, i)] ?? '',
      })),
    })),
  }
}
