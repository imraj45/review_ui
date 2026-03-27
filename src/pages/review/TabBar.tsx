import { Box } from '@mui/material'
import type { Tab } from '../../data/platforms'
import { mono } from './constants'

export default function TabBar({
  tabs,
  activeIndex,
  visitedSet,
  color,
  onSelect,
  showSubmit,
}: {
  tabs: Tab[]
  activeIndex: number
  visitedSet: Set<number>
  color: string
  onSelect: (i: number) => void
  showSubmit: boolean
}) {
  const allTabs = [
    ...tabs.map((t) => t.name),
    ...(showSubmit ? ['Submit'] : []),
  ]
  const totalTabs = allTabs.length
  const submitIndex = tabs.length

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: '1.5rem',
        overflow: 'hidden',
        borderRadius: '8px',
        border: '1px solid #1E2530',
      }}
    >
      {allTabs.map((name, i) => {
        const isActive =
          showSubmit && activeIndex === submitIndex
            ? i === submitIndex
            : i === activeIndex
        const isDone = visitedSet.has(i) && !isActive

        return (
          <Box
            key={name}
            onClick={() => onSelect(i)}
            sx={{
              flex: 1,
              padding: '9px 6px',
              textAlign: 'center',
              fontSize: '10px',
              fontFamily: mono,
              color: isActive ? color : isDone ? '#00C47A' : '#3D4A5A',
              background: isActive
                ? `${color}15`
                : isDone
                  ? '#0D1A10'
                  : '#111520',
              cursor: 'pointer',
              borderRight: i < totalTabs - 1 ? '1px solid #1E2530' : 'none',
              transition: 'all 0.15s',
              lineHeight: 1.3,
            }}
          >
            <Box
              component="span"
              sx={{
                display: 'block',
                fontSize: '8px',
                color: isActive ? color : isDone ? '#1A4030' : '#2A3A4A',
                mb: '2px',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </Box>
            {name}
          </Box>
        )
      })}
    </Box>
  )
}
