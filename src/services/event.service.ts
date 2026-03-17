import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, doc, updateDoc,  serverTimestamp, orderBy } from 'firebase/firestore';
import { AbstractEntity } from '../entities/abstract.entity';

export interface Event extends AbstractEntity {
  id: string;
  eventName: string;
  eventDate: string;
  location: string;
  clientId: string;
  status: string;
  publicToken?: string;
}

export type NewEvent = Omit<Event, 'id'>;
export type CreateEventDTO = Omit<Event, 'id' | keyof AbstractEntity>;

export const addEvent = async (userId: string, eventData: CreateEventDTO): Promise<string> => {
  if (!userId) throw new Error('User ID is required');
  const eventsCollectionRef = collection(db, `users/${userId}/events`);
  const docRef = await addDoc(eventsCollectionRef, {
    ...eventData,
    idCreateUser: userId,
    idUpdateUser: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getEvents = async (userId: string): Promise<Event[]> => {
  if (!userId) throw new Error('User ID is required');
  const eventsCollectionRef = collection(db, `users/${userId}/events`);
  const q = query(eventsCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Event));
};

export const updateEvent = async (userId: string, eventId: string, eventData: Partial<NewEvent>): Promise<void> => {
  if (!userId || !eventId) throw new Error('User and Event ID are required');
  const eventDocRef = doc(db, `users/${userId}/events`, eventId);
  await updateDoc(eventDocRef, {
    ...eventData,
    idUpdateUser: userId,
    updatedAt: serverTimestamp()
  });
};
