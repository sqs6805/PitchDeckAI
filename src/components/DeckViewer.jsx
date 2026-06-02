import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { track } from '../utils/analytics'
import { exportDeckAsPptx } from '../utils/exportPptx'
import { exportDeckAsPdf } from '../utils/exportPdf'

// ─── Missing field placeholder ────────────────────────────────────────────
function Missing({ label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'rgba(251,191,36,0.10)', border: '1px dashed rgba(251,191,36,0.45)',
      borderRadius: 6, padding: '1px 8px', color: 'rgba(253,230,138,0.9)',
      fontSize: 12, fontWeight: 500, verticalAlign: 'middle', lineHeight: 1.6,
    }}>
      ⚠️ <strong style={{ fontWeight: 600 }}>Missing:</strong> {label}
    </span>
  )
}

function isMissing(val) {
  return !val || (typeof val === 'string' && val.includes('[MISSING:'))
}

function MissingBlock({ val, label }) {
  if (!isMissing(val)) return null
  const extracted = typeof val === 'string'
    ? val.replace(/\[MISSING:\s*/i, '').replace(/\]$/, '')
    : label
  return <div className="missing-field mt-2"><span>⚠️</span><span><strong>Missing:</strong> {extracted}</span></div>
}

function Val({ v, fallback }) {
  if (isMissing(v)) return <Missing label={fallback || v?.replace(/\[MISSING:\s*/i, '').replace(/\]$/, '') || 'Info needed'} />
  return <>{v}</>
}

// ─── Slide base layout ────────────────────────────────────────────────────
const BRAND = '#6366f1'
const ACCENT = '#8b5cf6'

function SlideBase({ children, accent = BRAND, className = '' }) {
  return (
    <div className={`w-full h-full bg-white flex flex-col overflow-hidden ${className}`}
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, #8b5cf6, #06b6d4)` }} />
      {children}
    </div>
  )
}

// ─── Individual slide renderers ───────────────────────────────────────────

function CoverSlide({ content = {} }) {
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col items-center justify-center px-12 text-center"
        style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
        <div className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center text-3xl font-black text-white"
          style={{ background: `linear-gradient(135deg, ${BRAND}, ${ACCENT})` }}>
          {(content.headline || 'C')[0]}
        </div>
        <h1 className="text-5xl font-black text-white mb-3 leading-tight clamp-2 max-w-3xl">
          {isMissing(content.headline) ? <Missing label="Company Name" /> : content.headline}
        </h1>
        <p className="text-xl text-indigo-200 mb-6 max-w-lg clamp-3">
          {isMissing(content.subheadline) ? <Missing label="Tagline" /> : content.subheadline}
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="px-4 py-1.5 rounded-full text-sm font-semibold text-white"
            style={{ background: `${BRAND}cc` }}>
            {content.stageLabel || 'Seed Round'}
          </span>
          {!isMissing(content.details) && (
            <span className="text-indigo-300 text-sm">{content.details}</span>
          )}
        </div>
        <div className="mt-6 text-indigo-300 text-sm">
          {isMissing(content.contact) ? <Missing label="Contact Info" /> : content.contact}
          {content.website && !isMissing(content.website) && (
            <span className="ml-3 opacity-70">{content.website}</span>
          )}
        </div>
      </div>
    </SlideBase>
  )
}

function ProblemSlide({ content = {} }) {
  const points = content.points || []
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-10 py-7">
        <h2 className="text-3xl font-black mb-1" style={{ color: '#1e293b' }}>
          {content.headline && !isMissing(content.headline) ? content.headline : 'The Problem'}
        </h2>
        {content.targetCustomer && !isMissing(content.targetCustomer) && (
          <p className="text-sm text-slate-500 mb-5">For: <strong className="text-slate-700">{content.targetCustomer}</strong></p>
        )}
        <div className="grid grid-cols-3 gap-5 flex-1">
          {points.slice(0, 3).map((pt, i) => (
            <div key={i} className="rounded-xl p-5 flex flex-col gap-2 min-w-0 overflow-hidden" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <span className="text-3xl">{pt.icon || '💡'}</span>
              <h3 className="font-bold text-slate-800 clamp-2">{pt.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed clamp-4">{pt.description}</p>
            </div>
          ))}
          {points.length === 0 && [0, 1, 2].map(i => (
            <div key={i} className="missing-field flex-col gap-1 items-start justify-start rounded-xl p-5">
              <span>⚠️</span>
              <span className="font-semibold">Missing: Pain Point {i + 1}</span>
            </div>
          ))}
        </div>
        {content.marketContext && !isMissing(content.marketContext) && (
          <p className="mt-4 text-xs text-slate-500 border-t border-slate-100 pt-3">{content.marketContext}</p>
        )}
      </div>
    </SlideBase>
  )
}

function SolutionSlide({ content = {} }) {
  const points = content.keyPoints || []
  return (
    <SlideBase>
      <div className="flex-1 flex gap-8 px-10 py-7">
        <div className="flex-[1.2] flex flex-col justify-center">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>OUR SOLUTION</div>
          <h2 className="text-3xl font-black text-slate-800 mb-3 leading-tight">
            {isMissing(content.headline) ? <Missing label="Solution Headline" /> : content.headline}
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm mb-4 clamp-4">
            {isMissing(content.description) ? <Missing label="Solution description" /> : content.description}
          </p>
          {content.differentiator && !isMissing(content.differentiator) && (
            <div className="rounded-xl p-4 text-sm clamp-3" style={{ background: '#ede9fe', color: '#5b21b6' }}>
              <strong>Key differentiator:</strong> {content.differentiator}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center gap-3">
          {points.filter(p => !isMissing(p)).slice(0, 4).map((pt, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl min-w-0 overflow-hidden" style={{ background: '#f0fdf4' }}>
              <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: '#10b981' }}>{i + 1}</span>
              <span className="text-sm text-slate-700 clamp-2 flex-1 min-w-0">{pt}</span>
            </div>
          ))}
          {points.length === 0 && <div className="missing-field">Key benefits not provided</div>}
        </div>
      </div>
    </SlideBase>
  )
}

function ProductSlide({ content = {} }) {
  const features = content.features || []
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-10 py-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: BRAND }}>PRODUCT</div>
            <h2 className="text-3xl font-black text-slate-800">
              {isMissing(content.description) ? 'How It Works' : content.description.split('.')[0]}
            </h2>
          </div>
          {content.stage && (
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: BRAND }}>
              {content.stage}
            </span>
          )}
        </div>
        <div className="flex gap-6 flex-1">
          {/* Screenshot placeholder */}
          <div className="flex-1 rounded-2xl flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', border: '2px dashed #a78bfa' }}>
            <span className="text-5xl">🖥️</span>
            <span className="text-sm font-semibold" style={{ color: '#7c3aed' }}>Product Screenshot</span>
            <span className="text-xs" style={{ color: '#a78bfa' }}>Add a screenshot or demo GIF</span>
          </div>
          {/* Features */}
          <div className="w-64 flex flex-col gap-3">
            {features.slice(0, 4).map((f, i) => (
              <div key={i} className="flex gap-3 items-start min-w-0">
                <span className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: `hsl(${250 + i * 20}, 70%, 60%)` }}>✓</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-800 clamp-1">{f.name}</div>
                  {f.description && <div className="text-xs text-slate-500 mt-0.5 clamp-2">{f.description}</div>}
                </div>
              </div>
            ))}
            {features.length === 0 && <div className="missing-field">No features provided</div>}
          </div>
        </div>
      </div>
    </SlideBase>
  )
}

function MarketSlide({ content = {} }) {
  const tam = content.tam || {}
  const sam = content.sam || {}
  const som = content.som || {}
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-10 py-7">
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: BRAND }}>MARKET OPPORTUNITY</div>
        <h2 className="text-3xl font-black text-slate-800 mb-5">A Massive, Growing Market</h2>
        <div className="flex gap-8 flex-1 items-center">
          {/* Nested circles */}
          <div className="relative w-56 h-56 flex-shrink-0">
            {[
              { size: 224, color: '#ddd6fe', label: 'TAM', val: tam.value, desc: tam.description },
              { size: 160, color: '#a78bfa', label: 'SAM', val: sam.value, desc: sam.description },
              { size: 96, color: BRAND, label: 'SOM', val: som.value, desc: som.description },
            ].map(({ size, color, label, val, desc }, i) => (
              <div key={label}
                className="absolute rounded-full flex flex-col items-center justify-center"
                style={{
                  width: size, height: size, background: color,
                  top: (224 - size) / 2, left: (224 - size) / 2,
                  boxShadow: i === 2 ? `0 0 20px ${BRAND}60` : 'none',
                }}>
                {i === 2 && (
                  <div className="text-center">
                    <div className="text-white text-xs font-bold">{label}</div>
                    <div className="text-white text-sm font-black">{isMissing(val) ? '?' : val}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Labels */}
          <div className="flex-1 space-y-4">
            {[
              { label: 'TAM', color: '#7c3aed', data: tam, full: 'Total Addressable Market' },
              { label: 'SAM', color: '#8b5cf6', data: sam, full: 'Serviceable Addressable Market' },
              { label: 'SOM', color: BRAND, data: som, full: 'Serviceable Obtainable Market' },
            ].map(({ label, color, data, full }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ background: color }}>{label}</span>
                <div>
                  <span className="font-bold text-slate-800 text-lg">
                    {isMissing(data.value) ? <Missing label={`${full} estimate`} /> : data.value}
                  </span>
                  {data.description && !isMissing(data.description) && (
                    <p className="text-xs text-slate-500 mt-0.5">{data.description}</p>
                  )}
                </div>
              </div>
            ))}
            {content.growthRate && !isMissing(content.growthRate) && (
              <div className="mt-2 px-3 py-2 rounded-xl text-sm" style={{ background: '#f0fdf4', color: '#166534' }}>
                📈 Growing at <strong>{content.growthRate}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </SlideBase>
  )
}

function TractionSlide({ content = {} }) {
  const metrics = content.metrics || []
  const milestones = content.milestones || []
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-10 py-7">
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: BRAND }}>TRACTION</div>
        <h2 className="text-3xl font-black text-slate-800 mb-5">Early Signals of Product-Market Fit</h2>
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {metrics.slice(0, 3).map((m, i) => (
            <div key={i} className="rounded-xl p-4 text-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="text-2xl font-black mb-1"
                style={{ color: isMissing(m.value) ? '#f59e0b' : '#1e293b' }}>
                {isMissing(m.value) ? '?' : m.value}
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase">{m.label}</div>
              {m.growth && !isMissing(m.growth) && (
                <div className="mt-1 text-xs font-semibold" style={{ color: '#10b981' }}>{m.growth}</div>
              )}
            </div>
          ))}
          {metrics.length === 0 && [0, 1, 2].map(i => (
            <div key={i} className="missing-field rounded-xl p-4 flex-col">
              <span>⚠️</span><span className="font-semibold text-xs">Missing: Key Metric {i + 1}</span>
            </div>
          ))}
        </div>
        {/* Timeline */}
        {milestones.length > 0 && (
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-3">Key Milestones</div>
            <div className="flex gap-0 overflow-x-auto">
              {milestones.slice(0, 5).map((m, i) => (
                <div key={i} className="flex-1 min-w-0 flex flex-col items-center text-center">
                  <div className="w-3 h-3 rounded-full mb-2 flex-shrink-0" style={{ background: BRAND }} />
                  <div className="text-xs font-bold text-slate-700 truncate w-full px-1">{m.event}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{m.date}</div>
                  {i < milestones.length - 1 && (
                    <div className="absolute" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SlideBase>
  )
}

function TeamSlide({ content = {} }) {
  const founders = content.founders || []
  const advisors = content.advisors || []
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-10 py-7">
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: BRAND }}>TEAM</div>
        <h2 className="text-3xl font-black text-slate-800 mb-5">
          World-Class Team{content.teamSize ? ` · ${content.teamSize} People` : ''}
        </h2>
        <div className="flex gap-5 flex-1">
          {founders.length === 0 ? (
            <div className="missing-field w-full">Founder information needed</div>
          ) : (
            founders.slice(0, 3).map((f, i) => (
              <div key={i} className="flex-1 rounded-xl p-5 flex flex-col gap-3 min-w-0 overflow-hidden"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, hsl(${250 + i * 30}, 70%, 60%), hsl(${270 + i * 30}, 70%, 60%))` }}>
                  {(f.name || '?')[0]}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 text-base clamp-1">{f.name || <Missing label="Name" />}</div>
                  <div className="text-sm font-medium mt-0.5 clamp-1" style={{ color: BRAND }}>{f.role}</div>
                </div>
                {f.background && !isMissing(f.background) && (
                  <div className="text-xs text-slate-500 leading-relaxed clamp-4">{f.background}</div>
                )}
                {f.highlight && !isMissing(f.highlight) && (
                  <div className="mt-auto text-xs font-medium px-3 py-2 rounded-lg clamp-2"
                    style={{ background: '#ede9fe', color: '#6d28d9' }}>
                    ★ {f.highlight}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {advisors.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase">Advisors: </span>
            <span className="text-xs text-slate-600">
              {advisors.filter(a => a && !isMissing(a.name || a)).map((a, i) => (
                <span key={i}>{typeof a === 'string' ? a : `${a.name} (${a.role})`}{i < advisors.length - 1 ? ' · ' : ''}</span>
              ))}
            </span>
          </div>
        )}
      </div>
    </SlideBase>
  )
}

function BusinessModelSlide({ content = {} }) {
  const pricing = content.pricing || []
  const ue = content.unitEconomics || {}
  return (
    <SlideBase>
      <div className="flex-1 flex gap-8 px-10 py-7">
        <div className="flex-1 flex flex-col">
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: BRAND }}>BUSINESS MODEL</div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">
            {isMissing(content.model) ? <Missing label="Revenue model" /> : content.model}
          </h2>
          {/* Pricing */}
          <div className="space-y-3 flex-1">
            {pricing.length === 0 ? (
              <div className="missing-field">Pricing tiers not provided</div>
            ) : (
              pricing.slice(0, 3).map((tier, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl min-w-0"
                  style={{ background: i === 1 ? '#ede9fe' : '#f8fafc', border: `1px solid ${i === 1 ? '#c4b5fd' : '#e2e8f0'}` }}>
                  {i === 1 && <span className="text-xs font-bold text-purple-700 bg-purple-200 px-2 py-0.5 rounded-full flex-shrink-0">Popular</span>}
                  <span className="font-bold text-slate-800 flex-1 clamp-1 min-w-0">{tier.tier}</span>
                  <span className="font-black text-lg flex-shrink-0" style={{ color: BRAND }}>{tier.price}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unit Economics */}
        <div className="w-52 flex flex-col gap-4 justify-center">
          <div className="text-xs font-semibold text-slate-400 uppercase">Unit Economics</div>
          {[
            { label: 'LTV', val: ue.ltv, color: '#10b981' },
            { label: 'CAC', val: ue.cac, color: '#f59e0b' },
            { label: 'Payback', val: ue.payback, color: BRAND },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="text-xs text-slate-400 mb-1">{label}</div>
              <div className="text-xl font-black" style={{ color: isMissing(val) ? '#f59e0b' : color }}>
                {isMissing(val) ? '?' : val}
              </div>
              <MissingBlock val={val} label={`${label} data`} />
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  )
}

function CompetitionSlide({ content = {} }) {
  const competitors = content.competitors || []
  const advantages = content.advantages || []
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-10 py-7">
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: BRAND }}>COMPETITIVE LANDSCAPE</div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">We Win Where It Matters</h2>
        {content.positioning && !isMissing(content.positioning) && (
          <p className="text-slate-500 text-sm mb-4">{content.positioning}</p>
        )}
        <div className="flex gap-6 flex-1">
          {/* Competitor table */}
          <div className="flex-1">
            {competitors.length === 0 ? (
              <div className="missing-field">Competitor analysis needed</div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <div className="grid grid-cols-3 text-xs font-bold text-slate-500 uppercase bg-slate-50 px-4 py-2">
                  <span>Competitor</span><span>Their Weakness</span><span style={{ color: BRAND }}>Our Edge</span>
                </div>
                {competitors.slice(0, 4).map((c, i) => (
                  <div key={i} className={`grid grid-cols-3 gap-3 text-sm px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <span className="font-semibold text-slate-800 clamp-2 min-w-0">{c.name}</span>
                    <span className="text-slate-500 clamp-2 min-w-0">{c.weakness}</span>
                    <span className="font-medium clamp-2 min-w-0" style={{ color: '#10b981' }}>{c.ourAdvantage}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Advantages */}
          {advantages.length > 0 && (
            <div className="w-52 flex flex-col gap-2">
              <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Our Moat</div>
              {advantages.filter(a => !isMissing(a)).map((adv, i) => (
                <div key={i} className="flex gap-2 items-start text-sm">
                  <span className="text-brand-500 font-bold flex-shrink-0">⚡</span>
                  <span className="text-slate-700">{adv}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SlideBase>
  )
}

function GTMSlide({ content = {} }) {
  const channels = content.channels || []
  return (
    <SlideBase>
      <div className="flex-1 flex gap-8 px-10 py-7">
        <div className="flex-1 flex flex-col">
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: BRAND }}>GO-TO-MARKET</div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            {isMissing(content.strategy) ? 'GTM Strategy' : content.strategy}
          </h2>
          {content.salesMotion && !isMissing(content.salesMotion) && (
            <p className="text-slate-500 text-sm mb-4">{content.salesMotion}</p>
          )}
          {/* Channels */}
          <div className="space-y-3 flex-1">
            {channels.length === 0 ? (
              <div className="missing-field">GTM channels not defined</div>
            ) : (
              channels.slice(0, 4).map((ch, i) => (
                <div key={i} className="min-w-0">
                  <div className="flex justify-between text-sm mb-1 gap-2">
                    <span className="font-medium text-slate-700 clamp-1 flex-1 min-w-0">{ch.name}</span>
                    <span className="font-bold flex-shrink-0" style={{ color: BRAND }}>{ch.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${ch.percentage}%`,
                      background: `hsl(${250 + i * 20}, 70%, 65%)`
                    }} />
                  </div>
                  {ch.description && <p className="text-xs text-slate-400 mt-0.5 clamp-1">{ch.description}</p>}
                </div>
              ))
            )}
          </div>
        </div>
        {content.partnerships && !isMissing(content.partnerships) && (
          <div className="w-52 flex flex-col justify-center">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-3">Strategic Partners</div>
            <div className="rounded-xl p-4" style={{ background: '#ede9fe', border: '1px solid #c4b5fd' }}>
              <p className="text-sm text-purple-800">{Array.isArray(content.partnerships) ? content.partnerships.join(' · ') : content.partnerships}</p>
            </div>
          </div>
        )}
      </div>
    </SlideBase>
  )
}

function FinancialsSlide({ content = {} }) {
  const projections = content.projections || []
  return (
    <SlideBase>
      <div className="flex-1 flex gap-8 px-10 py-7">
        <div className="flex-1 flex flex-col">
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: BRAND }}>FINANCIALS</div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">Path to Scale</h2>
          {/* Projection bars */}
          {projections.length > 0 ? (
            <div className="flex-1 flex flex-col justify-end gap-2">
              <div className="text-xs text-slate-400 mb-2">Projected MRR Growth</div>
              <div className="flex items-end gap-3 h-32">
                {projections.map((p, i) => {
                  const pct = Math.min(100, (i + 1) / projections.length * 100)
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-slate-600">{p.mrr}</span>
                      <div className="w-full rounded-t-lg transition-all"
                        style={{ height: `${20 + pct * 0.8}%`, background: `hsl(${250 + i * 15}, 70%, ${65 - i * 5}%)` }} />
                      <span className="text-xs text-slate-400">{p.period}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="missing-field flex-1 items-start">Revenue projections not provided</div>
          )}
        </div>
        {/* Current metrics */}
        <div className="w-52 space-y-4 justify-center flex flex-col">
          <div className="text-xs font-semibold text-slate-400 uppercase">Current Metrics</div>
          {[
            { label: 'MRR', val: content.currentMRR },
            { label: 'Monthly Burn', val: content.burnRate },
            { label: 'Runway', val: content.runway },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="text-xs text-slate-400 mb-1">{label}</div>
              <div className="text-lg font-black" style={{ color: isMissing(val) ? '#f59e0b' : '#1e293b' }}>
                {isMissing(val) ? '—' : val}
              </div>
              <MissingBlock val={val} label={label} />
            </div>
          ))}
          {content.previousFunding && !isMissing(content.previousFunding) && (
            <div className="text-xs text-slate-500">
              <span className="font-semibold">Prior funding:</span> {content.previousFunding}
            </div>
          )}
        </div>
      </div>
    </SlideBase>
  )
}

function AskSlide({ content = {} }) {
  const funds = content.useOfFunds || []
  const milestones = content.milestones || []
  return (
    <SlideBase>
      <div className="flex-1 flex gap-8 px-10 py-7">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: BRAND }}>THE ASK</div>
          <div className="text-6xl font-black mb-2" style={{ background: `linear-gradient(135deg, ${BRAND}, #8b5cf6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {isMissing(content.amount) ? <span className="text-amber-400">?</span> : content.amount}
          </div>
          {content.valuation && !isMissing(content.valuation) && (
            <p className="text-slate-500 text-sm mb-4">at {content.valuation} pre-money</p>
          )}
          {/* Use of funds */}
          {funds.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase">Use of Funds</div>
              {funds.slice(0, 4).map((f, i) => (
                <div key={i} className="min-w-0">
                  <div className="flex justify-between text-sm mb-1 gap-2">
                    <span className="text-slate-700 clamp-1 flex-1 min-w-0">{f.category}</span>
                    <span className="font-bold text-slate-800 flex-shrink-0">{f.percentage}% · {f.amount}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{
                      width: `${f.percentage}%`,
                      background: `hsl(${250 + i * 20}, 70%, 60%)`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {content.timeline && !isMissing(content.timeline) && (
            <p className="mt-4 text-sm text-slate-500">Target close: <strong className="text-slate-700">{content.timeline}</strong></p>
          )}
        </div>
        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="w-64 flex flex-col justify-center">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-4">This Round Unlocks</div>
            <div className="space-y-3">
              {milestones.filter(m => m && !isMissing(m)).slice(0, 4).map((m, i) => (
                <div key={i} className="flex gap-3 items-start p-3 rounded-xl min-w-0"
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                  <span className="text-sm text-slate-700 clamp-2 flex-1 min-w-0">{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SlideBase>
  )
}

// ─── Slide router ─────────────────────────────────────────────────────────
const SLIDE_RENDERERS = {
  cover: CoverSlide,
  problem: ProblemSlide,
  solution: SolutionSlide,
  product: ProductSlide,
  market: MarketSlide,
  traction: TractionSlide,
  team: TeamSlide,
  business_model: BusinessModelSlide,
  competition: CompetitionSlide,
  gtm: GTMSlide,
  financials: FinancialsSlide,
  ask: AskSlide,
}

function SlideRenderer({ slide }) {
  const Component = SLIDE_RENDERERS[slide.type]
  if (!Component) {
    return (
      <SlideBase>
        <div className="flex-1 flex flex-col items-center justify-center p-10">
          <h2 className="text-2xl font-bold text-slate-700">{slide.title}</h2>
          <pre className="text-xs text-slate-400 mt-4 overflow-auto">{JSON.stringify(slide.content, null, 2)}</pre>
        </div>
      </SlideBase>
    )
  }
  return <Component content={slide.content || {}} />
}

// ─── Scaled slide ──────────────────────────────────────────────────────────
// Every slide is authored at a FIXED design size (1280×720) so the absolute
// font/padding sizes in each renderer always have the canvas they were built
// for. We then transform-scale that fixed canvas to fit whatever container it
// lives in. This is what guarantees content never overflows its boxes — the
// layout is identical at every display size, just scaled uniformly.
const DESIGN_W = 1280
const DESIGN_H = 720

function ScaledSlide({ slide, className = '', style }) {
  const ref = useRef(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(el.clientWidth / DESIGN_W)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} className={`slide-aspect ${className}`} style={style}>
      <div
        style={{
          position: 'absolute', top: 0, left: 0,
          width: DESIGN_W, height: DESIGN_H,
          transform: `scale(${scale})`, transformOrigin: 'top left',
          // hide until measured to avoid a one-frame full-size flash
          visibility: scale ? 'visible' : 'hidden',
        }}
      >
        <SlideRenderer slide={slide} />
      </div>
    </div>
  )
}

// ─── Thumbnail ─────────────────────────────────────────────────────────────
function Thumbnail({ slide, index, active, onClick }) {
  const hasIssues = slide.missing && slide.missing.length > 0
  return (
    <button onClick={onClick}
      className={`w-full text-left rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
        active ? 'border-brand-500 shadow-lg shadow-brand-500/20' : 'border-transparent hover:border-surface-400'
      }`}>
      <div className="relative w-full" style={{ aspectRatio: '16/9', background: '#fff', overflow: 'hidden' }}>
        <div className="absolute inset-0 pointer-events-none">
          <ScaledSlide slide={slide} />
        </div>
        {hasIssues && (
          <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-amber-400" title="Has missing fields" />
        )}
      </div>
      <div className="px-2 py-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>{index + 1}. {slide.title}</p>
      </div>
    </button>
  )
}

const BAR_STYLE = { background: 'rgba(12,18,32,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }
const BORDER_BOTTOM = { borderBottom: '1px solid var(--border)' }
const BORDER_TOP = { borderTop: '1px solid var(--border)' }
const BORDER_RIGHT = { borderRight: '1px solid var(--border)' }
const BORDER_LEFT = { borderLeft: '1px solid var(--border)' }

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Find every unique [MISSING: ...] placeholder embedded in a slide's content */
function findMissingPlaceholders(content) {
  const json = JSON.stringify(content || {})
  const matches = [...json.matchAll(/\[MISSING: ([^\]]+)\]/g)]
  return [...new Map(matches.map(m => [m[0], { full: m[0], label: m[1] }])).values()]
}

// ─── Main DeckViewer ──────────────────────────────────────────────────────
export default function DeckViewer({ deck, onReset }) {
  const [deckData, setDeckData] = useState(deck)
  const [current, setCurrent] = useState(0)
  const [showExport, setShowExport] = useState(false)
  const [editing, setEditing] = useState(null)   // { placeholder, label, slideId }
  const [editValue, setEditValue] = useState('')
  const exportRef = useRef(null)

  const slides = deckData?.slides || []
  const totalMissing = slides.reduce((acc, s) => acc + findMissingPlaceholders(s.content).length, 0)

  const prev = useCallback(() => setCurrent(c => Math.max(0, c - 1)), [])
  const next = useCallback(() => setCurrent(c => Math.min(slides.length - 1, c + 1)), [slides.length])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') { setShowExport(false); setEditing(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  // Close export dropdown on outside click
  useEffect(() => {
    if (!showExport) return
    const handler = e => { if (exportRef.current && !exportRef.current.contains(e.target)) setShowExport(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showExport])

  /** Replace a [MISSING: ...] placeholder with a real value in the deck data */
  const saveMissingEdit = () => {
    if (!editing || !editValue.trim()) return
    setDeckData(prev => ({
      ...prev,
      slides: prev.slides.map(slide => {
        if (slide.id !== editing.slideId) return slide
        const updated = JSON.parse(JSON.stringify(slide.content).replaceAll(editing.placeholder, editValue.trim()))
        return { ...slide, content: updated }
      }),
    }))
    setEditing(null)
    setEditValue('')
  }

  if (!slides.length) return <div className="p-8" style={{ color: 'var(--text-muted)' }}>No slides generated.</div>

  const currentSlide = slides[current]
  const slideMissing = findMissingPlaceholders(currentSlide.content)

  return (
    <>
      {/* All-slides print container — portaled to <body> so it escapes the
          height-constrained / overflow-hidden ancestors that previously
          clipped printing to a single slide. Hidden on screen; one slide per
          page when printing. */}
      {createPortal(
        <div className="print-only">
          {slides.map(slide => (
            <div key={`print-${slide.id}`} className="print-slide">
              <div className="print-slide-inner">
                <SlideRenderer slide={slide} />
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}

    <div className="h-full flex flex-col print-hide-in-print" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div className="no-print flex items-center justify-between px-5 h-11 flex-shrink-0 relative" style={{ ...BAR_STYLE, ...BORDER_BOTTOM, zIndex: 50 }}>
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ← Back
          </button>
          <div className="w-px h-3.5" style={{ background: 'var(--border)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{deckData.company}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(56,189,248,0.1)', color: 'var(--accent)', border: '1px solid rgba(56,189,248,0.2)' }}
          >
            {deckData.stage}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {totalMissing > 0 && (
            <div
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(251,191,36,0.08)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}
            >
              ⚠ {totalMissing} field{totalMissing > 1 ? 's' : ''} missing
            </div>
          )}
          <Link to="/research" className="btn btn-ghost btn-sm">🔍 Research</Link>

          {/* Export dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExport(e => !e)}
              className="btn btn-ghost btn-sm flex items-center gap-1"
            >
              Export
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.6 }}>
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showExport && (
              <div
                className="absolute right-0 top-full mt-1.5 w-52 rounded-xl overflow-hidden z-50"
                style={{ background: '#0f172a', border: '1px solid var(--border)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
              >
                <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-faint)' }}>Export options</p>
                </div>
                {[
                  { icon: '📊', label: 'Download as PowerPoint', desc: 'Editable .pptx file', action: async () => {
                    track.deckExported('pptx')
                    setShowExport(false)
                    const startedAt = Date.now()
                    try {
                      await exportDeckAsPptx(deckData)
                      track.deckExportSucceeded('pptx', Date.now() - startedAt)
                    } catch (err) {
                      track.deckExportFailed('pptx', err.message)
                      console.error('PPTX export failed:', err)
                      alert('PowerPoint export failed. Try the PDF option instead.')
                    }
                  }},
                  { icon: '🖨', label: 'Download as PDF', desc: 'Landscape 16:9, all slides', action: async () => {
                    track.deckExported('pdf')
                    setShowExport(false)
                    const startedAt = Date.now()
                    try {
                      await exportDeckAsPdf(deckData)
                      track.deckExportSucceeded('pdf', Date.now() - startedAt)
                    } catch (err) {
                      track.deckExportFailed('pdf', err.message)
                      console.error('PDF export failed:', err)
                      alert('PDF export failed. Try the PowerPoint option instead.')
                    }
                  }},
                ].map(({ icon, label, desc, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                  >
                    <span className="text-base leading-none mt-0.5">{icon}</span>
                    <div>
                      <div className="text-xs font-medium">{label}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Thumbnail sidebar */}
        <div className="no-print w-40 flex-shrink-0 overflow-y-auto p-2 space-y-1.5" style={{ ...BAR_STYLE, ...BORDER_RIGHT }}>
          {slides.map((slide, i) => (
            <Thumbnail key={slide.id} slide={slide} index={i} active={i === current} onClick={() => setCurrent(i)} />
          ))}
        </div>

        {/* Main slide area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'var(--bg)' }}>
            <ScaledSlide
              slide={currentSlide}
              className="w-full rounded-xl overflow-hidden"
              style={{ maxWidth: 'calc((100vh - 10rem) * 16 / 9)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
            />
          </div>

          {/* Bottom navigation */}
          <div className="no-print flex items-center justify-between px-6 h-12 flex-shrink-0" style={{ ...BAR_STYLE, ...BORDER_TOP }}>
            <button
              onClick={prev} disabled={current === 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >←</button>

            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} className="rounded-full transition-all"
                    style={{ width: i === current ? 16 : 6, height: 6, background: i === current ? 'var(--accent)' : 'var(--border)' }}
                  />
                ))}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{current + 1} / {slides.length}</span>
            </div>

            <button
              onClick={next} disabled={current === slides.length - 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >→</button>
          </div>
        </div>

        {/* Right panel */}
        <div className="no-print w-56 flex-shrink-0 overflow-y-auto" style={{ ...BAR_STYLE, ...BORDER_LEFT }}>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--text-faint)' }}>Slide</p>
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{currentSlide.title}</h3>
              <span className="inline-block text-xs px-2 py-0.5 rounded-md capitalize"
                style={{ background: 'var(--surface-md)', color: 'var(--text-faint)', border: '1px solid var(--border)' }}>
                {currentSlide.type?.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Missing fields */}
            {slideMissing.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: '#fbbf24' }}>
                  Missing — click to fill in
                </p>
                <div className="space-y-2">
                  {slideMissing.map(({ full, label }, i) => (
                    <div key={i}>
                      {editing?.placeholder === full && editing?.slideId === currentSlide.id ? (
                        <div className="rounded-xl p-2.5 space-y-2"
                          style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.2)' }}>
                          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
                          <input
                            autoFocus
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveMissingEdit(); if (e.key === 'Escape') { setEditing(null); setEditValue('') } }}
                            placeholder="Type value…"
                            className="field"
                            style={{ fontSize: 12, padding: '6px 10px' }}
                          />
                          <div className="flex gap-1.5">
                            <button onClick={saveMissingEdit} disabled={!editValue.trim()}
                              className="btn btn-primary btn-sm flex-1" style={{ fontSize: 11, padding: '5px 8px' }}>
                              Save
                            </button>
                            <button onClick={() => { setEditing(null); setEditValue('') }}
                              className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '5px 8px' }}>
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditing({ placeholder: full, label, slideId: currentSlide.id }); setEditValue('') }}
                          className="w-full text-left px-2.5 py-2 rounded-lg flex items-start gap-2 group transition-all"
                          style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(251,191,36,0.4)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(251,191,36,0.18)'}
                        >
                          <span style={{ color: '#fbbf24', flexShrink: 0, fontSize: 11 }}>✏</span>
                          <span className="text-xs leading-snug" style={{ color: 'rgba(253,230,138,0.8)' }}>{label}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <Link to="/research"
                  className="mt-3 w-full block text-center text-xs py-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', color: 'var(--accent)' }}>
                  Research missing data →
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#4ade80' }}>
                <span>✓</span> All fields complete
              </div>
            )}

            <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>← → to navigate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
