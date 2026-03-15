/**
 * AI 操控网页的工具函数
 */

/**
 * 滚动到指定区块
 * @param {string} sectionId - 区块 ID (personal, experience, video, vibe)
 */
export function scrollToSection(sectionId) {
  // ID 映射
  const ID_MAP = {
    personal: 'about',
    skills: 'skills',
    experience: 'experience',
    video: 'video',
    vibe: 'vibe'
  }

  const targetId = ID_MAP[sectionId]

  if (!targetId) {
    console.warn(`未知的区块 ID: ${sectionId}`)
    return
  }

  const element = document.getElementById(targetId)

  if (element && window.lenis) {
    window.lenis.scrollTo(element, {
      duration: 1.2,
      offset: -80,
      easing: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    })
  } else if (element) {
    // 降级处理
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    console.warn(`未找到元素: #${targetId}`)
  }
}

/**
 * 高亮指定元素
 * @param {string} elementId - 元素 ID
 * @param {number} duration - 高亮持续时间（毫秒）
 */
export function highlightElement(elementId, duration = 3000) {
  // ID 映射
  const ID_MAP = {
    personal: 'about',
    skills: 'skills',
    experience: 'experience',
    video: 'video',
    vibe: 'vibe'
  }

  const targetId = ID_MAP[elementId]

  if (!targetId) {
    console.warn(`未知的元素 ID: ${elementId}`)
    return
  }

  const element = document.getElementById(targetId)

  if (!element) {
    console.warn(`未找到要高亮的元素: #${targetId}`)
    return
  }

  // 添加高亮类
  element.classList.add('ai-highlight')

  // 设置定时器移除高亮
  setTimeout(() => {
    element.classList.remove('ai-highlight')
  }, duration)
}

/**
 * 注册全局滚动函数
 */
export function registerGlobalScrollFunctions() {
  window.scrollToSection = scrollToSection
  window.highlightElement = highlightElement
}
