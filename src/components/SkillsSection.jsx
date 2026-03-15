import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './SkillsSection.css'

function SkillsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const skills = [
    { name: 'UI/UX Design', level: 90 },
    { name: '3D Modeling', level: 85 },
    { name: 'Video Editing', level: 80 },
    { name: 'Graphic Design', level: 90 },
    { name: 'Web Development', level: 75 },
    { name: 'Motion Graphics', level: 85 }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  return (
    <section id="skills" className="skills-section" ref={ref}>
      <div className="section-container">
        <motion.div
          className="skills-content"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.h2
            className="section-title"
            variants={itemVariants}
          >
            Skills & Expertise
          </motion.h2>

          <motion.div
            className="skills-grid"
            variants={containerVariants}
          >
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                className="skill-item"
                variants={itemVariants}
              >
                <div className="skill-header">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-percentage">{skill.level}%</span>
                </div>
                <div className="skill-bar">
                  <motion.div
                    className="skill-progress"
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                    transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default SkillsSection




