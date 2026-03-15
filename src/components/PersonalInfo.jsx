import { useRef } from 'react'
import { motion } from 'framer-motion'
import './PersonalInfo.css'

const workData = [
  {
    id: 1,
    company: '杭州原上灵犀影视科技有限公司',
    period: '2025. 2 — 2026. 3',
    role: 'AIGC美术/AI工作流产品经理',
    tasks: [
      '主导 AI 影视内容产出流程的标准化与产品化，将创意需求转化为可执行的系统方案。',
      '设计并落地基于 Coding 工具的自动化工作流，打通上下游协作节点，提升团队整体制作效率达 10%—50%。',
      '作为核心枢纽对接多方团队，负责需求调研、方案撰写与项目排期，确保项目高质量交付。'
    ]
  },
  {
    id: 2,
    company: '重庆为明学校',
    period: '2024. 10 — 2025. 2',
    role: '品宣策划与设计',
    tasks: [
      '负责校园品牌宣传矩阵的策划与运营，统筹海报、视频等物料的 UI/视觉设计与内容分发。',
      '引入 AI 工具重塑内容生产流程，探索新技术在教育宣传场景下的创新应用。',
      '通过数据反馈持续优化公众号图文排版与交互体验，有效提升内容传播转化率。'
    ]
  }
]

const productSkills = ['PS', 'AI', 'AE', 'XD', 'C4D', 'Blender', 'DaVinci']
const automationSkills = ['Claude Code', 'Coze', 'Openclaw', 'Cursor', 'Codex', 'Kling', 'Jimeng', 'Minimax', 'Runway']

function PersonalInfo() {
  const sectionRef = useRef(null)

  return (
    <div className="personal-info-page" ref={sectionRef}>
      {/* 背景效果 */}
      <div className="personal-bg-effects">
        <div className="personal-bg-glow personal-bg-glow-1"></div>
        <div className="personal-bg-glow personal-bg-glow-2"></div>
        <div className="personal-bg-noise"></div>
      </div>

      {/* 主内容 */}
      <div className="personal-content-wrapper">
        {/* 1. 头部简介 (Header) */}
        <motion.header
          id="about"
          className="personal-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="personal-name">
            吴明洋<span className="personal-name-dot">.</span>
          </h1>

          <p className="personal-intro">
            数字媒体艺术背景。<br/>
            专注于 <i className="personal-highlight">AI 自动化工作流设计</i> 与 <i className="personal-highlight">AI 影视制作</i>，致力于将前沿技术转化为实际生产力。
          </p>

          {/* 联系方式网格 */}
          <div className="personal-contact-grid">
            <div className="personal-contact-item">
              <div className="personal-contact-label">TEL.</div>
              <div className="personal-contact-value">13508349870</div>
            </div>
            <div className="personal-contact-item">
              <div className="personal-contact-label">E-MAIL</div>
              <div className="personal-contact-value">418723097@qq.com</div>
            </div>
            <div className="personal-contact-item">
              <div className="personal-contact-label">PROFESSIONAL</div>
              <div className="personal-contact-value">数字媒体艺术</div>
            </div>
            <div className="personal-contact-item">
              <div className="personal-contact-label">GRADUATION</div>
              <div className="personal-contact-value">2024. 7</div>
            </div>
          </div>
        </motion.header>

        {/* 2. 核心能力 (Expertise) */}
        <motion.section
          id="skills"
          className="personal-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="personal-section-header">
            <span className="personal-section-number">01</span>
            <h2 className="personal-section-title">Expertise</h2>
          </div>

          <div className="personal-section-content">
            <div className="personal-skill-group">
              <h3 className="personal-skill-title">传统媒体制作工具</h3>
              <div className="personal-skill-tags">
                {productSkills.map((tool, i) => (
                  <motion.span
                    key={tool}
                    className="personal-skill-tag"
                    whileHover={{ scale: 1.05, borderColor: 'rgba(0,0,0,0.4)', color: 'rgba(0,0,0,1)' }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                  >
                    {tool}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="personal-skill-group">
              <h3 className="personal-skill-title">AI 与自动化工作流</h3>
              <div className="personal-skill-tags">
                {automationSkills.map((tool, i) => (
                  <motion.span
                    key={tool}
                    className="personal-skill-tag"
                    whileHover={{ scale: 1.05, borderColor: 'rgba(0,0,0,0.4)', color: 'rgba(0,0,0,1)' }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                  >
                    {tool}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* 3. 工作经历 (Experience) */}
        <motion.section
          id="experience"
          className="personal-section personal-section-experience"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="personal-section-header">
            <span className="personal-section-number">02</span>
            <h2 className="personal-section-title">Experience</h2>
          </div>

          <div className="personal-section-content">
            <div className="personal-work-list">
              {workData.map((job, index) => (
                <div key={job.id} className="personal-work-item">
                  <div className="personal-work-header">
                    <h3 className="personal-work-company">
                      {job.company}
                      <svg
                        className="personal-work-arrow"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </h3>
                    <span className="personal-work-period">{job.period}</span>
                  </div>

                  <div className="personal-work-role">{job.role}</div>

                  <ul className="personal-work-tasks">
                    {job.tasks.map((task, i) => (
                      <li key={i} className="personal-work-task">
                        <span className="personal-work-task-dash">—</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default PersonalInfo
