import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './PortfolioVideo.css'

function PortfolioVideo() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const projects = [
    {
      id: 1,
      title: '视频作品 1',
      description: '这是一个视频作品的描述',
      videoUrl: '',
      category: '短片'
    },
    {
      id: 2,
      title: '视频作品 2',
      description: '另一个视频作品的描述',
      videoUrl: '',
      category: '动画'
    },
    {
      id: 3,
      title: '视频作品 3',
      description: '第三个视频作品的描述',
      videoUrl: '',
      category: '特效'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
    }
  }

  return (
    <div className="portfolio-video" ref={ref}>
      <motion.div
        className="portfolio-grid"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {projects.map((project) => (
          <motion.div
            key={project.id}
            className="portfolio-item-video"
            variants={itemVariants}
          >
            <div className="portfolio-item-video-player">
              <div className="video-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
            <div className="portfolio-item-video-info">
              <div className="portfolio-item-video-category">{project.category}</div>
              <h3 className="portfolio-item-video-title">{project.title}</h3>
              <p className="portfolio-item-video-description">{project.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default PortfolioVideo
