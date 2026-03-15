import { scrollToSection, highlightElement } from '../utils/aiController'

const DIFY_API_URL = '/api/dify/chat-messages'
const DIFY_API_KEY = import.meta.env.VITE_DIFY_API_KEY

// 存储会话 ID（Dify 需要用来保持上下文）
let conversationId = ''

// 请求锁 - 防止并发请求
let isRequesting = false
let requestQueue = []

// 处理请求队列
const processQueue = async () => {
  if (isRequesting || requestQueue.length === 0) return

  isRequesting = true
  const { messages, systemPrompt, resolve, reject } = requestQueue.shift()

  try {
    const result = await sendMessageInternal(messages, systemPrompt)
    resolve(result)
  } catch (error) {
    reject(error)
  } finally {
    isRequesting = false
    // 处理下一个请求
    processQueue()
  }
}

// 解析 AI 响应中的指令
function parseAndExecuteCommands(content) {
  // 匹配 [SCROLL:sectionId] 指令
  const scrollMatch = content.match(/\[SCROLL:(\w+)\]/)
  // 匹配 [HIGHLIGHT:elementId] 指令
  const highlightMatch = content.match(/\[HIGHLIGHT:(\w+)\]/)

  if (scrollMatch) {
    const sectionId = scrollMatch[1]
    scrollToSection(sectionId)
  }

  if (highlightMatch) {
    const elementId = highlightMatch[1]
    highlightElement(elementId, 3000)
  }

  // 移除指令标签，返回纯净内容
  let cleanContent = content
    .replace(/\[SCROLL:\w+\]/g, '')
    .replace(/\[HIGHLIGHT:\w+\]/g, '')
    .trim()

  return cleanContent
}

// 内部发送函数
async function sendMessageInternal(messages, systemPrompt) {
  if (!DIFY_API_KEY) {
    console.warn('Dify API Key 未配置')
    return {
      success: false,
      content: 'API Key 未配置。请在 .env 文件中设置 VITE_DIFY_API_KEY',
      isSimulated: true
    }
  }

  // 验证 messages 参数
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    console.error('sendMessage: messages 参数无效', messages)
    return {
      success: false,
      content: '消息参数无效',
      isError: true
    }
  }

  try {
    // 获取最后一条用户消息
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')

    if (!lastUserMessage || !lastUserMessage.content || lastUserMessage.content.trim() === '') {
      console.error('sendMessage: 未找到有效的用户消息', messages)
      return {
        success: false,
        content: '请输入有效的问题',
        isError: true
      }
    }

    const query = lastUserMessage.content.trim()

    // 调用 Dify API
    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`
      },
      body: JSON.stringify({
        inputs: {},
        query: query,
        response_mode: 'blocking',
        conversation_id: conversationId,
        user: 'website-visitor'
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API 请求失败: ${response.status}`)
    }

    const data = await response.json()

    // 保存会话 ID 用于下次对话
    if (data.conversation_id) {
      conversationId = data.conversation_id
    }

    const rawContent = data.answer || ''

    // 解析并执行指令
    const cleanContent = parseAndExecuteCommands(rawContent)

    return {
      success: true,
      content: cleanContent
    }
  } catch (error) {
    console.error('Dify API 调用失败:', error)
    return {
      success: false,
      content: `抱歉，AI 服务暂时不可用：${error.message}`,
      isError: true
    }
  }
}

// 导出的发送函数 - 带队列控制
export function sendMessage(messages, systemPrompt) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ messages, systemPrompt, resolve, reject })
    processQueue()
  })
}
