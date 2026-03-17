import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { AbstractEntity } from '../entities/abstract.entity';

// Interface para tipagem do Fornecedor
export interface Supplier extends AbstractEntity {
  id: string;
  name: string;
  category?: string;
  phone?: string;
  email?: string;
  rating?: string;
  notes?: string;
}

// Tipo para criação, omitindo o id que é gerado pelo Firestore
export type NewSupplier = Omit<Supplier, 'id'>;
export type NewSupplierDTO = Omit<Supplier, 'id' | keyof AbstractEntity>;

export const addSupplier = async (userId: string, supplierData: NewSupplierDTO): Promise<string> => {
  if (!userId) throw new Error('User ID is required');
  const suppliersCollectionRef = collection(db, `users/${userId}/suppliers`);
  const docRef = await addDoc(suppliersCollectionRef, {
    ...supplierData,
    idCreateUser: userId,
    idUpdateUser: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getSuppliers = async (userId: string): Promise<Supplier[]> => {
  if (!userId) throw new Error('User ID is required');
  const suppliersCollectionRef = collection(db, `users/${userId}/suppliers`);
  const q = query(suppliersCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Supplier));
};

export const updateSupplier = async (userId: string, supplierId: string, supplierData: Partial<NewSupplier>): Promise<void> => {
  if (!userId || !supplierId) throw new Error('User and Supplier ID are required');
  const supplierDocRef = doc(db, `users/${userId}/suppliers`, supplierId);
  await updateDoc(supplierDocRef, {
    ...supplierData,
    idUpdateUser: userId,
    updatedAt: serverTimestamp(),
  });
};

export const deleteSupplier = async (userId: string, supplierId: string): Promise<void> => {
  if (!userId || !supplierId) throw new Error('User and Supplier ID are required');
  const supplierDocRef = doc(db, `users/${userId}/suppliers`, supplierId);
  await deleteDoc(supplierDocRef);
};
