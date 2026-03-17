'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getEvents, updateEvent, Event } from '@/services/event.service';
import {
  addGuest, getGuests, updateGuest, deleteGuest, updateGuestTable,
  Guest, GuestStatus, CreateGuestDTO,
} from '@/services/guest.service';
import { addTable, getTables, updateTable, deleteTable, Table, CreateTableDTO } from '@/services/table.service';
import Modal from '@/components/Modal';
import HeaderHelper from '@/components/HeaderHelper';
import { useNotification } from '@/context/NotificationContext';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import PhoneInput from '@/components/fields/PhoneInput';
import TableBoard from '@/components/TableBoard';
import CustomSelect from '@/components/Select';
import { ActionMeta, SingleValue, MultiValue } from 'react-select';
import { generatePublicPage, syncPublicPage } from '@/services/publicGuestPage.service';
import QRCode from 'qrcode';
import { pdfGuestsAccess } from '@/utils/pdfBody.utils';
import { getSituationStyle, getBorderCardStyle } from '@/utils/situationStyles.utils';
import { useDemoGuard } from '@/utils/useDemoGuard';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: GuestStatus; label: string }[] = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'pending', label: 'Aguardando' },
  { value: 'declined', label: 'Não Comparecerá' },
];


const initialGuestForm: CreateGuestDTO = {
  name: '', phone: '', status: 'pending', adultsCount: 1, childrenCount: 0,
};

const initialTableForm: CreateTableDTO = {
  name: '', capacity: 10, order: undefined,
};

type ActiveTab = 'lista' | 'mesas';

interface EventOption {
  value: string;
  label: string;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ConvidadosPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const guard = useDemoGuard();

  // Event selection
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');

  // Data
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);

  // UI
  const [activeTab, setActiveTab] = useState<ActiveTab>('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<GuestStatus | ''>('');

  // Guest modal
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [guestForm, setGuestForm] = useState<CreateGuestDTO>(initialGuestForm);

  // Table modal
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableForm, setTableForm] = useState<CreateTableDTO>(initialTableForm);

  // Delete confirmations
  const [isDeleteGuestOpen, setIsDeleteGuestOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [isDeleteTableOpen, setIsDeleteTableOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  // QR Code
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrSyncing, setQrSyncing] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // ── Load events on mount ──────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;
    getEvents(user.uid)
      .then(setEvents)
      .catch(() => addNotification('Falha ao buscar eventos.', 'error'));
  }, [user]);

  // ── Fetch helpers ─────────────────────────────────────────────────────────

  const fetchGuests = async (eventId: string) => {
    if (!user || !eventId) return;
    setLoading(true);
    try {
      setGuests(await getGuests(user.uid, eventId));
    } catch (error) {
      console.error(error)
      addNotification('Falha ao buscar convidados.', 'error');
    }
    setLoading(false);
  };

  const fetchTables = async (eventId: string) => {
    if (!user || !eventId) return;
    try {
      setTables(await getTables(user.uid, eventId));
    } catch {
      addNotification('Falha ao buscar mesas.', 'error');
    }
  };

  const handleEventChange = (newValue: SingleValue<EventOption> | MultiValue<EventOption>, _: ActionMeta<EventOption>) => {
    const eventId = (newValue as SingleValue<EventOption>)?.value ?? '';
    setSelectedEventId(eventId);
    setGuests([]);
    setTables([]);
    setSearchTerm('');
    setStatusFilter('');
    if (eventId) {
      Promise.all([fetchGuests(eventId), fetchTables(eventId)]);
    }
  };

  // ── Guest CRUD ────────────────────────────────────────────────────────────

  const openAddGuest = () => {
    setEditingGuest(null);
    setGuestForm(initialGuestForm);
    setIsGuestModalOpen(true);
  };

  const openEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setGuestForm({ name: guest.name, phone: guest.phone, status: guest.status, adultsCount: guest.adultsCount, childrenCount: guest.childrenCount });
    setIsGuestModalOpen(true);
  };

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedEventId) return;
    await guard(async () => {
      try {
        if (editingGuest) {
          await updateGuest(user.uid, selectedEventId, editingGuest.id, guestForm);
          addNotification('Convidado atualizado com sucesso!', 'success');
        } else {
          await addGuest(user.uid, selectedEventId, guestForm);
          addNotification('Convidado adicionado com sucesso!', 'success');
        }
        setIsGuestModalOpen(false);
        fetchGuests(selectedEventId);
      } catch (error) {
        console.log(error);
        addNotification('Erro ao salvar convidado.', 'error');
      }
    });
  };

  const handleGuestFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setGuestForm(prev => ({
      ...prev,
      [id]: id === 'adultsCount' || id === 'childrenCount' ? Number(value) : value,
    }));
  };

  const handleDeleteGuestConfirm = async () => {
    if (!user || !selectedEventId || !guestToDelete) return;
    await guard(async () => {
      try {
        await deleteGuest(user.uid, selectedEventId, guestToDelete.id);
        fetchGuests(selectedEventId);
        addNotification('Convidado removido com sucesso!', 'success');
      } catch {
        addNotification('Erro ao remover convidado.', 'error');
      } finally {
        setIsDeleteGuestOpen(false);
        setGuestToDelete(null);
      }
    });
  };

  // ── Table CRUD ────────────────────────────────────────────────────────────

  const openAddTable = () => {
    setEditingTable(null);
    setTableForm(initialTableForm);
    setIsTableModalOpen(true);
  };

  const openEditTable = (table: Table) => {
    setEditingTable(table);
    setTableForm({ name: table.name, capacity: table.capacity, order: table.order });
    setIsTableModalOpen(true);
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedEventId) return;
    await guard(async () => {
      try {
        if (editingTable) {
          await updateTable(user.uid, selectedEventId, editingTable.id, tableForm);
          addNotification('Mesa atualizada com sucesso!', 'success');
        } else {
          await addTable(user.uid, selectedEventId, tableForm);
          addNotification('Mesa criada com sucesso!', 'success');
        }
        setIsTableModalOpen(false);
        fetchTables(selectedEventId);
      } catch {
        addNotification('Erro ao salvar mesa.', 'error');
      }
    });
  };

  const handleTableFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numericFields = ['capacity', 'order'];
    setTableForm(prev => ({
      ...prev,
      [id]: numericFields.includes(id) ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleDeleteTableRequest = (table: Table) => {
    const hasGuests = guests.some(g => g.tableId === table.id);
    if (hasGuests) {
      addNotification('Remova os convidados da mesa antes de excluí-la.', 'warning');
      return;
    }
    setTableToDelete(table);
    setIsDeleteTableOpen(true);
  };

  const handleDeleteTableConfirm = async () => {
    if (!user || !selectedEventId || !tableToDelete) return;
    await guard(async () => {
      try {
        await deleteTable(user.uid, selectedEventId, tableToDelete.id);
        fetchTables(selectedEventId);
        addNotification('Mesa excluída com sucesso!', 'success');
      } catch {
        addNotification('Erro ao excluir mesa.', 'error');
      } finally {
        setIsDeleteTableOpen(false);
        setTableToDelete(null);
      }
    });
  };

  // ── Drag-and-Drop ─────────────────────────────────────────────────────────

  const handleGuestTableChange = async (guestId: string, tableId: string | null) => {
    if (!user || !selectedEventId) return;
    await guard(async () => {
      setGuests(prev =>
        prev.map(g => g.id === guestId ? { ...g, tableId: tableId ?? undefined } : g)
      );
      try {
        await updateGuestTable(user.uid, selectedEventId, guestId, tableId);
      } catch {
        addNotification('Erro ao mover convidado.', 'error');
        fetchGuests(selectedEventId);
      }
    });
  };

  // ── Computed: selected event (needed by QR handlers) ─────────────────────

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // ── QR Code ───────────────────────────────────────────────────────────────

  const buildPublicUrl = useCallback((token: string) => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/mesa/${token}`;
  }, []);

  const renderQr = useCallback(async (token: string) => {
    const url = buildPublicUrl(token);
    const dataUrl = await QRCode.toDataURL(url, { width: 260, margin: 2, color: { dark: '#1a1a2e', light: '#ffffff' } });
    setQrDataUrl(dataUrl);
  }, [buildPublicUrl]);

  const openQrModal = useCallback(async () => {
    if (!user || !selectedEventId || !selectedEvent) return;
    const token = selectedEvent.publicToken;
    if (token) {
      setIsQrModalOpen(true);
      await renderQr(token);
    } else {
      await guard(async () => {
        setIsQrModalOpen(true);
        try {
          setQrSyncing(true);
          const newToken = await generatePublicPage(user.uid, selectedEventId, selectedEvent.eventName, guests, tables);
          await updateEvent(user.uid, selectedEventId, { publicToken: newToken });
          setEvents(prev => prev.map(e => e.id === selectedEventId ? { ...e, publicToken: newToken } : e));
          await renderQr(newToken);
          addNotification('QR Code gerado com sucesso!', 'success');
        } catch (error) {
          console.error(error);
          addNotification('Erro ao gerar QR Code.', 'error');
        } finally {
          setQrSyncing(false);
        }
      });
    }
  }, [user, selectedEventId, selectedEvent, guests, tables, renderQr, addNotification, guard]);

  const handleSyncQr = useCallback(async () => {
    if (!user || !selectedEventId || !selectedEvent) return;
    const token = selectedEvent.publicToken;
    if (!token) return;
    await guard(async () => {
      setQrSyncing(true);
      try {
        await syncPublicPage(token, selectedEvent.eventName, guests, tables);
        addNotification('Dados sincronizados com sucesso!', 'success');
      } catch {
        addNotification('Erro ao sincronizar dados.', 'error');
      } finally {
        setQrSyncing(false);
      }
    });
  }, [user, selectedEventId, selectedEvent, guests, tables, addNotification, guard]);

  const handleCopyLink = useCallback(() => {
    const token = selectedEvent?.publicToken;
    const publicURL = token ? buildPublicUrl(token) : null;
    if (!token || !publicURL) return;
    navigator.clipboard.writeText(publicURL);
    addNotification('Link copiado!', 'success');
  }, [selectedEvent, buildPublicUrl, addNotification]);

  const handleExportPdf = useCallback(() => {
    if (!qrDataUrl || !selectedEvent) return;
    const publicUrl = buildPublicUrl(selectedEvent.publicToken!);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(pdfGuestsAccess(selectedEvent.eventName, qrDataUrl, publicUrl));
    win.document.close();
  }, [qrDataUrl, selectedEvent, buildPublicUrl]);

  // ── Computed stats ────────────────────────────────────────────────────────

  const totalConvites = guests.length;
  const totalConvidados = guests.reduce((sum, g) => sum + g.adultsCount + g.childrenCount, 0);
  const totalMesas = tables.length;

  const confirmedCount = guests.filter(g => g.status === 'confirmed').length;
  const pendingCount = guests.filter(g => g.status === 'pending').length;
  const declinedCount = guests.filter(g => g.status === 'declined').length;

  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
  const occupiedSeats = guests.reduce((sum, g) => g.tableId ? sum + g.adultsCount + g.childrenCount : sum, 0);

  const filteredGuests = guests.filter(g => {
    const matchesName = g.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || g.status === statusFilter;
    return matchesName && matchesStatus;
  });

  const eventOptions: EventOption[] = events.map(e => ({
    value: e.id,
    label: `${e.eventName} (${new Date(e.eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })})`,
  }));

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <HeaderHelper>
        <span>
          Gerencie a lista de convidados e a organização das mesas por evento.
        </span>
      </HeaderHelper>

      {/* Event selector + stats + content */}
      <div className="card card-background" style={{ marginBottom: '20px' }}>
        <h3><i className="fas fa-calendar-alt"></i> Selecionar Evento</h3>
        <div className="form-group" style={{ marginBottom: selectedEventId ? '20px' : 0 }}>
          <CustomSelect
            id="eventSelector"
            options={eventOptions}
            value={eventOptions.find(o => o.value === selectedEventId) ?? null}
            onChange={handleEventChange}
            placeholder="Buscar evento..."
            isClearable
          />
        </div>

        <AnimatePresence mode="wait">
        {selectedEventId ? (
          <motion.div
            key={selectedEventId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {/* Dashboard */}
            <div className="grid grid-3" style={{ marginBottom: '20px' }}>
              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: 'var(--color-primary)', fontSize: '2rem', fontWeight: 700 }}>{totalConvites}</p>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <i className="fas fa-envelope" style={{ marginRight: '6px' }}></i>
                  Total de Convites
                </p>
                <p style={{ color: 'var(--text-disabled)', fontSize: '0.8rem', marginTop: '6px' }}>
                  {confirmedCount} confirmados · {pendingCount} aguardando · {declinedCount} não irão
                </p>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: 'var(--color-primary)', fontSize: '2rem', fontWeight: 700 }}>{totalConvidados}</p>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <i className="fas fa-users" style={{ marginRight: '6px' }}></i>
                  Total de Convidados
                </p>
                <p style={{ color: 'var(--text-disabled)', fontSize: '0.8rem', marginTop: '6px' }}>
                  adultos + crianças de todos os convites
                </p>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: 'var(--color-primary)', fontSize: '2rem', fontWeight: 700 }}>{totalMesas}</p>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <i className="fas fa-chair" style={{ marginRight: '6px' }}></i>
                  Total de Mesas
                </p>
                <p style={{ color: 'var(--text-disabled)', fontSize: '0.8rem', marginTop: '6px' }}>
                  {occupiedSeats}/{totalCapacity} lugares ocupados
                </p>
              </div>
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingLeft: '4px', marginBottom: '20px' }}>
              <div className="tabs" style={{ justifyContent: 'flex-start', marginBottom: 0 }}>
                <button
                  className={`tab-button ${activeTab === 'lista' ? 'active' : ''}`}
                  onClick={() => setActiveTab('lista')}
                >
                  <i className="fas fa-list" style={{ marginRight: '6px' }}></i>
                  Lista de Convidados
                </button>
                <button
                  className={`tab-button ${activeTab === 'mesas' ? 'active' : ''}`}
                  onClick={() => setActiveTab('mesas')}
                >
                  <i className="fas fa-chair" style={{ marginRight: '6px' }}></i>
                  Organização de Mesas
                </button>
              </div>
              <button className="btn btn-secondary btn-full-mobile" onClick={openQrModal} title="QR Code para convidados">
                <i className="fas fa-qrcode" style={{ marginRight: '6px' }}></i>
                QR Code
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'lista' ? (
                <motion.div
                  key="lista"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {/* ── Tab: Lista de Convidados ── */}
                  <div className="card card-consult">
                    <h3>
                      <i className="fas fa-user-check"></i>
                      {selectedEvent?.eventName}
                      <span className="counter">{filteredGuests.length} encontrados</span>
                    </h3>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <div className="form-group" style={{ flex: '1 1 180px', marginBottom: 0 }}>
                        <input
                          type="text"
                          placeholder="Buscar por nome..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
                        <CustomSelect
                          options={STATUS_OPTIONS}
                          value={STATUS_OPTIONS.find(o => o.value === statusFilter) ?? null}
                          onChange={(opt) => setStatusFilter((opt?.value as GuestStatus) ?? '')}
                          placeholder="Todos os status"
                          isClearable
                        />
                      </div>
                      <button className="btn btn-full-mobile" onClick={openAddGuest}>
                        <i className="fas fa-plus"></i> Adicionar convite
                      </button>
                    </div>

                    <div className="list-container">
                      {loading ? (
                        <p>Carregando...</p>
                      ) : filteredGuests.length > 0 ? (
                        filteredGuests.map(guest => (
                          <div key={guest.id} className="supplier-card" style={getBorderCardStyle(guest.status, 'confirmed', 'pending', '', 'declined')}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <h4 style={{ flex: 1, minWidth: 0, margin: 0, wordBreak: 'break-word', marginBottom: "10px" }}>{guest.name}</h4>
                              <span className="status-badge" style={{ ...getSituationStyle(guest.status, 'confirmed', 'pending', '', 'declined'), flexShrink: 0 }}>
                                {STATUS_OPTIONS.find(o => o.value === guest.status)?.label}
                              </span>
                            </div>
                            {guest.phone && <p><i className="fas fa-phone"></i> {guest.phone}</p>}
                            <p>
                              <i className="fas fa-users"></i>
                              {guest.adultsCount} adulto{guest.adultsCount !== 1 ? 's' : ''}
                              {guest.childrenCount > 0 && `, ${guest.childrenCount} criança${guest.childrenCount !== 1 ? 's' : ''}`}
                            </p>
                            {guest.tableId && (
                              <p>
                                <i className="fas fa-chair"></i>
                                {tables.find(t => t.id === guest.tableId)?.name ?? 'Mesa não encontrada'}
                              </p>
                            )}
                            <div className="supplier-card-actions">
                              <button onClick={() => openEditGuest(guest)} className="btn btn-secondary btn-small">
                                <i className="fas fa-edit"></i> Editar
                              </button>
                              <button
                                onClick={() => { setGuestToDelete(guest); setIsDeleteGuestOpen(true); }}
                                className="btn btn-small"
                              >
                                <i className="fas fa-trash"></i> Excluir
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <h4 className="query-message">
                          {guests.length === 0
                            ? 'Nenhum convidado cadastrado para este evento.'
                            : 'Nenhum convidado encontrado para a busca.'}
                        </h4>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mesas"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {/* ── Tab: Organização de Mesas ── */}
                  <div className="card" style={{ overflow: 'visible' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                      <h3 style={{ margin: 0 }}>
                        <i className="fas fa-chair"></i>
                        Mesas — {selectedEvent?.eventName}
                      </h3>
                      <button className="btn btn-full-mobile" onClick={openAddTable}>
                        <i className="fas fa-plus"></i> Nova Mesa
                      </button>
                    </div>

                    <TableBoard
                      guests={guests}
                      tables={tables}
                      onGuestTableChange={handleGuestTableChange}
                      onTableEdit={openEditTable}
                      onTableDelete={handleDeleteTableRequest}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <h4 className="query-message">
              <i className="fas fa-hand-pointer" style={{ marginRight: '8px' }}></i>
              Selecione um evento para visualizar os convidados e as mesas.
            </h4>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* ── Guest Modal ── */}
      <Modal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        title={editingGuest ? 'Editar Convidado' : 'Adicionar Convite'}
        formId="guest-form"
        nameSaveBtn={editingGuest ? 'Salvar Alterações' : 'Adicionar'}
      >
        <form id="guest-form" onSubmit={handleSaveGuest}>
          <div className="form-group">
            <label htmlFor="name">Nome completo:</label>
            <input type="text" id="name" value={guestForm.name} onChange={handleGuestFormChange} placeholder="Nome do convidado" required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Telefone:</label>
            <PhoneInput
              id="phone"
              value={guestForm.phone}
              onChange={(value) => setGuestForm(prev => ({ ...prev, phone: value }))}
            />
          </div>
          <div className="form-group">
            <label>Status:</label>
            <CustomSelect
              options={STATUS_OPTIONS}
              value={STATUS_OPTIONS.find(o => o.value === guestForm.status) ?? null}
              onChange={(opt) => setGuestForm(prev => ({ ...prev, status: opt?.value ?? 'pending' }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="adultsCount">Adultos:</label>
            <input type="number" id="adultsCount" value={guestForm.adultsCount} onChange={handleGuestFormChange} min={0} required />
          </div>
          <div className="form-group">
            <label htmlFor="childrenCount">Crianças:</label>
            <input type="number" id="childrenCount" value={guestForm.childrenCount} onChange={handleGuestFormChange} min={0} required />
          </div>
        </form>
      </Modal>

      {/* ── Table Modal ── */}
      <Modal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        title={editingTable ? 'Editar Mesa' : 'Nova Mesa'}
        formId="table-form"
        nameSaveBtn={editingTable ? 'Salvar Alterações' : 'Criar Mesa'}
      >
        <form id="table-form" onSubmit={handleSaveTable}>
          <div className="form-group">
            <label htmlFor="name">Nome da Mesa:</label>
            <input type="text" id="name" value={tableForm.name} onChange={handleTableFormChange} placeholder="Ex: Mesa 1 — Família Noivo" required />
          </div>
          <div className="form-row-inline">
            <div className="form-group">
              <label htmlFor="capacity">Capacidade (lugares):</label>
              <input type="number" id="capacity" value={tableForm.capacity} onChange={handleTableFormChange} min={1} required />
            </div>
            <div className="form-group">
              <label htmlFor="order">Ordem de exibição:</label>
              <input type="number" id="order" value={tableForm.order ?? ''} onChange={handleTableFormChange} min={1} placeholder="Ex: 1" />
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Confirm: Delete Guest ── */}
      <ConfirmActionModal
        isOpen={isDeleteGuestOpen}
        onClose={() => setIsDeleteGuestOpen(false)}
        onConfirm={handleDeleteGuestConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja remover o convidado "${guestToDelete?.name}"?`}
      />

      {/* ── Confirm: Delete Table ── */}
      <ConfirmActionModal
        isOpen={isDeleteTableOpen}
        onClose={() => setIsDeleteTableOpen(false)}
        onConfirm={handleDeleteTableConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a mesa "${tableToDelete?.name}"?`}
      />

      {/* ── QR Code Modal ── */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="QR Code para Convidados"
        customFooter={qrDataUrl ? (
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCopyLink}>
              <i className="fas fa-copy" style={{ marginRight: '6px' }}></i>
              Copiar Link
            </button>
            <button type="button" className="btn" onClick={handleExportPdf}>
              <i className="fas fa-file-pdf" style={{ marginRight: '6px' }}></i>
              Exportar PDF
            </button>
          </div>
        ) : undefined}
      >
        {qrSyncing && !qrDataUrl ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}></i>
            <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Gerando QR Code...</p>
          </div>
        ) : qrDataUrl ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
              Exiba este QR code na recepção. Os convidados escaneiam e buscam o próprio nome para ver a mesa.
            </p>
            <div style={{ display: 'inline-block', padding: '16px', background: 'var(--bg-surface)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '12px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR Code" style={{ display: 'block', width: '220px', height: '220px' }} />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-hint)', marginBottom: '12px' }}>
              <i className="fas fa-info-circle" style={{ marginRight: '4px' }}></i>
              Sincronize sempre que alterar convidados ou mesas.
            </p>
            <button type="button" className="btn btn-secondary" style={{ marginBottom: '12px' }} onClick={handleSyncQr} disabled={qrSyncing}>
              {qrSyncing
                ? <><i className="fas fa-circle-notch fa-spin" style={{ marginRight: '6px' }}></i>Sincronizando...</>
                : <><i className="fas fa-sync-alt" style={{ marginRight: '6px' }}></i>Sincronizar Dados</>
              }
            </button>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
