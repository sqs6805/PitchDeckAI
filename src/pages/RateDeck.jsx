import { useState, useRef } from 'react'
import RatingResults from '../components/RatingResults'
import { track } from '../utils/analytics'

const STAGES = [
  { id: 'pre-seed', label: 'Pre-Seed', desc: 'Idea stage, no or minimal revenue' },
  { id: 'seed', label: 'Seed', desc: 'Early traction, building product' },
  { id: 'series-a', label: 'Series A', desc: 'Proven model, scaling growth' },
  { id: 'series-b+', label: 'Series B+', desc: 'Expanding markets, scaling ops' },
]

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-5 py-20">
      <div
        className="w-10 h-10 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(56,189,248,0.2)', borderTopColor: 'var(--accent)' }}
      />
      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Analyzing your deck…</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Reading every slide like a VC partner would</p>
      </div>
    </div>
  )
}

function StageButton({ stage, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(stage.id)}
      className="text-left p-4 rounded-xl transition-all"
      style={{
        background: selected ? 'rgba(56,189,248,0.08)' : 'var(--surface)',
        border: `1px solid ${selected ? 'rgba(56,189,248,0.35)' : 'var(--border)'}`,
      }}
      onMouseEnter={e => {
        if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
      }}
      onMouseLeave={e => {
        if (!selected) e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      <div className="text-sm font-medium mb-0.5" style={{ color: selected ? 'var(--accent)' : 'var(--text)' }}>
        {stage.label}
      </div>
      <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{stage.desc}</div>
    </button>
  )
}

export default function RateDeck() {
  const [step, setStep] = useState(1)
  const [stage, setStage] = useState('')
  const [inputMode, setInputMode] = useState('text')
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const fileRef = useRef()

  const handleFileChange = e => {
    const f = e.target.files[0]
    if (f) setFile(f)
  }

  const handleSubmit = async () => {
    if (!text.trim() && !file) { setError('Please provide your deck content.'); return }
    setError('')
    setLoading(true)
    const startedAt = Date.now()
    try {
      const formData = new FormData()
      formData.append('stage', stage)
      if (file) formData.append('file', file)
      else formData.append('text', text)

      const res = await fetch('/api/analyze-deck', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      track.deckRated(stage, Date.now() - startedAt)
      setResult(data)
      setStep(3)
    } catch (err) {
      track.deckRateFailed(stage, err.message, Date.now() - startedAt)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 3 && result) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <RatingResults result={result} stage={stage} onReset={() => { setStep(1); setStage(''); setText(''); setFile(null); setResult(null) }} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: 'var(--text-faint)' }}>Deck analysis</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Rate My Deck
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Honest, VC-quality feedback in under a minute.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map(n => (
          <div key={n} className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
              style={{
                background: step >= n ? 'var(--accent)' : 'var(--surface-md)',
                color: step >= n ? '#0f172a' : 'var(--text-faint)',
                border: `1px solid ${step >= n ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {step > n ? '✓' : n}
            </div>
            {n < 2 && (
              <div className="w-12 h-px" style={{ background: step > n ? 'var(--accent)' : 'var(--border)' }} />
            )}
          </div>
        ))}
        <span className="text-xs ml-1" style={{ color: 'var(--text-faint)' }}>Step {step} of 2</span>
      </div>

      {/* Step 1: Stage */}
      {step === 1 && (
        <div className="animate-slide-up">
          <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>
            What stage is your startup?
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            We calibrate scoring criteria to what VCs expect at each stage.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {STAGES.map(s => (
              <StageButton key={s.id} stage={s} selected={stage === s.id} onClick={setStage} />
            ))}
          </div>

          <button
            disabled={!stage}
            onClick={() => setStep(2)}
            className="btn btn-primary btn-lg w-full"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Upload / Paste */}
      {step === 2 && (
        <div className="animate-slide-up">
          <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>
            Provide your deck
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            Upload a PDF or paste the text content from your deck.
          </p>

          {/* Mode toggle */}
          <div
            className="flex gap-1 p-1 rounded-xl mb-5 w-fit"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {['text', 'file'].map(mode => (
              <button
                key={mode}
                onClick={() => { setInputMode(mode); setError('') }}
                className="px-4 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  background: inputMode === mode ? 'rgba(56,189,248,0.12)' : 'transparent',
                  color: inputMode === mode ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: inputMode === mode ? 500 : 400,
                  border: inputMode === mode ? '1px solid rgba(56,189,248,0.2)' : '1px solid transparent',
                }}
              >
                {mode === 'text' ? 'Paste text' : 'Upload PDF'}
              </button>
            ))}
          </div>

          {inputMode === 'text' ? (
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste your pitch deck content here — slide titles, bullet points, team bios, metrics. The more detail, the better."
              rows={9}
              className="field"
              style={{ borderRadius: '12px' }}
            />
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl flex flex-col items-center justify-center py-10 cursor-pointer transition-all"
              style={{
                border: `2px dashed ${file ? 'rgba(56,189,248,0.4)' : 'var(--border)'}`,
                background: file ? 'rgba(56,189,248,0.04)' : 'var(--surface)',
              }}
              onMouseEnter={e => { if (!file) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
              onMouseLeave={e => { if (!file) e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileChange} />
              {file ? (
                <>
                  <div className="text-2xl mb-2">📄</div>
                  <div className="text-sm font-medium" style={{ color: 'var(--accent)' }}>{file.name}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{(file.size / 1024).toFixed(0)} KB — click to change</div>
                </>
              ) : (
                <>
                  <div className="text-2xl mb-2 opacity-50">⬆</div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>Drop PDF here or click to upload</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>PDF or TXT, up to 20 MB</div>
                </>
              )}
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm" style={{ color: 'var(--error)' }}>{error}</p>
          )}

          {loading && <Spinner />}

          {!loading && (
            <div className="flex gap-3 mt-5">
              <button onClick={() => setStep(1)} className="btn btn-ghost">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={!text.trim() && !file}
                className="btn btn-primary flex-1"
                style={{ padding: '10px 20px' }}
              >
                Analyze deck
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
