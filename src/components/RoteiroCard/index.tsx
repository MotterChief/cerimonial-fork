'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/Modal';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import ObservationEditor from '@/components/ObservationEditor'; // Import the new component
import Switcher from '@/components/fields/Switcher';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { useDemoGuard } from '@/utils/useDemoGuard';
import { 
  updateRoteiro, 
  deleteRoteiroAndItsItems, 
  addRoteiroItem, 
  getRoteiroItems, 
  RoteiroItem,
  updateRoteiroItem,
  deleteRoteiroItem,
  Observation
} from '@/services/script.service';

interface RoteiroCardProps {
  script: {
    id: string;
    name: string;
  };
  eventDate: string;
  onUpdate: () => void;
}

const RoteiroCard: React.FC<RoteiroCardProps> = ({ script, eventDate, onUpdate }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const guard = useDemoGuard();
  
  // Roteiro Modals State
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isAddItemModalOpen, setAddItemModalOpen] = useState(false);

  // Roteiro Item Modals State
  const [isEditItemModalOpen, setEditItemModalOpen] = useState(false);
  const [isDeleteItemModalOpen, setDeleteItemModalOpen] = useState(false);
  
  // Roteiro State
  const [editedName, setEditedName] = useState(script.name);
  const [items, setItems] = useState<RoteiroItem[]>([]);
  
  // Roteiro Item State
  const [selectedItem, setSelectedItem] = useState<RoteiroItem | null>(null);
  const [editedItemTime, setEditedItemTime] = useState('');
  const [editedItemDescription, setEditedItemDescription] = useState('');
  const [editedItemIsNextDay, setEditedItemIsNextDay] = useState(false);
  const [newItemTime, setNewItemTime] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemIsNextDay, setNewItemIsNextDay] = useState(false);
  const [currentObservations, setCurrentObservations] = useState<Observation[]>([]);

  const refreshItems = useCallback(async () => {
    if (!user) return;
    try {
      const fetchedItems = await getRoteiroItems(user.uid, script.id);
      setItems(fetchedItems);
    } catch (error) {
      console.error("Failed to fetch script items:", error);
      addNotification("Falha ao recarregar os itens do roteiro.", 'error');
    }
  }, [user, script.id, addNotification]);

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  // Roteiro Handlers
  const handleEditRoteiro = async () => {
    if (!user) return;
    await guard(async () => {
      try {
        await updateRoteiro(user.uid, script.id, { name: editedName });
        onUpdate();
        setEditModalOpen(false);
        addNotification("Roteiro atualizado com sucesso!", 'success');
      } catch (error) {
        console.error("Failed to edit script:", error);
        addNotification("Falha ao editar o roteiro.", 'error');
      }
    });
  };

  const handleDeleteRoteiro = async () => {
    if (!user) return;
    await guard(async () => {
      try {
        await deleteRoteiroAndItsItems(user.uid, script.id);
        onUpdate();
        setDeleteModalOpen(false);
        addNotification("Roteiro excluído com sucesso!", 'success');
      } catch (error) {
        console.error("Failed to delete script:", error);
        addNotification("Falha ao excluído o roteiro.", 'error');
      }
    });
  };

  // Roteiro Item Handlers
  const handleAddItem = async () => {
    if (!user || !newItemTime || !newItemDescription) {
      addNotification("Por favor, preencha todos os campos.", 'warning');
      return;
    }

    const hasInvalidObservation = currentObservations.some(obs => !obs.key || !obs.value);

    if (hasInvalidObservation) {
      addNotification("Por favor, preencha todos os campos de chave e valor para todas as observações adicionadas.", 'warning');
      return;
    }

    await guard(async () => {
      try {
        await addRoteiroItem(user.uid, {
          roteiroId: script.id,
          time: newItemTime,
          description: newItemDescription,
          Observations: currentObservations,
          isNextDay: newItemIsNextDay
        });
        setNewItemTime('');
        setNewItemDescription('');
        setNewItemIsNextDay(false);
        setCurrentObservations([]);
        refreshItems();
        setAddItemModalOpen(false);
        addNotification("Item adicionado ao roteiro com sucesso!", 'success');
      } catch (error) {
        console.error("Failed to add script item:", error);
        addNotification("Falha ao adicionar o item ao roteiro.", 'error');
      }
    });
  };

  const handleOpenEditItemModal = (item: RoteiroItem) => {
    setSelectedItem(item);
    setEditedItemTime(item.time);
    setEditedItemDescription(item.description);
    setEditedItemIsNextDay(item.isNextDay || false);
    setCurrentObservations(item.Observations || []);
    setEditItemModalOpen(true);
  };

  const handleUpdateItem = async () => {
    if (!user || !selectedItem) return;
    
    const hasInvalidObservation = currentObservations.some(obs => !obs.key || !obs.value);

    if (hasInvalidObservation) {
      addNotification("Por favor, preencha todos os campos de chave e valor para todas as observações adicionadas.", 'warning');
      return;
    }

    await guard(async () => {
      try {
        await updateRoteiroItem(user.uid, selectedItem.id, {
          time: editedItemTime,
          description: editedItemDescription,
          Observations: currentObservations,
          isNextDay: editedItemIsNextDay
        });
        refreshItems();
        setEditItemModalOpen(false);
        setSelectedItem(null);
        setCurrentObservations([]);
        addNotification("Item do roteiro atualizado com sucesso!", 'success');
      } catch (error) {
        console.error("Failed to update script item:", error);
        addNotification("Falha ao atualizar o item do roteiro.", 'error');
      }
    });
  };

  const handleOpenDeleteItemModal = (item: RoteiroItem) => {
    setSelectedItem(item);
    setDeleteItemModalOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!user || !selectedItem) return;
    await guard(async () => {
      try {
        await deleteRoteiroItem(user.uid, selectedItem.id);
        refreshItems();
        setDeleteItemModalOpen(false);
        setSelectedItem(null);
        addNotification("Item do roteiro excluído com sucesso!", 'success');
      } catch (error) {
        console.error("Failed to delete script item:", error);
        addNotification("Falha ao deletar o item do roteiro.", 'error');
      }
    });
  };

  const getSituationItem = (eventDate: string, itemTime: string, isNextDay?: boolean): string => {
    if (!eventDate || !itemTime) {
      return '';
    }

    let year, month, day;
    
    if (eventDate.includes('-')) { // Assume YYYY-MM-DD
      [year, month, day] = eventDate.split('-').map(Number);
    } else if (eventDate.includes('/')) { // Assume DD/MM/YYYY
      [day, month, year] = eventDate.split('/').map(Number);
    } else {
      return '';
    }

    const [hours, minutes] = itemTime.split(':').map(Number);

    if (!year || !month || !day || isNaN(hours) || isNaN(minutes)) {
      return '';
    }

    const itemDateTime = new Date(year, month - 1, day, hours, minutes);
    if (isNextDay) {
      itemDateTime.setDate(itemDateTime.getDate() + 1);
    }
    const now = new Date();

    return itemDateTime <= now ? 'situation-past' : '';
  };

  return (
    <>
      <div className="card">
        <div className="scripts-card-header">
          <h3>
            <i className="fas fa-scroll"></i>
            {script.name}
          </h3>
          <div style={{ textWrap: 'nowrap', marginBottom: 20 }}>
            <button onClick={() => setEditModalOpen(true)} className="btn-edit-icon">
              <i className="fas fa-edit"></i>
            </button>
            <button onClick={() => setDeleteModalOpen(true)} className="btn-delete-icon">
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div className="timeline-container" style={{ maxHeight: 600, overflow: 'auto', marginBottom: 10 }}>
          {items.map(item => (
            <div key={item.id} className={`timeline-item-wrapper ${getSituationItem(eventDate, item.time, item.isNextDay)}`}>
              <div className="timeline-dot"></div>
              <div className="supplier-card roteiro-item">
                <div>
                  <div className="roteiro-item-header">
                    <span>{item.time} - {item.description}</span>
                    <div style={{ textWrap: 'nowrap'}}>
                      <button className="btn-edit-icon" onClick={() => handleOpenEditItemModal(item)}><i className="fas fa-edit"></i></button>
                      <button className="btn-delete-icon" onClick={() => handleOpenDeleteItemModal(item)}><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                  {item.Observations && item.Observations.length > 0 && (
                    <div>
                      {item.Observations.map((obs, index) => (
                        <div key={index} style={{ marginBottom:"3px" }}>
                          <strong>{obs.key}:</strong> {obs.value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
            <button onClick={() => { setAddItemModalOpen(true); setCurrentObservations([]); }} className="btn">
                <i className="fas fa-plus-circle"></i>
                Adicionar Item
            </button>
        </div>
      </div>

      {/* Roteiro modals */}
      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Roteiro">
        <div className="form-group">
          <label htmlFor="roteiroName">Nome do Roteiro:</label>
          <input
            id="roteiroName"
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        </div>
        <button onClick={handleEditRoteiro} className="btn">Salvar</button>
      </Modal>

      <ConfirmActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteRoteiro}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o roteiro "${script.name}"?`}
      />

      <Modal 
        isOpen={isAddItemModalOpen} 
        onClose={() => {
          setAddItemModalOpen(false);
          setCurrentObservations([]);
          setNewItemIsNextDay(false);
        }} 
        title="Adicionar Item ao Roteiro"
        nameSaveBtn="Adicionar"
        handleSave={handleAddItem}
      >
        <Switcher
          label="Este evento ocorre após meia-noite?"
          value={newItemIsNextDay}
          onChange={setNewItemIsNextDay}
        />
        <div className="form-group">
          <label htmlFor="itemTime">Hora:</label>
          <input
            id="itemTime"
            type="time"
            value={newItemTime}
            onChange={(e) => setNewItemTime(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="itemDescription">Descrição:</label>
          <input
            id="itemDescription"
            type="text"
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.target.value)}
            placeholder="Ex: Entrada da noiva"
          />
        </div>
        <ObservationEditor observations={currentObservations} onChange={setCurrentObservations} />
      </Modal>

      {/* Itens modals */}
      <Modal 
        isOpen={isEditItemModalOpen} 
        onClose={() => {
          setEditItemModalOpen(false);
          setSelectedItem(null);
          setCurrentObservations([]);
          setEditedItemIsNextDay(false);
        }} 
        title="Editar Item do Roteiro"
        handleSave={handleUpdateItem}
      >
        <Switcher
          label="Este evento ocorre após meia-noite?"
          value={editedItemIsNextDay}
          onChange={setEditedItemIsNextDay}
        />
        <div className="form-group">
          <label htmlFor="editedItemTime">Hora:</label>
          <input
            id="editedItemTime"
            type="time"
            value={editedItemTime}
            onChange={(e) => setEditedItemTime(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="editedItemDescription">Descrição do Evento:</label>
          <input
            id="editedItemDescription"
            type="text"
            value={editedItemDescription}
            onChange={(e) => setEditedItemDescription(e.target.value)}
          />
        </div>
        <ObservationEditor observations={currentObservations} onChange={setCurrentObservations} />
      </Modal>

      <ConfirmActionModal
        isOpen={isDeleteItemModalOpen}
        onClose={() => {
          setDeleteItemModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteItem}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o item "${selectedItem?.description}"?`}
      />
    </>
  );
};

export default RoteiroCard;