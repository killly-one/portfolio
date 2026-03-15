import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { sendMessage } from '../services/aiService'
import './GlassNavbar.css'

function GlassNavbar({ noAnimation = false }) {
  const [collapsed, setCollapsed] = useState(false)
  const [lightMode, setLightMode] = useState(false)
  // 状态机: 'idle'(三点) | 'preview'(消息预览条) | 'notification'(新消息通知) | 'expanded'(完整面板)
  const [animationPhase, setAnimationPhase] = useState('idle')
  const [previousPhase, setPreviousPhase] = useState('idle') // 追踪上一个状态
  const [messages, setMessages] = useState([])
  const [panelInput, setPanelInput] = useState('')
  const [isPanelTyping, setIsPanelTyping] = useState(false)
  const [isHeroVisible, setIsHeroVisible] = useState(true) // 首页首屏是否可见
  const [scrollCount, setScrollCount] = useState(0) // 滚轮计数
  const [hasNewMessage, setHasNewMessage] = useState(false) // 是否有新消息未读
  const [vwScale, setVwScale] = useState(1) // 视口缩放比例
  const messagesEndRef = useRef(null)
  const segmentRightRef = useRef(null)
  const panelRef = useRef(null)
  const previewRef = useRef(null) // 消息预览条ref
  const { scrollY } = useScroll()
  const location = useLocation()

  // 基于2560px基准计算等比例尺寸
  const baseWidth = 2560
  const scaledWidth = (px) => px * vwScale

  // 监听窗口大小变化更新缩放比例
  useEffect(() => {
    const updateScale = () => {
      setVwScale(window.innerWidth / baseWidth)
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // 判断是否在首页
  const isHomePage = location.pathname === '/'

  // 判断首页首屏是否可见（滚动超过一屏则不可见）
  useEffect(() => {
    if (!isHomePage) {
      setIsHeroVisible(false)
      return
    }

    const checkHeroVisibility = () => {
      const scrollThreshold = window.innerHeight * 0.5
      const wasVisible = isHeroVisible
      const nowVisible = window.scrollY < scrollThreshold

      // 离开首页时，自动展开面板
      if (wasVisible && !nowVisible && animationPhase === 'idle') {
        setPreviousPhase('idle')
        setAnimationPhase('expanded')
        setHasNewMessage(false)
        setScrollCount(0)
        // 展开后滚动到底部
        setTimeout(() => {
          if (messagesEndRef.current) {
            const container = messagesEndRef.current.closest('.island-panel-messages-list')
            if (container) {
              container.scrollTop = container.scrollHeight
            }
          }
        }, 200)
      }

      setIsHeroVisible(nowVisible)
    }

    checkHeroVisibility()
    window.addEventListener('scroll', checkHeroVisibility, { passive: true })
    return () => window.removeEventListener('scroll', checkHeroVisibility)
  }, [isHomePage, isHeroVisible, animationPhase])

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      const threshold = window.innerHeight * 0.5
      setCollapsed(latest > threshold)
    })
    return () => unsubscribe()
  }, [scrollY])

  useEffect(() => {
    const checkBackgroundColor = () => {
      const personalSection = document.querySelector('[data-section="personal"]')
      if (!personalSection) {
        const scrollY = window.scrollY
        const windowHeight = window.innerHeight
        const personalStart = windowHeight * 0.8
        const personalEnd = windowHeight * 2.2
        if (scrollY >= personalStart && scrollY < personalEnd) {
          setLightMode(true)
        } else {
          setLightMode(false)
        }
        return
      }
      const windowH = window.innerHeight
      const pRect = personalSection.getBoundingClientRect()
      if (pRect.top < windowH * 0.5 && pRect.bottom > windowH * 0.3) {
        setLightMode(true)
      } else {
        setLightMode(false)
      }
    }
    checkBackgroundColor()
    window.addEventListener('scroll', checkBackgroundColor, { passive: true })
    window.addEventListener('resize', checkBackgroundColor, { passive: true })
    return () => {
      window.removeEventListener('scroll', checkBackgroundColor)
      window.removeEventListener('resize', checkBackgroundColor)
    }
  }, [])

  // 监听首页消息更新
  useEffect(() => {
    const handleMessagesUpdate = (e) => {
      setMessages(e.detail.messages || [])
    }

    window.addEventListener('hero-messages-update', handleMessagesUpdate)
    return () => window.removeEventListener('hero-messages-update', handleMessagesUpdate)
  }, [])

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        const container = messagesEndRef.current.closest('.island-panel-messages-list')
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      }
    }, 100)
  }

  // 展开面板
  const handleExpand = () => {
    if (animationPhase === 'expanded') return
    setPreviousPhase(animationPhase)
    setAnimationPhase('expanded')
    setHasNewMessage(false) // 展开时清除新消息状态
    setScrollCount(0)
    // 展开后滚动到底部
    scrollToBottom()
  }

  // 关闭面板 - 回到预览或三点状态
  const handleCollapse = () => {
    if (animationPhase !== 'expanded') return
    // 如果有消息，回到预览状态；否则回到三点
    setPreviousPhase('expanded')
    setAnimationPhase(messages.length > 0 ? 'preview' : 'idle')
    setScrollCount(0)
    setHasNewMessage(false)
  }

  // 收缩回三点状态
  const handleShrinkToDots = () => {
    if (animationPhase === 'idle') return
    setPreviousPhase(animationPhase)
    setAnimationPhase('idle')
    setScrollCount(0)
  }

  // 滚轮滑动5次关闭/收缩
  useEffect(() => {
    // expanded, preview, notification 状态下都监听滚轮
    if (!['expanded', 'preview', 'notification'].includes(animationPhase)) return

    const handleWheel = () => {
      setScrollCount(prev => {
        const newCount = prev + 1
        if (newCount >= 5) {
          if (animationPhase === 'expanded') {
            handleCollapse()
          } else {
            handleShrinkToDots()
          }
          return 0
        }
        return newCount
      })
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [animationPhase])

  // 点击外部关闭/收缩
  useEffect(() => {
    // expanded, preview, notification 状态下都监听点击
    if (!['expanded', 'preview', 'notification'].includes(animationPhase)) return

    const handleClickOutside = (e) => {
      const panelEl = panelRef.current
      const previewEl = previewRef.current
      const clickedInside =
        (panelEl && panelEl.contains(e.target)) ||
        (previewEl && previewEl.contains(e.target))

      if (!clickedInside) {
        if (animationPhase === 'expanded') {
          handleCollapse()
        } else {
          handleShrinkToDots()
        }
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [animationPhase])

  const handlePanelSend = async () => {
    if (!panelInput.trim() || isPanelTyping) return

    const userMessage = panelInput.trim()
    const newMsg = { text: userMessage, isUser: true, id: Date.now() }

    setMessages(prev => {
      const updated = [...prev, newMsg]
      // 通知 HeroSection 更新
      window.dispatchEvent(new CustomEvent('panel-messages-update', {
        detail: { messages: updated }
      }))
      return updated
    })

    setPanelInput('')
    setIsPanelTyping(true)
    scrollToBottom()

    try {
      // 调用真实 API - 转换消息格式并包含当前用户消息
      const formattedMessages = messages.map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text
      }))
      const allMessages = [...formattedMessages, { role: 'user', content: userMessage }]
      console.log('面板发送消息:', allMessages)
      const result = await sendMessage(allMessages, '')

      const aiMsg = { text: result.content, isUser: false, id: Date.now() }

      setMessages(prev => {
        const updated = [...prev, aiMsg]
        // 通知 HeroSection 更新
        window.dispatchEvent(new CustomEvent('panel-messages-update', {
          detail: { messages: updated }
        }))
        return updated
      })
    } catch (error) {
      console.error('AI 回复失败:', error)
      const errorMsg = { text: '抱歉，AI 服务暂时不可用。', isUser: false, id: Date.now() }
      setMessages(prev => [...prev, errorMsg])
    }

    setIsPanelTyping(false)
    scrollToBottom()

    // 如果面板不是展开状态，触发通知
    if (animationPhase !== 'expanded') {
      setHasNewMessage(true)
      setAnimationPhase('notification')
    }
  }

  const handlePanelKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handlePanelSend()
    }
  }

  const isExpanded = animationPhase === 'expanded' || animationPhase === 'collapsing'

  return (
    <>
      <motion.nav
        className={`glass-navbar ${lightMode ? 'light-mode' : ''}`}
        initial={noAnimation ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: noAnimation ? 0 : 0.1 }}
      >
        <div className="navbar-shell">
          <div className={`navbar-container ${collapsed ? 'collapsed' : ''}`}>
            {/* 左侧 - Logo */}
            <motion.div
              className="nav-segment segment-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/" className="logo-wrap">
                <span className="logo-text">KILLY</span>
              </Link>
            </motion.div>

            {/* 中间 - 菜单 */}
            <motion.ul
              className="navbar-menu nav-segment segment-middle"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <li>
                <Link to="/" state={{ scrollTo: 'about' }} data-text="关于"><span className="menu-label">关于</span></Link>
              </li>
              <li>
                <Link to="/" state={{ scrollTo: 'skills' }} data-text="技能"><span className="menu-label">技能</span></Link>
              </li>
              <li>
                <Link to="/" state={{ scrollTo: 'experience' }} data-text="经历"><span className="menu-label">经历</span></Link>
              </li>
              <li>
                <Link to="/" state={{ scrollTo: 'video' }} data-text="作品集"><span className="menu-label">作品集</span></Link>
              </li>
            </motion.ul>

            {/* 右侧 - 统一容器 (idle/preview状态) */}
            <AnimatePresence>
              {(animationPhase === 'idle' || animationPhase === 'preview') && (
                <motion.div
                  ref={previewRef}
                  className={`nav-segment segment-right ${animationPhase === 'preview' ? 'segment-preview' : ''}`}
                  key="segment-right"
                  initial={
                    previousPhase === 'notification' || previousPhase === 'expanded'
                      ? { opacity: 0, x: scaledWidth(30), width: scaledWidth(60) }
                      : { width: scaledWidth(60) }
                  }
                  animate={{
                    width: animationPhase === 'idle' ? scaledWidth(60) : scaledWidth(200),
                    opacity: 1,
                    x: 0
                  }}
                  exit={{ opacity: 0, x: scaledWidth(20) }}
                  transition={{
                    duration: 0.8,
                    ease: [0.25, 0.8, 0.35, 1]
                  }}
                  onClick={animationPhase === 'preview' ? handleExpand : (isHeroVisible ? undefined : handleExpand)}
                  style={{ cursor: animationPhase === 'preview' || !isHeroVisible ? 'pointer' : 'default' }}
                  whileTap={(animationPhase === 'preview' || !isHeroVisible) ? { scale: 0.85 } : {}}
                  whileHover={(animationPhase === 'preview' || !isHeroVisible) ? { scale: 1.05 } : {}}
                >
                  <AnimatePresence mode="popLayout">
                    {animationPhase === 'idle' && (
                      <motion.div
                        key="dots"
                        className="navbar-dots-wrapper"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.8, 0.35, 1] }}
                      >
                        <svg width="33" height="33" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                          <circle cx="9" cy="14" r="2.2" className="nav-dot" />
                          <circle cx="14" cy="14" r="2.2" className="nav-dot" />
                          <circle cx="19" cy="14" r="2.2" className="nav-dot" />
                        </svg>
                      </motion.div>
                    )}
                    {animationPhase === 'preview' && (
                      <motion.div
                        key="preview"
                        className="preview-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.8, 0.35, 1] }}
                      >
                        <span className="preview-text">
                          {messages.length > 0 ? messages[messages.length - 1].text.slice(0, 20) + '...' : '...'}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      {/* 新消息通知 - 固定在页面右上角 (notification状态) */}
      <AnimatePresence>
        {animationPhase === 'notification' && (
          <motion.div
            ref={previewRef}
            className={`notification-bar ${lightMode ? 'light-mode' : ''}`}
            initial={{ width: scaledWidth(60), opacity: 0, x: scaledWidth(20) }}
            animate={{ width: scaledWidth(280), opacity: 1, x: 0 }}
            exit={{
              width: scaledWidth(60),
              opacity: 0,
              x: scaledWidth(-100),
              y: scaledWidth(30)
            }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.8, 0.35, 1]
            }}
            onClick={handleExpand}
            style={{ cursor: 'pointer' }}
          >
            <div className="notification-breathing-dot" />
            <div className="notification-content">
              <span className="notification-label">新消息</span>
              <span className="notification-text">
                {messages.length > 0 ? messages[messages.length - 1].text.slice(0, 25) + '...' : '...'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 展开面板 - 固定在页面右上角 */}
      <AnimatePresence>
        {animationPhase === 'expanded' && (
          <motion.div
            ref={panelRef}
            className={`island-panel ${lightMode ? 'light-mode' : ''}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.8, 0.35, 1]
            }}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* 内容容器 */}
            <div className="island-panel-content">
              {/* 左上角返回按钮 */}
              <motion.button
                className="island-panel-close"
                onClick={handleCollapse}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </motion.button>

              {/* 消息列表 */}
              <div className="island-panel-messages">
                <div className="island-panel-messages-list">
                  {messages.slice(-10).map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      className={`island-panel-message ${msg.isUser ? 'user' : 'ai'}`}
                      initial={{ opacity: 0, y: msg.isUser ? 15 : -15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: index * 0.05,
                        ease: [0.25, 0.8, 0.35, 1]
                      }}
                    >
                      <span className="island-panel-message-text">{msg.text}</span>
                    </motion.div>
                  ))}
                  {isPanelTyping && (
                    <motion.div
                      className="island-panel-message ai typing"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
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
              </div>

              {/* 底部输入框 */}
              <motion.div
                className="island-panel-input-area"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <input
                  type="text"
                  className="island-panel-input"
                  placeholder="继续对话..."
                  value={panelInput}
                  onChange={(e) => setPanelInput(e.target.value)}
                  onKeyDown={handlePanelKeyDown}
                  disabled={isPanelTyping}
                />
                <button
                  className="island-panel-send"
                  onClick={handlePanelSend}
                  disabled={isPanelTyping || !panelInput.trim()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default GlassNavbar
