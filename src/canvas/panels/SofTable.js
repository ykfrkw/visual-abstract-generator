/**
 * Summary of Findings table panel renderer
 *
 * Columns (total width = 1024px):
 *   Outcome       x=12,  w=228
 *   Intervention  x=248, w=148  ← EER (dichotomous) or effect value (continuous)
 *   Effect        x=404, w=180  ← directional arrow + summary measure
 *   Control       x=592, w=110  ← CER (dichotomous) or [reference] (continuous)
 *   Certainty     x=710, w=302
 *   Total: 12+228+8+148+8+180+8+110+8+302+20 = 1024
 */

import { GRADE_COLORS } from '../../data/palettes.js'

const COL = {
  outcome:      { x: 12,  w: 228 },
  intervention: { x: 248, w: 166 },
  effect:       { x: 422, w: 180 },
  control:      { x: 610, w: 166 },
  studies:      { x: 784, w: 90  },
  certainty:    { x: 878, w: 126 },
}

const ROW_H    = 68
const HEADER_H = 36
const PAD_X    = 10
const PAD_Y    = 10
const INTERV_PAD = 32  // extra left offset for Intervention column

const BG_HEADER = '#EEF5FA'
const BG_EVEN   = '#FFFFFF'
const BG_ODD    = '#F7FBFD'
const COLOR_H   = '#4A5568'
const COLOR_T   = '#1A1A2E'
const BORDER    = '#D4E3ED'
const TEAL      = '#1A7FA8'
const GRAY_REF  = '#9CA3AF'

const EFFECT_COLORS = {
  favors_intervention: '#2A8B85',
  favors_control:      '#B5337A',
  unclear:             '#4B5563',
}

const TIP = 13  // arrow tip depth in px

const HEADERS = [
  { key: 'outcome',      label: 'Outcome',       center: false },
  { key: 'intervention', label: 'Intervention',  center: false, extraPad: true },
  { key: 'effect',       label: 'Effect measure', center: true  },
  { key: 'control',      label: 'Control',        center: false },
  { key: 'studies',      label: '',              center: false },
  { key: 'certainty',    label: 'Certainty',      center: true  },
]

export function buildSofTable(fabric, panel, outcomes, font, palette) {
  const FONT = font || 'Inter, Arial, sans-serif'
  const EC = {
    favors_intervention: palette?.intervention || EFFECT_COLORS.favors_intervention,
    favors_control:      palette?.control      || EFFECT_COLORS.favors_control,
    unclear:             EFFECT_COLORS.unclear,
  }
  const objects = []
  const { x: px, y: py } = panel

  // Header background
  objects.push(new fabric.Rect({
    left: px, top: py,
    width: panel.w, height: HEADER_H,
    fill: BG_HEADER,
    selectable: false, evented: false,
  }))

  // Column headers
  HEADERS.forEach(({ key, label, center, extraPad }) => {
    objects.push(new fabric.Text(label, {
      left: center
        ? px + COL[key].x + COL[key].w / 2
        : px + COL[key].x + PAD_X + (extraPad ? INTERV_PAD : 0),
      top:  py + (HEADER_H - 14) / 2,
      fontSize: 19, fontFamily: FONT, fontWeight: '700',
      fill: COLOR_H,
      originX: center ? 'center' : 'left',
      selectable: false, evented: false,
    }))
  })

  // Outcome rows
  outcomes.forEach((outcome, i) => {
    const rowY = py + HEADER_H + i * ROW_H
    const isContinuous = outcome.type === 'continuous'

    // Row background
    objects.push(new fabric.Rect({
      left: px, top: rowY,
      width: panel.w, height: ROW_H,
      fill: i % 2 === 0 ? BG_EVEN : BG_ODD,
      selectable: false, evented: false,
    }))

    // Outcome name (+ unit for continuous)
    const displayName = isContinuous && outcome.unit
      ? `${outcome.name || '—'} (${outcome.unit})`
      : (outcome.name || '—')
    objects.push(new fabric.Textbox(displayName, {
      left: px + COL.outcome.x + PAD_X,
      top:  rowY + PAD_Y,
      width: COL.outcome.w - PAD_X,
      fontSize: 23, fontFamily: FONT, fontWeight: '600',
      fill: COLOR_T, lineHeight: 1.2,
      selectable: false, evented: false,
    }))

    // ── Effect column: directional arrow background ──
    const dir   = outcome.direction || 'unclear'
    const eCol  = EC[dir] || EC.unclear
    const ebx   = px + COL.effect.x
    const eby   = rowY + 4
    const ebw   = COL.effect.w
    const ebh   = ROW_H - 8

    if (dir === 'favors_intervention') {
      objects.push(new fabric.Polygon([
        { x: ebw - TIP, y: 0       },
        { x: ebw - TIP, y: ebh     },
        { x: TIP,       y: ebh     },
        { x: 0,         y: ebh / 2 },
        { x: TIP,       y: 0       },
      ], {
        left: ebx, top: eby,
        originX: 'left', originY: 'top',
        fill: eCol, selectable: false, evented: false,
      }))
    } else if (dir === 'favors_control') {
      objects.push(new fabric.Polygon([
        { x: TIP,       y: 0       },
        { x: ebw - TIP, y: 0       },
        { x: ebw,       y: ebh / 2 },
        { x: ebw - TIP, y: ebh     },
        { x: TIP,       y: ebh     },
      ], {
        left: ebx + Math.round(TIP / 2), top: eby,
        originX: 'left', originY: 'top',
        fill: eCol, selectable: false, evented: false,
      }))
    } else {
      objects.push(new fabric.Rect({
        left: ebx + Math.round(TIP / 2), top: eby, width: ebw - TIP - Math.round(TIP / 2), height: ebh,
        fill: eCol, selectable: false, evented: false,
      }))
    }

    // Effect text: "RR 1.9" on line 1, "(1.5 to 2.3)" on line 2
    const measureType = outcome.measureType || 'RR'
    const effectVal   = outcome.effectValue || '—'
    const effectCI    = outcome.ci_95 || ''
    const centerX     = ebx + ebw / 2

    objects.push(new fabric.Text(`${measureType} ${effectVal}`, {
      left: centerX,
      top:  eby + (effectCI ? ebh / 2 - 15 : (ebh - 15) / 2),
      originX: 'center',
      fontSize: 18, fontFamily: FONT, fontWeight: '700',
      fill: '#FFFFFF', selectable: false, evented: false,
    }))
    if (effectCI) {
      objects.push(new fabric.Text(effectCI, {
        left: centerX,
        top:  eby + ebh / 2 + 2,
        originX: 'center',
        fontSize: 15, fontFamily: FONT, fontWeight: '400',
        fill: '#FFFFFF', selectable: false, evented: false,
      }))
    }

    // ── Intervention column ──
    if (isContinuous) {
      // Show effect value line 1, CI line 2
      objects.push(new fabric.Text(effectVal, {
        left: px + COL.intervention.x + PAD_X + INTERV_PAD,
        top:  rowY + PAD_Y,
        fontSize: 24, fontFamily: FONT, fontWeight: '700',
        fill: COLOR_T, selectable: false, evented: false,
      }))
      if (effectCI) {
        objects.push(new fabric.Text(effectCI, {
          left: px + COL.intervention.x + PAD_X + INTERV_PAD,
          top:  rowY + PAD_Y + 25,
          fontSize: 15, fontFamily: FONT, fontWeight: '400',
          fill: '#718096', selectable: false, evented: false,
        }))
      }
    } else {
      // Dichotomous: show auto-calculated EER
      const eer = calcEER(outcome.cer, outcome.effectValue, outcome.measureType)
                  || outcome.eer || '—'
      rateCell(fabric, objects, FONT, px + COL.intervention.x + PAD_X + INTERV_PAD, rowY, eer)
    }

    // ── Control column ──
    if (isContinuous) {
      objects.push(new fabric.Text('[reference]', {
        left: px + COL.control.x + PAD_X,
        top:  rowY + ROW_H / 2 - 7,
        fontSize: 16, fontFamily: FONT, fontStyle: 'italic',
        fill: GRAY_REF, selectable: false, evented: false,
      }))
    } else {
      rateCell(fabric, objects, FONT, px + COL.control.x + PAD_X, rowY, outcome.cer || '—')
    }

    // ── Studies column (k / n) ──
    if (outcome.nStudies || outcome.nParticipants) {
      let lineY = rowY + PAD_Y
      if (outcome.nStudies) {
        objects.push(new fabric.Text(`k = ${outcome.nStudies}`, {
          left: px + COL.studies.x + PAD_X,
          top:  lineY,
          fontSize: 18, fontFamily: FONT, fontWeight: '400',
          fill: COLOR_T, selectable: false, evented: false,
        }))
        lineY += 22
      }
      if (outcome.nParticipants) {
        objects.push(new fabric.Text(`n = ${outcome.nParticipants}`, {
          left: px + COL.studies.x + PAD_X,
          top:  lineY,
          fontSize: 18, fontFamily: FONT, fontWeight: '400',
          fill: COLOR_T, selectable: false, evented: false,
        }))
      }
    }

    // ── Certainty badge ──
    const grade = outcome.certainty || 'low'
    const gc = GRADE_COLORS[grade]
    if (gc) {
      const bw = 100, bh = 26
      const bx = px + COL.certainty.x + Math.floor(COL.certainty.w / 2) - Math.floor(bw / 2)
      const by = rowY + Math.floor(ROW_H / 2) - Math.floor(bh / 2)
      objects.push(new fabric.Rect({
        left: bx, top: by, width: bw, height: bh,
        rx: 13, ry: 13, fill: gc.bg,
        selectable: false, evented: false,
      }))
      objects.push(new fabric.Text(gc.label, {
        left: bx + Math.floor(bw / 2), top: by + Math.floor((bh - 15) / 2),
        originX: 'center',
        fontSize: 18, fontFamily: FONT, fontWeight: '700',
        fill: gc.text, selectable: false, evented: false,
      }))
    }

    // Row divider
    objects.push(new fabric.Line(
      [px, rowY + ROW_H, px + panel.w, rowY + ROW_H],
      { stroke: BORDER, strokeWidth: 1, selectable: false, evented: false }
    ))
  })

  // Empty state
  if (outcomes.length === 0) {
    objects.push(new fabric.Text('Add outcomes in the form →', {
      left: px + panel.w / 2, top: py + HEADER_H + 40,
      fontSize: 18, fontFamily: FONT,
      fill: '#9CA3AF', originX: 'center',
      selectable: false, evented: false,
    }))
  }

  return objects
}

function rateCell(fabric, objects, font, x, rowY, text) {
  const { num, unit } = parseRate(text)
  objects.push(new fabric.Text(num, {
    left: x, top: rowY + PAD_Y,
    fontSize: 25, fontFamily: font, fontWeight: '700',
    fill: COLOR_T, selectable: false, evented: false,
  }))
  if (unit) {
    objects.push(new fabric.Text(unit, {
      left: x, top: rowY + PAD_Y + 25,
      fontSize: 16, fontFamily: font, fontWeight: '400',
      fill: '#718096', selectable: false, evented: false,
    }))
  }
}

function parseRate(str) {
  if (!str || str === '—') return { num: str || '—', unit: '' }
  const m = String(str).match(/^(\d[\d.,]*)(.*)$/)
  if (!m) return { num: str, unit: '' }
  return { num: m[1].trim(), unit: m[2].trim() }
}

function calcEER(cer, effectValue, measureType) {
  if (!cer || !effectValue) return null
  const cerMatch = String(cer).match(/^(\d[\d.]*)/)
  if (!cerMatch) return null
  const cerNum  = parseFloat(cerMatch[1])
  const unit    = parseInt(String(cer).match(/per\s*(\d+)/)?.[1] ?? '100')
  const cerRate = cerNum / unit
  const ev      = parseFloat(effectValue)
  if (isNaN(ev) || isNaN(cerRate)) return null

  let eerRate
  if (measureType === 'RR') {
    eerRate = cerRate * ev
  } else if (measureType === 'OR') {
    eerRate = (cerRate * ev) / (1 - cerRate + cerRate * ev)
  } else {
    return null
  }

  eerRate = Math.max(0, Math.min(1, eerRate))
  return `${Math.round(eerRate * unit)} per ${unit}`
}

export function sofTableHeight(outcomes) {
  return HEADER_H + Math.max(1, outcomes.length) * ROW_H
}

// ── Compact SoF table for narrow columns (≈436px) ────────────────────────────
export function buildSofTableCompact(fabric, panel, outcomes, font, palette) {
  const FONT = font || 'Inter, Arial, sans-serif'
  const EC = {
    favors_intervention: palette?.intervention || EFFECT_COLORS.favors_intervention,
    favors_control:      palette?.control      || EFFECT_COLORS.favors_control,
    unclear:             EFFECT_COLORS.unclear,
  }
  const objects = []
  const { x: px, y: py, w: pw } = panel

  const ROW_H_C    = 68
  const HEADER_H_C = 28
  const PAD_C      = 8

  const C = {
    outcome:   { x: 0,   w: 140 },
    effect:    { x: 146, w: 152 },
    certainty: { x: 304, w: pw - 304 },
  }

  // Header background
  objects.push(new fabric.Rect({
    left: px, top: py,
    width: pw, height: HEADER_H_C,
    fill: BG_HEADER,
    selectable: false, evented: false,
  }))

  // Header labels
  ;[['outcome', 'Outcome'], ['effect', 'Effect'], ['certainty', 'Certainty']].forEach(([key, label]) => {
    objects.push(new fabric.Text(label, {
      left: px + C[key].x + PAD_C,
      top:  py + (HEADER_H_C - 13) / 2,
      fontSize: 13, fontFamily: FONT, fontWeight: '700',
      fill: COLOR_H,
      selectable: false, evented: false,
    }))
  })

  outcomes.forEach((outcome, i) => {
    const rowY = py + HEADER_H_C + i * ROW_H_C

    // Row background
    objects.push(new fabric.Rect({
      left: px, top: rowY,
      width: pw, height: ROW_H_C,
      fill: i % 2 === 0 ? BG_EVEN : BG_ODD,
      selectable: false, evented: false,
    }))

    // Outcome name
    objects.push(new fabric.Textbox(outcome.name || '—', {
      left: px + C.outcome.x + PAD_C,
      top:  rowY + PAD_C,
      width: C.outcome.w - PAD_C,
      fontSize: 14, fontFamily: FONT, fontWeight: '600',
      fill: COLOR_T, lineHeight: 1.2,
      selectable: false, evented: false,
    }))

    // Effect column (colored rect)
    const dir  = outcome.direction || 'unclear'
    const eCol = EC[dir] || EC.unclear
    const ebx  = px + C.effect.x + 2
    const eby  = rowY + 4
    const ebw  = C.effect.w - 4
    const ebh  = ROW_H_C - 8
    const ecx  = ebx + ebw / 2
    const hasCI = !!outcome.ci_95

    objects.push(new fabric.Rect({
      left: ebx, top: eby, width: ebw, height: ebh,
      fill: eCol, rx: 4, ry: 4,
      selectable: false, evented: false,
    }))

    const measureType = outcome.measureType || 'RR'
    const effectVal   = outcome.effectValue  || '—'
    objects.push(new fabric.Text(`${measureType} ${effectVal}`, {
      left: ecx, top: eby + (hasCI ? ebh / 2 - 10 : (ebh - 15) / 2),
      fontSize: 15, fontFamily: FONT, fontWeight: '700',
      fill: '#FFFFFF', originX: 'center',
      selectable: false, evented: false,
    }))
    if (hasCI) {
      objects.push(new fabric.Text(outcome.ci_95, {
        left: ecx, top: eby + ebh / 2 + 2,
        fontSize: 12, fontFamily: FONT, fontWeight: '400',
        fill: '#FFFFFF', originX: 'center',
        selectable: false, evented: false,
      }))
    }

    // Certainty badge
    const grade = outcome.certainty || 'moderate'
    const gc    = GRADE_COLORS[grade]
    if (gc) {
      const bw = Math.min(C.certainty.w - 12, 96)
      const bh = 22
      const bx = px + C.certainty.x + 6
      const by = rowY + Math.floor((ROW_H_C - bh) / 2)
      objects.push(new fabric.Rect({
        left: bx, top: by, width: bw, height: bh,
        rx: 11, ry: 11, fill: gc.bg,
        selectable: false, evented: false,
      }))
      objects.push(new fabric.Text(gc.label, {
        left: bx + Math.floor(bw / 2), top: by + Math.floor((bh - 12) / 2),
        originX: 'center',
        fontSize: 12, fontFamily: FONT, fontWeight: '700',
        fill: gc.text,
        selectable: false, evented: false,
      }))
    }

    // Row divider
    objects.push(new fabric.Line(
      [px, rowY + ROW_H_C, px + pw, rowY + ROW_H_C],
      { stroke: BORDER, strokeWidth: 1, selectable: false, evented: false }
    ))
  })

  if (outcomes.length === 0) {
    objects.push(new fabric.Text('Add outcomes →', {
      left: px + pw / 2, top: py + HEADER_H_C + 30,
      fontSize: 13, fontFamily: FONT,
      fill: '#9CA3AF', originX: 'center',
      selectable: false, evented: false,
    }))
  }

  return objects
}
