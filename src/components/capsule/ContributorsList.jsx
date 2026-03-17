import { useMemo, useState } from 'react'

function seededRandom(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  return () => {
    h ^= h << 13; h ^= h >> 17; h ^= h << 5
    return ((h >>> 0) / 4294967296)
  }
}

function getStarPositions(contributors, width = 280, height = 140) {
  return contributors.map((c, i) => {
    const rand = seededRandom((c.name || c.address || '') + i)
    const padding = 24
    return {
      x: padding + rand() * (width - padding * 2),
      y: padding + rand() * (height - padding * 2),
      label: c.name || (c.address ? c.address.slice(0, 6) + '…' : `guest ${i + 1}`),
      amount: c.amount,
    }
  })
}

export default function ContributorsList({ contributors = [], asset }) {
  const [hovered, setHovered] = useState(null)
  const stars = useMemo(() => getStarPositions(contributors), [contributors])

  if (!contributors.length) return null

  const W = 280
  const H = 140

  return (
    <div style={{ background: '#161616', border: '0.5px solid #222', borderRadius: '8px', padding: '16px' }}>
      <div style={{ fontSize: '11px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
        contributors · {contributors.length}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
          {stars.map((s, i) =>
            stars.slice(i + 1).map((t, j) => {
              const dist = Math.hypot(s.x - t.x, s.y - t.y)
              if (dist > 120) return null
              return <line key={`${i}-${j}`} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="#2a2a2a" strokeWidth="0.5" />
            })
          )}
          {stars.map((s, i) => (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'default' }}>
              {hovered === i && <circle cx={s.x} cy={s.y} r="10" fill="rgba(74,222,128,0.06)" />}
              <circle cx={s.x} cy={s.y} r={hovered === i ? 4 : 2.5} fill={hovered === i ? '#4ade80' : '#3a3a3a'} style={{ transition: 'r 0.15s ease, fill 0.15s ease' }} />
              {hovered === i && (
                <g>
                  <rect x={s.x + 8} y={s.y - 12} width={s.amount ? 90 : 70} height={s.amount ? 28 : 18} rx="3" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="0.5" />
                  <text x={s.x + 14} y={s.y - 2} fontSize="10" fill="#ccc" fontFamily="system-ui">{s.label}</text>
                  {s.amount && <text x={s.x + 14} y={s.y + 10} fontSize="9" fill="#4ade80" fontFamily="system-ui">{s.amount} {asset}</text>}
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {contributors.map((c, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: hovered === i ? '#f0f0f0' : '#666', transition: 'color 0.15s ease' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <span>{c.name || c.address?.slice(0, 10) || `guest ${i + 1}`}</span>
            {c.amount && <span style={{ color: hovered === i ? '#4ade80' : '#555' }}>{c.amount} {asset}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}