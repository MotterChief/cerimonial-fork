'use client';

import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addDocument, getDocuments, updateDocument, deleteDocument, Document } from '@/services/document.service';
import { getEvents  } from '@/services/event.service';
import Modal from '@/components/Modal';
import CustomSelect from '@/components/Select';
import { AbstractEntity } from '@/entities/abstract.entity';
import HeaderHelper from '@/components/HeaderHelper';
import { useNotification } from '@/context/NotificationContext';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import ExpandableCard from '@/components/ExpandableCard';
import { useIsMobile } from '@/utils/window.utils';
import CurrencyInput from '@/components/fields/CurrencyInput';
import CustomDatePicker from '@/components/fields/DatePicker';
import { createLocalDate, toDate } from '@/utils/date.utils';
import { SingleValue } from 'react-select';
import { getBorderCardStyle, getSituationStyle } from '@/utils/situationStyles.utils';
import { formatCurrency } from '@/utils/currency.utils';
import TextArea from '@/components/fields/TextArea';
import { useDemoGuard } from '@/utils/useDemoGuard';

interface ContractTypeOptions {
  value: string;
  label: string;
}

interface SituationOptions {
  value: string;
  label: string;
}

interface Event {
  id: string;
  eventName: string;
}

export default function DocumentosPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const guard = useDemoGuard();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('');

  const initialFormState = { name: '', type: 'cerimonial', value: '', date: '', term: '', situation: 'pendente', notes: '' };
  const [newDocument, setNewDocument] = useState(initialFormState);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userDocuments = await getDocuments(user.uid) as Document[];
      setDocuments(userDocuments);
    } catch (error) {
      console.error('Failed to find documents!', error);
      addNotification('Falha ao carregar documentos!', 'error');
    }
    setLoading(false);
  }, [user, addNotification]);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      const userEvents = await getEvents(user.uid) as Event[];
      setEvents(userEvents);
    } catch (error) {
      console.error('Failed to find events!', error);
      addNotification('Falha ao carregar eventos!', 'error');
    }
  }, [user, addNotification]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchEvents();
    }
  }, [user, fetchDocuments, fetchEvents]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (editingDocument) {
      setEditingDocument({ ...editingDocument, [id]: value });
    } else {
      setNewDocument((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSelectChange = (selectedOption: SingleValue<{ value: string; label: string; }>, id: string) => {
    const value = selectedOption ? selectedOption.value : '';
    if (editingDocument) {
      setEditingDocument({ ...editingDocument, [id]: value });
    } else {
      setNewDocument((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleAddDocument = async (e: FormEvent) => {
    e.preventDefault();
    if (!user){
      addNotification('Usuário não autenticado.', 'error');
      return;
    }
    if (!selectedEvent) {
      addNotification('Por favor, selecione um evento para salvar o documento.', 'warning');
      return;
    }
    await guard(async () => {
      try {
        await addDocument(user.uid, { ...newDocument, event: selectedEvent });
        setNewDocument(initialFormState);
        fetchDocuments();
        addNotification('Documento adicionado com sucesso!', 'success');
      } catch (error) {
        console.error('Failed to add document!', error);
        addNotification('Falha ao adicionar documento!', 'error');
      }
    });
  };

  const handleDeleteRequest = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !documentToDelete) return;
    await guard(async () => {
      try {
        await deleteDocument(user.uid, documentToDelete.id);
        fetchDocuments();
        addNotification('Documento excluído com sucesso!', 'success');
      } catch (error) {
        console.error('Failed to delete document!', error);
        addNotification('Falha ao excluir documento!', 'error');
      } finally {
        setDeleteModalOpen(false);
        setDocumentToDelete(null);
      }
    });
  };

  const openEditModal = (document: Document) => {
    setEditingDocument(document);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditingDocument(null);
  };

  const handleUpdateDocument = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !editingDocument) return;
    await guard(async () => {
      try {
        const { id, ...documentData } = editingDocument;
        await updateDocument(user.uid, id, documentData);
        closeEditModal();
        fetchDocuments();
        addNotification('Documento atualizado com sucesso!', 'success');
      } catch (error) {
        console.error('Failed to update document!', error);
        addNotification('Falha ao atualizar documento!', 'error');
      }
    });
  };

  const filteredDocuments = selectedEvent
    ? documents.filter(doc => doc.event === selectedEvent)
    : [];

    // Filtra os documentos baseado no searchTerm
  const filteredDocumentsTerm = filteredDocuments.filter(document => 
    document.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const contractTypeOptions: ContractTypeOptions[] = [
    { value: 'cerimonial', label: 'Contrato de Cerimonial' },
    { value: 'fornecedor', label: 'Contrato de Fornecedor' },
    { value: 'aditivo', label: 'Aditivo Contratual' },
  ];

  const situationOptions: SituationOptions[] = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'assinado', label: 'Assinado' },
    { value: 'execucao', label: 'Em Execução' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  const eventOptions = events.map(event => ({ value: event.id, label: event.eventName  }));

  const getLabelType = (type: string) => {
    const option = contractTypeOptions.find(o => o.value === type);
    return option ? option.label : 'Não especificado';
  }

  const getDefaultMessage = () => {
    if (!selectedEvent) {
      return 'Selecione um evento para ver os documentos associados.';
    }
    return 'Nenhum documento foi adicionado para este evento ainda.';
  }

  return (
    <>
      <HeaderHelper>Gerencie aqui os documentos e contratos dos seus eventos. <br></br> Realize o vínculo com eventos para acompanhar pendências e status.</HeaderHelper>
      <div className="card card-background">
        <div className="filters-top">
          <h3><i className="fas fa-calendar-alt"></i> Selecione um Evento</h3>
          <CustomSelect id="filter-events" options={eventOptions} value={eventOptions.find(o => o.value === selectedEvent)} onChange={(selectedOption) => setSelectedEvent(selectedOption ? selectedOption.value : '')} className="filter-top" placeholder="Selecione um evento para ver e editar os documentos" isClearable required />
        </div>
        <div className="grid grid-2">
          <ExpandableCard title="Novo Contrato" iconName="fas fa-signature" marginBottom={ !useIsMobile() }>
            <form onSubmit={handleAddDocument}>
              <div className="form-group">
                <label htmlFor="type">Tipo de Contrato:</label>
                <CustomSelect
                  id="type"
                  options={contractTypeOptions}
                  value={contractTypeOptions.find(o => o.value === newDocument.type)}
                  onChange={(selectedOption) => handleSelectChange(selectedOption, 'type')}
                  isSearchable={false}
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Nome do Contrato:</label>
                <input id="name" value={newDocument.name} onChange={handleInputChange} placeholder="Ex: Casamento - João e Maria" required />
              </div>
              <div className="form-group">
                <label htmlFor="value">Valor do Contrato:</label>
              <CurrencyInput
                id="value"
                value={newDocument.value || 0}
                onChange={(value) => setNewDocument(prev => ({ ...prev, value: String(value) }))}
                placeholder="R$ 5.000,00"
                required
              />
              </div>
              <div className="form-group">
                <label htmlFor="date">Data de Início:</label>
                <CustomDatePicker
                  id="date"
                  selected={newDocument.date}
                  onChange={(date: Date | null) => setNewDocument(prev => ({ ...prev, date: date ? toDate(date) : '' }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="term">Prazo (meses):</label>
                <input type="number" id="term" value={newDocument.term} onChange={handleInputChange} placeholder="00" required />
              </div>
              <div className="form-group">
                <label htmlFor="situation">Situação:</label>
                <CustomSelect
                  id="situation"
                  options={situationOptions}
                  value={situationOptions.find(o => o.value === newDocument.situation)}
                  onChange={(selectedOption) => handleSelectChange(selectedOption, 'situation')}
                  isSearchable={false}
                />
              </div>
              <div className="form-group">
                <label htmlFor="notes">Observações especiais</label>
                <TextArea id="notes" value={newDocument.notes} onChange={handleInputChange} placeholder="Cláusulas especiais, condições específicas..." rows={3} maxLength={100} />
              </div>
              <button type="submit" className="btn">
                <i className="fas fa-save"></i> Gerar Contrato
              </button>
            </form>
          </ExpandableCard>
          <ExpandableCard title="Modelos de Contratos" iconName="fas fa-file-contract" marginBottom={true}>
            <div>
              <h4 className='helper-message'>Em breve, você poderá gerenciar os seus modelos de contratos aqui.</h4>
            </div>
          </ExpandableCard>
        </div>
        <div className="card card-inferior">
          <h3><i className="fas fa-folder-open"></i> Documentos do Evento Atual <span className="counter">{filteredDocumentsTerm.length} encontrados</span></h3>
          <div className="form-group">
            <input 
              type="text"
              placeholder="Buscar por nome do contrato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="list-container">
            {loading ? <p>Carregando...</p> : filteredDocumentsTerm.length > 0 ? (
              <div id="documentList">
                {filteredDocumentsTerm.map((document) => (
                  <div key={document.id} className="supplier-card" style={ getBorderCardStyle(document.situation, "assinado", "pendente", "execucao", "cancelado") }>
                    <div style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                      <h4>{document.name}</h4>
                      <div style={{ textWrap: 'nowrap'}}>
                        <button className="btn-edit-icon" onClick={() => openEditModal(document)}><i className="fas fa-edit"></i></button>
                        <button className="btn-delete-icon" onClick={() => handleDeleteRequest(document)}><i className="fas fa-trash"></i></button>
                      </div>
                    </div>
                    <p><i className="fas fa-file-alt"></i> {getLabelType(document.type)}</p>
                    <p><i className="fas fa-calendar"></i> {new Date(document.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                    <p><i className="fas fa-dollar-sign"></i> {formatCurrency(document.value)}</p>
                    <p className="status-badge" style={ getSituationStyle(document.situation, "assinado", "pendente", "execucao", "cancelado") }>{document.situation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <h4 className="query-message">{ getDefaultMessage() }</h4>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeEditModal} title="Editar Documento" formId="document-form">
        {editingDocument && (
          <form id="document-form" onSubmit={handleUpdateDocument}>
            <div className="form-group">
              <label htmlFor="type">Tipo de Contrato:</label>
              <CustomSelect
                id="type"
                options={contractTypeOptions}
                value={contractTypeOptions.find(o => o.value === editingDocument.type)}
                onChange={(selectedOption) => handleSelectChange(selectedOption, 'type')}
                isSearchable={false}
              />
            </div>
            <div className="form-group">
              <label htmlFor="name">Nome do Contrato:</label>
              <input id="name" value={editingDocument.name} onChange={handleInputChange} placeholder="Ex: Casamento - João e Maria" required />
            </div>
            <div className="form-group">
              <label htmlFor="value">Valor do Contrato:</label>
              <CurrencyInput
                id="value"
                value={editingDocument.value || 0}
                onChange={(value) => setEditingDocument(prev => ({ ...prev!, value: String(value) }))}
                placeholder="R$ 5.000,00"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="date">Data de Início:</label>
                <CustomDatePicker
                  id="date"
                  selected={editingDocument.date}
                  onChange={(date: Date | null) => setEditingDocument(prev => ({ ...prev!, date: date ? toDate(date) : '' }))}
                  required
                />
            </div>
            <div className="form-group">
              <label htmlFor="term">Prazo (meses):</label>
              <input type="number" id="term" value={editingDocument.term} onChange={handleInputChange} placeholder='00' required />
            </div>
            <div className="form-group">
              <label htmlFor="situation">Situação:</label>
              <CustomSelect
                id="situation"
                options={situationOptions}
                value={situationOptions.find(o => o.value === editingDocument.situation)}
                onChange={(selectedOption) => handleSelectChange(selectedOption, 'situation')}
                isSearchable={false}
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Observações especiais</label>
              <TextArea id="notes" value={editingDocument.notes ?? ''} onChange={handleInputChange} placeholder="Cláusulas especiais, condições específicas..." rows={3} maxLength={100} />
            </div>
          </form>
        )}
      </Modal>

      <ConfirmActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o documento "${documentToDelete?.name}"?`}
      />
    </>
  );
}
