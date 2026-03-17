'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addClient, getClients, updateClient, deleteClient, Client } from '@/services/client.service';
import Modal from '@/components/Modal';
import HeaderHelper from '@/components/HeaderHelper';
import { useNotification } from '@/context/NotificationContext';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import ExpandableCard from '@/components/ExpandableCard';
import { useIsMobile } from '@/utils/window.utils';
import CurrencyInput from '@/components/fields/CurrencyInput';
import PhoneInput from '@/components/fields/PhoneInput';
import TextArea from '@/components/fields/TextArea';
import { applyPhoneMask } from '@/utils/phone.utils';
import { formatCurrency } from '@/utils/currency.utils';

export default function ClientesPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  const initialFormState = { name: '', phone: '', email: '', budget: 0, notes: '' };
  const [newClient, setNewClient] = useState(initialFormState);

  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // State for modal and editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const fetchClients = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userClients = await getClients(user.uid) as Client[];
      setClients(userClients);
    } catch (error) {
      addNotification((error as Error).message, 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewClient((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newClient.phone.trim() && !newClient.email.trim()) {
      addNotification('Por favor, preencha pelo menos o telefone ou o email do cliente para cadastrá-lo.', 'warning');
      return;
    }

    try {
      await addClient(user.uid, newClient);
      setNewClient(initialFormState);
      fetchClients();
      addNotification('Cliente adicionado com sucesso!', 'success');
    } catch (error) {
      addNotification((error as Error).message, 'error');
    }
  };

  const handleDeleteRequest = (client: Client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !clientToDelete) return;
    try {
      await deleteClient(user.uid, clientToDelete.id);
      fetchClients();
      addNotification('Cliente excluído com sucesso!', 'success');
    } catch (error) {
      addNotification((error as Error).message, 'error');
    } finally {
      setDeleteModalOpen(false);
      setClientToDelete(null);
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingClient) return;
    try {
      const { id, ...clientData } = editingClient;
      await updateClient(user.uid, id, clientData);
      setIsModalOpen(false);
      setEditingClient(null);
      fetchClients();
      addNotification('Cliente atualizado com sucesso!', 'success');
    } catch (error) {
      addNotification((error as Error).message, 'error');
    }
  };

  // Filtra os clientes baseado no searchTerm
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <HeaderHelper>Gerencie aqui seus clientes. <br></br>Vincule-os a eventos e utilize o orçamento para controle financeiro.</HeaderHelper>
      <div className="grid grid-2">
        <ExpandableCard title="Novo Cliente" iconName="fas fa-user-plus" collapsible={ useIsMobile() }>
          <form onSubmit={handleAddClient}>
            <div className="form-group">
              <label htmlFor="name">Nome:</label>
              <input type="text" id="name" value={newClient.name} onChange={handleInputChange} placeholder="Nome completo" required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Telefone:</label>
              <PhoneInput
                id="phone"
                value={newClient.phone || ''}
                onChange={(value) => setNewClient(prev => ({ ...prev, phone: value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" value={newClient.email} onChange={handleInputChange} placeholder="email@exemplo.com" />
            </div>
            <div className="form-group">
              <label htmlFor="budget">Orçamento (R$):</label>
              <CurrencyInput
                id="budget"
                value={newClient.budget || 0}
                onChange={(value) => setNewClient(prev => ({ ...prev, budget: value }))}
                placeholder="R$ 5.000,00"
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Observações:</label>
              <TextArea id="notes" value={newClient.notes} onChange={handleInputChange} rows={3} placeholder="Preferências, estilo, requisitos..." maxLength={100} />
            </div>
            <button type="submit" className="btn">
              <i className="fas fa-save"></i> Salvar Cliente
            </button>
          </form>
        </ExpandableCard>

        <div className="card card-consult">
          <h3><i className="fas fa-users"></i> Meus Clientes <span className="counter">{filteredClients.length} encontrados</span></h3>
          <div className="form-group">
            <input 
              type="text"
              placeholder="Buscar por nome de clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="list-container">
            {loading ? <p>Carregando...</p> : filteredClients.length > 0 ? (
              <div id="clientList">
                {filteredClients.map((client) => (
                  <div key={client.id} className="supplier-card">
                    <h4>{client.name}</h4>
                    {client.phone && <p><i className="fas fa-phone"></i> {applyPhoneMask(client.phone)}</p>}
                    {client.email && <p><i className="fas fa-envelope"></i> {client.email}</p>}
                    {client.budget && client.budget > 0 ? <p><i className="fas fa-dollar-sign"></i> Orçamento: {formatCurrency(client.budget)}</p> : ''}
                    {client.notes && <p><strong>Observações:</strong> {client.notes}</p>}
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <button onClick={() => openEditModal(client)} className="btn btn-secondary"><i className="fas fa-edit"></i> Editar</button>
                      <button onClick={() => handleDeleteRequest(client)} className="btn btn-danger"><i className="fas fa-trash"></i> Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhum cliente encontrado.</p>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Editar Cliente" formId="edit-client-form">
        {editingClient && (
          <form id="edit-client-form" onSubmit={handleUpdateClient}>
            <div className="form-group">
              <label htmlFor="name">Nome:</label>
              <input type="text" id="name" value={editingClient.name} onChange={(e) => setEditingClient({...editingClient, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Telefone:</label>
              <PhoneInput
                id="phone"
                value={editingClient.phone || ''}
                onChange={(value) => setEditingClient({...editingClient, phone: value})}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" value={editingClient.email || ''} onChange={(e) => setEditingClient({...editingClient, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="budget">Orçamento (R$):</label>
              <CurrencyInput
                id="budget"
                value={editingClient.budget || 0}
                onChange={(value) => setEditingClient(prev => ({ ...prev!, budget: value }))}
                placeholder="R$ 5.000,00"
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Observações:</label>
              <TextArea id="notes" value={editingClient.notes || ''} onChange={(e) => setEditingClient({...editingClient, notes: e.target.value})} rows={3} maxLength={100} />
            </div>
          </form>
        )}
      </Modal>

      <ConfirmActionModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir o cliente "${clientToDelete?.name}"?`}
        />
    </>
  );
}
