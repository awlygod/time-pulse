export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '0.5px solid #1e1e1e',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginBottom: '12px',
        }}
      >
        {['about', 'faq', 'contact'].map((link) => (
          <a
            key={link}
            href="#"
            style={{ fontSize: '12px', color: '#444', textDecoration: 'none' }}
          >
            {link}
          </a>
        ))}
      </div>
      <p style={{ fontSize: '11px', color: '#333', margin: 0 }}>
        timecapsule.fun · built with love for the hackathon
      </p>
    </footer>
  )
}