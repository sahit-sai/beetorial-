// Setup file for Vitest tests
import { afterEach } from 'vitest'

// Safe mock for localStorage in Node/JSDOM environments
class LocalStorageMock {
  private store: Record<string, string> = {}
  clear() {
    this.store = {}
  }
  getItem(key: string) {
    return this.store[key] || null
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }
  removeItem(key: string) {
    delete this.store[key]
  }
  get length() {
    return Object.keys(this.store).length
  }
  key(index: number) {
    return Object.keys(this.store)[index] || null
  }
}

if (typeof window !== 'undefined') {
  if (!window.localStorage || typeof window.localStorage.clear !== 'function') {
    Object.defineProperty(window, 'localStorage', {
      value: new LocalStorageMock(),
      writable: true,
    })
  }
}

if (typeof globalThis !== 'undefined') {
  if (!globalThis.localStorage || typeof globalThis.localStorage.clear !== 'function') {
    Object.defineProperty(globalThis, 'localStorage', {
      value: new LocalStorageMock(),
      writable: true,
    })
  }
}

afterEach(() => {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.clear === 'function') {
      localStorage.clear()
    }
  } catch {}
})
