import { spawn } from 'child_process';
import { debugLog } from './logger.js';

interface McpTool {
  name: string;
  description?: string;
}

interface McpListToolsResponse {
  tools: McpTool[];
}

/**
 * Discover available tools from an MCP server using real-time MCP protocol
 * This is the primary method for accurate tool discovery
 */
export async function discoverMcpServerTools(
  command: string,
  args: string[],
  env?: { [key: string]: string },
  timeout: number = 15000
): Promise<string[]> {
  debugLog(`Starting real-time MCP tool discovery: ${command} ${args.join(' ')}`);

  return new Promise((resolve) => {
    const serverProcess = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...env }
    });

    let stdout = '';
    let stderr = '';
    let toolsDiscovered: string[] = [];
    let discoveryComplete = false;
    let initializeSent = false;
    let listToolsSent = false;

    // Set timeout
    const timeoutId = setTimeout(() => {
      if (!discoveryComplete) {
        debugLog(`Tool discovery timeout after ${timeout}ms`);
        serverProcess.kill('SIGTERM');
        resolve([]);
      }
    }, timeout);

    // Handle stdout (MCP JSON-RPC messages)
    serverProcess.stdout?.on('data', (data) => {
      stdout += data.toString();
      
      // Process complete JSON messages
      const lines = stdout.split('\n');
      stdout = lines.pop() || ''; // Keep incomplete line
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const message = JSON.parse(line.trim());
            debugLog(`Received MCP message: ${JSON.stringify(message)}`);
            
            // Send initialize request when server starts
            if (!initializeSent && (message.jsonrpc || message.method)) {
              const initRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                  protocolVersion: '2024-11-05',
                  capabilities: {},
                  clientInfo: {
                    name: 'amazonq-mcp-installer',
                    version: '1.0.0'
                  }
                }
              };
              
              debugLog('Sending initialize request');
              serverProcess.stdin?.write(JSON.stringify(initRequest) + '\n');
              initializeSent = true;
            }
            
            // Handle initialize response
            if (message.id === 1 && message.result && !listToolsSent) {
              debugLog('Initialize successful, sending list_tools request');
              
              const listToolsRequest = {
                jsonrpc: '2.0',
                id: 2,
                method: 'tools/list'
              };
              
              serverProcess.stdin?.write(JSON.stringify(listToolsRequest) + '\n');
              listToolsSent = true;
            }
            
            // Handle list_tools response
            if (message.id === 2 && message.result && message.result.tools) {
              const response = message.result as McpListToolsResponse;
              toolsDiscovered = response.tools.map(tool => tool.name);
              debugLog(`Successfully discovered ${toolsDiscovered.length} tools: ${toolsDiscovered.join(', ')}`);
              
              discoveryComplete = true;
              clearTimeout(timeoutId);
              serverProcess.kill('SIGTERM');
              resolve(toolsDiscovered);
              return;
            }
            
            // Handle errors
            if (message.error) {
              debugLog(`MCP error: ${JSON.stringify(message.error)}`);
              clearTimeout(timeoutId);
              serverProcess.kill('SIGTERM');
              resolve([]);
              return;
            }
            
          } catch (e) {
            // Ignore JSON parse errors - might be partial data or debug output
            debugLog(`JSON parse error (ignoring): ${e}`);
          }
        }
      }
    });

    // Handle stderr
    serverProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
      debugLog(`Server stderr: ${data.toString().trim()}`);
    });

    // Handle process exit
    serverProcess.on('exit', (code, signal) => {
      if (!discoveryComplete) {
        debugLog(`Server process exited with code ${code}, signal ${signal}`);
        if (stderr) {
          debugLog(`Server stderr: ${stderr}`);
        }
        clearTimeout(timeoutId);
        resolve(toolsDiscovered); // Return whatever we discovered
      }
    });

    // Handle process error
    serverProcess.on('error', (error) => {
      debugLog(`Server process error: ${error.message}`);
      clearTimeout(timeoutId);
      resolve([]);
    });

    // Give the server a moment to start before sending initialize
    setTimeout(() => {
      if (!initializeSent) {
        const initRequest = {
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'amazonq-mcp-installer',
              version: '1.0.0'
            }
          }
        };
        
        debugLog('Sending initial initialize request');
        serverProcess.stdin?.write(JSON.stringify(initRequest) + '\n');
        initializeSent = true;
      }
    }, 500);
  });
}
