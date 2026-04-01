'use client'

import { useState, useEffect } from 'react'
import { Document, DocumentType, DOCUMENT_TYPES, DOC_TYPE_ICONS } from '@/lib/types'
import { loadDocuments, saveDocument, deleteDocument } from '@/lib/storage'
import { getTemplateStructure } from '@/lib/templates'
import { v4 as uuid } from 'uuid'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [showNewDoc, setShowNewDoc] = useState(false)
  const [filterType, setFilterType] = useState<DocumentType | null>(null)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => { setDocuments(loadDocuments()) }, [])

  const filtered = documents
    .filter((d) => !filterType || d.type === filterType)
    .filter((d) => !search || d.title.includes(search) || d.body.includes(search))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  function createDoc(type: DocumentType) {
    const tpl = getTemplateStructure(type)
    const now = new Date().toISOString()
    const doc: Document = {
      id: uuid(), type, title: tpl.titlePlaceholder, sendTo: tpl.sendToPlaceholder,
      body: tpl.bodyPlaceholder, attachmentNote: '', issuer: '', issueDate: now,
      documentNumber: '', signer: '', ccTo: '', printOrg: '', printDate: now,
      createdAt: now, updatedAt: now, isDeleted: false,
    }
    saveDocument(doc)
    router.push(`/editor?id=${doc.id}`)
  }

  function handleDelete(id: string) {
    if (!confirm('确定删除这篇公文？')) return
    deleteDocument(id)
    setDocuments(loadDocuments())
  }

  function handleDuplicate(doc: Document) {
    const now = new Date().toISOString()
    const copy: Document = { ...doc, id: uuid(), title: `${doc.title}（副本）`, createdAt: now, updatedAt: now }
    saveDocument(copy)
    setDocuments(loadDocuments())
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">📝 公文写作助手</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">AI 辅助生成符合国标的公文</p>
        </div>
        <button
          onClick={() => setShowNewDoc(true)}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition text-sm font-medium"
        >
          + 新建公文
        </button>
      </div>

      {/* 新建公文弹窗 */}
      {showNewDoc && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowNewDoc(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">选择公文类型</h2>
            <div className="grid grid-cols-2 gap-3">
              {DOCUMENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => { setShowNewDoc(false); createDoc(type) }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-blue-50/50 transition text-left"
                >
                  <span className="text-2xl">{DOC_TYPE_ICONS[type]}</span>
                  <span className="font-medium text-sm">{type}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowNewDoc(false)} className="mt-4 w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              取消
            </button>
          </div>
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="搜索公文..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]"
        />
        <select
          value={filterType || ''}
          onChange={(e) => setFilterType((e.target.value as DocumentType) || null)}
          className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]"
        >
          <option value="">全部类型</option>
          {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* 文档列表 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-tertiary)]">
          <p className="text-4xl mb-4">📄</p>
          <p>暂无公文，点击右上角新建</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl p-4 border border-[var(--border)] hover:shadow-md transition cursor-pointer group"
              onClick={() => router.push(`/editor?id=${doc.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-[var(--primary)] font-medium">
                      {doc.type}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {new Date(doc.updatedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <h3 className="font-medium truncate">{doc.title || '未命名公文'}</h3>
                  <p className="text-sm text-[var(--text-secondary)] truncate mt-1">
                    {doc.body.replace(/\s+/g, ' ').slice(0, 80) || '暂无内容'}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition ml-3" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleDuplicate(doc)} className="p-2 rounded-lg hover:bg-gray-100 text-[var(--text-secondary)]" title="复制">
                    📋
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="删除">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
