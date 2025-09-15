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

    console.log(`🔄 API Refresh: Attempting to refresh server: ${serverId}`);
    const mcpClient = getMCPClient();
    
    const success = await mcpClient.refreshServer(serverId);
    
    if (success) {
      console.log(`✅ API Refresh: Successfully refreshed ${serverId}`);
      return NextResponse.json({ 
        success: true, 
        message: `Server ${serverId} refreshed successfully`,
        status: 'connected'
      });
    } else {
      console.error(`❌ API Refresh: Failed to refresh ${serverId}`);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to refresh server ${serverId}`,
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Refresh server error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
