'use client'

import { useMemo } from 'react'
import { Document } from '@/lib/types'
import { generateDocContent, generatePrintCSS } from '@/lib/export-utils'

interface Props {
  doc: Document
}

export default function PreviewPanel({ doc }: Props) {
  const html = useMemo(() => generateDocContent(doc), [doc])
  const css = useMemo(() => generatePrintCSS(), [])

  // 预览区内嵌样式（非打印模式，模拟 A4 纸张）
  const previewCSS = `
    ${css}
    @page { margin: 0; }
    body {
      background: #fff;
      padding: 60px 50px;
      max-width: 100%;
      min-height: 100%;
    }
  `

  return (
    <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg rounded-sm overflow-hidden">
        {/* 红色版头线 */}
        <div className="h-1 bg-red-600" />
        <div
          className="p-[60px_50px]"
          style={{
            fontFamily: "'仿宋', FangSong, STFangsong, serif",
            fontSize: '16pt',
            lineHeight: '28.6pt',
            color: '#000',
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: scopedCSS() }} />
          <div className="preview-content" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  )
}

function scopedCSS(): string {
  return `
    .preview-content h1 {
      font-family: '方正小标宋', '华文中宋', SimSun, STSong, serif;
      font-size: 22pt;
      text-align: center;
      line-height: 1.4;
      font-weight: bold;
      margin-bottom: 20pt;
      letter-spacing: 0.5pt;
    }
    .preview-content .doc-number {
      text-align: center;
      font-size: 16pt;
      margin-bottom: 20pt;
      color: #333;
    }
    .preview-content .signer {
      text-align: right;
      font-size: 16pt;
      margin-bottom: 10pt;
    }
    .preview-content .send-to {
      font-size: 16pt;
      margin-bottom: 10pt;
    }
    .preview-content .body-text {
      font-size: 16pt;
      line-height: 28.6pt;
      text-align: justify;
    }
    .preview-content .body-text p {
      text-indent: 2em;
      margin: 0 0 0.3em 0;
    }
    .preview-content .attachment {
      margin-top: 20pt;
      font-size: 14pt;
    }
    .preview-content .issuer {
      text-align: right;
      margin-top: 40pt;
      font-size: 16pt;
    }
    .preview-content .date {
      text-align: right;
      font-size: 14pt;
      margin-top: 4pt;
    }
    .preview-content .cc {
      margin-top: 30pt;
      font-size: 14pt;
      border-top: 1px solid #000;
      padding-top: 8pt;
    }
    .preview-content .print-org {
      font-size: 14pt;
      border-bottom: 1px solid #000;
      padding-bottom: 8pt;
    }
  `
}
