import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendMessage } from '../services/aiService'
import { SYSTEM_PROMPT } from '../services/systemPrompt'
import './AiChatPanel.css'

function AiChatPanel({ chatActive, setChatActive }) {
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([])
  const [isWaiting, setIsWaiting] = useState(false)
  const [hasChatted, setHasChatted] = useState(false)
  const messagesEndRef = useRef(null)

  // 自动滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // 监听来自 HeroSection 的首条消息
  useEffect(() => {
    const handler = (e) => {
      const text = e.detail
      if (!text) return
      addUserMessage(text)
    }
    window.addEventListener('ai-message', handler)
    return () => window.removeEventListener('ai-message', handler)
  }, [])

  const addUserMessage = async (text) => {
    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setIsWaiting(true)
    setHasChatted(true)

    try {
      // 调用真实 API
      const result = await sendMessage(newMessages, SYSTEM_PROMPT)

      const aiContent = result.content
      const aiMsg = {
        role: 'ai',
        content: aiContent
      }
      setMessages(prev => [...prev, aiMsg])
      setIsWaiting(false)

      // 通知灵动岛显示 AI 响应
      window.dispatchEvent(new CustomEvent('ai-response', {
        detail: { message: aiContent }
      }))
    } catch (error) {
      console.error('AI 响应失败:', error)
      const errorMsg = {
        role: 'ai',
        content: '抱歉，AI 服务暂时不可用，请稍后再试。'
      }
      setMessages(prev => [...prev, errorMsg])
      setIsWaiting(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    addUserMessage(inputValue)
    setInputValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // 光条跟随效果
  const handleGlowMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const w = rect.width
    const h = rect.height
    const clampedX = Math.max(0, Math.min(w, x))
    const clampedY = Math.max(0, Math.min(h, y))
    e.currentTarget.style.setProperty('--glow-x', `${clampedX}px`)
    e.currentTarget.style.setProperty('--glow-y', `${clampedY}px`)
    e.currentTarget.classList.add('hovering')
  }

  const handleGlowLeave = (e) => {
    e.currentTarget.classList.remove('hovering')
  }

  return (
    <AnimatePresence mode="wait">
      {chatActive && (
        <motion.div
          className={`ai-panel-container ${hasChatted ? 'compact' : 'full'}`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, ease: [0.25, 0.8, 0.35, 1] }}
          onMouseMove={handleGlowMove}
          onMouseLeave={handleGlowLeave}
        >
          {/* 光条效果 */}
          <svg className="ai-glow-stroke" aria-hidden="true">
            <rect x="0" y="0" width="100%" height="100%" rx="16" ry="16" />
          </svg>

          {/* 消息区域 */}
          <div className="ai-messages">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                className={`ai-message ${msg.role}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="ai-message-label">
                  {msg.role === 'user' ? '你' : 'AI'}
                </div>
                <div className="ai-message-text">{msg.content}</div>
              </motion.div>
            ))}

            {/* 等待动画 */}
            {isWaiting && (
              <motion.div
                className="ai-message ai"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="ai-message-label">AI</div>
                <div className="ai-typing">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 底部输入框 */}
          <form className="ai-panel-input-form" onSubmit={handleSubmit}>
            <div className="ai-panel-input-box">
              <input
                type="text"
                className="ai-panel-input"
                placeholder="继续对话..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              <button type="submit" className="ai-panel-send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AiChatPanel
