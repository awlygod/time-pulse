import { useState, useEffect } from 'react'

const STORAGE_KEY = (id) => `tc_anticipation_${id}`
const TAPPED_KEY = (id) => `tc_anticipation_tapped_${id}`

export default function AnticipationCounter({ capsuleId, isCreator }) {
  const [count, setCount] = useState(0)
  const [tapped, setTapped] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(STORAGE_KEY(capsuleId)) || '0', 10)
    const hasTapped = localStorage.getItem(TAPPED_KEY(capsuleId)) === 'true'
    setCount(stored)
    setTapped(hasTapped)
  }, [capsuleId])

  const handleTap = () => {
    if (tapped || isCreator) return
    const newCount = count + 1
    localStorage.setItem(STORAGE_KEY(capsuleId), newCount)
    localStorage.setItem(TAPPED_KEY(capsuleId), 'true')
    setCount(newCount)
    setTapped(true)
    setAnimating(true)
    setTimeout(() => setAnimating(false), 600)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#161616',
        border: '0.5px solid #222',
        borderRadius: '8px',
        marginBottom: '12px',
      }}
    >
      <style>{`
        @keyframes popUp {
          0% { transform: scale(1); }
          40% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        .pop { animation: popUp 0.5s ease; }
      `}</style>

      <div>
        <span
          className={animating ? 'pop' : ''}
          style={{
            fontSize: '18px',
            fontWeight: 500,
            display: 'inline-block',
            color: count > 0 ? '#f0f0f0' : '#333',
          }}
        >
          {count}
        </span>
        <span style={{ fontSize: '12px', color: '#555', marginLeft: '8px' }}>
          {count === 1 ? 'person is waiting' : 'people are waiting'}
        </span>
      </div>

      {!isCreator && (
        <button
          onClick={handleTap}
          disabled={tapped}
          title={tapped ? "you're already waiting!" : "tap to say you're waiting"}
          style={{
            background: tapped ? 'transparent' : 'rgba(74,222,128,0.08)',
            border: `0.5px solid ${tapped ? '#2a2a2a' : 'rgba(74,222,128,0.2)'}`,
            color: tapped ? '#444' : '#4ade80',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: tapped ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {tapped ? "i'm waiting ✓" : "i'm waiting"}
        </button>
      )}
    </div>
  )
}