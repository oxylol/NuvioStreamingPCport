/**
 * Mock for expo-file-system on web
 * Uses IndexedDB for persistent storage
 */

const DB_NAME = 'nuvio-filesystem';
const STORE_NAME = 'files';

let db: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'uri' });
      }
    };
  });
}

export const documentDirectory = 'file:///nuvio/documents/';
export const cacheDirectory = 'file:///nuvio/cache/';
export const bundleDirectory = 'file:///nuvio/bundle/';

export const EncodingType = {
  UTF8: 'utf8',
  Base64: 'base64',
} as const;

export const FileSystemSessionType = {
  BACKGROUND: 'background',
  FOREGROUND: 'foreground',
} as const;

export const FileSystemUploadType = {
  BINARY_CONTENT: 0,
  MULTIPART: 1,
} as const;

export async function getInfoAsync(
  uri: string,
  _options?: { md5?: boolean; size?: boolean }
): Promise<{ exists: boolean; isDirectory: boolean; size?: number; modificationTime?: number; uri: string }> {
  try {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(uri);

      request.onsuccess = () => {
        if (request.result) {
          resolve({
            exists: true,
            isDirectory: request.result.isDirectory || false,
            size: request.result.content?.length || 0,
            modificationTime: request.result.modificationTime || Date.now(),
            uri,
          });
        } else {
          resolve({ exists: false, isDirectory: false, uri });
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch {
    return { exists: false, isDirectory: false, uri };
  }
}

export async function readAsStringAsync(
  uri: string,
  _options?: { encoding?: string; position?: number; length?: number }
): Promise<string> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(uri);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.content || '');
      } else {
        reject(new Error(`File not found: ${uri}`));
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function writeAsStringAsync(
  uri: string,
  content: string,
  _options?: { encoding?: string }
): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      uri,
      content,
      isDirectory: false,
      modificationTime: Date.now(),
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteAsync(
  uri: string,
  _options?: { idempotent?: boolean }
): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(uri);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function makeDirectoryAsync(
  uri: string,
  _options?: { intermediates?: boolean }
): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      uri,
      isDirectory: true,
      modificationTime: Date.now(),
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function readDirectoryAsync(uri: string): Promise<string[]> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const files = (request.result || [])
        .filter((item: { uri: string }) => item.uri.startsWith(uri) && item.uri !== uri)
        .map((item: { uri: string }) => item.uri.replace(uri, '').split('/')[0])
        .filter((name: string, index: number, arr: string[]) => arr.indexOf(name) === index);
      resolve(files);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function copyAsync(options: { from: string; to: string }): Promise<void> {
  const content = await readAsStringAsync(options.from);
  await writeAsStringAsync(options.to, content);
}

export async function moveAsync(options: { from: string; to: string }): Promise<void> {
  await copyAsync(options);
  await deleteAsync(options.from);
}

export async function downloadAsync(
  uri: string,
  fileUri: string,
  _options?: { headers?: Record<string, string> }
): Promise<{ uri: string; status: number; headers: Record<string, string> }> {
  try {
    const response = await fetch(uri);
    const content = await response.text();
    await writeAsStringAsync(fileUri, content);
    return {
      uri: fileUri,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    throw new Error(`Download failed: ${error}`);
  }
}

export function createDownloadResumable(
  uri: string,
  fileUri: string,
  options?: {
    headers?: Record<string, string>;
    md5?: boolean;
  },
  callback?: (downloadProgress: { totalBytesWritten: number; totalBytesExpectedToWrite: number }) => void,
  _resumeData?: string
) {
  return {
    downloadAsync: async () => {
      callback?.({ totalBytesWritten: 0, totalBytesExpectedToWrite: 100 });
      const result = await downloadAsync(uri, fileUri, options);
      callback?.({ totalBytesWritten: 100, totalBytesExpectedToWrite: 100 });
      return result;
    },
    pauseAsync: async () => '',
    resumeAsync: async () => downloadAsync(uri, fileUri, options),
    savable: () => '',
  };
}

export default {
  documentDirectory,
  cacheDirectory,
  bundleDirectory,
  EncodingType,
  FileSystemSessionType,
  FileSystemUploadType,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync,
  deleteAsync,
  makeDirectoryAsync,
  readDirectoryAsync,
  copyAsync,
  moveAsync,
  downloadAsync,
  createDownloadResumable,
};
