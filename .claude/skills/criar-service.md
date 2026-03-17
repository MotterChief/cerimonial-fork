---
name: criar-service
description: Cria um novo Firestore service seguindo o padrao do projeto (entity + DTO + CRUD)
user_invocable: true
---

# Skill: Criar Service

Use esta skill ao criar um novo service em `src/services/`.

## Checklist

1. Crie o arquivo `src/services/[nome].service.ts`
2. Siga este template exato:

```typescript
import { AbstractEntity } from '@/entities/abstract.entity';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';

// Interface da entidade
export interface NomeEntidade extends AbstractEntity {
  id: string;
  // campos especificos aqui
}

// DTO para criacao - omite id e campos do AbstractEntity
export type NomeEntidadeDTO = Omit<NomeEntidade, 'id' | keyof AbstractEntity>;

// CREATE
export const addNomeEntidade = async (userId: string, data: NomeEntidadeDTO): Promise<string> => {
  if (!userId) throw new Error('ID do usuario e necessario.');
  const collectionRef = collection(db, `users/${userId}/nomeColecao`);
  const docRef = await addDoc(collectionRef, {
    ...data,
    idCreateUser: userId,
    idUpdateUser: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// READ
export const getNomeEntidades = async (userId: string): Promise<NomeEntidade[]> => {
  if (!userId) throw new Error('ID do usuario e necessario.');
  const collectionRef = collection(db, `users/${userId}/nomeColecao`);
  const q = query(collectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as NomeEntidade));
};

// UPDATE
export const updateNomeEntidade = async (userId: string, itemId: string, data: Partial<NomeEntidadeDTO>): Promise<void> => {
  if (!userId || !itemId) throw new Error('IDs do usuario e do item sao necessarios.');
  const docRef = doc(db, `users/${userId}/nomeColecao`, itemId);
  await updateDoc(docRef, {
    ...data,
    idUpdateUser: userId,
    updatedAt: serverTimestamp(),
  });
};

// DELETE
export const deleteNomeEntidade = async (userId: string, itemId: string): Promise<void> => {
  if (!userId || !itemId) throw new Error('IDs do usuario e do item sao necessarios.');
  const docRef = doc(db, `users/${userId}/nomeColecao`, itemId);
  await deleteDoc(docRef);
};
```

## Regras

- Nome do arquivo: `[entidade].service.ts` (singular, lowercase)
- Path Firestore: `users/{userId}/[colecao]` (plural, camelCase)
- Se for subcollection de evento: `users/{userId}/events/{eventId}/[colecao]` — adicionar `eventId` como segundo param
- Sempre exportar a interface e o DTO
- orderBy padrao: `'createdAt', 'desc'` — mudar se fizer sentido (ex: date, order)
- Nomes de funcoes: `add[Entidade]`, `get[Entidades]`, `update[Entidade]`, `delete[Entidade]`
