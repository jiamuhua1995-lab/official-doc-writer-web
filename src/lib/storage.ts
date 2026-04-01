import { Document } from './types'

const STORAGE_KEY = 'odw_documents'

export function loadDocuments(): Document[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return (JSON.parse(raw) as Document[]).filter((d) => !d.isDeleted)
  } catch {
    return []
  }
}

export function loadAllDocuments(): Document[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveDocument(doc: Document): void {
  const all = loadAllDocuments()
  const idx = all.findIndex((d) => d.id === doc.id)
  if (idx >= 0) all[idx] = doc
  else all.push(doc)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function deleteDocument(id: string): void {
  const all = loadAllDocuments()
  const idx = all.findIndex((d) => d.id === id)
  if (idx >= 0) {
    all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  }
}

export function getDocument(id: string): Document | undefined {
  return loadAllDocuments().find((d) => d.id === id && !d.isDeleted)
}
