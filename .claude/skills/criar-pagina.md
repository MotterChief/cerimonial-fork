---
name: criar-pagina
description: Cria uma nova pagina CRUD completa seguindo o padrao do projeto (form + listagem + modal edicao + modal exclusao)
user_invocable: true
---

# Skill: Criar Pagina

Use esta skill ao criar uma nova pagina em `src/app/[rota]/page.tsx`.

## Checklist

1. Crie a pasta `src/app/[rota]/`
2. Crie o arquivo `page.tsx` com o template abaixo
3. Adicione a rota na navbar em `src/components/NavBar/index.tsx`

## Template da Pagina

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addEntidade, getEntidades, updateEntidade, deleteEntidade, Entidade } from '@/services/entidade.service';
import Modal from '@/components/Modal';
import HeaderHelper from '@/components/HeaderHelper';
import { useNotification } from '@/context/NotificationContext';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import ExpandableCard from '@/components/ExpandableCard';
import { useIsMobile } from '@/utils/window.utils';
// Importar campos especiais conforme necessidade:
// import PhoneInput from '@/components/fields/PhoneInput';
// import CurrencyInput from '@/components/fields/CurrencyInput';
// import TextArea from '@/components/fields/TextArea';
// import DatePicker from '@/components/fields/DatePicker';

export default function NomePage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [items, setItems] = useState<Entidade[]>([]);
  const [loading, setLoading] = useState(true);

  const initialFormState = { /* campos do DTO com valores default */ };
  const [newItem, setNewItem] = useState(initialFormState);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Entidade | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Entidade | null>(null);

  // FETCH
  const fetchItems = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getEntidades(user.uid);
      setItems(data);
    } catch (error) {
      addNotification('Falha ao buscar os dados!', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  // FORM HANDLER
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setNewItem(prev => ({ ...prev, [id]: value }));
  };

  // CREATE
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addEntidade(user.uid, newItem);
      setNewItem(initialFormState);
      fetchItems();
      addNotification('Item adicionado com sucesso!', 'success');
    } catch (error) {
      addNotification('Erro ao adicionar item.', 'error');
    }
  };

  // DELETE
  const handleDeleteRequest = (item: Entidade) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !itemToDelete) return;
    try {
      await deleteEntidade(user.uid, itemToDelete.id);
      fetchItems();
      addNotification('Item excluido com sucesso!', 'success');
    } catch (error) {
      addNotification('Erro ao excluir item.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // EDIT
  const openEditModal = (item: Entidade) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingItem) return;
    try {
      const { id, ...data } = editingItem;
      await updateEntidade(user.uid, id, data);
      setIsModalOpen(false);
      setEditingItem(null);
      fetchItems();
      addNotification('Item atualizado com sucesso!', 'success');
    } catch (error) {
      addNotification('Falha ao atualizar item!', 'error');
    }
  };

  // FILTER
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <HeaderHelper>Descricao da pagina aqui.</HeaderHelper>
      <div className="grid grid-2">
        {/* FORMULARIO DE CRIACAO */}
        <ExpandableCard title="Novo Item" iconName="fas fa-plus" collapsible={useIsMobile()}>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label htmlFor="name">Nome:</label>
              <input type="text" id="name" value={newItem.name} onChange={handleInputChange} required />
            </div>
            {/* Mais campos aqui */}
            <button type="submit" className="btn"><i className="fas fa-save"></i> Salvar</button>
          </form>
        </ExpandableCard>

        {/* LISTA DE CONSULTA */}
        <div className="card card-consult">
          <h3><i className="fas fa-list"></i> Meus Itens <span className="counter">{filteredItems.length} encontrados</span></h3>
          <div className="form-group">
            <input type="text" placeholder="Buscar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="list-container">
            {loading ? <p>Carregando...</p> : filteredItems.length > 0 ? (
              <div>
                {filteredItems.map((item) => (
                  <div key={item.id} className="supplier-card">
                    <h4>{item.name}</h4>
                    {/* Campos do item */}
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <button onClick={() => openEditModal(item)} className="btn btn-secondary"><i className="fas fa-edit"></i> Editar</button>
                      <button onClick={() => handleDeleteRequest(item)} className="btn btn-danger"><i className="fas fa-trash"></i> Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p>Nenhum item encontrado.</p>}
          </div>
        </div>
      </div>

      {/* MODAL DE EDICAO */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Editar Item" formId="edit-item-form">
        {editingItem && (
          <form id="edit-item-form" onSubmit={handleUpdate}>
            <div className="form-group">
              <label htmlFor="name">Nome:</label>
              <input type="text" id="name" value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} required />
            </div>
            {/* Mesmos campos do form de criacao */}
          </form>
        )}
      </Modal>

      {/* MODAL DE EXCLUSAO */}
      <ConfirmActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusao"
        message={`Tem certeza que deseja excluir "${itemToDelete?.name}"?`}
      />
    </>
  );
}
```

## Regras

- Sempre `'use client'` no topo
- Layout padrao: `grid grid-2` com ExpandableCard (form) a esquerda e card-consult (lista) a direita
- ExpandableCard do form: `collapsible={useIsMobile()}` para colapsar apenas no mobile
- Card de listagem: classe `card card-consult`, com barra de busca e `list-container`
- Cada item da lista usa a classe `supplier-card`
- Modal de edicao: usar `<Modal>` com `formId` apontando para o `id` do form interno
- Modal de exclusao: usar `<ConfirmActionModal>` com mensagem personalizada
- Notificacoes: success para acoes completadas, error para falhas
- Busca: filtro local pelo campo `name` usando `searchTerm`
- Estado de loading: mostrar `<p>Carregando...</p>` ou usar `<LoadingOverlay>`
- Campos especiais: usar PhoneInput, CurrencyInput, TextArea, DatePicker conforme tipo do dado
