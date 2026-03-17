import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimeCapsule } from '../context/TimeCapsuleContext'
import { saveCapsule } from '../utils/localStorage'
import MediaUpload from '../components/create/MediaUpload'
import GroupGifting from '../components/create/GroupGifting'
import LoginModal from '../components/ui/LoginModal'
import Spinner from '../components/ui/Spinner'
import { DEFAULT_MILESTONES } from '../components/capsule/YieldMilestones'
import toast from 'react-hot-toast'

const ASSETS = ['ETH', 'USDC', 'BTC']

const label = (text, sub) => (
  <div style={{ marginBottom: '8px' }}>
    <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
      {text}
    </div>
    {sub && <div style={{ fontSize: '11px', color: '#3a3a3a', marginTop: '2px' }}>{sub}</div>}
  </div>
)

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

export default function Create() {
  const { user, createCapsule } = useTimeCapsule()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    recipient: '',
    message: '',
    asset: 'ETH',
    amount: '',
    unlockDate: '',
  })
  const [mediaFile, setMediaFile] = useState(null)
  const [groupGifting, setGroupGifting] = useState(false)
  const [contributors, setContributors] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  // Milestones — default 3, user can customise messages
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES.map((m) => ({ ...m })))

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const updateMilestone = (i, value) => {
    const updated = [...milestones]
    updated[i].message = value
    setMilestones(updated)
  }

  const validate = () => {
    const errs = {}
    if (!form.recipient.trim()) errs.recipient = 'required'
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'must be greater than 0'
    if (!form.unlockDate) {
      errs.unlockDate = 'required'
    } else if (new Date(form.unlockDate) <= new Date()) {
      errs.unlockDate = 'date must be in the future'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { setShowLogin(true); return }
    if (!validate()) return

    setLoading(true)
    try {
      const { capsuleId } = await createCapsule({
        asset: form.asset,
        amount: parseFloat(form.amount),
        unlockDate: new Date(form.unlockDate).getTime(),
        message: form.message,
      })

      const mediaUrl = mediaFile ? URL.createObjectURL(mediaFile) : null
      saveCapsule({
        id: capsuleId,
        recipient: form.recipient,
        message: form.message,
        asset: form.asset,
        amount: parseFloat(form.amount),
        unlockDate: new Date(form.unlockDate).getTime(),
        createdAt: Date.now(),
        creatorAddress: user.address,
        mediaUrl,
        mediaType: mediaFile?.type.startsWith('video') ? 'video' : mediaFile ? 'image' : null,
        contributors: groupGifting ? contributors : [],
        milestones,
        status: 'locked',
      })

      toast.success('capsule created!')
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
        new capsule
      </div>
      <h2 style={{ fontSize: '22px', fontWeight: 500, margin: '0 0 32px', letterSpacing: '-0.3px' }}>
        create time capsule
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Recipient */}
        <div>
          {label('recipient')}
          <input type="text" placeholder="who is this for?" value={form.recipient} onChange={set('recipient')} style={inputStyle} />
          {errMsg('recipient')}
        </div>

        {/* Message */}
        <div>
          {label('message')}
          <textarea
            placeholder="write a personal message..."
            value={form.message}
            onChange={set('message')}
            maxLength={500}
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
          />
          <div style={{ fontSize: '11px', color: '#444', textAlign: 'right', marginTop: '4px' }}>
            {form.message.length} / 500
          </div>
        </div>

        {/* Media */}
        <div>
          {label('media', 'optional')}
          <MediaUpload onFileSelect={setMediaFile} />
        </div>

        <div style={{ borderTop: '0.5px solid #1e1e1e' }} />

        {/* Gift details */}
        <div>
          {label('gift details')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '10px' }}>
            <select value={form.asset} onChange={set('asset')} style={{ ...inputStyle, width: '100%' }}>
              {ASSETS.map((a) => <option key={a}>{a}</option>)}
            </select>
            <div>
              <input type="number" placeholder="amount (e.g. 0.05)" value={form.amount} onChange={set('amount')} min="0" step="0.001" style={inputStyle} />
              {errMsg('amount')}
            </div>
          </div>
          <input type="datetime-local" value={form.unlockDate} onChange={set('unlockDate')} style={inputStyle} />
          {errMsg('unlockDate')}
        </div>

        <div style={{ borderTop: '0.5px solid #1e1e1e' }} />

        {/* Yield Milestones */}
        <div>
          {label('yield milestones', 'messages that appear as the gift grows: edit or leave as default')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: '44px',
                    fontSize: '11px',
                    color: '#4ade80',
                    textAlign: 'right',
                  }}
                >
                  {m.pct}%
                </div>
                <input
                  type="text"
                  value={m.message}
                  onChange={(e) => updateMilestone(i, e.target.value)}
                  maxLength={80}
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: '#3a3a3a', marginTop: '8px' }}>
            recipient sees these revealed one by one as yield accumulates
          </div>
        </div>

        <div style={{ borderTop: '0.5px solid #1e1e1e' }} />

        {/* Group gifting */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={groupGifting} onChange={(e) => setGroupGifting(e.target.checked)} style={{ accentColor: '#4ade80' }} />
            <span style={{ fontSize: '13px', color: '#888' }}>allow friends to contribute to this capsule</span>
          </label>
          {groupGifting && (
            <div style={{ marginTop: '12px' }}>
              <GroupGifting contributors={contributors} setContributors={setContributors} />
            </div>
          )}
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
          {loading ? 'creating...' : 'create time capsule'}
        </button>
      </form>

      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onSuccess={() => handleSubmit({ preventDefault: () => {} })} />
      )}
    </div>
  )
}