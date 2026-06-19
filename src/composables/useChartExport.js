// src/composables/useChartExport.js

import domtoimage from 'dom-to-image-more'
import JSZip from 'jszip'

export function useChartExport() {

  async function exportElement(el, filename = 'chart', format = 'png') {
    const scale = window.devicePixelRatio || 2
    const options = buildOptions(el, scale)

    try {
      let dataUrl

      if (format === 'jpg') {
        dataUrl = await domtoimage.toJpeg(el, { ...options, quality: 0.92 })
      } else {
        dataUrl = await domtoimage.toPng(el, options)
      }

      const link = document.createElement('a')
      link.download = `${filename}.${format}`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.warn('Chart export failed:', err)
    }
  }

  async function exportAllCharts(format = 'png') {
    const cards = document.querySelectorAll('.chart-card')

    if (!cards.length) {
      console.warn('No .chart-card elements found')
      return
    }

    const zip = new JSZip()
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
    const scale = window.devicePixelRatio || 2

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i]
      const title = card.querySelector('.chart-card__title')?.textContent?.trim() ?? `chart-${i + 1}`
      const filename = `${String(i + 1).padStart(2, '0')}-${title.toLowerCase().replace(/\s+/g, '-')}.${format}`
      const options = buildOptions(card, scale)

      try {
        let dataUrl
        if (format === 'jpg') {
          dataUrl = await domtoimage.toJpeg(card, { ...options, quality: 0.92 })
        } else {
          dataUrl = await domtoimage.toPng(card, options)
        }

        // Base64 without header
        const base64 = dataUrl.split(',')[1]
        zip.file(filename, base64, { base64: true })
      } catch (err) {
        console.warn(`Skipped: ${filename}`, err)
      }
    }

    // Download everything as a ZIP file
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.download = `zeitwerk-charts.zip`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  function buildOptions(el, scale) {
    return {
      width: el.offsetWidth * scale,
      height: el.offsetHeight * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: el.offsetWidth + 'px',
        height: el.offsetHeight + 'px',
      },
      filter: node => {
        if (node.tagName === 'LINK') {
          const href = node.getAttribute?.('href') ?? ''

          return !href.includes('fonts.googleapis.com')
        }

        return true
      }
    }
  }

  return { exportElement, exportAllCharts }
}
