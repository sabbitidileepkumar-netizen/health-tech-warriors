// Offline-first sync queue for CareLink
// Queues writes made while offline and syncs them to Firestore when back online.

import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getLocal, saveLocal } from './dataStore';

const QUEUE_KEY = 'carelink_pending_sync';

function getQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

// Use this instead of calling addDoc directly from any form that must work offline.
export async function saveWithOfflineSupport(collectionName, data, localListKey) {
  const tempId = 'pending_' + Date.now();
  const optimisticRecord = { id: tempId, ...data, _pendingSync: true };

  // Show it in the UI immediately, online or not
  const currentList = getLocal(localListKey);
  saveLocal(localListKey, [optimisticRecord, ...currentList]);

  if (!navigator.onLine) {
    queueForLater(collectionName, data, tempId, localListKey);
    return optimisticRecord;
  }

  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    replaceOptimisticRecord(localListKey, tempId, { id: docRef.id, ...data });
    return { id: docRef.id, ...data };
  } catch (err) {
    console.warn('Write failed, queueing for later sync:', err.message);
    queueForLater(collectionName, data, tempId, localListKey);
    return optimisticRecord;
  }
}

function queueForLater(collectionName, data, tempId, localListKey) {
  const queue = getQueue();
  queue.push({ collectionName, data, tempId, localListKey, queuedAt: Date.now() });
  saveQueue(queue);
}

function replaceOptimisticRecord(localListKey, tempId, realRecord) {
  const list = getLocal(localListKey);
  const updated = list.map(item => item.id === tempId ? { ...realRecord, _pendingSync: false } : item);
  saveLocal(localListKey, updated);
}

// Call this once when the app starts — it retries the queue automatically
// whenever the device reconnects to the internet.
export function initSyncListener() {
  window.addEventListener('online', syncPendingQueue);
  if (navigator.onLine) {
    syncPendingQueue();
  }
}

export async function syncPendingQueue() {
  const queue = getQueue();
  if (queue.length === 0) return;

  const remaining = [];
  for (const item of queue) {
    try {
      const docRef = await addDoc(collection(db, item.collectionName), {
        ...item.data,
        createdAt: serverTimestamp()
      });
      replaceOptimisticRecord(item.localListKey, item.tempId, { id: docRef.id, ...item.data });
    } catch (err) {
      console.warn('Still cannot sync, will retry later:', err.message);
      remaining.push(item);
    }
  }
  saveQueue(remaining);
}

export function getPendingCount() {
  return getQueue().length;
  }
