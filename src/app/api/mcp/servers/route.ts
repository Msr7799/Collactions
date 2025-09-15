import { NextRequest, NextResponse } from 'next/server';
import { getMCPClient, addCustomServer, removeCustomServer, getAvailableServerTemplates } from '@/lib/mcp';

/**
 * GET /api/mcp/servers - قائمة الخوادم النشطة
 */
export async function GET() {
  try {
    const mcpClient = getMCPClient();
    const activeServers = mcpClient.getServersStatus();
    const availableTools = mcpClient.getAllTools();
    const serverTemplates = getAvailableServerTemplates();

    return NextResponse.json({
      success: true,
      activeServers,
      availableTools,
      serverTemplates,
      message: `${activeServers.filter(s => s.isConnected).length}/${activeServers.length} servers active`
    });
  } catch (error) {
    console.error('Error getting servers:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get servers',
      activeServers: [],
      availableTools: [],
      serverTemplates: []
    });
  }
}

/**
 * POST /api/mcp/servers - إضافة خادم جديد
 */
export async function POST(request: NextRequest) {
  try {
    const { serverId, name, command, args } = await request.json();

    if (!serverId || !name || !command || !Array.isArray(args)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: serverId, name, command, args'
      }, { status: 400 });
    }

    // التحقق من عدم وجود خادم بنفس المعرف
    const mcpClient = getMCPClient();
    const existing = mcpClient.getServersStatus().find(s => s.id === serverId);
    
    if (existing) {
      return NextResponse.json({
        success: false,
        error: `Server with ID '${serverId}' already exists`
      }, { status: 409 });
    }

    // إضافة الخادم
    const success = await addCustomServer(serverId, { command, args });
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `Server '${name}' added and started successfully`,
        serverId
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `Failed to start server '${name}'`
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error adding server:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/mcp/servers - حذف خادم
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const serverId = url.searchParams.get('id');

    if (!serverId) {
      return NextResponse.json({
        success: false,
        error: 'Server ID is required'
      }, { status: 400 });
    }

    // التحقق من وجود الخادم
    const mcpClient = getMCPClient();
    const existing = mcpClient.getServersStatus().find(s => s.id === serverId);
    
    if (!existing) {
      return NextResponse.json({
        success: false,
        error: `Server with ID '${serverId}' not found`
      }, { status: 404 });
    }

    // حذف الخادم
    await removeCustomServer(serverId);
    
    return NextResponse.json({
      success: true,
      message: `Server '${serverId}' stopped and removed successfully`
    });
  } catch (error) {
    console.error('Error removing server:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
