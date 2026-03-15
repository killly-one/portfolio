import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendMessage } from '../services/aiService'
import './HeroSection.css'

function HeroSection({ animationComplete, showContent }) {
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const messagesEndRef = useRef(null)

  const suggestions = [
    '"你有哪些优势"',
    '"你有哪些作品"',
    '"介绍一下你自己"'
  ]

  // 监听来自导航栏面板的消息更新
  useEffect(() => {
    const handleMessagesUpdate = (e) => {
      // 只有当消息数量不同时才更新（避免循环）
      if (e.detail.messages && e.detail.messages.length !== messages.length) {
        setMessages(e.detail.messages)
        if (e.detail.messages.length > 0 && !chatStarted) {
          setChatStarted(true)
        }
      }
    }

    window.addEventListener('panel-messages-update', handleMessagesUpdate)
    return () => window.removeEventListener('panel-messages-update', handleMessagesUpdate)
  }, [messages.length, chatStarted])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.closest('.hero-messages-container')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isTyping) return

    const userMessage = inputValue.trim()
    const newMsg = { text: userMessage, isUser: true, id: Date.now() }

    // 标记对话已开始
    if (!chatStarted) {
      setChatStarted(true)
    }

    // 添加用户消息
    setMessages(prev => {
      const updated = [...prev, newMsg]
      // 同步到导航栏面板
      window.dispatchEvent(new CustomEvent('hero-messages-update', {
        detail: { messages: updated }
      }))
      return updated
    })
    setInputValue('')
    setIsTyping(true)

    // 滚动到底部
    setTimeout(scrollToBottom, 50)

    try {
      // 调用真实 API - 转换消息格式为 { role, content }
      const formattedMessages = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }))
      const allMessages = [...formattedMessages, { role: 'user', content: userMessage }]
      console.log('发送消息:', allMessages)
      const result = await sendMessage(allMessages, '')

      const aiMsg = { text: result.content, isUser: false, id: Date.now() }

      setMessages(prev => {
        const updated = [...prev, aiMsg]
        // 同步到导航栏面板
        window.dispatchEvent(new CustomEvent('hero-messages-update', {
          detail: { messages: updated }
        }))
        return updated
      })
    } catch (error) {
      console.error('AI 回复失败:', error)
      const errorMsg = { text: '抱歉，AI 服务暂时不可用。', isUser: false, id: Date.now() }
      setMessages(prev => [...prev, errorMsg])
    }

    setIsTyping(false)
    setTimeout(scrollToBottom, 50)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    if (isTyping) return
    setInputValue(suggestion.replace(/"/g, ''))
  }

  return (
    <section className="hero-section">
      {/* 背景效果 */}
      <div className="hero-bg-effects">
        <div className="hero-glow hero-glow-1"></div>
        <div className="hero-glow hero-glow-2"></div>
        <div className="hero-circle hero-circle-1"></div>
        <div className="hero-circle hero-circle-2"></div>
        <div className="hero-circle hero-circle-3"></div>
        <div className="hero-circle hero-circle-4"></div>
        <div className="hero-line hero-line-1"></div>
        <div className="hero-line hero-line-2"></div>
        <div className="hero-dot hero-dot-1"></div>
        <div className="hero-dot hero-dot-2"></div>
        <div className="hero-dot hero-dot-3"></div>
        <div className="hero-dot hero-dot-4"></div>
      </div>

      {/* 主内容 */}
      {showContent && (
        <div className={`hero-content ${chatStarted ? 'chat-active' : ''}`}>
          {/* 标题 - 居中显示在输入框上方 */}
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="hero-title"
              >
                这里..可以问关于我的任何问题
              </motion.h1>
            )}
          </AnimatePresence>

          {/* 消息列表 - 绝对定位在输入框上方 */}
          <AnimatePresence>
            {messages.length > 0 && (
              <motion.div
                className="hero-messages-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="hero-messages-list">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className={`hero-message ${msg.isUser ? 'user' : 'ai'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="hero-message-text">{msg.text}</span>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      className="hero-message ai"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 输入框 */}
          <motion.div
            className="hero-input-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >

            <div className="hero-input-glow"></div>

            <div className="hero-input-box">
              <div className="hero-input-left">
                <motion.div
                  className="hero-input-ball"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: animationComplete ? 1 : 0 }}
                  transition={{ duration: 0 }}
                ></motion.div>

                <input
                  type="text"
                  className="hero-input"
                  placeholder="Ask me anything about my experience..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  disabled={isTyping}
                />
              </div>

              <button
                type="button"
                className="hero-send-btn"
                onClick={handleSubmit}
                disabled={isTyping || !inputValue.trim()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </button>
            </div>
          </motion.div>

          {/* 建议标签 - 只在没有消息时显示 */}
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                className="hero-suggestions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.4 }}
              >
                {suggestions.map((suggestion, i) => (
                  <span
                    key={i}
                    className="hero-suggestion-tag"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}

export default HeroSection
