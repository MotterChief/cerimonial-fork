import { AbstractEntity } from '@/entities/abstract.entity';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';

export interface Document extends AbstractEntity {
  id: string;
  name: string;
  type: string;
  value: string;
  date: string;
  term: string;
  situation: string;
  notes?: string;
  event: string;
}

export type DocumentDTO = Omit<Document, 'id' | keyof AbstractEntity>;

/**
 * Adiciona um novo documento ao subcoleção 'documents' de um usuário específico.
 * @param {string} userId - O ID do usuário logado.
 * @param {object} documentData - Os dados do documento a serem salvos.
 * @returns {Promise<string>} O ID do novo documento.
 */
export const addDocument = async (userId: string, documentData: DocumentDTO) => {
  if (!userId) {
    throw new Error('ID do usuário é necessário para adicionar um documento.');
  }
  try {
    console.log('Dados do documento a serem adicionados:', documentData);
    const documentsCollectionRef = collection(db, `users/${userId}/documents`);
    const docRef = await addDoc(documentsCollectionRef, { 
      ...documentData,
      idCreateUser: userId,
      idUpdateUser: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('Documento adicionado com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar documento:', error);
    throw new Error('Não foi possível adicionar o documento.');
  }
};

/**
 * Busca todos os documentos de um usuário específico.
 * @param {string} userId - O ID do usuário logado.
 * @returns {Promise<Array<object>>} Uma lista de documentos.
 */
export const getDocuments = async (userId: string) => {
  if (!userId) {
    throw new Error('ID do usuário é necessário para buscar os documentos.');
  }
  try {
    const documentsCollectionRef = collection(db, `users/${userId}/documents`);
    const q = query(documentsCollectionRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const documents: Document[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() } as Document);
    });
    
    return documents;
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    throw new Error('Não foi possível buscar os documentos.');
  }
};

/**
 * Atualiza um documento específico.
 * @param {string} userId - O ID do usuário logado.
 * @param {string} documentId - O ID do documento a ser atualizado.
 * @param {object} documentData - Os novos dados do documento.
 */
export const updateDocument = async (userId: string, documentId: string, documentData: DocumentDTO) => {
  if (!userId || !documentId) {
    throw new Error('IDs do usuário e do documento são necessários.');
  }
  try {
    const documentDocRef = doc(db, `users/${userId}/documents`, documentId);
    await updateDoc(documentDocRef, { 
      ...documentData,
      idUpdateUser: userId,
      updatedAt: serverTimestamp()
    });
    console.log('Documento atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    throw new Error('Não foi possível atualizar o documento.');
  }
};

/**
 * Exclui um documento específico.
 * @param {string} userId - O ID do usuário logado.
 * @param {string} documentId - O ID do documento a ser excluído.
 */
export const deleteDocument = async (userId: string, documentId: string) => {
  if (!userId || !documentId) {
    throw new Error('IDs do usuário e do documento são necessários.');
  }
  try {
    const documentDocRef = doc(db, `users/${userId}/documents`, documentId);
    await deleteDoc(documentDocRef);
    console.log('Documento excluído com sucesso!');
  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    throw new Error('Não foi possível excluir o documento.');
  }
};
