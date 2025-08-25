# 动漫角色猜猜乐

这是一个基于 React 和 Node.js 的动漫角色猜谜游戏。

## 功能特点

- 随机选择动漫角色作为猜谜目标
- 搜索功能支持模糊匹配
- 对于未收录的数据显示"数据未收录"
- 记录猜测历史
- 美观的 Material-UI 界面

## 安装步骤

1. 确保已安装 Node.js 和 MongoDB

2. 克隆项目并安装依赖：
```bash
git clone [项目地址]
cd [项目目录]
npm run install-all
```

3. 配置环境变量：
创建 `.env` 文件在项目根目录，添加以下内容：
```
MONGODB_URI=mongodb://localhost:27017/anime-guessr
PORT=3000
```

4. 启动开发服务器：
```bash
npm run dev
```

## 项目结构

```
.
├── client/             # React 前端
│   ├── src/           # 源代码
│   └── package.json   # 前端依赖
├── server/            # Node.js 后端
│   ├── src/          # 源代码
│   └── package.json  # 后端依赖
└── package.json      # 项目配置
```

## 技术栈

- 前端：React, Material-UI, Axios
- 后端：Node.js, Express, MongoDB
- 开发工具：Nodemon, Concurrently

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT 