import * as path from 'path';
import { mkdirSync, existsSync } from 'fs';
import { debugLog } from './logger.js';

/**
 * Ensure Amazon Q MCP directory structure exists
 */
export function ensureAmazonQMcpStructure(): { basePath: string; configPath: string } {
  const userProfile = process.env.USERPROFILE;
  if (!userProfile) {
    throw new Error('USERPROFILE environment variable not found');
  }

  const basePath = path.join(userProfile, '.aws', 'amazonq', 'MCP');
  const configPath = path.join(userProfile, '.aws', 'amazonq', 'agents', 'default.json');

  // Create MCP directory if it doesn't exist
  if (!existsSync(basePath)) {
    mkdirSync(basePath, { recursive: true });
    debugLog(`Created Amazon Q MCP directory: ${basePath}`);
  }

  // Verify config file exists
  if (!existsSync(configPath)) {
    throw new Error(`Amazon Q config file not found at: ${configPath}. Please ensure Amazon Q is properly installed.`);
  }

  debugLog(`Amazon Q MCP structure verified:`);
  debugLog(`  Base path: ${basePath}`);
  debugLog(`  Config path: ${configPath}`);

  return { basePath, configPath };
}

/**
 * Get Amazon Q installation directory for a server
 */
export function getAmazonQServerPath(serverName: string): string {
  const { basePath } = ensureAmazonQMcpStructure();
  return path.join(basePath, serverName);
}