/**
 * PDF Exporter (jsPDF)
 */

export const PDF_PRESETS = {
  square: { label: 'Square 90×90mm',  w: 90,  h: 90,  orientation: 'portrait' },
  a4:     { label: 'A4 Portrait',      w: 210, h: 297, orientation: 'portrait' },
}

/**
 * @param {CanvasManager} manager
 * @param {'square'|'a4'} preset
 * @param {string} filename
 */
export async function exportPdf(manager, preset, filename = 'visual-abstract') {
  const { jsPDF } = await import('jspdf')
  const { w, h, orientation } = PDF_PRESETS[preset]

  const imgData = manager.exportDataUrl(4.17)

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [w, h],
  })

  // Center image on page, maintaining actual canvas aspect ratio
  const { w: cw, h: ch } = manager.getDimensions()
  const canvasAspect = cw / ch
  const pageAspect   = w / h
  let imgW, imgH, imgX, imgY

  if (canvasAspect >= pageAspect) {
    imgW = w
    imgH = w / canvasAspect
    imgX = 0
    imgY = (h - imgH) / 2
  } else {
    imgH = h
    imgW = h * canvasAspect
    imgX = (w - imgW) / 2
    imgY = 0
  }

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgW, imgH)
  pdf.save(`${filename}.pdf`)
}
