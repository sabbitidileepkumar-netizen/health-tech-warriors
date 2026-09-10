// Offline-first sync queue for CareLink
// Queues writes made while offline and syncs them to Firestore when back online.

import { db } from './firebase.js';
import { collection, addDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getLocal, saveLocal } from './dataStore.js';

const QUEUE_KEY = 'carelink_pending_sync';

let currentSyncStatus = typeof navigator !== 'undefined' && navigator.onLine ? 'SYNCED' : 'OFFLINE';
const statusListeners = new Set();

function notifyStatus() {
  const pending = getPendingCount();
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    currentSyncStatus = 'OFFLINE';
  } else if (pending > 0 && currentSyncStatus !== 'SYNC_FAILED') {
    currentSyncStatus = 'SYNCING';
  } else if (pending === 0) {
    currentSyncStatus = 'SYNCED';
  }
  statusListeners.forEach((fn) => fn(currentSyncStatus, pending));
}

export function subscribeSyncStatus(callback) {
  statusListeners.add(callback);
  callback(currentSyncStatus, getPendingCount());
  return () => statusListeners.delete(callback);
}

export function getSyncStatus() {
  return { status: currentSyncStatus, pendingCount: getPendingCount() };
}

function getQueue() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(QUEUE_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch (_e) {
    return [];
  }
}

function saveQueue(queue) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }
  notifyStatus();
}

// Use this instead of calling addDoc directly from any form that must work offline.
export async function saveWithOfflineSupport(collectionName, data, localListKey) {
  const tempId = 'pending_' + Date.now();
  const optimisticRecord = { id: tempId, ...data, _pendingSync: true };

  // Show it in the UI immediately, online or not
  const currentList = getLocal(localListKey);
  saveLocal(localListKey, [optimisticRecord, ...currentList]);

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    queueForLater(collectionName, data, tempId, localListKey);
    return optimisticRecord;
  }

  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    replaceOptimisticRecord(localListKey, tempId, { id: docRef.id, ...data });
    notifyStatus();
    return { id: docRef.id, ...data };
  } catch (err) {
    console.warn('Write failed, queueing for later sync:', err.message);
    queueForLater(collectionName, data, tempId, localListKey);
    return optimisticRecord;
  }
}

function queueForLater(collectionName, data, tempId, localListKey) {
  const queue = getQueue();
  queue.push({ operation: 'create', collectionName, data, tempId, localListKey, queuedAt: Date.now() });
  saveQueue(queue);
}

function replaceOptimisticRecord(localListKey, tempId, realRecord) {
  const list = getLocal(localListKey);
  const updated = list.map((item) => (item.id === tempId ? { ...realRecord, _pendingSync: false } : item));
  saveLocal(localListKey, updated);
}

// Updates are also stored locally first. If the record itself is still waiting
// to be created, merge the update into that queued create instead of losing it.
export async function updateWithOfflineSupport(collectionName, recordId, updates, localListKey) {
  const now = new Date().toISOString();
  const nextUpdates = { ...updates, updatedAt: now };
  const currentList = getLocal(localListKey);
  saveLocal(
    localListKey,
    currentList.map((item) => (item.id === recordId ? { ...item, ...nextUpdates, _pendingSync: !navigator.onLine } : item))
  );

  const queue = getQueue();
  const queuedCreate = queue.find((item) => item.operation !== 'update' && item.tempId === recordId);
  if (queuedCreate) {
    queuedCreate.data = { ...queuedCreate.data, ...nextUpdates };
    saveQueue(queue);
    return;
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    queue.push({ operation: 'update', collectionName, recordId, data: nextUpdates, localListKey, queuedAt: Date.now() });
    saveQueue(queue);
    return;
  }

  try {
    await updateDoc(doc(db, collectionName, recordId), nextUpdates);
    notifyStatus();
  } catch (err) {
    console.warn('Update failed, queueing for later sync:', err.message);
    queue.push({ operation: 'update', collectionName, recordId, data: nextUpdates, localListKey, queuedAt: Date.now() });
    saveQueue(queue);
  }
}

// Retries the queue automatically whenever the device reconnects
export function initSyncListener() {
  if (typeof window === 'undefined') return;
  window.addEventListener('online', () => {
    notifyStatus();
    syncPendingQueue();
  });
  window.addEventListener('offline', () => {
    notifyStatus();
  });
  if (navigator.onLine) {
    syncPendingQueue();
  }
}

export async function syncPendingQueue() {
  const queue = getQueue();
  if (queue.length === 0) {
    notifyStatus();
    return;
  }

  currentSyncStatus = 'SYNCING';
  notifyStatus();

  const remaining = [];
  let hadFailure = false;

  for (const item of queue) {
    try {
      if (item.operation === 'update') {
        await updateDoc(doc(db, item.collectionName, item.recordId), item.data);
        const list = getLocal(item.localListKey);
        saveLocal(item.localListKey, list.map((record) => (
          record.id === item.recordId ? { ...record, ...item.data, _pendingSync: false } : record
        )));
      } else {
        const docRef = await addDoc(collection(db, item.collectionName), {
          ...item.data,
          createdAt: serverTimestamp()
        });
        replaceOptimisticRecord(item.localListKey, item.tempId, { id: docRef.id, ...item.data });
      }
    } catch (err) {
      console.warn('Still cannot sync, will retry later:', err.message);
      remaining.push(item);
      hadFailure = true;
    }
  }

  saveQueue(remaining);
  currentSyncStatus = hadFailure ? 'SYNC_FAILED' : 'SYNCED';
  notifyStatus();
}

export function getPendingCount() {
  return getQueue().length;
}
