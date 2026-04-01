// 公文类型
export type DocumentType = '通知' | '请示' | '报告' | '函' | '批复' | '决定' | '意见' | '纪要'

export const DOCUMENT_TYPES: DocumentType[] = ['通知', '请示', '报告', '函', '批复', '决定', '意见', '纪要']

export const DOC_TYPE_ICONS: Record<DocumentType, string> = {
  '通知': '🔔', '请示': '✋', '报告': '📊', '函': '✉️',
  '批复': '↩️', '决定': '✅', '意见': '💬', '纪要': '📋',
}

// 公文模型
export interface Document {
  id: string
  type: DocumentType
  title: string
  sendTo: string
  body: string
  attachmentNote: string
  issuer: string
  issueDate: string // ISO date string
  documentNumber: string
  signer: string
  ccTo: string
  printOrg: string
  printDate: string
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}

// 模板结构
export interface TemplateStructure {
  titlePlaceholder: string
  sendToPlaceholder: string
  bodyPlaceholder: string
  sections: { name: string; placeholder: string; isRequired: boolean }[]
}

export interface DocumentTemplate {
  id: string
  name: string
  type: DocumentType
  isPreset: boolean
  structure: TemplateStructure
}

// 常用语
export type PhraseCategory = '开头用语' | '过渡用语' | '结尾用语' | '批复用语' | '通知用语' | '请示用语'

export interface Phrase {
  id: string
  text: string
  category: PhraseCategory
  isFavorite: boolean
}
