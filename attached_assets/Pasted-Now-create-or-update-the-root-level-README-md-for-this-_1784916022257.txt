Now create or update the root-level README.md for this project.

Project:
Moss MCP Transaction Preview

Goal:
Introduce the project clearly to both general users and the developer community.

Important README requirement:
The README should include two clear language-switch buttons near the top:
- English
- 中文

Because GitHub README.md does not support real JavaScript buttons, implement them as GitHub-safe Markdown anchor links styled as simple buttons using HTML anchors.

Example:
<p align="center">
  <a href="#english-version"><strong>English</strong></a> ·
  <a href="#中文版本"><strong>中文</strong></a>
</p>

Then create two main sections:
# English Version
# 中文版本

Each section should contain the same project information in the corresponding language.

Important:
Use GitHub-safe Markdown only. Do not use JavaScript, iframe, external scripts, or unsupported interactive elements.

Required README structure:

1. Project Title
# Moss MCP Transaction Preview

2. Language Switch Buttons
Add GitHub-safe anchor links:
- English
- 中文

3. Short Labels
Use simple text badges or shields if available:
- Web3
- Moss MCP
- Monad
- Transaction Preview
- Simulation
- Beginner Friendly

4. 30-Second Animation / Demo Media
Add a GitHub-safe embedded GIF or video section near the top.

Create an assets folder if needed:
assets/

Use this placeholder:
assets/moss-mcp-transaction-preview-demo.gif

Embed it:
![30-second demo walkthrough](assets/moss-mcp-transaction-preview-demo.gif)

If no actual GIF can be generated now, include:
TODO: Add a 30-second GIF showing: open page → read intro → choose operation → generate preview → read result → check status badge.

Do not use iframe or script embeds.

5. English Version Section

Under:
## English Version

Include:

### What This Demo Is
Explain:
"Moss MCP Transaction Preview is a beginner-friendly Web3 demo that helps users understand a blockchain operation before signing. It uses a Moss MCP-style preview and simulation flow to explain operation intent, parameters, status, warnings, and safety boundaries. The demo is designed for learning and product testing. It is not an auto-trading agent and does not sign or broadcast transactions."

### Live Demo
Live Demo: https://moss-mcp-transaction.replit.app/

### Demo Goal
Explain:
- Help beginners understand before signing.
- Show transaction lifecycle states.
- Explain Rejected, Reverted, and System Error.
- Make Moss MCP easier to understand.

### User Experience Walkthrough
1. Read the top introduction.
2. Learn what Moss MCP means in this demo.
3. Choose a mock operation type.
4. Enter test-only parameters.
5. Click Generate Preview.
6. Read the preview card.
7. Check the status badge.
8. Review warnings and safety notes.

### What Is Moss MCP?
Explain:
- MCP means Model Context Protocol.
- Moss MCP is used as a structured interface between AI agents and Moss/Web3 operations.
- In this demo, it is used conceptually for discover, load, action, and simulate.
- It is used for preview and simulation, not automatic execution.

### Core Features
List:
- Beginner-friendly transaction preview
- Mock operation scenarios
- Status badge timeline
- Preview result explanation
- Safety checklist
- Rejected / Reverted / System Error distinction
- Mock-first design for safe testing
- Future Moss RPC / Monad test chain integration plan

### Status Lifecycle
Explain each:
- Idle
- Awaiting Signature
- Pending
- Confirming
- Confirmed
- Rejected
- Reverted
- System Error

### Developer Notes
Include:
- Current app is mock-first.
- Future integration can connect Moss MCP discover/load/action/simulate.
- Environment variables should use placeholders only:
  - MOSS_RPC_URL
  - MONAD_RPC_URL
- Never commit private keys or secrets.

### Run Locally
Use the current project stack. If React/Vite:
npm install
npm run dev

### Safety Boundaries
Include:
"This demo is for transaction preview and learning only. It does not sign transactions, broadcast transactions, store private keys, or provide financial advice."

### Known Issues
Include:
- Uses mock data first.
- Real Moss MCP / Moss RPC integration is planned.
- Simulation is not a guarantee of safety.
- UI copy still needs user testing.

### Roadmap
Include:
- Add real Moss MCP integration.
- Add Monad test chain RPC configuration.
- Add better transaction examples.
- Add a 30-second GIF/video walkthrough.
- Collect feedback from 3 users.
- Improve onboarding copy.
- Add MetaMask transaction handoff after preview passes, while keeping manual user review and signature confirmation.
- Connect to a live Moss MCP server so previews can show real protocol and on-chain data.
- Warn users when the simulated amount exceeds their actual token balance or appears inconsistent with available account data.

Add this note:
"These roadmap items are future-facing. The current demo remains preview/simulation-first and does not sign or broadcast transactions."

6. 中文版本 Section

Under:
## 中文版本

Include the same structure in Chinese:

### 这个 Demo 是什么
Use:
"Moss MCP Transaction Preview 是一个面向 Web3 新人的交易预览 Demo，帮助用户在签名前理解一次链上操作可能会做什么。它使用 Moss MCP 风格的 preview / simulation 流程，解释操作意图、参数、状态、风险提示和安全边界。本 Demo 仅用于学习和产品测试，不是自动交易机器人，不会签名、广播交易，也不会保存私钥或助记词。"

### 在线 Demo
在线 Demo: https://moss-mcp-transaction.replit.app/

### Demo 目标
Explain:
- 帮助新手在签名前理解链上操作。
- 展示交易生命周期状态。
- 解释 Rejected、Reverted 和 System Error 的区别。
- 让 Moss MCP 更容易被理解。

### 用户体验流程
1. 阅读页面顶部介绍。
2. 理解本 Demo 中 Moss MCP 的作用。
3. 选择一个模拟链上操作。
4. 输入仅用于测试的参数。
5. 点击 Generate Preview。
6. 阅读交易预览卡片。
7. 查看状态徽章。
8. 检查 warning 和安全提示。

### 什么是 Moss MCP？
Explain:
- MCP 是 Model Context Protocol。
- Moss MCP 是 AI Agent 与 Moss/Web3 操作之间的结构化接口。
- 在本 Demo 中，它用于理解 discover、load、action、simulate 的 preview / simulation 流程。
- 它用于签名前预览和模拟，不是自动执行交易。

### 核心功能
List:
- 新手友好的交易预览
- 模拟操作场景
- 状态徽章时间线
- 预览结果解释
- 安全检查清单
- 区分 Rejected / Reverted / System Error
- Mock-first 安全测试设计
- 未来接入 Moss RPC / Monad test chain 的计划

### 状态生命周期
解释：
- Idle
- Awaiting Signature
- Pending
- Confirming
- Confirmed
- Rejected
- Reverted
- System Error

### 开发者说明
Include:
- 当前版本采用 mock-first。
- 后续可以接入 Moss MCP 的 discover/load/action/simulate。
- 环境变量只使用占位符：
  - MOSS_RPC_URL
  - MONAD_RPC_URL
- 不要提交私钥或敏感信息。

### 本地运行
根据当前项目栈写运行方式。如果是 React/Vite:
npm install
npm run dev

### 安全边界
Include:
"本 Demo 仅用于交易预览和学习，不签名、不广播交易、不保存私钥或助记词，也不构成金融建议。"

### 已知问题
Include:
- 当前优先使用 mock 数据。
- 真实 Moss MCP / Moss RPC 接入仍在计划中。
- simulation 不等于安全保证。
- UI 文案仍需要用户测试。

### 路线图
Include:
- 接入真实 Moss MCP。
- 添加 Monad test chain RPC 配置。
- 增加更好的交易示例。
- 添加 30 秒 GIF / 视频演示。
- 收集 3 名用户反馈。
- 改进 onboarding 文案。
- 添加 MetaMask 交易交接：在 preview 通过后，让用户可以把预构建交易发送到 MetaMask，但仍由用户手动检查和签名确认。
- 连接 live Moss MCP server，让 preview 可以展示真实协议数据和链上上下文。
- 添加余额感知 warning：当模拟金额超过用户实际 token balance，或与账户数据不一致时提醒用户。

Add this note in Chinese:
"以上路线图属于未来计划。当前 Demo 仍然以 preview / simulation 为主，不签名，也不广播交易。"

7. License
Add MIT or "To be decided" if no license exists.

Deliverables:
- Create or update README.md in the root folder.
- Add language switch anchor links at the top.
- Create assets/ folder if needed.
- Add placeholder GIF path or actual GIF if available.
- Make sure all Markdown renders cleanly on GitHub.
- Keep the README bilingual, beginner-friendly, developer-friendly, and honest.