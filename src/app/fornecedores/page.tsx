'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addSupplier, getSuppliers, updateSupplier, deleteSupplier } from '@/services/supplier.service';
import Modal from '@/components/Modal';
import HeaderHelper from '@/components/HeaderHelper';
import { useNotification } from '@/context/NotificationContext';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import ExpandableCard from '@/components/ExpandableCard';
import { useIsMobile } from '@/utils/window.utils';
import PhoneInput from '@/components/fields/PhoneInput';
import TextArea from '@/components/fields/TextArea';
import { useDemoGuard } from '@/utils/useDemoGuard';

interface Supplier {
  id: string;
  name: string;
  category?: string;
  phone?: string;
  email?: string;
  rating?: string;
  notes?: string;
}

export default function FornecedoresPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const guard = useDemoGuard();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const initialFormState = { name: '', category: 'Buffet', phone: '', email: '', rating: '3', notes: '' };
  const [newSupplier, setNewSupplier] = useState(initialFormState);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);


  const fetchSuppliers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userSuppliers = await getSuppliers(user.uid) as Supplier[];
      setSuppliers(userSuppliers);
    } catch (error) {
      console.error('Failed to search suppliers!', error);
      addNotification('Falha ao buscar os fornecedores!', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchSuppliers();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setNewSupplier((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await guard(async () => {
      try {
        await addSupplier(user.uid, newSupplier);
        setNewSupplier(initialFormState);
        fetchSuppliers();
        addNotification('Fornecedor adicionado com sucesso!', 'success');
      } catch (error) {
        console.error('Failed to add supplier!', error);
        addNotification('Erro ao adicionar fornecedor.', 'error');
      }
    });
  };

  const handleDeleteRequest = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !supplierToDelete) return;
    await guard(async () => {
      try {
        await deleteSupplier(user.uid, supplierToDelete.id);
        fetchSuppliers();
        addNotification('Fornecedor excluído com sucesso!', 'success');
      } catch (error) {
        console.error('Failed to delete supplier!', error);
        addNotification('Erro ao excluir fornecedor.', 'error');
      } finally {
        setDeleteModalOpen(false);
        setSupplierToDelete(null);
      }
    });
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingSupplier) return;
    await guard(async () => {
      try {
        const { id, ...supplierData } = editingSupplier;
        await updateSupplier(user.uid, id, supplierData);
        setIsModalOpen(false);
        setEditingSupplier(null);
        fetchSuppliers();
        addNotification('Fornecedor atualizado com sucesso!', 'success');
      } catch (error) {
        console.error('Failed to update supplier!', error);
        addNotification('Falha ao atualizar fornecedor!', 'error');
      }
    });
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <HeaderHelper><span>Gerencie aqui todos os seus fornecedores. <br></br> No momento, este cadastro serve exclusivamente para consulta.</span></HeaderHelper>
      <div className="grid grid-2">
        <ExpandableCard title="Novo Fornecedor" iconName="fas fa-plus" collapsible={ useIsMobile() }>
          <form onSubmit={handleAddSupplier}>
            <div className="form-group">
              <label htmlFor="name">Nome/Empresa:</label>
              <input type="text" id="name" value={newSupplier.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="category">Categoria:</label>
              <select id="category" value={newSupplier.category} onChange={handleInputChange}>
                <option>Buffet</option><option>Decoração</option><option>Fotografia</option><option>Música</option><option>Transporte</option><option>Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="phone">Telefone:</label>
              <PhoneInput
                id="phone"
                value={newSupplier.phone || ''}
                onChange={(value) => setNewSupplier(prev => ({ ...prev, phone: value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" value={newSupplier.email} onChange={handleInputChange} placeholder="email@exemplo.com" />
            </div>
            <div className="form-group">
              <label htmlFor="rating">Avaliação:</label>
              <select id="rating" value={newSupplier.rating} onChange={handleInputChange}>
                <option value="5">⭐⭐⭐⭐⭐</option><option value="4">⭐⭐⭐⭐</option><option value="3">⭐⭐⭐</option><option value="2">⭐⭐</option><option value="1">⭐</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="notes">Observações:</label>
              <TextArea id="notes" value={newSupplier.notes} onChange={handleInputChange} rows={3} maxLength={100} />
            </div>
            <button type="submit" className="btn"><i className="fas fa-save"></i> Salvar Fornecedor</button>
          </form>
        </ExpandableCard>

        <div className="card card-consult">
          <h3><i className="fas fa-list"></i> Meus Fornecedores <span className="counter">{filteredSuppliers.length} encontrados</span></h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="Buscar por nome de fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="list-container">
            {loading ? <p>Carregando...</p> : filteredSuppliers.length > 0 ? (
              <div id="suppliersList">
                {filteredSuppliers.map((supplier) => (
                  <div key={supplier.id} className="supplier-card">
                    <h4>{supplier.name}</h4>
                    {supplier.category && <p><i className="fas fa-tag"></i> {supplier.category}</p>}
                    {supplier.phone && <p><i className="fas fa-phone"></i> {supplier.phone}</p>}
                    {supplier.email && <p><i className="fas fa-envelope"></i> {supplier.email}</p>}
                    {supplier.rating && <p>Avaliação: {"⭐".repeat(parseInt(supplier.rating || '0'))}</p>}
                    {supplier.notes && <p><strong>Observações:</strong> {supplier.notes}</p>}
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <button onClick={() => openEditModal(supplier)} className="btn btn-secondary"><i className="fas fa-edit"></i> Editar</button>
                      <button onClick={() => handleDeleteRequest(supplier)} className="btn btn-danger"><i className="fas fa-trash"></i> Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p>Nenhum fornecedor encontrado.</p>}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Editar Fornecedor" formId="edit-supplier-form">
        {editingSupplier && (
          <form id="edit-supplier-form" onSubmit={handleUpdateSupplier}>
            <div className="form-group">
              <label htmlFor="name">Nome/Empresa:</label>
              <input type="text" id="name" value={editingSupplier.name} onChange={(e) => setEditingSupplier({...editingSupplier, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label htmlFor="category">Categoria:</label>
              <select id="category" value={editingSupplier.category || ''} onChange={(e) => setEditingSupplier({...editingSupplier, category: e.target.value})}>
                <option>Buffet</option><option>Decoração</option><option>Fotografia</option><option>Música</option><option>Transporte</option><option>Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="phone">Telefone:</label>
              <PhoneInput
                id="phone"
                value={editingSupplier.phone || ''}
                onChange={(value) => setEditingSupplier({ ...editingSupplier, phone: value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" value={editingSupplier.email || ''} onChange={(e) => setEditingSupplier({...editingSupplier, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="rating">Avaliação:</label>
              <select id="rating" value={editingSupplier.rating || '3'} onChange={(e) => setEditingSupplier({...editingSupplier, rating: e.target.value})}>
                <option value="5">⭐⭐⭐⭐⭐</option><option value="4">⭐⭐⭐⭐</option><option value="3">⭐⭐⭐</option><option value="2">⭐⭐</option><option value="1">⭐</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="notes">Observações:</label>
              <TextArea id="notes" value={editingSupplier.notes || ''} onChange={(e) => setEditingSupplier({...editingSupplier, notes: e.target.value})} rows={3} maxLength={100} />
            </div>
          </form>
        )}
      </Modal>

      <ConfirmActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o fornecedor "${supplierToDelete?.name}"?`}
      />
    </>
  );
}
