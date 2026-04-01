'use client'

import { Document } from '@/lib/types'

interface Props {
  doc: Document
  onChange: (doc: Document) => void
  onShowPhrases: () => void
}

export default function DocumentEditor({ doc, onChange, onShowPhrases }: Props) {
  const wordCount = doc.body.replace(/\s/g, '').length

  function update(fields: Partial<Document>) {
    onChange({ ...doc, ...fields, updatedAt: new Date().toISOString() })
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* 标题 */}
      <Field label="标题">
        <input
          value={doc.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="请输入公文标题"
          className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-base font-medium focus:outline-none focus:border-[var(--primary)]"
        />
      </Field>

      {/* 主送机关 */}
      <Field label="主送机关">
        <input
          value={doc.sendTo}
          onChange={(e) => update({ sendTo: e.target.value })}
          placeholder="请输入主送机关"
          className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]"
        />
      </Field>

      {/* 正文 */}
      <Field label="正文" right={
        <div className="flex items-center gap-2">
          <button onClick={onShowPhrases} className="text-xs text-[var(--primary)] hover:underline">插入常用语</button>
          <span className="text-xs text-[var(--text-tertiary)] bg-blue-50 px-2 py-0.5 rounded">{wordCount} 字</span>
        </div>
      }>
        <textarea
          value={doc.body}
          onChange={(e) => update({ body: e.target.value })}
          placeholder="请输入正文内容"
          rows={16}
          className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-sm leading-relaxed resize-y focus:outline-none focus:border-[var(--primary)]"
        />
      </Field>

      {/* 附件说明 */}
      <Field label="附件说明">
        <input
          value={doc.attachmentNote}
          onChange={(e) => update({ attachmentNote: e.target.value })}
          placeholder="如有附件请说明"
          className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]"
        />
      </Field>

      {/* 版头版记 */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2">
          ▸ 版头版记
        </summary>
        <div className="space-y-3 mt-2 pl-2">
          <SmallField label="发文机关署名" value={doc.issuer} onChange={(v) => update({ issuer: v })} placeholder="发文机关" />
          <SmallField label="发文字号" value={doc.documentNumber} onChange={(v) => update({ documentNumber: v })} placeholder="例：国发〔2024〕1号" />
          <SmallField label="签发人" value={doc.signer} onChange={(v) => update({ signer: v })} placeholder="签发人姓名" />
          <SmallField label="抄送机关" value={doc.ccTo} onChange={(v) => update({ ccTo: v })} placeholder="抄送机关" />
          <SmallField label="印发机关" value={doc.printOrg} onChange={(v) => update({ printOrg: v })} placeholder="印发机关" />
        </div>
      </details>

      <div className="h-8" />
    </div>
  )
}

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>
        {right}
      </div>
      {children}
    </div>
  )
}

function SmallField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="text-xs text-[var(--text-tertiary)] mb-1 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]"
      />
    </div>
  )
}
