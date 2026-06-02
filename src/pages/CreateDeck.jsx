import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DeckViewer from '../components/DeckViewer'
import { track } from '../utils/analytics'

/* ── sessionStorage persistence ────────────────────────────────────── */
const STORAGE_KEY = 'pitchdeck:create-state'
const loadSaved = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
const persist = (state) => {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}
const clearSaved = () => { try { sessionStorage.removeItem(STORAGE_KEY) } catch {} }

const STAGES = ['Pre-Seed', 'Seed', 'Series A', 'Series B+']
const INDUSTRIES = ['AI / Machine Learning', 'FinTech', 'HealthTech', 'EdTech', 'ClimaTech', 'B2B SaaS', 'Consumer', 'Marketplace', 'Developer Tools', 'Cybersecurity', 'Web3', 'E-commerce', 'Hardware', 'Other']
const REVENUE_MODELS = ['B2B SaaS', 'B2C SaaS', 'Marketplace', 'Transaction Fee', 'Usage-based', 'Advertising', 'Services', 'Hardware', 'Freemium → Paid', 'Other']

/* ── Input helpers ─────────────────────────────────────────────────── */
// Numeric-only input (digits only)
function NumericInput({ value, onChange, placeholder, className = 'field', style }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))}
      placeholder={placeholder}
      className={className}
      style={style}
    />
  )
}

// Currency/unit input: allows digits, $, ., K, M, B, T, %, space, comma
function CurrencyInput({ value, onChange, placeholder, className = 'field', style }) {
  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={e => onChange(e.target.value.replace(/[^0-9$.,KMBTkmbт%\s]/g, ''))}
      placeholder={placeholder}
      className={className}
      style={style}
    />
  )
}

/* ── Shared field components ────────────────────────────────────────── */
function Label({ children, optional, required }) {
  return (
    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
      {children}
      {optional && <span className="ml-2 font-normal" style={{ color: 'var(--text-faint)' }}>optional</span>}
      {required && <span className="ml-1.5 font-semibold" style={{ color: 'var(--accent)' }}>*</span>}
    </label>
  )
}

function Hint({ children }) {
  return <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>{children}</p>
}

function InfoBox({ children, color = 'sky' }) {
  const colors = {
    sky:     { bg: 'rgba(56,189,248,0.05)',  border: 'rgba(56,189,248,0.15)',  text: 'rgba(125,211,252,0.9)' },
    violet:  { bg: 'rgba(139,92,246,0.05)',  border: 'rgba(139,92,246,0.15)', text: 'rgba(196,181,253,0.9)' },
    emerald: { bg: 'rgba(74,222,128,0.05)',  border: 'rgba(74,222,128,0.15)', text: 'rgba(134,239,172,0.9)' },
    amber:   { bg: 'rgba(251,191,36,0.05)',  border: 'rgba(251,191,36,0.15)', text: 'rgba(253,230,138,0.9)' },
  }
  const c = colors[color]
  return (
    <div className="rounded-xl px-4 py-3 text-sm leading-relaxed"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {children}
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-5 py-24 animate-fade-in">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(56,189,248,0.15)', borderTopColor: 'var(--accent)' }} />
        <div className="absolute inset-2 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(99,102,241,0.15)', borderBottomColor: '#818cf8', animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      <div className="text-center">
        <p className="font-semibold text-base mb-1" style={{ color: 'var(--text)' }}>Crafting your deck…</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Building each slide with VC-optimised content</p>
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-faint)' }}>Usually 15–30 seconds</p>
      </div>
    </div>
  )
}

/* ── Condensed 4-step form ──────────────────────────────────────────── */
const CONDENSED_STEPS = ['Basics', 'Problem, Solution & Market', 'Traction & Team', 'Business, Competition & Ask']

export default function CreateDeck() {
  // Hydrate state from sessionStorage once on first render so navigating
  // away (e.g. to Research) and back resumes everything.
  const saved = loadSaved() || {}

  const [mode, setMode] = useState(saved.mode ?? null)            // null | 'quick' | 'form'
  const [step, setStep] = useState(saved.step ?? 0)               // condensed form step 0-3
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deck, setDeck] = useState(saved.deck ?? null)

  /* Quick entry fields */
  const [quickCompany, setQuickCompany] = useState(saved.quickCompany ?? '')
  const [quickStage, setQuickStage] = useState(saved.quickStage ?? '')
  const [quickIndustry, setQuickIndustry] = useState(saved.quickIndustry ?? '')
  const [quickText, setQuickText] = useState(saved.quickText ?? '')

  /* Condensed form fields */
  const [form, setForm] = useState(saved.form ?? {
    // Page 1 – Basics
    companyName: '', tagline: '', stage: '', industry: '', location: '',
    // Page 2 – Problem / Solution / Market
    problem: '', solution: '', targetMarket: '', tam: '', sam: '', som: '',
    // Page 3 – Traction / Team
    mrr: '', userCount: '', milestones: '',
    founder1Name: '', founder1Role: '', founder1Background: '',
    founder2Name: '', founder2Role: '', founder2Background: '',
    // Page 4 – Business / Competition / Ask
    revenueModel: '', competitors: '', advantages: '',
    raiseAmount: '', useOfFunds: '',
  })

  // Persist on every change so a quick nav to Research won't lose work
  useEffect(() => {
    persist({ mode, step, deck, quickCompany, quickStage, quickIndustry, quickText, form })
  }, [mode, step, deck, quickCompany, quickStage, quickIndustry, quickText, form])

  const set = field => val => setForm(f => ({ ...f, [field]: val }))

  /* ── Validation ── */
  const canContinueForm = () => {
    if (step === 0) return form.companyName.trim() && form.stage && form.industry
    if (step === 1) return form.problem.trim() && form.solution.trim() && form.targetMarket.trim()
    if (step === 2) {
      const hasTraction = form.mrr.trim() || form.userCount.trim() || form.milestones.trim()
      return hasTraction && form.founder1Name.trim() && form.founder1Role.trim() && form.founder1Background.trim()
    }
    if (step === 3) return form.competitors.trim()
    return true
  }

  const canSubmitQuick = () =>
    quickCompany.trim() && quickStage && quickIndustry && quickText.trim()

  /* ── Generate handlers ── */
  const handleGenerateForm = async () => {
    setLoading(true); setError('')
    const startedAt = Date.now()
    try {
      const companyInfo = {
        basics: { companyName: form.companyName, tagline: form.tagline, stage: form.stage.toLowerCase().replace(' ', '-'), industry: form.industry, location: form.location },
        problemSolution: { problem: form.problem, solution: form.solution },
        market: { targetMarket: form.targetMarket, tam: form.tam, sam: form.sam, som: form.som },
        traction: { mrr: form.mrr, userCount: form.userCount, milestones: form.milestones },
        team: {
          founders: [
            { name: form.founder1Name, role: form.founder1Role, background: form.founder1Background },
            ...(form.founder2Name ? [{ name: form.founder2Name, role: form.founder2Role, background: form.founder2Background }] : []),
          ].filter(f => f.name),
        },
        businessModel: { revenueModel: form.revenueModel },
        competition: { competitors: form.competitors, advantages: form.advantages },
        ask: { raiseAmount: form.raiseAmount, useOfFunds: form.useOfFunds },
      }
      const res = await fetch('/api/generate-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyInfo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      track.deckGenerated(form.stage, 'form', Date.now() - startedAt)
      setDeck(data.deck)
    } catch (err) {
      track.deckGenerateFailed(form.stage, 'form', err.message, Date.now() - startedAt)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQuick = async () => {
    setLoading(true); setError('')
    const startedAt = Date.now()
    try {
      const res = await fetch('/api/generate-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeformDescription: quickText,
          companyInfo: {
            basics: {
              companyName: quickCompany,
              stage: quickStage.toLowerCase().replace(' ', '-'),
              industry: quickIndustry,
            },
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      track.deckGenerated(quickStage, 'quick', Date.now() - startedAt)
      setDeck(data.deck)
    } catch (err) {
      track.deckGenerateFailed(quickStage, 'quick', err.message, Date.now() - startedAt)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ── Render states ── */
  if (deck) return (
    <div className="h-[calc(100vh-52px)] overflow-hidden">
      <DeckViewer deck={deck} onReset={() => { clearSaved(); setDeck(null); setMode(null); setStep(0) }} />
    </div>
  )
  if (loading) return <div className="max-w-xl mx-auto px-6"><Spinner /></div>

  const selectMode = (m) => { setMode(m); track.modeSelected(m) }

  /* ── Mode selector ── */
  if (!mode) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-in">
        <div className="mb-9">
          <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: 'var(--text-faint)' }}>Deck builder</p>
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Create My Deck
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            How would you like to build your pitch deck?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Quick Entry */}
          <button
            onClick={() => selectMode('quick')}
            className="glass-card-interactive p-6 text-left group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-4"
              style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
            >
              ✍️
            </div>
            <h2 className="text-base font-semibold mb-1.5 tracking-tight" style={{ color: 'var(--text)' }}>
              Quick Text Entry
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
              Paste or type a free-form description of your startup — team, traction, market, competition, and financials. We'll build the full deck from it.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Fastest', '1 text block', 'Any format'].map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)', color: 'var(--accent)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </button>

          {/* Structured form */}
          <button
            onClick={() => selectMode('form')}
            className="glass-card-interactive p-6 text-left group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-4"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              📋
            </div>
            <h2 className="text-base font-semibold mb-1.5 tracking-tight" style={{ color: 'var(--text)' }}>
              Condensed Form
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
              Fill out 4 focused pages covering the essentials VCs care about. Produces more structured, detailed slides.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['4 pages', 'Structured', 'More detail'].map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                  {tag}
                </span>
              ))}
            </div>
          </button>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
          Not sure about market data?{' '}
          <Link to="/research" style={{ color: 'var(--accent)' }}>Use the Research Agent</Link>
          {' '}to find competitors and market size first.
        </p>
      </div>
    )
  }

  /* ── Quick Entry mode ── */
  if (mode === 'quick') {
    return (
      <div className="max-w-xl mx-auto px-6 py-10 animate-fade-in">
        <div className="mb-7">
          <button onClick={() => setMode(null)} className="text-xs mb-4 flex items-center gap-1.5 transition-colors"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
          >
            ← Change mode
          </button>
          <p className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--text-faint)' }}>Quick entry</p>
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Tell us about your startup
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Write freely — the more you include, the better your deck.
          </p>
        </div>

        <div className="glass-card p-6 space-y-4 mb-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <Label required>Company Name</Label>
              <input
                value={quickCompany}
                onChange={e => setQuickCompany(e.target.value)}
                placeholder="e.g. Acme AI"
                className="field"
              />
            </div>
            <div>
              <Label required>Stage</Label>
              <select value={quickStage} onChange={e => setQuickStage(e.target.value)} className="field">
                <option value="">Select…</option>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <Label required>Industry</Label>
              <select value={quickIndustry} onChange={e => setQuickIndustry(e.target.value)} className="field">
                <option value="">Select…</option>
                {INDUSTRIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <Label required>Startup Description</Label>
            <textarea
              value={quickText}
              onChange={e => setQuickText(e.target.value)}
              rows={12}
              placeholder={`Describe your startup in as much detail as you have. Include:\n\n• Team — founder backgrounds, relevant experience, why you\n• Traction — revenue, users, growth rate, key milestones\n• Market — who you serve, market size (TAM/SAM/SOM), growth trends\n• Competition — main competitors and your key differentiators\n• Financials — burn rate, runway, what you're raising and why\n\nNo need for perfect formatting — just tell the story.`}
              className="field"
              style={{ borderRadius: '12px', resize: 'vertical', minHeight: '220px' }}
            />
          </div>

          <InfoBox color="sky">
            💡 Missing market data? <Link to="/research" style={{ color: 'var(--accent)', fontWeight: 600 }}>Use the Research Agent</Link> to fill the gaps — then come back and paste it in.
          </InfoBox>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--error)' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGenerateQuick}
          disabled={!canSubmitQuick()}
          className="btn btn-primary w-full"
          style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          Generate my deck ✦
        </button>
        <p className="mt-3 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
          Fields marked <span style={{ color: 'var(--accent)' }}>*</span> are required
        </p>
      </div>
    )
  }

  /* ── Condensed 4-page form ── */
  const isLastStep = step === CONDENSED_STEPS.length - 1

  return (
    <div className="max-w-xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <button onClick={() => { setMode(null); setStep(0) }}
          className="text-xs mb-4 flex items-center gap-1.5 transition-colors"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
        >
          ← Change mode
        </button>
        <p className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--text-faint)' }}>Condensed form</p>
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Create My Deck
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Fields marked <span style={{ color: 'var(--accent)' }}>*</span> are required to continue.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{CONDENSED_STEPS[step]}</span>
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{step + 1} / {CONDENSED_STEPS.length}</span>
        </div>
        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / CONDENSED_STEPS.length) * 100}%`, background: 'var(--accent)' }}
          />
        </div>
        {/* Step dots */}
        <div className="flex gap-2 mt-3">
          {CONDENSED_STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i <= step ? 'var(--accent)' : 'var(--border)' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Step card */}
      <div className="glass-card p-6 mb-4 animate-slide-up space-y-4">

        {/* ── Page 1: Basics ── */}
        {step === 0 && (<>
          <div>
            <Label required>Company Name</Label>
            <input value={form.companyName} onChange={e => set('companyName')(e.target.value)} placeholder="e.g. Stripe, Airbnb, OpenAI" className="field" />
          </div>
          <div>
            <Label optional>One-Line Tagline</Label>
            <input value={form.tagline} onChange={e => set('tagline')(e.target.value)} placeholder="e.g. The operating system for money" className="field" />
            <Hint>Appears on your cover slide. Keep it under 10 words.</Hint>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Startup Stage</Label>
              <select value={form.stage} onChange={e => set('stage')(e.target.value)} className="field">
                <option value="">Select stage…</option>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label required>Industry</Label>
              <select value={form.industry} onChange={e => set('industry')(e.target.value)} className="field">
                <option value="">Select industry…</option>
                {INDUSTRIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label optional>Location</Label>
            <input value={form.location} onChange={e => set('location')(e.target.value)} placeholder="San Francisco, CA" className="field" />
          </div>
        </>)}

        {/* ── Page 2: Problem / Solution / Market ── */}
        {step === 1 && (<>
          <div>
            <Label required>The Problem You're Solving</Label>
            <textarea value={form.problem} onChange={e => set('problem')(e.target.value)} rows={3} placeholder="What's broken or inefficient? Include the cost of this problem." className="field" />
          </div>
          <div>
            <Label required>Your Solution</Label>
            <textarea value={form.solution} onChange={e => set('solution')(e.target.value)} rows={3} placeholder="How does your product solve the problem? Focus on the transformation for the customer." className="field" />
          </div>
          <div
            className="h-px my-1"
            style={{ background: 'var(--border)' }}
          />
          <div>
            <Label required>Target Market</Label>
            <textarea value={form.targetMarket} onChange={e => set('targetMarket')(e.target.value)} rows={2} placeholder="e.g. US healthcare SMBs managing billing and compliance" className="field" />
            <Hint>
              Missing market data?{' '}
              <Link to="/research" style={{ color: 'var(--accent)' }}>Use the Research Agent to fill the gaps</Link>
            </Hint>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label optional>TAM</Label>
              <CurrencyInput value={form.tam} onChange={set('tam')} placeholder="$50B" />
              <Hint>Total addressable</Hint>
            </div>
            <div>
              <Label optional>SAM</Label>
              <CurrencyInput value={form.sam} onChange={set('sam')} placeholder="$8B" />
              <Hint>Serviceable</Hint>
            </div>
            <div>
              <Label optional>SOM</Label>
              <CurrencyInput value={form.som} onChange={set('som')} placeholder="$400M" />
              <Hint>Obtainable</Hint>
            </div>
          </div>
        </>)}

        {/* ── Page 3: Traction / Team ── */}
        {step === 2 && (<>
          <InfoBox color="amber">
            At least one traction metric and your founder name are required.
          </InfoBox>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>MRR / ARR</Label>
              <CurrencyInput value={form.mrr} onChange={set('mrr')} placeholder="$15,000" />
            </div>
            <div>
              <Label>Users / Customers</Label>
              <NumericInput value={form.userCount} onChange={set('userCount')} placeholder="450" />
            </div>
            <div>
              <Label optional>MoM Growth %</Label>
              <NumericInput value={form.momGrowth} onChange={set('momGrowth')} placeholder="15" />
            </div>
          </div>
          <div>
            <Label>Key Milestones</Label>
            <textarea value={form.milestones} onChange={e => set('milestones')(e.target.value)} rows={3} placeholder={"• Jan 2024: Launched MVP\n• Mar 2024: First 100 paying customers"} className="field" />
            <Hint>Fill in MRR, Users, or Milestones — at least one required.</Hint>
          </div>
          <div
            className="h-px my-1"
            style={{ background: 'var(--border)' }}
          />
          <div className="grid grid-cols-3 gap-3">
            <div><Label required>Founder Name</Label><input value={form.founder1Name} onChange={e => set('founder1Name')(e.target.value)} placeholder="Full name" className="field" /></div>
            <div><Label required>Role</Label><input value={form.founder1Role} onChange={e => set('founder1Role')(e.target.value)} placeholder="CEO & Co-founder" className="field" /></div>
            <div><Label required>Background</Label><input value={form.founder1Background} onChange={e => set('founder1Background')(e.target.value)} placeholder="Ex-Google, Stanford CS" className="field" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label optional>Co-founder Name</Label><input value={form.founder2Name} onChange={e => set('founder2Name')(e.target.value)} placeholder="Full name" className="field" /></div>
            <div><Label optional>Role</Label><input value={form.founder2Role} onChange={e => set('founder2Role')(e.target.value)} placeholder="CTO & Co-founder" className="field" /></div>
            <div><Label optional>Background</Label><input value={form.founder2Background} onChange={e => set('founder2Background')(e.target.value)} placeholder="MIT PhD, ex-Stripe" className="field" /></div>
          </div>
        </>)}

        {/* ── Page 4: Business / Competition / Ask ── */}
        {step === 3 && (<>
          <div>
            <Label optional>Revenue Model</Label>
            <select value={form.revenueModel} onChange={e => set('revenueModel')(e.target.value)} className="field">
              <option value="">Select…</option>
              {REVENUE_MODELS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div
            className="h-px my-1"
            style={{ background: 'var(--border)' }}
          />
          <div>
            <Label required>Main Competitors</Label>
            <textarea value={form.competitors} onChange={e => set('competitors')(e.target.value)} rows={3} placeholder={"• Salesforce — too complex for SMBs\n• HubSpot — lacks automation\n• Legacy tools — heavy implementation"} className="field" />
            <Hint>
              "We have no competition" signals you don't understand the market.{' '}
              Not sure who your competitors are?{' '}
              <Link to="/research" style={{ color: 'var(--accent)' }}>Use the Research Agent to find them.</Link>
            </Hint>
          </div>
          <div>
            <Label optional>Key Advantages / Moat</Label>
            <textarea value={form.advantages} onChange={e => set('advantages')(e.target.value)} rows={2} placeholder="e.g. 10× faster onboarding, proprietary dataset, network effects" className="field" />
          </div>
          <div
            className="h-px my-1"
            style={{ background: 'var(--border)' }}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label optional>Raising Amount</Label>
              <input value={form.raiseAmount} onChange={e => set('raiseAmount')(e.target.value)} placeholder="e.g. $2M" className="field" />
            </div>
            <div>
              <Label optional>Use of Funds</Label>
              <input value={form.useOfFunds} onChange={e => set('useOfFunds')(e.target.value)} placeholder="e.g. 50% eng, 30% sales" className="field" />
            </div>
          </div>
          <InfoBox color="emerald">
            You're all set! Click "Generate my deck" to create your pitch deck.
          </InfoBox>
        </>)}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="btn btn-ghost">← Back</button>
        )}
        {!isLastStep ? (
          <button
            onClick={() => { track.formStepCompleted(step); setStep(s => s + 1) }}
            disabled={!canContinueForm()}
            className="btn btn-primary flex-1"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={() => { track.formStepCompleted(step); handleGenerateForm() }}
            className="btn btn-primary flex-1"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            Generate my deck ✦
          </button>
        )}
      </div>
    </div>
  )
}
