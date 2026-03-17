'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getClients } from '@/services/client.service';
import { addEvent, getEvents, updateEvent, Event } from '@/services/event.service';
import { ActionMeta, SingleValue, MultiValue } from 'react-select';
import CustomSelect from '@/components/Select';
import Modal from '@/components/Modal';
import HeaderHelper from '@/components/HeaderHelper';
import { useNotification } from '@/context/NotificationContext';
import ExpandableCard from '@/components/ExpandableCard';
import { useIsMobile } from '@/utils/window.utils';
import CustomDatePicker from '@/components/fields/DatePicker';
import { toDate, createLocalDate } from '@/utils/date.utils';
import { getBorderCardStyle, getSituationStyle } from '@/utils/situationStyles.utils';

interface Client {
  id: string;
  name: string;
}

interface ClientOption {
  value: string;
  label: string;
}

interface StatusOption {
  value: string;
  label: string;
}

export default function AgendaPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [events, setEvents] = useState<Event[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const initialFormState = { eventName: '', eventDate: '', location: '', clientId: '', status: 'planejamento' };
  const [newEvent, setNewEvent] = useState(initialFormState);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions: StatusOption[] = [
    { value: 'planejamento', label: 'Planejamento' },
    { value: 'execucao', label: 'Em Execução' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [userClients, userEvents] = await Promise.all([ getClients(user.uid), getEvents(user.uid) ]);
      setClients(userClients as Client[]);
      setEvents(userEvents);
    } catch (error) {
      addNotification((error as Error).message, 'error');
    }
    setLoading(false);
  };

  useEffect(() => { 
    if (user) {
      fetchData(); 
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [id]: value }));
  };

  const handleClientChange = (newValue: SingleValue<ClientOption> | MultiValue<ClientOption>, actionMeta: ActionMeta<ClientOption>) => {
    const singleValue = newValue as SingleValue<ClientOption>;
    setNewEvent((prev) => ({ ...prev, clientId: singleValue ? singleValue.value : '' }));
  };

  const handleStatusChange = (newValue: SingleValue<StatusOption> | MultiValue<StatusOption>, actionMeta: ActionMeta<StatusOption>) => {
    const singleValue = newValue as SingleValue<StatusOption>;
    if (singleValue) {
      setNewEvent((prev) => ({ ...prev, status: singleValue.value }));
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newEvent.clientId) { 
      addNotification('Por favor, selecione um cliente.', 'warning'); 
      return; 
    }
    try {
      await addEvent(user.uid, newEvent);
      setNewEvent(initialFormState);
      await fetchData();
      addNotification('Evento adicionado com sucesso!', 'success');
    } catch (error) {
      addNotification((error as Error).message, 'error');
    }
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingEvent) return;
    try {
      const { id, ...eventData } = editingEvent;
      await updateEvent(user.uid, id, eventData);
      setIsEditModalOpen(false);
      setEditingEvent(null);
      await fetchData();
      addNotification('Evento atualizado com sucesso!', 'success');
    } catch (error) {
      addNotification((error as Error).message, 'error');
    }
  };

  const handleEditClientChange = (newValue: SingleValue<ClientOption> | MultiValue<ClientOption>, actionMeta: ActionMeta<ClientOption>) => {
    if (editingEvent) {
      const singleValue = newValue as SingleValue<ClientOption>;
      setEditingEvent({ ...editingEvent, clientId: singleValue ? singleValue.value : '' });
    }
  };

  const handleEditStatusChange = (newValue: SingleValue<StatusOption> | MultiValue<StatusOption>, actionMeta: ActionMeta<StatusOption>) => {
    if (editingEvent) {
      const singleValue = newValue as SingleValue<StatusOption>;
      if (singleValue) {
        setEditingEvent({ ...editingEvent, status: singleValue.value });
      }
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  const getDefaultMessage = () => {
    return 'Não há próximos eventos a serem exibidos.';
  }

  // Filtra os eventos baseado no searchTerm
  const filteredEvents = events.filter(event => 
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Traz apenas os eventos futuros e ordena pela data mais recente
  const comingEvents = filteredEvents.filter(event => {
    const eventDate = createLocalDate(event.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
    return eventDate ? eventDate >= today : false
  }).sort((a, b) => {
    const dateA = createLocalDate(a.eventDate)?.getTime();
    const dateB = createLocalDate(b.eventDate)?.getTime();
    return dateA && dateB ? dateA - dateB : 0;
  });

  const clientOptions: ClientOption[] = clients.map(client => ({ value: client.id, label: client.name }));

  return (
    <>
      <HeaderHelper>Cadastre aqui seus próximos eventos. <br></br> Eles servirão como base para vincular informações de outras áreas.</HeaderHelper>
      <div className="grid grid-2">
        <ExpandableCard title="Novo Evento" iconName="fas fa-calendar-plus" marginBottom={ !useIsMobile() }>
          <form onSubmit={handleAddEvent}>
            <div className="form-group">
              <label htmlFor="eventName">Nome do Evento:</label>
              <input type="text" id="eventName" value={newEvent.eventName} onChange={handleInputChange} placeholder="Ex: Casamento João & Maria" required />
            </div>
            <div className="form-group">
              <label htmlFor="clientId">Cliente:</label>
              <CustomSelect id="clientId" options={clientOptions} value={clientOptions.find(o => o.value === newEvent.clientId)} onChange={handleClientChange} placeholder="Buscar cliente..." isClearable required />
            </div>
            <div className="form-group">
              <label htmlFor="eventDate">Data do Evento:</label>
              <CustomDatePicker
                id="eventDate"
                selected={newEvent.eventDate}
                onChange={(date: Date | null) => setNewEvent(prev => ({ ...prev, eventDate: date ? toDate(date) : '' }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Local:</label>
              <input type="text" id="location" value={newEvent.location} onChange={handleInputChange} placeholder="Local da cerimônia" />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status:</label>
              <CustomSelect id="status" options={statusOptions} value={statusOptions.find(o => o.value === newEvent.status)} onChange={handleStatusChange} isSearchable={false} />
            </div>
            <button type="submit" className="btn"><i className="fas fa-plus"></i> Criar Evento</button>
          </form>
        </ExpandableCard>

        <ExpandableCard title="Meus Eventos" iconName="fas fa-list" marginBottom={ true } listLength={filteredEvents.length} customClass="card-consult-expandable" isFlexContent={true}>
          <div className="form-group">
            <input 
              type="text"
              placeholder="Buscar por nome de eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="list-container">
            {loading ? <p>Carregando...</p> : filteredEvents.length > 0 ? (
              <div>
                {filteredEvents.map(event => (
                  <div key={event.id} className="supplier-card">
                    <h4>{event.eventName}</h4>
                    <p><i className="fas fa-user"></i> <strong>Cliente:</strong> {getClientName(event.clientId)}</p>
                    <p><i className="fas fa-calendar"></i> {new Date(event.eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                    <p><i className="fas fa-map-marker-alt"></i> {event.location}</p>
                    <p><strong>Status:</strong> <span className={`status-badge status-${event.status}`}>{event.status}</span></p>
                    <div style={{ marginTop: '10px' }}>
                      <button onClick={() => openEditModal(event)} className="btn btn-secondary"><i className="fas fa-edit"></i> Editar</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p>Nenhum evento cadastrado.</p>}
          </div>
        </ExpandableCard>
      </div>

      <div className="card card-inferior">
          <h3><i className="fas fa-calendar-check"></i> Próximos Eventos <span className="counter">{comingEvents.length} encontrados</span></h3>
          <div className="form-group">
            <input 
              type="text"
              placeholder="Buscar por nome de eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="list-container">
            {loading ? <p>Carregando...</p> : comingEvents.length > 0 ? (
              <div>
                {comingEvents.map(event => (
                  <div key={event.id} className="supplier-card" style={ getBorderCardStyle(event.status,"concluido","planejamento","execucao","cancelado") }>
                    <h4>{event.eventName}</h4>
                    <p><i className="fas fa-user"></i> <strong>Cliente:</strong> {getClientName(event.clientId)}</p>
                    <p><i className="fas fa-calendar"></i> {new Date(event.eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                    <p><i className="fas fa-map-marker-alt"></i> {event.location}</p>
                    <p className="status-badge" style={ getSituationStyle(event.status,"concluido","planejamento","execucao","cancelado") }>{event.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <h4 className="query-message">{ getDefaultMessage() }</h4>
            )}
          </div>
        </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Evento" formId="editing-event">
        {editingEvent && (
          <form id="editing-event" onSubmit={handleUpdateEvent}>
            <div className="form-group">
              <label>Nome do Evento:</label>
              <input type="text" value={editingEvent.eventName} onChange={(e) => setEditingEvent({...editingEvent, eventName: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Cliente:</label>
              <CustomSelect options={clientOptions} value={clientOptions.find(o => o.value === editingEvent.clientId)} onChange={handleEditClientChange} required />
            </div>
            <div className="form-group">
              <label>Data do Evento:</label>
              <CustomDatePicker
                selected={editingEvent.eventDate}
                onChange={(date: Date | null) => setEditingEvent({...editingEvent, eventDate: date ? toDate(date) : ''})}
                required
              />
            </div>
            <div className="form-group">
              <label>Local:</label>
              <input type="text" value={editingEvent.location} onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <CustomSelect options={statusOptions} value={statusOptions.find(o => o.value === editingEvent.status)} onChange={handleEditStatusChange} isSearchable={false} />
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
