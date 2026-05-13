import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import './UploadZone.css'

export default function UploadZone() {
  const [preview, setPreview] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  })

  return (
    <div className="upload-wrapper">
      <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'active' : ''} ${preview ? 'has-preview' : ''}`}>
        <input {...getInputProps()} />

        {preview ? (
          <img src={preview} alt="Preview" className="preview-img" />
        ) : (
          <>
            <span className="upload-icon">↑</span>
            {isDragActive
              ? <p>Laat los om te uploaden...</p>
              : <p>Sleep een afbeelding hierheen of <span className="upload-link">klik om te kiezen</span></p>
            }
          </>
        )}
      </div>

      {preview && (
        <button className="remove-btn" onClick={() => setPreview(null)}>
          Verwijder afbeelding
        </button>
      )}
    </div>
  )
}
