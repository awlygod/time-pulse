import { useCountdown } from '../../hooks/useCountdown'

export default function CountdownTimer({ unlockDate }) {
  const { days, hours, minutes, seconds, isUnlocked } = useCountdown(unlockDate)

  if (isUnlocked) {
    return (
      <div
        style={{
          background: '#0d1f14',
          border: '0.5px solid #1a3d24',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 500, color: '#4ade80' }}>unlocked!</div>
        <div style={{ fontSize: '12px', color: '#4ade80', opacity: 0.6, marginTop: '4px' }}>
          claim your gift below
        </div>
      </div>
    )
  }

  const units = [
    { label: 'days', value: days },
    { label: 'hours', value: hours },
    { label: 'mins', value: minutes },
    { label: 'secs', value: seconds },
  ]

  return (
    <div
      style={{
        background: '#161616',
        border: '0.5px solid #222',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          color: '#555',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}
      >
        unlocks in
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
        {units.map(({ label, value }) => (
          <div key={label}>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 500,
                letterSpacing: '-1px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(value).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}