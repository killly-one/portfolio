import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Lenis from '@studio-freight/lenis'
import GlassNavbar from '../components/GlassNavbar'
import HeroSection from '../components/HeroSection'
import PersonalInfo from '../components/PersonalInfo'
import VideoWorks from '../components/VideoWorks'
import VibeCoding from '../components/VibeCoding'
import { registerGlobalScrollFunctions } from '../utils/aiController'
import './Home.css'

function Home() {
  const location = useLocation()
  const [phase, setPhase] = useState('breathing')
  const [showUI, setShowUI] = useState(false)
  const [bgColor, setBgColor] = useState('#191919')
  const secondPageRef = useRef(null)
  const personalRef = useRef(null)
  const videoRef = useRef(null)
  const vibeRef = useRef(null)

  const lenisRef = useRef(null)
  const isJumpingRef = useRef(false) // 跳跃锁定
  const atBoundaryRef = useRef({ top: true, bottom: false }) // 边界状态

  // 禁用浏览器自动滚动恢复，确保页面加载时在顶部
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const timers = []
    timers.push(setTimeout(() => setPhase('red-rise'), 3000))
    timers.push(setTimeout(() => setPhase('black-rise'), 3800))
    timers.push(setTimeout(() => setPhase('ball-move'), 4600))
    timers.push(setTimeout(() => {
      setPhase('complete')
      setShowUI(true)
    }, 5400))
    return () => timers.forEach(clearTimeout)
  }, [])

  // Lenis 平滑滚动
  useEffect(() => {
    if (!showUI) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    lenisRef.current = lenis
    window.lenis = lenis

    // 注册全局滚动函数
    registerGlobalScrollFunctions()

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // 首页到第二页的快速切换
    const handleWheel = (e) => {
      // 跳跃动画进行中，忽略所有滚轮事件
      if (isJumpingRef.current) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      const currentScrollY = window.scrollY
      const secondPageTop = secondPageRef.current?.offsetTop || window.innerHeight

      // 更新边界状态
      atBoundaryRef.current.top = currentScrollY < 10
      // 只有刚好在第二页顶端位置（50px范围内）才能向上跳转
      atBoundaryRef.current.bottom = currentScrollY >= secondPageTop && currentScrollY < secondPageTop + 50

      // 缓动函数 - 平滑的 ease-in-out 效果
      const easing = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

      // 首页顶部向下 - 跳到第二页
      if (atBoundaryRef.current.top && e.deltaY > 0) {
        e.preventDefault()
        e.stopPropagation()
        isJumpingRef.current = true

        lenis.scrollTo(secondPageRef.current, {
          duration: 0.8,
          easing,
          lock: true,
          onComplete: () => {
            setTimeout(() => {
              isJumpingRef.current = false
            }, 100)
          }
        })
        return false
      }

      // 第二页向上 - 跳回首页（必须先到达边界）
      if (atBoundaryRef.current.bottom && e.deltaY < 0) {
        e.preventDefault()
        e.stopPropagation()
        isJumpingRef.current = true

        lenis.scrollTo(0, {
          duration: 0.8,
          easing,
          lock: true,
          onComplete: () => {
            setTimeout(() => {
              isJumpingRef.current = false
            }, 100)
          }
        })
        return false
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true })

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true })
      lenis.destroy()
    }
  }, [showUI])

  // 背景颜色变化
  useEffect(() => {
    if (!showUI) return

    const handleScroll = () => {
      const windowH = window.innerHeight
      const scrollY = window.scrollY
      const pRect = personalRef.current?.getBoundingClientRect()
      const vRect = videoRef.current?.getBoundingClientRect()
      const vbRect = vibeRef.current?.getBoundingClientRect()

      if (!pRect || !vRect || !vbRect) return

      if (vbRect.top < windowH * 0.5) {
        setBgColor('#0a0a0a')
      } else if (vRect.top < windowH * 0.5) {
        setBgColor('#191919')
      } else if (pRect.top < windowH * 0.5) {
        setBgColor('#F5F2ED')
      } else {
        setBgColor('#191919')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showUI])

  // 处理导航跳转后滚动到锚点
  const hasScrolledToAnchor = useRef(false)

  useEffect(() => {
    if (!showUI || !location.state?.scrollTo || hasScrolledToAnchor.current) return

    const scrollToId = location.state.scrollTo
    const element = document.getElementById(scrollToId)

    if (element && lenisRef.current) {
      hasScrolledToAnchor.current = true
      const easing = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      lenisRef.current.scrollTo(element, {
        duration: 1.2,
        easing,
        offset: -80
      })
    }

    // 清除 location.state，防止刷新页面后重复滚动
    if (location.state?.scrollTo) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [showUI, location.state])

  return (
    <div className="home" style={{ backgroundColor: bgColor }}>
      {/* 动画背景层 */}
      <AnimatePresence>
        {phase !== 'complete' && (
          <motion.div
            className="animation-bg-layer"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-layer bg-white"
              initial={{ opacity: 1 }}
              animate={{ opacity: phase === 'breathing' ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="bg-layer bg-red"
              initial={{ y: '100%' }}
              animate={{ y: phase === 'breathing' ? '100%' : 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.8, 0.35, 1] }}
            />
            <motion.div
              className="bg-layer bg-black"
              initial={{ y: '100%' }}
              animate={{ y: phase === 'black-rise' || phase === 'ball-move' ? 0 : '100%' }}
              transition={{ duration: 0.8, ease: [0.25, 0.8, 0.35, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 第一页：首页 */}
      <div className="page-hero">
        <AnimatePresence>
          {phase !== 'complete' && (
            <motion.div
              className="hero-ball"
              initial={{
                scale: 0,
                backgroundColor: '#000000',
                left: '50%',
                top: '50%'
              }}
              animate={{
                scale: phase === 'breathing' ? [1, 1.15, 1] : 1,
                backgroundColor: phase === 'breathing' ? '#000000' : '#ffffff',
                left: phase === 'ball-move' ? 'calc(50% - 297px)' : '50%',
                top: 'calc(50% + 10px)'
              }}
              exit={{ opacity: 0 }}
              transition={{
                scale: {
                  duration: 1.5,
                  repeat: phase === 'breathing' ? Infinity : 0,
                  ease: 'easeInOut'
                },
                backgroundColor: { duration: 0.3, ease: 'easeInOut' },
                left: { duration: 0.8, ease: [0.25, 0.8, 0.35, 1] },
                top: { duration: 0.3, ease: [0.25, 0.8, 0.35, 1] },
                opacity: { duration: 0 },
                exit: { duration: 0 }
              }}
            />
          )}
        </AnimatePresence>

        <HeroSection
          animationComplete={phase === 'complete'}
          showContent={phase === 'ball-move' || phase === 'complete'}
        />
      </div>

      {/* 主内容层 */}
      {showUI && (
        <motion.div
          className="main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GlassNavbar noAnimation />

          <div ref={secondPageRef}>
            <div ref={personalRef} data-section="personal">
              <PersonalInfo />
            </div>
            <div style={{ height: '100px' }}></div>
            <div ref={videoRef} data-section="video" id="video">
              <VideoWorks />
            </div>
            <div style={{ height: '100px' }}></div>
            <div ref={vibeRef} data-section="vibe" id="vibe">
              <VibeCoding />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Home
