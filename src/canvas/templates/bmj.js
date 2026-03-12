/**
 * BMJ-style Template — 1024 × 1024 px
 *
 * Zone layout:
 *   Header        y=0    h=100
 *   Summary       y=100  h=195
 *   Study Design  y=295  h=106
 *   Population    y=401  h=98
 *   Comparison    y=499  h=120
 *   SoF label     y=619  h=38
 *   SoF table     y=657  dynamic (36 + n*68)
 *   Custom sects  dynamic
 *   Footer        y=960  h=64
 */

import { buildSofTable, sofTableHeight } from '../panels/SofTable.js'

export const BMJ_W = 1024
export const BMJ_H = 1024

const BG_PAGE      = '#E4EEF5'
const BG_SECTION_A = '#EEF5FA'
const BG_SECTION_B = '#E6F0F7'
const BG_HEADER_L  = '#1A3A5C'
const BG_HEADER_R  = '#F5F9FC'
const BG_INTERV    = '#2A8B85'
const BG_CONTROL   = '#B5337A'
const BG_FOOTER    = '#D4E3ED'

const TEAL       = '#1A7FA8'
const TEXT_DARK  = '#1A1A2E'
const TEXT_MID   = '#4A5568'
const TEXT_WHITE = '#FFFFFF'
const BORDER_CLR = '#B8CCDA'

const PAD    = 22   // standard content left-padding
const SEC_RX = 6    // section card border-radius

/** Font stacks keyed by selector value */
const FONT_STACKS = {
  calibri:  '"Carlito", Calibri, Arial, sans-serif',
  times:    '"Times New Roman", Times, Georgia, serif',
  georgia:  'Georgia, "Times New Roman", serif',
  inter:    'Inter, Arial, sans-serif',
  arial:    'Arial, Helvetica, sans-serif',
}

const ZONES = {
  header:      { y: 0,   h: 100 },
  summary:     { y: 100, h: 195 },
  studyDesign: { y: 295, h: 106 },
  population:  { y: 401, h: 98  },
  comparison:  { y: 499, h: 120 },
  sofLabel:    { y: 619, h: 38  },
  sofTable:    { y: 657          },
  footer:      { y: 960, h: 64  },
}

export async function buildBmjTemplate(fabric, state, palette) {
  const objects = []
  const W = BMJ_W

  const FONT = FONT_STACKS[state.font] || FONT_STACKS.calibri

  const p   = palette || {}
  const BG_PAGE_C      = p.pageBg      || '#E4EEF5'
  const BG_SECTION_A_C = p.sectionA    || '#EEF5FA'
  const BG_SECTION_B_C = p.sectionB    || '#E6F0F7'
  const BG_HEADER_L_C  = p.main        || '#1A3A5C'
  const BG_HEADER_R_C  = p.mainLight   || '#F5F9FC'
  const BG_INTERV_C    = p.intervention || '#2A8B85'
  const BG_CONTROL_C   = p.control     || '#B5337A'
  const BG_FOOTER_C    = p.footerBg    || '#D4E3ED'
  const BORDER_C       = p.borderColor || '#B8CCDA'

  // PAGE BACKGROUND
  objects.push(plainRect(fabric, 0, 0, W, BMJ_H, BG_PAGE_C))

  // ── 1. HEADER ──
  const { y: hy, h: hh } = ZONES.header
  const BAND_W = 220

  objects.push(plainRect(fabric, 0, hy, BAND_W, hh, BG_HEADER_L_C))
  const journalText = state.journal || 'Journal'
  const journalFontSize = Math.min(29, Math.max(14, Math.floor(190 / Math.max(1, journalText.length * 0.58))))
  objects.push(new fabric.Text(journalText, {
    left: PAD, top: hy + hh / 2 - 22,
    fontSize: journalFontSize, fontFamily: FONT, fontWeight: '700',
    fill: TEXT_WHITE, selectable: false, evented: false,
  }))
  objects.push(new fabric.Text('Visual Abstract', {
    left: PAD, top: hy + hh / 2 + 10,
    fontSize: 16, fontFamily: FONT, fontWeight: '400',
    fill: 'rgba(255,255,255,0.70)', selectable: false, evented: false,
  }))

  objects.push(plainRect(fabric, BAND_W, hy, W - BAND_W, hh, BG_HEADER_R_C))
  objects.push(new fabric.Textbox(state.title || 'Paper title goes here', {
    left: BAND_W + PAD, top: hy + 10,
    width: W - BAND_W - 30,
    fontSize: 33, fontFamily: FONT, fontWeight: '700',
    fill: TEXT_DARK, lineHeight: 1.2,
    selectable: false, evented: false,
  }))

  // ── 2. SUMMARY ──
  const { y: sy, h: sh } = ZONES.summary
  objects.push(secCard(fabric, sy, sh, BG_SECTION_A_C, BORDER_C))
  objects.push(new fabric.Text('📋  Summary', {
    left: PAD + 4, top: sy + 18,
    fontSize: 22, fontFamily: FONT, fontWeight: '700',
    fill: '#1A3A5C', selectable: false, evented: false,
  }))
  objects.push(new fabric.Textbox(state.conclusion || 'Summary of main findings goes here.', {
    left: PAD + 4, top: sy + 52,
    width: W - (PAD + 4) - 12,
    fontSize: 27, fontFamily: FONT, fontWeight: '400',
    fill: TEXT_DARK, lineHeight: 1.15,
    selectable: false, evented: false,
  }))

  // ── 3. STUDY DESIGN ──
  const { y: ddy, h: ddh } = ZONES.studyDesign
  // Right image column (spans studyDesign + population) when image present
  const hasPopImg  = !!state.populationImage
  const txtColW    = hasPopImg ? 490 : (W - PAD * 2 - 4)  // text area width
  const imgSlotX   = PAD + 4 + txtColW + 12
  const imgSlotW   = W - imgSlotX - 8
  const imgSlotY   = ddy + 4
  const imgSlotH   = ZONES.studyDesign.h + ZONES.population.h - 8

  objects.push(secCard(fabric, ddy, ddh, BG_SECTION_B_C, BORDER_C))
  // Icon: document base + magnifying glass overlaid
  objects.push(new fabric.Text('📄', {
    left: PAD + 4, top: ddy + 11,
    fontSize: 23, fontFamily: FONT,
    fill: '#1A3A5C', selectable: false, evented: false,
  }))
  objects.push(new fabric.Text('🔍', {
    left: PAD + 4 + 10, top: ddy + 18,
    fontSize: 16, fontFamily: FONT,
    fill: '#1A3A5C', selectable: false, evented: false,
  }))
  objects.push(new fabric.Text('Study design', {
    left: PAD + 4 + 30, top: ddy + 14,
    fontSize: 23, fontFamily: FONT, fontWeight: '700',
    fill: '#1A3A5C', selectable: false, evented: false,
  }))

  const line2Parts = []
  if (state.nStudies)        line2Parts.push(`${state.nStudies} trials`)
  if (state.studyDesignDetail) line2Parts.push(state.studyDesignDetail)
  const line2 = line2Parts.join(', ')
  const designLine = line2
    ? `${state.studyDesignType || 'Systematic review and meta-analysis'}\n${line2}`
    : (state.studyDesignType || 'Systematic review and meta-analysis')

  objects.push(new fabric.Textbox(designLine, {
    left: PAD + 4, top: ddy + 40,
    width: txtColW,
    fontSize: 23, fontFamily: FONT, fontWeight: '400',
    fill: TEXT_DARK, lineHeight: 1.25,
    selectable: false, evented: false,
  }))

  // ── 4. POPULATION ──
  const { y: popy, h: poph } = ZONES.population
  objects.push(secCard(fabric, popy, poph, BG_SECTION_A_C, BORDER_C))
  objects.push(new fabric.Text('👥  Population', {
    left: PAD + 4, top: popy + 14,
    fontSize: 23, fontFamily: FONT, fontWeight: '700',
    fill: '#1A3A5C', selectable: false, evented: false,
  }))
  objects.push(new fabric.Textbox(state.population || '—', {
    left: PAD + 4, top: popy + 40,
    width: txtColW,
    fontSize: 23, fontFamily: FONT, fontWeight: '400',
    fill: TEXT_DARK, lineHeight: 1.25,
    selectable: false, evented: false,
  }))
  if (state.populationDetail) {
    objects.push(new fabric.Text(state.populationDetail, {
      left: PAD + 4, top: popy + 66,
      fontSize: 21, fontFamily: FONT, fontWeight: '400',
      fill: TEXT_MID, selectable: false, evented: false,
    }))
  }

  // Population image (spans study design + population right column)
  if (hasPopImg) {
    try {
      const img = await fabric.Image.fromURL(state.populationImage)
      fitImage(fabric, img, imgSlotX, imgSlotY, imgSlotW, imgSlotH,
               state.populationImageFit || 'contain')
      img.set({ left: img.left + (state.populationImageDx || 0), top: img.top + (state.populationImageDy || 0) })
      objects.push(img)
    } catch (e) { console.warn('Population image load failed', e) }
  }

  // ── 5. COMPARISON ──
  const { y: cy, h: ch } = ZONES.comparison
  // Section card (background only; border overlay added after colored boxes)
  objects.push(plainRect(fabric, 0, cy, W, ch, BG_SECTION_B_C))

  // Colored boxes span full section height
  const BOX_L  = 6
  const BOX_T  = cy + 4
  const BOX_H  = ch - 8
  const TOT_W  = W - 12
  const IW     = Math.floor(TOT_W * 0.50)
  const CW     = TOT_W - IW

  // Intervention box
  objects.push(new fabric.Rect({
    left: BOX_L, top: BOX_T, width: IW, height: BOX_H,
    fill: BG_INTERV_C, rx: 5, ry: 5,
    selectable: false, evented: false,
  }))
  objects.push(new fabric.Text('Intervention', {
    left: BOX_L + 14, top: BOX_T + 10,
    fontSize: 23, fontFamily: FONT, fontWeight: '700',
    fill: TEXT_WHITE, selectable: false, evented: false,
  }))

  const hasIntervImg = !!state.interventionImage
  const intervImgW   = hasIntervImg ? Math.floor(IW * 0.40) : 0
  const intervTxtW   = IW - 28 - intervImgW - (hasIntervImg ? 8 : 0)
  const intervLabel  = state.interventionAbbr
    ? `${state.interventionAbbr}\n${state.intervention || ''}`
    : (state.intervention || '—')

  objects.push(new fabric.Textbox(intervLabel, {
    left: BOX_L + 14, top: BOX_T + 40,
    width: intervTxtW,
    fontSize: 23, fontFamily: FONT, fontWeight: '400',
    fill: TEXT_WHITE, lineHeight: 1.25,
    selectable: false, evented: false,
  }))

  if (hasIntervImg) {
    const ix = BOX_L + IW - intervImgW - 8
    const iy = BOX_T + 8
    try {
      const img = await fabric.Image.fromURL(state.interventionImage)
      fitImage(fabric, img, ix, iy, intervImgW, BOX_H - 16,
               state.interventionImageFit || 'contain')
      img.set({ left: img.left + (state.interventionImageDx || 0), top: img.top + (state.interventionImageDy || 0) })
      objects.push(img)
    } catch (e) { console.warn('Intervention image load failed', e) }
  }

  // Control box
  const CX = BOX_L + IW
  objects.push(new fabric.Rect({
    left: CX, top: BOX_T, width: CW, height: BOX_H,
    fill: BG_CONTROL_C, rx: 5, ry: 5,
    selectable: false, evented: false,
  }))
  objects.push(new fabric.Text('Control', {
    left: CX + 14, top: BOX_T + 10,
    fontSize: 23, fontFamily: FONT, fontWeight: '700',
    fill: TEXT_WHITE, selectable: false, evented: false,
  }))

  const hasCtrlImg = !!state.controlImage
  const ctrlImgW   = hasCtrlImg ? Math.floor(CW * 0.40) : 0
  const ctrlTxtW   = CW - 28 - ctrlImgW - (hasCtrlImg ? 8 : 0)

  objects.push(new fabric.Textbox(state.comparator || '—', {
    left: CX + 14, top: BOX_T + 40,
    width: ctrlTxtW,
    fontSize: 23, fontFamily: FONT, fontWeight: '400',
    fill: TEXT_WHITE, lineHeight: 1.25,
    selectable: false, evented: false,
  }))

  if (hasCtrlImg) {
    const ix = CX + CW - ctrlImgW - 8
    const iy = BOX_T + 8
    try {
      const img = await fabric.Image.fromURL(state.controlImage)
      fitImage(fabric, img, ix, iy, ctrlImgW, BOX_H - 16,
               state.controlImageFit || 'contain')
      img.set({ left: img.left + (state.controlImageDx || 0), top: img.top + (state.controlImageDy || 0) })
      objects.push(img)
    } catch (e) { console.warn('Control image load failed', e) }
  }

  // Border overlay on top of colored boxes
  objects.push(secBorderOnly(fabric, cy, ch, BORDER_C))

  // ── 6. OUTCOMES LABEL ──
  const { y: oly, h: olh } = ZONES.sofLabel
  objects.push(secCard(fabric, oly, olh, BG_SECTION_A_C, BORDER_C))
  objects.push(new fabric.Text('📊  Outcomes', {
    left: PAD + 4, top: oly + 8,
    fontSize: 22, fontFamily: FONT, fontWeight: '700',
    fill: '#1A3A5C', selectable: false, evented: false,
  }))

  // ── 6b. SoF TABLE ──
  const sty  = ZONES.sofTable.y
  const sofH = sofTableHeight(state.outcomes || [])
  objects.push(plainRect(fabric, 0, sty, W, sofH, '#FFFFFF'))
  objects.push(...buildSofTable(fabric, { x: 0, y: sty, w: W, h: sofH }, state.outcomes || [], FONT, palette))

  // ── 7. CUSTOM SECTIONS + KEY LIMITATIONS ──
  const footerY    = ZONES.footer.y
  const customSecs = state.customSections || []
  const afterSof   = sty + sofH
  const hasLimBmj  = !!state.keyLimitations
  const LIM_H_BMJ  = hasLimBmj ? 48 : 0

  // Custom sections occupy the space above Key Limitations
  if (customSecs.length > 0 && afterSof < footerY - LIM_H_BMJ) {
    const secH = Math.floor((footerY - LIM_H_BMJ - afterSof) / customSecs.length)
    customSecs.forEach((cs, i) => {
      const secY = afterSof + i * secH
      const bg   = i % 2 === 0 ? BG_SECTION_A_C : BG_SECTION_B_C
      objects.push(secCard(fabric, secY, secH, bg, BORDER_C))
      objects.push(new fabric.Text(cs.name || `Section ${i + 1}`, {
        left: PAD + 4, top: secY + 12,
        fontSize: 20, fontFamily: FONT, fontWeight: '700',
        fill: TEXT_DARK, selectable: false, evented: false,
      }))
      if (cs.content) {
        objects.push(new fabric.Textbox(cs.content, {
          left: PAD + 4, top: secY + 36,
          width: W - (PAD + 4) * 2,
          fontSize: 18, fontFamily: FONT, fontWeight: '400',
          fill: TEXT_MID, lineHeight: 1.35,
          selectable: false, evented: false,
        }))
      }
    })
  }

  // Key Limitations section just above footer
  if (hasLimBmj) {
    const limY = footerY - LIM_H_BMJ
    objects.push(secCard(fabric, limY, LIM_H_BMJ, '#FFF8EC', BORDER_C))
    objects.push(new fabric.Textbox(`\u26A0\uFE0F  Key limitations: ${state.keyLimitations}`, {
      left: PAD + 4, top: limY + 10,
      width: W - (PAD + 4) * 2,
      fontSize: 16, fontFamily: FONT, fontWeight: '400',
      fill: TEXT_DARK, lineHeight: 1.25,
      selectable: false, evented: false,
    }))
  }

  // ── 8. FOOTER ──
  const { y: fy, h: fh } = ZONES.footer
  objects.push(plainRect(fabric, 0, fy, W, fh, BG_FOOTER_C))

  // Left: citation first, then DOI below
  const authorsPart = state.authors || ''
  const journalPart = state.journal || ''
  const yearPart    = state.year    || ''
  const authorsTrimmed = authorsPart.replace(/\.$/, '')  // remove trailing period to avoid ".."
  const citParts    = [authorsTrimmed, journalPart, yearPart].filter(Boolean)
  const citation    = citParts.join('. ')
  const doiText  = state.doi ? `https://doi.org/${state.doi}` : ''

  if (citation) {
    objects.push(new fabric.Textbox(citation, {
      left: PAD, top: fy + 10,
      width: 700,
      fontSize: 20, fontFamily: FONT, fontWeight: '400',
      fill: TEXT_MID,
      selectable: false, evented: false,
    }))
  }
  if (doiText) {
    objects.push(new fabric.Text(doiText, {
      left: PAD, top: fy + (citation ? 30 : fh / 2 - 7),
      fontSize: 20, fontFamily: FONT, fontWeight: '400',
      fill: TEAL, selectable: false, evented: false,
    }))
  }

  // Right: Created by
  if (state.creatorName) {
    objects.push(new fabric.Text(
      `Created by ${state.creatorName}, with yukifurukawa.jp/va`, {
        left: W - PAD, top: fy + fh / 2 - 7,
        fontSize: 19, fontFamily: FONT, fontWeight: '400',
        fill: TEXT_MID, originX: 'right',
        selectable: false, evented: false,
      }
    ))
  }

  return objects
}

// ── Helpers ──

function plainRect(fabric, x, y, w, h, fill, rx = 0) {
  return new fabric.Rect({
    left: x, top: y, width: w, height: h,
    fill, rx, ry: rx,
    selectable: false, evented: false,
  })
}

/** Section card: filled rounded rect with border */
function secCard(fabric, y, h, fill, stroke = BORDER_CLR) {
  return new fabric.Rect({
    left: 4, top: y + 2,
    width: BMJ_W - 8, height: h - 4,
    fill,
    stroke, strokeWidth: 1,
    rx: SEC_RX, ry: SEC_RX,
    selectable: false, evented: false,
  })
}

/** Border-only overlay (transparent fill) */
function secBorderOnly(fabric, y, h, stroke = BORDER_CLR) {
  return new fabric.Rect({
    left: 4, top: y + 2,
    width: BMJ_W - 8, height: h - 4,
    fill: 'transparent',
    stroke, strokeWidth: 1,
    rx: SEC_RX, ry: SEC_RX,
    selectable: false, evented: false,
  })
}

/**
 * Scale and position a fabric Image to fit within a slot.
 * mode='contain': object-fit contain (full image visible, may letterbox)
 * mode='cover':   object-fit cover (fills slot, may crop edges)
 */
function fitImage(fabric, img, x, y, w, h, mode = 'contain') {
  const scale = mode === 'cover'
    ? Math.max(w / img.width, h / img.height)
    : Math.min(w / img.width, h / img.height)
  const scaledW = img.width * scale
  const scaledH = img.height * scale
  img.set({
    left: x + (w - scaledW) / 2,
    top:  y + (h - scaledH) / 2,
    scaleX: scale, scaleY: scale,
    selectable: false, evented: false,
  })
  if (mode === 'cover') {
    img.clipPath = new fabric.Rect({
      left: x, top: y, width: w, height: h,
      absolutePositioned: true,
    })
  }
}
