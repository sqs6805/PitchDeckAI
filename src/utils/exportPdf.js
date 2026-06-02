// Programmatic PDF export.
//
// We deliberately avoid window.print(): browsers disagree wildly on whether
// they honor CSS @page orientation (Safari ignores it entirely and always
// prints portrait), which made the printed deck come out inverted. Instead we
// rasterize each slide ourselves and assemble a true landscape 16:9 PDF with
// jsPDF — identical output in every browser, no print dialog, full-bleed.
//
// Rasterization uses an SVG <foreignObject>, which renders the HTML with the
// *browser's own* layout engine. That's the key difference from html2canvas
// (which re-implements layout and mis-handled our line-clamp / large-text /
// gap CSS, causing overlapping text). foreignObject output matches the
// on-screen viewer pixel-for-pixel.

import jsPDF from 'jspdf'

// The slides are authored on a fixed 1280×720 (16:9) canvas.
const SLIDE_W = 1280
const SLIDE_H = 720

/** Concatenate every same-origin stylesheet so the cloned HTML keeps its
 *  Tailwind/utility styling once it's detached inside the SVG. */
function collectCss() {
  let css = ''
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) css += rule.cssText + '\n'
    } catch {
      /* cross-origin sheet — not readable, skip */
    }
  }
  return css
}

/** Render a DOM node to a high-res canvas using SVG foreignObject. */
async function rasterize(node, css, scale = 2) {
  const clone = node.cloneNode(true)
  clone.style.width = `${SLIDE_W}px`
  clone.style.height = `${SLIDE_H}px`
  clone.style.transform = 'none'
  clone.style.margin = '0'

  const xhtml = new XMLSerializer().serializeToString(clone)
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SLIDE_W}" height="${SLIDE_H}">` +
      `<foreignObject x="0" y="0" width="${SLIDE_W}" height="${SLIDE_H}">` +
        `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${SLIDE_W}px;height:${SLIDE_H}px;background:#fff;">` +
          `<style>${css}</style>` +
          xhtml +
        `</div>` +
      `</foreignObject>` +
    `</svg>`

  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  const img = new Image()
  img.width = SLIDE_W
  img.height = SLIDE_H
  await new Promise((res, rej) => {
    img.onload = res
    img.onerror = () => rej(new Error('Slide rasterization failed'))
    img.src = url
  })
  try { await img.decode() } catch { /* some browsers resolve onload before decode */ }

  const canvas = document.createElement('canvas')
  canvas.width = SLIDE_W * scale
  canvas.height = SLIDE_H * scale
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.drawImage(img, 0, 0, SLIDE_W, SLIDE_H)
  return canvas
}

/**
 * Build and download a PDF of the whole deck.
 * Captures the off-screen `.print-only` slide nodes that DeckViewer renders
 * (portaled to <body>), so the PDF is pixel-identical to the viewer.
 *
 * @param {object} deck  the deck object (used only for the file name)
 */
export async function exportDeckAsPdf(deck) {
  const container = document.querySelector('.print-only')
  const inners = container ? [...container.querySelectorAll('.print-slide-inner')] : []
  if (!inners.length) throw new Error('No slides found to export.')

  // The print nodes live under `display:none` and are only sized inside
  // @media print. Lay them out off-screen at full size so they have geometry.
  const saved = {
    display: container.style.display,
    position: container.style.position,
    left: container.style.left,
    top: container.style.top,
    zIndex: container.style.zIndex,
    pointerEvents: container.style.pointerEvents,
  }
  container.style.display = 'block'
  container.style.position = 'fixed'
  container.style.left = '-100000px'
  container.style.top = '0'
  container.style.zIndex = '-1'
  container.style.pointerEvents = 'none'

  const innerSaved = inners.map(el => ({ el, w: el.style.width, h: el.style.height, t: el.style.transform }))
  inners.forEach(el => {
    el.style.width = `${SLIDE_W}px`
    el.style.height = `${SLIDE_H}px`
    el.style.transform = 'none'
  })

  try {
    const css = collectCss()

    // Custom landscape page that is exactly 16:9, sized in px so the slide
    // image maps to the page 1:1 — full-bleed, correct orientation everywhere.
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [SLIDE_W, SLIDE_H],
      compress: true,
    })

    for (let i = 0; i < inners.length; i++) {
      const canvas = await rasterize(inners[i], css, 2)
      const img = canvas.toDataURL('image/jpeg', 0.92)
      if (i > 0) pdf.addPage([SLIDE_W, SLIDE_H], 'landscape')
      pdf.addImage(img, 'JPEG', 0, 0, SLIDE_W, SLIDE_H)
    }

    const name = (deck?.company || 'pitch-deck').replace(/[^\w.-]+/g, '_')
    pdf.save(`${name}.pdf`)
  } finally {
    container.style.display = saved.display
    container.style.position = saved.position
    container.style.left = saved.left
    container.style.top = saved.top
    container.style.zIndex = saved.zIndex
    container.style.pointerEvents = saved.pointerEvents
    innerSaved.forEach(({ el, w, h, t }) => {
      el.style.width = w
      el.style.height = h
      el.style.transform = t
    })
  }
}
