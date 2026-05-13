import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import './UploadZone.css'

export default function UploadZone({ onFileChange }) {
  const [preview, setPreview] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    onFileChange(file)
  }, [onFileChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  })

  function handleRemove(e) {
    e.stopPropagation()
    setPreview(null)
    onFileChange(null)
  }

  return (
    <div className="upload-wrapper">
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'active' : ''} ${preview ? 'has-preview' : ''}`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <img src={preview} alt="Preview" className="preview-img" />
        ) : (
          <div className="upload-label">
            <div className="upload-icon-wrap">↑</div>
            <p>
              {isDragActive
                ? 'Laat los om te uploaden...'
                : <>Sleep hier of <span>kies een bestand</span></>
              }
            </p>
            <span className="upload-hint">PNG, JPG, WEBP</span>
          </div>
        )}
      </div>

      {preview && (
        <button className="remove-btn" onClick={handleRemove}>
          verwijder afbeelding
        </button>
      )}
    </div>
  )
}
