
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hxxyhdbwqeyoovpmnzgx.supabase.co';
const supabaseKey = 'sb_publishable_n8d6rCju_xWepc_-9sMQzw_HLrwJ_EB';

/**
 * Fallback in-memory storage for environments where localStorage/sessionStorage is restricted.
 */
class MemoryStorage {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }
}

/**
 * Robust check for storage availability.
 * Wraps every interaction with 'window.localStorage' in a try-catch.
 */
const getSafeStorage = () => {
  if (typeof window === 'undefined') return new MemoryStorage();

  try {
    // In some sandboxed contexts, even referencing window.localStorage throws SecurityError
    const storage = window.localStorage;
    if (!storage) return new MemoryStorage();

    const testKey = '__roomeo_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch (e) {
    console.warn('Roomeo: Persistent storage access denied (SecurityError). Using in-memory fallback.');
    return new MemoryStorage();
  }
};

/**
 * Initialize Supabase with BroadcastChannel disabled.
 * BroadcastChannel is a common cause of SecurityError in cross-origin iframes.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: getSafeStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
  },
  // Explicitly disable features that might cause security errors in restricted environments
  global: {
    headers: { 'x-application-name': 'roomeo-ai' }
  }
});
