import { db } from '@/lib/firebase';
import { AbstractEntity } from '../entities/abstract.entity';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, serverTimestamp, orderBy, writeBatch } from 'firebase/firestore';

export interface ChecklistItem extends AbstractEntity {
  id: string;
  eventId: string;
  title: string;
  period: number;
  completed: boolean;
}

export type CreateChecklistItemDTO = Omit<ChecklistItem, 'id' | keyof AbstractEntity>;

/**
 * Adiciona um novo item de checklist ao Firestore para um usuário específico.
 * @param {string} userId - O ID do usuário.
 * @param {Omit<ChecklistItem, 'id'>} item - O item de checklist a ser adicionado.
 * @returns {Promise<string>} O ID do novo documento.
 */
export const addChecklistItem = async (userId: string, item: CreateChecklistItemDTO): Promise<string> => {
  if (!userId) throw new Error('User ID is required');
  try {
    const checklistsCollectionRef = collection(db, `users/${userId}/checklists`);
    const docRef = await addDoc(checklistsCollectionRef, {
      ...item,
      idCreateUser: userId,
      idUpdateUser: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar item de checklist:', error);
    throw new Error('Não foi possível adicionar o item de checklist.');
  }
};

/**
 * Busca todos os itens de checklist de um evento específico para um usuário.
 * @param {string} userId - O ID do usuário.
 * @param {string} eventId - O ID do evento.
 * @returns {Promise<ChecklistItem[]>} Uma lista de itens de checklist.
 */
export const getChecklistsByEvent = async (userId: string, eventId: string): Promise<ChecklistItem[]> => {
  if (!userId) throw new Error('User ID is required');
  try {
    const checklistsCollectionRef = collection(db, `users/${userId}/checklists`);
    const q = query(checklistsCollectionRef, where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);
    const checklists: ChecklistItem[] = [];
    querySnapshot.forEach((doc) => {
      checklists.push({ id: doc.id, ...doc.data() } as ChecklistItem);
    });
    return checklists;
  } catch (error) {
    console.error('Erro ao buscar itens de checklist:', error);
    throw new Error('Não foi possível buscar os itens de checklist.');
  }
};

/**
 * Atualiza o status de um item de checklist para um usuário.
 * @param {string} userId - O ID do usuário.
 * @param {string} itemId - O ID do item de checklist a ser atualizado.
 * @param {boolean} completed - O novo status de conclusão.
 */
export const updateChecklistItemStatus = async (userId: string, itemId: string, completed: boolean): Promise<void> => {
  if (!userId) throw new Error('User ID is required');
  try {
    const itemDocRef = doc(db, `users/${userId}/checklists`, itemId);
    await updateDoc(itemDocRef, { 
      completed,
      idUpdateUser: userId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao atualizar status do item de checklist:', error);
    throw new Error('Não foi possível atualizar o status do item de checklist.');
  }
};

export const deleteChecklistItem = async (userId: string, itemId: string): Promise<void> => {
  if (!userId) throw new Error('User ID is required');
  try {
    const itemDocRef = doc(db, `users/${userId}/checklists`, itemId);
    await deleteDoc(itemDocRef);
  } catch (error) {
    console.error('Erro ao deletar item de checklist:', error);
    throw new Error('Não foi possível deletar o item de checklist.');
  }
};

// ==================== Templates de Checklist ====================

export interface ChecklistTemplate extends AbstractEntity {
  id: string;
  name: string;
  position: number;
  description: string;
  items: Array<{ title: string; period: number; completed: false }>;
}

export type CreateChecklistTemplateDTO = Omit<ChecklistTemplate, 'id' | keyof AbstractEntity>;

export const addTemplate = async (userId: string, template: CreateChecklistTemplateDTO): Promise<string> => {
  if (!userId) throw new Error('User ID is required');
  try {
    const templatesRef = collection(db, `users/${userId}/checklistTemplates`);
    const docRef = await addDoc(templatesRef, {
      ...template,
      idCreateUser: userId,
      idUpdateUser: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar template de checklist:', error);
    throw new Error('Não foi possível adicionar o template.');
  }
};

export const getTemplates = async (userId: string): Promise<ChecklistTemplate[]> => {
  if (!userId) throw new Error('User ID is required');
  try {
    const templatesRef = collection(db, `users/${userId}/checklistTemplates`);
    const q = query(templatesRef, orderBy('position', 'asc'));
    const querySnapshot = await getDocs(q);
    const templates: ChecklistTemplate[] = [];
    querySnapshot.forEach((doc) => {
      templates.push({ id: doc.id, ...doc.data() } as ChecklistTemplate);
    });
    return templates;
  } catch (error) {
    console.error('Erro ao buscar templates de checklist:', error);
    throw new Error('Não foi possível buscar os templates.');
  }
};

export const deleteTemplate = async (userId: string, templateId: string): Promise<void> => {
  if (!userId) throw new Error('User ID is required');
  try {
    const templateDocRef = doc(db, `users/${userId}/checklistTemplates`, templateId);
    await deleteDoc(templateDocRef);
  } catch (error) {
    console.error('Erro ao deletar template de checklist:', error);
    throw new Error('Não foi possível deletar o template.');
  }
};

export const deleteAllChecklistsByEvent = async (userId: string, eventId: string): Promise<void> => {
  if (!userId) throw new Error('User ID is required');
  try {
    const checklistsRef = collection(db, `users/${userId}/checklists`);
    const q = query(checklistsRef, where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error('Erro ao deletar todos os itens de checklist:', error);
    throw new Error('Não foi possível deletar os itens de checklist.');
  }
};
