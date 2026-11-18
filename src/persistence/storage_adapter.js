/**
 * TRUST Business Simulator - Capa de Persistencia: Adaptadores de Almacenamiento
 * 
 * Abstrae el medio físico de almacenamiento (LocalStorage en navegador,
 * o InMemory en entornos de pruebas automatizadas y Node.js).
 */

export class IStorageAdapter {
  getItem(key) {
    throw new Error('Método getItem no implementado');
  }
  setItem(key, value) {
    throw new Error('Método setItem no implementado');
  }
  removeItem(key) {
    throw new Error('Método removeItem no implementado');
  }
  clear() {
    throw new Error('Método clear no implementado');
  }
}

export class InMemoryStorageAdapter extends IStorageAdapter {
  constructor() {
    super();
    this.storage = new Map();
  }

  getItem(key) {
    return this.storage.has(key) ? this.storage.get(key) : null;
  }

  setItem(key, value) {
    this.storage.set(key, String(value));
  }

  removeItem(key) {
    this.storage.delete(key);
  }

  clear() {
    this.storage.clear();
  }
}

export class LocalStorageAdapter extends IStorageAdapter {
  constructor() {
    super();
    this.is_available = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    this.fallback = new InMemoryStorageAdapter();
  }

  getItem(key) {
    if (this.is_available) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        return this.fallback.getItem(key);
      }
    }
    return this.fallback.getItem(key);
  }

  setItem(key, value) {
    if (this.is_available) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (e) {
        this.fallback.setItem(key, value);
        return;
      }
    }
    this.fallback.setItem(key, value);
  }

  removeItem(key) {
    if (this.is_available) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (e) {
        this.fallback.removeItem(key);
        return;
      }
    }
    this.fallback.removeItem(key);
  }

  clear() {
    if (this.is_available) {
      try {
        window.localStorage.clear();
        return;
      } catch (e) {
        this.fallback.clear();
        return;
      }
    }
    this.fallback.clear();
  }
}
