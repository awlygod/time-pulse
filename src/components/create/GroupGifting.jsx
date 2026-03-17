import { useState } from 'react'

export default function GroupGifting({ contributors, setContributors }) {
  const addContributor = () => {
    setContributors([...contributors, { name: '', email: '', amount: '' }])
  }

  const updateContributor = (index, field, value) => {
    const updated = [...contributors]
    updated[index][field] = value
    setContributors(updated)
  }

  const removeContributor = (index) => {
    setContributors(contributors.filter((_, i) => i !== index))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {contributors.map((c, i) => (
        <div
          key={i}
          style={{
            background: '#161616',
            border: '0.5px solid #2a2a2a',
            borderRadius: '6px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="name (optional)"
              value={c.name}
              onChange={(e) => updateContributor(i, 'name', e.target.value)}
              style={{
                flex: 1,
                background: '#1a1a1a',
                border: '0.5px solid #2a2a2a',
                borderRadius: '5px',
                padding: '8px 10px',
                color: '#f0f0f0',
                fontSize: '12px',
              }}
            />
            <input
              type="number"
              placeholder="amount"
              value={c.amount}
              onChange={(e) => updateContributor(i, 'amount', e.target.value)}
              style={{
                width: '90px',
                background: '#1a1a1a',
                border: '0.5px solid #2a2a2a',
                borderRadius: '5px',
                padding: '8px 10px',
                color: '#f0f0f0',
                fontSize: '12px',
              }}
            />
            <button
              type="button"
              onClick={() => removeContributor(i)}
              style={{
                background: 'none',
                border: '0.5px solid #2a2a2a',
                color: '#555',
                borderRadius: '5px',
                padding: '8px 10px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ✕
            </button>
          </div>
          <input
            type="email"
            placeholder="email (optional)"
            value={c.email}
            onChange={(e) => updateContributor(i, 'email', e.target.value)}
            style={{
              background: '#1a1a1a',
              border: '0.5px solid #2a2a2a',
              borderRadius: '5px',
              padding: '8px 10px',
              color: '#f0f0f0',
              fontSize: '12px',
            }}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addContributor}
        style={{
          background: 'transparent',
          border: '0.5px dashed #2a2a2a',
          color: '#555',
          borderRadius: '6px',
          padding: '10px',
          fontSize: '12px',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        + add contributor
      </button>
    </div>
  )
}