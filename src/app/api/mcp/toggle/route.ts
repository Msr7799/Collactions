import { NextRequest, NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp';

export async function POST(request: NextRequest) {
  try {
    const { serverId, action } = await request.json();
    
    if (!serverId || !action) {
      return NextResponse.json(
        { success: false, error: 'Server ID and action are required' },
        { status: 400 }
      );
    }

    const mcpClient = getMCPClient();
    
    if (action === 'connect') {
      // Start the server
      const success = await mcpClient.startServer(serverId);
      if (success) {
        return NextResponse.json({ 
          success: true, 
          message: `Server ${serverId} connected successfully`,
          status: 'connected'
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: `Failed to connect server ${serverId}`,
          status: 'disconnected'
        });
      }
    } else if (action === 'disconnect') {
      // Stop the server
      console.log(`🔄 API Toggle: Attempting to disconnect server: ${serverId}`);
      const success = await mcpClient.stopServer(serverId);
      console.log(`🔄 API Toggle: stopServer result for ${serverId}:`, success);
      
      if (success) {
        console.log(`✅ API Toggle: Successfully disconnected ${serverId}`);
        return NextResponse.json({ 
          success: true, 
          message: `Server ${serverId} disconnected successfully`,
          status: 'disconnected'
        });
      } else {
        console.error(`❌ API Toggle: Failed to disconnect ${serverId}`);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to disconnect server ${serverId}`,
          status: 'connected'
        });
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "connect" or "disconnect"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Toggle server error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
