# ColorGraderAI

An AI-powered color grading tool that analyzes your photo with a vision model and applies professional film stock LUTs via ComfyUI.

**Stack:** React (Vite) · Ollama (llava:7b) · ComfyUI · comfyui_essentials

---

## How it works

1. Upload a (SLOG) photo
2. Ollama analyzes the image and recommends a film style
3. You pick a style from 8 professional film LUTs (Fuji / Kodak)
4. ComfyUI applies the LUT and returns the graded image

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Ollama](https://ollama.com/)
- [ComfyUI Desktop](https://www.comfy.org/)
- comfyui_essentials (ComfyUI custom node)

---

## 1. Ollama setup

Download Ollama from [https://ollama.com](https://ollama.com) and install it.

Then pull the vision model:

```bash
ollama pull llava:7b
```

Verify it's running:

```bash
ollama serve
```

Ollama runs on `http://localhost:11434`.

---

## 2. ComfyUI setup

Download and install **ComfyUI Desktop** from [https://www.comfy.org](https://www.comfy.org).

### Install comfyui_essentials

In ComfyUI, go to **Manager → Install Custom Nodes** and search for `comfyui_essentials`. Install it and restart ComfyUI.

---

## 3. React app setup

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

---

## Usage

1. Start Ollama (`ollama serve`)
2. Start ComfyUI Desktop
3. Start the React app (`npm run dev`)
4. Open `http://localhost:5173`
5. Upload a photo → Analyseer → pick a style → Grade
