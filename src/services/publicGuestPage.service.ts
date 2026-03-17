import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Guest } from './guest.service';
import { Table } from './table.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PublicGuest {
  id: string;
  name: string;
  tableId: string | null;
}

export interface PublicTable {
  id: string;
  name: string;
}

export interface PublicGuestPage {
  eventName: string;
  userId: string;
  eventId: string;
  lastSync: Timestamp;
  guests: PublicGuest[];
  tables: PublicTable[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toPublicGuests = (guests: Guest[]): PublicGuest[] =>
  guests.map(g => ({ id: g.id, name: g.name, tableId: g.tableId ?? null }));

const toPublicTables = (tables: Table[]): PublicTable[] =>
  tables.map(t => ({ id: t.id, name: t.name }));

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Cria uma nova página pública para o evento e retorna o token UUID gerado.
 * Salva em publicGuestPages/{token} com snapshot dos convidados e mesas.
 *
 * IMPORTANTE: As Firestore Security Rules devem permitir leitura pública desta coleção:
 *   match /publicGuestPages/{token} { allow read: if true; }
 */
export const generatePublicPage = async (
  userId: string,
  eventId: string,
  eventName: string,
  guests: Guest[],
  tables: Table[],
): Promise<string> => {
  if (!userId || !eventId) throw new Error('User ID e Event ID são obrigatórios');
  const token = crypto.randomUUID();
  await setDoc(doc(db, 'publicGuestPages', token), {
    eventName,
    userId,
    eventId,
    lastSync: serverTimestamp(),
    guests: toPublicGuests(guests),
    tables: toPublicTables(tables),
  });
  return token;
};

/**
 * Atualiza o snapshot da página pública existente com os dados atuais.
 */
export const syncPublicPage = async (
  token: string,
  eventName: string,
  guests: Guest[],
  tables: Table[],
): Promise<void> => {
  if (!token) throw new Error('Token é obrigatório');
  await setDoc(
    doc(db, 'publicGuestPages', token),
    {
      eventName,
      lastSync: serverTimestamp(),
      guests: toPublicGuests(guests),
      tables: toPublicTables(tables),
    },
    { merge: true },
  );
};

/**
 * Busca a página pública pelo token. Retorna null se não existir.
 */
export const getPublicPage = async (token: string): Promise<PublicGuestPage | null> => {
  if (!token) return null;
  const snap = await getDoc(doc(db, 'publicGuestPages', token));
  if (!snap.exists()) return null;
  return snap.data() as PublicGuestPage;
};
