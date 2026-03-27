import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, LinearProgress, Grid } from '@mui/material'
import { platforms } from '../../data/platforms'
import { mono, getStatuses, getStatus, setStatus } from './constants'
import type { ReviewStatus } from './constants'
import TopBar from './TopBar'
import StatsRow from './StatsRow'
import PlatformCard from './PlatformCard'
import DetailPanel from './DetailPanel'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState<string | null>(null)
  // Force re-render when statuses change (e.g. coming back from review)
  const [, setTick] = useState(0)
  const refresh = useCallback(() => setTick((t) => t + 1), [])

  const statuses = getStatuses()
  const getStatusFor = (id: string): ReviewStatus => statuses[id] ?? 'not_started'

  const completed = platforms.filter((p) => getStatusFor(p.id) === 'approved').length
  const submitted = platforms.filter((p) => getStatusFor(p.id) === 'submitted').length
  const inProgress = platforms.filter((p) => getStatusFor(p.id) === 'in_progress').length
  const notStarted = platforms.filter((p) => getStatusFor(p.id) === 'not_started').length
  const activePlatform = platforms.find((p) => p.id === activeId) ?? null

  const handleCardClick = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id))
  }

  const handleClose = () => setActiveId(null)

  const handleStartReview = (id: string) => {
    const current = getStatus(id)
    if (current === 'not_started') {
      setStatus(id, 'in_progress')
      refresh()
    }
    navigate(`/review/${id}`)
  }

  return (
    <Box
      sx={{
        background: '#0C0E11',
        borderRadius: '12px',
        padding: '1.5rem',
        fontFamily: "'Space Grotesk', sans-serif",
        minHeight: '500px',
        border: '1px solid #1E2530',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,150,0.015) 2px, rgba(0,255,150,0.015) 4px)',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '& *': { position: 'relative', zIndex: 1 },
      }}
    >
      <TopBar />
      <StatsRow completed={completed} submitted={submitted} inProgress={inProgress} notStarted={notStarted} />

      <Typography
        sx={{
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#3D4A5A',
          mb: '0.85rem',
          fontFamily: mono,
        }}
      >
        // select a platform to load review content
      </Typography>

      <Grid container spacing="8px" sx={{ mb: '1.25rem' }}>
        {platforms.map((p) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={p.id}>
            <PlatformCard
              platform={p}
              isActive={activeId === p.id}
              status={getStatusFor(p.id)}
              onClick={() => handleCardClick(p.id)}
              onStartReview={() => handleStartReview(p.id)}
            />
          </Grid>
        ))}
      </Grid>

      {activePlatform && (
        <DetailPanel
          platform={activePlatform}
          status={getStatusFor(activePlatform.id)}
          onClose={handleClose}
          onStartReview={() => handleStartReview(activePlatform.id)}
        />
      )}

      <Box
        sx={{
          mt: '1.5rem',
          pt: '1rem',
          borderTop: '1px solid #1E2530',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#3D4A5A',
              mb: '5px',
              fontFamily: mono,
            }}
          >
            // team progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(completed / platforms.length) * 100}
            sx={{
              height: 3,
              borderRadius: '100px',
              backgroundColor: '#1E2530',
              '& .MuiLinearProgress-bar': {
                borderRadius: '100px',
                backgroundColor: '#00C47A',
                boxShadow: '0 0 6px #00C47A',
                transition: 'transform 0.4s',
              },
            }}
          />
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#00C47A',
              fontFamily: mono,
            }}
          >
            {completed} / {platforms.length}
          </Typography>
          <Typography
            sx={{ fontSize: '10px', color: '#3D4A5A', fontFamily: mono }}
          >
            reviews approved
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
