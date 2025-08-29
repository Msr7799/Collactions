// Chat Storage System - API-driven for server-side file storage
import { AIModel } from '@/lib/models';

// Interfaces remain the same as they define the data structure
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string; // Use string for timestamps to ensure serializability
  model?: string;
  // Attachments are complex and not handled in this version
}

export interface ChatSession {
  id: string;
  filename: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  model: AIModel;
  messageCount?: number; // Optional, can be added by the API
}

// Simplified metadata for localStorage
export interface ClientMetadata {
  currentSessionId: string | null;
  lastUsedModel: AIModel | null;
}

const METADATA_KEY = 'collactions_chat_client_metadata';

export class ChatStorageManager {
  private metadata: ClientMetadata = {
    currentSessionId: null,
    lastUsedModel: null,
  };
  private currentSession: ChatSession | null = null;

  constructor() {
    this.loadClientMetadata();
  }

  // Load simple metadata from localStorage
  private loadClientMetadata(): void {
    try {
      const stored = localStorage.getItem(METADATA_KEY);
      if (stored) {
        this.metadata = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading client chat metadata:', error);
    }
  }

  // Save simple metadata to localStorage
  private saveClientMetadata(): void {
    try {
      localStorage.setItem(METADATA_KEY, JSON.stringify(this.metadata));
    } catch (error) {
      console.error('Error saving client chat metadata:', error);
    }
  }

  // Generate filename based on current date and time
  private generateFilename(): string {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `chat-${day}-${month}-${year}-${hours}${minutes}${seconds}.json`;
  }

  // --- API Communication Methods ---

  // Save/Update a session file on the server
  public async saveSession(session: ChatSession): Promise<ChatSession> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
      if (!response.ok) {
        throw new Error('Failed to save session');
      }
      return await response.json(); // The API should return the saved session
    } catch (error) {
      console.error('Error saving chat session via API:', error);
      throw error;
    }
  }

  // --- Public Methods ---

  // Get all session summaries from the server
  async listSessions(): Promise<any[]> { // Returns summaries, not full ChatSession objects
    try {
      const response = await fetch('/api/chat');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all sessions:', error);
      return [];
    }
  }

  // Get a single full session from the server by its ID (filename)
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const response = await fetch(`/api/chat/${sessionId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Error loading session ${sessionId}:`, error);
      return null;
    }
  }

  async getCurrentSession(): Promise<ChatSession | null> {
    const sessionId = this.getCurrentSessionId();
    if (!sessionId) return null;
    return this.getSession(sessionId);
  }

  // Get all sessions from the server
  async getAllSessions(): Promise<ChatSession[]> {
    try {
      const response = await fetch('/api/chat');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all sessions:', error);
      return [];
    }
  }

  // Load a full session by its filename from the server
  async loadSessionByFilename(filename: string): Promise<ChatSession | null> {
    try {
      const response = await fetch(`/api/chat/${filename}`);
      if (!response.ok) return null;
      const session = await response.json();
      this.currentSession = session;
      this.metadata.currentSessionId = session.id;
      this.saveClientMetadata();
      return session;
    } catch (error) {
      console.error(`Error loading session ${filename}:`, error);
      return null;
    }
  }

  // Create a new chat session
  async createSession(model: AIModel, messages: ChatMessage[]): Promise<ChatSession> {
    const now = new Date().toISOString();
    const filename = this.generateFilename();

    const newSession: ChatSession = {
      id: filename, // Use filename as the unique ID
      filename: filename,
      title: messages[0]?.content.slice(0, 40) || 'New Chat',
      messages: messages,
      createdAt: now,
      updatedAt: now,
      model: model,
    };

    const savedSession = await this.saveSession(newSession);
    this.currentSession = savedSession;
    this.metadata.currentSessionId = savedSession.id;
    this.setLastUsedModel(model);
    this.saveClientMetadata();
    
    return savedSession;
  }

  // Add a message to the current session
  async addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void> {
    if (!this.currentSession) {
      // This case should ideally be handled by creating a session first
      console.warn('No active session to add a message to.');
      return;
    }

    this.currentSession.messages.push({
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    this.currentSession.updatedAt = new Date().toISOString();

    // Update title if it's the first user message
    if (message.role === 'user' && this.currentSession.messages.length <= 2) {
      this.currentSession.title = message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '');
    }

    await this.saveSession(this.currentSession);
  }
  
  // Update the content of the last message (e.g., for streaming responses)
  async updateLastMessage(content: string): Promise<void> {
    if (this.currentSession && this.currentSession.messages.length > 0) {
      const lastMessage = this.currentSession.messages[this.currentSession.messages.length - 1];
      lastMessage.content = content;
      this.currentSession.updatedAt = new Date().toISOString();
      // Note: Saving happens at the end of the stream in the main component for efficiency
    }
  }

  // Save the current session state to the server (e.g., after streaming is complete)
  async saveCurrentSessionState(): Promise<void> {
    if (this.currentSession) {
      await this.saveSession(this.currentSession);
    }
  }

  // Delete a session from the server
  async deleteSession(sessionId: string): Promise<void> { // Use sessionId consistently
    try {
      await fetch(`/api/chat/${sessionId}`, { method: 'DELETE' });
      if (this.currentSession?.id === sessionId) {
        this.currentSession = null;
        this.metadata.currentSessionId = null;
        this.saveClientMetadata();
      }
    } catch (error) {
      console.error(`Error deleting session ${sessionId}:`, error);
    }
  }

  // Legacy delete method, can be removed later
  async deleteSessionByFilename(filename: string): Promise<void> {
    try {
      await fetch(`/api/chat/${filename}`, { method: 'DELETE' });
      if (this.currentSession?.filename === filename) {
        this.currentSession = null;
        this.metadata.currentSessionId = null;
        this.saveClientMetadata();
      }
    } catch (error) {
      console.error(`Error deleting session ${filename}:`, error);
    }
  }

  // Get/Set last used model in localStorage
  getLastUsedModel(): AIModel | null {
    return this.metadata.lastUsedModel;
  }

  setLastUsedModel(model: AIModel): void {
    this.metadata.lastUsedModel = model;
    this.saveClientMetadata();
  }
  
  // Get current session ID from localStorage
  getCurrentSessionId(): string | null {
    return this.metadata.currentSessionId;
  }

  // Set the current active session ID
  setCurrentSessionId(sessionId: string | null): void {
    this.metadata.currentSessionId = sessionId;
    this.saveClientMetadata();
  }

  // Set the current active session
  async setCurrentSession(session: ChatSession): Promise<void> {
    this.currentSession = session;
    this.metadata.currentSessionId = session.id;
    this.saveClientMetadata();
  }

  // Get the locally cached current session
  getLocalCurrentSession(): ChatSession | null {
    return this.currentSession;
  }
}

// Create singleton instance
export const chatStorage = new ChatStorageManager();
