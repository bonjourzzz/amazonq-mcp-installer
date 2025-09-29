# Amazon Q MCP Installer

**专为Amazon Q插件设计的MCP服务器安装和管理工具**。自动安装MCP服务器并配置Amazon Q的default.json文件。

> 🎉 **v1.1.2 新特性**：集成实时工具发现，实现**真正的Always Allow模式**！

## ✨ 核心特性

- 🎯 **100%兼容性** - 支持所有主流MCP服务器类型
- 🚀 **智能检测** - 自动识别Node.js/Python项目结构
- 📋 **README解析** - 自动提取入口点信息，解决特殊命名问题
- ⚙️ **自动配置** - 一键更新Amazon Q配置文件
- 🔍 **GitHub搜索** - 发现和安装GitHub上的MCP工具
- 🛠️ **依赖管理** - 自动处理npm/uv/pip依赖安装
- 🎛️ **实时工具发现** - 通过MCP协议自动发现所有可用工具
- ✅ **Always Allow模式** - 新安装的MCP直接可用，无需权限询问

## 🎯 兼容性测试结果

| 项目类型 | 支持情况 | 权限模式 | 示例 |
|---------|---------|---------|------|
| **Node.js/TypeScript** | ✅ 100% | Always Allow | server-filesystem, mem0-mcp, playwright-mcp |
| **Python (pyproject.toml)** | ✅ 100% | Always Allow | perplexity-mcp |
| **Python (requirements.txt)** | ✅ 100% | Always Allow | OutlookMaster-MCP |
| **GitHub MCP生态** | ✅ 90-95% | Always Allow | 官方和社区MCP服务器 |

## 🚀 快速开始

### 1. 环境准备

**必需环境**：
- **Node.js** (LTS版本) - [下载](https://nodejs.org/)
- **Git** - [下载](https://git-scm.com/download/windows)
- **Amazon Q插件** - 在VS Code中安装并登录

**可选环境**（Python MCP需要）：
- **Python** - [下载](https://www.python.org/downloads/)
- **UV** - `pip install uv`

### 2. 安装MCP Installer

```bash
# 进入Amazon Q的MCP目录
cd C:\Users\USERNAME\.aws\amazonq\MCP\

# 克隆仓库
git clone https://github.com/bonjourzzz/amazonq-mcp-installer.git
cd amazonq-mcp-installer

# 安装依赖并构建
npm install
npm run build
```

### 3. 配置Amazon Q

编辑 `C:\Users\USERNAME\.aws\amazonq\agents\default.json`：

```json
{
  "mcpServers": {
    "amazonq-mcp-installer": {
      "command": "node",
      "disabled": false,
      "timeout": 60000,
      "args": [
        "C:\\\\Users\\\\USERNAME\\\\.aws\\\\amazonq\\\\MCP\\\\amazonq-mcp-installer\\\\build\\\\index.js"
      ],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  },
  "tools": ["@amazonq-mcp-installer"],
  "allowedTools": ["@amazonq-mcp-installer/*"]
}
```

### 4. 重启Amazon Q

重启Amazon Q插件使配置生效。

## 💡 使用方法

### 安装MCP服务器
```
帮我安装 https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem
安装npm包 @modelcontextprotocol/server-brave-search
安装 https://github.com/OutlookMaster-MCP
```

### 搜索MCP服务器（需要GitHub Token）
```
搜索sqlite相关的MCP服务器
查找天气相关的MCP工具
```

### 管理MCP服务器
```
卸载 filesystem 服务器
修复 filesystem 服务器
列出已安装的MCP服务器
```

## 🎯 智能特性

### 🎛️ 实时工具发现
自动通过MCP协议发现所有可用工具：
```
🔍 正在发现MCP服务器工具...
✅ 发现 56 个工具: list_folders, compose_email, search_emails...
📝 生成Always Allow配置
```

**工作原理**:
1. 启动MCP服务器进程
2. 发送 `list_tools` MCP协议请求
3. 解析返回的工具列表
4. 生成精确的权限配置

### ✅ Always Allow模式
新安装的MCP自动配置为直接可用：
```json
{
  "tools": [
    "@outlookmaster_mcp/list_folders",
    "@outlookmaster_mcp/compose_email",
    "@outlookmaster_mcp/search_emails"
  ],
  "allowedTools": [
    "@outlookmaster_mcp/list_folders",
    "@outlookmaster_mcp/compose_email", 
    "@outlookmaster_mcp/search_emails"
  ]
}
```

**效果**: 
- ✅ 直接使用，无需询问权限
- ✅ tools和allowedTools完全对称
- ✅ 最佳用户体验

### 📋 README入口点提取
自动从README文件中提取入口点信息：
```json
// README中的配置示例
"args": ["C:\\path\\to\\outlook_mcp_server.py"]

// 自动提取文件名
"outlook_mcp_server.py"

// 在安装目录中精确定位
✅ 找到: OutlookMaster-MCP/outlook_mcp_server.py
```

### 🔍 项目类型智能检测
- **Node.js**: 检测`package.json` → 执行`npm install` + `npm run build`
- **Python pyproject**: 检测`pyproject.toml` → 执行`uv sync`
- **Python requirements**: 检测`requirements.txt` → 执行`uv pip install`

### ⚙️ 入口点多重检测
1. **package.json bin字段** - 标准Node.js入口点
2. **pyproject.toml scripts** - Python项目脚本
3. **README配置提取** - 解决特殊命名问题
4. **通用文件搜索** - 回退机制确保兼容性

## 📁 目录结构

```
C:\Users\USERNAME\.aws\amazonq\
├── MCP\                          # MCP服务器安装目录
│   ├── amazonq-mcp-installer\    # 本工具
│   ├── server-filesystem\        # 已安装的MCP服务器
│   ├── mem0-mcp\                 # 记忆管理MCP
│   ├── OutlookMaster-MCP\        # Outlook集成MCP
│   └── ...
└── agents\
    └── default.json              # Amazon Q配置文件
```

## 🔧 配置示例

安装MCP服务器后，配置文件自动更新为Always Allow模式：

```json
{
  "mcpServers": {
    "amazonq-mcp-installer": {
      "command": "node",
      "disabled": false,
      "timeout": 60000,
      "args": ["C:\\\\Users\\\\USERNAME\\\\.aws\\\\amazonq\\\\MCP\\\\amazonq-mcp-installer\\\\build\\\\index.js"],
      "env": {
        "GITHUB_TOKEN": "your_token"
      }
    },
    "@modelcontextprotocol/server-filesystem": {
      "command": "node",
      "disabled": false,
      "timeout": 60000,
      "args": ["C:\\\\Users\\\\USERNAME\\\\.aws\\\\amazonq\\\\MCP\\\\server-filesystem\\\\dist\\\\index.js"]
    },
    "OutlookMaster-MCP": {
      "command": "uv",
      "disabled": false,
      "timeout": 60000,
      "args": ["run", "outlook_mcp_server.py"],
      "env": {}
    }
  },
  "tools": [
    "@amazonq-mcp-installer",
    "@modelcontextprotocol/server-filesystem/read_file",
    "@modelcontextprotocol/server-filesystem/write_file",
    "@OutlookMaster-MCP/list_folders",
    "@OutlookMaster-MCP/compose_email"
  ],
  "allowedTools": [
    "@amazonq-mcp-installer/*",
    "@modelcontextprotocol/server-filesystem/read_file",
    "@modelcontextprotocol/server-filesystem/write_file",
    "@OutlookMaster-MCP/list_folders",
    "@OutlookMaster-MCP/compose_email"
  ]
}
```

## 🛠️ 故障排除

### 常见问题

**1. 工具不可用**
- 检查配置文件路径是否正确
- 确认已重启Amazon Q插件

**2. 搜索功能失败**
- 检查GitHub Token是否配置
- 确认Token权限包含 "public_repo"

**3. Python MCP安装失败**
- 确认UV已安装：`pip install uv`
- 检查Python环境是否正确

**4. 工具发现失败**
- 检查MCP服务器是否正常启动
- 确认网络连接和依赖环境
- 查看调试日志了解具体错误

**5. 权限模式异常**
- 新安装的MCP应该自动为Always Allow模式
- 如果仍为Ask模式，检查工具发现是否成功

### 手动修复

如果配置损坏，可以删除并重新安装：
```bash
cd C:\Users\USERNAME\.aws\amazonq\MCP\
rm -rf amazonq-mcp-installer
# 重新执行安装步骤
```

## 🎉 更新日志

### v1.1.2 (最新)
- 🎛️ **集成实时工具发现** - 通过MCP协议自动发现所有工具
- ✅ **默认Always Allow模式** - 新安装MCP直接可用
- 🔧 **修复权限配置** - tools和allowedTools完全对称
- 📊 **提升用户体验** - 无需手动设置权限

### v1.1.1
- 🎯 **README入口点自动提取** - 解决特殊命名问题
- 📊 **100%兼容性达成** - 支持所有测试的MCP类型
- 🔍 **增强工具发现** - 改进项目结构检测
- ⚙️ **优化配置处理** - 更稳定的Amazon Q集成

### v1.0.0
- 🚀 初始版本发布
- 📦 基础MCP安装功能
- 🔍 GitHub搜索集成
- ⚙️ Amazon Q配置自动化

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**专为Amazon Q插件优化，让MCP服务器管理变得简单高效！现在支持实时工具发现和Always Allow模式！** 🚀
