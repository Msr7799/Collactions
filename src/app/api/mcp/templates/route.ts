import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const configPath = path.join(process.cwd(), 'src', 'config', 'mcp-servers.json');

export async function GET() {
  try {
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);
    
    // Convert official servers to template format
    const templates = config.official_servers.map((server: any) => ({
      id: server.id,
      name: server.name,
      description: server.description,
      category: server.category,
      command: server.command,
      args: server.args,
      tools: server.tools?.map((tool: any) => tool.name) || []
    }));
    
    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error loading MCP templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load MCP templates' },
      { status: 500 }
    );
  }
}
