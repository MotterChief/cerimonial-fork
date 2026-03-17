'use client';

import React, { useState } from 'react';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import { ChecklistTemplate } from '@/services/checklist.service';

interface ChecklistTemplateManagerProps {
  templates: ChecklistTemplate[];
  onDelete: (templateId: string) => void;
  onAdd: (template: ChecklistTemplate) => void;
  onReplace: (template: ChecklistTemplate) => void;
  onView: (template: ChecklistTemplate) => void;
}

const ChecklistTemplateManager: React.FC<ChecklistTemplateManagerProps> = ({
  templates,
  onDelete,
  onAdd,
  onReplace,
  onView,
}) => {
  const [confirmReplace, setConfirmReplace] = useState<ChecklistTemplate | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ChecklistTemplate | null>(null);

  const handleConfirmReplace = () => {
    if (confirmReplace) {
      onReplace(confirmReplace);
      setConfirmReplace(null);
    }
  };

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      onDelete(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  return (
    <>
      {templates.length === 0 ? (
        <h4 className="query-message">Nenhum template cadastrado ainda.</h4>
      ) : (
        <div className="grid grid-2">
          {templates.map((template) => (
            <div key={template.id} className="template-card">
              <div className="template-card-inner">
                <div className="template-card-header">
                  <div className="template-card-header-title">
                    <span className="position-badge">#{template.position}</span>
                    {template.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      className="btn-icon-default"
                      onClick={() => onView(template)}
                      title="Visualizar itens do template"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="btn-delete-icon"
                      onClick={() => setConfirmDelete(template)}
                      title="Excluir template"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <span className="template-card-item-count">
                  <i className="fas fa-tasks"></i>
                  {template.items.length} itens
                </span>
                <div className="template-card-body">
                  <p>{template.description || 'Sem descrição'}</p>
                </div>
                <div className="template-card-footer">
                  <div className="template-card-actions">
                    <button className="btn" onClick={() => onAdd(template)}>
                      <i className="fas fa-plus"></i>
                      Adicionar
                    </button>
                    <button
                      className="btn-template-replace"
                      onClick={() => setConfirmReplace(template)}
                    >
                      <i className="fas fa-retweet"></i>
                      Substituir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmActionModal
        isOpen={!!confirmReplace}
        onClose={() => setConfirmReplace(null)}
        onConfirm={handleConfirmReplace}
        message="Deseja substituir todos os itens existentes por este template?"
      />

      <ConfirmActionModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        message={`Deseja excluir o template "${confirmDelete?.name}"?`}
      />
    </>
  );
};

export default ChecklistTemplateManager;
