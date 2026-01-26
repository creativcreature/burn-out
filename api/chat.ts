import type { VercelRequest, VercelResponse } from '@vercel/node'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  provider: 'gemini' | 'claude'
  systemPrompt: string
}

interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

// Gemini API handler
async function callGemini(messages: ChatMessage[], systemPrompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not configured')
  }

  // Convert to Gemini format
  const geminiMessages: GeminiMessage[] = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }))

  // Prepend system prompt to first user message
  if (geminiMessages.length > 0 && geminiMessages[0].role === 'user') {
    geminiMessages[0] = {
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser message: ${geminiMessages[0].parts[0].text}` }]
    }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    console.error('Gemini API Error:', error)
    throw new Error('Gemini API request failed')
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// Claude API handler
async function callClaude(messages: ChatMessage[], systemPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  // Convert to Claude format (system is separate)
  const claudeMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }))

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: claudeMessages
    })
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Claude API Error:', error)
    throw new Error('Claude API request failed')
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages, provider, systemPrompt } = req.body as ChatRequest

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    if (!provider || !['gemini', 'claude'].includes(provider)) {
      return res.status(400).json({ error: 'Valid provider (gemini or claude) is required' })
    }

    if (!systemPrompt) {
      return res.status(400).json({ error: 'System prompt is required' })
    }

    let content: string

    if (provider === 'gemini') {
      content = await callGemini(messages, systemPrompt)
    } else {
      content = await callClaude(messages, systemPrompt)
    }

    return res.status(200).json({ content })
  } catch (error) {
    console.error('Chat API Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
