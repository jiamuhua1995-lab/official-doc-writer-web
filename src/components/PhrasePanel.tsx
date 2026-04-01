'use client'

import { PhraseCategory } from '@/lib/types'
import { presetPhrases } from '@/lib/phrases'

interface Props {
  onInsert: (text: string) => void
  onClose: () => void
}

const categories = Object.keys(presetPhrases) as PhraseCategory[]

export default function PhrasePanel({ onInsert, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">常用语库</h2>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">✕</button>
        </div>
        {categories.map((cat) => (
          <div key={cat} className="mb-4">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">{cat}</h3>
            <div className="flex flex-wrap gap-2">
              {presetPhrases[cat].map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => { onInsert(phrase); onClose() }}
                  className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-blue-50/50 transition"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
