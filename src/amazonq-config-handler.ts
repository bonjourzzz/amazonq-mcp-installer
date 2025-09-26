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
  }): void {
    debugLog(`Updating Amazon Q config at: ${this.configPath}`);

    try {
      // Read existing config
      if (!existsSync(this.configPath)) {
        throw new Error(`Amazon Q config file not found at: ${this.configPath}`);
      }

      const existingConfig = readFileSync(this.configPath, 'utf8');
      const fullConfig: AmazonQConfig = JSON.parse(existingConfig);

      // Format Windows paths with proper escaping for Amazon Q
      const formattedArgs = config.args.map(arg => {
        if (typeof arg === 'string' && process.platform === 'win32') {
          return arg.replace(/\\/g, '\\\\\\\\');
        }
        return arg;
      });

      // Create server config according to Amazon Q rules
      const serverConfig: AmazonQServerConfig = {
        command: config.command,
        disabled: false,
        timeout: 60000,
        args: formattedArgs
      };

      // Add env if present
      if (config.env && Object.keys(config.env).length > 0) {
        serverConfig.env = config.env;
      }

      // Update mcpServers
      fullConfig.mcpServers[serverName] = serverConfig;

      // Add to tools array if not present
      const toolRef = `@${serverName}`;
      if (!fullConfig.tools.includes(toolRef)) {
        fullConfig.tools.push(toolRef);
      }

      // Add to allowedTools with wildcard permission
      const allowedToolRef = `@${serverName}/*`;
      if (!fullConfig.allowedTools.includes(allowedToolRef)) {
        fullConfig.allowedTools.push(allowedToolRef);
      }

      // Write back to file
      writeFileSync(this.configPath, JSON.stringify(fullConfig, null, 2), 'utf8');

      debugLog('Successfully updated Amazon Q config');
      debugLog(`Added server: ${serverName}`);
      debugLog(`Config: ${JSON.stringify(serverConfig, null, 2)}`);

    } catch (error) {
      debugLog(`Failed to update Amazon Q config: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to update Amazon Q config: ${error instanceof Error ? error.message : String(error)}`);
    }
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

      // Remove from tools array
      const toolRef = `@${serverName}`;
      fullConfig.tools = fullConfig.tools.filter(tool => tool !== toolRef);

      // Remove from allowedTools
      const allowedToolRef = `@${serverName}/*`;
      fullConfig.allowedTools = fullConfig.allowedTools.filter(tool => 
        tool !== allowedToolRef && !tool.startsWith(`@${serverName}/`)
      );

      // Write back to file
      writeFileSync(this.configPath, JSON.stringify(fullConfig, null, 2), 'utf8');

      debugLog(`Successfully removed server ${serverName} from Amazon Q config`);

    } catch (error) {
      debugLog(`Failed to remove server from Amazon Q config: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to remove server from Amazon Q config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}