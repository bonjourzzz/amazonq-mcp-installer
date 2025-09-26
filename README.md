# Amazon Q MCP Installer

**专为Amazon Q插件设计的MCP服务器安装和管理工具**。自动安装MCP服务器并配置Amazon Q的default.json文件。

> ⚠️ **重要说明**：此工具专门为Amazon Q插件定制，不适用于Claude Desktop、Cursor等其他MCP客户端。

## 安装步骤

### 1. 环境准备

确保已安装以下环境：
- **Node.js** (必需)
- **Git** (必需)
- **Amazon Q插件** (必需)
- **Python + UV** (可选，仅Python MCP服务器需要)

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

编辑配置文件 `C:\Users\USERNAME\.aws\amazonq\agents\default.json`：

```json
{
  "mcpServers": {
    "amazonq-mcp-installer": {
      "command": "node",
      "disabled": false,
      "timeout": 60000,
      "args": [
        "C:\\\\Users\\\\USERNAME\\\\.aws\\\\amazonq\\\\MCP\\\\amazonq-mcp-installer\\\\build\\\\index.js"
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

### 4. 配置GitHub Token（可选）

如需使用搜索功能，需要配置GitHub Token：

1. **获取Token**：
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 选择 "public_repo" 权限
   - 复制生成的token

2. **添加到配置**：
   在上述配置中的 `amazonq-mcp-installer` 部分添加：
   ```json
   {
     "amazonq-mcp-installer": {
       "command": "node",
       "disabled": false,
       "timeout": 60000,
       "args": ["..."],
       "env": {
         "GITHUB_TOKEN": "your_github_token_here"
       }
     }
   }
   ```

### 5. 重启Amazon Q

重启Amazon Q插件使配置生效。

## 使用方法

### 安装MCP服务器
```
帮我安装 https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem
安装npm包 @modelcontextprotocol/server-brave-search
```

### 搜索MCP服务器（需要GitHub Token）
```
搜索sqlite相关的MCP服务器
查找天气相关的MCP工具
```

### 卸载MCP服务器
```
卸载 filesystem 服务器
```

### 修复MCP服务器
```
修复 filesystem 服务器，原始URL是 https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem
```

## 目录结构

```
C:\Users\USERNAME\.aws\amazonq\
├── MCP\                          # MCP服务器安装目录
│   ├── amazonq-mcp-installer\    # 本工具
│   ├── server-filesystem\        # 已安装的MCP服务器
│   └── ...
└── agents\
    └── default.json              # Amazon Q配置文件
```

## 配置示例

安装MCP服务器后，配置文件将自动更新：

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
    }
  },
  "tools": [
    "@amazonq-mcp-installer",
    "@modelcontextprotocol/server-filesystem"
  ],
  "allowedTools": [
    "@amazonq-mcp-installer/*",
    "@modelcontextprotocol/server-filesystem/*"
  ]
}
```

## 故障排除

### 常见问题

1. **工具不可用**
   - 检查配置文件路径是否正确
   - 确认已重启Amazon Q

2. **搜索功能失败**
   - 检查GitHub Token是否配置
   - 确认Token权限包含 "public_repo"

3. **安装失败**
   - 检查网络连接
   - 确认Node.js/Python环境

### 手动修复

如果配置损坏，可以删除并重新安装：
```bash
cd C:\Users\USERNAME\.aws\amazonq\MCP\
rm -rf amazonq-mcp-installer
# 重新执行安装步骤
```

## 许可证

MIT