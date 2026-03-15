import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './AboutSection.css'

function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  return (
    <section id="about" className="about-section" ref={ref}>
      <div className="section-container">
        <motion.div
          className="about-content"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.h2
            className="section-title"
            variants={itemVariants}
          >
            About Me
          </motion.h2>

          <motion.div
            className="about-text"
            variants={itemVariants}
          >
            <p className="about-intro">
              我是一名专注于数字设计和创意表达的创作者。我热爱将想法转化为
              有意义的设计，无论是品牌、网站还是数字产品。
            </p>
            <p className="about-description">
              我相信设计不仅仅是视觉呈现，更是解决问题和传达价值的方式。
              我的工作方式注重诚实、协作和持续学习，每一个项目都倾注同样的
              热情和专业精神。
            </p>
          </motion.div>

          <motion.div
            className="about-stats"
            variants={itemVariants}
          >
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">项目经验</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5+</div>
              <div className="stat-label">年经验</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">客户满意度</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutSection




