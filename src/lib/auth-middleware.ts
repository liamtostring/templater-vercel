import { NextRequest } from 'next/server';
import Storage from '@/lib/storage';

// Session management (shared with auth route) - uses local storage
class SessionManager {
  private static SESSION_PREFIX = 'session_';

  static async get(sessionId: string): Promise<{ username: string; expires: number } | null> {
    return await Storage.getAsync<{ username: string; expires: number }>(`${this.SESSION_PREFIX}${sessionId}`, null);
  }

  static async delete(sessionId: string): Promise<void> {
    await Storage.deleteAsync(`${this.SESSION_PREFIX}${sessionId}`);
    console.log(`🗑️ Session deleted: ${sessionId.substring(0, 8)}...`);
  }
}

// Helper to check authentication in API routes (async version)
export async function checkAuth(request: NextRequest): Promise<boolean> {
  const sessionId = request.cookies.get('session_id')?.value;

  console.log('🔍 Auth check - Session ID from cookie:', sessionId ? sessionId.substring(0, 8) + '...' : 'MISSING');

  if (!sessionId) {
    console.warn('🔒 Auth check failed: No session_id cookie found');
    console.warn('Available cookies:', request.cookies.getAll().map(c => c.name).join(', '));
    return false;
  }

  const session = await SessionManager.get(sessionId);

  if (!session) {
    console.warn('🔒 Auth check failed: Session not found for ID:', sessionId.substring(0, 8) + '...');
    return false;
  }

  if (session.expires <= Date.now()) {
    console.warn('🔒 Auth check failed: Session expired at', new Date(session.expires).toISOString());
    await SessionManager.delete(sessionId);
    return false;
  }

  console.log('✅ Auth check passed for user:', session.username);
  return true;
}
