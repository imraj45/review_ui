import { Box, Typography } from '@mui/material'
import { mono, statusMap } from './constants'

export default function StatsRow({
  completed,
  submitted,
  inProgress,
  notStarted,
}: {
  completed: number
  submitted: number
  inProgress: number
  notStarted: number
}) {
  const items = [
    { value: notStarted, cfg: statusMap.not_started },
    { value: inProgress, cfg: statusMap.in_progress },
    { value: submitted, cfg: statusMap.submitted },
    { value: completed, cfg: statusMap.approved },
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        mb: '1.75rem',
      }}
    >
      {items.map((s) => (
        <Box
          key={s.cfg.label}
          sx={{
            background: '#111520',
            border: `1px solid ${s.cfg.border}`,
            borderRadius: '8px',
            padding: '0.85rem 1rem',
          }}
        >
          <Typography
            sx={{
              fontSize: '10px',
              color: s.cfg.color,
              mb: '5px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: mono,
            }}
          >
            {s.cfg.label}
          </Typography>
          <Typography
            sx={{
              fontSize: '24px',
              fontWeight: 600,
              color: s.cfg.color,
            }}
          >
            {s.value}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
