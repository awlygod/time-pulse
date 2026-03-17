export default function BalanceCard({ principal, currentValue, yieldEarned, asset, isClaimed }) {
  const yieldPct = principal > 0 ? ((yieldEarned / principal) * 100).toFixed(2) : '0.00'
  const progressWidth = Math.min(parseFloat(yieldPct) * 10, 100)

  return (
    <>
      <style>{`
        @keyframes yieldPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
          50% { box-shadow: 0 0 0 4px rgba(74,222,128,0.06); }
        }
        .yield-pulse { animation: yieldPulse 3s ease-in-out infinite; }
      `}</style>
    <div
      className={!isClaimed ? 'yield-pulse' : ''}
      style={{
        background: '#161616',
        border: '0.5px solid #222',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          color: '#555',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}
      >
        balance
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>principal</span>
          <span style={{ fontSize: '13px' }}>
            {principal} {asset}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>yield earned</span>
          <span style={{ fontSize: '13px', color: '#4ade80' }}>
            +{yieldEarned} {asset}
          </span>
        </div>
        <div
          style={{
            borderTop: '0.5px solid #222',
            paddingTop: '10px',
            marginTop: '4px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 500 }}>current value</span>
          <span style={{ fontSize: '15px', fontWeight: 500 }}>
            {currentValue} {asset}
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: '12px',
          background: '#1e1e1e',
          borderRadius: '3px',
          height: '3px',
        }}
      >
        <div
          style={{
            background: '#4ade80',
            width: `${progressWidth}%`,
            height: '3px',
            borderRadius: '3px',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
      <div style={{ fontSize: '10px', color: '#3a3a3a', marginTop: '4px' }}>
        {yieldPct}% yield accrued
      </div>
    </div>
    </>
  )
}