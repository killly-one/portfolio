import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import './VideoWorks.css'

// 新增：视频作品数据 - 按照参考代码的7个视频排版
const videoProjects = [
  {
    id: 1,
    title: "联通吧！多元宇宙",
    client: "China Unicom 中国联通",
    role: "画面设计 / 分镜设计 / 后期粗剪 / 需求对接",
    videoSrc: "https://killy-video.oss-cn-hangzhou.aliyuncs.com/%E8%81%94%E9%80%9A%E9%A1%B9%E7%9B%AE.mp4",
    poster: "/images/posters/联通项目.jpg",
    isLarge: true,
  },
  {
    id: 2,
    title: "阿里云通义万象 WanDay",
    client: "Alibaba Cloud 阿里云",
    role: "需求对接 / 画面设计 / 分镜设计",
    videoSrc: "https://killy-video.oss-cn-hangzhou.aliyuncs.com/Wan%20Day.mov",
    poster: "/images/work/Wan Day.png",
    isMedium: true,
  },
  {
    id: 3,
    title: "8H双11广告",
    client: "8H 趣睡科技",
    role: "画面设计 / 分镜设计 / 后期 / 需求对接",
    videoSrc: "https://killy-video.oss-cn-hangzhou.aliyuncs.com/250929-%E8%B6%A3%E7%9D%A1%E7%A7%91%E6%8A%808H%E6%88%90%E7%89%87-v2.mp4",
    poster: "/images/posters/8H.jpg",
  },
  {
    id: 4,
    title: "拉斐尔之酒",
    client: "Raphael Wine",
    role: "画面设计 / 后期",
    videoSrc: "https://killy-video.oss-cn-hangzhou.aliyuncs.com/%E6%8B%89%E6%96%90%E5%B0%94%E4%B9%8B%E9%85%92.mp4",
    poster: "/images/posters/拉斐尔之酒.jpg",
  },
  {
    id: 5,
    title: "七匹狼广告",
    client: "Septwolves 七匹狼",
    role: "画面设计 / 分镜设计 / 后期 / 需求对接",
    videoSrc: "https://killy-video.oss-cn-hangzhou.aliyuncs.com/%E4%B8%83%E5%8C%B9%E7%8B%BC.mp4",
    poster: "/images/posters/七匹狼.jpg",
  },
  {
    id: 6,
    title: "探路者广告",
    client: "TOREAD 探路者",
    role: "画面设计",
    videoSrc: "https://killy-video.oss-cn-hangzhou.aliyuncs.com/%E6%8E%A2%E8%B7%AF%E8%80%85_%E6%9E%81%E5%9C%B0%E7%B3%BB%E5%88%97%E7%BA%BF%E4%B8%8A%E6%AC%BE.mp4",
    poster: "/images/work/探路者.png",
  },
  {
    id: 7,
    title: "太平年",
    client: "华策集团",
    role: "画面设计",
    videoSrc: "https://killy-video.oss-cn-hangzhou.aliyuncs.com/%E5%A4%AA%E5%B9%B3%E5%B9%B4.mp4",
    poster: "/images/posters/太平年.jpg",
    isLarge: true,
  }
]

const workProjects = [
  {
    id: 0,
    type: 'text',
    title: '项目经历',
    titleEn: 'Project Experience',
    description: '节选游戏PV和广告与动画制作内容，个人参与度高，\n其中网易-幻想地球为个人独立制作',
  },
  {
    id: 1,
    type: 'image',
    title: '幻想地球',
    imageSrc: '/images/work/幻想地球.png',
    videoSrc: 'https://killy-video.oss-cn-hangzhou.aliyuncs.com/%E5%B9%BB%E6%83%B3%E5%9C%B0%E7%90%83%EF%BC%88%E6%97%A0%E6%B0%B4%E5%8D%B0%EF%BC%89.m4v',
    poster: '/images/work/幻想地球.png',
    tags: ['动画设计', '分镜设计', 'AI制作PV'],
  },
  {
    id: 2,
    type: 'image',
    title: '探路者',
    imageSrc: '/images/work/探路者.png',
    videoSrc: 'https://killy-video.oss-cn-hangzhou.aliyuncs.com/%E6%8E%A2%E8%B7%AF%E8%80%85_%E6%9E%81%E5%9C%B0%E7%B3%BB%E5%88%97%E7%BA%BF%E4%B8%8A%E6%AC%BE.mp4',
    poster: '/images/work/探路者.png',
    tags: ['分镜设计', 'AI制作广告'],
  },
  {
    id: 3,
    type: 'image',
    title: '词印狂潮',
    imageSrc: '/images/work/词印狂潮.png',
    videoSrc: 'https://killy-video.oss-cn-hangzhou.aliyuncs.com/%E8%AF%8D%E5%8D%B0%E7%8B%82%E6%BD%AE.mov',
    poster: '/images/work/词印狂潮.png',
    tags: ['动画设计', '风格设计', '人物设计', '场景设计', 'AI制作动画'],
  },
]

// 视频网格卡片组件
function VideoGridCard({ project, index, className, onClick }) {
  const videoRef = useRef(null)
  const cardRef = useRef(null)
  const isInView = useInView(cardRef, { once: true, margin: "-50px" })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  const handleClick = () => {
    if (onClick) {
      onClick(project)
    }
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
      className={`video-grid-card ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* 视频容器 (16:9) */}
      <div className="video-grid-card-media">
        <video
          ref={videoRef}
          src={project.videoSrc}
          poster={project.poster}
          className="video-grid-video"
          muted
          loop
          playsInline
          preload="none"
        />

        {/* 播放图标覆盖层 */}
        <div className={`video-grid-play-overlay ${isHovered ? 'visible' : ''}`}>
          <div className="video-grid-play-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>

      {/* 元数据区域 */}
      <div className="video-grid-card-meta">
        <div className="video-grid-card-header">
          <h3 className="video-grid-card-title">{project.title}</h3>
        </div>

        <div className="video-grid-card-info">
          <span className="video-grid-card-client">{project.client}</span>
          <span className="video-grid-card-dot">·</span>
          <span>{project.role}</span>
        </div>
      </div>
    </motion.div>
  )
}

function VideoWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.2 })
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const [activeVideo, setActiveVideo] = useState(null)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 2560
  )

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 点击卡片时打开视频
  const handleCardClick = (project) => {
    if (project.type === 'image' && project.videoSrc) {
      setActiveVideo(project)
    }
  }

  // 点击视频网格卡片时打开视频
  const handleGridCardClick = (project) => {
    if (project.videoSrc) {
      setActiveVideo(project)
    }
  }

  // 关闭视频
  const handleCloseVideo = () => {
    setActiveVideo(null)
  }

  // 基准尺寸 - 竖长卡片，整体宽度占90%
  const baseWidth = 34
  const baseHeight = 68
  const gap = 20

  // 分离宽度和高度的缩放比例
  const getCardScales = (index) => {
    // 默认状态：左侧最大，往右依次变小，最后两个相同
    const defaultWidthScales = [1.0, 0.5, 0.35, 0.35]
    const defaultHeightScales = [1.0, 0.75, 0.6, 0.6]

    if (hoveredIndex === -1 || hoveredIndex === 0) {
      // 无hover或hover第一个卡片时，保持默认状态
      return { widthScale: defaultWidthScales[index], heightScale: defaultHeightScales[index] }
    }

    const distance = Math.abs(hoveredIndex - index)
    if (distance === 0) {
      // 被hover的卡片：和第一个卡片默认一样大
      return { widthScale: 1.0, heightScale: 1.0 }
    }
    if (distance === 1) {
      return { widthScale: 0.4, heightScale: 0.7 }
    }
    if (distance === 2) {
      return { widthScale: 0.3, heightScale: 0.55 }
    }
    return { widthScale: 0.25, heightScale: 0.5 }
  }

  const cardStyles = workProjects.map((_, index) => {
    const { widthScale, heightScale } = getCardScales(index)
    return {
      width: baseWidth * widthScale,
      height: baseHeight * heightScale,
      widthScale,
      heightScale,
    }
  })

  const gapVw = (gap / windowWidth) * 100

  const handleMouseEnter = (index) => setHoveredIndex(index)
  const handleMouseLeave = () => setHoveredIndex(-1)

  return (
    <div className="video-works-page" ref={ref}>
      <motion.div
        className="works-container"
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        style={{
          transform: activeVideo ? 'scale(0.9)' : 'scale(1)',
          filter: activeVideo ? 'blur(50px)' : 'blur(0px)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), filter 0.4s ease-out',
        }}
      >
        <div className="works-row">
          {workProjects.map((project, index) => {
            const style = cardStyles[index]
            const isLast = index === workProjects.length - 1
            // 第一个卡片是否处于放大状态
            const isFirstCardExpanded = index === 0 && (hoveredIndex === -1 || hoveredIndex === 0)

            return (
              <motion.div
                key={project.id}
                className="work-card"
                animate={{
                  width: `${style.width}vw`,
                  height: `${style.height}vh`,
                  marginRight: isLast ? 0 : `${gapVw}vw`,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1],
                }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleCardClick(project)}
              >
                {project.type === 'text' ? (
                  <div className="work-text-content">
                    <div className="work-text-header">
                      <span className="work-title">{project.title}</span>
                      <span className="work-title-en">{project.titleEn}</span>
                    </div>
                    <AnimatePresence>
                      {(hoveredIndex === -1 || hoveredIndex === 0) && (
                        <motion.p
                          className="work-description"
                          initial={{ opacity: 0, y: 0 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 50 }}
                          transition={{
                            duration: 0.5,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                        >
                          {project.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="work-image-content">
                    <img
                      src={project.imageSrc}
                      alt={project.title}
                      className="work-image"
                      draggable={false}
                    />
                    {/* 左上角标签 - 悬停时显示 */}
                    <AnimatePresence>
                      {project.tags && hoveredIndex === index && (
                        <motion.div
                          className="work-tags"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        >
                          {project.tags.map((tag, tagIndex) => {
                            const isParticipation = tag === '项目个人参与度'
                            // 第一个图片卡片100%，第二个50%，第三个60%
                            const fillPercentages = { 1: 100, 2: 50, 3: 60 }
                            const fillPercent = isParticipation ? fillPercentages[index] : 0

                            if (isParticipation) {
                              return (
                                <motion.span
                                  key={tagIndex}
                                  className="work-tag-participation"
                                  style={{ '--fill-percent': `${fillPercent}%` }}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: tagIndex * 0.05,
                                    ease: [0.4, 0, 0.2, 1]
                                  }}
                                >
                                  {/* SVG定义镂空遮罩 */}
                                  <svg className="work-tag-svg-mask" viewBox="0 0 140 24" preserveAspectRatio="xMidYMid meet">
                                    <defs>
                                      <mask id={`cutout-mask-${index}-${tagIndex}`}>
                                        {/* 白色 = 可见区域 */}
                                        <rect x="0" y="0" width="140" height="24" fill="white" />
                                        {/* 黑色 = 镂空区域（文字形状） */}
                                        <text x="70" y="17" textAnchor="middle" fontSize="12" fontFamily="Inter, sans-serif" fontStyle="italic" fontWeight="500" fill="black">
                                          {tag}
                                        </text>
                                      </mask>
                                    </defs>
                                  </svg>
                                  {/* 背景层 - 应用SVG mask实现镂空 */}
                                  <span
                                    className="work-tag-participation-bg"
                                    style={{
                                      '--fill-percent': `${fillPercent}%`,
                                      mask: `url(#cutout-mask-${index}-${tagIndex})`,
                                      WebkitMask: `url(#cutout-mask-${index}-${tagIndex})`
                                    }}
                                  />
                                  {/* 文字描边层 - 只显示轮廓 */}
                                  <span className="work-tag-participation-outline">{tag}</span>
                                </motion.span>
                              )
                            }

                            return (
                              <motion.span
                                key={tagIndex}
                                className="work-tag"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: tagIndex * 0.05,
                                  ease: [0.4, 0, 0.2, 1]
                                }}
                              >
                                {tag}
                              </motion.span>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* 服务品牌区域 */}
      <motion.div
        className="brands-section"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="brands-content">
          <span className="brands-label">服务品牌</span>
          <div className="brands-logos">
            <img src="/images/logo f/网易.png" alt="网易" className="brand-logo brand-logo-wangyi" draggable={false} />
            <img src="/images/logo f/xiaomi-logo.png" alt="小米" className="brand-logo brand-logo-xiaomi" draggable={false} />
            <img src="/images/logo f/china-unicom-1.png" alt="中国联通" className="brand-logo brand-logo-unicom" draggable={false} />
            <img src="/images/logo f/探路者.png" alt="探路者" className="brand-logo brand-logo-tanlu" draggable={false} />
            <img src="/images/logo f/Wan原文件-03.png" alt="万" className="brand-logo brand-logo-wan" draggable={false} />
          </div>
        </div>
      </motion.div>

      {/* 视频网格区域 */}
      <motion.div
        className="video-grid-section"
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          transform: activeVideo ? 'scale(0.9)' : 'scale(1)',
          filter: activeVideo ? 'blur(50px)' : 'blur(0px)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), filter 0.4s ease-out',
        }}
      >
        <div className="video-grid-container">
          <div className="video-grid-layout">
            {videoProjects.map((project, index) => {
              // 确定网格跨度
              let spanClass = "video-grid-item-small"
              if (index === 0) spanClass = "video-grid-item-large" // 第1个：全宽
              else if (index === 1) spanClass = "video-grid-item-medium" // 第2个：2/3宽
              else if (index === 6) spanClass = "video-grid-item-large" // 第7个：全宽

              return (
                <VideoGridCard
                  key={project.id}
                  project={project}
                  index={index}
                  className={spanClass}
                  onClick={handleGridCardClick}
                />
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* 视频播放模态框 */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            className="video-modal-overlay"
            initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
            animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
            exit={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="video-modal-content">
              <button className="video-close-btn" onClick={handleCloseVideo}>
                Close
              </button>
              <div className="video-wrapper">
                <video
                  className="video-player"
                  controls
                  autoPlay
                  playsInline
                >
                  <source src={activeVideo.videoSrc} type="video/mp4" />
                  <source src={activeVideo.videoSrc} type="video/quicktime" />
                  <source src={activeVideo.videoSrc} type="video/x-m4v" />
                  您的浏览器不支持此视频格式
                </video>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VideoWorks
