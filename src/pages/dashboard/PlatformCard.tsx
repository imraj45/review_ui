import { Box, Typography } from '@mui/material'
import type { Platform } from '../../data/platforms'
import { mono, statusMap } from './constants'
import type { ReviewStatus } from './constants'

export default function PlatformCard({
  platform,
  isActive,
  status,
  onClick,
  onStartReview,
}: {
  platform: Platform
  isActive: boolean
  status: ReviewStatus
  onClick: () => void
  onStartReview: () => void
}) {
  const cfg = statusMap[status]

  const buttonLabel =
    status === 'not_started'
      ? 'Start review →'
      : status === 'in_progress'
        ? 'Continue →'
        : status === 'submitted'
          ? 'View status'
          : 'View review'

  return (
    <Box
      onClick={onClick}
      sx={{
        background: isActive ? '#0D1F18' : '#111520',
        border: `1px solid ${isActive ? '#00C47A' : cfg.border}`,
        borderRadius: '10px',
        padding: '0.9rem',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s',
        '&:hover': {
          borderColor: isActive ? '#00C47A' : '#2A3A4A',
          background: isActive ? '#0D1F18' : '#141820',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          borderRadius: '10px 10px 0 0',
          background: platform.color,
        }}
      />
      <Typography
        sx={{ fontSize: '14px', fontWeight: 700, mb: '6px', color: platform.color }}
      >
        {platform.name}
      </Typography>
      <Typography
        sx={{ fontSize: '10px', color: '#3D4A5A', fontFamily: mono, mb: '10px' }}
      >
        {platform.fields.length} fields
      </Typography>
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          fontSize: '9px',
          padding: '2px 8px',
          borderRadius: '100px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          fontFamily: mono,
          textTransform: 'uppercase',
          background: cfg.bg,
          color: cfg.color,
          border: `1px solid ${cfg.border}`,
        }}
      >
        {cfg.label}
      </Box>
      <Box
        component="button"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          onStartReview()
        }}
        sx={{
          display: 'block',
          width: '100%',
          mt: '10px',
          padding: '5px 0',
          borderRadius: '5px',
          border: `1px solid ${status === 'approved' ? cfg.border : '#00C47A'}`,
          background: status === 'approved' ? cfg.bg : '#0D1F16',
          color: status === 'approved' ? cfg.color : '#00C47A',
          fontSize: '10px',
          fontWeight: 600,
          fontFamily: mono,
          cursor: 'pointer',
          transition: 'all 0.15s',
          '&:hover': { background: status === 'approved' ? '#142A1E' : '#142A1E' },
        }}
      >
        {buttonLabel}
      </Box>
    </Box>
  )
}
