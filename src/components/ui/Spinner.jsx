export default function Spinner({ size = 16, color = '#f0f0f0' }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `1.5px solid rgba(255,255,255,0.1)`,
        borderTop: `1.5px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  )
}