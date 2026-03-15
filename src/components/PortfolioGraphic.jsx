import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './PortfolioGraphic.css'

function PortfolioGraphic() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const projects = [
    {
      id: 1,
      title: '平面作品 1',
      description: '这是一个平面设计作品的描述',
      imageUrl: '',
      category: '海报'
    },
    {
      id: 2,
      title: '平面作品 2',
      description: '另一个平面设计作品的描述',
      imageUrl: '',
      category: '品牌'
    },
    {
      id: 3,
      title: '平面作品 3',
      description: '第三个平面设计作品的描述',
      imageUrl: '',
      category: 'UI'
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
    <div className="portfolio-graphic" ref={ref}>
      <motion.div
        className="portfolio-grid"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {projects.map((project) => (
          <motion.div
            key={project.id}
            className="portfolio-item-graphic"
            variants={itemVariants}
          >
            <div className="portfolio-item-graphic-preview">
              <div className="image-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
            </div>
            <div className="portfolio-item-graphic-info">
              <div className="portfolio-item-graphic-category">{project.category}</div>
              <h3 className="portfolio-item-graphic-title">{project.title}</h3>
              <p className="portfolio-item-graphic-description">{project.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default PortfolioGraphic
