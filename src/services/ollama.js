import { readAndCompressImage } from 'browser-image-resizer'

const OLLAMA_URL = 'http://localhost:11434/api/generate'

const resizeConfig = {
  quality: 0.8,
  maxWidth: 512,
  maxHeight: 512,
  autoRotate: true,
  outputType: 'jpeg',
}

async function fileToBase64(file) {
  const resized = await readAndCompressImage(file, resizeConfig)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(resized)
  })
}

export async function describeImage(file) {
  const base64 = await fileToBase64(file)

  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llava:7b',
      prompt: 'Describe what you see in this image.',
      images: [base64],
      stream: false,
    }),
  })

  if (!response.ok) throw new Error(`Ollama error: ${response.status}`)

  const data = await response.json()
  return data.response
}
