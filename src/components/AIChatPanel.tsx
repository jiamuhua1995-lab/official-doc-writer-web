'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { DocumentType } from '@/lib/types'
import { draftSystemPrompt, polishSystemPrompt, continueSystemPrompt, buildDraftUserPrompt } from '@/lib/ai-prompts'

interface ChatMessage {
  role: 'user' | 'ai'
  text: string
}

interface Props {
  documentType: DocumentType
  body: string
  title: string
  onApplyContent: (content: string) => void
  onApplyTitle: (title: string) => void
}

export default function AIChatPanel({ documentType, body, title, onApplyContent, onApplyTitle }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamContent])

  const streamAI = useCallback(async (systemPrompt: string, userPrompt: string, onDone: (result: string) => void) => {
    setIsGenerating(true)
    setStreamContent('')
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let accumulated = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const json = JSON.parse(data)
            const content = json.choices?.[0]?.delta?.content
            if (content) {
              accumulated += content
              setStreamContent(accumulated)
            }
          } catch { /* skip */ }
        }
      }

      onDone(accumulated)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages((prev) => [...prev, { role: 'ai', text: `生成失败：${(err as Error).message}` }])
      }
    } finally {
      setIsGenerating(false)
      setStreamContent('')
      abortRef.current = null
    }
  }, [])

  function cancel() {
    abortRef.current?.abort()
    setIsGenerating(false)
    setStreamContent('')
  }

  function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')
    const sys = draftSystemPrompt(documentType)
    const usr = buildDraftUserPrompt(documentType, trimmed, '', [])
    streamAI(sys, usr, (result) => {
      setMessages((prev) => [...prev, { role: 'ai', text: result }])
      onApplyContent(result)
      autoTitle(result)
    })
  }

  function generateDraft() {
    const topic = title || '请根据公文类型生成初稿'
    setMessages((prev) => [...prev, { role: 'user', text: `生成${documentType}初稿：${topic}` }])
    const sys = draftSystemPrompt(documentType)
    const usr = buildDraftUserPrompt(documentType, topic, '', [])
    streamAI(sys, usr, (result) => {
      setMessages((prev) => [...prev, { role: 'ai', text: result }])
      onApplyContent(result)
      autoTitle(result)
    })
  }

  function polishBody() {
    if (!body) {
      setMessages((prev) => [...prev, { role: 'ai', text: '正文为空，请先输入或生成内容' }])
      return
    }
    setMessages((prev) => [...prev, { role: 'user', text: '润色当前正文' }])
    const sys = polishSystemPrompt(documentType)
    const usr = `请对以下公文内容进行润色优化：\n\n${body}`
    streamAI(sys, usr, (result) => {
      setMessages((prev) => [...prev, { role: 'ai', text: result }])
      onApplyContent(result)
    })
  }

  function continueWriting() {
    if (!body) {
      setMessages((prev) => [...prev, { role: 'ai', text: '正文为空，请先输入或生成内容' }])
      return
    }
    setMessages((prev) => [...prev, { role: 'user', text: '续写正文' }])
    const sys = continueSystemPrompt(documentType)
    const usr = `请基于以下已有内容继续撰写：\n\n${body}`
    streamAI(sys, usr, (result) => {
      setMessages((prev) => [...prev, { role: 'ai', text: result }])
      onApplyContent(body + '\n' + result)
    })
  }

  function generateTitle() {
    if (!body) {
      setMessages((prev) => [...prev, { role: 'ai', text: '正文为空，请先输入或生成内容' }])
      return
    }
    setMessages((prev) => [...prev, { role: 'user', text: '根据正文生成标题' }])
    autoTitle(body)
  }

  function autoTitle(content: string) {
    if (content.length < 20) return
    const sys = draftSystemPrompt(documentType)
    const usr = `请根据以下${documentType}正文，生成一个规范的公文标题。只输出标题，不加引号和标点，不解释。\n\n${content.slice(0, 500)}`
    streamAI(sys, usr, (result) => {
      const clean = result.trim().replace(/["""]/g, '')
      if (clean && clean.length <= 50) {
        onApplyTitle(clean)
        setMessages((prev) => [...prev, { role: 'ai', text: `已生成标题：${clean}` }])
      }
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isGenerating && (
          <div className="text-center py-16 text-[var(--text-tertiary)]">
            <p className="text-4xl mb-3">✨</p>
            <p className="font-semibold text-lg text-[var(--text-primary)]">AI 写作助手</p>
            <p className="text-sm mt-1">输入公文主题直接生成，或用快捷按钮操作</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-[var(--primary)] text-white rounded-br-md'
                : 'bg-gray-100 text-[var(--text-primary)] rounded-bl-md'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isGenerating && streamContent && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-gray-100 text-sm whitespace-pre-wrap">
              {streamContent}
              <span className="inline-block w-1.5 h-4 bg-[var(--primary)] ml-0.5 animate-pulse" />
            </div>
          </div>
        )}
        {isGenerating && !streamContent && (
          <div className="flex justify-start">
            <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-gray-100 text-sm text-[var(--text-tertiary)]">
              思考中...
            </div>
          </div>
        )}
      </div>

      {/* Quick actions + input */}
      <div className="border-t border-[var(--border)] bg-white p-3 space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <QuickBtn label="生成初稿" icon="✨" disabled={isGenerating} onClick={generateDraft} />
          <QuickBtn label="生成标题" icon="📝" disabled={isGenerating} onClick={generateTitle} />
          <QuickBtn label="润色正文" icon="🪄" disabled={isGenerating} onClick={polishBody} />
          <QuickBtn label="续写" icon="📖" disabled={isGenerating} onClick={continueWriting} />
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="输入主题或要求..."
            className="flex-1 px-4 py-2 rounded-full border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)]"
            disabled={isGenerating}
          />
          {isGenerating ? (
            <button onClick={cancel} className="px-4 py-2 rounded-full bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition">
              停止
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-4 py-2 rounded-full bg-[var(--primary)] text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition"
            >
              发送
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickBtn({ label, icon, disabled, onClick }: { label: string; icon: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[var(--primary)] bg-blue-50 hover:bg-blue-100 transition whitespace-nowrap disabled:opacity-40"
    >
      {icon} {label}
    </button>
  )
}
