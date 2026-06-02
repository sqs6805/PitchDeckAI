import { useState } from 'react'
import { Link } from 'react-router-dom'

const DIMENSION_META = {
  team:                { label: 'Team',                  icon: '👥' },
  traction:            { label: 'Traction',              icon: '📈' },
  marketSize:          { label: 'Market Size',           icon: '🌍' },
  gtmStrategy:         { label: 'GTM Strategy',          icon: '🗺️' },
  competitiveKnowledge:{ label: 'Competitive Knowledge', icon: '⚔️' },
  capitalAllocation:   { label: 'Capital Allocation',    icon: '💰' },
}

function scoreStyle(score) {
  if (score >= 4)  return { color: '#4ade80', bar: '#4ade80',  label: 'Strong' }
  if (score >= 3)  return { color: '#fbbf24', bar: '#fbbf24',  label: 'Developing' }
  if (score >= 2)  return { color: '#fb923c', bar: '#fb923c',  label: 'Weak' }
  return               { color: '#f87171', bar: '#f87171',  label: 'Missing' }
}

/* ── Reasoning-trace helpers ───────────────────────────────────────── */
const WEIGHT_STYLES = {
  'strong positive': { c: '#4ade80', bg: 'rgba(74,222,128,0.10)', b: 'rgba(74,222,128,0.30)', icon: '++' },
  'weak positive':   { c: '#86efac', bg: 'rgba(74,222,128,0.05)', b: 'rgba(74,222,128,0.18)', icon: '+'  },
  'weak negative':   { c: '#fbbf24', bg: 'rgba(251,191,36,0.06)', b: 'rgba(251,191,36,0.22)', icon: '−'  },
  'strong negative': { c: '#f87171', bg: 'rgba(248,113,113,0.08)', b: 'rgba(248,113,113,0.28)', icon: '−−' },
}

const RATING_STYLES = {
  high:   { c: '#4ade80', bg: 'rgba(74,222,128,0.10)', b: 'rgba(74,222,128,0.30)' },
  medium: { c: '#fbbf24', bg: 'rgba(251,191,36,0.08)', b: 'rgba(251,191,36,0.22)' },
  low:    { c: '#94a3b8', bg: 'rgba(148,163,184,0.08)', b: 'rgba(148,163,184,0.22)' },
}

const RATING_RANK = { high: 3, medium: 2, low: 1 }
const recPriority = rec => typeof rec === 'string' ? 0 : (RATING_RANK[rec.impact] || 1) * (RATING_RANK[rec.ease] || 1)
const sortRecs = (recs = []) => [...recs].sort((a, b) => recPriority(b) - recPriority(a))

function EvidenceRow({ item }) {
  const w = WEIGHT_STYLES[item.weight] || WEIGHT_STYLES['weak positive']
  return (
    <div className="flex gap-2.5 items-start py-2" style={{ borderBottom: '1px dashed var(--border)' }}>
      <span
        className="text-[10px] font-black px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0"
        style={{ color: w.c, background: w.bg, border: `1px solid ${w.b}`, minWidth: 22, textAlign: 'center' }}
        title={item.weight}
      >
        {w.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: 'var(--text)' }}>{item.fact}</p>
        {item.signal && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>{item.signal}</p>
        )}
      </div>
    </div>
  )
}

function RecommendationCard({ rec }) {
  // Backward-compat: render plain string recs the old way
  if (typeof rec === 'string') {
    return (
      <li className="flex gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <span className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>→</span>
        <span>{rec}</span>
      </li>
    )
  }
  const impact = RATING_STYLES[rec.impact] || RATING_STYLES.low
  const ease   = RATING_STYLES[rec.ease]   || RATING_STYLES.low
  return (
    <li
      className="rounded-xl px-3 py-2.5 space-y-2 list-none"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <p className="text-sm leading-snug" style={{ color: 'var(--text)' }}>{rec.action}</p>
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
          style={{ color: impact.c, background: impact.bg, border: `1px solid ${impact.b}` }}>
          Impact: {rec.impact}
        </span>
        <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
          style={{ color: ease.c, background: ease.bg, border: `1px solid ${ease.b}` }}>
          Effort: {rec.ease}
        </span>
        {rec.daysToImplement != null && (
          <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
            style={{ color: 'var(--accent)', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.20)' }}>
            ≤ {rec.daysToImplement}d
          </span>
        )}
      </div>
    </li>
  )
}

function SectionLabel({ children, color = 'var(--text-faint)' }) {
  return <p className="text-xs uppercase tracking-wider font-medium mb-2" style={{ color }}>{children}</p>
}

function GaugeDial({ score, label }) {
  const pct = (score / 5) * 100
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const { color } = scoreStyle(score)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}60)`, transition: 'stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black leading-none" style={{ color }}>{score.toFixed(1)}</span>
          <span className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>/ 5.0</span>
        </div>
      </div>
      <span
        className="text-xs font-medium px-3 py-1 rounded-full"
        style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
      >
        {label}
      </span>
    </div>
  )
}

function DimensionCard({ dimKey, data }) {
  const [open, setOpen] = useState(false)
  const meta = DIMENSION_META[dimKey] || { label: dimKey, icon: '📌' }
  const { color, bar } = scoreStyle(data.score)

  return (
    <button
      className="w-full text-left rounded-xl px-4 py-3.5 transition-all"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${open ? 'rgba(255,255,255,0.12)' : 'var(--border)'}`,
      }}
      onClick={() => setOpen(o => !o)}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
      onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-sm">{meta.icon}</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{meta.label}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-lg font-black" style={{ color }}>{data.score}/5</span>
          <span className="text-xs" style={{ color: 'var(--text-faint)', transform: open ? 'rotate(180deg)' : 'rotate(0)', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>
        </div>
      </div>
      <div className="score-bar">
        <div className="score-bar-fill" style={{ width: `${(data.score / 5) * 100}%`, background: bar }} />
      </div>

      {open && (
        <div className="mt-4 space-y-4 animate-slide-up text-left">
          {/* Assessment narrative */}
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{data.assessment}</p>

          {/* Evidence */}
          {Array.isArray(data.evidence) && data.evidence.length > 0 && (
            <div>
              <SectionLabel>Evidence from your deck</SectionLabel>
              <div className="rounded-xl px-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                {data.evidence.map((item, i) => <EvidenceRow key={i} item={item} />)}
              </div>
            </div>
          )}

          {/* Rubric fit */}
          {data.rubricFit && (
            <div>
              <SectionLabel>Why this score</SectionLabel>
              <p className="text-sm leading-relaxed rounded-xl px-3 py-2.5"
                style={{ color: 'var(--text-muted)', background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.15)' }}>
                {data.rubricFit}
              </p>
            </div>
          )}

          {/* Recommendations — sorted by priority */}
          {data.recommendations?.length > 0 && (
            <div>
              <SectionLabel>Recommendations — ranked by impact × effort</SectionLabel>
              <ul className="space-y-2 list-none p-0">
                {sortRecs(data.recommendations).map((rec, i) => <RecommendationCard key={i} rec={rec} />)}
              </ul>
            </div>
          )}
        </div>
      )}
    </button>
  )
}

export default function RatingResults({ result, stage, onReset }) {
  if (!result) return null

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-6 pb-10">

      {/* ── Summary header ── */}
      <div className="glass-card p-7">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <GaugeDial score={result.overallScore} label={result.overallLabel} />
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--text-faint)' }}>
              Analysis complete · <span className="capitalize">{stage}</span> stage
            </p>
            <h2 className="text-xl font-bold mb-3 tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
              Overall Score: {result.overallScore.toFixed(1)} / 5.0
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.summary}</p>
          </div>
        </div>
      </div>

      {/* ── Dimension breakdown ── */}
      <div>
        <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: 'var(--text-faint)' }}>
          Dimension breakdown <span style={{ textTransform: 'none', letterSpacing: 'normal' }}>— click any to expand</span>
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {Object.entries(result.dimensions || {}).map(([key, data]) => (
            <DimensionCard key={key} dimKey={key} data={data} />
          ))}
        </div>
      </div>

      {/* ── Strengths & Weaknesses ── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl p-5"
          style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)' }}>
          <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: '#4ade80' }}>Strengths</p>
          <ul className="space-y-2">
            {(result.strengths || []).map((s, i) => (
              <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl p-5"
          style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)' }}>
          <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: '#f87171' }}>Weaknesses</p>
          <ul className="space-y-2">
            {(result.weaknesses || []).map((w, i) => (
              <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: '#f87171', flexShrink: 0 }}>✗</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Top recommendations ── */}
      <div className="rounded-xl p-5"
        style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.15)' }}>
        <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: 'var(--accent)' }}>
          Top recommendations
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>
          Ranked by impact × effort — start with #1
        </p>
        <ol className="space-y-3 list-none p-0">
          {sortRecs(result.topRecommendations || []).map((rec, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold mt-2"
                style={{ background: 'rgba(56,189,248,0.12)', color: 'var(--accent)' }}
              >
                {i + 1}
              </span>
              {/* RecommendationCard handles both string and object recs */}
              <div className="flex-1"><ul className="list-none p-0 m-0"><RecommendationCard rec={rec} /></ul></div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── CTAs ── */}
      <div className="flex flex-wrap gap-3">
        <Link to="/create" className="btn btn-primary">Build an improved deck →</Link>
        <button onClick={onReset} className="btn btn-ghost">Rate another deck</button>
        <Link to="/research" className="btn btn-ghost">Research competitors →</Link>
      </div>
    </div>
  )
}
