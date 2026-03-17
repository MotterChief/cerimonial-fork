'use client';

import React, { useState } from 'react';
import { ChecklistItem, updateChecklistItemStatus, deleteChecklistItem } from '@/services/checklist.service';
import ConfirmActionModal from '../ConfirmActionModal';
import { CHECKLIST_PERIODS, periodNameByKey } from '@/app/checklists/checklist.config';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

interface ChecklistDisplayProps {
  items: ChecklistItem[];
  onItemUpdate: () => void;
}

const ChecklistDisplay: React.FC<ChecklistDisplayProps> = ({ items, onItemUpdate}) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const { addNotification } = useNotification();


  const handleStatusChange = async (itemId: string, currentStatus: boolean) => {
    if (user && !user.uid || !user) return;
    try {
      await updateChecklistItemStatus(user.uid, itemId, !currentStatus);
      onItemUpdate();
    } catch (error) {
      console.error('Failed to update item status:', error);
      addNotification('Erro ao atualizar a tarefa.', 'error');
    }
  };

  const handleDeleteClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItemId || (user && !user.uid || !user)) return;
    try {
      await deleteChecklistItem(user.uid, selectedItemId);
      onItemUpdate();
      setIsModalOpen(false);
      setSelectedItemId(null);
      addNotification('Tarefa excluída com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to delete item:', error);
      addNotification('Erro ao deletar a tarefa.', 'error');
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    const periodName = periodNameByKey[item.period] || 'Sem período';
    if (!acc[periodName]) {
      acc[periodName] = [];
    }
    acc[periodName].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);



  const sortedPeriods = CHECKLIST_PERIODS
    .filter(p => groupedItems[p.name]) // Only include periods that have items
    .sort((a, b) => b.key - a.key ); // Sort by the numeric key

  if (items.length === 0) {
    return <h4 className="query-message">Nenhum checklist foi adicionado para este evento ainda.</h4>;
  }

  return (
    <>
      <div className="grid grid-2">
        {sortedPeriods.map((period) => {
          const periodItems = groupedItems[period.name];
          return (
            <div key={period.key} className="card card-checklist">
              <h3>
                <i className={`${period.icon || 'fas fa-tasks'}`}></i>
                {period.name}
              </h3>
              <div>
                {periodItems.map((item) => (
                  <div key={item.id} className={`checklist-item ${item.completed ? 'completed' : ''}`} onClick={() => handleStatusChange(item.id, item.completed)}>
                    <input
                      type="checkbox"
                      id={`item-${item.id}`}
                      checked={item.completed}
                      onChange={() => {}}
                    />
                    <label htmlFor={`item-${item.id}`} style={{ marginLeft: '10px', cursor: 'pointer', width: '100%' }}>
                      {item.title}
                    </label>
                    <button className="btn-delete-icon" onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(item.id);
                    }}><i className="fas fa-trash"></i></button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <ConfirmActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Tem certeza que deseja excluir este item do checklist?"
      />
    </>
  );
};

export default ChecklistDisplay;