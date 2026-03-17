import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, serverTimestamp, orderBy, deleteField } from 'firebase/firestore';
import { AbstractEntity } from '../entities/abstract.entity';

export type GuestStatus = 'confirmed' | 'pending' | 'declined';

export interface Guest extends AbstractEntity {
  id: string;
  name: string;
  phone: string;
  status: GuestStatus;
  adultsCount: number;
  childrenCount: number;
  tableId?: string;
}

export type NewGuest = Omit<Guest, 'id'>;
export type CreateGuestDTO = Omit<Guest, 'id' | keyof AbstractEntity>;

export const addGuest = async (userId: string, eventId: string, guestData: CreateGuestDTO): Promise<string> => {
  if (!userId || !eventId) throw new Error('User ID and Event ID are required');
  const guestsCollectionRef = collection(db, `users/${userId}/events/${eventId}/guests`);
  const docRef = await addDoc(guestsCollectionRef, {
    ...guestData,
    idCreateUser: userId,
    idUpdateUser: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getGuests = async (userId: string, eventId: string): Promise<Guest[]> => {
  if (!userId || !eventId) throw new Error('User ID and Event ID are required');
  const guestsCollectionRef = collection(db, `users/${userId}/events/${eventId}/guests`);
  const q = query(guestsCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Guest));
};

export const updateGuest = async (userId: string, eventId: string, guestId: string, guestData: Partial<NewGuest>): Promise<void> => {
  if (!userId || !eventId || !guestId) throw new Error('User, Event, and Guest IDs are required');
  const guestDocRef = doc(db, `users/${userId}/events/${eventId}/guests`, guestId);
  await updateDoc(guestDocRef, {
    ...guestData,
    idUpdateUser: userId,
    updatedAt: serverTimestamp(),
  });
};

export const deleteGuest = async (userId: string, eventId: string, guestId: string): Promise<void> => {
  if (!userId || !eventId || !guestId) throw new Error('User, Event, and Guest IDs are required');
  const guestDocRef = doc(db, `users/${userId}/events/${eventId}/guests`, guestId);
  await deleteDoc(guestDocRef);
};

export const updateGuestTable = async (userId: string, eventId: string, guestId: string, tableId: string | null): Promise<void> => {
  if (!userId || !eventId || !guestId) throw new Error('User, Event, and Guest IDs are required');
  const guestDocRef = doc(db, `users/${userId}/events/${eventId}/guests`, guestId);
  const updateData: Record<string, unknown> = {
    idUpdateUser: userId,
    updatedAt: serverTimestamp(),
  };
  updateData.tableId = tableId !== null ? tableId : deleteField();
  await updateDoc(guestDocRef, updateData);
};
