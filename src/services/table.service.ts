import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { AbstractEntity } from '../entities/abstract.entity';

export interface Table extends AbstractEntity {
  id: string;
  name: string;
  capacity: number;
  order?: number;
}

export type NewTable = Omit<Table, 'id'>;
export type CreateTableDTO = Omit<Table, 'id' | keyof AbstractEntity>;

export const addTable = async (userId: string, eventId: string, tableData: CreateTableDTO): Promise<string> => {
  if (!userId || !eventId) throw new Error('User ID and Event ID are required');
  const tablesCollectionRef = collection(db, `users/${userId}/events/${eventId}/tables`);
  const docRef = await addDoc(tablesCollectionRef, {
    ...tableData,
    idCreateUser: userId,
    idUpdateUser: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getTables = async (userId: string, eventId: string): Promise<Table[]> => {
  if (!userId || !eventId) throw new Error('User ID and Event ID are required');
  const tablesCollectionRef = collection(db, `users/${userId}/events/${eventId}/tables`);
  const q = query(tablesCollectionRef, orderBy('createdAt', 'asc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Table));
};

export const updateTable = async (userId: string, eventId: string, tableId: string, tableData: Partial<NewTable>): Promise<void> => {
  if (!userId || !eventId || !tableId) throw new Error('User, Event, and Table IDs are required');
  const tableDocRef = doc(db, `users/${userId}/events/${eventId}/tables`, tableId);
  await updateDoc(tableDocRef, {
    ...tableData,
    idUpdateUser: userId,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTable = async (userId: string, eventId: string, tableId: string): Promise<void> => {
  if (!userId || !eventId || !tableId) throw new Error('User, Event, and Table IDs are required');
  const tableDocRef = doc(db, `users/${userId}/events/${eventId}/tables`, tableId);
  await deleteDoc(tableDocRef);
};
