import { vi } from "vitest";

/**
 * In-memory stand-in for window.localStorage.
 *
 * Newer Node releases define a global `localStorage` accessor that is undefined
 * unless --localstorage-file is passed, and it shadows jsdom's implementation.
 * Installing our own keeps persistence tests independent of the Node version.
 */
export class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, String(value));
  }
  [name: string]: unknown;
}

/** Replaces window.localStorage with a fresh MemoryStorage and returns it. */
export function installMemoryStorage(): MemoryStorage {
  const storage = new MemoryStorage();
  vi.stubGlobal("localStorage", storage);
  Object.defineProperty(window, "localStorage", { value: storage, configurable: true, writable: true });
  return storage;
}
