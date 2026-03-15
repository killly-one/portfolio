import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './ContactSection.css'

function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  return (
    <section id="contact" className="contact-section" ref={ref}>
      <div className="section-container">
        <motion.div
          className="contact-content"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.h2
            className="section-title"
            variants={itemVariants}
          >
            Let's Connect
          </motion.h2>

          <motion.p
            className="contact-subtitle"
            variants={itemVariants}
          >
            有项目想法？让我们一起将创意变为现实。
          </motion.p>

          <motion.div
            className="contact-info"
            variants={itemVariants}
          >
            <div className="contact-item">
              <div className="contact-label">Email</div>
              <a href="mailto:your.email@example.com" className="contact-value">
                your.email@example.com
              </a>
            </div>
            <div className="contact-item">
              <div className="contact-label">Phone</div>
              <a href="tel:+8613800000000" className="contact-value">
                +86 138 0000 0000
              </a>
            </div>
            <div className="contact-item">
              <div className="contact-label">Location</div>
              <div className="contact-value">Beijing, China</div>
            </div>
          </motion.div>

          <motion.div
            className="contact-social"
            variants={itemVariants}
          >
            <a href="#" className="social-link">Instagram</a>
            <a href="#" className="social-link">Behance</a>
            <a href="#" className="social-link">LinkedIn</a>
            <a href="#" className="social-link">Dribbble</a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default ContactSection




