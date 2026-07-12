export const USE_MOCK = true;

// Simple fetch wrapper
export async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  if (USE_MOCK) {
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
    return handler(body) as Promise<T>;
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
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.message || 'API Error');
  }
  
  // Return null for 204 or empty responses, otherwise parse JSON
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }
  
  return response.json();
}
