/**
 * Mock for @kesha-antonov/react-native-background-downloader on web
 * Uses fetch API for downloads
 */

export interface DownloadTask {
  id: string;
  state: string;
  percent: number;
  bytesDownloaded: number;
  totalBytes: number;
  begin: (callback: (totalBytes: number) => void) => DownloadTask;
  progress: (callback: (percent: number, bytesDownloaded: number, totalBytes: number) => void) => DownloadTask;
  done: (callback: () => void) => DownloadTask;
  error: (callback: (error: Error, errorCode: number) => void) => DownloadTask;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
}

const activeDownloads: Map<string, AbortController> = new Map();

export function download(options: {
  id: string;
  url: string;
  destination: string;
  headers?: Record<string, string>;
}): DownloadTask {
  const abortController = new AbortController();
  activeDownloads.set(options.id, abortController);

  let beginCallback: ((totalBytes: number) => void) | null = null;
  let progressCallback: ((percent: number, bytesDownloaded: number, totalBytes: number) => void) | null = null;
  let doneCallback: (() => void) | null = null;
  let errorCallback: ((error: Error, errorCode: number) => void) | null = null;

  const task: DownloadTask = {
    id: options.id,
    state: 'PENDING',
    percent: 0,
    bytesDownloaded: 0,
    totalBytes: 0,

    begin(callback) {
      beginCallback = callback;
      return task;
    },

    progress(callback) {
      progressCallback = callback;
      return task;
    },

    done(callback) {
      doneCallback = callback;
      return task;
    },

    error(callback) {
      errorCallback = callback;
      return task;
    },

    async pause() {
      task.state = 'PAUSED';
    },

    async resume() {
      task.state = 'DOWNLOADING';
    },

    async stop() {
      abortController.abort();
      activeDownloads.delete(options.id);
      task.state = 'STOPPED';
    },
  };

  // Start the download
  (async () => {
    try {
      task.state = 'DOWNLOADING';
      const response = await fetch(options.url, {
        headers: options.headers,
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentLength = Number(response.headers.get('content-length')) || 0;
      task.totalBytes = contentLength;
      beginCallback?.(contentLength);

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const chunks: Uint8Array[] = [];
      let bytesDownloaded = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        if (value) {
          chunks.push(value);
          bytesDownloaded += value.length;
          task.bytesDownloaded = bytesDownloaded;
          task.percent = contentLength > 0 ? (bytesDownloaded / contentLength) * 100 : 0;
          progressCallback?.(task.percent, bytesDownloaded, contentLength);
        }
      }

      // Store the file in IndexedDB
      const blob = new Blob(chunks);
      await storeFile(options.destination, blob);

      task.state = 'DONE';
      activeDownloads.delete(options.id);
      doneCallback?.();
    } catch (error) {
      if (abortController.signal.aborted) {
        return;
      }
      task.state = 'FAILED';
      activeDownloads.delete(options.id);
      errorCallback?.(error as Error, -1);
    }
  })();

  return task;
}

async function storeFile(path: string, blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('nuvio-downloads', 1);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'path' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      store.put({ path, blob, timestamp: Date.now() });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

export function checkForExistingDownloads(): Promise<DownloadTask[]> {
  return Promise.resolve([]);
}

export function setHeaders(_headers: Record<string, string>): void {
  // No-op - headers are passed per-download
}

export const Network = {
  WIFI_ONLY: 'WIFI_ONLY',
  ALL: 'ALL',
} as const;

export const Priority = {
  HIGH: 'HIGH',
  NORMAL: 'NORMAL',
  LOW: 'LOW',
} as const;

export function directories(): { documents: string } {
  return { documents: 'file:///nuvio/downloads/' };
}

export function completeHandler(_id: string): void {
  // No-op on web
}

export default {
  download,
  checkForExistingDownloads,
  setHeaders,
  Network,
  Priority,
  directories,
  completeHandler,
};
