import { AbstractEntity } from '@/entities/abstract.entity';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';

export interface Client extends AbstractEntity {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  budget?: number;
  notes?: string;
  paidValue?: number;
  installments?: Installment[];
}

export interface Installment {
  dueDate: string;
  value: number;
  status: 'paga' | 'pendente' | 'atrasada';
}

export type ClientDTO = Omit<Client, 'id' | keyof AbstractEntity>;

/**
 * Adiciona um novo cliente ao subcoleção 'clients' de um usuário específico.
 * @param {string} userId - O ID do usuário logado.
 * @param {ClientDTO} clientData - Os dados do cliente a serem salvos.
 * @returns {Promise<string>} O ID do novo documento de cliente.
 */
export const addClient = async (userId: string, clientData : ClientDTO) => {
  if (!userId) {
    throw new Error('ID do usuário é necessário para adicionar um cliente.');
  }
  try {
    const clientsCollectionRef = collection(db, `users/${userId}/clients`);
    const docRef = await addDoc(clientsCollectionRef, {
      ...clientData,
      idCreateUser: userId,
      idUpdateUser: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Cliente adicionado com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error);
    throw new Error('Não foi possível adicionar o cliente.');
  }
};

/**
 * Busca todos os clientes de um usuário específico.
 * @param {string} userId - O ID do usuário logado.
 * @returns {Promise<Array<object>>} Uma lista de clientes.
 */
export const getClients = async (userId: string) => {
  if (!userId) {
    throw new Error('ID do usuário é necessário para buscar os clientes.');
  }
  try {
    const clientsCollectionRef = collection(db, `users/${userId}/clients`);
    const q = query(clientsCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const clients: Client[] = [];
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() } as Client);
    });
    
    return clients;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw new Error('Não foi possível buscar os clientes.');
  }
};

/**
 * Atualiza um cliente específico.
 * @param {string} userId - O ID do usuário logado.
 * @param {string} clientId - O ID do cliente a ser atualizado.
 * @param {object} clientData - Os novos dados do cliente.
 */
export const updateClient = async (userId: string, clientId: string, clientData: ClientDTO) => {
  if (!userId || !clientId) {
    throw new Error('IDs do usuário e do cliente são necessários.');
  }
  try {
    const clientDocRef = doc(db, `users/${userId}/clients`, clientId);
    await updateDoc(clientDocRef, {
      ...clientData,
      updatedAt: serverTimestamp(),
      idUpdateUser: userId
    });
    console.log('Cliente atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw new Error('Não foi possível atualizar o cliente.');
  }
};

/**
 * Exclui um cliente específico.
 * @param {string} userId - O ID do usuário logado.
 * @param {string} clientId - O ID do cliente a ser excluído.
 */
export const deleteClient = async (userId: string, clientId: string) => {
  if (!userId || !clientId) {
    throw new Error('IDs do usuário e do cliente são necessários.');
  }
  try {
    const clientDocRef = doc(db, `users/${userId}/clients`, clientId);
    await deleteDoc(clientDocRef);
    console.log('Cliente excluído com sucesso!');
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    throw new Error('Não foi possível excluir o cliente.');
  }
};

