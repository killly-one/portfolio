# 个人简历作品集网站

一个现代化的个人简历和作品集展示网站，参考 Estrela Studio 的设计风格。

## 🚀 快速开始（小白专用教程）

### 第一步：安装 Node.js

1. 打开浏览器，访问：https://nodejs.org/
2. 下载 **LTS 版本**（推荐版本，更稳定）
3. 双击下载的文件，一路点击"下一步"完成安装
4. 安装完成后，重启电脑（或关闭所有命令行窗口）

### 第二步：验证安装

1. 按 `Win + R` 键，输入 `cmd`，按回车
2. 在黑色窗口中输入以下命令，按回车：
```bash
node --version
```
3. 如果显示版本号（如 v18.17.0），说明安装成功！
4. 再输入：
```bash
npm --version
```
5. 如果也显示版本号，说明 npm 也安装成功了！

### 第三步：打开项目文件夹

1. 找到你的项目文件夹（就是包含 `package.json` 文件的文件夹）
2. 在文件夹空白处，按住 `Shift` 键，然后右键点击
3. 选择"在此处打开 PowerShell 窗口"或"在此处打开命令窗口"

### 第四步：安装项目依赖

在打开的黑色窗口中，输入以下命令，按回车：
```bash
npm install
```

**等待安装完成**（可能需要几分钟，会下载很多文件）

看到类似 `added 500 packages` 的提示，说明安装成功！

### 第五步：启动网站

安装完成后，输入以下命令，按回车：
```bash
npm run dev
```

等待几秒钟，你会看到类似这样的提示：
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 第六步：查看网站

1. 浏览器会自动打开网站
2. 如果没有自动打开，手动打开浏览器
3. 在地址栏输入：`http://localhost:3000`
4. 按回车，就能看到你的网站了！

## 📝 常用命令

- **启动开发服务器**：`npm run dev`
- **停止服务器**：在命令行窗口按 `Ctrl + C`
- **构建生产版本**：`npm run build`（用于发布网站）

## 🎨 如何修改内容

### 修改个人信息

1. 用记事本或代码编辑器打开以下文件：
   - `src/components/AboutSection.jsx` - 修改"关于我"的内容
   - `src/components/SkillsSection.jsx` - 修改技能列表
   - `src/components/ExperienceSection.jsx` - 修改工作经历
   - `src/components/ContactSection.jsx` - 修改联系方式

2. 修改后保存文件
3. 刷新浏览器页面，就能看到更新了！

### 添加作品

- **3D作品**：编辑 `src/components/Portfolio3D.jsx`
- **视频作品**：编辑 `src/components/PortfolioVideo.jsx`
- **平面作品**：编辑 `src/components/PortfolioGraphic.jsx`

### 添加图片/视频文件

1. 创建以下文件夹（如果不存在）：
   - `public/videos/` - 放视频文件
   - `public/images/` - 放图片文件
   - `public/models/` - 放3D模型文件

2. 把文件复制到对应文件夹
3. 在代码中引用：`/videos/你的视频.mp4`

## ⚠️ 常见问题

### 问题1：提示"npm 不是内部或外部命令"
**解决**：Node.js 没有正确安装，重新安装 Node.js 并重启电脑

### 问题2：npm install 很慢或失败
**解决**：使用国内镜像，输入：
```bash
npm config set registry https://registry.npmmirror.com
```
然后再运行 `npm install`

### 问题3：端口被占用
**解决**：修改 `vite.config.js` 中的 `port: 3000` 为其他数字，如 `port: 3001`

### 问题4：网站显示空白
**解决**：
1. 检查命令行窗口是否有错误提示
2. 按 `F12` 打开浏览器开发者工具，查看 Console 标签页的错误信息
3. 确保所有文件都保存了

## 📚 需要帮助？

如果遇到问题，可以：
1. 检查命令行窗口的错误提示
2. 查看浏览器控制台的错误（按 F12）
3. 确保所有步骤都正确完成

## 🎉 完成！

现在你已经可以运行和修改你的简历网站了！记住：
- 修改代码后，网站会自动刷新
- 按 `Ctrl + C` 可以停止服务器
- 每次修改后记得保存文件

祝你使用愉快！




