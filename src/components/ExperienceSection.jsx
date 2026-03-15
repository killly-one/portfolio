import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './ExperienceSection.css'

function ExperienceSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const experiences = [
    {
      period: '2022 - Present',
      title: 'Senior Designer',
      company: 'Creative Studio',
      description: '负责品牌设计和数字产品设计，领导设计团队完成多个重要项目。'
    },
    {
      period: '2020 - 2022',
      title: 'UI/UX Designer',
      company: 'Tech Company',
      description: '专注于移动应用和网站的用户体验设计，参与产品从概念到上线的全流程。'
    },
    {
      period: '2018 - 2020',
      title: 'Junior Designer',
      company: 'Design Agency',
      description: '参与多个品牌设计项目，学习并实践设计系统构建和视觉设计。'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
    <section id="experience" className="experience-section" ref={ref}>
      <div className="section-container">
        <motion.div
          className="experience-content"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.h2
            className="section-title"
            variants={itemVariants}
          >
            Experience
          </motion.h2>

          <div className="experience-timeline">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                className="experience-item"
                variants={itemVariants}
              >
                <div className="experience-period">{exp.period}</div>
                <div className="experience-details">
                  <h3 className="experience-title">{exp.title}</h3>
                  <div className="experience-company">{exp.company}</div>
                  <p className="experience-description">{exp.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ExperienceSection




