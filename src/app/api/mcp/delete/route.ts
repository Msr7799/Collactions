import { NextRequest, NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp';

export async function POST(request: NextRequest) {
  try {
    const { serverId } = await request.json();
    
    if (!serverId) {
      return NextResponse.json(
        { success: false, error: 'Server ID is required' },
        { status: 400 }
      );
    }

    const mcpClient = getMCPClient();
    
    // Stop the server first if it's running
    await mcpClient.stopServer(serverId);
    
    // Remove server from MCP client
    await mcpClient.removeServer(serverId);

    return NextResponse.json({ 
      success: true, 
      message: `Server ${serverId} removed successfully`
    });
  } catch (error) {
    console.error('Delete server error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete server' },
      { status: 500 }
    );
  }
}
