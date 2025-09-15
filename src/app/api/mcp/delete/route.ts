import { NextRequest, NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp';

export async function DELETE(request: NextRequest) {
  try {
    const { serverId } = await request.json();
    
    if (!serverId) {
      return NextResponse.json(
        { success: false, error: 'Server ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ API Delete: Attempting to remove server: ${serverId}`);
    const mcpClient = getMCPClient();
    
    const success = await mcpClient.removeServer(serverId);
    
    if (success) {
      console.log(`✅ API Delete: Successfully removed ${serverId}`);
      return NextResponse.json({ 
        success: true, 
        message: `Server ${serverId} removed successfully`
      });
    } else {
      console.error(`❌ API Delete: Failed to remove ${serverId}`);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to remove server ${serverId}`
      });
    }
  } catch (error) {
    console.error('Delete server error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return DELETE(request);
}
