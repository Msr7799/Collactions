import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { ChatSession } from '@/app/prompts/chatStorage';

const CHATS_DIR = path.join(process.cwd(), 'src', 'app', 'prompts', 'chat');

// Ensure the chats directory exists
const ensureDir = async () => {
  try {
    await fs.access(CHATS_DIR);
  } catch {
    await fs.mkdir(CHATS_DIR, { recursive: true });
  }
};

// GET - List all chat session summaries
export async function GET() {
  await ensureDir();
  try {
    const files = await fs.readdir(CHATS_DIR);
    const sessions = await Promise.all(
      files.map(async (file) => {
        if (path.extname(file) === '.json') {
          const content = await fs.readFile(path.join(CHATS_DIR, file), 'utf-8');
          const session: ChatSession = JSON.parse(content);
          // Return a summary, not the full message history
          return {
            id: session.id,
            title: session.title,
            updatedAt: session.updatedAt,
            messageCount: session.messages.length,
            model: session.model
          };
        }
        return null;
      })
    );

    const validSessions = sessions.filter(s => s !== null).sort((a, b) => new Date(b!.updatedAt).getTime() - new Date(a!.updatedAt).getTime());
    return NextResponse.json(validSessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json({ message: 'Error fetching chat sessions' }, { status: 500 });
  }
}

// POST - Create or Update a chat session
export async function POST(request: Request) {
  await ensureDir();
  try {
    const session: ChatSession = await request.json();
    if (!session.id || !session.filename) {
      return NextResponse.json({ message: 'Session ID and filename are required' }, { status: 400 });
    }

    const filePath = path.join(CHATS_DIR, session.filename);
    await fs.writeFile(filePath, JSON.stringify(session, null, 2));
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error saving chat session:', error);
    return NextResponse.json({ message: 'Error saving chat session' }, { status: 500 });
  }
}
