import { Link } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { mono } from './constants'

export default function TopBar() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: '1.5rem',
        pb: '1.25rem',
        borderBottom: '1px solid #1E2530',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Box
          sx={{
            background: '#0D1F16',
            border: '1px solid #1A3D28',
            borderRadius: '8px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#00C47A',
              boxShadow: '0 0 6px #00C47A',
            }}
          />
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '13px',
              color: '#00C47A',
              fontWeight: 500,
            }}
          >
            review-hub
          </Typography>
        </Box>
        <Typography
          sx={{ fontSize: '11px', color: '#3D4A5A', fontFamily: mono }}
        >
          v1.0 · internal
        </Typography>
      </Box>
      <Box
        component={Link}
        to="/profile"
        sx={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: '#0D1F16',
          border: '2px solid #1E2530',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          color: '#00C47A',
          fontFamily: mono,
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          '&:hover': { borderColor: '#00C47A' },
        }}
      >
        SK
      </Box>
    </Box>
  )
}
