
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hxxyhdbwqeyoovpmnzgx.supabase.co';
const supabaseKey = 'sb_publishable_n8d6rCju_xWepc_-9sMQzw_HLrwJ_EB';

// Safe storage handler that falls back to memory if localStorage is restricted
class MemoryStorage {
  private storage = new Map<string, string>();
  getItem(key: string): string | null { return this.storage.get(key) || null; }
  setItem(key: string, value: string): void { this.storage.set(key, value); }
  removeItem(key: string): void { this.storage.delete(key); }
}

const getSafeStorage = () => {
  if (typeof window === 'undefined') return new MemoryStorage();
  try {
    const storage = window.localStorage;
    const testKey = '__roomeo_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch (e) {
    return new MemoryStorage();
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: getSafeStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Prevents problematic Location.assign/replace calls on init
    flowType: 'pkce',
  }
});
