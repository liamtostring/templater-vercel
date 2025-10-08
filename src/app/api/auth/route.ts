import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Auth from '@/lib/auth';
import Storage from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

// Session management using local Storage
class SessionManager {
  private static SESSION_PREFIX = 'session_';

  static async set(sessionId: string, data: { username: string; expires: number }): Promise<void> {
    try {
      await Storage.setAsync(`${this.SESSION_PREFIX}${sessionId}`, data);
      console.log(`💾 Session saved: ${sessionId.substring(0, 8)}...`);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  static async get(sessionId: string): Promise<{ username: string; expires: number } | null> {
    try {
      const session = await Storage.getAsync<{ username: string; expires: number }>(`${this.SESSION_PREFIX}${sessionId}`, null);
      if (session) {
        console.log(`📖 Session found: ${sessionId.substring(0, 8)}... for user: ${session.username}`);
      } else {
        console.warn(`⚠️ Session not found: ${sessionId.substring(0, 8)}...`);
      }
      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  static async delete(sessionId: string): Promise<void> {
    await Storage.deleteAsync(`${this.SESSION_PREFIX}${sessionId}`);
    console.log(`🗑️ Session deleted: ${sessionId.substring(0, 8)}...`);
  }

  static async count(): Promise<number> {
    const sessions = await Storage.getAllAsync<{ username: string; expires: number }>(this.SESSION_PREFIX);
    return Object.keys(sessions).length;
  }

  static async cleanup(): Promise<number> {
    const sessions = await Storage.getAllAsync<{ username: string; expires: number }>(this.SESSION_PREFIX);
    const now = Date.now();
    let cleaned = 0;

    for (const [key, session] of Object.entries(sessions)) {
      if (session.expires <= now) {
        await Storage.deleteAsync(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired session(s)`);
    }

    return cleaned;
  }
}

// Clean up expired sessions on module load (runs on each cold start)
(async () => {
  try {
    await SessionManager.cleanup();
    const count = await SessionManager.count();
    console.log('🔐 Auth module loaded. Active sessions:', count);
  } catch (error) {
    console.error('Session cleanup failed:', error);
  }
})();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, username, password } = body;

    if (action === 'login') {
      const isValid = await Auth.verify(username, password);

      if (isValid) {
        const sessionId = uuidv4();
        const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

        await SessionManager.set(sessionId, { username, expires });
        const count = await SessionManager.count();
        console.log(`✅ Login successful for ${username}. Total sessions:`, count);
        console.log(`📝 Session ID:`, sessionId.substring(0, 8) + '...');

        const cookieStore = cookies();
        cookieStore.set('session_id', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60, // 24 hours
          path: '/'
        });

        return NextResponse.json({ success: true, message: 'Login successful', sessionId: sessionId.substring(0, 8) });
      } else {
        console.warn(`❌ Invalid login attempt for username: ${username}`);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    }

    if (action === 'logout') {
      const cookieStore = cookies();
      const sessionId = cookieStore.get('session_id')?.value;

      if (sessionId) {
        await SessionManager.delete(sessionId);
        cookieStore.delete('session_id');
      }

      return NextResponse.json({ success: true, message: 'Logged out successfully' });
    }

    if (action === 'check') {
      const cookieStore = cookies();
      const sessionId = cookieStore.get('session_id')?.value;

      if (sessionId) {
        const session = await SessionManager.get(sessionId);
        if (session && session.expires > Date.now()) {
          return NextResponse.json({ authenticated: true });
        } else if (session && session.expires <= Date.now()) {
          console.warn('🔒 Session expired, cleaning up...');
          await SessionManager.delete(sessionId);
        }
      }

      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
