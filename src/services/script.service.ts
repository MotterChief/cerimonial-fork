import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch, orderBy, serverTimestamp } from 'firebase/firestore';
import { AbstractEntity } from '../entities/abstract.entity';

export interface Roteiro extends AbstractEntity {
    id: string;
    eventId: string;
    name: string;
}

export interface RoteiroItem extends AbstractEntity {
    id: string;
    roteiroId: string;
    time: string;
    description: string;
    Observations: Observation[];
    isNextDay?: boolean;
}

export type RoteiroItemData = {
    roteiroId: string;
    time: string;
    description: string;
    Observations: Observation[];
    isNextDay: boolean;
};

export interface Observation {
    key: string;
    value: string;
}

export type roteiroData = {
    eventId: string;
    name: string;
};

/**
 * Cria um novo documento de roteiro na coleção roteiros do Firestore para um usuário específico.
 * @param {string} userId - O ID do usuário.
 * @param {roteiroData} roteiroData - Os dados de um novo roteiro (sem o ID).
 * @returns O id do documento recém-criado.
 */
export const createRoteiro = async (userId: string, roteiroData: roteiroData): Promise<string> => {
    if (!userId) throw new Error('User ID is required');
    try {
        const roteirosCollectionRef = collection(db, `users/${userId}/scripts`);
        const docRef = await addDoc(roteirosCollectionRef, {
            ...roteiroData,
            idCreateUser: userId,
            idUpdateUser: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Erro ao criar roteiro:', error);
        throw new Error('Não foi possível criar o roteiro.');
    }
};

/**
 * Lê (busca) todos os roteiros associados a um evento específico para um usuário.
 * @param {string} userId - O ID do usuário.
 * @param {string} eventId - O ID do evento.
 * @returns Uma lista (array) de Roteiro.
 */
export const getRoteirosByEvent = async (userId: string, eventId: string): Promise<Roteiro[]> => {
    if (!userId) throw new Error('User ID is required');
    try {
        const roteirosCollectionRef = collection(db, `users/${userId}/scripts`);
        const q = query(roteirosCollectionRef, where("eventId", "==", eventId), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        const roteiros: Roteiro[] = [];
        querySnapshot.forEach((doc) => {
            roteiros.push({ id: doc.id, ...doc.data() } as Roteiro);
        });
        return roteiros;
    } catch (error) {
        console.error('Erro ao buscar roteiros:', error);
        throw new Error('Não foi possível buscar os roteiros.');
    }
};

/**
 * Atualiza as informações de um roteiro existente para um usuário.
 * @param {string} userId - O ID do usuário.
 * @param {string} roteiroId - O ID do roteiro a ser atualizado.
 * @param updates - Um objeto com os novos dados.
 */
export const updateRoteiro = async (userId: string, roteiroId: string, updates: { name: string }): Promise<void> => {
    if (!userId) throw new Error('User ID is required');
    try {
        const roteiroRef = doc(db, `users/${userId}/scripts`, roteiroId);
        await updateDoc(roteiroRef, {
            ...updates,
            idUpdateUser: userId,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Erro ao atualizar roteiro:', error);
        throw new Error('Não foi possível atualizar o roteiro.');
    }
};

/**
 * Exclui um roteiro e todos os seus itens associados para um usuário.
 * @param {string} userId - O ID do usuário.
 * @param {string} roteiroId - O ID do roteiro a ser excluído.
 */
export const deleteRoteiroAndItsItems = async (userId: string, roteiroId: string): Promise<void> => {
    if (!userId) throw new Error('User ID is required');
    try {
        const itemsQuery = query(collection(db, `users/${userId}/scriptItems`), where("roteiroId", "==", roteiroId));
        const itemsSnapshot = await getDocs(itemsQuery);
        
        const batch = writeBatch(db);

        itemsSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        const roteiroRef = doc(db, `users/${userId}/scripts`, roteiroId);
        batch.delete(roteiroRef);

        await batch.commit();
    } catch (error) {
        console.error('Erro ao excluir roteiro e seus itens:', error);
        throw new Error('Não foi possível excluir o roteiro e seus itens.');
    }
};

/**
 * Adiciona um novo item a um roteiro.
 * @param {string} userId - O ID do usuário.
 * @param {RoteiroItemData} itemData - O item de roteiro a ser adicionado.
 * @returns {Promise<string>} O ID do novo item.
 */
export const addRoteiroItem = async (userId: string, itemData: RoteiroItemData): Promise<string> => {
    if (!userId) throw new Error('User ID is required');
    try {
        const roteiroItemsCollectionRef = collection(db, `users/${userId}/scriptItems`);
        const docRef = await addDoc(roteiroItemsCollectionRef, {
            ...itemData,
            idCreateUser: userId,
            idUpdateUser: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Erro ao adicionar item de roteiro:', error);
        throw new Error('Não foi possível adicionar o item de roteiro.');
    }
};

/**
 * Busca todos os itens de um roteiro específico, ordenados por dia e hora.
 * @param {string} userId - O ID do usuário.
 * @param {string} roteiroId - O ID do roteiro.
 * @returns {Promise<RoteiroItem[]>} Uma lista de itens de roteiro.
 */
export const getRoteiroItems = async (userId: string, roteiroId: string): Promise<RoteiroItem[]> => {
    if (!userId) throw new Error('User ID is required');
    try {
        const roteiroItemsCollectionRef = collection(db, `users/${userId}/scriptItems`);
        const q = query(roteiroItemsCollectionRef, 
            where("roteiroId", "==", roteiroId),
            orderBy("isNextDay", "asc"),
            orderBy("time", "asc"));
        const items: RoteiroItem[] = [];
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as RoteiroItem);
        });
        return items;
    } catch (error) {
        console.error('Erro ao buscar itens de roteiro:', error);
        throw new Error('Não foi possível buscar os itens de roteiro.');
    }
};

/**
 * Atualiza um item de roteiro existente.
 * @param {string} userId - O ID do usuário.
 * @param {string} itemId - O ID do item a ser atualizado.
 * @param {Partial<RoteiroItem>} updates - Os campos a serem atualizados.
 * @returns {Promise<void>}
 */
export const updateRoteiroItem = async (userId: string, itemId: string, updates: Partial<RoteiroItem>): Promise<void> => {
    if (!userId) throw new Error('User ID is required');
    try {
        const itemDocRef = doc(db, `users/${userId}/scriptItems`, itemId);
        await updateDoc(itemDocRef, {
            ...updates,
            idUpdateUser: userId,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Erro ao atualizar item de roteiro:', error);
        throw new Error('Não foi possível atualizar o item de roteiro.');
    }
};

/**
 * Exclui um único item de um roteiro.
 * @param {string} userId - O ID do usuário.
 * @param {string} itemId - O ID do item a ser excluído.
 * @returns {Promise<void>}
 */
export const deleteRoteiroItem = async (userId: string, itemId: string): Promise<void> => {
    if (!userId) throw new Error('User ID is required');
    try {
        const itemDocRef = doc(db, `users/${userId}/scriptItems`, itemId);
        await deleteDoc(itemDocRef);
    } catch (error) {
        console.error('Erro ao deletar item de roteiro:', error);
        throw new Error('Não foi possível deletar o item de roteiro.');
    }
};
