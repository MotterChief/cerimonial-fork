'use client';

import React, { useState } from 'react';
import { addChecklistItem } from '@/services/checklist.service';
import CustomSelect from '@/components/Select';
import { checklistFormOptions } from '@/app/checklists/checklist.config';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

interface ChecklistFormProps {
  eventId: string | null;
  onItemAdded: () => void;
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({ eventId, onItemAdded}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ( user && !user.uid || !user) {
        addNotification('Usuário não autenticado.', 'error');
        return;
    }
    if (!eventId) {
        addNotification('Por favor, selecione um evento para adicionar uma tarefa ao checklist.', 'warning');
        return;
    }
    if (!title || !period) {
      addNotification('Por favor, preencha o título e selecione o período.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await addChecklistItem(user.uid, {
        eventId,
        title,
        period,
        completed: false,
      });
      setTitle('');
      setPeriod(null); 
      onItemAdded();
      addNotification('Tarefa adicionada ao checklist com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to add checklist item:', error);
      addNotification('Erro ao adicionar item!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-2">
        <div className="form-group">
          <label htmlFor="title">Título da Tarefa:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!eventId}
            placeholder="Ex: Contratar fotógrafo"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="period">Período:</label>
          <CustomSelect
            instanceId="period-select-form"
            options={checklistFormOptions}
            value={checklistFormOptions.find(p => p.value === period) || null}
            onChange={(option) => setPeriod(option ? option.value : null)}
            isDisabled={!eventId}
            placeholder="Selecione o período"
            required
          />
        </div>
      </div>
      <button type="submit" className="btn" disabled={isSubmitting}>
        <i className="fas fa-plus-circle"></i>
        {isSubmitting ? 'Adicionando...' : 'Adicionar Tarefa'}
      </button>
    </form>
  );
};

export default ChecklistForm;