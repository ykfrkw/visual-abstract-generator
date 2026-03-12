/**
 * FormManager — manages form state, SoF outcome rows, and custom sections
 */

import { removeBackground } from '@imgly/background-removal'
import { stateToMarkdown, markdownToPreset } from './YamlImporter.js'

const MAX_OUTCOMES        = 5
const MAX_CUSTOM_SECTIONS = 3

export class FormManager {
  constructor(onChange) {
    this.onChange         = onChange
    this.outcomes         = []
    this.customSections   = []
    this.populationImage  = null
    this.interventionImage = null
    this.controlImage     = null
    this._mode            = 'form'
    this._initListeners()
    this._renderOutcomeRows()
    this._renderCustomSections()
  }

  _initListeners() {
    const ids = [
      'f-title', 'f-authors', 'f-journal', 'f-year', 'f-doi',
      'f-creator-name',
      'f-study-design-type', 'f-study-design-detail',
      'f-n-studies', 'f-n-participants',
      'f-population', 'f-population-detail',
      'f-intervention', 'f-intervention-abbr', 'f-comparator',
      'f-intervention-detail', 'f-comparator-detail',
      'f-conclusion', 'f-key-limitations',
      'f-population-image-dx', 'f-population-image-dy',
      'f-intervention-image-dx', 'f-intervention-image-dy',
      'f-control-image-dx', 'f-control-image-dy',
    ]
    ids.forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => this._emit())
    })

    // Select fields
    document.getElementById('f-font')?.addEventListener('change', () => this._emit())
    document.getElementById('f-jama-findings-mode')?.addEventListener('change', () => this._emit())

    // Checkboxes
    const checkboxIds = [
      'f-rounded-corners',
      'f-population-image-fill',
      'f-intervention-image-fill',
      'f-control-image-fill',
    ]
    checkboxIds.forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => this._emit())
    })

    // Image file inputs
    const imgFields = [
      { inputId: 'f-population-image',   key: 'populationImage'   },
      { inputId: 'f-intervention-image', key: 'interventionImage' },
      { inputId: 'f-control-image',      key: 'controlImage'      },
    ]
    imgFields.forEach(({ inputId, key }) => {
      document.getElementById(inputId)?.addEventListener('change', e => {
        const file = e.target.files?.[0]
        if (!file) {
          this[key] = null
          this._emit()
          return
        }
        const reader = new FileReader()
        reader.onload = evt => {
          this[key] = evt.target.result
          this._emit()
        }
        reader.readAsDataURL(file)
      })
    })

    // Mode toggle
    document.getElementById('btn-mode-form')?.addEventListener('click', () => this._switchMode('form'))
    document.getElementById('btn-mode-markdown')?.addEventListener('click', () => this._switchMode('markdown'))

    // Markdown apply button
    document.getElementById('btn-md-apply')?.addEventListener('click', () => this._applyMarkdown())

    // Remove BG buttons
    const removeBgFields = [
      { btnId: 'btn-remove-bg-population',   key: 'populationImage'   },
      { btnId: 'btn-remove-bg-intervention', key: 'interventionImage' },
      { btnId: 'btn-remove-bg-control',      key: 'controlImage'      },
    ]
    removeBgFields.forEach(({ btnId, key }) => {
      document.getElementById(btnId)?.addEventListener('click', () => this._removeBg(key, btnId))
    })

    document.getElementById('btn-add-outcome')?.addEventListener('click', () => {
      if (this.outcomes.length < MAX_OUTCOMES) {
        this.outcomes.push(this._emptyOutcome())
        this._renderOutcomeRows()
        this._emit()
      }
    })

    document.getElementById('btn-add-custom-section')?.addEventListener('click', () => {
      if (this.customSections.length < MAX_CUSTOM_SECTIONS) {
        this.customSections.push({ name: '', content: '' })
        this._renderCustomSections()
        this._emit()
      }
    })
  }

  async _removeBg(key, btnId) {
    if (!this[key]) return
    const btn = document.getElementById(btnId)
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Processing…' }
    try {
      const blob = _dataUrlToBlob(this[key])
      const result = await removeBackground(blob)
      this[key] = await _blobToDataUrl(result)
      this._emit()
    } catch (e) {
      console.error('BG removal failed', e)
      alert('Background removal failed. See console for details.')
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '✂ Remove background' }
    }
  }

  _emptyOutcome() {
    return {
      name: '', type: 'dichotomous', measureType: 'RR',
      effectValue: '', ci_95: '', cer: '', unit: '',
      direction: 'favors_intervention', certainty: 'moderate', primary: false,
      nStudies: '', nParticipants: '',
      detail: '',
    }
  }

  _renderOutcomeRows() {
    const container = document.getElementById('sof-rows')
    if (!container) return
    container.innerHTML = ''

    this.outcomes.forEach((outcome, i) => {
      const o = outcome
      const isContinuous = o.type === 'continuous'
      const measureOpts = isContinuous ? ['MD', 'SMD'] : ['RR', 'OR']

      const row = document.createElement('div')
      row.className = 'sof-row'
      row.innerHTML = `
        <div class="sof-row-header">
          <span class="sof-row-num">Outcome ${i + 1}</span>
          <div class="sof-row-actions">
            <button class="btn-remove-row" data-idx="${i}" title="Remove">×</button>
          </div>
        </div>

        <div class="outcome-type-bar">
          <button class="type-btn ${!isContinuous ? 'active' : ''}" data-otype="dichotomous" data-idx="${i}">Dichotomous</button>
          <button class="type-btn ${isContinuous ? 'active' : ''}" data-otype="continuous" data-idx="${i}">Continuous</button>
        </div>

        <label>Outcome name
          <input type="text" data-field="name" data-idx="${i}"
            value="${esc(o.name)}" placeholder="${isContinuous ? 'Depression severity' : 'Depression response'}" maxlength="80"/>
        </label>

        <label>Outcome detail <span class="hint">shown below outcome name</span>
          <input type="text" data-field="detail" data-idx="${i}"
            value="${esc(o.detail || '')}" placeholder="e.g. assessed at post-treatment" maxlength="120"/>
        </label>

        ${isContinuous ? `
        <label>Unit <span class="hint">required · shown as (unit) after name</span>
          <input type="text" data-field="unit" data-idx="${i}"
            value="${esc(o.unit)}" placeholder="points" maxlength="30"/>
        </label>` : ''}

        <label>Measure type</label>
        <div class="grade-select">
          ${measureOpts.map(m =>
            `<button class="grade-btn ${o.measureType === m ? 'active' : ''}"
              data-measure="${m}" data-idx="${i}">${m}</button>`
          ).join('')}
        </div>

        <div class="form-row">
          <label>Effect value
            <input type="text" data-field="effectValue" data-idx="${i}"
              value="${esc(o.effectValue)}" placeholder="${isContinuous ? '-1.83' : '1.9'}"/>
          </label>
          <label>95% CI
            <input type="text" data-field="ci_95" data-idx="${i}"
              value="${esc(o.ci_95)}" placeholder="${isContinuous ? '(-3.9 to 0.3)' : '(1.5 to 2.3)'}"/>
          </label>
        </div>

        ${!isContinuous ? `
        <label>CER <span class="hint">control event rate</span>
          <input type="text" data-field="cer" data-idx="${i}"
            value="${esc(o.cer)}" placeholder="17 per 100"/>
        </label>` : ''}

        <div class="form-row">
          <label>k (trials)
            <input type="text" data-field="nStudies" data-idx="${i}"
              value="${esc(o.nStudies)}" placeholder="19"/>
          </label>
          <label>n (participants)
            <input type="text" data-field="nParticipants" data-idx="${i}"
              value="${esc(o.nParticipants)}" placeholder="1234"/>
          </label>
        </div>

        <label>Direction</label>
        <div class="grade-select">
          ${['favors_intervention', 'favors_control', 'unclear'].map(d =>
            `<button class="grade-btn dir-btn dir-${d} ${o.direction === d ? 'active' : ''}"
              data-dir="${d}" data-idx="${i}">${dirLabel(d)}</button>`
          ).join('')}
        </div>

        <label>Certainty</label>
        <div class="grade-select">
          ${['high','moderate','low','very_low'].map(g =>
            `<button class="grade-btn ${o.certainty === g ? 'active' : ''}"
              data-grade="${g}" data-idx="${i}">${gradeLabel(g)}</button>`
          ).join('')}
        </div>
      `
      container.appendChild(row)
    })

    container.querySelectorAll('input[type="text"]').forEach(el => {
      el.addEventListener('input', e => {
        const { field, idx } = e.target.dataset
        if (field !== undefined && idx !== undefined) {
          this.outcomes[+idx][field] = e.target.value
          this._emit()
        }
      })
    })

    container.querySelectorAll('input[type="checkbox"]').forEach(el => {
      el.addEventListener('change', e => {
        const { field, idx } = e.target.dataset
        if (field !== undefined && idx !== undefined) {
          this.outcomes[+idx][field] = e.target.checked
          this._emit()
        }
      })
    })

    container.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const { otype, idx } = e.target.dataset
        this.outcomes[+idx].type = otype
        if (otype === 'continuous' && !['MD', 'SMD'].includes(this.outcomes[+idx].measureType)) {
          this.outcomes[+idx].measureType = 'MD'
        } else if (otype === 'dichotomous' && !['RR', 'OR'].includes(this.outcomes[+idx].measureType)) {
          this.outcomes[+idx].measureType = 'RR'
        }
        this._renderOutcomeRows()
        this._emit()
      })
    })

    container.querySelectorAll('[data-measure]').forEach(btn => {
      btn.addEventListener('click', e => {
        const { measure, idx } = e.target.dataset
        this.outcomes[+idx].measureType = measure
        this._renderOutcomeRows()
        this._emit()
      })
    })

    container.querySelectorAll('[data-dir]').forEach(btn => {
      btn.addEventListener('click', e => {
        const { dir, idx } = e.target.dataset
        this.outcomes[+idx].direction = dir
        this._renderOutcomeRows()
        this._emit()
      })
    })

    container.querySelectorAll('[data-grade]').forEach(btn => {
      btn.addEventListener('click', e => {
        const { grade, idx } = e.target.dataset
        this.outcomes[+idx].certainty = grade
        this._renderOutcomeRows()
        this._emit()
      })
    })

    container.querySelectorAll('.btn-remove-row').forEach(btn => {
      btn.addEventListener('click', e => {
        this.outcomes.splice(+e.target.dataset.idx, 1)
        this._renderOutcomeRows()
        this._emit()
      })
    })

    const addBtn = document.getElementById('btn-add-outcome')
    if (addBtn) addBtn.style.display = this.outcomes.length >= MAX_OUTCOMES ? 'none' : ''
  }
  _renderCustomSections() {
    const container = document.getElementById('custom-section-rows')
    if (!container) return
    container.innerHTML = ''

    this.customSections.forEach((cs, i) => {
      const row = document.createElement('div')
      row.className = 'custom-section-row'
      row.innerHTML = `
        <div class="sof-row-header">
          <span class="sof-row-num">Section ${i + 1}</span>
          <button class="btn-remove-row btn-remove-custom" data-cidx="${i}" title="Remove">×</button>
        </div>
        <label>Section name
          <input type="text" data-cfield="name" data-cidx="${i}"
            value="${esc(cs.name)}" placeholder="Evidence certainty" maxlength="60"/>
        </label>
        <label>Content
          <textarea data-cfield="content" data-cidx="${i}" rows="3"
            placeholder="Describe the section content here.">${esc(cs.content)}</textarea>
        </label>
      `
      container.appendChild(row)
    })

    container.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', e => {
        const { cfield, cidx } = e.target.dataset
        if (cfield !== undefined && cidx !== undefined) {
          this.customSections[+cidx][cfield] = e.target.value
          this._emit()
        }
      })
    })

    container.querySelectorAll('.btn-remove-custom').forEach(btn => {
      btn.addEventListener('click', e => {
        this.customSections.splice(+e.target.dataset.cidx, 1)
        this._renderCustomSections()
        this._emit()
      })
    })

    const addBtn = document.getElementById('btn-add-custom-section')
    if (addBtn) addBtn.style.display = this.customSections.length >= MAX_CUSTOM_SECTIONS ? 'none' : ''
  }

  _switchMode(mode) {
    this._mode = mode
    const formEl = document.getElementById('form-scroll-inner')
    const mdEl   = document.getElementById('markdown-pane')
    const btnForm = document.getElementById('btn-mode-form')
    const btnMd   = document.getElementById('btn-mode-markdown')

    if (mode === 'markdown') {
      // Serialize current state into the textarea
      const ta = document.getElementById('f-markdown-input')
      if (ta) ta.value = stateToMarkdown(this.getState())
      formEl?.classList.add('hidden')
      mdEl?.classList.remove('hidden')
      btnMd?.classList.add('mode-tab-active')
      btnForm?.classList.remove('mode-tab-active')
    } else {
      formEl?.classList.remove('hidden')
      mdEl?.classList.add('hidden')
      btnForm?.classList.add('mode-tab-active')
      btnMd?.classList.remove('mode-tab-active')
    }
  }

  _applyMarkdown() {
    const ta = document.getElementById('f-markdown-input')
    if (!ta) return
    const preset = markdownToPreset(ta.value)
    if (!preset) {
      alert('YAML frontmatter not found.\nPlease make sure the block is enclosed in --- delimiters.')
      return
    }
    this.loadPreset(preset)
    this._switchMode('form')
  }

  _emit() { this.onChange(this.getState()) }

  getState() {
    const v  = id => document.getElementById(id)?.value ?? ''
    const cb = id => document.getElementById(id)?.checked ?? false
    return {
      title:              v('f-title'),
      authors:            v('f-authors'),
      journal:            v('f-journal') || 'Journal',
      year:               v('f-year') || new Date().getFullYear(),
      doi:                v('f-doi'),
      creatorName:        v('f-creator-name'),
      roundedCorners:     cb('f-rounded-corners'),
      font:               v('f-font') || 'calibri',
      populationImageFit:   cb('f-population-image-fill') ? 'cover' : 'contain',
      interventionImageFit: cb('f-intervention-image-fill') ? 'cover' : 'contain',
      controlImageFit:      cb('f-control-image-fill') ? 'cover' : 'contain',
      studyDesignType:    v('f-study-design-type'),
      studyDesignDetail:  v('f-study-design-detail'),
      nStudies:           v('f-n-studies'),
      nParticipants:      v('f-n-participants'),
      population:         v('f-population'),
      populationDetail:   v('f-population-detail'),
      intervention:       v('f-intervention'),
      interventionAbbr:   v('f-intervention-abbr'),
      interventionDetail: v('f-intervention-detail'),
      comparator:         v('f-comparator'),
      comparatorDetail:   v('f-comparator-detail'),
      jamaFindingsMode:   v('f-jama-findings-mode') || 'donut',
      outcomes:           this.outcomes,
      conclusion:         v('f-conclusion'),
      keyLimitations:     v('f-key-limitations'),
      customSections:     this.customSections,
      populationImage:    this.populationImage,
      interventionImage:  this.interventionImage,
      controlImage:       this.controlImage,
      populationImageDx:    parseInt(v('f-population-image-dx'))    || 0,
      populationImageDy:    parseInt(v('f-population-image-dy'))    || 0,
      interventionImageDx:  parseInt(v('f-intervention-image-dx'))  || 0,
      interventionImageDy:  parseInt(v('f-intervention-image-dy'))  || 0,
      controlImageDx:       parseInt(v('f-control-image-dx'))       || 0,
      controlImageDy:       parseInt(v('f-control-image-dy'))       || 0,
    }
  }

  loadPreset(preset) {
    const fieldMap = {
      'f-title':               'title',
      'f-authors':             'authors',
      'f-journal':             'journal',
      'f-year':                'year',
      'f-doi':                 'doi',
      'f-creator-name':        'creatorName',
      'f-study-design-type':   'studyDesignType',
      'f-study-design-detail': 'studyDesignDetail',
      'f-n-studies':           'nStudies',
      'f-n-participants':      'nParticipants',
      'f-population':          'population',
      'f-population-detail':   'populationDetail',
      'f-intervention':        'intervention',
      'f-intervention-abbr':   'interventionAbbr',
      'f-intervention-detail': 'interventionDetail',
      'f-comparator':          'comparator',
      'f-comparator-detail':   'comparatorDetail',
      'f-conclusion':          'conclusion',
      'f-key-limitations':     'keyLimitations',
    }
    Object.entries(fieldMap).forEach(([id, key]) => {
      const el = document.getElementById(id)
      if (el) el.value = preset[key] ?? ''
    })

    // Rounded corners checkbox
    const rcEl = document.getElementById('f-rounded-corners')
    if (rcEl) rcEl.checked = preset.roundedCorners ?? true

    // Font selector
    const fontEl = document.getElementById('f-font')
    if (fontEl) fontEl.value = preset.font ?? 'calibri'

    // JAMA findings mode selector
    const jamaEl = document.getElementById('f-jama-findings-mode')
    if (jamaEl) jamaEl.value = preset.jamaFindingsMode ?? 'donut'

    // Crop toggles
    const cropIds = [
      { id: 'f-population-image-fill',   key: 'populationImageFit'   },
      { id: 'f-intervention-image-fill', key: 'interventionImageFit' },
      { id: 'f-control-image-fill',      key: 'controlImageFit'      },
    ]
    cropIds.forEach(({ id, key }) => {
      const el = document.getElementById(id)
      if (el) el.checked = preset[key] === 'cover'
    })

    // Clear images on preset load
    this.populationImage   = preset.populationImage   || null
    this.interventionImage = preset.interventionImage || null
    this.controlImage      = preset.controlImage      || null
    ;['f-population-image', 'f-intervention-image', 'f-control-image'].forEach(id => {
      const el = document.getElementById(id)
      if (el) el.value = ''
    })

    this.outcomes = (preset.outcomes || []).map(o => ({ ...this._emptyOutcome(), ...o }))
    this.customSections = (preset.customSections || []).map(cs => ({
      name: cs.name || '', content: cs.content || '',
    }))
    this._renderOutcomeRows()
    this._renderCustomSections()
    this._emit()
  }

  clearAll() {
    const ids = [
      'f-title','f-authors','f-journal','f-year','f-doi','f-creator-name',
      'f-study-design-type','f-study-design-detail','f-n-studies','f-n-participants',
      'f-population','f-population-detail','f-intervention','f-intervention-abbr',
      'f-intervention-detail','f-comparator','f-comparator-detail','f-conclusion','f-key-limitations',
    ]
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) el.value = ''
    })

    // Reset JAMA findings mode
    const jamaEl2 = document.getElementById('f-jama-findings-mode')
    if (jamaEl2) jamaEl2.value = 'donut'

    // Reset images and crop toggles
    this.populationImage   = null
    this.interventionImage = null
    this.controlImage      = null
    ;['f-population-image', 'f-intervention-image', 'f-control-image'].forEach(id => {
      const el = document.getElementById(id)
      if (el) el.value = ''
    })
    ;['f-population-image-fill', 'f-intervention-image-fill', 'f-control-image-fill'].forEach(id => {
      const el = document.getElementById(id)
      if (el) el.checked = false
    })

    ;['f-population-image-dx','f-population-image-dy',
      'f-intervention-image-dx','f-intervention-image-dy',
      'f-control-image-dx','f-control-image-dy'].forEach(id => {
      const el = document.getElementById(id)
      if (el) el.value = '0'
    })

    this.outcomes = []
    this.customSections = []
    this._renderOutcomeRows()
    this._renderCustomSections()
    this._emit()
  }
}

function _dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const binary = atob(data)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

function _blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function dirLabel(d) {
  return { favors_intervention: '← Intervention', favors_control: 'Control →', unclear: 'Unclear' }[d] ?? d
}

function esc(str) { return String(str ?? '').replace(/"/g, '&quot;') }
function gradeLabel(g) {
  return { high: 'High', moderate: 'Moderate', low: 'Low', very_low: 'Very Low' }[g] ?? g
}
