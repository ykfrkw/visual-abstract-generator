/**
 * CanvasManager — wraps Fabric.js canvas, handles template rendering
 */

import * as fabric from 'fabric'
import { buildBmjTemplate,  BMJ_W,  BMJ_H  } from './templates/bmj.js'
import { buildJamaTemplate, JAMA_W, JAMA_H } from './templates/jama.js'
import { PRESET_PALETTES } from '../data/palettes.js'

const TEMPLATE_DIMS = {
  bmj:  { w: BMJ_W,  h: BMJ_H  },
  jama: { w: JAMA_W, h: JAMA_H },
}

export class CanvasManager {
  constructor(canvasEl) {
    this.canvas = new fabric.Canvas(canvasEl, {
      width: BMJ_W,
      height: BMJ_H,
      selection: false,
      renderOnAddRemove: false,
    })
    this.template   = 'bmj'
    this.palette    = PRESET_PALETTES[0]
    this._rendering = false
    this._lastState = null
  }

  /** Re-render the canvas with the given state (async-safe debounce) */
  render(state) {
    this._lastState = state
    if (this._rendering) return
    this._rendering = true
    requestAnimationFrame(async () => {
      await this._doRender(this._lastState)
      this._rendering = false
      if (this._lastState !== state) this.render(this._lastState)
    })
  }

  async _doRender(state) {
    const canvas = this.canvas
    canvas.clear()

    let objects = []
    if (this.template === 'bmj') {
      objects = await buildBmjTemplate(fabric, state, this.palette)
    } else if (this.template === 'jama') {
      objects = await buildJamaTemplate(fabric, state, this.palette)
    }

    objects.forEach(obj => canvas.add(obj))

    const { w, h } = TEMPLATE_DIMS[this.template] || TEMPLATE_DIMS.bmj

    // Rounded corners via clipPath
    if (state?.roundedCorners) {
      canvas.clipPath = new fabric.Rect({
        left: 0, top: 0,
        width: w, height: h,
        rx: 16, ry: 16,
        absolutePositioned: true,
      })
    } else {
      canvas.clipPath = null
    }

    canvas.renderAll()
  }

  setTemplate(name) {
    this.template = name
    const { w, h } = TEMPLATE_DIMS[name] || TEMPLATE_DIMS.bmj
    this.canvas.setDimensions({ width: w, height: h })
  }

  setPalette(presetId) {
    this.palette = PRESET_PALETTES.find(p => p.id === presetId) || PRESET_PALETTES[0]
  }

  getDimensions() {
    return TEMPLATE_DIMS[this.template] || TEMPLATE_DIMS.bmj
  }

  getCanvas() { return this.canvas }

  /**
   * Export PNG as Blob.
   * @param {number} multiplier  1 = native size, 4.17 ≈ 300 DPI equivalent
   * @returns {Promise<Blob>}
   */
  async exportPng(multiplier = 1) {
    try {
      const blob = await this.canvas.toBlob({ format: 'png', multiplier })
      if (blob) return blob
    } catch (_) { /* fall through */ }
    const dataUrl = this.canvas.toDataURL({ format: 'png', multiplier })
    return dataUrlToBlob(dataUrl)
  }

  /**
   * Get DataURL (for jsPDF embedding).
   * @param {number} multiplier
   * @returns {string}
   */
  exportDataUrl(multiplier = 4.17) {
    return this.canvas.toDataURL({ format: 'png', multiplier })
  }

  destroy() { this.canvas.dispose() }
}

/** Convert a base64 dataURL to a Blob */
function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const bytes = atob(data)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}
