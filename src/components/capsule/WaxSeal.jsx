import { useEffect, useState } from 'react'

// Wax seal shows when locked, cracks apart on unlock
export default function WaxSeal({ isUnlocked }) {
  const [cracking, setCracking] = useState(false)
  const [cracked, setCracked] = useState(false)

  useEffect(() => {
    if (isUnlocked) {
      // small delay so user sees the seal before it breaks
      const t1 = setTimeout(() => setCracking(true), 400)
      const t2 = setTimeout(() => setCracked(true), 1200)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [isUnlocked])

  if (cracked) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px' }}>
      <style>{`
        @keyframes sealPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.85; }
        }
        @keyframes crackLeft {
          0% { transform: rotate(0deg) translateX(0); opacity: 1; }
          100% { transform: rotate(-25deg) translateX(-30px) translateY(-10px); opacity: 0; }
        }
        @keyframes crackRight {
          0% { transform: rotate(0deg) translateX(0); opacity: 1; }
          100% { transform: rotate(20deg) translateX(30px) translateY(-8px); opacity: 0; }
        }
        @keyframes crackBottom {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(20px); opacity: 0; }
        }
        .seal-pulse { animation: sealPulse 3s ease-in-out infinite; }
        .crack-left { animation: crackLeft 0.7s ease-in forwards; }
        .crack-right { animation: crackRight 0.7s ease-in forwards; }
        .crack-bottom { animation: crackBottom 0.7s ease-in forwards; }
      `}</style>

      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        className={!cracking ? 'seal-pulse' : ''}
      >
        {/* Outer star shape */}
        {!cracking ? (
          <g>
            <polygon
              points="40,4 47,28 72,28 52,44 59,68 40,54 21,68 28,44 8,28 33,28"
              fill="#1a1a1a"
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Inner circle */}
            <circle cx="40" cy="40" r="16" fill="#222" stroke="#2a2a2a" strokeWidth="0.5" />
            {/* TC monogram */}
            <text
              x="40"
              y="45"
              textAnchor="middle"
              fontSize="11"
              fontWeight="500"
              fill="#555"
              fontFamily="system-ui"
            >
              TC
            </text>
          </g>
        ) : (
          // Split into 3 crack pieces
          <g>
            <g className="crack-left">
              <polygon
                points="40,4 47,28 33,28 21,28 8,28 28,44 21,68 40,54"
                fill="#1a1a1a"
                stroke="#333"
                strokeWidth="0.5"
              />
            </g>
            <g className="crack-right">
              <polygon
                points="40,4 47,28 72,28 52,44 59,68 40,54"
                fill="#1a1a1a"
                stroke="#333"
                strokeWidth="0.5"
              />
            </g>
            <g className="crack-bottom">
              <polygon
                points="40,54 21,68 28,44 40,40 52,44 59,68"
                fill="#161616"
                stroke="#2a2a2a"
                strokeWidth="0.5"
              />
            </g>
          </g>
        )}
      </svg>
    </div>
  )
}