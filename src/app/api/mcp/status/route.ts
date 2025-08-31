import { NextRequest, NextResponse } from 'next/server';
import { getMCPClient, getAvailableServerTemplates } from '@/lib/mcp';

/**
 * GET /api/mcp/status
 * فحص حالة MCP servers (بدون تهيئة تلقائية)
 */
export async function GET() {
  try {
    const mcpClient = getMCPClient();
    const servers = mcpClient.getServersStatus();
    const tools = mcpClient.getAllTools();
    const availableTemplates = getAvailableServerTemplates();
    
    return NextResponse.json({
      success: true,
      activeServers: servers,
      availableTools: tools,
      serverTemplates: availableTemplates,
      stats: {
        connected: servers.filter(s => s.isConnected).length,
        total: servers.length,
        availableTools: tools.length
      },
      message: servers.length === 0 
        ? 'No servers running - manual control enabled'
        : `${servers.filter(s => s.isConnected).length}/${servers.length} servers connected`
    });
  } catch (error) {
    console.error('MCP status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get MCP status',
      activeServers: [],
      availableTools: [],
      serverTemplates: [],
      stats: { connected: 0, total: 0, availableTools: 0 }
    });
  }
}
