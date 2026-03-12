/**
 * Visual Abstract Generator — Entry Point
 */

import { CanvasManager } from './canvas/CanvasManager.js'
import { FormManager }   from './ui/FormManager.js'
import { exportPng }     from './export/PngExporter.js'
import { exportPdf }     from './export/PdfExporter.js'
import { PRESET_PALETTES } from './data/palettes.js'

let _viewMode = 'pc'
let _manager  = null

// Custom palette state
const _customColors = { main: '#1A3A5C', intervention: '#2A8B85', control: '#B5337A' }

function lightenHex(hex, amount) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return '#' + [r, g, b].map(c => Math.round(c + (255 - c) * amount).toString(16).padStart(2, '0')).join('')
}

function buildCustomPalette(main, intervention, control) {
  return {
    id: 'custom', name: 'Custom',
    main,
    mainLight:   lightenHex(main, 0.92),
    pageBg:      lightenHex(main, 0.85),
    sectionA:    lightenHex(main, 0.90),
    sectionB:    lightenHex(main, 0.87),
    footerBg:    lightenHex(main, 0.80),
    borderColor: lightenHex(main, 0.70),
    intervention,
    control,
  }
}

const FURUKAWA_PRESET = {
  title:             'Cognitive behavioral therapy for insomnia to treat depression',
  authors:           'Furukawa Y, et al.',
  journal:           'J Affect Disord',
  year:              '2024',
  doi:               '10.1016/j.jad.2024.09.017',
  creatorName:       'Furukawa Y',
  roundedCorners:    true,
  font:              'calibri',
  studyDesignType:   'Systematic review and meta-analysis',
  studyDesignDetail: '16 trials allowed co-administration of antidepressants, 1 trial did not allow.',
  nStudies:          '19',
  nParticipants:     '',
  population:        'Adults with depression and insomnia',
  populationDetail:  '4808 participants, mean 33 years old, 73% women',
  intervention:      'Cognitive Behavioural Therapy for Insomnia',
  interventionAbbr:  'CBT-I',
  interventionDetail: 'At least one of the 3 components: sleep restriction, stimulus control or cognitive restructuring for insomnia',
  comparator:        'Waitlist control / TAU / Placebo',
  conclusion:        'CBT-I was more beneficial than controls for depression beyond the sleep domain. With a control depression response rate of 17%, CBT-I yielded a 32% response rate. CBT-I is an effective treatment option for depression comorbid with insomnia.',
  keyLimitations:    'Potential publication bias, heterogeneous control conditions.',
  outcomes: [
    { name: 'Depression response', type: 'dichotomous', measureType: 'OR', effectValue: '2.28', ci_95: '(1.67 to 3.12)', cer: '17 per 100', direction: 'favors_intervention', certainty: 'moderate', primary: true,  nStudies: '18', nParticipants: '4762' },
    { name: 'Insomnia remission',  type: 'dichotomous', measureType: 'OR', effectValue: '3.57', ci_95: '(2.48 to 5.14)', cer: '9 per 100',  direction: 'favors_intervention', certainty: 'moderate', primary: true,  nStudies: '17', nParticipants: '4721' },
    { name: 'Dropout',             type: 'dichotomous', measureType: 'OR', effectValue: '1.69', ci_95: '(0.98 to 2.89)', cer: '15 per 100', direction: 'unclear',             certainty: 'low',      primary: false, nStudies: '15', nParticipants: '1369' },
  ],
  customSections: [],
}

document.fonts.ready.then(() => { init() })

function init() {
  const canvasEl = document.getElementById('va-canvas')
  _manager = new CanvasManager(canvasEl)

  scaleCanvasPreview()
  window.addEventListener('resize', scaleCanvasPreview)

  const form = new FormManager(state => _manager.render(state))
  form.loadPreset(FURUKAWA_PRESET)

  // Clear all
  document.getElementById('btn-clear-all')?.addEventListener('click', () => {
    form.clearAll()
  })

  // PNG export
  document.getElementById('btn-png-sns')?.addEventListener('click', () => {
    exportPng(_manager, 'sns', slug(form.getState().title))
  })
  document.getElementById('btn-png-print')?.addEventListener('click', () => {
    exportPng(_manager, 'print', slug(form.getState().title))
  })

  // PDF export
  document.getElementById('btn-pdf-square')?.addEventListener('click', () => {
    exportPdf(_manager, 'square', slug(form.getState().title))
  })
  document.getElementById('btn-pdf-a4')?.addEventListener('click', () => {
    exportPdf(_manager, 'a4', slug(form.getState().title))
  })

  // View mode toggle (PC / SP)
  document.getElementById('btn-view-pc')?.addEventListener('click', () => {
    _viewMode = 'pc'
    document.getElementById('btn-view-pc')?.classList.add('view-toggle-active')
    document.getElementById('btn-view-sp')?.classList.remove('view-toggle-active')
    scaleCanvasPreview()
  })
  document.getElementById('btn-view-sp')?.addEventListener('click', () => {
    _viewMode = 'sp'
    document.getElementById('btn-view-sp')?.classList.add('view-toggle-active')
    document.getElementById('btn-view-pc')?.classList.remove('view-toggle-active')
    scaleCanvasPreview()
  })

  // Template selector
  document.querySelectorAll('.btn-template').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return
      document.querySelectorAll('.btn-template').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      _manager.setTemplate(btn.dataset.template)
      const jamaFinEl = document.getElementById('section-jama-findings')
      if (jamaFinEl) jamaFinEl.style.display = btn.dataset.template === 'jama' ? '' : 'none'
      _manager.render(form.getState())
      scaleCanvasPreview()
    })
  })

  // Palette selector
  const customPickersEl = document.getElementById('custom-color-pickers')

  function applyCustomPalette() {
    _manager.palette = buildCustomPalette(_customColors.main, _customColors.intervention, _customColors.control)
    _manager.render(form.getState())
  }

  function updateCustomSwatches() {
    document.getElementById('custom-swatch-main')?.style.setProperty('background', _customColors.main)
    document.getElementById('custom-swatch-interv')?.style.setProperty('background', _customColors.intervention)
    document.getElementById('custom-swatch-ctrl')?.style.setProperty('background', _customColors.control)
  }

  document.getElementById('palette-swatches')?.addEventListener('click', e => {
    const swatch = e.target.closest('.palette-swatch')
    if (!swatch) return
    document.querySelectorAll('.palette-swatch').forEach(s => {
      s.style.borderColor = 'transparent'
    })
    swatch.style.borderColor = '#3B82F6'
    const paletteId = swatch.dataset.palette
    if (paletteId === 'custom') {
      if (customPickersEl) customPickersEl.style.display = 'flex'
      applyCustomPalette()
    } else {
      if (customPickersEl) customPickersEl.style.display = 'none'
      _manager.setPalette(paletteId)
      _manager.render(form.getState())
    }
  })

  // Custom color pickers + HEX text inputs (bidirectional sync)
  function syncHex(key, pickerId, hexId) {
    document.getElementById(pickerId)?.addEventListener('input', e => {
      _customColors[key] = e.target.value
      const hexEl = document.getElementById(hexId)
      if (hexEl) hexEl.value = e.target.value
      updateCustomSwatches()
      applyCustomPalette()
    })
    document.getElementById(hexId)?.addEventListener('input', e => {
      const val = e.target.value
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        _customColors[key] = val
        const pickerEl = document.getElementById(pickerId)
        if (pickerEl) pickerEl.value = val
        updateCustomSwatches()
        applyCustomPalette()
      }
    })
  }
  syncHex('main',         'f-custom-main',         'f-custom-main-hex')
  syncHex('intervention', 'f-custom-intervention', 'f-custom-intervention-hex')
  syncHex('control',      'f-custom-control',      'f-custom-control-hex')
}

function scaleCanvasPreview() {
  const panel   = document.querySelector('.canvas-panel')
  const wrapper = document.querySelector('.canvas-wrapper')
  if (!panel || !wrapper) return

  const CW = _manager?.canvas.width  || 1024
  const CH = _manager?.canvas.height || 1024

  let scale
  if (_viewMode === 'sp') {
    scale = 390 / CW
  } else {
    const toggleH = 36
    scale = Math.min(
      (panel.clientWidth  - 40) / CW,
      (panel.clientHeight - 40 - toggleH) / CH,
      1
    )
  }

  wrapper.style.width  = `${Math.round(CW * scale)}px`
  wrapper.style.height = `${Math.round(CH * scale)}px`

  const inner = wrapper.querySelector('.canvas-container')
  if (inner) {
    inner.style.transformOrigin = 'top left'
    inner.style.transform       = `scale(${scale})`
  }
}

function slug(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'visual-abstract'
}
