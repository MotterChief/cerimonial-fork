'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
  useDraggable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MultiValue } from 'react-select';
import { Guest, GuestStatus } from '@/services/guest.service';
import { Table } from '@/services/table.service';
import { useNotification } from '@/context/NotificationContext';
import Modal from '@/components/Modal';
import MultiSelect from '@/components/MultiSelect';
import CustomSelect from '@/components/Select';

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<GuestStatus, string> = {
  confirmed: 'Confirmado',
  pending: 'Aguardando',
  declined: 'Não Comparecerá',
};

const STATUS_STYLE: Record<GuestStatus, React.CSSProperties> = {
  confirmed: { backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' },
  pending: { backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' },
  declined: { backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error-text)' },
};

const STATUS_DOT_COLOR: Record<GuestStatus, string> = {
  confirmed: 'var(--notification-success)',
  pending: 'var(--notification-warning)',
  declined: 'var(--notification-error)',
};

const guestPeople = (g: Guest) => g.adultsCount + g.childrenCount;

// ─── Draggable Guest Card ────────────────────────────────────────────────────

interface GuestCardProps {
  guest: Guest;
  isOverlay?: boolean;
}

const GuestCard = ({ guest, isOverlay }: GuestCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
  });

  const cardStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-secondary)',
    borderLeft: `3px solid ${STATUS_DOT_COLOR[guest.status]}`,
    borderRadius: '8px',
    padding: '8px 10px 8px 12px',
    boxShadow: isOverlay ? '0 8px 20px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
    userSelect: 'none',
  };

  const handleStyle: React.CSSProperties = {
    cursor: isOverlay ? 'grabbing' : 'grab',
    touchAction: 'none',
    color: 'var(--text-hint)',
    flexShrink: 0,
    fontSize: '1rem',
    padding: '0 2px',
  };

  return (
    <div ref={isOverlay ? undefined : setNodeRef} style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            title={STATUS_LABEL[guest.status]}
            style={{ fontWeight: 600, fontSize: '0.88rem', wordBreak: 'break-word', color: 'var(--text-primary)' }}
          >
            {guest.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            {guest.adultsCount > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <i className="fas fa-user"></i> {guest.adultsCount}
              </span>
            )}
            {guest.childrenCount > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <i className="fas fa-child"></i> {guest.childrenCount}
              </span>
            )}
          </div>
        </div>
        {!isOverlay && (
          <span style={handleStyle} {...listeners} {...attributes}>
            <i className="fas fa-grip-vertical"></i>
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Pool (Unassigned Guests) ────────────────────────────────────────────────

interface PoolZoneProps {
  guests: Guest[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const PoolZone = ({ guests, isCollapsed, onToggleCollapse }: PoolZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'pool' });

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? 'var(--bg-surface-hover)' : 'var(--bg-surface-alt)',
        border: `2px dashed ${isOver ? 'var(--color-primary)' : 'var(--border-hover)'}`,
        borderRadius: '12px',
        padding: '10px',
        minHeight: '50px',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="fas fa-user-slash" style={{ color: 'var(--color-primary)' }}></i>
        Sem Mesa
        <span className="counter">{guests.length}</span>
        <button
          className="btn-edit-icon pool-toggle-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expandir' : 'Retrair'}
          style={{ marginLeft: 'auto', fontSize: '0.85rem' }}
        >
          <i className={`fas fa-chevron-${isCollapsed ? 'down' : 'up'}`}></i>
        </button>
      </h4>
      <div className="pool-guests-collapsible" style={{ display: 'grid', gridTemplateRows: isCollapsed ? '0fr' : '1fr', transition: 'grid-template-rows 0.25s ease', overflow: 'hidden' }}>
        <div style={{ minHeight: 0 }}>
          {guests.length === 0 ? (
            <p style={{ color: 'var(--text-hint)', fontSize: '0.85rem', textAlign: 'center', marginTop: '40px' }}>
              Todos os convidados estão alocados
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {guests.map(g => <GuestCard key={g.id} guest={g} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Table Drop Zone ─────────────────────────────────────────────────────────

interface TableZoneProps {
  table: Table;
  displayGuests: Guest[];
  seatsUsed: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddGuests: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TableZone = ({ table, displayGuests, seatsUsed, isCollapsed, onToggleCollapse, onAddGuests, onEdit, onDelete }: TableZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: table.id });
  const isFull = seatsUsed >= table.capacity;
  const fillPct = Math.min((seatsUsed / table.capacity) * 100, 100);

  const borderColor = isOver
    ? isFull ? '#e53e3e' : 'var(--color-primary)'
    : 'var(--border-tertiary)';

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? (isFull ? '#fff5f5' : 'var(--bg-surface-hover)') : 'var(--bg-surface)',
        border: `2px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', flex: 1, marginRight: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fas fa-chair" style={{ color: 'var(--color-primary)' }}></i>
            {table.order != null && (
              <span className="position-badge">
                #{table.order}
              </span>
            )}
            {table.name}
          </h4>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <button
              onClick={onToggleCollapse}
              className="btn-edit-icon"
              title={isCollapsed ? 'Expandir convidados' : 'Retrair convidados'}
              style={{ fontSize: '0.85rem' }}
            >
              <i className={`fas fa-chevron-${isCollapsed ? 'down' : 'up'}`}></i>
            </button>
            <button onClick={onAddGuests} className="btn-edit-icon" title="Adicionar convidados" style={{ fontSize: '0.85rem', color: '#e07b39' }}>
              <i className="fas fa-user-plus"></i>
            </button>
            <button onClick={onEdit} className="btn-edit-icon" title="Editar mesa" style={{ fontSize: '0.85rem' }}>
              <i className="fas fa-edit"></i>
            </button>
            <button onClick={onDelete} className="btn-delete-icon" title="Excluir mesa" style={{ fontSize: '0.85rem' }}>
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>

        {/* Capacity bar */}
        <div style={{ marginTop: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Lugares</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isFull ? '#e53e3e' : 'var(--text-secondary)' }}>
              {seatsUsed}/{table.capacity}
            </span>
          </div>
          <div style={{ background: 'var(--bg-progress-track)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${fillPct}%`,
                height: '100%',
                background: isFull ? '#e53e3e' : 'var(--gradient-primary)',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      </div>

      {/* Assigned Guests */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isCollapsed ? '0fr' : '1fr',
          transition: 'grid-template-rows 0.25s ease',
          overflow: 'hidden',
        }}
      >
        <div style={{ minHeight: 0 }}>
          <div style={{ paddingTop: '4px' }}>
            {displayGuests.length === 0 ? (
              <p style={{ color: 'var(--text-hint)', fontSize: '0.82rem', textAlign: 'center', paddingTop: '16px' }}>
                {seatsUsed > 0 ? 'Nenhum convidado visível com os filtros atuais' : 'Arraste convidados para cá'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {displayGuests.map(g => <GuestCard key={g.id} guest={g} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TableBoard (main export) ────────────────────────────────────────────────

interface TableBoardProps {
  guests: Guest[];
  tables: Table[];
  onGuestTableChange: (guestId: string, tableId: string | null) => void;
  onTableEdit: (table: Table) => void;
  onTableDelete: (table: Table) => void;
}

const STATUS_OPTIONS: { value: GuestStatus; label: string }[] = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'pending', label: 'Aguardando' },
  { value: 'declined', label: 'Não Comparecerá' },
];

const TableBoard = ({ guests, tables, onGuestTableChange, onTableEdit, onTableDelete }: TableBoardProps) => {
  const { addNotification } = useNotification();
  const [activeGuestId, setActiveGuestId] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [guestSearch, setGuestSearch] = useState('');
  const [guestStatusFilter, setGuestStatusFilter] = useState<GuestStatus | ''>('');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [isPoolCollapsed, setIsPoolCollapsed] = useState(false);

  const allCollapsed = tables.length > 0 && tables.every(t => collapsedIds.has(t.id));

  const toggleCollapseAll = () => {
    if (allCollapsed) {
      setCollapsedIds(new Set());
    } else {
      setCollapsedIds(new Set(tables.map(t => t.id)));
    }
  };

  const toggleCollapse = (tableId: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      next.has(tableId) ? next.delete(tableId) : next.add(tableId);
      return next;
    });
  };

  // ── Add Guests Modal ────────────────────────────────────────────────────────

  type GuestOption = { value: string; label: string };

  const [addGuestsTableId, setAddGuestsTableId] = useState<string | null>(null);
  const [guestsToAdd, setGuestsToAdd] = useState<MultiValue<GuestOption>>([]);
  const [guestsToRemove, setGuestsToRemove] = useState<MultiValue<GuestOption>>([]);

  const addGuestsTable = addGuestsTableId ? tables.find(t => t.id === addGuestsTableId) ?? null : null;

  const currentTableGuests = addGuestsTableId
    ? guests.filter(g => g.tableId === addGuestsTableId)
    : [];

  const addGuestsSeatsUsed = currentTableGuests.reduce((sum, g) => sum + g.adultsCount + g.childrenCount, 0);

  const addPeopleCount = useMemo(
    () => guestsToAdd.reduce((sum, opt) => {
      const g = guests.find(g => g.id === opt.value);
      return sum + (g ? g.adultsCount + g.childrenCount : 0);
    }, 0),
    [guestsToAdd, guests]
  );

  const removePeopleCount = useMemo(
    () => guestsToRemove.reduce((sum, opt) => {
      const g = guests.find(g => g.id === opt.value);
      return sum + (g ? g.adultsCount + g.childrenCount : 0);
    }, 0),
    [guestsToRemove, guests]
  );

  const addGuestsRemaining = addGuestsTable
    ? addGuestsTable.capacity - addGuestsSeatsUsed + removePeopleCount - addPeopleCount
    : 0;

  const poolGuestsForModal = guests.filter(g => !g.tableId);

  const guestAddOptions: GuestOption[] = poolGuestsForModal.map(g => ({
    value: g.id,
    label: `${g.name} (${g.adultsCount + g.childrenCount} pessoa${g.adultsCount + g.childrenCount !== 1 ? 's' : ''})`,
  }));

  const guestRemoveOptions: GuestOption[] = currentTableGuests.map(g => ({
    value: g.id,
    label: `${g.name} (${g.adultsCount + g.childrenCount} pessoa${g.adultsCount + g.childrenCount !== 1 ? 's' : ''})`,
  }));

  const openAddGuestsModal = (tableId: string) => {
    setAddGuestsTableId(tableId);
    setGuestsToAdd([]);
    setGuestsToRemove([]);
  };

  const closeAddGuestsModal = () => {
    setAddGuestsTableId(null);
    setGuestsToAdd([]);
    setGuestsToRemove([]);
  };

  const handleConfirmAddGuests = async () => {
    if (!addGuestsTable) return;
    if (addGuestsRemaining < 0) {
      addNotification('Capacidade excedida. Reduza a seleção de convidados.', 'warning');
      return;
    }
    await Promise.all([
      ...guestsToAdd.map(opt => onGuestTableChange(opt.value, addGuestsTable.id)),
      ...guestsToRemove.map(opt => onGuestTableChange(opt.value, null)),
    ]);
    const parts: string[] = [];
    if (guestsToAdd.length > 0) parts.push(`${guestsToAdd.length} adicionado(s)`);
    if (guestsToRemove.length > 0) parts.push(`${guestsToRemove.length} removido(s)`);
    if (parts.length > 0) {
      addNotification(`Mesa "${addGuestsTable.name}": ${parts.join(', ')}.`, 'success');
    }
    closeAddGuestsModal();
  };

  // ── Sensors ─────────────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const activeGuest = activeGuestId ? guests.find(g => g.id === activeGuestId) ?? null : null;

  // visibleGuests: usados apenas para exibição (pool + dentro das mesas)
  const visibleGuests = guests.filter(g => {
    const matchesName = guestSearch === '' || g.name.toLowerCase().includes(guestSearch.toLowerCase());
    const matchesStatus = guestStatusFilter === '' || g.status === guestStatusFilter;
    return matchesName && matchesStatus;
  });

  const poolGuests = visibleGuests.filter(g => !g.tableId);

  // display: convidados visíveis na mesa; seatsUsed: calculado com lista completa (para barra de capacidade)
  const displayGuestsForTable = (tableId: string) => visibleGuests.filter(g => g.tableId === tableId);
  const seatsUsedForTable = (tableId: string) => guests
    .filter(g => g.tableId === tableId)
    .reduce((sum, g) => sum + guestPeople(g), 0);

  const filteredTables = tableSearch
    ? tables.filter(t => t.name.toLowerCase().includes(tableSearch.toLowerCase()))
    : tables;

  const sortedTables = [...filteredTables].sort((a, b) => {
    const isFullA = seatsUsedForTable(a.id) >= a.capacity ? 1 : 0;
    const isFullB = seatsUsedForTable(b.id) >= b.capacity ? 1 : 0;
    if (isFullA !== isFullB) return isFullA - isFullB;
    // Dentro do mesmo grupo (cheias ou não cheias), ordena pelo campo `order`
    const orderA = a.order ?? Infinity;
    const orderB = b.order ?? Infinity;
    return orderA - orderB;
  });

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveGuestId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveGuestId(null);
    if (!over) return;

    const guestId = active.id as string;
    const targetId = over.id as string;
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;

    const currentTableId = guest.tableId ?? null;

    if (targetId === 'pool') {
      if (currentTableId !== null) {
        onGuestTableChange(guestId, null);
      }
      return;
    }

    if (targetId === currentTableId) return;

    const table = tables.find(t => t.id === targetId);
    if (!table) return;

    const guestsInTarget = guests.filter(g => g.tableId === targetId && g.id !== guestId);
    const seatsUsed = guestsInTarget.reduce((sum, g) => sum + guestPeople(g), 0);
    const neededSeats = guestPeople(guest);

    if (seatsUsed + neededSeats > table.capacity) {
      addNotification(`Mesa "${table.name}" não tem lugares suficientes! (${seatsUsed}/${table.capacity})`, 'warning');
      return;
    }

    onGuestTableChange(guestId, targetId);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* ── Barra de filtros ── */}
      <div className="tableboard-filters">
        <div className="tableboard-filters-group">
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 160px' }}>
            <input
              type="text"
              placeholder="Buscar convidado..."
              value={guestSearch}
              onChange={(e) => setGuestSearch(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 150px' }}>
            <CustomSelect
              options={STATUS_OPTIONS}
              value={STATUS_OPTIONS.find(o => o.value === guestStatusFilter) ?? null}
              onChange={(opt) => setGuestStatusFilter(opt?.value ?? '')}
              placeholder="Todos os status"
              isClearable
            />
          </div>
        </div>

        <div className="tableboard-filters-group">
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 160px' }}>
            <input
              type="text"
              placeholder="Buscar mesa..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </div>
          {tables.length > 0 && (
            <button
              className="btn btn-secondary btn-full-mobile"
              onClick={toggleCollapseAll}
              title={allCollapsed ? 'Expandir todas as mesas' : 'Retrair todas as mesas'}
              style={{ flexShrink: 0 }}
            >
              <i className={`fas fa-${allCollapsed ? 'expand-alt' : 'compress-alt'}`}></i>
              {allCollapsed ? ' Expandir todas' : ' Retrair todas'}
            </button>
          )}
        </div>
      </div>

      {/* ── Conteúdo: Pool à esquerda + Grid de mesas ── */}
      <div className="tableboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 280px) 1fr', gap: '20px', alignItems: 'start', marginTop: '10px' }}>
        <PoolZone guests={poolGuests} isCollapsed={isPoolCollapsed} onToggleCollapse={() => setIsPoolCollapsed(p => !p)} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))',
            gap: '10px',
            alignItems: 'stretch',
            minWidth: 0,
          }}
        >
          {sortedTables.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-hint)', padding: '40px', alignSelf: 'center' }}>
              <i className="fas fa-chair" style={{ fontSize: '2rem', marginBottom: '12px', display: 'block', color: 'var(--border-primary)' }}></i>
              Nenhuma mesa criada ainda. Clique em "Nova Mesa" para começar.
            </div>
          ) : (
            sortedTables.map(table => (
              <TableZone
                key={table.id}
                table={table}
                displayGuests={displayGuestsForTable(table.id)}
                seatsUsed={seatsUsedForTable(table.id)}
                isCollapsed={collapsedIds.has(table.id)}
                onToggleCollapse={() => toggleCollapse(table.id)}
                onAddGuests={() => openAddGuestsModal(table.id)}
                onEdit={() => onTableEdit(table)}
                onDelete={() => onTableDelete(table)}
              />
            ))
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeGuest && <GuestCard guest={activeGuest} isOverlay />}
      </DragOverlay>

      {/* ── Add Guests Modal ── */}
      <Modal
        isOpen={!!addGuestsTableId}
        onClose={closeAddGuestsModal}
        title={`Gerenciar convidados — ${addGuestsTable?.name ?? ''}`}
        handleSave={handleConfirmAddGuests}
        nameSaveBtn="Salvar"
      >
        {/* Capacity summary */}
        <div style={{
          background: 'var(--bg-surface-alt)',
          border: '1px solid var(--border-hover)',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '16px',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>
              {addGuestsTable?.capacity ?? 0}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Total de lugares</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-secondary)', lineHeight: 1 }}>
              {addGuestsSeatsUsed}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Ocupados</p>
          </div>
          {addPeopleCount > 0 && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-success-text)', lineHeight: 1 }}>
                +{addPeopleCount}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>A adicionar</p>
            </div>
          )}
          {removePeopleCount > 0 && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-error-text)', lineHeight: 1 }}>
                -{removePeopleCount}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>A remover</p>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: '1.4rem', fontWeight: 700, lineHeight: 1,
              color: addGuestsRemaining < 0 ? '#e53e3e' : addGuestsRemaining === 0 ? 'var(--color-warning-text)' : 'var(--color-success-text)',
            }}>
              {addGuestsRemaining}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Restantes</p>
          </div>
          {/* Barra de progresso */}
          <div style={{ width: '100%', marginTop: '4px' }}>
            <div style={{ background: 'var(--bg-progress-track)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(((addGuestsSeatsUsed - removePeopleCount + addPeopleCount) / (addGuestsTable?.capacity || 1)) * 100, 100)}%`,
                height: '100%',
                background: addGuestsRemaining < 0 ? '#e53e3e' : 'var(--gradient-primary)',
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        </div>

        {/* Adicionar convidados sem mesa */}
        <div className="form-group">
          <label>Adicionar à mesa:</label>
          {poolGuestsForModal.length === 0 ? (
            <p style={{ color: 'var(--text-hint)', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0' }}>
              Todos os convidados já estão alocados em mesas.
            </p>
          ) : (
            <MultiSelect
              options={guestAddOptions}
              value={guestsToAdd}
              onChange={(val) => setGuestsToAdd(val)}
              placeholder="Buscar convidados sem mesa..."
            />
          )}
        </div>

        {/* Remover convidados da mesa */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Remover da mesa:</label>
          {currentTableGuests.length === 0 ? (
            <p style={{ color: 'var(--text-hint)', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0' }}>
              Nenhum convidado alocado nesta mesa.
            </p>
          ) : (
            <MultiSelect
              options={guestRemoveOptions}
              value={guestsToRemove}
              onChange={(val) => setGuestsToRemove(val)}
              placeholder="Buscar convidados desta mesa..."
            />
          )}
        </div>
      </Modal>
    </DndContext>
  );
};

export default TableBoard;
