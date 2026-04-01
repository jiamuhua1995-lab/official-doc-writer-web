import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { systemPrompt, userPrompt } = await req.json()

  const apiKey = process.env.AI_API_KEY || ''
  const baseURL = process.env.AI_BASE_URL || 'https://api.siliconflow.cn/v1'
  const model = process.env.AI_MODEL_NAME || 'deepseek-ai/DeepSeek-V3'

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    return new Response(JSON.stringify({ error: `API 错误: ${response.status}` }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 透传 SSE 流
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
