'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getEvents, Event } from '@/services/event.service';
import CustomSelect from '@/components/Select';
import { createRoteiro, getRoteirosByEvent } from '@/services/script.service';
import RoteiroCard from '@/components/RoteiroCard';
import ExpandableCard from '@/components/ExpandableCard';
import { Timestamp } from 'firebase/firestore';
import { AbstractEntity } from '@/entities/abstract.entity';
import HeaderHelper from '@/components/HeaderHelper';
import { useNotification } from '@/context/NotificationContext';

interface Roteiro extends AbstractEntity {
  id: string;
  eventId: string;
  name: string;
  createdAt: Timestamp;
}

export default function RoteirosPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setSelectedEventId] = useState<string | null>(null);
  const [scripts, setScripts] = useState<Roteiro[]>([]);
  const [name, setName] = useState('');

  const eventOptions = events.map(event => ({ value: event.id, label: event.eventName }));
  const selectedEvent = events.find(event => event.id === eventId);
  const eventDate = selectedEvent ? selectedEvent.eventDate : ''; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.uid) {
        addNotification('Usuário não autenticado.', 'error');
        return;
    }
    if (!eventId) {
        addNotification('Por favor, selecione um evento para criar um roteiro.', 'warning');
        return;
    }
    if (!name) {
      addNotification('Por favor, preencha o nome do roteiro para criá-lo.', 'warning');
      return;
    }
    try {
      await createRoteiro(user.uid, {
        eventId,
        name
      });
      setName(''); 
      refreshScripts();
      addNotification('Roteiro criado com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to add script:', error);
      addNotification('Erro ao adicionar roteiro.', 'error');
    }
  };

  const refreshScripts = useCallback(async () => {
    if (!user || !eventId) {
      setScripts([]);
      return;
    }
    try {
      const scripts = await getRoteirosByEvent(user.uid, eventId);
      setScripts(scripts);
    } catch (error) {
      console.error('Failed to update script:', error);
      addNotification('Falha ao carregar os roteiros.', 'error');
    }
  }, [user, eventId, addNotification]);

  useEffect(() => {
    refreshScripts();
  }, [refreshScripts]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      try {
        const userEvents = await getEvents(user.uid);
        setEvents(userEvents);
      } catch (error) {
        console.error('Failed to find event:', error);
        addNotification('Falha ao carregar os eventos.', 'error');
      }
    };

    fetchEvents();
  }, [user, addNotification]);

  const getDefaultMessage = () => {
    if (!eventId) {
      return 'Selecione um evento para ver os roteiros associados.';
    }
    return 'Nenhum roteiro foi adicionado para este evento ainda.';
  }

  return (
    <>
      <HeaderHelper>Gerencie aqui os roteiros dos eventos. <br></br> Selecione um evento para criar, editar ou visualizar roteiros existentes.</HeaderHelper>
      <div className="card card-background">
        <div className="filters-top">
          <h3><i className="fas fa-calendar-alt"></i> Selecione um Evento</h3>
            <CustomSelect
              instanceId="event-select-page"
              options={eventOptions}
              onChange={(option) => setSelectedEventId(option ? option.value : null)}
              placeholder="Selecione um evento para ver e editar os checklists"
              isClearable
            />
        </div>
        <ExpandableCard title="Criar Roteiro" iconName="fas fa-plus-circle" marginBottom={true}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nome do Roteiro:</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Roteiro da Cerimônia" disabled={!eventId} required></input>
            </div>
            <button type="submit" className="btn">
              <i className="fas fa-plus-circle"></i>
              Criar Roteiro
            </button>
          </form>
        </ExpandableCard>
        <div className="grid grid-1">
          {scripts.length > 0 ? (
            scripts.map((script) => {
              return <RoteiroCard key={script.id} script={script} onUpdate={refreshScripts} eventDate={eventDate} />;
            })
          ) : (
            <h4 className="query-message">{ getDefaultMessage() }</h4>
          )}
        </div>
      </div>
    </>
  );
}
