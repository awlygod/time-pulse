import { useNavigate } from 'react-router-dom'
import { useTimeCapsule } from '../context/TimeCapsuleContext'
import { useState } from 'react'
import LoginModal from '../components/ui/LoginModal'

const LIVE_CAPSULES = [
  { label: 'happy birthday, alex', type: 'gift', sub: 'unlocks in 12 days', amount: '0.052 ETH', yield: '+4.2%' },
  { label: 'Rolex Submariner bonus', type: 'purchase', sub: 'unlocks in 8 months', amount: '1,250 USDC', yield: '+2.1%' },
  { label: 'graduation gift for priya', type: 'gift', sub: 'unlocks in 34 days', amount: '120 USDC', yield: '+2.8%' },
]

const steps = [
  { n: '01', title: 'lock', desc: 'choose an amount, asset, and unlock date' },
  { n: '02', title: 'earn', desc: 'funds accrue yield in a starknet pool' },
  { n: '03', title: 'claim', desc: 'on the date, claim principal plus all yield' },
]

export default function Home() {
  const { user } = useTimeCapsule()
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [loginTarget, setLoginTarget] = useState('/create')

  const handleCTA = (target) => {
    if (user) {
      navigate(target)
    } else {
      setLoginTarget(target)
      setShowLogin(true)
    }
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 24px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '64px 0 52px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '1.5px', color: '#444', marginBottom: '20px', textTransform: 'uppercase' }}>
          built on starknet
        </div>
        <h1 style={{ fontSize: '34px', fontWeight: 500, lineHeight: 1.25, margin: '0 0 16px', letterSpacing: '-0.5px' }}>
          lock value into<br />moments that matter.
        </h1>
        <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7, margin: '0 auto', maxWidth: '380px' }}>
          lock crypto into a yield pool. it grows while you wait. claim it when the moment arrives — a birthday, an anniversary, or a reward you set for yourself.
        </p>
      </div>

      {/* Two path cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '48px' }}>

        <div style={{ background: '#161616', border: '0.5px solid #222', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>for someone else</div>
            <div style={{ fontSize: '17px', fontWeight: 500, marginBottom: '8px', letterSpacing: '-0.2px' }}>gift capsule</div>
            <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.6 }}>
              lock crypto for a loved one. add a message and photo. they claim principal plus yield on the unlock date.
            </div>
          </div>
          <div style={{ borderTop: '0.5px solid #1e1e1e', paddingTop: '14px' }}>
            <div style={{ fontSize: '11px', color: '#444', marginBottom: '6px' }}>example</div>
            <div style={{ fontSize: '12px', color: '#888' }}>0.05 ETH locked for 6 months</div>
            <div style={{ fontSize: '12px', color: '#4ade80', marginTop: '2px' }}>0.0513 ETH on birthday</div>
          </div>
          <button
            onClick={() => handleCTA('/create')}
            style={{ background: '#fff', color: '#111', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginTop: 'auto' }}
          >
            create a gift
          </button>
        </div>

        <div style={{ background: '#161616', border: '0.5px solid #222', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>for yourself</div>
            <div style={{ fontSize: '17px', fontWeight: 500, marginBottom: '8px', letterSpacing: '-0.2px' }}>purchase bonus</div>
            <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.6 }}>
              lock 10% of a luxury purchase into yield. claim it back with earnings after a set period.
            </div>
          </div>
          <div style={{ borderTop: '0.5px solid #1e1e1e', paddingTop: '14px' }}>
            <div style={{ fontSize: '11px', color: '#444', marginBottom: '6px' }}>example</div>
            <div style={{ fontSize: '12px', color: '#888' }}>$5,000 locked on a $50k watch</div>
            <div style={{ fontSize: '12px', color: '#4ade80', marginTop: '2px' }}>$5,250 back after 1 year</div>
          </div>
          <button
            onClick={() => handleCTA('/lock')}
            style={{ background: '#fff', color: '#111', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginTop: 'auto' }}
          >
            lock a bonus
          </button>
        </div>

      </div>

      {/* How it works */}
      <div style={{ borderTop: '0.5px solid #1e1e1e', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ padding: '24px 16px', borderRight: i < 2 ? '0.5px solid #1e1e1e' : 'none' }}>
            <div style={{ fontSize: '11px', color: '#444', marginBottom: '6px' }}>{s.n}</div>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{s.title}</div>
            <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Live capsules */}
      <div style={{ borderTop: '0.5px solid #1e1e1e', padding: '32px 0 64px' }}>
        <div style={{ fontSize: '11px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
          live capsules
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {LIVE_CAPSULES.map((c, i) => (
            <div
              key={i}
              style={{ background: '#161616', border: '0.5px solid #222', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{c.label}</div>
                <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                  {c.type} · {c.sub}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px' }}>{c.amount}</div>
                <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '2px' }}>{c.yield}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => navigate(loginTarget)}
        />
      )}
    </div>
  )
}