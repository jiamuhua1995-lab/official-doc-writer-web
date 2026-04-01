'use client'

import { Document } from '@/lib/types'

interface Props {
  document: Document
}

export default function ExportButton({ document: doc }: Props) {
  function exportText() {
    const lines: string[] = []
    if (doc.title) lines.push(doc.title, '')
    if (doc.sendTo) lines.push(doc.sendTo, '')
    if (doc.body) lines.push(doc.body, '')
    if (doc.attachmentNote) lines.push(`附件：${doc.attachmentNote}`, '')
    if (doc.issuer) lines.push(doc.issuer)
    if (doc.documentNumber) lines.push(doc.documentNumber)
    const dateStr = new Date(doc.issueDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    lines.push(dateStr)

    const text = lines.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const title = doc.title || '未命名公文'
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    a.href = url
    a.download = `${title}_${date}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={exportText}
      className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] hover:bg-gray-50 transition flex items-center gap-1"
      title="导出文本"
    >
      📤 导出
    </button>
  )
}
