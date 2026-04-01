'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Document } from '@/lib/types'
import { getDocument, saveDocument } from '@/lib/storage'
import DocumentEditor from '@/components/DocumentEditor'
import AIChatPanel from '@/components/AIChatPanel'
import PhrasePanel from '@/components/PhrasePanel'
import ExportButton from '@/components/ExportButton'

type Tab = 'doc' | 'ai'

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [doc, setDoc] = useState<Document | null>(null)
  const [tab, setTab] = useState<Tab>('doc')
  const [showPhrases, setShowPhrases] = useState(false)
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const docRef = useRef<Document | null>(null)

  useEffect(() => {
    const loaded = getDocument(id)
    if (!loaded) { router.replace('/'); return }
    setDoc(loaded)
    docRef.current = loaded
  }, [id, router])

  // 自动保存 30s
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
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[var(--border)]">
        <button onClick={handleBack} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1">
          ← 返回
        </button>
        <span className="text-sm font-medium">{doc.type}</span>
        <ExportButton document={doc} />
      </div>

      {/* Tab switcher */}
      <div className="flex bg-white border-b border-[var(--border)]">
        <TabBtn label="📄 公文内容" active={tab === 'doc'} onClick={() => setTab('doc')} />
        <TabBtn label="✨ AI 对话" active={tab === 'ai'} onClick={() => setTab('ai')} />
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

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-medium transition ${
        active
          ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-blue-50/30'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      }`}
    >
      {label}
    </button>
  )
}
