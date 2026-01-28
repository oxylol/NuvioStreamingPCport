/**
 * Mock for react-native-mmkv on web using localStorage
 */

class MMKVMock {
  private prefix: string;

  constructor(config?: { id?: string }) {
    this.prefix = config?.id || 'mmkv';
  }

  set(key: string, value: string | number | boolean): void {
    try {
      localStorage.setItem(`${this.prefix}:${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
  }

  getString(key: string): string | undefined {
    try {
      const value = localStorage.getItem(`${this.prefix}:${key}`);
      if (value !== null) {
        const parsed = JSON.parse(value);
        return typeof parsed === 'string' ? parsed : undefined;
      }
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
    return undefined;
  }

  getNumber(key: string): number | undefined {
    try {
      const value = localStorage.getItem(`${this.prefix}:${key}`);
      if (value !== null) {
        const parsed = JSON.parse(value);
        return typeof parsed === 'number' ? parsed : undefined;
      }
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
    return undefined;
  }

  getBoolean(key: string): boolean | undefined {
    try {
      const value = localStorage.getItem(`${this.prefix}:${key}`);
      if (value !== null) {
        const parsed = JSON.parse(value);
        return typeof parsed === 'boolean' ? parsed : undefined;
      }
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
    return undefined;
  }

  delete(key: string): void {
    try {
      localStorage.removeItem(`${this.prefix}:${key}`);
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
  }

  contains(key: string): boolean {
    try {
      return localStorage.getItem(`${this.prefix}:${key}`) !== null;
    } catch (e) {
      return false;
    }
  }

  getAllKeys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.prefix}:`)) {
          keys.push(key.slice(this.prefix.length + 1));
        }
      }
      return keys;
    } catch (e) {
      return [];
    }
  }

  clearAll(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.prefix}:`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
  }
}

export const MMKV = MMKVMock;
export default { MMKV };
