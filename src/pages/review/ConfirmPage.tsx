import { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { platforms } from '../../data/platforms'
import { mono } from './constants'
import { setStatus } from '../dashboard/constants'

export default function ConfirmPage() {
  const { platform: platformId } = useParams<{ platform: string }>()
  const navigate = useNavigate()
  const [confirmed, setConfirmed] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const platform = platforms.find((p) => p.id === platformId)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      setScreenshot(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const removeScreenshot = () => {
    setScreenshot(null)
    setFileName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  if (!platform) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#0C0E11', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ background: '#0C0E11', border: '1px solid #1E2530', borderRadius: '12px', padding: '2rem', textAlign: 'center', maxWidth: 400 }}>
          <Typography sx={{ fontSize: '24px', fontWeight: 600, color: '#C8D8E8', mb: '0.75rem' }}>
            Platform not found
          </Typography>
          <Typography sx={{ fontSize: '12.5px', color: '#3D4A5A', mb: '1.5rem', fontFamily: mono }}>
            No platform matches "{platformId}"
          </Typography>
          <Box component={Link} to="/dashboard" sx={{ fontSize: '11px', padding: '8px 20px', borderRadius: '6px', border: '1px solid #00C47A', background: '#0D1F16', color: '#00C47A', fontFamily: mono, textDecoration: 'none', '&:hover': { background: '#142A1E' } }}>
            Back to dashboard
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#0C0E11',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Space Grotesk', sans-serif",
        padding: '2rem 1rem',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 520,
          background: '#0C0E11',
          borderRadius: '12px',
          border: '1px solid #1E2530',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
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
        {/* Top accent */}
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: '3px',
            background: platform.color, zIndex: 2,
          }}
        />

        {/* Header */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            mb: '1.5rem', pb: '1rem', borderBottom: '1px solid #1E2530',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: platform.color, boxShadow: `0 0 6px ${platform.color}` }} />
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: platform.color, fontFamily: mono }}>
              {platform.name}
            </Typography>
          </Box>
          <Box
            component={Link}
            to={`/review/${platform.id}`}
            sx={{
              fontSize: '11px', color: '#3D4A5A', fontFamily: mono, textDecoration: 'none',
              padding: '4px 10px', border: '1px solid #1E2530', borderRadius: '6px',
              transition: 'all 0.15s',
              '&:hover': { color: '#C8D8E8', borderColor: '#2A3A4A' },
            }}
          >
            ← Back to review
          </Box>
        </Box>

        {confirmed ? (
          /* Success state */
          <Box sx={{ textAlign: 'center', py: '1.5rem' }}>
            <Box
              sx={{
                width: 56, height: 56, borderRadius: '50%',
                background: '#0D1F16', border: '2px solid #00C47A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Typography sx={{ fontSize: '24px', color: '#00C47A' }}>✓</Typography>
            </Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 600, color: '#C8D8E8', mb: '0.5rem' }}>
              Proof submitted
            </Typography>
            <Typography sx={{ fontSize: '12.5px', color: '#3D4A5A', fontFamily: mono, mb: '1.25rem', lineHeight: 1.6 }}>
              Your {platform.name} review proof has been submitted and is awaiting admin approval.
            </Typography>

            {/* Show uploaded screenshot */}
            {screenshot && (
              <Box sx={{ mb: '1.5rem' }}>
                <Typography sx={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3D4A5A', fontFamily: mono, mb: '8px' }}>
                  Attached screenshot
                </Typography>
                <Box
                  sx={{
                    background: '#111520', border: '1px solid #1E2530', borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={screenshot}
                    alt="Review screenshot"
                    sx={{ width: '100%', display: 'block' }}
                  />
                  <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
                    <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
                      {fileName}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Box
                component="button"
                onClick={() => navigate('/dashboard')}
                sx={{
                  fontSize: '11px', padding: '8px 20px', borderRadius: '6px',
                  border: '1px solid #00C47A', background: '#0D1F16', color: '#00C47A',
                  fontFamily: mono, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s', '&:hover': { background: '#142A1E' },
                }}
              >
                Back to dashboard
              </Box>
              <Box
                component="a"
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontSize: '11px', padding: '8px 20px', borderRadius: '6px',
                  border: '1px solid #1E2530', background: 'transparent', color: '#C8D8E8',
                  fontFamily: mono, textDecoration: 'none', cursor: 'pointer',
                  transition: 'all 0.15s', '&:hover': { borderColor: '#2A3A4A' },
                }}
              >
                Open {platform.name} ↗
              </Box>
            </Box>
          </Box>
        ) : (
          /* Screenshot upload form */
          <Box>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#C8D8E8', mb: '6px' }}>
              Upload proof screenshot
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#3D4A5A', fontFamily: mono, mb: '1.25rem', lineHeight: 1.6 }}>
              After pasting the generated review on {platform.name} and submitting it, take a screenshot of the published review and upload it here as proof.
            </Typography>

            <Typography
              sx={{
                fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#3D4A5A', mb: '8px', fontFamily: mono,
              }}
            >
              Screenshot <Box component="span" sx={{ color: platform.color }}>*required</Box>
            </Typography>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />

            {screenshot ? (
              /* Preview */
              <Box
                sx={{
                  background: '#111520', border: '1px solid #1E2530', borderRadius: '8px',
                  overflow: 'hidden', mb: '1.5rem',
                }}
              >
                <Box
                  component="img"
                  src={screenshot}
                  alt="Screenshot preview"
                  sx={{ width: '100%', display: 'block', maxHeight: 300, objectFit: 'contain', background: '#0A0C10' }}
                />
                <Box
                  sx={{
                    padding: '8px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={{ fontSize: '10px', color: '#A0B4C8', fontFamily: mono }}>
                    {fileName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '6px' }}>
                    <Box
                      component="button"
                      onClick={() => fileRef.current?.click()}
                      sx={{
                        fontSize: '10px', padding: '3px 10px', borderRadius: '4px',
                        border: '1px solid #1E2A38', background: '#111520', color: '#4A6080',
                        cursor: 'pointer', fontFamily: mono, transition: 'all 0.15s',
                        '&:hover': { borderColor: platform.color, color: platform.color },
                      }}
                    >
                      Replace
                    </Box>
                    <Box
                      component="button"
                      onClick={removeScreenshot}
                      sx={{
                        fontSize: '10px', padding: '3px 10px', borderRadius: '4px',
                        border: '1px solid #1E2A38', background: '#111520', color: '#4A6080',
                        cursor: 'pointer', fontFamily: mono, transition: 'all 0.15s',
                        '&:hover': { borderColor: '#FF492C', color: '#FF492C' },
                      }}
                    >
                      Remove
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : (
              /* Drop zone */
              <Box
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                sx={{
                  background: dragOver ? '#111820' : '#111520',
                  border: `2px dashed ${dragOver ? platform.color : '#1E2530'}`,
                  borderRadius: '8px',
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  mb: '1.5rem',
                  '&:hover': { borderColor: '#2A3A4A' },
                }}
              >
                <Typography sx={{ fontSize: '20px', mb: '8px', color: '#3D4A5A' }}>
                  ↑
                </Typography>
                <Typography sx={{ fontSize: '12.5px', color: '#A0B4C8', mb: '4px' }}>
                  Drop screenshot here or click to upload
                </Typography>
                <Typography sx={{ fontSize: '10px', color: '#3D4A5A', fontFamily: mono }}>
                  PNG, JPG, or WEBP
                </Typography>
              </Box>
            )}

            {/* Confirm button */}
            <Box
              component="button"
              onClick={() => {
                if (!screenshot || !platformId) return
                setStatus(platformId, 'submitted')
                setConfirmed(true)
              }}
              disabled={!screenshot}
              sx={{
                width: '100%',
                padding: '11px 18px',
                borderRadius: '8px',
                border: `1px solid ${screenshot ? platform.color : '#1E2530'}`,
                background: screenshot ? `${platform.color}15` : 'transparent',
                color: screenshot ? platform.color : '#3D4A5A',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: mono,
                cursor: screenshot ? 'pointer' : 'default',
                opacity: screenshot ? 1 : 0.5,
                transition: 'all 0.15s',
                '&:hover': screenshot ? { background: `${platform.color}25` } : {},
              }}
            >
              {screenshot ? 'Submit' : 'Upload screenshot to continue'}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
