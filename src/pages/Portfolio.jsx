import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassNavbar from '../components/GlassNavbar'
import Portfolio3D from '../components/Portfolio3D'
import PortfolioVideo from '../components/PortfolioVideo'
import PortfolioGraphic from '../components/PortfolioGraphic'
import './Portfolio.css'

function Portfolio() {
  const [activeTab, setActiveTab] = useState('3d')

  const tabs = [
    { id: '3d', label: '3D作品' },
    { id: 'video', label: '视频作品' },
    { id: 'graphic', label: '平面作品' }
  ]

  return (
    <div className="portfolio-page">
      <GlassNavbar />
      <div className="portfolio-container">
        <motion.div
          className="portfolio-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="portfolio-title">Portfolio</h1>
          <p className="portfolio-subtitle">探索我的创意作品集</p>
        </motion.div>

        <motion.div
          className="portfolio-tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`portfolio-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          className="portfolio-content"
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === '3d' && <Portfolio3D />}
          {activeTab === 'video' && <PortfolioVideo />}
          {activeTab === 'graphic' && <PortfolioGraphic />}
        </motion.div>
      </div>
    </div>
  )
}

export default Portfolio
