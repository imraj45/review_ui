import { Box, Typography } from '@mui/material'
import type { Tab } from '../../data/platforms'
import { mono, fieldKey } from './constants'
import type { FieldValues } from './constants'
import FieldBlock from './FieldBlock'

export default function TabPanel({
  tab,
  color,
  values,
  onFieldChange,
  disabled = false,
}: {
  tab: Tab
  color: string
  values: FieldValues
  onFieldChange: (key: string, val: string) => void
  disabled?: boolean
}) {
  return (
    <Box>
      <Box sx={{ mb: '1.25rem' }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#C8D8E8', mb: '4px' }}>
          {tab.title}
        </Typography>
        <Typography sx={{ fontSize: '11px', color: '#3D4A5A', fontFamily: mono }}>
          {tab.desc} — Copy each field and paste it on the real platform.
        </Typography>
      </Box>

      {tab.tip && (
        <Box sx={{ background: '#0D1F16', border: '1px solid #1A3D28', borderRadius: '8px', padding: '10px 12px', mb: '1rem' }}>
          <Typography sx={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00C47A', fontFamily: mono, mb: '4px' }}>
            Tip
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#5DCAA5', lineHeight: 1.55 }}>
            {tab.tip}
          </Typography>
        </Box>
      )}

      {tab.fields.map((field, i) => {
        const key = fieldKey(tab.name, i)

        // Conditional visibility — check field and its parent chain
        const isFieldVisible = (fieldIdx: number): boolean => {
          const f = tab.fields[fieldIdx]
          if (!f?.showWhen) return true
          // Check if parent field is visible first
          if (!isFieldVisible(f.showWhen.field)) return false
          const depKey = fieldKey(tab.name, f.showWhen.field)
          const depVal = values[depKey] ?? ''
          return Array.isArray(f.showWhen.value)
            ? f.showWhen.value.includes(depVal)
            : depVal === f.showWhen.value
        }
        if (!isFieldVisible(i)) return null

        return (
          <FieldBlock
            key={key}
            field={field}
            color={color}
            value={values[key] ?? ''}
            onChange={(val) => onFieldChange(key, val)}
            disabled={disabled}
          />
        )
      })}
    </Box>
  )
}
