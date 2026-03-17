import { useState } from 'react'

export default function MediaUpload({ onFileSelect }) {
  const [preview, setPreview] = useState(null)
  const [fileType, setFileType] = useState(null)

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setFileType(file.type.startsWith('video') ? 'video' : 'image')
    if (onFileSelect) onFileSelect(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setFileType(null)
    if (onFileSelect) onFileSelect(null)
  }

  return (
    <div>
      {!preview ? (
        <label
          style={{
            display: 'block',
            background: '#161616',
            border: '0.5px dashed #2a2a2a',
            borderRadius: '6px',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <input
            type="file"
            accept="image/*,video/*"
            capture="environment"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          <div style={{ fontSize: '12px', color: '#555' }}>attach a photo or video</div>
          <div style={{ fontSize: '11px', color: '#3a3a3a', marginTop: '4px' }}>
            tap to upload · camera supported on mobile
          </div>
        </label>
      ) : (
        <div style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden' }}>
          {fileType === 'image' ? (
            <img
              src={preview}
              alt="preview"
              style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px' }}
            />
          ) : (
            <video
              src={preview}
              controls
              style={{ width: '100%', maxHeight: '200px', borderRadius: '6px' }}
            />
          )}
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0,0,0,0.7)',
              border: '0.5px solid #333',
              color: '#f0f0f0',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            remove
          </button>
        </div>
      )}
    </div>
  )
}