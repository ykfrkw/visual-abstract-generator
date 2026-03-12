/**
 * PNG Exporter
 * Exports the canvas as a PNG file at various resolutions.
 */

export const PNG_PRESETS = {
  sns:    { label: 'SNS (1024px)',      multiplier: 1.0,  suffix: 'sns' },
  hd:     { label: 'SNS HD (2048px)',   multiplier: 2.0,  suffix: 'hd' },
  print:  { label: 'Journal 300 DPI',   multiplier: 4.17, suffix: '300dpi' },
}

/**
 * @param {CanvasManager} manager
 * @param {'sns'|'hd'|'print'} preset
 * @param {string} filename  base filename (no extension)
 */
export async function exportPng(manager, preset, filename = 'visual-abstract') {
  const { multiplier, suffix } = PNG_PRESETS[preset]
  const blob = await manager.exportPng(multiplier)
  triggerDownload(blob, `${filename}_${suffix}.png`)
}

function triggerDownload(blob, filename) {
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
