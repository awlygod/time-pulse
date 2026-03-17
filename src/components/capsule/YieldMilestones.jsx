import { useEffect, useState } from 'react'

// Default milestone thresholds if sender doesn't customise
export const DEFAULT_MILESTONES = [
  { pct: 1, message: "it's growing 🌱" },
  { pct: 3, message: "something real is forming 🌿" },
  { pct: 5, message: "this gift has taken on a life of its own 🌳" },
]

// Animate a single milestone card in
function MilestoneCard({ milestone, isNew }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // slight delay so animation triggers after mount
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        @keyframes slideIn {
          0%  { opacity: 0; transform: translateY(8px); }
          100%{ opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
          50%      { box-shadow: 0 0 0 6px rgba(74,222,128,0.1); }
        }
        .milestone-in  { animation: slideIn 0.4s ease forwards; }
        .milestone-new { animation: glowPulse 1.5s ease 3; }
      `}</style>

      <div
        className={`${visible ? 'milestone-in' : ''} ${isNew ? 'milestone-new' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '12px 14px',
          background: isNew ? 'rgba(74,222,128,0.04)' : 'transparent',
          borderLeft: `2px solid ${isNew ? '#4ade80' : '#2a2a2a'}`,
          borderRadius: '0 6px 6px 0',
          transition: 'background 0.3s ease',
          opacity: 0,
        }}
      >
        <div style={{ marginTop: '1px' }}>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isNew ? '#4ade80' : '#2a2a2a',
              border: isNew ? 'none' : '0.5px solid #333',
              marginTop: '4px',
            }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: '11px',
              color: isNew ? '#4ade80' : '#444',
              letterSpacing: '0.5px',
              marginBottom: '3px',
            }}
          >
            {milestone.pct}% yield reached
          </div>
          <div style={{ fontSize: '13px', color: isNew ? '#e0e0e0' : '#555', lineHeight: 1.5 }}>
            {milestone.message}
          </div>
        </div>
      </div>
    </>
  )
}

// Locked future milestone — shown as a teaser
function LockedMilestone({ milestone }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        borderLeft: '2px solid #1a1a1a',
        borderRadius: '0 6px 6px 0',
        opacity: 0.4,
      }}
    >
      <div
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          border: '0.5px solid #333',
          marginTop: '0px',
        }}
      />
      <div style={{ fontSize: '11px', color: '#3a3a3a', letterSpacing: '0.5px' }}>
        unlocks at {milestone.pct}% yield ···
      </div>
    </div>
  )
}

export default function YieldMilestones({ milestones = DEFAULT_MILESTONES, currentYieldPct, isClaimed }) {
  // Track which milestones were newly crossed this session
  const [prevPct, setPrevPct] = useState(currentYieldPct)
  const [newlyUnlocked, setNewlyUnlocked] = useState(new Set())

  useEffect(() => {
    if (currentYieldPct <= prevPct) return
    const crossed = new Set()
    milestones.forEach((m) => {
      if (m.pct <= currentYieldPct && m.pct > prevPct) {
        crossed.add(m.pct)
      }
    })
    if (crossed.size > 0) setNewlyUnlocked((prev) => new Set([...prev, ...crossed]))
    setPrevPct(currentYieldPct)
  }, [currentYieldPct])

  const reached = milestones.filter((m) => m.pct <= currentYieldPct)
  const upcoming = milestones.filter((m) => m.pct > currentYieldPct)

  if (!milestones.length) return null

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            color: '#555',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          yield milestones
        </div>
        <div style={{ fontSize: '11px', color: '#3a3a3a' }}>
          {reached.length}/{milestones.length} reached
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {reached.map((m) => (
          <MilestoneCard
            key={m.pct}
            milestone={m}
            isNew={newlyUnlocked.has(m.pct)}
          />
        ))}
        {!isClaimed &&
          upcoming.map((m) => <LockedMilestone key={m.pct} milestone={m} />)}
      </div>

      {reached.length === milestones.length && !isClaimed && (
        <div
          style={{
            marginTop: '12px',
            fontSize: '11px',
            color: '#4ade80',
            textAlign: 'center',
            letterSpacing: '0.5px',
          }}
        >
          all milestones reached
        </div>
      )}
    </div>
  )
}