import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), 'src', 'config', 'mcp-servers.json');
    
    if (!fs.existsSync(configPath)) {
      return NextResponse.json(
        { error: 'Configuration file not found' },
        { status: 404 }
      );
    }

    const configContent = fs.readFileSync(configPath, 'utf8');
    
    return NextResponse.json(
      { 
        success: true, 
        content: configContent 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to read config file:', error);
    return NextResponse.json(
      { error: 'Failed to read configuration file' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    // Validate JSON format
    try {
      JSON.parse(content);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    const configPath = path.join(process.cwd(), 'src', 'config', 'mcp-servers.json');
    
    // Create backup
    const backupPath = path.join(process.cwd(), 'src', 'config', `mcp-servers.backup.${Date.now()}.json`);
    if (fs.existsSync(configPath)) {
      fs.copyFileSync(configPath, backupPath);
    }

    // Write new content
    fs.writeFileSync(configPath, content, 'utf8');
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Configuration updated successfully',
        backupPath: backupPath
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update config file:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration file' },
      { status: 500 }
    );
  }
}
