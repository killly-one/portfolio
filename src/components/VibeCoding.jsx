import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import './VibeCoding.css'

const workflowProjects = [
  {
    id: 1,
    title: '视频批量对照并改名',
    imageSrc: '/images/code/carbon (1).png',
    originalTime: { hours: 3, minutes: 0, seconds: 0 },
    optimizedTime: { hours: 0, minutes: 5, seconds: 0 },
    description: '使用 AI 自动识别视频内容，批量重命名文件，支持自定义命名规则和预览功能。',
  },
  {
    id: 2,
    title: '人脸识别批量分类',
    imageSrc: '/images/code/carbon (2).png',
    originalTime: { hours: 1, minutes: 0, seconds: 0 },
    optimizedTime: { hours: 0, minutes: 3, seconds: 0 },
    description: '基于深度学习的人脸识别系统，自动将照片按人物分类，准确率达 99.2%。',
  },
  {
    id: 3,
    title: '视频风格转换批量上传',
    imageSrc: '/images/code/carbon (3).png',
    originalTime: { hours: 10, minutes: 0, seconds: 0 },
    optimizedTime: { hours: 3, minutes: 50, seconds: 0 },
    description: '自动化视频风格转换流程，支持批量处理和多平台自动上传发布。',
  },
]

// 工作流展示数据 - 三张图片
const workflowShowcaseData = {
  row1: [
    {
      id: 'feishu',
      imageSrc: '/images/code down/飞书.png',
      title: '飞书bot',
      subtitle: '创建信息自动化提取',
    },
    {
      id: 'code',
      imageSrc: '/images/code down/代码.png',
      title: 'Python 项目',
      subtitle: '自动化数据处理',
    },
  ],
  row2: {
    id: 'workflow',
    imageSrc: '/images/code down/Image (14).png',
    title: 'Coze 工作流',
    subtitle: '批量调用数据库资料运用 Nano Banana API 转绘图片',
  },
}

// 时间转秒数
const timeToSeconds = (time) => {
  return time.hours * 3600 + time.minutes * 60 + time.seconds
}

// 秒数转时间
const secondsToTime = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return { hours: h, minutes: m, seconds: s }
}

// 计算效率提升百分比
const calculateEfficiency = (original, optimized) => {
  const originalSeconds = timeToSeconds(original)
  const optimizedSeconds = timeToSeconds(optimized)
  if (originalSeconds === 0) return 0
  const saved = originalSeconds - optimizedSeconds
  return Math.round((saved / originalSeconds) * 100)
}

// 时间显示组件 - 快速滚动动画
function TimeDisplay({ targetTime, isExpanded }) {
  const [currentTime, setCurrentTime] = useState(targetTime)
  const [isRolling, setIsRolling] = useState(false)
  const intervalRef = useRef(null)
  const startValueRef = useRef(targetTime)

  useEffect(() => {
    const targetSeconds = timeToSeconds(targetTime)
    const startSeconds = timeToSeconds(startValueRef.current)

    if (startSeconds === targetSeconds) {
      setCurrentTime(targetTime)
      setIsRolling(false)
      return
    }

    // 清除之前的定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setIsRolling(true)

    // 每30ms更新一次，总时长600ms，约20次更新
    const totalDuration = 600
    const updateInterval = 30
    const startTime = Date.now()

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / totalDuration, 1)

      // easeOut效果
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const currentSeconds = Math.round(startSeconds + (targetSeconds - startSeconds) * easedProgress)
      setCurrentTime(secondsToTime(currentSeconds))

      if (progress >= 1) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        startValueRef.current = targetTime
        setIsRolling(false)
      }
    }, updateInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [targetTime])

  const formatNumber = (num) => String(num).padStart(2, '0')

  return (
    <div className={`time-display ${isExpanded ? 'expanded' : ''}`}>
      <span className={`rolling-number ${isExpanded ? 'expanded' : ''} ${isRolling ? 'rolling' : ''}`}>
        {formatNumber(currentTime.hours)}
      </span>
      <span className={`time-separator ${isExpanded ? 'expanded' : ''}`}>:</span>
      <span className={`rolling-number ${isExpanded ? 'expanded' : ''} ${isRolling ? 'rolling' : ''}`}>
        {formatNumber(currentTime.minutes)}
      </span>
      <span className={`time-separator ${isExpanded ? 'expanded' : ''}`}>:</span>
      <span className={`rolling-number ${isExpanded ? 'expanded' : ''} ${isRolling ? 'rolling' : ''}`}>
        {formatNumber(currentTime.seconds)}
      </span>
    </div>
  )
}

// 项目卡片组件
function ProjectCard({ project, index, isExpanded, onExpand, isInView }) {
  const [currentTime, setCurrentTime] = useState(project.originalTime)

  const efficiency = calculateEfficiency(project.originalTime, project.optimizedTime)

  useEffect(() => {
    if (isExpanded) {
      setCurrentTime(project.optimizedTime)
    } else {
      setCurrentTime(project.originalTime)
    }
  }, [isExpanded, project.originalTime, project.optimizedTime])

  const handleMouseEnter = useCallback(() => {
    onExpand(project.id)
  }, [onExpand, project.id])

  return (
    <motion.div
      className="vibe-card vibe-card-project"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
      onMouseEnter={handleMouseEnter}
    >
      {/* 白色背景层 */}
      <motion.div
        className="vibe-card-bg"
        animate={{ height: isExpanded ? '100%' : '0%' }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* 内容层 */}
      <motion.div
        className="vibe-card-content"
        animate={{ height: isExpanded ? 400 : 160 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className={`vibe-card-inner ${isExpanded ? 'expanded' : ''}`}>
          {/* 左侧：代码图片 */}
          <div className="vibe-card-left">
            <motion.div
              className="vibe-card-image-preview"
              animate={{ height: isExpanded ? 180 : 100 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <img src={project.imageSrc} alt={project.title} draggable={false} />
              <div className="vibe-image-fade" />
            </motion.div>
          </div>

          {/* 中间：标题和描述 */}
          <div className="vibe-card-center">
            <motion.h3
              className="vibe-card-title"
              animate={{ color: isExpanded ? '#1a1a1a' : '#ffffff' }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              {project.title}
            </motion.h3>

            <motion.div
              className="vibe-card-description"
              animate={{
                opacity: isExpanded ? 1 : 0,
                height: isExpanded ? 'auto' : 0,
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <p>{project.description}</p>
            </motion.div>
          </div>

          {/* 右侧：时间区域 */}
          <div className="vibe-card-time">
            <div className="time-label">
              {isExpanded ? (
                <span className="label-optimized">coding优化流程后用时</span>
              ) : (
                <span className="label-original">工作流程预计用时</span>
              )}
            </div>
            <TimeDisplay targetTime={currentTime} isExpanded={isExpanded} />
            <motion.div
              className="time-efficiency"
              animate={{
                opacity: isExpanded ? 1 : 0,
                scale: isExpanded ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="efficiency-arrow">↑</span>
              <div className="efficiency-value">{efficiency}%</div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 工作流展示模块
function WorkflowShowcase({ isInView }) {
  const showcaseRef = useRef(null)
  const isShowcaseInView = useInView(showcaseRef, { once: true, amount: 0.2 })

  return (
    <div className="workflow-showcase" ref={showcaseRef}>
      {/* 第一排：两张图片 */}
      <motion.div
        className="workflow-showcase-row"
        initial={{ opacity: 0, y: 40 }}
        animate={isShowcaseInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {workflowShowcaseData.row1.map((item, index) => (
          <div key={item.id} className="workflow-showcase-item">
            <div className="workflow-showcase-image-wrapper">
              <motion.img
                src={item.imageSrc}
                alt={item.title}
                className="workflow-showcase-image"
                draggable={false}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
            <motion.div
              className="workflow-showcase-caption"
              initial={{ opacity: 0, y: 15 }}
              animate={isShowcaseInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <h3 className="workflow-showcase-title">{item.title}</h3>
              {item.subtitle && (
                <p className="workflow-showcase-subtitle">{item.subtitle}</p>
              )}
            </motion.div>
          </div>
        ))}
      </motion.div>

      {/* 第二排：一张图片 */}
      <motion.div
        className="workflow-showcase-row-single"
        initial={{ opacity: 0, y: 40 }}
        animate={isShowcaseInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="workflow-showcase-item workflow-showcase-item-full">
          <div className="workflow-showcase-image-wrapper">
            <motion.img
              src={workflowShowcaseData.row2.imageSrc}
              alt={workflowShowcaseData.row2.title}
              className="workflow-showcase-image"
              draggable={false}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          <motion.div
            className="workflow-showcase-caption"
            initial={{ opacity: 0, y: 15 }}
            animate={isShowcaseInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="workflow-showcase-title">{workflowShowcaseData.row2.title}</h3>
            <p className="workflow-showcase-subtitle">{workflowShowcaseData.row2.subtitle}</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function VibeCoding() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  // 默认没有项目卡片展开，标题卡片显示400px
  const [expandedId, setExpandedId] = useState(null)

  // 是否有项目卡片展开（用于控制标题卡片高度）
  const hasExpandedCard = expandedId !== null

  const handleExpand = useCallback((id) => {
    setExpandedId(id)
  }, [])

  const handleCardsMouseLeave = useCallback(() => {
    // 鼠标移出项目卡片范围，回到默认状态（标题卡片400px）
    setExpandedId(null)
  }, [])

  return (
    <section className="vibe-coding-page" ref={ref}>
      <div className="vibe-container">
        {/* 卡片组 */}
        <div className="vibe-cards-stack">
          {/* 标题卡片 - 有项目展开时收缩到160px，否则400px */}
          <motion.div
            className="vibe-card vibe-card-header-card"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="vibe-card-content"
              animate={{ height: hasExpandedCard ? 160 : 400 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="vibe-header-content">
                <h2 className="vibe-title">Vibe Coding</h2>
                <p className="vibe-subtitle">AI-POWERED WORKFLOW OPTIMIZATION</p>
              </div>
            </motion.div>
          </motion.div>

          {/* 项目卡片容器 */}
          <div className="vibe-cards-projects" onMouseLeave={handleCardsMouseLeave}>
            {workflowProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                isExpanded={expandedId === project.id}
                onExpand={handleExpand}
                isInView={isInView}
              />
            ))}
          </div>

          {/* 底部卡片 - 固定400px */}
          <motion.div
            className="vibe-card vibe-card-footer-card"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="vibe-card-content" style={{ height: 400 }}>
              <div className="vibe-footer-content">
                <p className="vibe-footer-text">用code平台解决项目流程化问题，保持流程不变</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 工作流展示模块 - 独立于卡片组 */}
        <WorkflowShowcase isInView={isInView} />
      </div>
    </section>
  )
}

export default VibeCoding
