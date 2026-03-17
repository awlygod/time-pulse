import { useEffect, useState } from 'react'

export default function MessageReveal({ message, isUnlocked }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // If locked, just show the message blurred/hidden
    if (!isUnlocked) return

    // Small delay before typing starts — gives seal crack time to play
    const startDelay = setTimeout(() => setStarted(true), 800)
    return () => clearTimeout(startDelay)
  }, [isUnlocked])

  useEffect(() => {
    if (!started || !message) return

    let i = 0
    const speed = 28 // ms per character

    const interval = setInterval(() => {
      i++
      setDisplayed(message.slice(0, i))
      if (i >= message.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [started, message])

  if (!message) return null

  return (
    <div
      style={{
        background: '#161616',
        border: '0.5px solid #222',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
      }}
    >
      <div style={{ fontSize: '11px', color: '#555', marginBottom: '8px' }}>message</div>

      {!isUnlocked ? (
        // Locked state — blurred placeholder
        <div style={{ position: 'relative' }}>
          <div
            style={{
              fontSize: '13px',
              color: '#ccc',
              lineHeight: 1.6,
              filter: 'blur(5px)',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {message}
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              color: '#444',
              letterSpacing: '0.5px',
            }}
          >
            unlocks with the capsule
          </div>
        </div>
      ) : (
        // Unlocked — typewriter
        <div style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.6, minHeight: '40px' }}>
          {displayed}
          {!done && (
            <span
              style={{
                display: 'inline-block',
                width: '1px',
                height: '14px',
                background: '#4ade80',
                marginLeft: '2px',
                verticalAlign: 'middle',
                animation: 'blink 0.7s step-end infinite',
              }}
            />
          )}
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
        </div>
      )}
    </div>
  )
}