import { useState, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/material'
import { platforms } from '../../data/platforms'
import type { Tab } from '../../data/platforms'
import { mono } from './constants'
import { getStatus, setStatus } from '../dashboard/constants'
import type { FieldValues } from './constants'
import TabPanel from './TabPanel'
import SubmitPanel from './SubmitPanel'
import { useGenerateG2ReviewMutation, useGenerateCapterraReviewMutation, useGenerateProductHuntReviewMutation, useGenerateTrustpilotReviewMutation, useGenerateCWSReviewMutation } from '../../store/reviewApi'
import { mapAiResponseToFieldValues } from '../../services/mapAiResponse'

function buildInitialValues(tabs: Tab[]): FieldValues {
  const values: FieldValues = {}
  for (const tab of tabs) {
    for (let i = 0; i < tab.fields.length; i++) {
      const f = tab.fields[i]
      const key = `${tab.name}::${i}`
      if (f.type === 'ai_questions' || f.type === 'ph_multi_rating') {
        values[key] = '{}'
      } else if (f.type === 'star_review_combo') {
        values[key] = '{"rating":0,"text":""}'
      } else if (f.type === 'tag_textarea') {
        values[key] = '{"tags":[],"text":""}'
      } else if (f.type === 'feature_rating' || f.type === 'feature_table' || f.type === 'integration_rating') {
        values[key] = '{}'
      } else if (f.type === 'multi_dropdown' && f.hasSubRating) {
        values[key] = '{"selected":[],"ratings":{}}'
      } else if (f.type === 'multi_select' || f.type === 'multi_dropdown') {
        values[key] = '[]'
      } else {
        values[key] = ''
      }
    }
  }
  return values
}

export default function ReviewPage() {
  const { platform: platformId } = useParams<{ platform: string }>()
  const [activeTab, setActiveTab] = useState(0)

  const platform = platforms.find((p) => p.id === platformId)

  useEffect(() => {
    if (platformId) {
      const current = getStatus(platformId)
      if (current === 'not_started') {
        setStatus(platformId, 'in_progress')
      }
    }
  }, [platformId])

  const [fieldValues, setFieldValues] = useState<FieldValues>(() =>
    platform ? buildInitialValues(platform.tabs) : {}
  )

  const [generateG2] = useGenerateG2ReviewMutation()
  const [generateCapterra] = useGenerateCapterraReviewMutation()
  const [generatePH] = useGenerateProductHuntReviewMutation()
  const [generateTP] = useGenerateTrustpilotReviewMutation()
  const [generateCWS] = useGenerateCWSReviewMutation()
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiFilled, setAiFilled] = useState(false)

  const hasAiGenerate = platformId === 'g2' || platformId === 'capterra' || platformId === 'ph' || platformId === 'tp' || platformId === 'cws'

  const handleFieldChange = useCallback((key: string, val: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: val }))
  }, [])

  const handleAiGenerate = useCallback(async () => {
    if (!platform || aiLoading || !hasAiGenerate) return
    setAiLoading(true)
    setAiError(null)
    try {
      const generate = platformId === 'capterra' ? generateCapterra : platformId === 'ph' ? generatePH : platformId === 'tp' ? generateTP : platformId === 'cws' ? generateCWS : generateG2
      const response = await generate({ productName: platform.productName, tone: 'positive' }).unwrap()
      const aiValues = mapAiResponseToFieldValues(platform, response)
      setFieldValues((prev) => {
        const merged = { ...prev }
        for (const [key, val] of Object.entries(aiValues)) {
          if (val) merged[key] = val
        }
        return merged
      })
      setAiFilled(true)
    } catch (err) {
      const message = err && typeof err === 'object' && 'status' in err
        ? `API error: ${(err as { status: number }).status}`
        : err instanceof Error ? err.message : 'Failed to generate review'
      setAiError(message)
    } finally {
      setAiLoading(false)
    }
  }, [platform, platformId, aiLoading, hasAiGenerate, generateG2, generateCapterra, generatePH, generateTP, generateCWS])

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

  const totalTabs = platform.tabs.length
  const submitIndex = totalTabs
  const isSubmitTab = activeTab === submitIndex

  const handleTabSelect = (i: number) => {
    setActiveTab(i)
  }

  const handleNext = () => {
    const next = activeTab + 1
    if (next <= submitIndex) {
      handleTabSelect(next)
    }
  }

  const handlePrev = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#0C0E11',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        fontFamily: "'Space Grotesk', sans-serif",
        padding: '2rem 1rem 5rem',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 680,
          background: '#0C0E11',
          borderRadius: '12px',
          border: '1px solid #1E2530',
          padding: '1.5rem',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,150,0.015) 2px, rgba(0,255,150,0.015) 4px)',
            pointerEvents: 'none',
            zIndex: 0,
            borderRadius: '12px',
            overflow: 'hidden',
          },
          '& *': { position: 'relative', zIndex: 1 },
        }}
      >
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
            {hasAiGenerate && (
              <>
                <Box
                  component="button"
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  sx={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: aiLoading
                      ? 'linear-gradient(135deg, #5B21B6, #4C1D95)'
                      : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                    borderRadius: '20px', padding: '3px 10px 3px 8px',
                    boxShadow: '0 0 12px #7C3AED40',
                    border: 'none', cursor: aiLoading ? 'wait' : 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': aiLoading ? {} : {
                      boxShadow: '0 0 20px #7C3AED60',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {aiLoading ? (
                    <CircularProgress size={12} sx={{ color: '#fff' }} />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 1L9.2 5.5L13 4L10 7.5L14 9L9.5 9.8L10 14L7.5 10.5L4 13L5.5 9L1 8L5.5 6.5L5 2L7.5 5.5L8 1Z" fill="white" />
                    </svg>
                  )}
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#fff', lineHeight: 1, fontFamily: mono }}>
                    {aiLoading ? 'Generating...' : 'AI'}
                  </Typography>
                </Box>
                {!aiFilled && !aiLoading && (
                  <Typography sx={{ fontSize: '10px', color: '#7C3AED', fontFamily: mono, animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } } }}>
                    Click to generate review
                  </Typography>
                )}
              </>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: '8px' }}>
            <Box
              component="a"
              href={platform.link}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: '11px', color: '#3D4A5A', fontFamily: mono, textDecoration: 'none',
                padding: '4px 10px', border: '1px solid #1E2530', borderRadius: '6px',
                transition: 'all 0.15s', '&:hover': { color: '#00C47A', borderColor: '#00C47A' },
              }}
            >
              ↗ Open {platform.name}
            </Box>
            <Box
              component={Link}
              to="/dashboard"
              sx={{
                fontSize: '11px', color: '#3D4A5A', fontFamily: mono, textDecoration: 'none',
                padding: '4px 10px', border: '1px solid #1E2530', borderRadius: '6px',
                transition: 'all 0.15s', '&:hover': { color: '#C8D8E8', borderColor: '#2A3A4A' },
              }}
            >
              ← Back
            </Box>
          </Box>
        </Box>

        {/* AI error message */}
        {aiError && (
          <Box
            sx={{
              mb: '1rem', padding: '8px 12px', borderRadius: '6px',
              background: '#1A0A0A', border: '1px solid #FF492C40',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ fontSize: '11px', color: '#FF492C', fontFamily: mono }}>
              {aiError}
            </Typography>
            <Box
              component="button"
              onClick={() => setAiError(null)}
              sx={{
                background: 'none', border: 'none', color: '#FF492C', cursor: 'pointer',
                fontSize: '14px', padding: '0 4px', lineHeight: 1,
              }}
            >
              x
            </Box>
          </Box>
        )}

        {/* Section tabs */}
        {(() => {
          // Build sections dynamically from tab names
          const sections: { key: string; label: string; start: number; count: number }[] = []
          let currentSection = ''
          for (let i = 0; i < platform.tabs.length; i++) {
            const t = platform.tabs[i]
            const sectionKey = t.name.startsWith('About You') ? 'about_you'
              : t.name.startsWith('About Org') ? 'about_org'
              : t.name.startsWith('Q') || t.name === 'Rating' || t.name === 'Profile' || t.name === 'Usage' || t.name === 'Details' || t.name === 'Features' ? 'product'
              : `custom_${t.name}`
            const sectionLabel = sectionKey === 'about_you' ? 'About You'
              : sectionKey === 'about_org' ? 'Your Organization'
              : sectionKey === 'product' ? 'About the Product'
              : t.title
            if (sectionKey !== currentSection) {
              sections.push({ key: sectionKey, label: sectionLabel, start: i, count: 1 })
              currentSection = sectionKey
            } else {
              sections[sections.length - 1].count++
            }
          }

          // Find which section the active tab is in
          let activeSection = 'submit'
          let sectionStart = 0
          let sectionTotal = 1
          if (!isSubmitTab) {
            for (const sec of sections) {
              if (activeTab >= sec.start && activeTab < sec.start + sec.count) {
                activeSection = sec.key
                sectionStart = sec.start
                sectionTotal = sec.count
                break
              }
            }
          }
          const sectionStep = activeTab - sectionStart + 1
          const currentLabel = sections.find((s) => s.key === activeSection)?.label ?? 'About the Product'

          const sectionTabSx = (active: boolean) => ({
            flex: 1, padding: '10px 6px', textAlign: 'center',
            fontSize: '11px', fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Space Grotesk', sans-serif",
            transition: 'all 0.15s',
            color: active ? platform.color : '#3D4A5A',
            borderBottom: active ? `2px solid ${platform.color}` : '2px solid transparent',
            '&:hover': { color: active ? platform.color : '#6A7A8A' },
          })

          return (
            <>
              {/* Top section tabs */}
              <Box sx={{ display: 'flex', mb: '1.25rem', borderBottom: '1px solid #1E2530' }}>
                {sections.map((sec) => (
                  <Box key={sec.key} onClick={() => handleTabSelect(sec.start)} sx={sectionTabSx(activeSection === sec.key)}>
                    {sec.label}
                  </Box>
                ))}
                <Box onClick={() => handleTabSelect(submitIndex)} sx={sectionTabSx(activeSection === 'submit')}>
                  Submit
                </Box>
              </Box>

              {isSubmitTab ? (
                <SubmitPanel platform={platform} fieldValues={fieldValues} />
              ) : (
                <>
                  {/* Section heading + progress bar */}
                  <Box sx={{ mb: '1.5rem' }}>
                    <Typography
                      sx={{
                        fontSize: '18px', fontWeight: 700, textAlign: 'center',
                        color: platform.color, mb: '10px',
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {currentLabel}
                    </Typography>
                    <Box sx={{ position: 'relative', height: 6, borderRadius: 3, background: '#1E2530', overflow: 'hidden' }}>
                      <Box
                        sx={{
                          position: 'absolute', top: 0, left: 0, height: '100%',
                          width: `${(sectionStep / sectionTotal) * 100}%`,
                          borderRadius: 3,
                          background: platform.color,
                          boxShadow: `0 0 8px ${platform.color}60`,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: '10px', color: '#3D4A5A', fontFamily: mono, textAlign: 'center', mt: '6px' }}>
                      Question {sectionStep} of {sectionTotal}
                    </Typography>
                  </Box>
                  <TabPanel
                    tab={platform.tabs[activeTab]}
                    color={platform.color}
                    values={fieldValues}
                    onFieldChange={handleFieldChange}
                    disabled={aiFilled}
                  />
                </>
              )}
            </>
          )
        })()}

      </Box>

      {/* Fixed footer nav */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          background: '#0C0E11',
          borderTop: '1px solid #1E2530',
          padding: '12px 1rem',
          zIndex: 800,
        }}
      >
        <Box
          sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            maxWidth: 680, margin: '0 auto',
          }}
        >
          <Box
            component="button"
            onClick={handlePrev}
            disabled={activeTab === 0}
            sx={{
              fontSize: '11px', padding: '7px 18px', borderRadius: '6px',
              border: '1px solid #1E2530', color: activeTab === 0 ? '#1E2530' : '#3D4A5A',
              background: 'transparent', cursor: activeTab === 0 ? 'default' : 'pointer',
              fontFamily: mono, transition: 'all 0.15s',
              '&:hover': activeTab === 0 ? {} : { borderColor: '#2A3A4A', color: '#C8D8E8' },
            }}
          >
            ← Back
          </Box>
          <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
            Step {String(activeTab + 1).padStart(2, '0')} / {String(totalTabs + 1).padStart(2, '0')}
          </Typography>
          {activeTab < submitIndex && (
            <Box
              component="button"
              onClick={handleNext}
              sx={{
                fontSize: '11px', padding: '7px 18px', borderRadius: '6px',
                border: `1px solid ${platform.color}`, color: platform.color,
                background: `${platform.color}15`, cursor: 'pointer', fontFamily: mono,
                transition: 'all 0.15s', '&:hover': { background: `${platform.color}25` },
              }}
            >
              Next →
            </Box>
          )}
        </Box>
      </Box>

    </Box>
  )
}
