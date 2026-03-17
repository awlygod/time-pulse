import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTimeCapsule } from '../context/TimeCapsuleContext'
import { getCapsuleById, updateCapsule } from '../utils/localStorage'
import CountdownTimer from '../components/capsule/CountdownTimer'
import BalanceCard from '../components/capsule/BalanceCard'
import ContributorsList from '../components/capsule/ContributorsList'
import WaxSeal from '../components/capsule/WaxSeal'
import AnticipationCounter from '../components/capsule/AnticipationCounter'
import YieldMilestones from '../components/capsule/YieldMilestones'
import MessageReveal from '../components/ui/MessageReveal'
import LoginModal from '../components/ui/LoginModal'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const POLL_INTERVAL = 30000 // poll balance every 30s

export default function CapsuleView() {
  const { id } = useParams()
  const { user, getCapsuleBalance, claimCapsule } = useTimeCapsule()

  const [capsule, setCapsule] = useState(null)
  const [balance, setBalance] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [copied, setCopied] = useState(false)
  const pollRef = useRef(null)

  useEffect(() => {
    const data = getCapsuleById(id)
    if (!data) { setNotFound(true); return }
    setCapsule(data)
  }, [id])

  // Initial balance fetch + polling every 30s
  useEffect(() => {
    if (!capsule) return

    const fetchBalance = () => getCapsuleBalance(id).then(setBalance)
    fetchBalance()

    // Only poll if not claimed
    if (capsule.status !== 'claimed') {
      pollRef.current = setInterval(fetchBalance, POLL_INTERVAL)
    }

    return () => clearInterval(pollRef.current)
  }, [capsule?.id])

  const isUnlocked = capsule && Date.now() >= capsule.unlockDate
  const isClaimed = capsule?.status === 'claimed'
  const isCreator = user?.address === capsule?.creatorAddress

  // Current yield % for milestone tracking
  const currentYieldPct = balance && balance.principal > 0
    ? parseFloat(((balance.yield / balance.principal) * 100).toFixed(4))
    : 0

  const handleClaim = async () => {
    if (!user) { setShowLogin(true); return }
    setClaiming(true)
    try {
      await claimCapsule(id)
      clearInterval(pollRef.current)
      updateCapsule(id, { status: 'claimed', claimedAt: Date.now() })
      setCapsule((prev) => ({ ...prev, status: 'claimed', claimedAt: Date.now() }))
      toast.success('gift claimed! funds sent to your wallet.')
    } catch {
      toast.error('claim failed, try again')
    } finally {
      setClaiming(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (notFound) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>404</div>
        <div style={{ fontSize: '14px', color: '#555', marginBottom: '24px' }}>capsule not found</div>
        <Link to="/" style={{ fontSize: '13px', color: '#888', textDecoration: 'underline' }}>go home</Link>
      </div>
    )
  }

  if (!capsule) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <Spinner size={20} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 24px 64px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>
          capsule #{id.slice(-6).toUpperCase()}
        </div>
        <button
          onClick={handleCopy}
          style={{ background: 'transparent', border: '0.5px solid #2a2a2a', color: '#666', padding: '5px 10px', borderRadius: '5px', fontSize: '11px', cursor: 'pointer' }}
        >
          {copied ? 'copied!' : 'copy link'}
        </button>
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 500, margin: '0 0 24px', letterSpacing: '-0.3px' }}>
        {capsule.recipient
          ? `happy ${capsule.recipient.toLowerCase().includes('birthday') ? 'birthday' : 'day'}, ${capsule.recipient}!`
          : 'your time capsule'}
      </h2>

      {/* Wax Seal */}
      <WaxSeal isUnlocked={isUnlocked} />

      {/* Message Reveal */}
      {capsule.message && (
        <MessageReveal message={capsule.message} isUnlocked={isUnlocked} />
      )}

      {/* Media */}
      {capsule.mediaUrl ? (
        <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', border: '0.5px solid #222' }}>
          {capsule.mediaType === 'video'
            ? <video src={capsule.mediaUrl} controls style={{ width: '100%', display: 'block' }} />
            : <img src={capsule.mediaUrl} alt="attached" style={{ width: '100%', display: 'block', maxHeight: '240px', objectFit: 'cover' }} />
          }
        </div>
      ) : (
        <div style={{ background: '#161616', border: '0.5px solid #222', borderRadius: '8px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#3a3a3a' }}>no media attached</div>
        </div>
      )}

      {/* Countdown */}
      <div style={{ marginBottom: '12px' }}>
        <CountdownTimer unlockDate={capsule.unlockDate} />
      </div>

      {/* Anticipation Counter */}
      <AnticipationCounter capsuleId={id} isCreator={isCreator} />

      {/* Balance with pulse */}
      {balance && (
        <div style={{ marginBottom: '12px' }}>
          <BalanceCard
            principal={balance.principal}
            currentValue={balance.currentValue}
            yieldEarned={balance.yield}
            asset={capsule.asset}
            isClaimed={isClaimed}
          />
        </div>
      )}

      {/* Yield Milestones — the star feature */}
      {balance && (
        <YieldMilestones
          milestones={capsule.milestones}
          currentYieldPct={currentYieldPct}
          isClaimed={isClaimed}
        />
      )}

      {/* Contributor Constellation */}
      {capsule.contributors?.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <ContributorsList contributors={capsule.contributors} asset={capsule.asset} />
        </div>
      )}

      {/* Claim */}
      <div style={{ marginTop: '8px' }}>
        {isClaimed ? (
          <div style={{ background: '#0d1f14', border: '0.5px solid #1a3d24', borderRadius: '6px', padding: '12px', textAlign: 'center', fontSize: '13px', color: '#4ade80' }}>
            claimed on {dayjs(capsule.claimedAt).format('MMM D, YYYY')}
          </div>
        ) : (
          <>
            <button
              onClick={handleClaim}
              disabled={!isUnlocked || claiming}
              style={{
                width: '100%',
                background: isUnlocked ? '#fff' : '#1e1e1e',
                color: isUnlocked ? '#111' : '#444',
                border: isUnlocked ? 'none' : '0.5px solid #2a2a2a',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: isUnlocked && !claiming ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {claiming && <Spinner size={14} color="#111" />}
              {claiming ? 'claiming...' : isUnlocked ? 'claim gift' : 'claim gift · locked'}
            </button>
            {!isUnlocked && (
              <div style={{ fontSize: '11px', color: '#444', textAlign: 'center', marginTop: '8px' }}>
                available on {dayjs(capsule.unlockDate).format('MMM D, YYYY [at] h:mm A')}
              </div>
            )}
          </>
        )}
      </div>

      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onSuccess={handleClaim} />
      )}
    </div>
  )
}