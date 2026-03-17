import { useState } from 'react'
import { useTimeCapsule } from '../../context/TimeCapsuleContext.jsx'
import toast from 'react-hot-toast'
import Spinner from './Spinner'

export default function LoginModal({ onClose, onSuccess }) {
  const { login } = useTimeCapsule()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const user = await login()
      toast.success('connected!')
      onSuccess?.(user)
      onClose?.()
    } catch {
      toast.error('login failed, try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#161616',
          border: '0.5px solid #2a2a2a',
          borderRadius: '12px',
          padding: '28px 24px',
          width: '100%',
          maxWidth: '360px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '6px' }}>
            Connect to continue
          </div>
          <div style={{ fontSize: '13px', color: '#555' }}>
            Sign in with email or google- no wallet needed
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: '#fff',
              color: '#111',
              border: 'none',
              borderRadius: '6px',
              padding: '11px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <Spinner size={14} color="#111" /> : null}
            {loading ? 'connecting...' : 'continue with google'}
          </button>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: 'transparent',
              color: '#f0f0f0',
              border: '0.5px solid #2a2a2a',
              borderRadius: '6px',
              padding: '11px',
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            continue with email
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '16px',
            background: 'none',
            border: 'none',
            color: '#444',
            fontSize: '12px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          cancel
        </button>
      </div>
    </div>
  )
}