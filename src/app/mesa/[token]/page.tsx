'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicPage, PublicGuestPage, PublicGuest } from '@/services/publicGuestPage.service';
import styles from './page.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLastSync(ts: PublicGuestPage['lastSync'] | undefined): string {
  if (!ts) return '';
  const date = ts.toDate();
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Result card ──────────────────────────────────────────────────────────────

function GuestResultCard({ guest, tableName }: { guest: PublicGuest; tableName: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={styles.resultCard}
    >
      <p className={styles.resultGreeting}>
        Olá, <strong>{guest.name}</strong>! 👋
      </p>
      {tableName ? (
        <>
          <p className={styles.resultLabel}>Sua mesa é:</p>
          <div className={styles.tableBadge}>
            <i className={`fas fa-chair ${styles.tableBadgeIcon}`} />
            <span className={styles.tableNumber}>{tableName}</span>
          </div>
        </>
      ) : (
        <p className={styles.noTableText}>
          <i className="fas fa-clock" />
          Mesa ainda não atribuída. Consulte a recepção.
        </p>
      )}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicMesaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [page, setPage] = useState<PublicGuestPage | null>(null);
  const [status, setStatus] = useState<'loading' | 'notfound' | 'ready'>('loading');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<PublicGuest[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    getPublicPage(token)
      .then(data => {
        if (!data) {
          setStatus('notfound');
        } else {
          setPage(data);
          setStatus('ready');
        }
      })
      .catch(() => setStatus('notfound'));
  }, [token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!page || !search.trim()) return;
    const term = search.trim().toLowerCase();
    const found = page.guests.filter(g => g.name.toLowerCase().includes(term));
    setResults(found);
    setSearched(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (searched) {
      setSearched(false);
      setResults([]);
    }
  };

  const getTableName = (tableId: string | null): string | null => {
    if (!tableId || !page) return null;
    return page.tables.find(t => t.id === tableId)?.name ?? null;
  };

  // ── Render states ──────────────────────────────────────────────────────────

  if (status === 'loading') {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingBox}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2.4rem' }} />
          <p className={styles.loadingText}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className={styles.notFoundPage}>
        <div className={styles.notFoundCard}>
          <div className={styles.iconCircle}>
            <i className="fas fa-link-slash" style={{ fontSize: '1.8rem', color: '#667eea' }} />
          </div>
          <h2 className={styles.notFoundTitle}>Link não encontrado</h2>
          <p className={styles.notFoundSubtitle}>Este QR code pode ter expirado ou é inválido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <i className={`fas fa-glass-cheers ${styles.heroIcon}`} />
        <h1 className={styles.heroEventName}>{page!.eventName}</h1>
        <p className={styles.heroSubtitle}>Encontre sua mesa</p>
      </div>

      {/* Floating card */}
      <div className={styles.cardWrapper}>
        <div className={styles.card}>
          <p className={styles.cardDescription}>
            Digite seu nome para ver a mesa atribuída a você.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Digite seu nome..."
              className={styles.searchInput}
              autoFocus
              autoComplete="off"
            />
            <button type="submit" className={styles.searchButton} disabled={!search.trim()}>
              <i className="fas fa-search" style={{ marginRight: '8px' }} />
              Buscar
            </button>
          </form>

          {/* Results */}
          <AnimatePresence mode="wait">
            {searched && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={styles.resultsContainer}
              >
                {results.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.noResultText}
                  >
                    <i className="fas fa-search" style={{ marginRight: '8px' }} />
                    Nenhum convidado encontrado com esse nome.
                  </motion.p>
                ) : (
                  results.map(guest => (
                    <GuestResultCard
                      key={guest.id}
                      guest={guest}
                      tableName={getTableName(guest.tableId)}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          {page?.lastSync && (
            <p className={styles.syncInfo}>
              <i className="fas fa-sync-alt" style={{ marginRight: '6px' }} />
              Atualizado em {formatLastSync(page.lastSync)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
