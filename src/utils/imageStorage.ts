// Durable image persistence utility for SAMRIDHII Broom models

const DB_NAME = 'samriddhi_broom_db';
const DB_VERSION = 1;
const STORE_NAME = 'broom_photos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveToIndexedDB(key: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataUrl, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('IndexedDB save failed', e);
  }
}

export async function getFromIndexedDB(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function removeFromIndexedDB(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
}

/**
 * Optimizes an uploaded image file using an offscreen canvas.
 * Reduces 5-15MB smartphone photos down to ~150-250KB JPEG, avoiding QuotaExceededError in localStorage.
 */
export function optimizeImage(file: File, maxWidth = 1600, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(optimizedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Persists an image across all layers:
 * 1. Memory & Event
 * 2. localStorage (lightweight optimized)
 * 3. IndexedDB (durable browser storage)
 * 4. Server disk filesystem (/api/save-broom-image)
 */
export async function persistBroomImage(modelId: string, file: File): Promise<string> {
  const optimizedDataUrl = await optimizeImage(file);
  const storageKey = `samriddhi_custom_img_${modelId}`;

  // 1. Save to localStorage
  try {
    localStorage.setItem(storageKey, optimizedDataUrl);
  } catch (err) {
    console.warn('localStorage full, falling back to IndexedDB', err);
  }

  // 2. Save to IndexedDB
  await saveToIndexedDB(storageKey, optimizedDataUrl);

  // 3. Save to server disk
  try {
    await fetch('/api/save-broom-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelId, dataUrl: optimizedDataUrl }),
    });
  } catch (e) {
    console.warn('Server disk save failed, client copy preserved', e);
  }

  // 4. Dispatch event to update all instances
  window.dispatchEvent(
    new CustomEvent('samriddhi_broom_image_updated', {
      detail: { modelId, dataUrl: optimizedDataUrl },
    })
  );

  return optimizedDataUrl;
}

/**
 * Resolves the stored custom photo for a model from any available layer.
 */
export async function loadBroomImage(modelId: string): Promise<string | null> {
  const storageKey = `samriddhi_custom_img_${modelId}`;

  // 1. Check localStorage
  try {
    const local = localStorage.getItem(storageKey);
    if (local) return local;
  } catch {
    // ignore
  }

  // 2. Check IndexedDB
  const idb = await getFromIndexedDB(storageKey);
  if (idb) {
    // Rehydrate localStorage if possible
    try {
      localStorage.setItem(storageKey, idb);
    } catch {
      // ignore
    }
    return idb;
  }

  // 3. Check server static upload file
  const serverPath = `/assets/uploads/${modelId}.jpg`;
  try {
    const res = await fetch(serverPath, { method: 'HEAD' });
    if (res.ok) {
      return serverPath;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Clears custom photo for a model
 */
export async function resetBroomImage(modelId: string): Promise<void> {
  const storageKey = `samriddhi_custom_img_${modelId}`;
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // ignore
  }
  await removeFromIndexedDB(storageKey);

  window.dispatchEvent(
    new CustomEvent('samriddhi_broom_image_updated', {
      detail: { modelId, dataUrl: null },
    })
  );
}
