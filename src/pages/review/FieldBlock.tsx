import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Box, Typography } from '@mui/material'
import type { Field } from '../../data/platforms'
import { mono } from './constants'

function AiGenerateButton({ onClick }: { onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      title="Generate with AI"
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '3px 10px', borderRadius: '100px',
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        color: '#fff', fontSize: '10px', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.15s',
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: '0 0 8px rgba(99,102,241,0.3)',
        '&:hover': {
          boxShadow: '0 0 14px rgba(99,102,241,0.5)',
          transform: 'scale(1.03)',
        },
      }}
    >
      <Box component="span" sx={{ fontSize: '12px', lineHeight: 1 }}>✦</Box>
      AI
    </Box>
  )
}

function SelectDropdown({
  field, color, value, onChange, isRequired, wrapSx, headerSx, labelSx, badgeSx, copied, handleCopy,
}: {
  field: Field
  color: string
  value: string
  onChange: (val: string) => void
  isRequired: boolean
  wrapSx: object
  headerSx: object
  labelSx: object
  badgeSx: object
  copied: boolean
  handleCopy: () => void
}) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Compute position when opening
  useEffect(() => {
    if (open && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect())
    }
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on external scroll (not inside the dropdown list)
  useEffect(() => {
    if (!open) return
    const handler = (e: Event) => {
      if (listRef.current && listRef.current.contains(e.target as Node)) return
      setOpen(false)
    }
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
  }, [open])

  const handleSelect = (opt: string) => {
    onChange(opt)
    setOpen(false)
  }

  return (
    <Box sx={wrapSx}>
      <Box sx={headerSx}>
        <Typography sx={labelSx}>{field.label}</Typography>
        <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
          {isRequired ? 'required' : 'optional'}
        </Box>
      </Box>
      <Box sx={{ padding: '8px 12px 12px' }}>
        {/* Trigger */}
        <Box
          ref={triggerRef}
          onClick={() => setOpen((p) => !p)}
          sx={{
            width: '100%',
            padding: '10px 36px 10px 12px',
            borderRadius: '8px',
            border: open ? `1px solid ${color}` : value ? `1px solid ${color}40` : '1px solid #2A3A50',
            background: '#0D1015',
            color: value ? '#C8D8E8' : '#4A6080',
            fontSize: '12px',
            fontFamily: mono,
            cursor: 'pointer',
            position: 'relative',
            transition: 'border-color 0.15s',
            userSelect: 'none',
          }}
        >
          {value || 'Select an option...'}
          <Box
            sx={{
              position: 'absolute', right: 12, top: '50%', transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
              fontSize: '10px', color: '#4A6080', transition: 'transform 0.2s',
            }}
          >
            ▼
          </Box>
        </Box>

        {/* Dropdown list — rendered in a portal so it escapes all overflow/z-index contexts */}
        {open && rect && createPortal(
          <>
            {/* Invisible backdrop to catch clicks */}
            <Box
              onClick={() => setOpen(false)}
              sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}
            />
            <Box
              ref={listRef}
              sx={{
                position: 'fixed',
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                background: '#111520',
                border: `1px solid ${color}40`,
                borderRadius: '8px',
                maxHeight: 240,
                overflowY: 'auto',
                zIndex: 9999,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#2A3A50', borderRadius: 3 },
              }}
            >
              {field.options?.map((opt) => (
                <Box
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  sx={{
                    padding: '9px 12px',
                    fontSize: '12px',
                    fontFamily: mono,
                    color: opt === value ? color : '#A0B4C8',
                    background: opt === value ? `${color}10` : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                    borderBottom: '1px solid #1A1E28',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { background: `${color}15`, color },
                  }}
                >
                  {opt}
                </Box>
              ))}
            </Box>
          </>,
          document.body,
        )}
      </Box>
      <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
          {field.hint ?? (value ? `Selected: ${value}` : 'Select from dropdown')}
        </Typography>
        {value && (
          <Box
            component="button"
            onClick={handleCopy}
            sx={{
              fontSize: '10px', padding: '3px 10px', borderRadius: '4px',
              border: copied ? '1px solid #00C47A' : '1px solid #1E2A38',
              background: copied ? '#0D1F16' : '#111520',
              color: copied ? '#00C47A' : '#4A6080',
              cursor: 'pointer', fontFamily: mono, transition: 'all 0.15s',
              '&:hover': { borderColor: color, color },
            }}
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </Box>
        )}
      </Box>
    </Box>
  )
}

function MultiDropdown({
  field, color, value, onChange, isRequired, wrapSx, headerSx, labelSx, badgeSx,
}: {
  field: Field
  color: string
  value: string
  onChange: (val: string) => void
  isRequired: boolean
  wrapSx: object
  headerSx: object
  labelSx: object
  badgeSx: object
}) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Parse value — supports simple array or object with ratings
  const hasSub = field.hasSubRating ?? false
  let selected: string[] = []
  let ratings: Record<string, { satisfaction: number; text: string }> = {}
  try {
    const parsed = JSON.parse(value)
    if (hasSub && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      selected = parsed.selected ?? []
      ratings = parsed.ratings ?? {}
    } else if (Array.isArray(parsed)) {
      selected = parsed
    }
  } catch { /* empty */ }

  const emitChange = (sel: string[], rat: Record<string, { satisfaction: number; text: string }>) => {
    if (hasSub) {
      onChange(JSON.stringify({ selected: sel, ratings: rat }))
    } else {
      onChange(JSON.stringify(sel))
    }
  }

  useEffect(() => {
    if (open && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect())
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: Event) => {
      if (listRef.current && listRef.current.contains(e.target as Node)) return
      setOpen(false)
    }
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
  }, [open])

  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt]
    // Clean up ratings for removed items
    const nextRatings = { ...ratings }
    if (!next.includes(opt)) delete nextRatings[opt]
    emitChange(next, nextRatings)
  }

  const updateRating = (name: string, satisfaction: number) => {
    const updated = { ...ratings, [name]: { ...(ratings[name] ?? { satisfaction: 0, text: '' }), satisfaction } }
    emitChange(selected, updated)
  }

  const updateRatingText = (name: string, text: string) => {
    const updated = { ...ratings, [name]: { ...(ratings[name] ?? { satisfaction: 0, text: '' }), text } }
    emitChange(selected, updated)
  }

  const displayText = selected.length > 0
    ? `${selected.length} selected`
    : 'Select options...'

  return (
    <Box sx={wrapSx}>
      <Box sx={headerSx}>
        <Typography sx={labelSx}>{field.label}</Typography>
        <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
          {isRequired ? 'required' : 'optional'}
        </Box>
      </Box>
      <Box sx={{ padding: '8px 12px 12px' }}>
        {/* Selected tags */}
        {selected.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px', mb: '8px' }}>
            {selected.map((s) => (
              <Box
                key={s}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '10px', padding: '2px 8px', borderRadius: '100px',
                  background: `${color}15`, color, border: `1px solid ${color}40`,
                  fontFamily: mono,
                }}
              >
                {s}
                <Box
                  component="span"
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggle(s) }}
                  sx={{ cursor: 'pointer', fontSize: '8px', ml: '2px', '&:hover': { opacity: 0.7 } }}
                >
                  ✕
                </Box>
              </Box>
            ))}
          </Box>
        )}
        {/* Trigger */}
        <Box
          ref={triggerRef}
          onClick={() => setOpen((p) => !p)}
          sx={{
            width: '100%',
            padding: '10px 36px 10px 12px',
            borderRadius: '8px',
            border: open ? `1px solid ${color}` : selected.length > 0 ? `1px solid ${color}40` : '1px solid #2A3A50',
            background: '#0D1015',
            color: selected.length > 0 ? '#C8D8E8' : '#4A6080',
            fontSize: '12px',
            fontFamily: mono,
            cursor: 'pointer',
            position: 'relative',
            transition: 'border-color 0.15s',
            userSelect: 'none',
          }}
        >
          {displayText}
          <Box
            sx={{
              position: 'absolute', right: 12, top: '50%',
              transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
              fontSize: '10px', color: '#4A6080', transition: 'transform 0.2s',
            }}
          >
            ▼
          </Box>
        </Box>

        {/* Dropdown via portal */}
        {open && rect && createPortal(
          <>
            <Box
              onClick={() => setOpen(false)}
              sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}
            />
            <Box
              ref={listRef}
              sx={{
                position: 'fixed',
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                background: '#111520',
                border: `1px solid ${color}40`,
                borderRadius: '8px',
                maxHeight: 260,
                overflowY: 'auto',
                zIndex: 9999,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#2A3A50', borderRadius: 3 },
              }}
            >
              {field.options?.map((opt) => {
                const isOn = selected.includes(opt)
                return (
                  <Box
                    key={opt}
                    onClick={() => toggle(opt)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '9px 12px', fontSize: '12px', fontFamily: mono,
                      color: isOn ? color : '#A0B4C8',
                      background: isOn ? `${color}10` : 'transparent',
                      cursor: 'pointer', transition: 'all 0.1s',
                      borderBottom: '1px solid #1A1E28',
                      '&:last-child': { borderBottom: 'none' },
                      '&:hover': { background: `${color}15` },
                    }}
                  >
                    <Box sx={{
                      width: 16, height: 16, borderRadius: '3px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: isOn ? `1px solid ${color}` : '1px solid #2A3A50',
                      background: isOn ? `${color}20` : 'transparent',
                      fontSize: '10px', fontWeight: 700, color: isOn ? color : 'transparent',
                    }}>
                      {isOn ? '✓' : ''}
                    </Box>
                    {opt}
                  </Box>
                )
              })}
            </Box>
          </>,
          document.body,
        )}

        {/* Sub-rating cards for each selected item */}
        {hasSub && selected.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', mt: '12px' }}>
            {selected.map((name) => {
              const r = ratings[name] ?? { satisfaction: 0, text: '' }
              return (
                <Box
                  key={name}
                  sx={{
                    background: '#0D1015', border: '1px solid #1A1E28',
                    borderRadius: '8px', padding: '12px',
                  }}
                >
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color, mb: '10px' }}>
                    {name}
                  </Typography>

                  {/* Satisfaction 1-7 */}
                  <Typography sx={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3D4A5A', fontFamily: mono, mb: '6px' }}>
                    What's your satisfaction with this integration?
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center', mb: '4px' }}>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => {
                      const isSelected = n === r.satisfaction
                      return (
                        <Box
                          key={n}
                          onClick={() => updateRating(name, n)}
                          sx={{
                            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '6px', fontSize: '12px', fontWeight: 700, fontFamily: mono,
                            cursor: 'pointer', transition: 'all 0.15s',
                            ...(isSelected
                              ? { background: `${color}20`, color, border: `2px solid ${color}`, boxShadow: `0 0 6px ${color}40` }
                              : { border: '1px solid #2A3A50', color: '#4A6080' }),
                            '&:hover': { borderColor: color, color },
                          }}
                        >
                          {n}
                        </Box>
                      )
                    })}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '10px' }}>
                    <Typography sx={{ fontSize: '9px', color: '#3D4A5A', fontFamily: mono }}>Not Satisfied</Typography>
                    <Typography sx={{ fontSize: '9px', color: '#3D4A5A', fontFamily: mono }}>Very Satisfied</Typography>
                  </Box>

                  {/* Text field */}
                  <Typography sx={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3D4A5A', fontFamily: mono, mb: '4px' }}>
                    Tell us what about this integration influenced your rating.
                  </Typography>
                  <Box
                    component="textarea"
                    value={r.text}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateRatingText(name, e.target.value)}
                    rows={2}
                    placeholder="Share your experience..."
                    sx={{
                      width: '100%', background: '#111520', border: '1px solid #1A1E28',
                      borderRadius: '6px', outline: 'none', resize: 'vertical',
                      fontSize: '11px', color: '#A0B4C8', padding: '8px 10px',
                      lineHeight: 1.5, fontFamily: "'Space Grotesk', sans-serif",
                      '&:focus': { borderColor: `${color}60` },
                      '&::placeholder': { color: '#2A3A50' },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '6px' }}>
                    <AiGenerateButton onClick={() => {}} />
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>
      <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
        <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
          {selected.length > 0 ? `${selected.length} selected` : (field.hint ?? 'Select from dropdown')}
        </Typography>
      </Box>
    </Box>
  )
}

function IntegrationRating({
  field, color, value, onChange, isRequired, wrapSx, headerSx, labelSx, badgeSx,
}: {
  field: Field
  color: string
  value: string
  onChange: (val: string) => void
  isRequired: boolean
  wrapSx: object
  headerSx: object
  labelSx: object
  badgeSx: object
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [rect, setRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const importanceOptions = ['Not Rated', 'Not Important', 'Somewhat Important', 'Important', 'Very Important', 'Critical']

  // Value: { selected: string[], ratings: { [name]: { importance: string, rating: number } } }
  let selected: string[] = []
  let ratings: Record<string, { importance: string; rating: number }> = {}
  try {
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      selected = parsed.selected ?? []
      ratings = parsed.ratings ?? {}
    }
  } catch { /* empty */ }

  const emitChange = (sel: string[], rat: typeof ratings) => {
    onChange(JSON.stringify({ selected: sel, ratings: rat }))
  }

  const allOptions = field.options ?? []
  const filtered = allOptions.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase()) && !selected.includes(opt)
  )

  useEffect(() => {
    if (open && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect())
      setTimeout(() => inputRef.current?.focus(), 50)
    }
    if (!open) setSearch('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) { setOpen(false) }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: Event) => {
      if (listRef.current && listRef.current.contains(e.target as Node)) return
      setOpen(false)
    }
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
  }, [open])

  const addItem = (opt: string) => {
    emitChange([...selected, opt], ratings)
    setSearch('')
  }

  const removeItem = (name: string) => {
    const nextRatings = { ...ratings }
    delete nextRatings[name]
    emitChange(selected.filter((s) => s !== name), nextRatings)
  }

  const updateRating = (name: string, updates: Partial<{ importance: string; rating: number }>) => {
    const current = ratings[name] ?? { importance: 'Not Rated', rating: 0 }
    emitChange(selected, { ...ratings, [name]: { ...current, ...updates } })
  }

  return (
    <Box sx={wrapSx}>
      <Box sx={headerSx}>
        <Typography sx={labelSx}>{field.label}</Typography>
        <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
          {isRequired ? 'required' : 'optional'}
        </Box>
      </Box>
      <Box sx={{ padding: '8px 12px 12px' }}>
        {/* Search trigger */}
        <Box
          ref={triggerRef}
          onClick={() => setOpen((p) => !p)}
          sx={{
            width: '100%', padding: '10px 36px 10px 12px', borderRadius: '8px',
            border: open ? `1px solid ${color}` : '1px solid #2A3A50',
            background: '#0D1015', color: '#4A6080', fontSize: '12px', fontFamily: mono,
            cursor: 'pointer', position: 'relative', userSelect: 'none',
          }}
        >
          {selected.length > 0 ? `${selected.length} selected — click to add more` : 'Search and select integrations...'}
          <Box sx={{ position: 'absolute', right: 12, top: '50%', transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)', fontSize: '10px', color: '#4A6080', transition: 'transform 0.2s' }}>
            ▼
          </Box>
        </Box>

        {/* Dropdown portal */}
        {open && rect && createPortal(
          <>
            <Box onClick={() => setOpen(false)} sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }} />
            <Box ref={listRef} sx={{
              position: 'fixed', top: rect.bottom + 4, left: rect.left, width: rect.width,
              background: '#111520', border: `1px solid ${color}40`, borderRadius: '8px',
              zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', overflow: 'hidden',
            }}>
              <Box sx={{ padding: '8px', borderBottom: '1px solid #1A1E28' }}>
                <Box component="input" ref={inputRef} type="text" value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  placeholder="Search integrations..."
                  sx={{
                    width: '100%', padding: '7px 10px', borderRadius: '6px',
                    border: '1px solid #2A3A50', background: '#0D1015',
                    color: '#C8D8E8', fontSize: '11px', fontFamily: mono, outline: 'none',
                    '&:focus': { borderColor: color }, '&::placeholder': { color: '#3D4A5A' },
                  }}
                />
              </Box>
              <Box sx={{ maxHeight: 180, overflowY: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { background: '#2A3A50', borderRadius: 3 } }}>
                {filtered.length > 0 ? filtered.map((opt) => (
                  <Box key={opt} onClick={() => addItem(opt)} sx={{
                    padding: '9px 12px', fontSize: '12px', fontFamily: mono, color: '#A0B4C8',
                    cursor: 'pointer', borderBottom: '1px solid #1A1E28',
                    '&:last-child': { borderBottom: 'none' }, '&:hover': { background: `${color}15`, color },
                  }}>
                    {opt}
                  </Box>
                )) : (
                  <Box sx={{ padding: '12px', textAlign: 'center', color: '#3D4A5A', fontSize: '11px', fontFamily: mono }}>
                    No results
                  </Box>
                )}
              </Box>
            </Box>
          </>,
          document.body,
        )}

        {/* Selected integrations table */}
        {selected.length > 0 && (
          <Box sx={{ mt: '12px' }}>
            {/* Table header */}
            <Box sx={{
              display: 'grid', gridTemplateColumns: '28px 1fr 140px 130px',
              gap: '8px', alignItems: 'center', padding: '8px 10px',
              background: '#151A24', borderRadius: '6px 6px 0 0', borderBottom: '1px solid #1E2530',
            }}>
              <Box />
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#6A7A8A', fontFamily: mono, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Product Name
              </Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#6A7A8A', fontFamily: mono, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Importance
              </Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#6A7A8A', fontFamily: mono, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rating
              </Typography>
            </Box>

            {/* Rows */}
            {selected.map((name, idx) => {
              const r = ratings[name] ?? { importance: 'Not Rated', rating: 0 }
              return (
                <Box key={name} sx={{
                  display: 'grid', gridTemplateColumns: '28px 1fr 140px 130px',
                  gap: '8px', alignItems: 'center', padding: '12px 10px',
                  background: idx % 2 === 0 ? 'transparent' : '#0D1015',
                  borderBottom: '1px solid #1A1E28',
                }}>
                  {/* Remove */}
                  <Box onClick={() => removeItem(name)} sx={{
                    width: 22, height: 22, borderRadius: '50%', border: '1px solid #2A3A50',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#3D4A5A', fontSize: '10px',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: '#FF492C', color: '#FF492C', background: '#1A0D0D' },
                  }}>
                    ✕
                  </Box>

                  {/* Name */}
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#C8D8E8' }}>
                    {name}
                  </Typography>

                  {/* Importance */}
                  <Box component="select" value={r.importance}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateRating(name, { importance: e.target.value })}
                    sx={{
                      padding: '6px 8px', borderRadius: '6px',
                      border: '1px solid #2A3A50', background: '#111520',
                      color: r.importance === 'Not Rated' ? '#4A6080' : '#A0B4C8',
                      fontSize: '11px', fontFamily: mono, cursor: 'pointer', outline: 'none',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%234A6080' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: '24px',
                      '& option': { background: '#111520', color: '#C8D8E8' },
                    }}
                  >
                    {importanceOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </Box>

                  {/* Stars */}
                  <Box sx={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Box key={s} onClick={() => updateRating(name, { rating: s })} sx={{
                        fontSize: '18px', cursor: 'pointer',
                        color: s <= r.rating ? color : '#2A3A50',
                        transition: 'color 0.1s', '&:hover': { color },
                      }}>
                        ★
                      </Box>
                    ))}
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>
      <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
        <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
          {selected.length > 0 ? `${selected.length} integration${selected.length > 1 ? 's' : ''} added` : (field.hint ?? 'Search and select')}
        </Typography>
      </Box>
    </Box>
  )
}

function SearchableSelect({
  field, color, value, onChange, isRequired, wrapSx, headerSx, labelSx, badgeSx, copied, handleCopy,
}: {
  field: Field
  color: string
  value: string
  onChange: (val: string) => void
  isRequired: boolean
  wrapSx: object
  headerSx: object
  labelSx: object
  badgeSx: object
  copied: boolean
  handleCopy: () => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [rect, setRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = (field.options ?? []).filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (open && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect())
      setTimeout(() => inputRef.current?.focus(), 50)
    }
    if (!open) setSearch('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: Event) => {
      if (listRef.current && listRef.current.contains(e.target as Node)) return
      setOpen(false)
    }
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
  }, [open])

  const handleSelect = (opt: string) => {
    onChange(opt)
    setOpen(false)
  }

  return (
    <Box sx={wrapSx}>
      <Box sx={headerSx}>
        <Typography sx={labelSx}>{field.label}</Typography>
        <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
          {isRequired ? 'required' : 'optional'}
        </Box>
      </Box>
      <Box sx={{ padding: '8px 12px 12px' }}>
        <Box
          ref={triggerRef}
          onClick={() => setOpen((p) => !p)}
          sx={{
            width: '100%',
            padding: '10px 36px 10px 12px',
            borderRadius: '8px',
            border: open ? `1px solid ${color}` : value ? `1px solid ${color}40` : '1px solid #2A3A50',
            background: '#0D1015',
            color: value ? '#C8D8E8' : '#4A6080',
            fontSize: '12px',
            fontFamily: mono,
            cursor: 'pointer',
            position: 'relative',
            transition: 'border-color 0.15s',
            userSelect: 'none',
          }}
        >
          {value || 'Select an option...'}
          <Box
            sx={{
              position: 'absolute', right: 12, top: '50%',
              transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
              fontSize: '10px', color: '#4A6080', transition: 'transform 0.2s',
            }}
          >
            ▼
          </Box>
        </Box>

        {open && rect && createPortal(
          <>
            <Box onClick={() => setOpen(false)} sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }} />
            <Box
              ref={listRef}
              sx={{
                position: 'fixed',
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                background: '#111520',
                border: `1px solid ${color}40`,
                borderRadius: '8px',
                zIndex: 9999,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                overflow: 'hidden',
              }}
            >
              {/* Search input */}
              <Box sx={{ padding: '8px', borderBottom: '1px solid #1A1E28' }}>
                <Box
                  component="input"
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  placeholder="Search..."
                  sx={{
                    width: '100%', padding: '7px 10px', borderRadius: '6px',
                    border: '1px solid #2A3A50', background: '#0D1015',
                    color: '#C8D8E8', fontSize: '11px', fontFamily: mono,
                    outline: 'none',
                    '&:focus': { borderColor: color },
                    '&::placeholder': { color: '#3D4A5A' },
                  }}
                />
              </Box>
              {/* Options */}
              <Box sx={{
                maxHeight: 200, overflowY: 'auto',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#2A3A50', borderRadius: 3 },
              }}>
                {filtered.length > 0 ? filtered.map((opt) => (
                  <Box
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    sx={{
                      padding: '9px 12px', fontSize: '12px', fontFamily: mono,
                      color: opt === value ? color : '#A0B4C8',
                      background: opt === value ? `${color}10` : 'transparent',
                      cursor: 'pointer', transition: 'all 0.1s',
                      borderBottom: '1px solid #1A1E28',
                      '&:last-child': { borderBottom: 'none' },
                      '&:hover': { background: `${color}15`, color },
                    }}
                  >
                    {opt}
                  </Box>
                )) : (
                  <Box sx={{ padding: '12px', textAlign: 'center', color: '#3D4A5A', fontSize: '11px', fontFamily: mono }}>
                    No results found
                  </Box>
                )}
              </Box>
            </Box>
          </>,
          document.body,
        )}
      </Box>
      <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
          {field.hint ?? (value ? `Selected: ${value}` : 'Search and select')}
        </Typography>
        {value && (
          <Box
            component="button"
            onClick={handleCopy}
            sx={{
              fontSize: '10px', padding: '3px 10px', borderRadius: '4px',
              border: copied ? '1px solid #00C47A' : '1px solid #1E2A38',
              background: copied ? '#0D1F16' : '#111520',
              color: copied ? '#00C47A' : '#4A6080',
              cursor: 'pointer', fontFamily: mono, transition: 'all 0.15s',
              '&:hover': { borderColor: color, color },
            }}
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default function FieldBlock({
  field,
  color,
  value,
  onChange,
  disabled = false,
}: {
  field: Field
  color: string
  value: string
  onChange: (val: string) => void
  disabled?: boolean
}) {
  const [copied, setCopied] = useState(false)

  // When disabled, block all changes but keep copy working
  // eslint-disable-next-line react-hooks/exhaustive-deps
  onChange = disabled ? () => {} : onChange

  const handleCopy = useCallback(() => {
    if (!value) return
    navigator.clipboard.writeText(value).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [value])

  const isRequired = field.required !== false

  const badgeSx = isRequired
    ? { background: `${color}20`, color, border: `1px solid ${color}40` }
    : { background: '#1A1E2A', color: '#4A6080', border: '1px solid #2A3A50' }

  const wrapSx = {
    background: '#111520',
    border: '1px solid #1E2530',
    borderLeft: `2px solid ${isRequired ? color : '#2A3A50'}`,
    borderRadius: '8px',
    overflow: 'hidden',
    mb: '10px',
    ...(disabled ? { opacity: 0.7 } : {}),
  }

  const headerSx = {
    padding: '10px 12px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const labelSx = {
    fontSize: '9px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: '#3D4A5A',
    fontFamily: mono,
  }

  /* Radio (Yes / No / I do not know) */
  if (field.type === 'radio') {
    return (
      <Box sx={wrapSx}>
        <Box sx={headerSx}>
          <Typography sx={labelSx}>{field.label}</Typography>
          <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
            {isRequired ? 'required' : 'optional'}
          </Box>
        </Box>
        <Box sx={{ padding: '10px 12px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {field.options?.map((opt) => (
            <Box
              key={opt}
              onClick={() => onChange(opt)}
              sx={{
                padding: '8px 20px', borderRadius: '8px', fontSize: '12px',
                fontFamily: mono, cursor: 'pointer', transition: 'all 0.15s', fontWeight: 600,
                ...(opt === value
                  ? { background: `${color}20`, color, border: `1px solid ${color}` }
                  : { border: '1px solid #2A3A50', color: '#4A6080' }),
                '&:hover': { borderColor: color },
              }}
            >
              {opt}
            </Box>
          ))}
        </Box>
        <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
          <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
            {value ? `Selected: ${value}` : 'Select an option'}
          </Typography>
        </Box>
      </Box>
    )
  }

  /* Screenshot upload */
  if (field.type === 'screenshot_upload') {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)
    // value stores base64 data URL
    const hasImage = value.startsWith('data:image')

    const processFile = (file: File) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        onChange(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }

    return (
      <Box sx={wrapSx}>
        <Box sx={headerSx}>
          <Typography sx={labelSx}>{field.label}</Typography>
          <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
            {isRequired ? 'required' : 'optional'}
          </Box>
        </Box>

        {/* Description */}
        <Box sx={{ padding: '8px 12px 0' }}>
          <Typography sx={{ fontSize: '11.5px', color: '#6A7A8A', lineHeight: 1.6, mb: '4px' }}>
            Confirm that you are a current user of Sniffer by uploading a screenshot showing you logged into Sniffer. Screenshots are submitted securely and viewable only to the G2 moderation team.
          </Typography>
          <Typography sx={{ fontSize: '11px', color: '#5DCAA5', lineHeight: 1.6, mb: '10px' }}>
            Thanks for leaving a review of Sniffer! Help us accept your review by uploading a screenshot so we can better assist the G2 moderation team.
          </Typography>
        </Box>

        <Box sx={{ padding: '0 12px 12px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }}
            style={{ display: 'none' }}
          />

          {hasImage ? (
            /* Preview */
            <Box sx={{ background: '#0D1015', border: '1px solid #1E2530', borderRadius: '8px', overflow: 'hidden' }}>
              <Box
                component="img"
                src={value}
                alt="Screenshot"
                sx={{ width: '100%', display: 'block', maxHeight: 220, objectFit: 'contain', background: '#0A0C10' }}
              />
              <Box sx={{ padding: '8px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '10px', color: '#00C47A', fontFamily: mono }}>
                  Screenshot uploaded ✓
                </Typography>
                <Box sx={{ display: 'flex', gap: '6px' }}>
                  <Box
                    component="button"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      fontSize: '10px', padding: '3px 10px', borderRadius: '4px',
                      border: '1px solid #1E2A38', background: '#111520', color: '#4A6080',
                      cursor: 'pointer', fontFamily: mono, '&:hover': { borderColor: color, color },
                    }}
                  >
                    Replace
                  </Box>
                  <Box
                    component="button"
                    onClick={() => onChange('')}
                    sx={{
                      fontSize: '10px', padding: '3px 10px', borderRadius: '4px',
                      border: '1px solid #1E2A38', background: '#111520', color: '#4A6080',
                      cursor: 'pointer', fontFamily: mono, '&:hover': { borderColor: '#FF492C', color: '#FF492C' },
                    }}
                  >
                    Remove
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
            /* Upload area + tooltip */
            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f) }}
                sx={{
                  flex: 1,
                  background: dragOver ? '#111820' : '#0D1015',
                  border: `2px dashed ${dragOver ? color : '#1E2530'}`,
                  borderRadius: '8px', padding: '1.5rem 1rem', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': { borderColor: '#2A3A4A' },
                }}
              >
                <Typography sx={{ fontSize: '18px', mb: '6px', color: '#3D4A5A' }}>↑</Typography>
                <Typography sx={{ fontSize: '11.5px', color: '#A0B4C8', mb: '3px' }}>
                  Drop screenshot here or click to upload
                </Typography>
                <Typography sx={{ fontSize: '10px', color: '#3D4A5A', fontFamily: mono }}>
                  PNG, JPG, or WEBP
                </Typography>
              </Box>

              {/* Info icon with screenshot tooltip */}
              <Box
                sx={{ position: 'relative', flexShrink: 0, mt: '12px' }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Box
                  component="svg"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  sx={{ width: 18, height: 18, cursor: 'help', opacity: 0.8, '&:hover': { opacity: 1 } }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </Box>
                {showTooltip && (
                  <Box
                    sx={{
                      position: 'absolute', right: 0, top: '100%', mt: '6px',
                      width: 280, background: '#111520', border: '1px solid #1E2530',
                      borderRadius: '8px', padding: '12px', zIndex: 50,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}
                  >
                    <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#C8D8E8', mb: '8px', fontFamily: mono }}>
                      How to take a screenshot
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: '#6A7A8A', lineHeight: 1.6, mb: '8px' }}>
                      <Box component="span" sx={{ color: '#A0B4C8', fontWeight: 600 }}>On a PC:</Box> Press <Box component="span" sx={{ color, fontFamily: mono }}>Windows Key + PrtScn</Box>. Windows 10 will take a screenshot and save it as a PNG file in the default Pictures folder in File Explorer.
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: '#6A7A8A', lineHeight: 1.6 }}>
                      <Box component="span" sx={{ color: '#A0B4C8', fontWeight: 600 }}>On a Mac:</Box> Press <Box component="span" sx={{ color, fontFamily: mono }}>Command + Shift + 3</Box>. macOS will take a screenshot and save it as a PNG file to your desktop.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
          <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
            {field.hint}
          </Typography>
        </Box>
      </Box>
    )
  }

  /* Multi-select (checkboxes) */
  if (field.type === 'multi_select') {
    let selected: string[] = []
    try { selected = JSON.parse(value) } catch { /* empty */ }

    const toggle = (opt: string) => {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
      onChange(JSON.stringify(next))
    }

    return (
      <Box sx={wrapSx}>
        <Box sx={headerSx}>
          <Typography sx={labelSx}>{field.label}</Typography>
          <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
            {isRequired ? 'required' : 'optional'}
          </Box>
        </Box>
        <Box sx={{ padding: '10px 12px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: 300, overflowY: 'auto' }}>
          {field.options?.map((opt) => {
            const isOn = selected.includes(opt)
            return (
              <Box
                key={opt}
                onClick={() => toggle(opt)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                  transition: 'all 0.15s', fontSize: '11px', fontFamily: mono,
                  ...(isOn
                    ? { background: `${color}15`, color, border: `1px solid ${color}` }
                    : { border: '1px solid #2A3A50', color: '#4A6080' }),
                  '&:hover': { borderColor: color },
                }}
              >
                <Box sx={{
                  width: 14, height: 14, borderRadius: '3px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: isOn ? `1px solid ${color}` : '1px solid #2A3A50',
                  background: isOn ? `${color}20` : 'transparent',
                  fontSize: '9px', fontWeight: 700, color: isOn ? color : 'transparent',
                }}>
                  {isOn ? '✓' : ''}
                </Box>
                {opt}
              </Box>
            )
          })}
        </Box>
        <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
          <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
            {selected.length > 0 ? `${selected.length} selected` : (field.hint ?? 'Select all that apply')}
          </Typography>
        </Box>
      </Box>
    )
  }

  /* Rating scale 1–7 + N/A */
  if (field.type === 'rating_na') {
    const start = field.scaleStart ?? 1
    const max = field.scaleMax ?? 7
    const labels = field.scaleLabels ?? {}
    const isNA = value === 'N/A'
    const numVal = isNA ? -1 : (value !== '' ? Number(value) : -1)
    return (
      <Box sx={wrapSx}>
        <Box sx={headerSx}>
          <Typography sx={labelSx}>{field.label}</Typography>
          <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
            {isRequired ? 'required' : 'optional'}
          </Box>
        </Box>
        <Box sx={{ padding: '10px 12px 6px' }}>
          <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {Array.from({ length: max - start + 1 }, (_, i) => start + i).map((n) => {
              const isSelected = n === numVal
              return (
                <Box
                  key={n}
                  onClick={() => onChange(String(n))}
                  sx={{
                    width: 38, height: 38, flex: '0 0 auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '8px', fontSize: '13px', fontWeight: 700, fontFamily: mono,
                    cursor: 'pointer', transition: 'all 0.15s',
                    ...(isSelected
                      ? { background: `${color}20`, color, border: `2px solid ${color}`, boxShadow: `0 0 6px ${color}40` }
                      : { border: '1px solid #2A3A50', color: '#4A6080' }),
                    '&:hover': { borderColor: color, color },
                  }}
                >
                  {n}
                </Box>
              )
            })}
            {/* N/A button */}
            <Box
              onClick={() => onChange('N/A')}
              sx={{
                height: 38, px: '12px', flex: '0 0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px', fontSize: '11px', fontWeight: 600, fontFamily: mono,
                cursor: 'pointer', transition: 'all 0.15s',
                ...(isNA
                  ? { background: '#1A1E2A', color: '#A0B4C8', border: '2px solid #4A6080' }
                  : { border: '1px solid #2A3A50', color: '#3D4A5A' }),
                '&:hover': { borderColor: '#4A6080', color: '#A0B4C8' },
              }}
            >
              N/A
            </Box>
          </Box>
          {/* Labels row — aligned under the number boxes */}
          {Object.keys(labels).length > 0 && (
            <Box sx={{ display: 'flex', gap: '6px', mt: '6px' }}>
              {Array.from({ length: max - start + 1 }, (_, i) => start + i).map((n) => (
                <Box key={n} sx={{ width: 38, flex: '0 0 auto', textAlign: 'center' }}>
                  {labels[n] && (
                    <Typography sx={{ fontSize: '9px', color: '#3D4A5A', fontFamily: mono }}>
                      {labels[n]}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
          <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
            {isNA ? 'N/A selected' : numVal >= start ? `${numVal} / ${max} selected` : 'Click a number to rate'}
          </Typography>
        </Box>
      </Box>
    )
  }

  /* Stars */
  if (field.type === 'stars') {
    const rating = Number(value) || 0
    return (
      <Box sx={wrapSx}>
        <Box sx={headerSx}>
          <Typography sx={labelSx}>{field.label}</Typography>
          <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
            {isRequired ? 'required' : 'optional'}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: '6px', padding: '8px 12px 12px' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Box
              key={s}
              onClick={() => onChange(String(s))}
              sx={{
                fontSize: '22px',
                cursor: 'pointer',
                color: s <= rating ? color : '#2A3A50',
                transition: 'color 0.1s',
                '&:hover': { color },
              }}
            >
              ★
            </Box>
          ))}
        </Box>
        <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
          <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
            {rating > 0 ? `${rating} stars selected` : 'Click to rate'}
          </Typography>
        </Box>
      </Box>
    )
  }

  /* Action */
  if (field.type === 'action') {
    const done = value === 'done'
    return (
      <Box sx={wrapSx}>
        <Box sx={headerSx}>
          <Typography sx={labelSx}>{field.label}</Typography>
          <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
            required
          </Box>
        </Box>
        <Typography sx={{ fontSize: '12.5px', color: '#A0B4C8', padding: '6px 12px 10px', lineHeight: 1.6 }}>
          {field.content}
        </Typography>
        <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
            {field.hint ?? 'Manual action required'}
          </Typography>
          <Box
            component="button"
            onClick={() => onChange(done ? '' : 'done')}
            sx={{
              fontSize: '10px', padding: '3px 10px', borderRadius: '4px',
              border: done ? '1px solid #00C47A' : '1px solid #1E2A38',
              background: done ? '#0D1F16' : '#111520',
              color: done ? '#00C47A' : '#4A6080',
              cursor: 'pointer', fontFamily: mono, transition: 'all 0.15s',
            }}
          >
            {done ? '✓ Done' : 'Mark done'}
          </Box>
        </Box>
      </Box>
    )
  }

  /* Select (custom dropdown) */
  if (field.type === 'select') {
    return (
      <SelectDropdown
        field={field}
        color={color}
        value={value}
        onChange={onChange}
        isRequired={isRequired}
        wrapSx={wrapSx}
        headerSx={headerSx}
        labelSx={labelSx}
        badgeSx={badgeSx}
        copied={copied}
        handleCopy={handleCopy}
      />
    )
  }

  /* Multi-select dropdown */
  if (field.type === 'multi_dropdown') {
    return (
      <MultiDropdown
        field={field}
        color={color}
        value={value}
        onChange={onChange}
        isRequired={isRequired}
        wrapSx={wrapSx}
        headerSx={headerSx}
        labelSx={labelSx}
        badgeSx={badgeSx}
      />
    )
  }

  /* Integration rating (searchable multi-select + table with importance/stars) */
  if (field.type === 'integration_rating') {
    return (
      <IntegrationRating
        field={field}
        color={color}
        value={value}
        onChange={onChange}
        isRequired={isRequired}
        wrapSx={wrapSx}
        headerSx={headerSx}
        labelSx={labelSx}
        badgeSx={badgeSx}
      />
    )
  }

  /* Searchable select dropdown */
  if (field.type === 'searchable_select') {
    return (
      <SearchableSelect
        field={field}
        color={color}
        value={value}
        onChange={onChange}
        isRequired={isRequired}
        wrapSx={wrapSx}
        headerSx={headerSx}
        labelSx={labelSx}
        badgeSx={badgeSx}
        copied={copied}
        handleCopy={handleCopy}
      />
    )
  }

  /* Scale */
  if (field.type === 'scale') {
    const max = field.scaleMax ?? 10
    const numVal = Number(value) || 0
    return (
      <Box sx={wrapSx}>
        <Box sx={headerSx}>
          <Typography sx={labelSx}>{field.label}</Typography>
          <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
            {isRequired ? 'required' : 'optional'}
          </Box>
        </Box>
        <Box sx={{ padding: '8px 12px 12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <Box
              key={n}
              onClick={() => onChange(String(n))}
              sx={{
                width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px', fontSize: '12px', fontWeight: 600, fontFamily: mono,
                cursor: 'pointer', transition: 'all 0.15s',
                ...(n === numVal
                  ? { background: `${color}20`, color, border: `1px solid ${color}` }
                  : { border: '1px solid #2A3A50', color: '#4A6080' }),
                '&:hover': { borderColor: color },
              }}
            >
              {n}
            </Box>
          ))}
        </Box>
        <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
          <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
            {numVal > 0 ? `${numVal}/${max} selected` : 'Click to select'}
          </Typography>
        </Box>
      </Box>
    )
  }

  /* PH Multi Rating (multiple star questions with per-level descriptions) */
  if (field.type === 'ph_multi_rating') {
    const questions = field.ratingQuestions ?? []
    let ratings: Record<string, number> = {}
    try { ratings = JSON.parse(value) } catch { /* empty */ }

    const updateRating = (q: string, r: number) => {
      onChange(JSON.stringify({ ...ratings, [q]: r }))
    }

    return (
      <Box sx={{ mb: '10px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {questions.map((item) => {
            const r = ratings[item.question] ?? 0
            const desc = r > 0 && r <= item.descriptions.length ? item.descriptions[r - 1] : ''
            return (
              <Box key={item.question}>
                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#C8D8E8', mb: '10px' }}>
                  {item.question}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Box sx={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Box
                        key={s}
                        onClick={() => updateRating(item.question, s)}
                        sx={{
                          fontSize: '30px', cursor: 'pointer',
                          color: s <= r ? '#DA552F' : '#2A3A50',
                          transition: 'color 0.15s',
                          '&:hover': { color: '#DA552F' },
                        }}
                      >
                        ★
                      </Box>
                    ))}
                  </Box>
                  {desc && (
                    <Typography sx={{ fontSize: '12px', color: '#6A7A8A', fontStyle: 'italic' }}>
                      {desc}
                    </Typography>
                  )}
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  /* AI Questions (card per question with sparkle icon, toolbar + textarea) */
  if (field.type === 'ai_questions') {
    const questions = field.options ?? []
    let answers: Record<string, string> = {}
    try { answers = JSON.parse(value) } catch { /* empty */ }

    const updateAnswer = (q: string, text: string) => {
      onChange(JSON.stringify({ ...answers, [q]: text }))
    }

    return (
      <Box sx={{ mb: '10px' }}>
        {/* Description from tab desc is shown by TabPanel, so just render questions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {questions.map((q) => (
            <Box
              key={q}
              sx={{
                background: '#111520',
                border: '1px solid #1E2530',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              {/* Question header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: '14px' }}>
                {/* Sparkle icon */}
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    border: '1px solid #2A3A50', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '16px', color: '#6366F1', lineHeight: 1 }}>✦</Typography>
                </Box>

                {/* Question text */}
                <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#C8D8E8', flex: 1, lineHeight: 1.5 }}>
                  {q}
                </Typography>

                {/* Refresh icon */}
                <Box
                  sx={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    border: '1px solid #2A3A50', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#4A6080', fontSize: '14px',
                    '&:hover': { borderColor: '#6366F1', color: '#6366F1' },
                  }}
                >
                  ↻
                </Box>
              </Box>

              {/* Toolbar + textarea */}
              <Box
                sx={{
                  border: '1px solid #1E2530', borderRadius: '8px',
                  overflow: 'hidden', background: '#0D1015',
                }}
              >
                {/* Toolbar */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: '2px',
                  padding: '6px 10px', borderBottom: '1px solid #1E2530',
                }}>
                  {['B', 'I', '|', '≡', '•', '|', '🔗', '<>', '❝', '@', '🖼'].map((icon, i) => (
                    icon === '|' ? (
                      <Box key={i} sx={{ width: 1, height: 16, background: '#2A3A50', mx: '4px' }} />
                    ) : (
                      <Box
                        key={i}
                        sx={{
                          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '4px', fontSize: '12px', color: '#4A6080', cursor: 'pointer',
                          fontWeight: icon === 'B' ? 700 : 400,
                          fontStyle: icon === 'I' ? 'italic' : 'normal',
                          '&:hover': { background: '#1A1E2A', color: '#C8D8E8' },
                        }}
                      >
                        {icon}
                      </Box>
                    )
                  ))}
                </Box>

                {/* Textarea */}
                <Box
                  component="textarea"
                  value={answers[q] ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateAnswer(q, e.target.value)}
                  rows={4}
                  placeholder="Your answer..."
                  sx={{
                    width: '100%', background: 'transparent', border: 'none',
                    outline: 'none', resize: 'vertical',
                    fontSize: '12.5px', color: '#A0B4C8', padding: '12px',
                    lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif",
                    '&::placeholder': { color: '#3D4A5A' },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 10px', borderTop: '1px solid #1E2530' }}>
                  <AiGenerateButton onClick={() => {}} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    )
  }

  /* Product Hunt style rating (stars with description per level) */
  if (field.type === 'ph_rating') {
    const descriptions = field.options ?? []
    const rating = Number(value) || 0
    const desc = rating > 0 && rating <= descriptions.length ? descriptions[rating - 1] : ''
    return (
      <Box sx={{ mb: '20px' }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#C8D8E8', mb: '10px' }}>
          {field.label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Box sx={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Box
                key={s}
                onClick={() => onChange(String(s))}
                sx={{
                  fontSize: '32px', cursor: 'pointer',
                  color: s <= rating ? '#DA552F' : '#2A3A50',
                  transition: 'color 0.15s',
                  '&:hover': { color: '#DA552F' },
                }}
              >
                ★
              </Box>
            ))}
          </Box>
          {desc && (
            <Typography sx={{ fontSize: '12px', color: '#6A7A8A', fontStyle: 'italic' }}>
              {desc}
            </Typography>
          )}
        </Box>
      </Box>
    )
  }

  /* Tag input + textarea (Product Hunt style) */
  if (field.type === 'tag_textarea') {
    // value stores JSON: { tags: string[], text: string }
    let parsed: { tags: string[]; text: string } = { tags: [], text: '' }
    try { parsed = JSON.parse(value) } catch { /* empty */ }

    const [modalOpen, setModalOpen] = useState(false)
    const [tagInput, setTagInput] = useState('')

    const addTag = () => {
      const trimmed = tagInput.trim()
      if (trimmed && !parsed.tags.includes(trimmed)) {
        onChange(JSON.stringify({ ...parsed, tags: [...parsed.tags, trimmed] }))
      }
      setTagInput('')
      setModalOpen(false)
    }

    const removeTag = (tag: string) => {
      onChange(JSON.stringify({ ...parsed, tags: parsed.tags.filter((t) => t !== tag) }))
    }

    const updateText = (text: string) => {
      onChange(JSON.stringify({ ...parsed, text }))
    }

    const buttonLabel = field.content ?? 'Add tag'

    return (
      <Box sx={{ mb: '20px' }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#C8D8E8', mb: '8px' }}>
          {field.label}
        </Typography>

        {/* Tags row + add button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '10px', flexWrap: 'wrap' }}>
          {parsed.tags.map((tag) => (
            <Box
              key={tag}
              sx={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: '100px',
                background: '#1A1E2A', border: '1px solid #2A3A50',
                fontSize: '11px', color: '#C8D8E8', fontFamily: mono,
              }}
            >
              <Typography sx={{ fontSize: '11px', color: '#00C47A', fontWeight: 700 }}>✓</Typography>
              {tag} ({tag.length})
              <Box
                component="span"
                onClick={() => removeTag(tag)}
                sx={{ cursor: 'pointer', fontSize: '9px', color: '#4A6080', '&:hover': { color: '#FF492C' } }}
              >
                ✕
              </Box>
            </Box>
          ))}

          {/* Add button — opens modal */}
          <Box
            onClick={() => setModalOpen(true)}
            sx={{
              padding: '4px 14px', borderRadius: '100px',
              border: 'none', background: 'transparent',
              color: '#DA552F', fontSize: '11px', fontFamily: mono, fontWeight: 600,
              cursor: 'pointer', '&:hover': { textDecoration: 'underline' },
            }}
          >
            {buttonLabel}
          </Box>
        </Box>

        {/* Modal — Add standout feature */}
        {modalOpen && createPortal(
          <>
            <Box
              onClick={() => setModalOpen(false)}
              sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9998 }}
            />
            <Box
              sx={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400, maxWidth: '90vw',
                background: '#111520', border: '1px solid #1E2530',
                borderRadius: '12px', padding: '24px',
                zIndex: 9999, boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              }}
            >
              {/* Close button */}
              <Box
                onClick={() => setModalOpen(false)}
                sx={{
                  position: 'absolute', top: 16, right: 16,
                  fontSize: '18px', color: '#4A6080', cursor: 'pointer',
                  '&:hover': { color: '#C8D8E8' },
                }}
              >
                ✕
              </Box>

              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#C8D8E8', mb: '8px' }}>
                {buttonLabel.toLowerCase().includes('improvement') ? 'Add an area of improvement'
                  : buttonLabel.toLowerCase().includes('search') || buttonLabel.toLowerCase().includes('compare') ? 'Add a product to compare'
                  : 'Add a standout feature'}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#6A7A8A', mb: '16px', lineHeight: 1.6 }}>
                {buttonLabel.toLowerCase().includes('improvement') ? 'Help this product get even better! What area could use some improvement?'
                  : buttonLabel.toLowerCase().includes('search') || buttonLabel.toLowerCase().includes('compare') ? 'Tell us why you chose this product over alternative solutions.'
                  : 'What makes this product shine? Add a feature that really stands out!'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '20px' }}>
                <Box sx={{ color: '#4A6080', fontSize: '14px' }}>🔍</Box>
                <Box
                  component="input"
                  type="text"
                  value={tagInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  placeholder={buttonLabel.toLowerCase().includes('improvement') ? 'e.g., Better user interf...'
                    : buttonLabel.toLowerCase().includes('search') || buttonLabel.toLowerCase().includes('compare') ? 'Search for products to compare'
                    : 'e.g., Real-time collabo...'}
                  autoFocus
                  sx={{
                    flex: 1, padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #2A3A50', background: '#0D1015',
                    color: '#C8D8E8', fontSize: '12px', fontFamily: mono,
                    outline: 'none',
                    '&:focus': { borderColor: '#DA552F' },
                    '&::placeholder': { color: '#3D4A5A' },
                  }}
                />
              </Box>

              {/* Add button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box
                  component="button"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                  sx={{
                    padding: '10px 24px', borderRadius: '100px',
                    border: 'none',
                    background: tagInput.trim() ? '#DA552F' : '#2A3A50',
                    color: tagInput.trim() ? '#fff' : '#4A6080',
                    fontSize: '13px', fontWeight: 600,
                    fontFamily: "'Space Grotesk', sans-serif",
                    cursor: tagInput.trim() ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                    '&:hover': tagInput.trim() ? { background: '#C44A28' } : {},
                  }}
                >
                  {buttonLabel.toLowerCase().includes('improvement') ? 'Add improvement'
                    : buttonLabel.toLowerCase().includes('search') || buttonLabel.toLowerCase().includes('compare') ? 'Add product'
                    : 'Add standout feature'}
                </Box>
              </Box>
            </Box>
          </>,
          document.body,
        )}

        {/* Rich text area (simplified — toolbar icons + textarea) */}
        <Box
          sx={{
            border: '1px solid #1E2530', borderRadius: '8px',
            overflow: 'hidden', background: '#111520',
          }}
        >
          {/* Toolbar */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: '2px',
            padding: '6px 10px', borderBottom: '1px solid #1E2530',
          }}>
            {['B', 'I', '|', '≡', '•', '|', '🔗', '<>', '❝', '@', '🖼'].map((icon, i) => (
              icon === '|' ? (
                <Box key={i} sx={{ width: 1, height: 16, background: '#2A3A50', mx: '4px' }} />
              ) : (
                <Box
                  key={i}
                  sx={{
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '4px', fontSize: '12px', color: '#4A6080', cursor: 'pointer',
                    fontWeight: icon === 'B' ? 700 : icon === 'I' ? 400 : 400,
                    fontStyle: icon === 'I' ? 'italic' : 'normal',
                    '&:hover': { background: '#1A1E2A', color: '#C8D8E8' },
                  }}
                >
                  {icon}
                </Box>
              )
            ))}
          </Box>

          {/* Textarea */}
          <Box
            component="textarea"
            value={parsed.text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateText(e.target.value)}
            rows={5}
            placeholder={field.hint}
            sx={{
              width: '100%', background: 'transparent', border: 'none',
              outline: 'none', resize: 'vertical',
              fontSize: '12.5px', color: '#A0B4C8', padding: '12px',
              lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif",
              '&::placeholder': { color: '#3D4A5A' },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 10px', borderTop: '1px solid #1E2530' }}>
            <AiGenerateButton onClick={() => {}} />
          </Box>
        </Box>
      </Box>
    )
  }

  /* Star + Review combo (stars and textarea in one card) */
  if (field.type === 'star_review_combo') {
    // value stores JSON: { rating: number, text: string }
    let parsed: { rating: number; text: string } = { rating: 0, text: '' }
    try { parsed = JSON.parse(value) } catch { /* empty */ }

    const updateCombo = (updates: Partial<{ rating: number; text: string }>) => {
      onChange(JSON.stringify({ ...parsed, ...updates }))
    }

    return (
      <Box
        sx={{
          border: `2px solid ${color}`,
          borderRadius: '12px',
          padding: '20px',
          mb: '10px',
          background: '#111520',
        }}
      >
        {/* Stars */}
        <Box sx={{ display: 'flex', gap: '4px', mb: '14px' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Box
              key={s}
              onClick={() => updateCombo({ rating: s })}
              sx={{
                fontSize: '28px',
                cursor: 'pointer',
                color: s <= parsed.rating ? '#C8D8E8' : '#2A3A50',
                transition: 'color 0.1s',
                '&:hover': { color: '#C8D8E8' },
              }}
            >
              ★
            </Box>
          ))}
        </Box>

        {/* Textarea */}
        <Box
          component="textarea"
          value={parsed.text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateCombo({ text: e.target.value })}
          rows={6}
          placeholder="Pick a star rating and write a review"
          sx={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            fontSize: '13px',
            color: '#A0B4C8',
            lineHeight: 1.6,
            fontFamily: "'Space Grotesk', sans-serif",
            '&::placeholder': { color: '#3D4A5A' },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', pt: '8px' }}>
          <Box
            onClick={() => {
              if (!parsed.text) return
              navigator.clipboard.writeText(parsed.text).catch(() => {})
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '3px 10px', borderRadius: '100px',
              border: '1px solid #2A3A50', color: copied ? '#00C47A' : '#4A6080',
              fontSize: '10px', fontWeight: 600, cursor: 'pointer',
              fontFamily: mono, transition: 'all 0.15s',
              '&:hover': { borderColor: '#4A6080', color: '#C8D8E8' },
            }}
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </Box>
          <AiGenerateButton onClick={() => {}} />
        </Box>
      </Box>
    )
  }

  /* Date input */
  if (field.type === 'date_input') {
    return (
      <Box sx={wrapSx}>
        <Box sx={headerSx}>
          <Typography sx={labelSx}>{field.label}</Typography>
          <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
            {isRequired ? 'required' : 'optional'}
          </Box>
        </Box>
        <Box sx={{ padding: '8px 12px 12px' }}>
          <Box
            component="input"
            type="date"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            sx={{
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              border: value ? `1px solid ${color}40` : '1px solid #2A3A50',
              background: '#0D1015', color: value ? '#C8D8E8' : '#4A6080',
              fontSize: '12px', fontFamily: mono, outline: 'none',
              cursor: 'pointer',
              '&::-webkit-calendar-picker-indicator': {
                filter: 'invert(0.5)',
                cursor: 'pointer',
              },
              '&:focus': { borderColor: color },
            }}
          />
        </Box>
        <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
          <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
            {value ? `Selected: ${value}` : 'dd/mm/yyyy'}
          </Typography>
        </Box>
      </Box>
    )
  }

  /* Disclaimer text */
  if (field.type === 'disclaimer') {
    return (
      <Box sx={{ padding: '12px 0', mb: '10px' }}>
        <Typography sx={{ fontSize: '12px', color: '#6A7A8A', lineHeight: 1.7, fontFamily: "'Space Grotesk', sans-serif" }}>
          {field.label}
        </Typography>
      </Box>
    )
  }

  /* Topic chips — informational card with topic pills */
  if (field.type === 'topic_chips') {
    return (
      <Box
        sx={{
          background: '#111520',
          border: '1px solid #1E2530',
          borderRadius: '12px',
          padding: '16px 18px',
          mb: '10px',
        }}
      >
        <Typography sx={{ fontSize: '12.5px', color: '#6A7A8A', mb: '12px', lineHeight: 1.5 }}>
          {field.label}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {field.options?.map((topic) => (
            <Box
              key={topic}
              sx={{
                padding: '6px 14px',
                borderRadius: '100px',
                background: '#1A1E2A',
                border: '1px solid #2A3A50',
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: mono,
                color: '#4A6080',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {topic}
            </Box>
          ))}
        </Box>
      </Box>
    )
  }

  /* Review Preview & Certification */
  if (field.type === 'review_preview') {
    let parsed: { anonymous: boolean; certified: boolean } = { anonymous: false, certified: false }
    try { parsed = JSON.parse(value) } catch { /* empty */ }

    const update = (key: 'anonymous' | 'certified', val: boolean) => {
      onChange(JSON.stringify({ ...parsed, [key]: val }))
    }

    return (
      <Box sx={{ mb: '10px' }}>
        {/* Preview heading */}
        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#C8D8E8', mb: '12px' }}>
          This is how your information will be publicly displayed
        </Typography>

        {/* Preview card */}
        <Box
          sx={{
            border: '1px solid #1E2530', borderRadius: '10px',
            padding: '20px', mb: '16px', background: '#111520',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}
        >
          {/* Avatar */}
          <Box sx={{ width: 56, height: 56, borderRadius: '50%', background: '#1A2030', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Typography sx={{ fontSize: '24px', color: '#2A3A50' }}>&#9679;</Typography>
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '2px' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#C8D8E8' }}>
                {parsed.anonymous ? 'Verified Reviewer' : 'Verified Reviewer'}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#1F5199', fontWeight: 700 }}>in</Typography>
            </Box>
            <Typography sx={{ fontSize: '12px', color: '#6A7A8A', lineHeight: 1.5 }}>
              {parsed.anonymous ? 'Anonymous' : 'Your Name'}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#6A7A8A', lineHeight: 1.5 }}>
              Industry, Company Size
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#6A7A8A', lineHeight: 1.5 }}>
              Used software for: Duration
            </Typography>
          </Box>
        </Box>

        {/* Anonymous checkbox */}
        <Box
          onClick={() => update('anonymous', !parsed.anonymous)}
          sx={{
            display: 'flex', alignItems: 'center', gap: '10px',
            cursor: 'pointer', mb: '10px',
          }}
        >
          <Box sx={{
            width: 20, height: 20, borderRadius: '4px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: parsed.anonymous ? `2px solid ${color}` : '2px solid #2A3A50',
            background: parsed.anonymous ? color : 'transparent',
            transition: 'all 0.15s',
          }}>
            {parsed.anonymous && <Typography sx={{ fontSize: '12px', color: '#fff', fontWeight: 700, lineHeight: 1 }}>✓</Typography>}
          </Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#C8D8E8' }}>
            Post my review anonymously
          </Typography>
        </Box>

        {/* Trust note */}
        <Typography sx={{ fontSize: '12px', color: '#4A6080', fontStyle: 'italic', lineHeight: 1.6, mb: '20px' }}>
          Research shows that users trust reviews when they come from credible sources. We will never share more than what you see above.
        </Typography>

        {/* Certification checkbox */}
        <Box
          onClick={() => update('certified', !parsed.certified)}
          sx={{
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            cursor: 'pointer', padding: '14px', borderRadius: '8px',
            border: '1px solid #1E2530', background: '#0D1015',
          }}
        >
          <Box sx={{
            width: 20, height: 20, borderRadius: '4px', flexShrink: 0, mt: '2px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: parsed.certified ? `2px solid ${color}` : '2px solid #2A3A50',
            background: parsed.certified ? color : 'transparent',
            transition: 'all 0.15s',
          }}>
            {parsed.certified && <Typography sx={{ fontSize: '12px', color: '#fff', fontWeight: 700, lineHeight: 1 }}>✓</Typography>}
          </Box>
          <Typography sx={{ fontSize: '11.5px', color: '#6A7A8A', lineHeight: 1.7 }}>
            By submitting this review, I certify to Capterra and its affiliates ("Capterra") that: I'm the person I represent to be; (ii) my feedback is based on my own experience with this product; (iii) my participation in this program is governed by the <Box component="span" sx={{ fontWeight: 700, color: '#C8D8E8' }}>Community Guidelines</Box> and <Box component="span" sx={{ fontWeight: 700, color: '#C8D8E8' }}>General User Terms</Box>; and (iv) Capterra will use my personal information to administer my participation in this program and for future communications per the <Box component="span" sx={{ fontWeight: 700, color: '#C8D8E8' }}>Capterra Privacy Policy</Box>.
          </Typography>
        </Box>
      </Box>
    )
  }

  /* Feature Table (table with importance dropdown + star rating + optional text per row) */
  if (field.type === 'feature_table') {
    const features = field.options ?? []
    const importanceOptions = ['Not Rated', 'Not Important', 'Somewhat Important', 'Important', 'Very Important', 'Critical']
    let data: Record<string, { importance: string; rating: number; text: string; removed: boolean }> = {}
    try { data = JSON.parse(value) } catch { /* empty */ }

    const updateFeature = (name: string, updates: Partial<{ importance: string; rating: number; text: string; removed: boolean }>) => {
      const current = data[name] ?? { importance: 'Not Rated', rating: 0, text: '', removed: false }
      const updated = { ...data, [name]: { ...current, ...updates } }
      onChange(JSON.stringify(updated))
    }

    const ratedCount = Object.values(data).filter((d) => !d.removed && d.rating > 0).length
    const visibleFeatures = features

    return (
      <Box sx={wrapSx}>
        <Box sx={headerSx}>
          <Typography sx={labelSx}>{field.label}</Typography>
          <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
            {isRequired ? 'required' : 'optional'}
          </Box>
        </Box>
        <Box sx={{ padding: '8px 12px 4px' }}>
          <Typography sx={{ fontSize: '11px', color: '#FF492C', fontFamily: mono, mb: '10px' }}>
            Rate at least 5 features.
          </Typography>

          {/* Feature cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {visibleFeatures.map((feat, idx) => {
              const d = data[feat] ?? { importance: 'Not Rated', rating: 0, text: '', removed: false }
              const isDisabled = d.removed === true
              const hasImportance = !isDisabled && d.importance && d.importance !== 'Not Rated'
              return (
                <Box
                  key={feat}
                  sx={{
                    background: isDisabled ? '#0A0C10' : (idx % 2 === 0 ? '#111520' : '#0D1015'),
                    border: '1px solid #1E2530',
                    borderRadius: '8px',
                    padding: '14px',
                    opacity: isDisabled ? 0.45 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {/* Top row: remove + name + importance + stars */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: hasImportance ? '12px' : 0 }}>
                    {/* Cross / disable button */}
                    <Box
                      onClick={() => {
                        if (!isDisabled) {
                          updateFeature(feat, { removed: true, importance: 'Not Rated', rating: 0, text: '' })
                        }
                      }}
                      sx={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: isDisabled ? '#2A3A50' : color, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        cursor: isDisabled ? 'default' : 'pointer', transition: 'all 0.15s',
                        color: '#fff', fontSize: '11px', fontWeight: 700,
                        '&:hover': isDisabled ? {} : { opacity: 0.8 },
                      }}
                    >
                      ✕
                    </Box>

                    {/* Feature name */}
                    <Typography sx={{ fontSize: '13px', fontWeight: 700, color: isDisabled ? '#4A6080' : '#C8D8E8', flex: 1 }}>
                      {feat}
                    </Typography>

                    {/* Importance dropdown */}
                    <Box
                      component="select"
                      value={isDisabled ? 'Not Rated' : (d.importance || 'Not Rated')}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const val = e.target.value
                        if (val !== 'Not Rated') {
                          updateFeature(feat, { importance: val, removed: false })
                        } else {
                          updateFeature(feat, { importance: val })
                        }
                      }}
                      sx={{
                        padding: '5px 24px 5px 8px', borderRadius: '6px',
                        border: '1px solid #2A3A50', background: '#0A0C10',
                        color: isDisabled || d.importance === 'Not Rated' || !d.importance ? '#4A6080' : '#A0B4C8',
                        fontSize: '11px', fontFamily: mono,
                        cursor: 'pointer', outline: 'none', appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%234A6080' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center',
                        '& option': { background: '#111520', color: '#C8D8E8' },
                      }}
                    >
                      {importanceOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Box>

                    {/* Star rating */}
                    <Box sx={{ display: 'flex', gap: '2px', opacity: hasImportance ? 1 : 0.3 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Box
                          key={s}
                          onClick={() => {
                            if (isDisabled) {
                              updateFeature(feat, { rating: s, removed: false, importance: d.importance === 'Not Rated' ? 'Not Rated' : d.importance })
                            } else if (hasImportance) {
                              updateFeature(feat, { rating: s })
                            }
                          }}
                          sx={{
                            fontSize: '20px',
                            cursor: hasImportance || isDisabled ? 'pointer' : 'not-allowed',
                            color: s <= d.rating && hasImportance ? color : '#2A3A50',
                            transition: 'color 0.1s',
                            '&:hover': hasImportance || isDisabled ? { color } : {},
                          }}
                        >
                          ★
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Text field — only show after importance is selected */}
                  {hasImportance && (
                    <>
                      <Typography sx={{ fontSize: '11px', color: '#6A7A8A', mb: '6px' }}>
                        {d.rating > 0
                          ? <>What do you like about "{feat}" in Slack? <Box component="span" sx={{ color: '#3D4A5A', fontStyle: 'italic' }}>(optional)</Box></>
                          : <>Why is "{feat}" important in "Slack"? <Box component="span" sx={{ color: '#3D4A5A', fontStyle: 'italic' }}>(optional)</Box></>
                        }
                      </Typography>
                      <Box
                        component="textarea"
                        value={d.text}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFeature(feat, { text: e.target.value })}
                        rows={3}
                        placeholder=""
                        sx={{
                          width: '100%', background: '#0A0C10', border: '1px solid #1E2530',
                          borderRadius: '6px', outline: 'none', resize: 'vertical',
                      fontSize: '11px', color: '#A0B4C8', padding: '8px 10px',
                      lineHeight: 1.5, fontFamily: "'Space Grotesk', sans-serif",
                      '&:focus': { borderColor: `${color}60` },
                      '&::placeholder': { color: '#2A3A50' },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '6px' }}>
                    <AiGenerateButton onClick={() => {}} />
                  </Box>
                    </>
                  )}
                </Box>
              )
            })}
          </Box>
        </Box>

        <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
          <Typography sx={{ fontSize: '10px', color: ratedCount >= 5 ? '#00C47A' : '#2A3A50', fontFamily: mono }}>
            {ratedCount} of 5 minimum features rated
          </Typography>
        </Box>
      </Box>
    )
  }

  /* Pricing scale ($, $$, $$$, $$$$, $$$$$) */
  if (field.type === 'pricing_scale') {
    const options = field.options ?? ['$', '$$', '$$$', '$$$$', '$$$$$']
    const labels = field.scaleLabels ?? {}
    const selectedIdx = options.indexOf(value)
    return (
      <Box sx={wrapSx}>
        <Box sx={headerSx}>
          <Typography sx={labelSx}>{field.label}</Typography>
          <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
            {isRequired ? 'required' : 'optional'}
          </Box>
        </Box>
        <Box sx={{ padding: '12px 12px 6px' }}>
          <Box sx={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid #1E2530' }}>
            {options.map((opt, i) => {
              const isSelected = i === selectedIdx
              return (
                <Box
                  key={opt}
                  onClick={() => onChange(opt)}
                  sx={{
                    flex: 1,
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: mono,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    borderRight: i < options.length - 1 ? '1px solid #1E2530' : 'none',
                    ...(isSelected
                      ? { background: color, color: '#fff' }
                      : { background: '#111520', color: '#4A6080' }),
                    '&:hover': isSelected ? {} : { background: '#1A1E2A', color: '#C8D8E8' },
                  }}
                >
                  {opt}
                </Box>
              )
            })}
          </Box>
          {/* Labels */}
          {Object.keys(labels).length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '6px' }}>
              {Object.entries(labels).map(([pos, text]) => (
                <Typography key={pos} sx={{ fontSize: '10px', color: '#3D4A5A', fontFamily: mono, fontStyle: 'italic' }}>
                  {text}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
        <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
          <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
            {value ? `Selected: ${value}` : 'Click to select pricing level'}
          </Typography>
        </Box>
      </Box>
    )
  }

  /* NPS Scale (0–10 with labels) */
  if (field.type === 'nps_scale') {
    const start = field.scaleStart ?? 0
    const max = field.scaleMax ?? 10
    const labels = field.scaleLabels ?? {}
    const numVal = value !== '' ? Number(value) : -1
    return (
      <Box sx={wrapSx}>
        <Box sx={headerSx}>
          <Typography sx={labelSx}>{field.label}</Typography>
          <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
            {isRequired ? 'required' : 'optional'}
          </Box>
        </Box>
        <Box sx={{ padding: '12px 12px 6px' }}>
          <Box sx={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
            {Array.from({ length: max - start + 1 }, (_, i) => start + i).map((n) => {
              const isSelected = n === numVal
              const npsColor = n <= 6 ? '#FF492C' : n <= 8 ? '#F5A623' : '#00C47A'
              return (
                <Box
                  key={n}
                  onClick={() => onChange(String(n))}
                  sx={{
                    width: 38, height: 38,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '8px', fontSize: '13px', fontWeight: 700, fontFamily: mono,
                    cursor: 'pointer', transition: 'all 0.15s',
                    ...(isSelected
                      ? { background: `${npsColor}20`, color: npsColor, border: `2px solid ${npsColor}`, boxShadow: `0 0 8px ${npsColor}40` }
                      : { border: '1px solid #2A3A50', color: '#4A6080' }),
                    '&:hover': { borderColor: npsColor, color: npsColor },
                  }}
                >
                  {n}
                </Box>
              )
            })}
          </Box>
          {/* Labels row — aligned under the number boxes */}
          {Object.keys(labels).length > 0 && (
            <Box sx={{ display: 'flex', gap: '4px', mt: '6px', justifyContent: 'center' }}>
              {Array.from({ length: max - start + 1 }, (_, i) => start + i).map((n) => (
                <Box key={n} sx={{ width: 38, flex: '0 0 auto', textAlign: 'center' }}>
                  {labels[n] != null && (
                    <Typography sx={{ fontSize: '9px', color: '#3D4A5A', fontFamily: mono }}>
                      {labels[n]}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
          <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
            {numVal >= 0 ? `${numVal} / ${max} selected` : 'Click a number to rate'}
          </Typography>
        </Box>
      </Box>
    )
  }

  /* Feature Rating (multi-select with text + satisfaction per feature) */
  if (field.type === 'feature_rating') {
    const features = field.features ?? []
    let parsed: Record<string, { selected: boolean; text: string; satisfaction: number }> = {}
    try { parsed = JSON.parse(value) } catch { /* empty */ }

    const toggleFeature = (name: string) => {
      const current = parsed[name]
      const updated = {
        ...parsed,
        [name]: current?.selected
          ? { ...current, selected: false }
          : { selected: true, text: current?.text ?? '', satisfaction: current?.satisfaction ?? 5 },
      }
      onChange(JSON.stringify(updated))
    }

    const updateText = (name: string, text: string) => {
      const updated = { ...parsed, [name]: { ...parsed[name], text } }
      onChange(JSON.stringify(updated))
    }

    const updateSatisfaction = (name: string, sat: number) => {
      const updated = { ...parsed, [name]: { ...parsed[name], satisfaction: sat } }
      onChange(JSON.stringify(updated))
    }

    const selectedCount = Object.values(parsed).filter((f) => f.selected).length

    return (
      <Box sx={wrapSx}>
        <Box sx={headerSx}>
          <Typography sx={labelSx}>{field.label}</Typography>
          <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
            {isRequired ? 'required' : 'optional'}
          </Box>
        </Box>
        <Box sx={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: 420, overflowY: 'auto' }}>
          {features.map((feat) => {
            const data = parsed[feat.name]
            const isSelected = data?.selected ?? false
            return (
              <Box key={feat.name}>
                {/* Feature toggle */}
                <Box
                  onClick={() => toggleFeature(feat.name)}
                  sx={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                    transition: 'all 0.15s',
                    ...(isSelected
                      ? { background: `${color}10`, border: `1px solid ${color}40` }
                      : { background: '#0D1015', border: '1px solid #1A1E28' }),
                    '&:hover': { borderColor: color },
                  }}
                >
                  <Box sx={{
                    width: 18, height: 18, borderRadius: '4px', flexShrink: 0, mt: '1px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: isSelected ? `1px solid ${color}` : '1px solid #2A3A50',
                    background: isSelected ? `${color}20` : 'transparent',
                    color: isSelected ? color : 'transparent',
                    fontSize: '11px', fontWeight: 700,
                  }}>
                    {isSelected ? '✓' : ''}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: isSelected ? '#C8D8E8' : '#6A7A8A', mb: '2px' }}>
                      {feat.name}
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: '#3D4A5A', lineHeight: 1.4 }}>
                      {feat.desc}
                    </Typography>
                  </Box>
                </Box>

                {/* Expanded: text field + satisfaction slider */}
                {isSelected && (
                  <Box sx={{ ml: '28px', mt: '8px', mb: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Box>
                      <Typography sx={{ fontSize: '9px', color: '#3D4A5A', fontFamily: mono, mb: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Tell us more about this feature
                      </Typography>
                      <Box
                        component="textarea"
                        value={data?.text ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateText(feat.name, e.target.value)}
                        rows={2}
                        placeholder="Share your experience with this feature..."
                        sx={{
                          width: '100%', background: '#0D1015', border: '1px solid #1A1E28',
                          borderRadius: '6px', outline: 'none', resize: 'vertical',
                          fontSize: '11px', color: '#A0B4C8', padding: '8px 10px',
                          lineHeight: 1.5, fontFamily: "'Space Grotesk', sans-serif",
                          '&:focus': { borderColor: `${color}60` },
                          '&::placeholder': { color: '#2A3A50' },
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '6px' }}>
                        <AiGenerateButton onClick={() => {}} />
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '6px' }}>
                        <Typography sx={{ fontSize: '9px', color: '#FF492C', fontFamily: mono }}>Not Satisfied</Typography>
                        <Typography sx={{ fontSize: '9px', color: '#00C47A', fontFamily: mono }}>Very Satisfied</Typography>
                      </Box>
                      <Box sx={{ position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
                        {/* Track */}
                        <Box sx={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2, background: '#1E2530' }} />
                        {/* Filled track */}
                        <Box sx={{ position: 'absolute', left: 0, width: `${((data?.satisfaction ?? 5) / 10) * 100}%`, height: 4, borderRadius: 2, background: `linear-gradient(90deg, #FF492C, #F5A623, #00C47A)` }} />
                        {/* Range input */}
                        <Box
                          component="input"
                          type="range"
                          min={0}
                          max={10}
                          value={data?.satisfaction ?? 5}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSatisfaction(feat.name, Number(e.target.value))}
                          sx={{
                            position: 'absolute', left: 0, right: 0, width: '100%',
                            appearance: 'none', background: 'transparent', cursor: 'pointer',
                            '&::-webkit-slider-thumb': {
                              appearance: 'none', width: 16, height: 16, borderRadius: '50%',
                              background: color, border: `2px solid ${color}`,
                              boxShadow: `0 0 6px ${color}60`,
                            },
                            '&::-moz-range-thumb': {
                              width: 16, height: 16, borderRadius: '50%', border: 'none',
                              background: color, boxShadow: `0 0 6px ${color}60`,
                            },
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono, textAlign: 'center', mt: '4px' }}>
                        {data?.satisfaction ?? 5} / 10
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )
          })}
        </Box>
        <Box sx={{ padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
          <Typography sx={{ fontSize: '10px', color: '#2A3A50', fontFamily: mono }}>
            {selectedCount > 0 ? `${selectedCount} feature${selectedCount > 1 ? 's' : ''} selected` : 'Select the features you use'}
          </Typography>
        </Box>
      </Box>
    )
  }

  /* Default: editable text field */
  const charCount = value.length
  const charLabel = field.maxChars
    ? `${charCount} / ${field.maxChars}`
    : `${charCount} chars`
  const overLimit = field.maxChars ? charCount > field.maxChars : false

  return (
    <Box sx={wrapSx}>
      <Box sx={headerSx}>
        <Typography sx={labelSx}>{field.label}</Typography>
        <Box component="span" sx={{ fontSize: '9px', padding: '1px 7px', borderRadius: '100px', fontFamily: mono, fontWeight: 500, ...badgeSx }}>
          {isRequired ? 'required' : 'optional'}
        </Box>
      </Box>
      <Box
        component="textarea"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        rows={Math.max(3, Math.ceil(value.length / 80))}
        placeholder={field.hint ?? 'Type your answer here...'}
        sx={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          fontSize: '12.5px',
          color: '#A0B4C8',
          padding: '8px 12px 10px',
          lineHeight: 1.6,
          fontFamily: "'Space Grotesk', sans-serif",
          '&:focus': { background: '#0D1015' },
          '&::placeholder': { color: '#2A3A50' },
        }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', background: '#0A0C10', borderTop: '1px solid #1A1E28' }}>
        <Typography sx={{ fontSize: '10px', color: overLimit ? '#FF492C' : '#2A3A50', fontFamily: mono }}>
          {charLabel}
        </Typography>
        <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <AiGenerateButton onClick={() => {}} />
          <Box
            component="button"
            onClick={handleCopy}
            sx={{
              fontSize: '10px', padding: '4px 14px', borderRadius: '4px',
              border: copied ? '1px solid #00C47A' : `1px solid ${color}`,
              background: copied ? '#0D1F16' : `${color}15`,
              color: copied ? '#00C47A' : color,
              cursor: 'pointer', fontFamily: mono, fontWeight: 600,
              transition: 'all 0.15s',
              '&:hover': { background: copied ? '#0D1F16' : `${color}25` },
            }}
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
