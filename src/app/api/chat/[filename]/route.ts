import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const chatsDirectory = path.join(process.cwd(), 'src', 'app', 'prompts', 'chat');

// Ensure the chats directory exists
const ensureDir = async () => {
  try {
    await fs.access(chatsDirectory);
  } catch {
    await fs.mkdir(chatsDirectory, { recursive: true });
  }
};

interface Params {
  params: {
    filename: string;
  };
}

// GET - Fetch a single chat file
export async function GET(request: Request, { params }: Params) {
  const { filename } = await params;
  if (!filename) {
    return NextResponse.json({ message: 'Filename is required' }, { status: 400 });
  }

  await ensureDir();
  try {
    const filePath = path.join(chatsDirectory, filename);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const sessionData = JSON.parse(fileContent);
    return NextResponse.json(sessionData);
  } catch (error) {
    console.error(`Error reading chat file ${filename}:`, error);
    return NextResponse.json({ message: 'Chat not found or error reading file' }, { status: 404 });
  }
}

// DELETE - Delete a single chat file
export async function DELETE(request: Request, { params }: Params) {
  const { filename } = await params;
  if (!filename) {
    return NextResponse.json({ message: 'Filename is required' }, { status: 400 });
  }

  await ensureDir();
  try {
    const filePath = path.join(chatsDirectory, filename);
    await fs.unlink(filePath);
    return NextResponse.json({ message: `Chat ${filename} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting chat file ${filename}:`, error);
    return NextResponse.json({ message: 'Error deleting chat file' }, { status: 500 });
  }
}
