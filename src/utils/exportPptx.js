/**
 * Generate a real .pptx file from the deck JSON.
 * Uses pptxgenjs for client-side PPTX generation. Each slide gets a clean
 * editable layout — text boxes, not images, so the user can edit in PowerPoint.
 */
import PptxGenJS from 'pptxgenjs'

const ACCENT = '6366F1'        // brand purple/indigo
const DARK = '1E293B'          // slate-800
const MUTED = '64748B'         // slate-500
const LIGHT = 'F8FAFC'         // slate-50

// Strip [MISSING: ...] placeholders so they don't show in the PPTX
const clean = v => {
  if (v == null) return ''
  if (typeof v !== 'string') return String(v)
  return v.replace(/\[MISSING:[^\]]*\]/gi, '').trim()
}

const safe = v => clean(v) || '—'

function addHeader(slide, label) {
  slide.addText(label, {
    x: 0.4, y: 0.3, w: 9, h: 0.3,
    fontSize: 10, fontFace: 'Inter', bold: true,
    color: ACCENT, charSpacing: 4,
  })
}

function addTitle(slide, title) {
  slide.addText(title, {
    x: 0.4, y: 0.65, w: 9, h: 0.7,
    fontSize: 28, fontFace: 'Inter', bold: true, color: DARK,
  })
}

function buildCoverSlide(pptx, c = {}) {
  const slide = pptx.addSlide()
  slide.background = { color: '0F0C29' }

  // Accent bar at top
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 0.08,
    fill: { color: ACCENT }, line: { color: ACCENT, width: 0 },
  })

  // Logo placeholder (rounded square with first letter)
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4.5, y: 1.5, w: 1.0, h: 1.0, rectRadius: 0.15,
    fill: { color: ACCENT }, line: { color: ACCENT, width: 0 },
  })
  slide.addText(safe(c.headline)[0]?.toUpperCase() || 'C', {
    x: 4.5, y: 1.5, w: 1.0, h: 1.0,
    fontSize: 36, fontFace: 'Inter', bold: true,
    color: 'FFFFFF', align: 'center', valign: 'middle',
  })

  slide.addText(safe(c.headline) || 'Company', {
    x: 0.5, y: 2.7, w: 9, h: 1.0,
    fontSize: 44, fontFace: 'Inter', bold: true, color: 'FFFFFF', align: 'center',
  })
  if (clean(c.subheadline)) {
    slide.addText(clean(c.subheadline), {
      x: 1, y: 3.7, w: 8, h: 0.6,
      fontSize: 16, fontFace: 'Inter', color: 'C7D2FE', align: 'center',
    })
  }
  // Stage pill
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4, y: 4.45, w: 2, h: 0.4, rectRadius: 0.2,
    fill: { color: ACCENT }, line: { color: ACCENT, width: 0 },
  })
  slide.addText(safe(c.stageLabel) || 'Seed Round', {
    x: 4, y: 4.45, w: 2, h: 0.4,
    fontSize: 11, fontFace: 'Inter', bold: true, color: 'FFFFFF',
    align: 'center', valign: 'middle',
  })
  if (clean(c.details)) {
    slide.addText(clean(c.details), {
      x: 0.5, y: 5.05, w: 9, h: 0.3,
      fontSize: 11, fontFace: 'Inter', color: 'A5B4FC', align: 'center',
    })
  }
  if (clean(c.contact) || clean(c.website)) {
    slide.addText(`${clean(c.contact) || ''}${clean(c.website) ? `  ·  ${clean(c.website)}` : ''}`, {
      x: 0.5, y: 5.35, w: 9, h: 0.3,
      fontSize: 10, fontFace: 'Inter', color: '818CF8', align: 'center',
    })
  }
}

function buildProblemSlide(pptx, c = {}) {
  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  addHeader(slide, 'THE PROBLEM')
  addTitle(slide, clean(c.headline) || 'The Problem')

  const points = (c.points || []).slice(0, 3)
  const cardW = 2.9, cardH = 3.0, gap = 0.15
  const startX = (10 - (cardW * 3 + gap * 2)) / 2

  points.forEach((pt, i) => {
    const x = startX + i * (cardW + gap)
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.7, w: cardW, h: cardH, rectRadius: 0.1,
      fill: { color: LIGHT }, line: { color: 'E2E8F0', width: 1 },
    })
    slide.addText(pt.icon || '·', { x: x + 0.2, y: 1.85, w: 0.5, h: 0.5, fontSize: 24 })
    slide.addText(clean(pt.title) || `Pain ${i + 1}`, {
      x: x + 0.2, y: 2.4, w: cardW - 0.4, h: 0.5,
      fontSize: 14, fontFace: 'Inter', bold: true, color: DARK,
    })
    slide.addText(clean(pt.description) || '', {
      x: x + 0.2, y: 2.95, w: cardW - 0.4, h: cardH - 1.3,
      fontSize: 11, fontFace: 'Inter', color: '475569', valign: 'top',
    })
  })

  if (clean(c.marketContext)) {
    slide.addText(clean(c.marketContext), {
      x: 0.4, y: 4.9, w: 9.2, h: 0.4, fontSize: 10, fontFace: 'Inter',
      italic: true, color: MUTED,
    })
  }
}

function buildSolutionSlide(pptx, c = {}) {
  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  addHeader(slide, 'OUR SOLUTION')
  addTitle(slide, clean(c.headline) || 'Our Solution')
  slide.addText(clean(c.description) || safe(c.description), {
    x: 0.4, y: 1.6, w: 4.8, h: 2.0, fontSize: 13, fontFace: 'Inter', color: '475569',
  })
  const points = (c.keyPoints || []).slice(0, 4)
  points.forEach((pt, i) => {
    slide.addText(`${i + 1}. ${clean(pt)}`, {
      x: 5.5, y: 1.65 + i * 0.6, w: 4.2, h: 0.5,
      fontSize: 12, fontFace: 'Inter', color: DARK,
      fill: { color: 'F0FDF4' }, valign: 'middle',
    })
  })
  if (clean(c.differentiator)) {
    slide.addText(`Key differentiator: ${clean(c.differentiator)}`, {
      x: 0.4, y: 4.8, w: 9.2, h: 0.5, fontSize: 11, fontFace: 'Inter', bold: true,
      color: '5B21B6', fill: { color: 'EDE9FE' }, valign: 'middle',
    })
  }
}

function buildProductSlide(pptx, c = {}) {
  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  addHeader(slide, 'PRODUCT')
  addTitle(slide, clean(c.description?.split('.')[0]) || 'Product')
  const features = (c.features || []).slice(0, 4)
  features.forEach((f, i) => {
    slide.addText(`✓ ${clean(f.name)}`, {
      x: 0.4, y: 1.7 + i * 0.7, w: 9, h: 0.3,
      fontSize: 13, fontFace: 'Inter', bold: true, color: DARK,
    })
    if (clean(f.description)) {
      slide.addText(clean(f.description), {
        x: 0.6, y: 2.0 + i * 0.7, w: 8.8, h: 0.3,
        fontSize: 11, fontFace: 'Inter', color: MUTED,
      })
    }
  })
}

function buildMarketSlide(pptx, c = {}) {
  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  addHeader(slide, 'MARKET OPPORTUNITY')
  addTitle(slide, 'A Massive, Growing Market')

  // Nested concentric circles for TAM/SAM/SOM (left side)
  const cx = 2.3, cy = 3.4
  const circles = [
    { size: 3.0, color: 'DDD6FE', label: 'TAM', val: safe(c.tam?.value) },
    { size: 2.0, color: 'A78BFA', label: 'SAM', val: safe(c.sam?.value) },
    { size: 1.1, color: ACCENT, label: 'SOM', val: safe(c.som?.value) },
  ]
  circles.forEach(({ size, color }) => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - size / 2, y: cy - size / 2, w: size, h: size,
      fill: { color }, line: { color, width: 0 },
    })
  })
  // Center text inside the smallest circle
  slide.addText(`SOM\n${circles[2].val}`, {
    x: cx - 0.5, y: cy - 0.25, w: 1.0, h: 0.5,
    fontSize: 11, fontFace: 'Inter', bold: true,
    color: 'FFFFFF', align: 'center', valign: 'middle',
  })

  // Right-side labels
  const labels = [
    { label: 'TAM', color: '7C3AED', val: safe(c.tam?.value), desc: clean(c.tam?.description) || 'Total addressable market' },
    { label: 'SAM', color: '8B5CF6', val: safe(c.sam?.value), desc: clean(c.sam?.description) || 'Serviceable addressable' },
    { label: 'SOM', color: ACCENT,   val: safe(c.som?.value), desc: clean(c.som?.description) || 'Serviceable obtainable' },
  ]
  labels.forEach(({ label, color, val, desc }, i) => {
    const y = 1.7 + i * 1.0
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 4.5, y, w: 0.7, h: 0.4, rectRadius: 0.05,
      fill: { color }, line: { color, width: 0 },
    })
    slide.addText(label, {
      x: 4.5, y, w: 0.7, h: 0.4, fontSize: 11, fontFace: 'Inter', bold: true,
      color: 'FFFFFF', align: 'center', valign: 'middle',
    })
    slide.addText(val, {
      x: 5.4, y, w: 2.2, h: 0.4, fontSize: 18, fontFace: 'Inter', bold: true,
      color: DARK, valign: 'middle',
    })
    slide.addText(desc, {
      x: 5.4, y: y + 0.4, w: 4.3, h: 0.4, fontSize: 10, fontFace: 'Inter',
      color: MUTED, valign: 'top',
    })
  })

  if (clean(c.growthRate)) {
    slide.addText(`📈 Growing at ${clean(c.growthRate)}`, {
      x: 4.5, y: 5.0, w: 5.2, h: 0.4, fontSize: 11, fontFace: 'Inter', bold: true,
      color: '166534', fill: { color: 'F0FDF4' }, valign: 'middle',
    })
  }
}

function buildTractionSlide(pptx, c = {}) {
  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  addHeader(slide, 'TRACTION')
  addTitle(slide, 'Early Signals of Product-Market Fit')
  const metrics = (c.metrics || []).slice(0, 3)
  const w = 2.9, gap = 0.2
  metrics.forEach((m, i) => {
    const x = 0.4 + i * (w + gap)
    // Card with accent top border (gradient effect)
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.7, w, h: 1.5, rectRadius: 0.1,
      fill: { color: LIGHT }, line: { color: 'E2E8F0', width: 1 },
    })
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.7, w, h: 0.08,
      fill: { color: ACCENT }, line: { color: ACCENT, width: 0 },
    })
    slide.addText(safe(m.value), {
      x, y: 1.85, w, h: 0.7, fontSize: 26, fontFace: 'Inter', bold: true,
      color: DARK, align: 'center',
    })
    slide.addText(clean(m.label) || '—', {
      x, y: 2.55, w, h: 0.3, fontSize: 10, fontFace: 'Inter',
      color: MUTED, align: 'center', charSpacing: 2,
    })
    if (clean(m.growth)) {
      slide.addText(`▲ ${clean(m.growth)}`, {
        x, y: 2.85, w, h: 0.3, fontSize: 11, fontFace: 'Inter', bold: true,
        color: '10B981', align: 'center',
      })
    }
  })
  // Milestones timeline with dots
  const milestones = (c.milestones || []).filter(m => clean(m.event)).slice(0, 4)
  if (milestones.length > 0) {
    slide.addText('KEY MILESTONES', {
      x: 0.4, y: 3.5, w: 9, h: 0.3,
      fontSize: 9, fontFace: 'Inter', bold: true,
      color: MUTED, charSpacing: 2,
    })
    milestones.forEach((m, i) => {
      slide.addShape(pptx.ShapeType.ellipse, {
        x: 0.4, y: 3.95 + i * 0.35, w: 0.12, h: 0.12,
        fill: { color: ACCENT }, line: { color: ACCENT, width: 0 },
      })
      slide.addText(`${clean(m.date)}  —  ${clean(m.event)}`, {
        x: 0.65, y: 3.85 + i * 0.35, w: 9.0, h: 0.3,
        fontSize: 11, fontFace: 'Inter', color: DARK,
      })
    })
  }
}

function buildTeamSlide(pptx, c = {}) {
  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  addHeader(slide, 'TEAM')
  addTitle(slide, `World-Class Team${c.teamSize ? ` · ${c.teamSize}` : ''}`)
  const founders = (c.founders || []).slice(0, 3)
  const w = 2.9, gap = 0.2
  founders.forEach((f, i) => {
    const x = 0.4 + i * (w + gap)
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.7, w, h: 3.3, rectRadius: 0.1,
      fill: { color: LIGHT }, line: { color: 'E2E8F0', width: 1 },
    })
    slide.addText(clean(f.name) || '—', {
      x: x + 0.2, y: 1.9, w: w - 0.4, h: 0.4,
      fontSize: 16, fontFace: 'Inter', bold: true, color: DARK,
    })
    slide.addText(clean(f.role) || '', {
      x: x + 0.2, y: 2.35, w: w - 0.4, h: 0.3,
      fontSize: 12, fontFace: 'Inter', bold: true, color: ACCENT,
    })
    slide.addText(clean(f.background) || '', {
      x: x + 0.2, y: 2.75, w: w - 0.4, h: 1.4,
      fontSize: 10, fontFace: 'Inter', color: MUTED, valign: 'top',
    })
    if (clean(f.highlight)) {
      slide.addText(`★ ${clean(f.highlight)}`, {
        x: x + 0.2, y: 4.4, w: w - 0.4, h: 0.4,
        fontSize: 10, fontFace: 'Inter', bold: true, color: '6D28D9',
        fill: { color: 'EDE9FE' }, valign: 'middle',
      })
    }
  })
}

function buildBusinessModelSlide(pptx, c = {}) {
  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  addHeader(slide, 'BUSINESS MODEL')
  addTitle(slide, clean(c.model) || 'Business Model')
  const pricing = (c.pricing || []).slice(0, 3)
  pricing.forEach((tier, i) => {
    slide.addText(`${clean(tier.tier)} — ${clean(tier.price)}`, {
      x: 0.4, y: 1.8 + i * 0.7, w: 5.5, h: 0.4,
      fontSize: 14, fontFace: 'Inter', bold: true, color: DARK,
      fill: { color: i === 1 ? 'EDE9FE' : LIGHT }, valign: 'middle',
    })
  })
  const ue = c.unitEconomics || {}
  const ueRows = [
    ['LTV', safe(ue.ltv)], ['CAC', safe(ue.cac)], ['Payback', safe(ue.payback)],
  ]
  ueRows.forEach(([label, val], i) => {
    slide.addText(label, {
      x: 6.5, y: 1.8 + i * 0.85, w: 1.2, h: 0.3,
      fontSize: 10, fontFace: 'Inter', color: MUTED, charSpacing: 2,
    })
    slide.addText(val, {
      x: 6.5, y: 2.1 + i * 0.85, w: 3.2, h: 0.5,
      fontSize: 18, fontFace: 'Inter', bold: true, color: DARK,
    })
  })
}

function buildCompetitionSlide(pptx, c = {}) {
  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  addHeader(slide, 'COMPETITIVE LANDSCAPE')
  addTitle(slide, 'We Win Where It Matters')
  const competitors = (c.competitors || []).slice(0, 4)
  const headers = ['Competitor', 'Their Weakness', 'Our Edge']
  headers.forEach((h, i) => {
    slide.addText(h, {
      x: 0.4 + i * 3.1, y: 1.8, w: 3.0, h: 0.35,
      fontSize: 10, fontFace: 'Inter', bold: true, color: MUTED,
      fill: { color: LIGHT }, valign: 'middle', charSpacing: 2,
    })
  })
  competitors.forEach((comp, row) => {
    const y = 2.2 + row * 0.6
    ;[comp.name, comp.weakness, comp.ourAdvantage].forEach((val, col) => {
      slide.addText(clean(val) || '—', {
        x: 0.4 + col * 3.1, y, w: 3.0, h: 0.5,
        fontSize: 11, fontFace: 'Inter', color: col === 2 ? '10B981' : DARK,
        valign: 'middle',
      })
    })
  })
}

function buildGTMSlide(pptx, c = {}) {
  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  addHeader(slide, 'GO-TO-MARKET')
  addTitle(slide, clean(c.strategy) || 'GTM Strategy')
  const channels = (c.channels || []).slice(0, 4)
  channels.forEach((ch, i) => {
    slide.addText(`${clean(ch.name)}  ·  ${ch.percentage ?? '—'}%`, {
      x: 0.4, y: 1.8 + i * 0.7, w: 9.2, h: 0.4,
      fontSize: 13, fontFace: 'Inter', bold: true, color: DARK,
    })
    if (clean(ch.description)) {
      slide.addText(clean(ch.description), {
        x: 0.6, y: 2.15 + i * 0.7, w: 9.0, h: 0.3,
        fontSize: 10, fontFace: 'Inter', color: MUTED,
      })
    }
  })
}

function buildFinancialsSlide(pptx, c = {}) {
  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  addHeader(slide, 'FINANCIALS')
  addTitle(slide, 'Path to Scale')

  // Top: three current-metric cards
  const metrics = [
    ['Current MRR', safe(c.currentMRR)],
    ['Monthly Burn', safe(c.burnRate)],
    ['Runway', safe(c.runway)],
  ]
  metrics.forEach(([label, val], i) => {
    const x = 0.4 + i * 3.1
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.7, w: 2.9, h: 1.1, rectRadius: 0.08,
      fill: { color: LIGHT }, line: { color: 'E2E8F0', width: 1 },
    })
    slide.addText(label, {
      x, y: 1.8, w: 2.9, h: 0.3, fontSize: 10, fontFace: 'Inter',
      color: MUTED, charSpacing: 2, align: 'center',
    })
    slide.addText(val, {
      x, y: 2.15, w: 2.9, h: 0.6, fontSize: 22, fontFace: 'Inter', bold: true,
      color: DARK, align: 'center',
    })
  })

  // Bottom: projected MRR bar chart
  const projections = (c.projections || []).slice(0, 4)
  if (projections.length > 0) {
    // Parse out numeric values from strings like "$150K", "$500K" for the chart
    const parseVal = s => {
      if (!s) return 0
      const m = String(s).match(/([\d.]+)\s*([kKmMbB]?)/)
      if (!m) return 0
      const n = parseFloat(m[1]) || 0
      const mul = m[2]?.toLowerCase() === 'm' ? 1000 : m[2]?.toLowerCase() === 'b' ? 1000000 : 1
      return n * mul
    }
    const chartData = [{
      name: 'MRR',
      labels: projections.map(p => clean(p.period) || ''),
      values: projections.map(p => parseVal(p.mrr)),
    }]
    slide.addChart(pptx.ChartType.bar, chartData, {
      x: 0.4, y: 3.0, w: 9.2, h: 2.4,
      barDir: 'col',
      chartColors: [ACCENT],
      showTitle: true,
      title: 'Projected MRR Growth (K)',
      titleFontSize: 11, titleColor: MUTED, titleFontFace: 'Inter',
      catAxisLabelFontSize: 9, valAxisLabelFontSize: 9,
      catAxisLabelColor: MUTED, valAxisLabelColor: MUTED,
      showValue: true, dataLabelFontSize: 9, dataLabelColor: DARK,
    })
  }
}

function buildAskSlide(pptx, c = {}) {
  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  addHeader(slide, 'THE ASK')

  // Big number on the left
  slide.addText(safe(c.amount), {
    x: 0.4, y: 1.0, w: 5, h: 1.2,
    fontSize: 52, fontFace: 'Inter', bold: true, color: ACCENT,
  })
  if (clean(c.valuation)) {
    slide.addText(`at ${clean(c.valuation)} pre-money`, {
      x: 0.4, y: 2.15, w: 5, h: 0.4, fontSize: 13, fontFace: 'Inter', color: MUTED,
    })
  }

  // Use of funds as horizontal progress bars on the left
  const funds = (c.useOfFunds || []).slice(0, 4)
  if (funds.length > 0) {
    slide.addText('USE OF FUNDS', {
      x: 0.4, y: 2.8, w: 5, h: 0.3, fontSize: 9, fontFace: 'Inter', bold: true,
      color: MUTED, charSpacing: 2,
    })
    funds.forEach((f, i) => {
      const y = 3.15 + i * 0.55
      const pct = Math.max(0, Math.min(100, parseInt(f.percentage) || 0))
      slide.addText(`${clean(f.category)}`, {
        x: 0.4, y, w: 3.5, h: 0.25, fontSize: 11, fontFace: 'Inter', color: DARK,
      })
      slide.addText(`${pct}%${clean(f.amount) ? ` · ${clean(f.amount)}` : ''}`, {
        x: 3.4, y, w: 2.0, h: 0.25, fontSize: 11, fontFace: 'Inter', bold: true,
        color: ACCENT, align: 'right',
      })
      // Progress bar background
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.4, y: y + 0.28, w: 5.0, h: 0.10,
        fill: { color: 'F1F5F9' }, line: { color: 'F1F5F9', width: 0 },
      })
      // Progress bar fill
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.4, y: y + 0.28, w: 5.0 * (pct / 100), h: 0.10,
        fill: { color: ACCENT }, line: { color: ACCENT, width: 0 },
      })
    })
  }

  // Milestones in a card on the right
  const milestones = (c.milestones || []).filter(m => clean(m)).slice(0, 4)
  if (milestones.length > 0) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.0, y: 1.0, w: 3.7, h: 4.4, rectRadius: 0.1,
      fill: { color: 'F0FDF4' }, line: { color: 'BBF7D0', width: 1 },
    })
    slide.addText('THIS ROUND UNLOCKS', {
      x: 6.2, y: 1.2, w: 3.4, h: 0.3, fontSize: 9, fontFace: 'Inter', bold: true,
      color: '047857', charSpacing: 2,
    })
    milestones.forEach((m, i) => {
      slide.addText(`✓ ${clean(m)}`, {
        x: 6.2, y: 1.65 + i * 0.85, w: 3.4, h: 0.75,
        fontSize: 11, fontFace: 'Inter', color: '047857', valign: 'top',
      })
    })
  }
}

// Fallback: dump structured content as readable bullets
function buildGenericSlide(pptx, slide) {
  const s = pptx.addSlide()
  s.background = { color: 'FFFFFF' }
  addHeader(s, (slide.type || 'SLIDE').toUpperCase().replace(/_/g, ' '))
  addTitle(s, slide.title || '')
  const lines = []
  const walk = (obj, depth = 0) => {
    if (!obj) return
    if (typeof obj === 'string') { if (clean(obj)) lines.push(`${'  '.repeat(depth)}• ${clean(obj)}`); return }
    if (Array.isArray(obj)) { obj.forEach(x => walk(x, depth)); return }
    Object.entries(obj).forEach(([k, v]) => {
      if (typeof v === 'string' && clean(v)) lines.push(`${'  '.repeat(depth)}${k}: ${clean(v)}`)
      else if (typeof v === 'object') walk(v, depth + 1)
    })
  }
  walk(slide.content)
  s.addText(lines.slice(0, 14).join('\n'), {
    x: 0.4, y: 1.6, w: 9.2, h: 3.8, fontSize: 11, fontFace: 'Inter',
    color: DARK, valign: 'top',
  })
}

const BUILDERS = {
  cover: buildCoverSlide,
  problem: buildProblemSlide,
  solution: buildSolutionSlide,
  product: buildProductSlide,
  market: buildMarketSlide,
  traction: buildTractionSlide,
  team: buildTeamSlide,
  business_model: buildBusinessModelSlide,
  competition: buildCompetitionSlide,
  gtm: buildGTMSlide,
  financials: buildFinancialsSlide,
  ask: buildAskSlide,
}

export async function exportDeckAsPptx(deck) {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE' // 13.333 x 7.5 → we use 10 x 5.625
  pptx.defineLayout({ name: 'PD', width: 10, height: 5.625 })
  pptx.layout = 'PD'
  pptx.title = deck.company || 'Pitch Deck'
  pptx.author = deck.company || 'PitchDeck AI'

  for (const slide of deck.slides || []) {
    const builder = BUILDERS[slide.type] || ((p, c) => buildGenericSlide(p, slide))
    try {
      builder(pptx, slide.content || {})
    } catch (err) {
      // If a typed builder blows up (unusual content shape), fall back
      console.warn(`PPTX builder failed for ${slide.type}, using generic:`, err)
      buildGenericSlide(pptx, slide)
    }
  }

  const filename = `${(deck.company || 'pitch-deck').replace(/\s+/g, '-').toLowerCase()}.pptx`
  await pptx.writeFile({ fileName: filename })
}
