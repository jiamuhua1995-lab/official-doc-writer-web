'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Document } from '@/lib/types'
import { getDocument, saveDocument } from '@/lib/storage'
import DocumentEditor from '@/components/DocumentEditor'
import AIChatPanel from '@/components/AIChatPanel'
import PhrasePanel from '@/components/PhrasePanel'
import ExportButton from '@/components/ExportButton'

type Tab = 'doc' | 'ai'

function EditorContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const router = useRouter()
  const [doc, setDoc] = useState<Document | null>(null)
  const [tab, setTab] = useState<Tab>('doc')
  const [showPhrases, setShowPhrases] = useState(false)
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const docRef = useRef<Document | null>(null)

  useEffect(() => {
    if (!id) { router.replace('/'); return }
    const loaded = getDocument(id)
    if (!loaded) { router.replace('/'); return }
    setDoc(loaded)
    docRef.current = loaded
  }, [id, router])

  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      if (docRef.current) saveDocument(docRef.current)
    }, 30000)
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current) }
  }, [])

  const handleChange = useCallback((updated: Document) => {
    setDoc(updated)
    docRef.current = updated
  }, [])

  function handleBack() {
    if (docRef.current) saveDocument(docRef.current)
    router.push('/')
  }

  if (!doc) return <div className="flex items-center justify-center h-screen text-[var(--text-tertiary)]">加载中...</div>

  return (
    <div className="h-screen flex flex-col bg-[var(--bg)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-white">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">← 返回</button>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-[var(--primary)] font-medium">{doc.type}</span>
          <span className="text-sm font-medium truncate max-w-[200px]">{doc.title || '未命名公文'}</span>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton document={doc} />
          <button
            onClick={() => { if (docRef.current) saveDocument(docRef.current) }}
            className="px-3 py-1.5 text-sm rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition"
          >
            💾 保存
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[var(--border)] bg-white">
        <button
          onClick={() => setTab('doc')}
          className={`flex-1 py-2.5 text-sm font-medium transition ${tab === 'doc' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}
        >
          📝 编辑
        </button>
        <button
          onClick={() => setTab('ai')}
          className={`flex-1 py-2.5 text-sm font-medium transition ${tab === 'ai' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}
        >
          ✨ AI 助手
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'doc' ? (
          <DocumentEditor doc={doc} onChange={handleChange} onShowPhrases={() => setShowPhrases(true)} />
        ) : (
          <AIChatPanel
            documentType={doc.type}
            body={doc.body}
            title={doc.title}
            onApplyContent={(content) => handleChange({ ...doc, body: content, updatedAt: new Date().toISOString() })}
            onApplyTitle={(title) => handleChange({ ...doc, title, updatedAt: new Date().toISOString() })}
          />
        )}
      </div>

      {/* Phrase panel */}
      {showPhrases && (
        <PhrasePanel
          onInsert={(text) => handleChange({ ...doc, body: doc.body + text, updatedAt: new Date().toISOString() })}
          onClose={() => setShowPhrases(false)}
        />
      )}
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-[var(--text-tertiary)]">加载中...</div>}>
      <EditorContent />
    </Suspense>
  )
}
