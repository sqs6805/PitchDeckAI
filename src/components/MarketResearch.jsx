import { useState, useRef, useEffect } from 'react'
import { track } from '../utils/analytics'

const SUGGESTIONS = [
  'Who are the main competitors in AI-powered sales automation?',
  'What is the market size for B2B SaaS in healthcare compliance?',
  'What GTM strategies work best for developer-focused startups?',
  'What do Series A VCs look for in fintech startups?',
  'What metrics do VCs benchmark for SaaS at seed stage?',
]

function formatResponse(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^#{1,2} (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^[-•*] (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/(<li>.*?<\/li>\n?)+/gs, m => `<ul>${m}</ul>`)
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^(?!<[h|u|l|p])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<[h|u])/g, '$1')
    .replace(/(<\/[h|u][^>]*>)<\/p>/g, '$1')
}

function UserMessage({ text }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-lg rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed"
        style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.2)', color: 'var(--text)' }}
      >
        {text}
      </div>
    </div>
  )
}

function AIMessage({ text, loading, usedWebSearch }) {
  return (
    <div className="flex gap-3">
      <div
        className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-black mt-0.5"
        style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white' }}
      >
        AI
      </div>
      <div className="flex-1 max-w-2xl">
        <div
          className="rounded-2xl rounded-tl-sm px-5 py-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {loading ? (
            <div className="flex items-center gap-2.5" style={{ color: 'var(--text-faint)' }}>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: 'var(--accent)', animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
              <span className="text-sm">Researching…</span>
            </div>
          ) : (
            <div
              className="research-content text-sm"
              style={{ color: 'var(--text-muted)' }}
              dangerouslySetInnerHTML={{ __html: formatResponse(text) }}
            />
          )}
        </div>
        {usedWebSearch !== undefined && (
          <p className="text-xs mt-1.5 ml-1" style={{ color: 'var(--text-faint)' }}>
            {usedWebSearch ? '🌐 Live web search' : '📚 Training knowledge'}
          </p>
        )}
      </div>
    </div>
  )
}

export default function MarketResearch() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi — I'm your market research assistant. Ask me about competitor landscapes, market sizing, GTM strategies, or what VCs look for in your space. I'll give you concrete data points you can use in your deck.",
  }])
  const [input, setInput] = useState('')
  const [context, setContext] = useState('')
  const [showContext, setShowContext] = useState(false)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (query) => {
    const q = query || input.trim()
    if (!q || loading) return
    setInput('')
    setLoading(true)

    track.researchQuery()
    const startedAt = Date.now()
    setMessages(prev => [
      ...prev,
      { role: 'user', content: q },
      { role: 'assistant', content: '', loading: true },
    ])

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, context: context || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Research failed')
      track.researchSucceeded(Date.now() - startedAt, data.usedWebSearch)
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { role: 'assistant', content: data.response, usedWebSearch: data.usedWebSearch } : m
      ))
    } catch (err) {
      track.researchFailed(err.message, Date.now() - startedAt)
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { role: 'assistant', content: `Something went wrong: ${err.message}` } : m
      ))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 h-[calc(100vh-52px)] flex flex-col animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-shrink-0">
        <div>
          <p className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--text-faint)' }}>Research agent</p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Market Research
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Explore competitive landscapes, market sizing, and GTM strategies.
          </p>
        </div>
        <button
          onClick={() => setShowContext(c => !c)}
          className="btn btn-ghost btn-sm mt-1"
        >
          {showContext ? 'Hide context' : '+ Add context'}
        </button>
      </div>

      {/* Context panel */}
      {showContext && (
        <div
          className="mb-4 rounded-xl p-4 flex-shrink-0 animate-slide-up"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <label className="block text-xs uppercase tracking-wider font-medium mb-2" style={{ color: 'var(--text-faint)' }}>
            Startup context <span className="normal-case tracking-normal font-normal">— improves response relevance</span>
          </label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="e.g. We're building an AI-powered compliance tool for healthcare SMBs. Seed stage, $15K MRR."
            rows={2}
            className="field"
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {messages.map((msg, i) =>
          msg.role === 'user'
            ? <UserMessage key={i} text={msg.content} />
            : <AIMessage key={i} text={msg.content} loading={msg.loading} usedWebSearch={msg.usedWebSearch} />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="mt-4 flex-shrink-0">
          <p className="text-xs uppercase tracking-wider font-medium mb-2" style={{ color: 'var(--text-faint)' }}>
            Try asking
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all text-left"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="mt-4 flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about competitors, market size, GTM strategies…"
          disabled={loading}
          className="field flex-1"
          style={{ borderRadius: '12px', padding: '11px 16px' }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="btn btn-primary"
          style={{ borderRadius: '12px', padding: '11px 18px' }}
        >
          {loading ? '…' : '↑'}
        </button>
      </div>
      <p className="mt-2 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
        Enter to send
      </p>
    </div>
  )
}
