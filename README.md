# Amazon Q MCP Installer

Amazon Q专用的MCP服务器安装和管理工具。自动安装MCP服务器并配置Amazon Q的default.json文件。

## 快速开始

### 第一步：安装MCP Easy Installer

首先需要将这个工具本身安装为MCP服务器：

1. **克隆仓库到Amazon Q的MCP目录**：
```bash
# 进入Amazon Q的MCP目录
cd C:\Users\wyuhang\.aws\amazonq\MCP\

# 克隆仓库
git clone https://github.com/bonjourzzz/amazonq-mcp-installer.git
cd amazonq-mcp-installer
```

2. **安装依赖并构建**：
```bash
npm install
npm run build
```

3. **配置Amazon Q**（两种方法任选其一）：

**方法一：通过Amazon Q插件界面添加**
- 打开Amazon Q插件设置
- 添加新的MCP服务器，配置如下：
  - **Name**: `amazonq-mcp-installer`
  - **Transport**: `stdio`
  - **Command**: `node`
  - **Arguments**: `C:\Users\wyuhang\.aws\amazonq\MCP\amazonq-mcp-installer\build\index.js`
  - **Timeout**: `60`
  - **Scope**: `Global` 或 `This workspace`

**方法二：手动编辑配置文件**
编辑 `~/.aws/amazonq/agents/default.json`，添加：
```json
{
  "mcpServers": {
    "amazonq-mcp-installer": {
      "command": "node",
      "disabled": false,
      "timeout": 60000,
      "args": [
        "C:\\\\Users\\\\wyuhang\\\\.aws\\\\amazonq\\\\MCP\\\\amazonq-mcp-installer\\\\build\\\\index.js"
      ]
    }
  },
  "tools": [
    "@amazonq-mcp-installer"
  ],
  "allowedTools": [
    "@amazonq-mcp-installer/*"
  ]
}
```

4. **重启Amazon Q**，现在你就可以使用MCP安装工具了！

### 第二步：使用工具安装其他MCP服务器

## 主要功能

- **搜索和发现**: 从GitHub仓库和npm包中查找可用的MCP服务器
- **自动安装**: 从GitHub URL或npm包快速安装MCP服务器
- **Amazon Q集成**: 自动更新Amazon Q的配置文件 (`~/.aws/amazonq/agents/default.json`)
- **环境依赖管理**: 自动处理Node.js和Python依赖
- **修复和维护**: 检测并修复常见的MCP服务器问题
- **跨平台支持**: 支持Windows、Linux和macOS

## 安装目录

MCP服务器将安装到以下目录：
```
C:\Users\USERNAME\.aws\amazonq\MCP\
```

## 配置更新

工具会自动更新Amazon Q的配置文件：
```
C:\Users\USERNAME\.aws\amazonq\agents\default.json
```

按照Amazon Q配置规则添加：
- `mcpServers`: 服务器配置
- `tools`: 工具声明
- `allowedTools`: 权限控制
- 必需字段：`disabled: false`, `timeout: 60000`

## 使用方法

现在你可以在Amazon Q中直接使用命令安装其他MCP服务器：

### 安装MCP服务器
- "帮我安装 https://github.com/overstarry/qweather-mcp"
- "安装npm包 @modelcontextprotocol/server-brave-search"

### 搜索MCP服务器
- "搜索天气相关的MCP服务器"
- "查找可用的MCP工具"

### 卸载MCP服务器
- "卸载 qweather-mcp 服务器"

### 修复MCP服务器
- "修复 qweather 服务器，原始URL是 https://github.com/overstarry/qweather-mcp"

## 配置示例

安装后，Amazon Q的default.json将包含类似配置：

```json
{
  "mcpServers": {
    "qweather-mcp": {
      "command": "node",
      "disabled": false,
      "timeout": 60000,
      "args": [
        "C:\\\\Users\\\\USERNAME\\\\.aws\\\\amazonq\\\\MCP\\\\qweather-mcp\\\\dist\\\\index.js"
      ],
      "env": {
        "QWEATHER_API_KEY": "your_api_key"
      }
    }
  },
  "tools": [
    "@qweather-mcp"
  ],
  "allowedTools": [
    "@qweather-mcp/*"
  ]
}
```

## 环境要求

- Node.js (用于Node.js MCP服务器)
- Python + UV (用于Python MCP服务器)
- Amazon Q已安装并配置

## 与通用版本的区别

1. **专用安装路径**: 使用Amazon Q的MCP目录
2. **配置格式**: 遵循Amazon Q的配置规则
3. **权限管理**: 自动添加工具权限
4. **环境变量**: 正确处理Amazon Q的env配置

## 故障排除

如果遇到问题：
1. 确保Amazon Q已正确安装
2. 检查配置文件路径是否存在
3. 验证Node.js/Python环境
4. 使用repair命令修复损坏的安装

## 许可证

MIT