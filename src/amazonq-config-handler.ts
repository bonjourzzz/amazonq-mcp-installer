import * as path from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { debugLog } from './logger.js';

interface AmazonQServerConfig {
  command: string;
  disabled: boolean;
  timeout: number;
  args: string[];
  env?: { [key: string]: string };
}

interface AmazonQConfig {
  name: string;
  description: string;
  prompt: string;
  mcpServers: { [key: string]: AmazonQServerConfig };
  tools: string[];
  toolAliases: { [key: string]: string };
  allowedTools: string[];
  toolsSettings: { [key: string]: any };
  resources: string[];
  hooks: {
    agentSpawn: string[];
    userPromptSubmit: string[];
  };
  useLegacyMcpJson: boolean;
}

export class AmazonQConfigHandler {
  private readonly configPath: string;

  constructor() {
    this.configPath = path.join(process.env.USERPROFILE || '', '.aws', 'amazonq', 'agents', 'default.json');
  }

  /**
   * Update Amazon Q default.json with new MCP server
   */
  updateAmazonQConfig(serverName: string, config: {
    command: string;
    args: string[];
    env?: { [key: string]: string };
    permissionMode?: 'ask' | 'alwaysAllow' | 'deny';
    availableTools?: string[];
  }): void {
    debugLog(`Updating Amazon Q config at: ${this.configPath}`);

    try {
      // Read existing config
      if (!existsSync(this.configPath)) {
        throw new Error(`Amazon Q config file not found at: ${this.configPath}`);
      }

      const existingConfig = readFileSync(this.configPath, 'utf8');
      const fullConfig: AmazonQConfig = JSON.parse(existingConfig);

      // Format Windows paths with proper escaping (2 backslashes, not 4)
      const formattedArgs = config.args.map(arg => {
        if (typeof arg === 'string' && process.platform === 'win32') {
          return arg.replace(/\\/g, '\\\\');
        }
        return arg;
      });

      // Create server config according to Amazon Q rules
      // Special timeout handling for memory-intensive servers
      let timeout = 60000; // Default timeout
      if (serverName.includes('mem0') || serverName.includes('memory')) {
        timeout = 180000; // 3 minutes for memory-intensive servers
      }

      const serverConfig: AmazonQServerConfig = {
        command: config.command,
        disabled: false,
        timeout: timeout,
        args: formattedArgs
      };

      // Add env if present
      if (config.env && Object.keys(config.env).length > 0) {
        serverConfig.env = config.env;
      }

      // Update mcpServers
      fullConfig.mcpServers[serverName] = serverConfig;

      // Configure permissions based on mode
      const permissionMode = config.permissionMode || 'ask';
      
      if (permissionMode === 'deny') {
        // Deny mode: remove all references
        this.removeServerFromTools(fullConfig, serverName);
      } else {
        // Ask or Always Allow mode: add server reference
        const toolRef = serverName.startsWith('@') ? serverName : `@${serverName}`;
        if (!fullConfig.tools.includes(toolRef)) {
          fullConfig.tools.push(toolRef);
        }

        if (permissionMode === 'alwaysAllow' && config.availableTools) {
          // Always Allow mode: add specific tools to allowedTools
          config.availableTools.forEach(toolName => {
            // Amazon Q expects double @ for @modelcontextprotocol servers  
            const allowedToolRef = serverName.startsWith('@')
              ? `@@${serverName}/${toolName}`  // @@modelcontextprotocol/server-name/toolName
              : `@${serverName}/${toolName}`; // @serverName/toolName
            
            if (!fullConfig.allowedTools.includes(allowedToolRef)) {
              fullConfig.allowedTools.push(allowedToolRef);
            }
          });
        } else if (permissionMode === 'ask') {
          // Ask mode: remove from allowedTools (keep only in tools)
          const serverPrefix = serverName.startsWith('@') ? `${serverName}/` : `@${serverName}/`;
          const wildcardRef = serverName.startsWith('@') ? `${serverName}/*` : `@${serverName}/*`;
          
          fullConfig.allowedTools = fullConfig.allowedTools.filter(tool => 
            !tool.startsWith(serverPrefix) && tool !== wildcardRef
          );
        }
      }

      // Write back to file
      writeFileSync(this.configPath, JSON.stringify(fullConfig, null, 2), 'utf8');

      debugLog('Successfully updated Amazon Q config');
      debugLog(`Added server: ${serverName} with permission mode: ${permissionMode}`);
      debugLog(`Config: ${JSON.stringify(serverConfig, null, 2)}`);

    } catch (error) {
      debugLog(`Failed to update Amazon Q config: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to update Amazon Q config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Remove server references from tools and allowedTools arrays
   */
  private removeServerFromTools(config: AmazonQConfig, serverName: string): void {
    // Remove from tools array
    const toolRef = `@${serverName}`;
    config.tools = config.tools.filter(tool => tool !== toolRef);

    // Remove from allowedTools - handle both normal and @modelcontextprotocol formats
    const serverPrefix = serverName.startsWith('@') ? `@${serverName}/` : `@${serverName}/`;
    const wildcardRef = serverName.startsWith('@') ? `@${serverName}/*` : `@${serverName}/*`;
    
    config.allowedTools = config.allowedTools.filter(tool => 
      !tool.startsWith(serverPrefix) && tool !== wildcardRef
    );
  }

  /**
   * Remove MCP server from Amazon Q config
   */
  removeMcpServer(serverName: string): void {
    debugLog(`Removing server ${serverName} from Amazon Q config`);

    try {
      if (!existsSync(this.configPath)) {
        throw new Error(`Amazon Q config file not found at: ${this.configPath}`);
      }

      const existingConfig = readFileSync(this.configPath, 'utf8');
      const fullConfig: AmazonQConfig = JSON.parse(existingConfig);

      // Remove from mcpServers
      delete fullConfig.mcpServers[serverName];

      // Remove from tools and allowedTools
      this.removeServerFromTools(fullConfig, serverName);

      // Write back to file
      writeFileSync(this.configPath, JSON.stringify(fullConfig, null, 2), 'utf8');

      debugLog(`Successfully removed server ${serverName} from Amazon Q config`);

    } catch (error) {
      debugLog(`Failed to remove server from Amazon Q config: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to remove server from Amazon Q config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Discover available tools from an MCP server by attempting to connect
   */
  async discoverServerTools(serverName: string): Promise<string[]> {
    debugLog(`Attempting to discover tools for server: ${serverName}`);
    
    try {
      // Read current config to get server details
      if (!existsSync(this.configPath)) {
        debugLog('Config file not found, cannot discover tools');
        return [];
      }

      const config = JSON.parse(readFileSync(this.configPath, 'utf8'));
      const serverConfig = config.mcpServers[serverName];
      
      if (!serverConfig) {
        debugLog(`Server ${serverName} not found in config`);
        return [];
      }

      // Import tool discovery function
      const { discoverMcpServerTools } = await import('./tool-discovery.js');
      
      // Attempt to discover tools by starting the server
      const tools = await discoverMcpServerTools(
        serverConfig.command,
        serverConfig.args,
        serverConfig.env,
        serverConfig.timeout || 10000
      );
      
      debugLog(`Discovered ${tools.length} tools for ${serverName}: ${tools.join(', ')}`);
      return tools;
      
    } catch (error) {
      debugLog(`Failed to discover tools for ${serverName}: ${error}`);
      return [];
    }
  }

  /**
   * Update server permission mode
   */
  updateServerPermissions(serverName: string, mode: 'ask' | 'alwaysAllow' | 'deny', availableTools?: string[]): void {
    debugLog(`Updating permissions for ${serverName} to ${mode}`);

    try {
      if (!existsSync(this.configPath)) {
        throw new Error(`Amazon Q config file not found at: ${this.configPath}`);
      }

      const existingConfig = readFileSync(this.configPath, 'utf8');
      const fullConfig: AmazonQConfig = JSON.parse(existingConfig);

      if (mode === 'deny') {
        // Deny mode: remove all references
        this.removeServerFromTools(fullConfig, serverName);
      } else {
        // Ask or Always Allow mode
        const toolRef = serverName.startsWith('@') ? serverName : `@${serverName}`;
        if (!fullConfig.tools.includes(toolRef)) {
          fullConfig.tools.push(toolRef);
        }

        if (mode === 'alwaysAllow' && availableTools) {
          // Always Allow: add specific tools to allowedTools
          availableTools.forEach(toolName => {
            const allowedToolRef = serverName.startsWith('@') 
              ? `${serverName}/${toolName}`  // @modelcontextprotocol/server-name/toolName (no extra @)
              : `@${serverName}/${toolName}`; // @serverName/toolName
            if (!fullConfig.allowedTools.includes(allowedToolRef)) {
              fullConfig.allowedTools.push(allowedToolRef);
            }
          });
        } else if (mode === 'ask') {
          // Ask mode: remove from allowedTools
          const serverPrefix = serverName.startsWith('@') ? `${serverName}/` : `@${serverName}/`;
          const wildcardRef = serverName.startsWith('@') ? `${serverName}/*` : `@${serverName}/*`;
          fullConfig.allowedTools = fullConfig.allowedTools.filter(tool => 
            !tool.startsWith(serverPrefix) && tool !== wildcardRef
          );
        }
      }

      // Write back to file
      writeFileSync(this.configPath, JSON.stringify(fullConfig, null, 2), 'utf8');

      debugLog(`Successfully updated permissions for ${serverName}`);

    } catch (error) {
      debugLog(`Failed to update permissions: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to update permissions: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}