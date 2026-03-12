/**
 * JAMA-style Visual Abstract Template — 1200 × 675 px (16:9)
 *
 * Zone layout:
 *   Header        y=0    h=70   (JAMA logo + left crimson stripe)
 *   Title/Summary y=70   h=130  (TITLE row + SUMMARY row)
 *   Main grid     y=200  h=415  (3-column section, beige background)
 *     ├─ Left  (x=10,  w=272):  POPULATION / SETTINGS/DESIGN
 *     ├─ Mid   (x=283, w=442):  INTERVENTION / PRIMARY OUTCOME
 *     └─ Right (x=726, w=464):  FINDINGS (donut charts or effect size)
 *   Footer        y=615  h=60   (citation)
 */

import { GRADE_COLORS } from '../../data/palettes.js'
import { buildSofTableCompact } from '../panels/SofTable.js'

export const JAMA_W = 1200
export const JAMA_H = 675

// ── Color palette ──
const CRIMSON    = '#C8102E'
const AMBER      = '#E8A020'
const BG_BEIGE   = '#F5F2EC'
const BG_WHITE   = '#FFFFFF'
const BG_FOOTER  = '#EAE8E4'
const COLOR_DARK = '#1A1A1A'
const COLOR_MID  = '#4A5568'
const COLOR_GRAY = '#9CA3AF'
const RING_GRAY  = '#D1D5DB'
const STRIPE_W   = 9
const PAD        = 14

// ── Column definitions ──
const COLS = {
  L: { x: 10,  w: 272 },
  M: { x: 283, w: 442 },
  R: { x: 726, w: 464 },
}

// ── Zone definitions ──
const ZONES = {
  header: { y: 0,   h: 70  },
  qc:     { y: 70,  h: 130 },
  main:   { y: 200, h: 415 },
  footer: { y: 615, h: 60  },
}

const FONT_STACKS = {
  calibri: '"Carlito", Calibri, Arial, sans-serif',
  times:   '"Times New Roman", Times, Georgia, serif',
  georgia: 'Georgia, "Times New Roman", serif',
  inter:   'Inter, Arial, sans-serif',
  arial:   'Arial, Helvetica, sans-serif',
}

export async function buildJamaTemplate(fabric, state, palette) {
  const objects = []
  const W = JAMA_W
  const FONT = FONT_STACKS[state.font] || FONT_STACKS.calibri

  const p = palette || {}
  const ACCENT     = p.main         || '#C8102E'
  const INTERV_COL = p.intervention || '#2A8B85'
  const CTRL_COL   = p.control      || '#B5337A'

  // ── PAGE BACKGROUND ──
  objects.push(plainRect(fabric, 0, 0, W, JAMA_H, BG_WHITE))

  // ── LEFT CRIMSON STRIPE (full height) ──
  objects.push(plainRect(fabric, 0, 0, STRIPE_W, JAMA_H, ACCENT))

  // ── 1. HEADER ──
  const { y: hy, h: hh } = ZONES.header

  objects.push(new fabric.Text(state.journal || 'Journal', {
    left: STRIPE_W + PAD, top: hy + Math.floor((hh - 30) / 2),
    fontSize: 26, fontFamily: FONT, fontWeight: '700',
    fill: COLOR_DARK, selectable: false, evented: false,
  }))

  // Study design badge (right side)
  if (state.studyDesignType) {
    objects.push(new fabric.Text(state.studyDesignType, {
      left: W - PAD * 6, top: hy + Math.floor(hh / 2) - 10,
      fontSize: 19, fontFamily: FONT, fontWeight: '600',
      fill: COLOR_MID, originX: 'right',
      selectable: false, evented: false,
    }))
  }

  // Header bottom border
  objects.push(new fabric.Line([STRIPE_W, hy + hh, W, hy + hh], {
    stroke: '#E0DDD8', strokeWidth: 1,
    selectable: false, evented: false,
  }))

  // ── 2. TITLE / SUMMARY ──
  const { y: qy } = ZONES.qc
  const ROW1_H = 65
  const ROW1_Y = qy
  const ROW2_Y = qy + ROW1_H

  // TITLE row
  objects.push(new fabric.Text('TITLE', {
    left: STRIPE_W + PAD, top: ROW1_Y + 15,
    fontSize: 18, fontFamily: FONT, fontWeight: '700',
    fill: ACCENT, selectable: false, evented: false,
  }))
  objects.push(new fabric.Textbox(state.title || 'Paper title', {
    left: STRIPE_W + PAD + 100, top: ROW1_Y + 10,
    width: W - STRIPE_W - PAD - 100 - PAD,
    fontSize: 25, fontFamily: FONT, fontWeight: '400',
    fill: COLOR_DARK, lineHeight: 1.2,
    selectable: false, evented: false,
  }))

  // Divider between rows
  objects.push(new fabric.Line([STRIPE_W, ROW2_Y, W, ROW2_Y], {
    stroke: '#E0DDD8', strokeWidth: 1,
    selectable: false, evented: false,
  }))

  // SUMMARY row
  objects.push(new fabric.Text('SUMMARY', {
    left: STRIPE_W + PAD, top: ROW2_Y + 14,
    fontSize: 18, fontFamily: FONT, fontWeight: '700',
    fill: ACCENT, selectable: false, evented: false,
  }))
  objects.push(new fabric.Textbox(state.conclusion || 'Key finding / conclusion goes here.', {
    left: STRIPE_W + PAD + 100, top: ROW2_Y + 8,
    width: W - STRIPE_W - PAD - 100 - PAD,
    fontSize: 19, fontFamily: FONT, fontWeight: '400',
    fill: COLOR_DARK, lineHeight: 1.25,
    selectable: false, evented: false,
  }))

  // ── 3. MAIN SECTION ──
  const { y: my, h: mh } = ZONES.main

  // Beige background
  objects.push(plainRect(fabric, 0, my, W, mh, BG_BEIGE))

  {
    // 3-column layout (always)

    // Column divider lines
    objects.push(new fabric.Line([COLS.M.x, my, COLS.M.x, my + mh], {
      stroke: '#C8BEB5', strokeWidth: 1,
      selectable: false, evented: false,
    }))
    objects.push(new fabric.Line([COLS.R.x, my, COLS.R.x, my + mh], {
      stroke: '#C8BEB5', strokeWidth: 1,
      selectable: false, evented: false,
    }))

    // ── LEFT COLUMN ──
    const LX = COLS.L.x + PAD
    const LW = COLS.L.w - PAD * 2

    objects.push(sectionLabel(fabric, FONT, LX, my + 12, 'POPULATION', ACCENT))

    const popY = my + 32
    if (state.population) {
      objects.push(new fabric.Textbox(state.population, {
        left: LX, top: popY,
        width: LW,
        fontSize: 16, fontFamily: FONT, fontWeight: '700',
        fill: COLOR_DARK, lineHeight: 1.2,
        selectable: false, evented: false,
      }))
    }
    if (state.populationDetail) {
      objects.push(new fabric.Textbox(state.populationDetail, {
        left: LX, top: popY + 44,
        width: LW,
        fontSize: 13, fontFamily: FONT, fontWeight: '400',
        fill: COLOR_MID, lineHeight: 1.35,
        selectable: false, evented: false,
      }))
    }

    // SETTINGS/DESIGN sub-section
    const settingsDivY = my + 277

    // Population image
    if (state.populationImage) {
      try {
        const img = await fabric.Image.fromURL(state.populationImage)
        fitImage(fabric, img, LX, popY + 105, LW, settingsDivY - popY - 110, state.populationImageFit || 'contain')
        img.set({ left: img.left + (state.populationImageDx || 0), top: img.top + (state.populationImageDy || 0) })
        objects.push(img)
      } catch (e) { /* ignore */ }
    }
    objects.push(new fabric.Line([COLS.L.x + 6, settingsDivY, COLS.L.x + COLS.L.w - 6, settingsDivY], {
      stroke: '#C8BEB5', strokeWidth: 1,
      selectable: false, evented: false,
    }))
    objects.push(sectionLabel(fabric, FONT, LX, settingsDivY + 10, 'SETTINGS / DESIGN', ACCENT))

    const settingsParts = []
    if (state.nStudies)          settingsParts.push(`${state.nStudies} trials`)
    if (state.studyDesignDetail) settingsParts.push(state.studyDesignDetail)
    const settingsText = settingsParts.join('\n')
    if (settingsText) {
      objects.push(new fabric.Textbox(settingsText, {
        left: LX, top: settingsDivY + 30,
        width: LW,
        fontSize: 14, fontFamily: FONT, fontWeight: '400',
        fill: COLOR_DARK, lineHeight: 1.4,
        selectable: false, evented: false,
      }))
    }

    // ── MIDDLE COLUMN ──
    const MX = COLS.M.x + PAD
    const MW = COLS.M.w - PAD * 2

    objects.push(sectionLabel(fabric, FONT, MX, my + 12, 'INTERVENTION', ACCENT))

    // Intervention / Control content area
    const boxTopY = my + 36
    const boxH    = 282  // fills to poDivY (my+332) minus padding
    const halfW   = Math.floor(MW / 2) - 8

    const intervLabel = state.interventionAbbr || (state.intervention || '—')
    objects.push(new fabric.Textbox(intervLabel, {
      left: MX + 8, top: boxTopY + 8,
      width: halfW - 16,
      fontSize: state.interventionAbbr ? 20 : 14,
      fontFamily: FONT, fontWeight: '700',
      fill: COLOR_DARK, lineHeight: 1.2,
      selectable: false, evented: false,
    }))
    if (state.interventionAbbr && state.intervention) {
      objects.push(new fabric.Textbox(state.intervention, {
        left: MX + 8, top: boxTopY + 42,
        width: halfW - 16,
        fontSize: 12, fontFamily: FONT, fontWeight: '400',
        fill: COLOR_DARK, lineHeight: 1.2,
        selectable: false, evented: false,
      }))
    }

    if (state.interventionDetail) {
      objects.push(new fabric.Textbox(state.interventionDetail, {
        left: MX + 8, top: boxTopY + 66,
        width: halfW - 16,
        fontSize: 11, fontFamily: FONT, fontWeight: '400',
        fill: COLOR_MID, lineHeight: 1.2,
        selectable: false, evented: false,
      }))
    }

    // "vs" separator
    objects.push(new fabric.Text('vs', {
      left: MX + halfW + 4, top: boxTopY + 8,
      fontSize: 13, fontFamily: FONT, fontWeight: '700',
      fill: COLOR_MID,
      selectable: false, evented: false,
    }))

    // Control area
    const ctrlX = MX + halfW + 16
    const ctrlW = MW - halfW - 16
    objects.push(new fabric.Textbox(state.comparator || '—', {
      left: ctrlX + 8, top: boxTopY + 8,
      width: ctrlW - 16,
      fontSize: 14, fontFamily: FONT, fontWeight: '600',
      fill: COLOR_DARK, lineHeight: 1.2,
      selectable: false, evented: false,
    }))

    if (state.comparatorDetail) {
      objects.push(new fabric.Textbox(state.comparatorDetail, {
        left: ctrlX + 8, top: boxTopY + 42,
        width: ctrlW - 16,
        fontSize: 11, fontFamily: FONT, fontWeight: '400',
        fill: COLOR_MID, lineHeight: 1.2,
        selectable: false, evented: false,
      }))
    }

    // PRIMARY OUTCOME divider
    const poDivY = my + 332

    // Control image
    if (state.controlImage) {
      try {
        const img = await fabric.Image.fromURL(state.controlImage)
        fitImage(fabric, img, ctrlX + 4, boxTopY + 4, ctrlW - 8, poDivY - boxTopY - 8, state.controlImageFit || 'contain')
        img.set({ left: img.left + (state.controlImageDx || 0), top: img.top + (state.controlImageDy || 0) })
        objects.push(img)
      } catch (e) { /* ignore */ }
    }

    // Intervention image
    if (state.interventionImage) {
      try {
        const img = await fabric.Image.fromURL(state.interventionImage)
        fitImage(fabric, img, MX + 4, boxTopY + 4, halfW - 8, poDivY - boxTopY - 8, state.interventionImageFit || 'contain')
        img.set({ left: img.left + (state.interventionImageDx || 0), top: img.top + (state.interventionImageDy || 0) })
        objects.push(img)
      } catch (e) { /* ignore */ }
    }
    objects.push(new fabric.Line([COLS.M.x + 6, poDivY, COLS.M.x + COLS.M.w - 6, poDivY], {
      stroke: '#C8BEB5', strokeWidth: 1,
      selectable: false, evented: false,
    }))
    objects.push(sectionLabel(fabric, FONT, MX, poDivY + 10, 'PRIMARY OUTCOME', ACCENT))

    const primaryOutcome = (state.outcomes || []).find(o => o.primary)
    if (primaryOutcome?.name) {
      objects.push(new fabric.Textbox(primaryOutcome.name, {
        left: MX, top: poDivY + 30,
        width: MW,
        fontSize: 15, fontFamily: FONT, fontWeight: '400',
        fill: COLOR_DARK, lineHeight: 1.4,
        selectable: false, evented: false,
      }))
    }

    if (primaryOutcome?.detail) {
      objects.push(new fabric.Textbox(primaryOutcome.detail, {
        left: MX, top: poDivY + 60,
        width: MW,
        fontSize: 13, fontFamily: FONT, fontWeight: '400',
        fill: COLOR_GRAY, lineHeight: 1.3,
        selectable: false, evented: false,
      }))
    }

    // Show remaining primary outcomes (secondary display)
    const otherPrimary = (state.outcomes || []).filter(o => o.primary && o !== primaryOutcome)
    if (otherPrimary.length > 0) {
      const names = otherPrimary.map(o => o.name).join('\n')
      objects.push(new fabric.Textbox(names, {
        left: MX, top: poDivY + 90,
        width: MW,
        fontSize: 13, fontFamily: FONT, fontWeight: '400',
        fill: COLOR_GRAY, lineHeight: 1.3,
        selectable: false, evented: false,
      }))
    }

    // ── RIGHT COLUMN (FINDINGS) ──
    const RX = COLS.R.x + PAD
    const RW = COLS.R.w - PAD * 2

    objects.push(sectionLabel(fabric, FONT, RX, my + 12, 'FINDINGS', ACCENT))

    if (state.jamaFindingsMode === 'sof') {
      // Compact SoF table within FINDINGS column
      const sofObjs = buildSofTableCompact(fabric, { x: RX, y: my + 32, w: RW }, state.outcomes || [], FONT)
      sofObjs.forEach(o => objects.push(o))
    } else if (primaryOutcome) {
      if (primaryOutcome.type === 'continuous') {
        buildContinuousFindings(fabric, objects, FONT, RX, RW, my, mh, primaryOutcome)
      } else {
        buildDichotomousFindings(fabric, objects, FONT, RX, RW, my, mh, primaryOutcome, state)
      }
    } else {
      objects.push(new fabric.Text('Add a primary outcome \u2192', {
        left: RX + Math.floor(RW / 2), top: my + Math.floor(mh / 2),
        fontSize: 14, fontFamily: FONT,
        fill: COLOR_GRAY, originX: 'center',
        selectable: false, evented: false,
      }))
    }

    // Key Limitations overlay at bottom of FINDINGS column
    if (state.keyLimitations) {
      const LIM_H = 50
      const limY  = my + mh - LIM_H
      objects.push(plainRect(fabric, COLS.R.x, limY, COLS.R.w, LIM_H, BG_BEIGE))
      objects.push(new fabric.Textbox(`\u26A0\uFE0F  Key limitations: ${state.keyLimitations}`, {
        left: RX, top: limY + 10,
        width: RW,
        fontSize: 12, fontFamily: FONT, fontWeight: '400',
        fill: COLOR_DARK, lineHeight: 1.3,
        selectable: false, evented: false,
      }))
    }
  }

  // ── 4. FOOTER ──
  const { y: fy, h: fh } = ZONES.footer
  objects.push(plainRect(fabric, 0, fy, W, fh, BG_FOOTER))
  objects.push(new fabric.Line([0, fy, W, fy], {
    stroke: '#C8BEB5', strokeWidth: 1,
    selectable: false, evented: false,
  }))

  const authorsTrimmed = (state.authors || '').replace(/\.$/, '')
  const citParts  = [authorsTrimmed, state.journal, state.year].filter(Boolean)
  const citation  = citParts.join('. ')
  const doiText   = state.doi ? `doi:${state.doi}` : ''
  const fullCit   = [citation, doiText].filter(Boolean).join('  ')

  if (fullCit) {
    objects.push(new fabric.Textbox(fullCit, {
      left: STRIPE_W + PAD, top: fy + Math.floor((fh - 28) / 2),
      width: W - STRIPE_W - PAD * 2 - 60,
      fontSize: 13, fontFamily: FONT, fontWeight: '400',
      fill: COLOR_MID, lineHeight: 1.3,
      selectable: false, evented: false,
    }))
  }

  if (state.creatorName) {
    objects.push(new fabric.Text(
      `Created by ${state.creatorName}, with yukifurukawa.jp/va`, {
        left: W - PAD, top: fy + Math.floor((fh - 13) / 2),
        fontSize: 12, fontFamily: FONT, fontWeight: '400',
        fill: COLOR_MID, originX: 'right',
        selectable: false, evented: false,
      }
    ))
  }

  return objects
}

// ── Continuous outcome findings ──
function buildContinuousFindings(fabric, objects, FONT, RX, RW, mainY, mainH, outcome) {
  const cx = RX + Math.floor(RW / 2)

  if (outcome.name) {
    objects.push(new fabric.Textbox(outcome.name, {
      left: RX, top: mainY + 35,
      width: RW,
      fontSize: 14, fontFamily: FONT, fontWeight: '400',
      fill: COLOR_DARK, lineHeight: 1.35, textAlign: 'center',
      selectable: false, evented: false,
    }))
  }

  const measureType = outcome.measureType || 'MD'
  const effectVal   = outcome.effectValue  || '\u2014'

  objects.push(new fabric.Text(`${measureType} ${effectVal}`, {
    left: cx, top: mainY + 160,
    fontSize: 36, fontFamily: FONT, fontWeight: '700',
    fill: COLOR_DARK, originX: 'center',
    selectable: false, evented: false,
  }))

  if (outcome.ci_95) {
    objects.push(new fabric.Text(outcome.ci_95, {
      left: cx, top: mainY + 205,
      fontSize: 18, fontFamily: FONT, fontWeight: '400',
      fill: COLOR_MID, originX: 'center',
      selectable: false, evented: false,
    }))
  }

  if (outcome.certainty) {
    const gc = GRADE_COLORS[outcome.certainty]
    if (gc) buildGradeBadge(fabric, objects, FONT, cx, mainY + 63, gc)
  }
}

// ── Dichotomous outcome findings (donut charts) ──
function buildDichotomousFindings(fabric, objects, FONT, RX, RW, mainY, mainH, outcome, state) {
  const BG = BG_BEIGE

  if (outcome.name) {
    objects.push(new fabric.Textbox(outcome.name, {
      left: RX, top: mainY + 32,
      width: RW,
      fontSize: 14, fontFamily: FONT, fontWeight: '400',
      fill: COLOR_DARK, lineHeight: 1.3, textAlign: 'center',
      selectable: false, evented: false,
    }))
  }

  const cerPct = parsePct(outcome.cer)
  const eerPct = calcEER(outcome.cer, outcome.effectValue, outcome.measureType)

  const outerR = 60
  const innerR = 39
  const donutY = mainY + 175

  const d1cx = RX + Math.floor(RW * 0.27)
  const d2cx = RX + Math.floor(RW * 0.73)

  // ── Intervention donut ──
  drawDonut(fabric, objects, d1cx, donutY, outerR, innerR,
    eerPct !== null ? eerPct / 100 : 0,
    eerPct !== null ? AMBER : RING_GRAY,
    BG)

  const eerLabel = eerPct !== null ? `${Math.round(eerPct)}%` : '\u2014'
  objects.push(new fabric.Text(eerLabel, {
    left: d1cx, top: donutY - 11,
    fontSize: 19, fontFamily: FONT, fontWeight: '700',
    fill: COLOR_DARK, originX: 'center',
    selectable: false, evented: false,
  }))

  const intervShort = state.interventionAbbr || (state.intervention ? state.intervention.slice(0, 20) : 'Intervention')
  objects.push(new fabric.Textbox(intervShort, {
    left: d1cx - 58, top: donutY + outerR + 6,
    width: 116, textAlign: 'center',
    fontSize: 11, fontFamily: FONT, fontWeight: '700',
    fill: COLOR_DARK, lineHeight: 1.2,
    selectable: false, evented: false,
  }))

  // ── Control donut ──
  drawDonut(fabric, objects, d2cx, donutY, outerR, innerR,
    cerPct !== null ? cerPct / 100 : 0,
    cerPct !== null ? AMBER : RING_GRAY,
    BG)

  const cerLabel = cerPct !== null ? `${Math.round(cerPct)}%` : '\u2014'
  objects.push(new fabric.Text(cerLabel, {
    left: d2cx, top: donutY - 11,
    fontSize: 19, fontFamily: FONT, fontWeight: '700',
    fill: COLOR_DARK, originX: 'center',
    selectable: false, evented: false,
  }))

  const ctrlShort = state.comparator
    ? state.comparator.split('/')[0].trim().slice(0, 20)
    : 'Control'
  objects.push(new fabric.Textbox(ctrlShort, {
    left: d2cx - 58, top: donutY + outerR + 6,
    width: 116, textAlign: 'center',
    fontSize: 11, fontFamily: FONT, fontWeight: '400',
    fill: COLOR_MID, lineHeight: 1.2,
    selectable: false, evented: false,
  }))

  // ── Effect size ──
  const measureType = outcome.measureType || 'OR'
  const effectVal   = outcome.effectValue  || '\u2014'
  const effectCX    = RX + Math.floor(RW / 2)
  const effectY     = donutY + outerR + 60

  objects.push(new fabric.Text(`${measureType} ${effectVal}`, {
    left: effectCX, top: effectY,
    fontSize: 28, fontFamily: FONT, fontWeight: '700',
    fill: COLOR_DARK, originX: 'center',
    selectable: false, evented: false,
  }))

  if (outcome.ci_95) {
    objects.push(new fabric.Text(outcome.ci_95, {
      left: effectCX, top: effectY + 36,
      fontSize: 15, fontFamily: FONT, fontWeight: '400',
      fill: COLOR_MID, originX: 'center',
      selectable: false, evented: false,
    }))
  }

  if (outcome.certainty) {
    const gc = GRADE_COLORS[outcome.certainty]
    if (gc) buildGradeBadge(fabric, objects, FONT, effectCX, mainY + 63, gc)
  }
}

// ── Draw donut chart ──
function drawDonut(fabric, objects, cx, cy, outerR, innerR, pct, segColor, bgColor) {
  // 1. Background circle
  objects.push(new fabric.Circle({
    left: cx - outerR, top: cy - outerR,
    radius: outerR,
    fill: RING_GRAY,
    selectable: false, evented: false,
  }))

  // 2. Colored wedge (pie slice)
  if (pct > 0) {
    const clampedPct = Math.min(pct, 0.9999)
    const startRad   = -Math.PI / 2
    const endRad     = startRad + clampedPct * 2 * Math.PI
    const x1 = cx + outerR * Math.cos(startRad)
    const y1 = cy + outerR * Math.sin(startRad)
    const x2 = cx + outerR * Math.cos(endRad)
    const y2 = cy + outerR * Math.sin(endRad)
    const largeArc = clampedPct > 0.5 ? 1 : 0
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} Z`
    objects.push(new fabric.Path(d, {
      fill: segColor, selectable: false, evented: false,
    }))
  }

  // 3. Inner circle (creates donut hole)
  objects.push(new fabric.Circle({
    left: cx - innerR, top: cy - innerR,
    radius: innerR,
    fill: bgColor,
    selectable: false, evented: false,
  }))
}

// ── GRADE certainty badge ──
function buildGradeBadge(fabric, objects, FONT, cx, cy, gc) {
  const bw = 110, bh = 24
  objects.push(new fabric.Rect({
    left: cx - Math.floor(bw / 2), top: cy - Math.floor(bh / 2),
    width: bw, height: bh,
    rx: 12, ry: 12, fill: gc.bg,
    selectable: false, evented: false,
  }))
  objects.push(new fabric.Text(gc.label, {
    left: cx, top: cy - Math.floor(bh / 2) + Math.floor((bh - 14) / 2),
    fontSize: 14, fontFamily: '"Carlito", Calibri, Arial, sans-serif',
    fontWeight: '700', fill: gc.text, originX: 'center',
    selectable: false, evented: false,
  }))
}

// ── Section label (POPULATION, INTERVENTION, etc.) ──
function sectionLabel(fabric, FONT, x, y, text, color = CRIMSON) {
  return new fabric.Text(text, {
    left: x, top: y,
    fontSize: 17, fontFamily: FONT, fontWeight: '700',
    fill: color, selectable: false, evented: false,
  })
}

// ── Plain rect helper ──
function plainRect(fabric, x, y, w, h, fill, rx = 0) {
  return new fabric.Rect({
    left: x, top: y, width: w, height: h,
    fill, rx, ry: rx,
    selectable: false, evented: false,
  })
}

// ── Parse percentage from "17 per 100" or "0.17" or "17" ──
function parsePct(str) {
  if (!str) return null
  const m = String(str).match(/^(\d[\d.]*)\s*per\s*(\d+)/)
  if (m) return (parseFloat(m[1]) / parseFloat(m[2])) * 100
  const n = parseFloat(str)
  if (!isNaN(n)) return n <= 1 ? n * 100 : n
  return null
}

// ── Calculate EER from CER + effect measure ──
function calcEER(cerStr, effectValue, measureType) {
  if (!cerStr || !effectValue) return null
  const cerPct = parsePct(cerStr)
  if (cerPct === null) return null
  const cerRate = cerPct / 100
  const ev = parseFloat(effectValue)
  if (isNaN(ev) || isNaN(cerRate)) return null
  let eerRate
  if (measureType === 'RR')      eerRate = cerRate * ev
  else if (measureType === 'OR') eerRate = (cerRate * ev) / (1 - cerRate + cerRate * ev)
  else return null
  return Math.max(0, Math.min(1, eerRate)) * 100
}

// ── Fit image into slot ──
function fitImage(fabric, img, x, y, w, h, mode = 'contain') {
  const scale = mode === 'cover'
    ? Math.max(w / img.width, h / img.height)
    : Math.min(w / img.width, h / img.height)
  const scaledW = img.width  * scale
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
