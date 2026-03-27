import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, Typography } from '@mui/material'
import { platforms } from '../data/platforms'
import { logout } from '../store/authSlice'

const mono = "'JetBrains Mono', monospace"

export default function ProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#0C0E11',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: "'Space Grotesk', sans-serif",
        padding: '2rem 1rem',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 600,
          background: '#0C0E11',
          borderRadius: '12px',
          border: '1px solid #1E2530',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
          alignSelf: 'flex-start',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,150,0.015) 2px, rgba(0,255,150,0.015) 4px)',
            pointerEvents: 'none',
            zIndex: 0,
          },
          '& *': { position: 'relative', zIndex: 1 },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: '1.5rem',
            pb: '1rem',
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
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#00C47A', boxShadow: '0 0 6px #00C47A',
                }}
              />
              <Typography sx={{ fontFamily: mono, fontSize: '13px', color: '#00C47A', fontWeight: 500 }}>
                Profile
              </Typography>
            </Box>
          </Box>
          <Box
            component={Link}
            to="/dashboard"
            sx={{
              fontSize: '11px', color: '#3D4A5A', fontFamily: mono, textDecoration: 'none',
              padding: '4px 10px', border: '1px solid #1E2530', borderRadius: '6px',
              transition: 'all 0.15s',
              '&:hover': { color: '#C8D8E8', borderColor: '#2A3A4A' },
            }}
          >
            ← Dashboard
          </Box>
        </Box>

        {/* Profile card */}
        <Box
          sx={{
            background: '#111520',
            border: '1px solid #1E2530',
            borderRadius: '10px',
            padding: '1.25rem',
            mb: '1.25rem',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', mb: '1.25rem', pb: '1rem', borderBottom: '1px solid #1E2530' }}>
            {/* Avatar */}
            <Box
              sx={{
                width: 48, height: 48, borderRadius: '50%',
                background: '#0D1F16', border: '2px solid #00C47A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 700, color: '#00C47A',
                fontFamily: mono, flexShrink: 0,
              }}
            >
              SK
            </Box>
            <Box>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#C8D8E8' }}>
                Sarah K.
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#3D4A5A', fontFamily: mono }}>
                team_member
              </Typography>
            </Box>
          </Box>

          {/* Info fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Email', value: 'sarah.k@sniffer.io' },
              { label: 'Role', value: 'Team Member' },
              { label: 'Department', value: 'DevOps / Security' },
              { label: 'Joined', value: 'October 2025' },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  background: '#0C0E11',
                  border: '1px solid #1E2530',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: '#3D4A5A', padding: '8px 12px 0', fontFamily: mono,
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '12.5px', color: '#A0B4C8', padding: '4px 12px 10px',
                    lineHeight: 1.6,
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Review history */}
        <Box
          sx={{
            background: '#111520',
            border: '1px solid #1E2530',
            borderRadius: '10px',
            padding: '1.25rem',
          }}
        >
          <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#C8D8E8', mb: '4px' }}>
            Review History
          </Typography>
          <Typography sx={{ fontSize: '11px', color: '#3D4A5A', fontFamily: mono, mb: '1rem' }}>
            Platforms assigned to you
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {platforms.map((p) => (
              <Box
                key={p.id}
                component={Link}
                to={`/review/${p.id}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: '#0C0E11',
                  border: '1px solid #1E2530',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                  '&:hover': { borderColor: '#2A3A4A' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Box
                    sx={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: p.color, boxShadow: `0 0 4px ${p.color}`,
                    }}
                  />
                  <Box>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: p.color }}>
                      {p.name}
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: '#3D4A5A', fontFamily: mono }}>
                      {p.fields.length} fields · {p.tabs.length} sections
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '10px', color: '#3D4A5A', fontFamily: mono }}>
                  Open →
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Logout button */}
        <Box
          component="button"
          onClick={handleLogout}
          sx={{
            width: '100%',
            mt: '1.25rem',
            padding: '10px 18px',
            borderRadius: '8px',
            border: '1px solid #FF492C40',
            background: '#1A0A0A',
            color: '#FF492C',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: mono,
            cursor: 'pointer',
            transition: 'all 0.15s',
            '&:hover': { background: '#2A0F0F', borderColor: '#FF492C' },
          }}
        >
          Logout
        </Box>
      </Box>
    </Box>
  )
}
