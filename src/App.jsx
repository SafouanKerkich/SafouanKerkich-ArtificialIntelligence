import { useState } from 'react'
import UploadZone from './components/UploadZone'
import { describeImage } from './services/ollama'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAnalyse() {
    if (!file) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const description = await describeImage(file)
      setResult(description)
    } catch (err) {
      setError('Kon Ollama niet bereiken. Staat hij aan op localhost:11434?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <span className="header-logo">ColorGrader<span>AI</span></span>
      </header>

      <main className="main">
        <div className="hero-text">
          <h2>Drop je foto.<br /><strong>Wij doen de rest.</strong></h2>
          <p>Upload een afbeelding en krijg direct kleurinstellingen op maat.</p>
        </div>

        <UploadZone onFileChange={setFile} />

        {file && !loading && (
          <button className="analyse-btn" onClick={handleAnalyse}>
            Analyseer afbeelding
          </button>
        )}

        {loading && <p className="status-text">Ollama is aan het analyseren...</p>}

        {error && <p className="error-text">{error}</p>}

        {result && (
          <div className="result-box">
            <p className="result-label">Ollama ziet:</p>
            <p className="result-text">{result}</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
