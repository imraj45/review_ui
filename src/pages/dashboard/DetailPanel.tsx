import { useState, useCallback } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import type { Platform } from '../../data/platforms'
import { mono, statusMap } from './constants'
import type { ReviewStatus } from './constants'
import { useGetReviewByPlatformQuery } from '../../store/reviewApi'
import type { AiSectionData } from '../../store/reviewApi'

function ReviewValue({ label, value }: { label: string; value: unknown }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    const text = typeof value === 'string' ? value
      : typeof value === 'number' ? String(value)
      : JSON.stringify(value, null, 2)
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [value])

  let display: React.ReactNode

  if (typeof value === 'number') {
    display = (
      <Typography sx={{ fontSize: '13px', color: '#00C47A', fontFamily: mono, fontWeight: 600 }}>
        {value}
      </Typography>
    )
  } else if (typeof value === 'string') {
    display = (
      <Typography sx={{ fontSize: '12.5px', color: '#A0B4C8', lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </Typography>
    )
  } else if (Array.isArray(value)) {
    display = (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {value.map((item, i) => (
          <Box key={i} sx={{ fontSize: '11px', padding: '3px 10px', borderRadius: '100px', border: '1px solid #2A3A50', color: '#A0B4C8', fontFamily: mono }}>
            {String(item)}
          </Box>
        ))}
      </Box>
    )
  } else if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    // Check if it's a rating+text combo (star_review_combo)
    if ('rating' in obj && 'text' in obj) {
      display = (
        <Box>
          <Box sx={{ display: 'flex', gap: '2px', mb: '6px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Typography key={s} sx={{ fontSize: '16px', color: s <= (obj.rating as number) ? '#00C47A' : '#2A3A50' }}>
                ★
              </Typography>
            ))}
          </Box>
          <Typography sx={{ fontSize: '12.5px', color: '#A0B4C8', lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif" }}>
            {obj.text as string}
          </Typography>
        </Box>
      )
    }
    // Feature with selected/satisfaction/text
    else if ('selected' in obj && 'satisfaction' in obj) {
      display = (
        <Box>
          <Typography sx={{ fontSize: '11px', color: '#00C47A', fontFamily: mono, mb: '2px' }}>
            Satisfaction: {obj.satisfaction as number}/10
          </Typography>
          {typeof obj.text === 'string' && obj.text && (
            <Typography sx={{ fontSize: '12px', color: '#A0B4C8', lineHeight: 1.5 }}>
              {obj.text}
            </Typography>
          )}
        </Box>
      )
    } else {
      display = (
        <Typography sx={{ fontSize: '12px', color: '#A0B4C8', lineHeight: 1.6, fontFamily: mono, whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(value, null, 2)}
        </Typography>
      )
    }
  } else {
    display = (
      <Typography sx={{ fontSize: '12.5px', color: '#A0B4C8' }}>
        {String(value)}
      </Typography>
    )
  }

  const copyableText = typeof value === 'string' || typeof value === 'number' ||
    (typeof value === 'object' && value !== null && 'text' in (value as Record<string, unknown>))

  return (
    <Box sx={{ background: '#0C0E11', border: '1px solid #1E2530', borderRadius: '8px', overflow: 'hidden' }}>
      <Typography sx={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3D4A5A', padding: '8px 12px 0', fontFamily: mono }}>
        {label}
      </Typography>
      <Box sx={{ padding: '6px 12px 10px' }}>
        {display}
      </Box>
      {copyableText && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
          <Box
            component="button"
            onClick={handleCopy}
            sx={{
              fontSize: '10px', padding: '3px 10px', borderRadius: '4px',
              border: copied ? '1px solid #00C47A' : '1px solid #1E2A38',
              background: copied ? '#0D1F16' : '#111520',
              color: copied ? '#00C47A' : '#4A6080',
              cursor: 'pointer', fontFamily: mono, transition: 'all 0.15s',
              '&:hover': { borderColor: '#00C47A', color: '#00C47A' },
            }}
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </Box>
        </Box>
      )}
    </Box>
  )
}

function ReviewSection({ title, data }: { title: string; data: AiSectionData }) {
  return (
    <Box sx={{ mb: '1rem' }}>
      <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#C8D8E8', mb: '8px', fontFamily: mono, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Object.entries(data).map(([label, value]) => (
          <ReviewValue key={label} label={label} value={value} />
        ))}
      </Box>
    </Box>
  )
}

export default function DetailPanel({
  platform,
  status,
  onClose,
  onStartReview,
}: {
  platform: Platform
  status: ReviewStatus
  onClose: () => void
  onStartReview: () => void
}) {
  const cfg = statusMap[status]
  const hasAiApi = ['g2', 'capterra', 'ph', 'tp', 'cws'].includes(platform.id)
  const { data: review, isLoading, error } = useGetReviewByPlatformQuery(platform.id, { skip: !hasAiApi })

  return (
    <Box
      sx={{
        background: '#111520',
        border: '1px solid #1E2530',
        borderRadius: '10px',
        padding: '1.25rem',
        mb: '1rem',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: '1.25rem',
          pb: '1rem',
          borderBottom: '1px solid #1E2530',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: '3px' }}>
            <Typography
              sx={{ fontSize: '14px', fontWeight: 600, color: '#C8D8E8' }}
            >
              {'// ' + platform.name.toLowerCase() + '.review_fields'}
            </Typography>
            <Box
              component="span"
              sx={{
                fontSize: '9px',
                padding: '2px 8px',
                borderRadius: '100px',
                fontWeight: 600,
                fontFamily: mono,
                textTransform: 'uppercase',
                background: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
              }}
            >
              {cfg.label}
            </Box>
          </Box>
          <Typography
            sx={{ fontSize: '11px', color: '#3D4A5A', fontFamily: mono }}
          >
            {platform.desc}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Box
            component="a"
            href={platform.link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: '11px',
              padding: '5px 12px',
              borderRadius: '6px',
              border: '1px solid #00C47A',
              color: '#00C47A',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: mono,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            ↗ open platform
          </Box>
          <Box
            component="button"
            onClick={onClose}
            sx={{
              fontSize: '11px',
              padding: '5px 12px',
              borderRadius: '6px',
              border: '1px solid #1E2530',
              color: '#3D4A5A',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: mono,
              '&:hover': {
                borderColor: '#2A3A4A',
                color: '#C8D8E8',
              },
            }}
          >
            ✕ close
          </Box>
        </Box>
      </Box>

      {/* Review content */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: '2rem' }}>
          <CircularProgress size={24} sx={{ color: '#00C47A' }} />
        </Box>
      )}

      {(error || !hasAiApi) && !isLoading && (
        <Box sx={{ textAlign: 'center', py: '2rem' }}>
          <Typography sx={{ fontSize: '12px', color: '#3D4A5A', fontFamily: mono }}>
            // no review generated yet
          </Typography>
        </Box>
      )}

      {review && !isLoading && (
        <Box>
          {/* Status badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '1rem' }}>
            <Box sx={{ fontSize: '9px', padding: '2px 8px', borderRadius: '100px', fontFamily: mono, fontWeight: 600, background: '#0D1F16', color: '#00C47A', border: '1px solid #1A3D28' }}>
              {review.status}
            </Box>
            <Typography sx={{ fontSize: '10px', color: '#3D4A5A', fontFamily: mono }}>
              Generated {new Date(review.createdAt).toLocaleDateString()}
            </Typography>
          </Box>

          {/* Review sections */}
          {Object.entries(review.reviewData).map(([sectionTitle, sectionData]) => (
            <ReviewSection key={sectionTitle} title={sectionTitle} data={sectionData} />
          ))}
        </Box>
      )}

      <Box
        sx={{
          mt: '1.25rem',
          pt: '1rem',
          borderTop: '1px solid #1E2530',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{ fontSize: '10px', color: '#3D4A5A', fontFamily: mono }}
        >
          {status === 'not_started' && '// start the review to generate content'}
          {status === 'in_progress' && '// complete the review and submit proof'}
          {status === 'submitted' && '// awaiting admin approval'}
          {status === 'approved' && '// review approved ✓'}
        </Typography>
        {(status === 'not_started' || status === 'in_progress') && (
          <Box
            component="button"
            onClick={onStartReview}
            sx={{
              fontSize: '11px',
              padding: '7px 18px',
              borderRadius: '6px',
              border: '1px solid #00C47A',
              background: '#0D1F16',
              color: '#00C47A',
              cursor: 'pointer',
              fontFamily: mono,
              transition: 'all 0.15s',
              '&:hover': { background: '#142A1E' },
            }}
          >
            {status === 'not_started' ? 'Start review →' : 'Continue review →'}
          </Box>
        )}
      </Box>
    </Box>
  )
}
