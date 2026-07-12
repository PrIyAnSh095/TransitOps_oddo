// Routes that have real backend endpoints implemented.
// Everything else falls through to the mock handler.
const REAL_API_PREFIXES = ['/api/auth', '/api/vehicles', '/api/drivers'];

// Simple fetch wrapper
export async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const isRealRoute = REAL_API_PREFIXES.some((prefix) => url.startsWith(prefix));

  if (!isRealRoute) {
    // Use mock handler for unimplemented backend routes
    const handlers = (await import('../mocks/handlers.ts')).default;
    const method = options?.method?.toUpperCase() || 'GET';
    const path = url.replace('/api', '');
    
    // Simple mock router
    const handlerKey = `${method} ${path}`;
    
    let handler;
    // Basic exact match or regex match
    if (handlers[handlerKey]) {
      handler = handlers[handlerKey];
    } else {
      // Very basic regex matching for dynamic routes if needed later
      handler = Object.entries(handlers).find(([key]) => {
        if (key.includes(':')) {
           const regexPattern = key.replace(/:\w+/g, '[^/]+');
           const regex = new RegExp(`^${regexPattern}$`);
           return regex.test(handlerKey);
        }
        return false;
      })?.[1];
    }

    if (!handler) {
      throw new Error(`Mock endpoint not found: ${handlerKey}`);
    }

    const body = options?.body ? JSON.parse(options.body as string) : undefined;
    return handler(body, path) as Promise<T>;
  }

  // Real fetch implementation
  const token = localStorage.getItem('transitops_token');
  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'API Error' }));
    // Throw the entire object so callers can check errorData.requireCaptcha etc
    throw errorData;
  }
  
  // Return null for 204 or empty responses, otherwise parse JSON
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }
  
  return response.json();
}
