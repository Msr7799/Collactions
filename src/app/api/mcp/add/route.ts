import { NextRequest, NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp';

export async function POST(request: NextRequest) {
  try {
    const serverConfig = await request.json();
    
    if (!serverConfig.id || !serverConfig.name || !serverConfig.command) {
      return NextResponse.json(
        { success: false, error: 'Server ID, name, and command are required' },
        { status: 400 }
      );
    }

    const mcpClient = getMCPClient();
    
    // Add server to MCP client
    const started = await mcpClient.addServer(serverConfig.id, {
      command: serverConfig.command,
      args: serverConfig.args || [],
      env: serverConfig.env || {}
    });

    return NextResponse.json({ 
      success: true, 
      message: `Server ${serverConfig.name} added successfully`,
      serverId: serverConfig.id,
      status: started ? 'connected' : 'disconnected',
      server: {
        ...serverConfig,
        status: started ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    console.error('Add server error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add server' },
      { status: 500 }
    );
  }
}
