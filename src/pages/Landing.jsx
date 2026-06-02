import { Link } from 'react-router-dom'

function FeatureRow({ icon, title, desc }) {
  return (
    <div className="flex gap-4 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
      <div
        className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-base"
        style={{ background: 'var(--surface-md)', border: '1px solid var(--border)' }}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--text)' }}>{title}</div>
        <div className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</div>
      </div>
    </div>
  )
}

function StagePill({ label, active }) {
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        background: active ? 'rgba(56,189,248,0.12)' : 'var(--surface)',
        border: `1px solid ${active ? 'rgba(56,189,248,0.3)' : 'var(--border)'}`,
        color: active ? 'var(--accent)' : 'var(--text-muted)',
      }}
    >
      {label}
    </span>
  )
}

export default function Landing() {
  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            <span className="text-xs tracking-widest uppercase font-medium" style={{ color: 'var(--text-muted)' }}>
              AI pitch deck intelligence
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl font-bold mb-5 leading-[1.1] tracking-tight"
            style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}
          >
            The investor's eye,<br />
            <span style={{ color: 'var(--text-muted)', fontWeight: 300 }}>for your startup story.</span>
          </h1>

          <p className="text-base leading-relaxed mb-8 max-w-lg" style={{ color: 'var(--text-muted)' }}>
            Rate your existing pitch deck against real VC criteria, or generate a new one from scratch.
            Built for founders who want honest feedback, not flattery.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3">
            <Link to="/rate" className="btn btn-primary btn-lg">
              Rate my deck
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link to="/create" className="btn btn-primary btn-lg">
              Build a deck
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Two-column layout ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-5">

          {/* Rate card */}
          <Link to="/rate" className="glass-card-interactive p-7 group block">
            <div className="flex items-start justify-between mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
              >
                📊
              </div>
              <svg
                className="opacity-30 group-hover:opacity-70 transition-opacity"
                width="16" height="16" viewBox="0 0 16 16" fill="none"
              >
                <path d="M3 13L13 3M13 3H5M13 3v8" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h2 className="text-lg font-semibold mb-2 tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
              Rate My Deck
            </h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
              Upload a PDF or paste your deck text. Get a 0–5 score on every dimension VCs actually evaluate, with specific feedback and recommendations.
            </p>

            {/* Mock VC verdict preview */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--text-faint)' }}>Sample verdict</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                  Developing · 2.9
                </span>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                "Strong founding team, but the market sizing is hand-wavy and there's no evidence of GTM discipline beyond 'we'll do content marketing.'"
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '✓ Team credible', c: '#4ade80', bg: 'rgba(74,222,128,0.08)', b: 'rgba(74,222,128,0.2)' },
                  { label: '⚠ Market vague', c: '#fbbf24', bg: 'rgba(251,191,36,0.08)', b: 'rgba(251,191,36,0.2)' },
                  { label: '✗ GTM missing', c: '#f87171', bg: 'rgba(248,113,113,0.08)', b: 'rgba(248,113,113,0.2)' },
                ].map(({ label, c, bg, b }) => (
                  <span key={label} className="text-xs px-2 py-1 rounded-lg font-medium"
                    style={{ color: c, background: bg, border: `1px solid ${b}` }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          {/* Create card */}
          <Link to="/create" className="glass-card-interactive p-7 group block">
            <div className="flex items-start justify-between mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                ✦
              </div>
              <svg
                className="opacity-30 group-hover:opacity-70 transition-opacity"
                width="16" height="16" viewBox="0 0 16 16" fill="none"
              >
                <path d="M3 13L13 3M13 3H5M13 3v8" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h2 className="text-lg font-semibold mb-2 tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
              Create My Deck
            </h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
              Answer questions about your startup and we generate a complete, slide-by-slide pitch deck. Missing info is flagged so you know exactly what to add.
            </p>

            {/* Slide preview chips */}
            <div className="flex flex-wrap gap-1.5">
              {['Cover', 'Problem', 'Solution', 'Market', 'Traction', 'Team', 'Business Model', 'Competition', 'The Ask'].map(slide => (
                <span
                  key={slide}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: 'var(--surface-md)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-faint)',
                  }}
                >
                  {slide}
                </span>
              ))}
            </div>
          </Link>
        </div>

        {/* Market research link */}
        <Link
          to="/research"
          className="mt-4 flex items-center justify-between px-5 py-4 rounded-xl transition-colors group"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--text-muted)' }}>🔍</span>
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Market Research Agent</span>
              <span className="text-sm ml-2" style={{ color: 'var(--text-faint)' }}>
                — find competitors, market sizing & GTM strategies before you build
              </span>
            </div>
          </div>
          <svg className="flex-shrink-0 opacity-30 group-hover:opacity-60 transition-opacity" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </section>

      {/* ── What VCs look for ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-[1fr_1.4fr] gap-12 items-start">

          {/* Left: heading */}
          <div className="sticky top-20">
            <p className="text-xs tracking-widest uppercase font-medium mb-3" style={{ color: 'var(--text-faint)' }}>
              Evaluation criteria
            </p>
            <h2
              className="text-3xl font-bold mb-4 leading-tight"
              style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
            >
              Everything VCs<br />look for
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Our scoring engine evaluates the same criteria as partners at Sequoia, a16z, and Y Combinator — calibrated to your stage.
            </p>

            {/* Stage pills */}
            <div className="mt-6 space-y-3">
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--text-faint)' }}>Pre-seed / Seed</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Team', 'Traction', 'Market Size'].map(l => <StagePill key={l} label={l} active />)}
                </div>
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--text-faint)' }}>Series A+</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Team', 'Traction', 'Market Size', 'GTM', 'Competition', 'Capital Plan'].map(l => <StagePill key={l} label={l} active />)}
                </div>
              </div>
            </div>
          </div>

          {/* Right: feature rows */}
          <div className="glass-card px-6">
            <FeatureRow icon="👥" title="Team" desc="Founder backgrounds, domain expertise, and why this team is uniquely positioned to win this market." />
            <FeatureRow icon="📈" title="Traction" desc="Revenue growth, user metrics, retention, and concrete evidence of product-market fit." />
            <FeatureRow icon="🌍" title="Market Size" desc="TAM/SAM/SOM analysis, credible market timing, and long-term growth trajectory." />
            <FeatureRow icon="🗺️" title="GTM Strategy" desc="Go-to-market channels, sales motion, CAC efficiency, and path to scalable distribution." />
            <FeatureRow icon="⚔️" title="Competitive Knowledge" desc="Landscape depth, defensible moats, and clear differentiated positioning against incumbents." />
            <div className="py-5">
              <div className="flex gap-4">
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-base"
                  style={{ background: 'var(--surface-md)', border: '1px solid var(--border)' }}
                >
                  💰
                </div>
                <div>
                  <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--text)' }}>Capital Allocation</div>
                  <div className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Use of funds clarity, financial projections, burn rate, and milestone-based thinking.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
