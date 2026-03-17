import { Link } from 'react-router-dom'
import dayjs from 'dayjs'

const statusStyles = {
  locked: { bg: '#1e1e1e', border: '#2a2a2a', color: '#888' },
  unlocked: { bg: '#0d1f14', border: '#1a3d24', color: '#4ade80' },
  claimed: { bg: '#1e1e1e', border: '#2a2a2a', color: '#555' },
}

export default function CapsuleCard({ capsule }) {
  const { id, recipient, unlockDate, amount, asset, status, currentValue } = capsule
  const style = statusStyles[status] || statusStyles.locked
  const formattedDate = dayjs(unlockDate).format('MMM D, YYYY')

  return (
    <div
      style={{
        background: '#161616',
        border: '0.5px solid #222',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
            {recipient || 'unnamed capsule'}
          </div>
          <div style={{ fontSize: '11px', color: '#555' }}>
            {status === 'claimed' ? `claimed` : `unlocks ${formattedDate}`}
          </div>
        </div>
        <div
          style={{
            background: style.bg,
            border: `0.5px solid ${style.border}`,
            borderRadius: '4px',
            padding: '3px 8px',
            fontSize: '10px',
            color: style.color,
            letterSpacing: '0.5px',
          }}
        >
          {status}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: status === 'claimed' ? '#555' : '#f0f0f0' }}>
            {currentValue || amount} {asset}
          </div>
        </div>
        <Link
          to={`/capsule/${id}`}
          style={{
            background: 'transparent',
            border: '0.5px solid #2a2a2a',
            color: '#888',
            padding: '6px 12px',
            borderRadius: '5px',
            fontSize: '11px',
            textDecoration: 'none',
          }}
        >
          view
        </Link>
      </div>
    </div>
  )
}