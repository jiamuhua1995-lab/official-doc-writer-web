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

/** 导出所有文档为 JSON 字符串 */
export function exportAllData(): string {
  const docs = loadAllDocuments()
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), documents: docs }, null, 2)
}

/** 从 JSON 字符串导入文档，返回导入数量 */
export function importAllData(jsonStr: string): number {
  const data = JSON.parse(jsonStr)
  const docs: Document[] = data.documents || data
  if (!Array.isArray(docs)) throw new Error('数据格式不正确')
  const existing = loadAllDocuments()
  const existingIds = new Set(existing.map((d) => d.id))
  let count = 0
  for (const doc of docs) {
    if (!doc.id || !doc.type) continue
    if (existingIds.has(doc.id)) {
      // 用更新时间更晚的版本覆盖
      const idx = existing.findIndex((d) => d.id === doc.id)
      if (idx >= 0 && doc.updatedAt > existing[idx].updatedAt) {
        existing[idx] = doc
        count++
      }
    } else {
      existing.push(doc)
      count++
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  return count
}
