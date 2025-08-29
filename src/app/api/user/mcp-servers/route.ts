import { NextRequest, NextResponse } from 'next/server';
import { handleAPIError } from '@/lib/errorHandling';

// Mock database for now - in production, replace with your database
const userMCPServers: { [userId: string]: any[] } = {};

/**
 * GET /api/user/mcp-servers
 * Get user's saved MCP servers | الحصول على خوادم MCP المحفوظة للمستخدم
 */
export async function GET(request: NextRequest) {
  try {
    // Temporary fix: Skip auth to avoid headers() error
    const userId = 'temp-user';
    
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Unauthorized | غير مصرح',
          message: 'User must be logged in to access servers | يجب تسجيل الدخول للوصول للخوادم'
        }, 
        { status: 401 }
      );
    }

    // Get user's servers from storage
    const servers = userMCPServers[userId] || [];
    
    return NextResponse.json({
      success: true,
      servers,
      message: `Found ${servers.length} servers | تم العثور على ${servers.length} خادم`
    });

  } catch (error) {
    const apiError = handleAPIError(error);
    return NextResponse.json(
      { 
        error: apiError.code,
        message: apiError.message 
      }, 
      { status: apiError.status }
    );
  }
}

/**
 * POST /api/user/mcp-servers
 * Save user's MCP servers | حفظ خوادم MCP للمستخدم
 */
export async function POST(request: NextRequest) {
  try {
    // Temporary fix: Skip auth to avoid headers() error
    const userId = 'temp-user'; 
    
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Unauthorized | غير مصرح',
          message: 'User must be logged in to save servers | يجب تسجيل الدخول لحفظ الخوادم'
        }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { servers } = body;

    if (!Array.isArray(servers)) {
      return NextResponse.json(
        { 
          error: 'Invalid data | بيانات غير صحيحة',
          message: 'Servers must be an array | يجب أن تكون الخوادم مصفوفة'
        }, 
        { status: 400 }
      );
    }

    // Validate server data
    for (const server of servers) {
      if (!server.name || !server.command) {
        return NextResponse.json(
          { 
            error: 'Invalid server data | بيانات خادم غير صحيحة',
            message: 'Each server must have name and command | يجب أن يحتوي كل خادم على اسم وأمر'
          }, 
          { status: 400 }
        );
      }
    }

    // Save servers to user's storage
    userMCPServers[userId] = servers;
    
    return NextResponse.json({
      success: true,
      message: `Saved ${servers.length} servers successfully | تم حفظ ${servers.length} خادم بنجاح`,
      servers
    });

  } catch (error) {
    const apiError = handleAPIError(error);
    return NextResponse.json(
      { 
        error: apiError.code,
        message: apiError.message 
      }, 
      { status: apiError.status }
    );
  }
}

/**
 * PUT /api/user/mcp-servers
 * Update a specific MCP server | تحديث خادم MCP محدد
 */
export async function PUT(request: NextRequest) {
  try {
    // Temporary fix: Skip auth to avoid headers() error
    const userId = 'temp-user';  

    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Unauthorized | غير مصرح',
          message: 'User must be logged in to update servers | يجب تسجيل الدخول لتحديث الخوادم'
        }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { serverName, serverData } = body;

    if (!serverName || !serverData) {
      return NextResponse.json(
        { 
          error: 'Invalid data | بيانات غير صحيحة',
          message: 'Server name and data are required | اسم الخادم والبيانات مطلوبة'
        }, 
        { status: 400 }
      );
    }

    const userServers = userMCPServers[userId] || [];
    const serverIndex = userServers.findIndex(s => s.name === serverName);
    
    if (serverIndex === -1) {
      return NextResponse.json(
        { 
          error: 'Server not found | خادم غير موجود',
          message: 'Server not found in user\'s saved servers | الخادم غير موجود في خوادم المستخدم المحفوظة'
        }, 
        { status: 404 }
      );
    }

    // Update server
    userServers[serverIndex] = { ...userServers[serverIndex], ...serverData };
    userMCPServers[userId] = userServers;
    
    return NextResponse.json({
      success: true,
      message: `Server "${serverName}" updated successfully | تم تحديث الخادم "${serverName}" بنجاح`,
      server: userServers[serverIndex]
    });

  } catch (error) {
    const apiError = handleAPIError(error);
    return NextResponse.json(
      { 
        error: apiError.code,
        message: apiError.message 
      }, 
      { status: apiError.status }
    );
  }
}

/**
 * DELETE /api/user/mcp-servers
 * Delete a specific MCP server | حذف خادم MCP محدد
 */
export async function DELETE(request: NextRequest) {
  try {
    // Temporary fix: Skip auth to avoid headers() error
    const userId = 'temp-user'; 

    
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Unauthorized | غير مصرح',
          message: 'User must be logged in to delete servers | يجب تسجيل الدخول لحذف الخوادم'
        }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const serverName = searchParams.get('name');

    if (!serverName) {
      return NextResponse.json(
        { 
          error: 'Invalid data | بيانات غير صحيحة',
          message: 'Server name is required | اسم الخادم مطلوب'
        }, 
        { status: 400 }
      );
    }

    const userServers = userMCPServers[userId] || [];
    const filteredServers = userServers.filter(s => s.name !== serverName);
    
    if (filteredServers.length === userServers.length) {
      // Server not found, but return success to avoid frontend errors
      return NextResponse.json({
        success: true,
        message: `Server "${serverName}" was not found or already deleted | الخادم "${serverName}" غير موجود أو تم حذفه بالفعل`
      });
    }

    userMCPServers[userId] = filteredServers;
    
    return NextResponse.json({
      success: true,
      message: `Server "${serverName}" deleted successfully | تم حذف الخادم "${serverName}" بنجاح`
    });

  } catch (error) {
    const apiError = handleAPIError(error);
    return NextResponse.json(
      { 
        error: apiError.code,
        message: apiError.message 
      }, 
      { status: apiError.status }
    );
  }
}
