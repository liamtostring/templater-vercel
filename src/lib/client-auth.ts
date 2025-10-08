/**
 * Client-side authentication utilities
 */

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check' })
    });

    if (!res.ok) return false;

    const data = await res.json();
    return data.authenticated === true;
  } catch (error) {
    console.error('❌ Auth check failed:', error);
    return false;
  }
}

/**
 * Handle 401 Unauthorized error
 * Shows alert and redirects to login
 */
export function handle401Error(): void {
  console.warn('🔒 Session expired - redirecting to login');
  alert('⚠️ Your session has expired. Please login again.');
  window.location.href = '/login';
}

/**
 * Wrapper for fetch that handles 401 errors
 */
export async function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 401) {
    handle401Error();
    throw new Error('Unauthorized - session expired');
  }

  return response;
}

/**
 * Check session and redirect if expired
 */
export async function requireAuth(): Promise<boolean> {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    console.warn('🔒 Not authenticated - redirecting to login');
    alert('⚠️ Please login to continue.');
    window.location.href = '/login';
    return false;
  }

  return true;
}
