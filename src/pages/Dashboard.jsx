import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTimeCapsule } from '../context/TimeCapsuleContext.jsx'
import { getCapsulesByCreator } from '../utils/localStorage'
import CapsuleCard from '../components/capsule/CapsuleCard'
import LoginModal from '../components/ui/LoginModal'

export default function Dashboard() {
  const { user } = useTimeCapsule()
  const [capsules, setCapsules] = useState([])
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (!user) return
    const raw = getCapsulesByCreator(user.address)
    // Compute status for each
    const withStatus = raw.map((c) => ({
      ...c,
      status: c.status === 'claimed' ? 'claimed' : Date.now() >= c.unlockDate ? 'unlocked' : 'locked',
    }))
    setCapsules(withStatus)
  }, [user])

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '15px', color: '#555', marginBottom: '20px' }}>
          connect to view your capsules
        </div>
        <button
          onClick={() => setShowLogin(true)}
          style={{
            background: '#fff',
            color: '#111',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Connect
        </button>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '36px 24px 64px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '28px',
        }}
      >
        <h2 style={{ fontSize: '22px', fontWeight: 500, margin: 0, letterSpacing: '-0.3px' }}>
          Your capsules
        </h2>
        <Link
          to="/create"
          style={{
            background: '#fff',
            color: '#111',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          + create new
        </Link>
      </div>

      {capsules.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            border: '0.5px dashed #222',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '16px' }}>
            No capsules yet
          </div>
          <Link
            to="/create"
            style={{
              fontSize: '13px',
              color: '#888',
              textDecoration: 'underline',
            }}
          >
            Create your first one
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {capsules.map((c) => (
            <CapsuleCard key={c.id} capsule={c} />
          ))}
        </div>
      )}
    </div>
  )
}