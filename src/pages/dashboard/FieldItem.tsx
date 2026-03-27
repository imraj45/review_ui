import { useState, useCallback } from 'react'
import { Box, Typography } from '@mui/material'
import type { Field } from '../../data/platforms'
import { mono } from './constants'

export default function FieldItem({
  field,
  platformId,
}: {
  field: Field
  platformId: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!field.content) return
    navigator.clipboard.writeText(field.content).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [field.content])

  if (field.type === 'stars') {
    return (
      <Box
        sx={{
          background: '#0C0E11',
          border: '1px solid #1E2530',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <Typography
          sx={{
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#3D4A5A',
            padding: '8px 12px 0',
            fontFamily: mono,
          }}
        >
          {field.label}
        </Typography>
        <Box sx={{ display: 'flex', gap: '4px', padding: '8px 12px 10px' }}>
          {[...Array(5)].map((_, i) => (
            <Typography
              key={`${platformId}-star-${i}`}
              sx={{ fontSize: '18px', color: '#00C47A' }}
            >
              ★
            </Typography>
          ))}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 12px',
            background: '#0A0C10',
            borderTop: '1px solid #1A1E28',
          }}
        >
          <Typography
            sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}
          >
            // select 5 stars on platform
          </Typography>
        </Box>
      </Box>
    )
  }

  if (field.type === 'action') {
    return (
      <Box
        sx={{
          background: '#0C0E11',
          border: '1px solid #1E2530',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <Typography
          sx={{
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#3D4A5A',
            padding: '8px 12px 0',
            fontFamily: mono,
          }}
        >
          {field.label}
        </Typography>
        <Typography
          sx={{
            fontSize: '12.5px',
            color: '#A0B4C8',
            padding: '6px 12px 10px',
            lineHeight: 1.6,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {field.content}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 12px',
            background: '#0A0C10',
            borderTop: '1px solid #1A1E28',
          }}
        >
          <Typography
            sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}
          >
            // manual action required
          </Typography>
        </Box>
      </Box>
    )
  }

  if (field.type === 'select') {
    return (
      <Box
        sx={{
          background: '#0C0E11',
          border: '1px solid #1E2530',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <Typography
          sx={{
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#3D4A5A',
            padding: '8px 12px 0',
            fontFamily: mono,
          }}
        >
          {field.label}
        </Typography>
        <Typography
          sx={{
            fontSize: '12.5px',
            color: '#A0B4C8',
            padding: '6px 12px 10px',
            lineHeight: 1.6,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {field.content}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 12px',
            background: '#0A0C10',
            borderTop: '1px solid #1A1E28',
          }}
        >
          <Typography
            sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}
          >
            // select on platform
          </Typography>
        </Box>
      </Box>
    )
  }

  if (field.type === 'scale') {
    return (
      <Box
        sx={{
          background: '#0C0E11',
          border: '1px solid #1E2530',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <Typography
          sx={{
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#3D4A5A',
            padding: '8px 12px 0',
            fontFamily: mono,
          }}
        >
          {field.label}
        </Typography>
        <Typography
          sx={{
            fontSize: '12.5px',
            color: '#00C47A',
            padding: '6px 12px 10px',
            fontFamily: mono,
            fontWeight: 600,
          }}
        >
          {field.content} / {field.scaleMax}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 12px',
            background: '#0A0C10',
            borderTop: '1px solid #1A1E28',
          }}
        >
          <Typography
            sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}
          >
            // rate on platform
          </Typography>
        </Box>
      </Box>
    )
  }

  const charCount = field.content?.length ?? 0
  const charLabel = field.maxChars
    ? `${charCount} / ${field.maxChars} chars`
    : `${charCount} chars`

  return (
    <Box
      sx={{
        background: '#0C0E11',
        border: '1px solid #1E2530',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <Typography
        sx={{
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#3D4A5A',
          padding: '8px 12px 0',
          fontFamily: mono,
        }}
      >
        {field.label}
      </Typography>
      <Typography
        sx={{
          fontSize: '12.5px',
          color: '#A0B4C8',
          padding: '6px 12px 10px',
          lineHeight: 1.6,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {field.content}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 12px',
          background: '#0A0C10',
          borderTop: '1px solid #1A1E28',
        }}
      >
        <Typography
          sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}
        >
          {charLabel}
        </Typography>
        <Box
          component="button"
          onClick={handleCopy}
          sx={{
            fontSize: '10px',
            padding: '3px 10px',
            borderRadius: '4px',
            border: copied ? '1px solid #00C47A' : '1px solid #1E2A38',
            background: copied ? '#0D1F16' : '#111520',
            color: copied ? '#00C47A' : '#4A6080',
            cursor: 'pointer',
            fontFamily: mono,
            transition: 'all 0.15s',
            '&:hover': {
              borderColor: '#00C47A',
              color: '#00C47A',
            },
          }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </Box>
      </Box>
    </Box>
  )
}
