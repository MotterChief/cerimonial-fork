
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AbstractEntity } from "../entities/abstract.entity";

export interface StaffMember extends AbstractEntity{
  id: string;
  name: string;
  phone: string;
}

export type CreateStaffMemberDTO = Omit<StaffMember, "id" | keyof AbstractEntity>;

// Note: The collection is now a subcollection under a specific user.
// We will get the collection reference dynamically inside each function.

export const createStaffMember = async (
  userId: string,
  data: CreateStaffMemberDTO
): Promise<string> => {
  const staffCollection = collection(db, "users", userId, "staff");
  const docRef = await addDoc(staffCollection, {
    ...data,
    idCreateUser: userId,
    idUpdateUser: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getAllStaffMembers = async (userId: string): Promise<StaffMember[]> => {
  const staffCollection = collection(db, "users", userId, "staff");
  const q = query(staffCollection, orderBy("name"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as StaffMember)
  );
};

export const updateStaffMember = async (
  userId: string,
  staffMemberId: string,
  data: Partial<Omit<StaffMember, "id">>
): Promise<void> => {
  const docRef = doc(db, "users", userId, "staff", staffMemberId);
  await updateDoc(docRef, {
    ...data,
    idUpdateUser: userId,
    updatedAt: serverTimestamp(),
  });
};

export const deleteStaffMember = async (userId: string, staffMemberId: string): Promise<void> => {
  const docRef = doc(db, "users", userId, "staff", staffMemberId);
  await deleteDoc(docRef);
};
