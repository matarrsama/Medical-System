import { db } from './firebase'
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc,
  query, where, orderBy, getDocs, Timestamp, serverTimestamp,
} from 'firebase/firestore'
import type { DocumentData, WhereFilterOp, OrderByDirection } from 'firebase/firestore'

export async function getDocument<T = DocumentData>(collectionName: string, docId: string): Promise<T | null> {
  const snap = await getDoc(doc(db, collectionName, docId))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null
}

export async function setDocument(collectionName: string, docId: string, data: DocumentData) {
  await setDoc(doc(db, collectionName, docId), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export async function updateDocument(collectionName: string, docId: string, data: Partial<DocumentData>) {
  await updateDoc(doc(db, collectionName, docId), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteDocument(collectionName: string, docId: string) {
  await deleteDoc(doc(db, collectionName, docId))
}

export async function addDocument(collectionName: string, data: DocumentData) {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function queryDocuments<T = DocumentData>(
  collectionName: string,
  conditions: { field: string; op: WhereFilterOp; value: unknown }[] = [],
  orderByField?: string,
  orderDirection?: OrderByDirection,
): Promise<T[]> {
  let q = collection(db, collectionName) as ReturnType<typeof query>
  const constraints: Parameters<typeof query>[1][] = []

  for (const c of conditions) {
    constraints.push(where(c.field, c.op, c.value))
  }
  if (orderByField) {
    constraints.push(orderBy(orderByField, orderDirection || 'asc'))
  }

  const querySnapshot = await getQuerySnapshot(query(q, ...constraints))
  return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() as Record<string, unknown> }) as T)
}

async function getQuerySnapshot(q: ReturnType<typeof query>) {
  return getDocs(q)
}

export { Timestamp, serverTimestamp }
