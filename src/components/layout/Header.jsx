import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTimeCapsule } from '../../context/TimeCapsuleContext.jsx'
import toast from 'react-hot-toast'

export default function Header() {
  const { user, login, logout } = useTimeCapsule()
  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleConnect = async () => {
    setLoading(true)
    try {
      await login()
      toast.success('connected!')
    } catch {
      toast.error('login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setDropdownOpen(false)
    toast.success('logged out')
    navigate('/')
  }

  const shortAddress = user?.address
    ? user.address.slice(0, 6) + '...' + user.address.slice(-4)
    : ''

  return (
    <header
      style={{
        borderBottom: '0.5px solid #1e1e1e',
        background: '#0a0a0a',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 24px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: '#f0f0f0', fontSize: '15px', fontWeight: 500, letterSpacing: '-0.3px' }}>
          timecapsule.fun
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!user ? (
            <button
              onClick={handleConnect}
              disabled={loading}
              style={{
                background: '#fff',
                color: '#111',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'connecting...' : 'connect'}
            </button>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#161616',
                  border: '0.5px solid #2a2a2a',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  color: '#f0f0f0',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    background: '#2a2a2a',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#aaa',
                  }}
                >
                  {(user.email?.[0] || user.address?.[2] || 'U').toUpperCase()}
                </div>
                <span style={{ fontSize: '12px', color: '#888' }}>{user.email || shortAddress}</span>
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '40px',
                    background: '#161616',
                    border: '0.5px solid #2a2a2a',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    minWidth: '140px',
                    zIndex: 100,
                  }}
                >
                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'block',
                      padding: '10px 14px',
                      fontSize: '13px',
                      color: '#f0f0f0',
                      textDecoration: 'none',
                      borderBottom: '0.5px solid #222',
                    }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      fontSize: '13px',
                      color: '#888',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}