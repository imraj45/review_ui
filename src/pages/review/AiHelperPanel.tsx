import { Box, Typography } from '@mui/material'
import type { AiHelper } from '../../data/platforms'

const mono = "'JetBrains Mono', monospace"

export default function AiHelperPanel({
  helper,
  color,
  onClose,
}: {
  helper: AiHelper
  color: string
  onClose: () => void
}) {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: { xs: '100%', sm: 380 },
        background: '#0C0E11',
        borderLeft: '1px solid #1E2530',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
        animation: 'slideIn 0.25s ease-out',
        '@keyframes slideIn': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #1E2530',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* AI icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 12px ${color}40`,
            }}
          >
            <Typography sx={{ fontSize: '18px', color: '#fff', lineHeight: 1 }}>✦</Typography>
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Box
                sx={{
                  width: 22, height: 22, borderRadius: '50%',
                  border: '1px solid #2A3A50', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: '12px', color: '#6366F1', lineHeight: 1 }}>→</Typography>
              </Box>
              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#6366F1' }}>
                Review Helper
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          component="button"
          onClick={onClose}
          sx={{
            fontSize: '16px',
            width: 32,
            height: 32,
            borderRadius: '8px',
            border: '1px solid #1E2530',
            background: 'transparent',
            color: '#3D4A5A',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
            '&:hover': { borderColor: '#2A3A4A', color: '#C8D8E8' },
          }}
        >
          ✕
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        {/* Description */}
        <Typography
          sx={{
            fontSize: '14px',
            color: '#A0B4C8',
            lineHeight: 1.7,
            mb: '24px',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {helper.description}
        </Typography>

        {/* Suggestions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '14px' }}>
          <Typography sx={{ fontSize: '14px', color: color, lineHeight: 1 }}>✦</Typography>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#C8D8E8' }}>
            Suggestions
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {helper.suggestions.map((suggestion, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '0 0 0 8px',
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#3D4A5A',
                  flexShrink: 0,
                  mt: '8px',
                }}
              />
              <Typography
                sx={{
                  fontSize: '13px',
                  color: '#8A9AB0',
                  lineHeight: 1.6,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {suggestion}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          padding: '14px 20px',
          borderTop: '1px solid #1E2530',
        }}
      >
        <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono, textAlign: 'center' }}>
          AI-powered review guidance
        </Typography>
      </Box>
    </Box>
  )
}
