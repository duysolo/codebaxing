#!/usr/bin/env node
/**
 * CLI installer for Codebaxing MCP server.
 * Automatically configures MCP server for various AI agents.
 *
 * Usage:
 *   npx codebaxing install          # Install to Claude Desktop (default)
 *   npx codebaxing install --cursor # Install to Cursor
 *   npx codebaxing install --all    # Install to all supported editors
 *   npx codebaxing uninstall        # Uninstall from all
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ─── Types ───────────────────────────────────────────────────────────────────

interface McpServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

interface McpConfig {
  mcpServers?: Record<string, McpServerConfig>;
  [key: string]: unknown;
}

interface EditorConfig {
  name: string;
  configPath: string;
  configKey: string; // 'mcpServers' or 'context_servers' etc.
  serverConfig: McpServerConfig | Record<string, unknown>;
}

// ─── Config Paths ────────────────────────────────────────────────────────────

const HOME = os.homedir();
const PLATFORM = process.platform;

function getEditorConfigs(): EditorConfig[] {
  const configs: EditorConfig[] = [];

  // Claude Desktop
  if (PLATFORM === 'darwin') {
    configs.push({
      name: 'Claude Desktop',
      configPath: path.join(HOME, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
      configKey: 'mcpServers',
      serverConfig: {
        command: 'npx',
        args: ['-y', 'codebaxing'],
      },
    });
  } else if (PLATFORM === 'win32') {
    configs.push({
      name: 'Claude Desktop',
      configPath: path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json'),
      configKey: 'mcpServers',
      serverConfig: {
        command: 'npx',
        args: ['-y', 'codebaxing'],
      },
    });
  } else {
    // Linux
    configs.push({
      name: 'Claude Desktop',
      configPath: path.join(HOME, '.config', 'claude', 'claude_desktop_config.json'),
      configKey: 'mcpServers',
      serverConfig: {
        command: 'npx',
        args: ['-y', 'codebaxing'],
      },
    });
  }

  // Cursor
  configs.push({
    name: 'Cursor',
    configPath: path.join(HOME, '.cursor', 'mcp.json'),
    configKey: 'mcpServers',
    serverConfig: {
      command: 'npx',
      args: ['-y', 'codebaxing'],
    },
  });

  // Windsurf (Codeium)
  configs.push({
    name: 'Windsurf',
    configPath: path.join(HOME, '.codeium', 'windsurf', 'mcp_config.json'),
    configKey: 'mcpServers',
    serverConfig: {
      command: 'npx',
      args: ['-y', 'codebaxing'],
    },
  });

  // Zed
  if (PLATFORM === 'darwin') {
    configs.push({
      name: 'Zed',
      configPath: path.join(HOME, '.config', 'zed', 'settings.json'),
      configKey: 'context_servers',
      serverConfig: {
        command: {
          path: 'npx',
          args: ['-y', 'codebaxing'],
        },
      },
    });
  } else {
    configs.push({
      name: 'Zed',
      configPath: path.join(HOME, '.config', 'zed', 'settings.json'),
      configKey: 'context_servers',
      serverConfig: {
        command: {
          path: 'npx',
          args: ['-y', 'codebaxing'],
        },
      },
    });
  }

  return configs;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readJsonFile(filePath: string): Record<string, unknown> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function writeJsonFile(filePath: string, data: Record<string, unknown>): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function configExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

// ─── Install/Uninstall ───────────────────────────────────────────────────────

function installToEditor(editor: EditorConfig): boolean {
  console.log(`\n📦 Installing to ${editor.name}...`);

  const config = readJsonFile(editor.configPath);

  // Initialize the config key if it doesn't exist
  if (!config[editor.configKey]) {
    config[editor.configKey] = {};
  }

  const servers = config[editor.configKey] as Record<string, unknown>;

  // Check if already installed
  if (servers.codebaxing) {
    console.log(`   ✓ Already installed in ${editor.name}`);
    return true;
  }

  // Add codebaxing
  servers.codebaxing = editor.serverConfig;
  config[editor.configKey] = servers;

  try {
    writeJsonFile(editor.configPath, config);
    console.log(`   ✓ Installed to ${editor.configPath}`);
    return true;
  } catch (err) {
    console.error(`   ✗ Failed to write config: ${(err as Error).message}`);
    return false;
  }
}

function uninstallFromEditor(editor: EditorConfig): boolean {
  if (!configExists(editor.configPath)) {
    return true;
  }

  console.log(`\n🗑️  Uninstalling from ${editor.name}...`);

  const config = readJsonFile(editor.configPath);
  const servers = config[editor.configKey] as Record<string, unknown> | undefined;

  if (!servers || !servers.codebaxing) {
    console.log(`   ✓ Not installed in ${editor.name}`);
    return true;
  }

  delete servers.codebaxing;
  config[editor.configKey] = servers;

  try {
    writeJsonFile(editor.configPath, config);
    console.log(`   ✓ Removed from ${editor.configPath}`);
    return true;
  } catch (err) {
    console.error(`   ✗ Failed to write config: ${(err as Error).message}`);
    return false;
  }
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function printUsage(): void {
  console.log(`
Codebaxing Installer - MCP server for semantic code search

Usage:
  npx codebaxing install [options]    Install MCP server
  npx codebaxing uninstall [options]  Uninstall MCP server

Options:
  --claude     Install/uninstall for Claude Desktop (default)
  --cursor     Install/uninstall for Cursor
  --windsurf   Install/uninstall for Windsurf (Codeium)
  --zed        Install/uninstall for Zed
  --all        Install/uninstall for all supported editors

Examples:
  npx codebaxing install              # Install to Claude Desktop
  npx codebaxing install --cursor     # Install to Cursor
  npx codebaxing install --all        # Install to all editors
  npx codebaxing uninstall --all      # Uninstall from all editors
`);
}

function parseArgs(args: string[]): { command: string; editors: string[] } {
  const command = args[0] || 'help';
  const editors: string[] = [];

  for (const arg of args.slice(1)) {
    if (arg === '--claude') editors.push('Claude Desktop');
    else if (arg === '--cursor') editors.push('Cursor');
    else if (arg === '--windsurf') editors.push('Windsurf');
    else if (arg === '--zed') editors.push('Zed');
    else if (arg === '--all') editors.push('all');
    else if (arg === '--help' || arg === '-h') return { command: 'help', editors: [] };
  }

  // Default to Claude Desktop if no editor specified
  if (editors.length === 0 && (command === 'install' || command === 'uninstall')) {
    editors.push('Claude Desktop');
  }

  return { command, editors };
}

function main(): void {
  const args = process.argv.slice(2);

  // If no args or running as MCP server (no install/uninstall command)
  if (args.length === 0 || (!['install', 'uninstall', 'help', '--help', '-h'].includes(args[0]))) {
    // Run as MCP server - dynamic import to avoid loading heavy dependencies
    import('../mcp/server.js').catch(() => {
      // If import fails, show help
      printUsage();
    });
    return;
  }

  const { command, editors } = parseArgs(args);

  if (command === 'help' || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  const allEditors = getEditorConfigs();
  const selectedEditors = editors.includes('all')
    ? allEditors
    : allEditors.filter(e => editors.includes(e.name));

  console.log('\n🔧 Codebaxing MCP Server Installer\n');

  if (command === 'install') {
    let success = 0;
    for (const editor of selectedEditors) {
      if (installToEditor(editor)) success++;
    }

    console.log('\n' + '─'.repeat(50));
    console.log(`\n✨ Installation complete! (${success}/${selectedEditors.length})`);
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your editor');
    console.log('   2. Use the "index" tool to index your codebase');
    console.log('   3. Use the "search" tool to find code\n');
  } else if (command === 'uninstall') {
    let success = 0;
    for (const editor of selectedEditors) {
      if (uninstallFromEditor(editor)) success++;
    }

    console.log('\n' + '─'.repeat(50));
    console.log(`\n✨ Uninstallation complete! (${success}/${selectedEditors.length})\n`);
  }
}

main();
