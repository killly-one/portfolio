/**
 * AI 个人信息配置文件
 * 填写你的信息，AI 会基于这些内容来回答问题
 *
 * 使用方法：替换下面的示例内容为你自己的信息
 */

export const aiProfile = {
  // ==================== 基本信息 ====================
  basic: {
    name: '你的名字',
    title: '你的职位/身份，如：前端开发者 / 视频创作者',
    location: '你的城市，如：上海',
    email: '你的邮箱',
    phone: '你的电话（可选）',
    website: '你的个人网站（可选）',
    github: '你的 GitHub（可选）',
    wechat: '你的微信（可选）',
  },

  // ==================== 个人简介 ====================
  intro: {
    short: '一句话介绍自己，如：一个热爱创造的前端开发者',
    long: `
      这里写一段更详细的自我介绍（2-3句话）。
      可以包括你的背景、你正在做的事情、你的热情所在等。
    `,
  },

  // ==================== 职业经历 ====================
  experience: [
    {
      company: '公司名称',
      role: '职位名称',
      period: '2022.03 - 至今',
      description: '简述你的主要职责和成就',
      highlights: [
        '负责 xxx 项目的开发，实现了 xxx 功能',
        '优化了 xxx，提升了 xxx% 的性能',
        '主导了 xxx 技术方案的制定',
      ],
    },
    {
      company: '前一家公司',
      role: '职位',
      period: '2020.06 - 2022.02',
      description: '简述你的职责',
      highlights: [
        '完成了 xxx',
        '参与了 xxx',
      ],
    },
    // 继续添加更多经历...
  ],

  // ==================== 技术能力 ====================
  skills: {
    frontend: {
      title: '前端开发',
      items: ['React', 'Vue', 'TypeScript', 'CSS3', 'HTML5'],
    },
    backend: {
      title: '后端/服务端',
      items: ['Node.js', 'Python'], // 没有可以删除这个分类
    },
    tools: {
      title: '工具与平台',
      items: ['Git', 'VS Code', 'Figma'],
    },
    other: {
      title: '其他技能',
      items: ['视频剪辑', 'UI 设计'],
    },
  },

  // ==================== 项目作品 ====================
  projects: [
    {
      name: '项目名称',
      description: '项目简介，解决了什么问题',
      tech: ['React', 'Node.js'], // 使用的技术
      link: 'https://...', // 链接（可选）
    },
    // 添加更多项目...
  ],

  // ==================== 视频作品（如果有的话） ====================
  videos: [
    {
      title: '视频标题',
      platform: 'B站/YouTube',
      description: '视频内容简介',
      link: 'https://...',
    },
    // 添加更多视频...
  ],

  // ==================== VibeCoding 项目 ====================
  vibeCoding: {
    description: '描述你对 VibeCoding 的理解和实践',
    projects: [
      {
        name: '项目名',
        description: '用自然语言做了什么',
      },
    ],
  },

  // ==================== 个人特点 ====================
  personality: {
    strengths: [
      '你的优势1，如：学习能力强',
      '你的优势2，如：善于沟通',
    ],
    workStyle: '描述你的工作风格，如：我喜欢独立思考，也善于团队协作...',
    values: '你的职业价值观，如：我相信好的产品来自于对用户的深刻理解...',
  },

  // ==================== 兴趣爱好 ====================
  interests: [
    '爱好1，如：阅读科幻小说',
    '爱好2，如：打羽毛球',
    '爱好3，如：研究新技术',
  ],

  // ==================== 其他你想让 AI 知道的信息 ====================
  additional: `
    这里可以写任何你想补充的信息，比如：
    - 你的职业规划
    - 你最近在学习什么
    - 你的联系方式偏好
    - 你对某些话题的看法
  `,

  // ==================== AI 的说话风格 ====================
  tone: {
    style: 'friendly', // friendly / professional / casual
    language: 'chinese', // chinese / english / bilingual
    useEmoji: false, // 是否使用 emoji
  },
}

export default aiProfile
