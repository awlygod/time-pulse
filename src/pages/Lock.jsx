import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimeCapsule } from '../context/TimeCapsuleContext'
import { saveCapsule } from '../utils/localStorage'
import LoginModal from '../components/ui/LoginModal'
import Spinner from '../components/ui/Spinner'
import { DEFAULT_MILESTONES } from '../components/capsule/YieldMilestones'
import toast from 'react-hot-toast'

const ASSETS = ['USDC', 'ETH', 'BTC']

const LOCK_PERIODS = [
  { label: '6 months', months: 6 },
  { label: '1 year', months: 12 },
  { label: '2 years', months: 24 },
]

const inputStyle = {
  width: '100%',
  background: '#161616',
  border: '0.5px solid #2a2a2a',
  borderRadius: '6px',
  padding: '10px 12px',
  color: '#f0f0f0',
  fontSize: '13px',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const label = (text, sub) => (
  <div style={{ marginBottom: '8px' }}>
    <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
      {text}
    </div>
    {sub && <div style={{ fontSize: '11px', color: '#3a3a3a', marginTop: '2px' }}>{sub}</div>}
  </div>
)

export default function Lock() {
  const { user, createCapsule } = useTimeCapsule()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    item: '',
    purchaseAmount: '',
    asset: 'USDC',
    lockPeriod: 12,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  // Auto-calculate 10% lock amount
  const lockAmount = form.purchaseAmount
    ? parseFloat((parseFloat(form.purchaseAmount) * 0.1).toFixed(2))
    : null

  // Compute unlock date from lock period
  const getUnlockDate = () => {
    const d = new Date()
    d.setMonth(d.getMonth() + parseInt(form.lockPeriod))
    return d.getTime()
  }

  const validate = () => {
    const errs = {}
    if (!form.item.trim()) errs.item = 'required'
    if (!form.purchaseAmount || parseFloat(form.purchaseAmount) <= 0)
      errs.purchaseAmount = 'must be greater than 0'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { setShowLogin(true); return }
    if (!validate()) return

    setLoading(true)
    try {
      const unlockDate = getUnlockDate()
      const { capsuleId } = await createCapsule({
        asset: form.asset,
        amount: lockAmount,
        unlockDate,
        message: `your reward for buying: ${form.item}`,
      })

      saveCapsule({
        id: capsuleId,
        recipient: form.item,
        message: `your reward for buying: ${form.item}`,
        asset: form.asset,
        amount: lockAmount,
        unlockDate,
        createdAt: Date.now(),
        creatorAddress: user.address,
        mediaUrl: null,
        mediaType: null,
        contributors: [],
        milestones: DEFAULT_MILESTONES.map((m) => ({ ...m })),
        status: 'locked',
        type: 'purchase', // distinguishes from gift capsules
        purchaseAmount: parseFloat(form.purchaseAmount),
        item: form.item,
      })

      toast.success('bonus locked!')
      navigate(`/capsule/${capsuleId}`)
    } catch {
      toast.error('something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const errMsg = (field) =>
    errors[field] ? (
      <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{errors[field]}</div>
    ) : null

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '36px 24px 64px' }}>
      <div style={{ fontSize: '11px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
        purchase bonus
      </div>
      <h2 style={{ fontSize: '22px', fontWeight: 500, margin: '0 0 8px', letterSpacing: '-0.3px' }}>
        lock your purchase bonus
      </h2>
      <p style={{ fontSize: '13px', color: '#555', margin: '0 0 32px', lineHeight: 1.6 }}>
        put 10% of your purchase into a yield pool. claim it back — plus earnings — after the lock period.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* What did you buy */}
        <div>
          {label('what did you buy')}
          <input
            type="text"
            placeholder="e.g. Rolex Submariner, Hermès bag..."
            value={form.item}
            onChange={set('item')}
            style={inputStyle}
          />
          {errMsg('item')}
        </div>

        {/* Purchase amount */}
        <div>
          {label('purchase price', 'we will lock 10% automatically')}
          <div style={{ position: 'relative' }}>
            <select
              value={form.asset}
              onChange={set('asset')}
              style={{
                position: 'absolute',
                right: '1px',
                top: '1px',
                bottom: '1px',
                background: '#1e1e1e',
                border: 'none',
                borderLeft: '0.5px solid #2a2a2a',
                borderRadius: '0 5px 5px 0',
                color: '#888',
                fontSize: '12px',
                padding: '0 10px',
                cursor: 'pointer',
              }}
            >
              {ASSETS.map((a) => <option key={a}>{a}</option>)}
            </select>
            <input
              type="number"
              placeholder="50000"
              value={form.purchaseAmount}
              onChange={set('purchaseAmount')}
              min="0"
              step="1"
              style={{ ...inputStyle, paddingRight: '80px' }}
            />
          </div>
          {errMsg('purchaseAmount')}
        </div>

        {/* 10% preview card */}
        {lockAmount && (
          <div
            style={{
              background: '#0d1f14',
              border: '0.5px solid #1a3d24',
              borderRadius: '8px',
              padding: '16px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#4ade80', opacity: 0.6, marginBottom: '4px' }}>amount locked</div>
              <div style={{ fontSize: '18px', fontWeight: 500, color: '#4ade80' }}>
                {lockAmount} {form.asset}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#4ade80', opacity: 0.6, marginBottom: '4px' }}>est. at 5% APY</div>
              <div style={{ fontSize: '18px', fontWeight: 500, color: '#4ade80' }}>
                {(lockAmount * (1 + 0.05 * (parseInt(form.lockPeriod) / 12))).toFixed(2)} {form.asset}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', borderTop: '0.5px solid #1a3d24', paddingTop: '10px' }}>
              <div style={{ fontSize: '11px', color: '#4ade80', opacity: 0.5 }}>
                10% of your {parseFloat(form.purchaseAmount).toLocaleString()} {form.asset} purchase, working for you
              </div>
            </div>
          </div>
        )}

        {/* Lock period */}
        <div>
          {label('lock period')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {LOCK_PERIODS.map((p) => (
              <button
                key={p.months}
                type="button"
                onClick={() => setForm({ ...form, lockPeriod: p.months })}
                style={{
                  background: form.lockPeriod === p.months ? '#fff' : '#161616',
                  color: form.lockPeriod === p.months ? '#111' : '#555',
                  border: `0.5px solid ${form.lockPeriod === p.months ? '#fff' : '#2a2a2a'}`,
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: form.lockPeriod === p.months ? 500 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#333' : '#fff',
            color: loading ? '#888' : '#111',
            border: 'none',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '8px',
          }}
        >
          {loading && <Spinner size={14} color="#888" />}
          {loading ? 'locking...' : `lock ${lockAmount ? lockAmount + ' ' + form.asset : 'bonus'}`}
        </button>

      </form>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => handleSubmit({ preventDefault: () => {} })}
        />
      )}
    </div>
  )
}