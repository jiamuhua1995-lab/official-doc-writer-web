'use client'

import { useState, useRef, useEffect } from 'react'
import { Document } from '@/lib/types'
import { generateDocContent, generatePrintCSS } from '@/lib/export-utils'

interface Props {
  document: Document
}

export default function ExportButton({ document: doc }: Props) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [open])

  function exportAsDoc() {
    setOpen(false)
    const html = generateDocContent(doc)
    const blob = new Blob([
      `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${doc.title || '未命名公文'}</title>
<style>
  @page { size: A4; margin: 3.7cm 2.8cm 3.5cm 2.6cm; }
  body { font-family: '仿宋', FangSong, serif; font-size: 16pt; line-height: 28.6pt; color: #000; }
  h1 { font-family: '方正小标宋', '华文中宋', SimSun, serif; font-size: 22pt; text-align: center; line-height: 1.4; font-weight: bold; margin-bottom: 20pt; }
  .send-to { font-size: 16pt; margin-bottom: 10pt; }
  .body-text { font-size: 16pt; line-height: 28.6pt; text-align: justify; }
  .body-text p { text-indent: 2em; margin: 0 0 0.5em 0; }
  .issuer { text-align: right; margin-top: 30pt; font-size: 16pt; }
  .date { text-align: right; font-size: 14pt; }
  .doc-number { text-align: center; font-size: 16pt; margin-bottom: 20pt; }
  .attachment { margin-top: 20pt; font-size: 14pt; }
  .cc { margin-top: 20pt; font-size: 14pt; border-top: 1px solid #000; padding-top: 8pt; }
</style></head><body>${html}</body></html>`
    ], { type: 'application/msword;charset=utf-8' })
    downloadBlob(blob, `${doc.title || '未命名公文'}.doc`)
  }

  function exportAsPdf() {
    setOpen(false)
    const html = generateDocContent(doc)
    const css = generatePrintCSS()
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${doc.title || '未命名公文'}</title><style>${css}</style></head><body>${html}</body></html>`)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] hover:bg-gray-50 transition flex items-center gap-1"
        title="导出文档"
      >
        📤 导出 ▾
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-[var(--border)] z-50 py-1">
          <button onClick={exportAsDoc} className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition flex items-center gap-2">
            📄 导出为 DOC
          </button>
          <button onClick={exportAsPdf} className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition flex items-center gap-2">
            📑 导出为 PDF
          </button>
        </div>
      )}
    </div>
  )
}
