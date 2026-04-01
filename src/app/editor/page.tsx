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
