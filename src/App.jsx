import { useState } from 'react'
import UploadZone from './components/UploadZone'
import StylePicker from './components/StylePicker'
import { describeImage } from './services/ollama'
import { applyLutToImage } from './services/comfyui'
import colorStyles from './data/colorStyles.json'
import './App.css'

// ─── ComfyUI node IDs ───────────────────────────────────────────────────────
const LOAD_IMAGE_NODE = '11'
const APPLY_LUT_NODE  = '10'

// ComfyUI API workflow
import workflow from './data/comfyWorkflow.json'

function App() {
  const [file, setFile]           = useState(null)
  const [selectedStyle, setStyle] = useState(null)
  const [ollamaResult, setOllamaResult] = useState(null)
  const [outputImage, setOutputImage]   = useState(null)
  const [loading, setLoading]     = useState(false)
  const [status, setStatus]       = useState(null)
  const [error, setError]         = useState(null)

  // Step 1 — Analyse with Ollama, auto-pick a style
  async function handleAnalyse() {
    if (!file) return
    setLoading(true)
    setOllamaResult(null)
    setOutputImage(null)
    setError(null)
    setStatus('Ollama analyseert de afbeelding...')

    try {
      const description = await describeImage(file)
      setOllamaResult(description)

      // Auto-pick based on keywords in the description
      const suggested = suggestStyle(description)
      setStyle(suggested)
      setStatus(null)
    } catch (err) {
      setError('Kon Ollama niet bereiken. Staat hij aan op localhost:11434?')
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  // Step 2 — Apply LUT via ComfyUI
  async function handleGrade() {
    if (!file || !selectedStyle) return
    if (!workflow) {
      setError('Workflow JSON nog niet geïmporteerd. Exporteer hem eerst vanuit ComfyUI.')
      return
    }

    setLoading(true)
    setOutputImage(null)
    setError(null)
    setStatus('ComfyUI past de LUT toe...')

    try {
      const lutFile = colorStyles[selectedStyle].lut_file
      const resultUrl = await applyLutToImage(file, workflow, lutFile, LOAD_IMAGE_NODE, APPLY_LUT_NODE)
      setOutputImage(resultUrl)
      setStatus(null)
    } catch (err) {
      setError(`ComfyUI fout: ${err.message}`)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(f) {
    setFile(f)
    setOllamaResult(null)
    setOutputImage(null)
    setStyle(null)
    setError(null)
    setStatus(null)
  }

  return (
    <div className="app">
      <header className="header">
        <span className="header-logo">ColorGrader<span>AI</span></span>
      </header>

      <main className="main">
        <div className="hero-text">
          <h2>Drop je foto.<br /><strong>Wij doen de rest.</strong></h2>
          <p>Upload een SLOG-afbeelding en krijg direct een professionele filmgrade.</p>
        </div>

        <UploadZone onFileChange={handleFileChange} />

        {file && !loading && !ollamaResult && (
          <button className="analyse-btn" onClick={handleAnalyse}>
            Analyseer afbeelding
          </button>
        )}

        {status && <p className="status-text">{status}</p>}
        {error  && <p className="error-text">{error}</p>}

        {ollamaResult && (
          <div className="result-box">
            <p className="result-label">Ollama ziet:</p>
            <p className="result-text">{ollamaResult}</p>
          </div>
        )}

        {ollamaResult && (
          <StylePicker selected={selectedStyle} onSelect={setStyle} />
        )}

        {selectedStyle && !loading && (
          <button className="analyse-btn" onClick={handleGrade}>
            Grade met {colorStyles[selectedStyle]?.label}
          </button>
        )}

        {outputImage && (
          <div className="output-section">
            <p className="result-label">Resultaat</p>
            <img src={outputImage} alt="Graded output" className="output-img" />
          </div>
        )}
      </main>
    </div>
  )
}

/**
 * Suggest a LUT style based on Ollama's image description.
 * Falls back to a sensible default.
 */
function suggestStyle(description) {
  const d = description.toLowerCase()

  if (d.includes('sunset') || d.includes('golden') || d.includes('warm'))
    return 'fuji_eterna_fuji'
  if (d.includes('portrait') || d.includes('person') || d.includes('skin'))
    return 'fuji_reala'
  if (d.includes('outdoor') || d.includes('daylight') || d.includes('bright'))
    return 'kodak_5205'
  if (d.includes('night') || d.includes('dark') || d.includes('indoor'))
    return 'kodak_5218_2383'
  if (d.includes('documentary') || d.includes('street'))
    return 'fuji_f125_kodak_2393'

  return 'fuji_eterna_fuji' // default
}

export default App
