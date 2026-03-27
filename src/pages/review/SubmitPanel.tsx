import { useState, useRef } from 'react'
import { Box, Typography } from '@mui/material'
import type { Platform } from '../../data/platforms'
import { mono } from './constants'
import type { FieldValues } from './constants'
import { useUploadScreenshotMutation } from '../../store/reviewApi'

export default function SubmitPanel({
  platform,
  fieldValues,
}: {
  platform: Platform
  fieldValues: FieldValues
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadScreenshot, { isLoading: isUploading, isSuccess: isUploaded, error: uploadError }] = useUploadScreenshotMutation()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUploadProof = async () => {
    if (!selectedFile) {
      fileInputRef.current?.click()
      return
    }
    try {
      await uploadScreenshot({ screenshot: selectedFile, platformId: platform.id }).unwrap()
    } catch {
      // error is available via uploadError
    }
  }

  const steps = [
    {
      num: '01',
      title: `Open ${platform.name} and paste`,
      desc: `Use the copy buttons on each field, then go to ${platform.name} and paste the review into the appropriate fields.`,
      action: (
        <Box
          component="a"
          href={platform.link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'inline-block',
            fontSize: '11px', padding: '6px 16px', borderRadius: '6px',
            border: '1px solid #00C47A', background: '#0D1F16', color: '#00C47A',
            fontFamily: mono, fontWeight: 600, textDecoration: 'none',
            cursor: 'pointer', transition: 'all 0.15s', mt: '8px',
            '&:hover': { background: '#142A1E' },
          }}
        >
          Open {platform.name} ↗
        </Box>
      ),
    },
    {
      num: '02',
      title: 'Take a screenshot',
      desc: 'After submitting on the real website, take a screenshot showing your published review as proof.',
      action: null,
    },
    {
      num: '03',
      title: 'Upload screenshot as proof',
      desc: 'Come back here and upload the screenshot to complete the process.',
      action: (
        <Box sx={{ mt: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {previewUrl && (
            <Box
              sx={{
                width: '100%', maxWidth: 280, borderRadius: '6px',
                border: '1px solid #1E2530', overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={previewUrl}
                alt="Screenshot preview"
                sx={{ width: '100%', display: 'block' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#0D1015' }}>
                <Typography sx={{ fontSize: '10px', color: '#3D4A5A', fontFamily: mono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                  {selectedFile?.name}
                </Typography>
                <Box
                  component="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null) }}
                  sx={{ fontSize: '10px', color: '#FF6B6B', background: 'none', border: 'none', cursor: 'pointer', fontFamily: mono }}
                >
                  Remove
                </Box>
              </Box>
            </Box>
          )}

          {uploadError && (
            <Typography sx={{ fontSize: '11px', color: '#FF6B6B', fontFamily: mono }}>
              {'data' in uploadError
                ? ((uploadError.data as { message?: string })?.message || 'Upload failed')
                : 'Network error. Please try again.'}
            </Typography>
          )}

          {isUploaded && (
            <Typography sx={{ fontSize: '11px', color: '#00C47A', fontFamily: mono }}>
              Screenshot uploaded successfully!
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: '8px' }}>
            {!selectedFile && (
              <Box
                component="button"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  fontSize: '11px', padding: '6px 16px', borderRadius: '6px',
                  border: '1px solid #1E2530', background: '#111520',
                  color: '#C8D8E8',
                  fontFamily: mono, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: '#2A3A4A' },
                }}
              >
                Select screenshot
              </Box>
            )}
            <Box
              component="button"
              onClick={handleUploadProof}
              disabled={isUploading || !selectedFile || isUploaded}
              sx={{
                fontSize: '11px', padding: '6px 16px', borderRadius: '6px',
                border: `1px solid ${platform.color}`, background: `${platform.color}15`,
                color: platform.color,
                fontFamily: mono, fontWeight: 600,
                cursor: !selectedFile || isUploading || isUploaded ? 'not-allowed' : 'pointer',
                opacity: !selectedFile || isUploading || isUploaded ? 0.5 : 1,
                transition: 'all 0.15s',
                '&:hover': { background: !selectedFile || isUploading || isUploaded ? `${platform.color}15` : `${platform.color}25` },
              }}
            >
              {isUploading ? 'Uploading...' : isUploaded ? 'Uploaded ✓' : 'Upload & submit →'}
            </Box>
          </Box>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ mb: '1.25rem' }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#C8D8E8', mb: '4px' }}>
          Submit Your Review
        </Typography>
        <Typography sx={{ fontSize: '11px', color: '#3D4A5A', fontFamily: mono, lineHeight: 1.6 }}>
          Your review has been generated. Follow the steps below to post it on {platform.name} and upload proof.
        </Typography>
      </Box>

      {/* Steps */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', mb: '1.5rem' }}>
        {steps.map((step) => (
          <Box
            key={step.num}
            sx={{
              display: 'flex', gap: '12px',
              padding: '12px 14px', background: '#111520',
              border: '1px solid #1E2530', borderRadius: '8px',
            }}
          >
            <Box
              sx={{
                width: 28, height: 28, flexShrink: 0,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${platform.color}15`, border: `1px solid ${platform.color}40`,
                fontSize: '11px', fontWeight: 700, color: platform.color, fontFamily: mono,
              }}
            >
              {step.num}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#C8D8E8', mb: '2px' }}>
                {step.title}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#3D4A5A', fontFamily: mono, lineHeight: 1.5 }}>
                {step.desc}
              </Typography>
              {step.action}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Checklist */}
      <Box sx={{ mb: '1rem' }}>
        <Typography sx={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3D4A5A', fontFamily: mono, mb: '8px' }}>
          Pre-submit checklist
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {platform.checklist.map((item, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                padding: '8px 10px', background: '#0D1015',
                border: '1px solid #1A1E28', borderRadius: '6px',
              }}
            >
              <Typography sx={{ fontSize: '12px', color: '#00C47A', flexShrink: 0, mt: '1px' }}>✓</Typography>
              <Box>
                <Typography sx={{ fontSize: '11.5px', color: '#A0B4C8', lineHeight: 1.5 }}>{item.text}</Typography>
                <Typography sx={{ fontSize: '9px', color: '#2A3A50', fontFamily: mono, mt: '1px' }}>{item.ref}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
