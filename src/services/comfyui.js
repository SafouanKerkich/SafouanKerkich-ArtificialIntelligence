const COMFYUI_URL = 'http://localhost:8000'

/**
 * Upload an image file to ComfyUI and return the filename used server-side.
 */
async function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('overwrite', 'true')

  const res = await fetch(`${COMFYUI_URL}/upload/image`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  const data = await res.json()
  return data.name // e.g. "my-photo.jpg"
}

/**
 * Queue a ComfyUI workflow. Returns the prompt_id.
 * @param {object} workflow - the API-format workflow JSON
 */
async function queuePrompt(workflow) {
  const res = await fetch(`${COMFYUI_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow }),
  })

  if (!res.ok) throw new Error(`Queue failed: ${res.status}`)
  const data = await res.json()
  return data.prompt_id
}

/**
 * Poll until the prompt is finished. Returns when done.
 */
async function waitForCompletion(promptId, intervalMs = 1000, timeoutMs = 60000) {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, intervalMs))

    const res = await fetch(`${COMFYUI_URL}/history/${promptId}`)
    if (!res.ok) continue

    const history = await res.json()
    if (history[promptId]) {
      return history[promptId]
    }
  }

  throw new Error('ComfyUI timed out after 60 seconds')
}

/**
 * Extract the output image URL from the history result.
 */
function getOutputImageUrl(historyEntry) {
  const outputs = historyEntry.outputs
  for (const nodeId of Object.keys(outputs)) {
    const node = outputs[nodeId]
    if (node.images && node.images.length > 0) {
      const img = node.images[0]
      return `${COMFYUI_URL}/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`
    }
  }
  throw new Error('No output image found in ComfyUI result')
}

/**
 * Full pipeline: upload → queue → wait → return result URL.
 *
 * @param {File}   file        - original image file
 * @param {object} workflow    - the API-format workflow JSON (imported from comfyWorkflow.json)
 * @param {string} lutFile     - LUT filename, e.g. "Fuji ETERNA 250D Fuji 3510 (by Adobe).cube"
 * @param {string} loadImageNodeId  - node_id of the "Load Image" node in your workflow
 * @param {string} applyLutNodeId   - node_id of the "Image Apply LUT" node in your workflow
 */
export async function applyLutToImage(file, workflow, lutFile, loadImageNodeId, applyLutNodeId) {
  // 1. Upload image to ComfyUI
  const uploadedName = await uploadImage(file)

  // 2. Clone workflow and inject values
  const prompt = JSON.parse(JSON.stringify(workflow))
  prompt[loadImageNodeId].inputs.image = uploadedName
  prompt[applyLutNodeId].inputs.lut_file = lutFile

  // 3. Queue and wait
  const promptId = await queuePrompt(prompt)
  const result = await waitForCompletion(promptId)

  // 4. Return the output image URL
  return getOutputImageUrl(result)
}
