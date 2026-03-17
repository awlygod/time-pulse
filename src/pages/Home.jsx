import { useNavigate } from 'react-router-dom'
import { useTimeCapsule } from '../context/TimeCapsuleContext.jsx'
import { useState } from 'react'
import LoginModal from '../components/ui/LoginModal'

const EXAMPLE_CAPSULES = [
  { recipient: 'happy birthday, alex', daysLeft: 12, amount: '0.052', asset: 'ETH', yield: '+4.2%' },
  { recipient: 'graduation gift for priya', daysLeft: 34, amount: '120', asset: 'USDC', yield: '+2.8%' },
  { recipient: 'anniversary surprise', daysLeft: 60, amount: '0.1', asset: 'ETH', yield: '+5.1%' },
]

const steps = [
  { n: '01', title: 'create', desc: 'pick amount, date, add a message & photo' },
  { n: '02', title: 'share', desc: 'send the unique link to your loved one' },
  { n: '03', title: 'celebrate', desc: 'on the day, they claim principal + yield' },
]

export default function Home() {
  const { user } = useTimeCapsule()
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)

  const handleCTA = () => {
    if (user) {
      navigate('/create')
    } else {
      setShowLogin(true)
    }
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 24px' }}>
      {/* Hero */}
      <div style={{ padding: '72px 0 48px', textAlign: 'center' }}>
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '1.5px',
            color: '#555',
            marginBottom: '20px',
            textTransform: 'uppercase',
          }}
        >
          crypto gifting, reimagined
        </div>
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 500,
            lineHeight: 1.2,
            margin: '0 0 16px',
            letterSpacing: '-0.5px',
          }}
        >
          The time capsule
          <br />
          that grows.
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: '#666',
            lineHeight: 1.6,
            margin: '0 0 36px',
          }}
        >
          lock crypto, add a message, attach a photo, invite friends.
          <br />
          to chip in; it earns yield until the big day.
        </p>
        <button
          onClick={handleCTA}
          style={{
            background: '#fff',
            color: '#111',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Create your first capsule
        </button>
      </div>

      {/* How it works */}
      <div style={{ borderTop: '0.5px solid #1e1e1e' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {steps.map((s, i) => (
          <div
            key={s.n}
            style={{
              padding: '28px 16px',
              borderRight: i < 2 ? '0.5px solid #1e1e1e' : 'none',
            }}
          >
            <div style={{ fontSize: '11px', color: '#444', marginBottom: '8px' }}>{s.n}</div>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>{s.title}</div>
            <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Example capsules */}
      <div style={{ borderTop: '0.5px solid #1e1e1e', paddingTop: '28px', paddingBottom: '48px' }}>
        <div
          style={{
            fontSize: '11px',
            color: '#444',
            letterSpacing: '1px',
            marginBottom: '16px',
            textTransform: 'uppercase',
          }}
        >
          example capsules
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {EXAMPLE_CAPSULES.map((c, i) => (
            <div
              key={i}
              style={{
                background: '#161616',
                border: '0.5px solid #222',
                borderRadius: '8px',
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{c.recipient}</div>
                <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                  unlocks in {c.daysLeft} days
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>
                  {c.amount} {c.asset}
                </div>
                <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '2px' }}>
                  {c.yield} yield
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => navigate('/create')}
        />
      )}
    </div>
  )
}