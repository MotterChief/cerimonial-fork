'use client';

import React, { useState } from 'react';
import { addTemplate, ChecklistItem, ChecklistTemplate } from '@/services/checklist.service';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import TextArea from '@/components/fields/TextArea';

interface ChecklistTemplateFormProps {
  checklistItems: ChecklistItem[];
  templates: ChecklistTemplate[];
  onTemplateSaved: () => void;
}

const ChecklistTemplateForm: React.FC<ChecklistTemplateFormProps> = ({
  checklistItems,
  templates,
  onTemplateSaved,
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [name, setName] = useState('');
  const [position, setPosition] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addNotification('Usuário não autenticado.', 'error');
      return;
    }
    if (!name || !position) {
      addNotification('Preencha o nome e a posição do template.', 'warning');
      return;
    }
    if (checklistItems.length < 4) {
      addNotification('É necessário ter pelo menos 4 itens no checklist para criar um template.', 'warning');
      return;
    }

    const nameExists = templates.some(
      (t) => t.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (nameExists) {
      addNotification(`Já existe um template com o nome "${name}".`, 'warning');
      return;
    }

    const positionExists = templates.some((t) => t.position === Number(position));
    if (positionExists) {
      addNotification(`Já existe um template com a posição ${position}.`, 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const items = checklistItems.map((item) => ({
        title: item.title,
        period: item.period,
        completed: false as const,
      }));

      await addTemplate(user.uid, {
        name,
        position: Number(position),
        description,
        items,
      });

      setName('');
      setPosition('');
      setDescription('');
      onTemplateSaved();
      addNotification('Template salvo com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      addNotification('Erro ao salvar template.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-2">
        <div className="form-group">
          <label htmlFor="template-name">Nome:</label>
          <input
            id="template-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Casamento Padrão"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="template-position">Posição:</label>
          <input
            id="template-position"
            type="number"
            value={position}
            onChange={(e) => setPosition(e.target.value ? Number(e.target.value) : '')}
            placeholder="Ex: 1"
            min={1}
            required
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="template-description">Descrição:</label>
        <TextArea
          id="template-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descrição do template (máx. 100 caracteres)"
          maxLength={100}
          rows={2}
        />
      </div>
      <button type="submit" className="btn" disabled={isSubmitting}>
        <i className="fas fa-plus-circle"></i>
        {isSubmitting ? 'Salvando...' : 'Adicionar Template'}
      </button>
    </form>
  );
};

export default ChecklistTemplateForm;
