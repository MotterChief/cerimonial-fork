'use client';

import React from 'react';
import { ChecklistTemplate } from '@/services/checklist.service';
import { CHECKLIST_PERIODS, periodNameByKey } from '@/app/checklists/checklist.config';

interface ChecklistTemplatePreviewProps {
  template: ChecklistTemplate;
  onBack: () => void;
}

const ChecklistTemplatePreview: React.FC<ChecklistTemplatePreviewProps> = ({ template, onBack }) => {
  const groupedItems = template.items.reduce((acc, item) => {
    const periodName = periodNameByKey[item.period] || 'Sem período';
    if (!acc[periodName]) acc[periodName] = [];
    acc[periodName].push(item);
    return acc;
  }, {} as Record<string, typeof template.items>);

  const sortedPeriods = CHECKLIST_PERIODS
    .filter(p => groupedItems[p.name])
    .sort((a, b) => b.key - a.key);

  return (
    <div>
      <div className="template-preview-header">
        <div className="template-preview-top">
          <button className="btn btn-secondary" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
            Voltar
          </button>
          <span className="template-card-item-count">
            <i className="fas fa-tasks"></i>
            {template.items.length} itens
          </span>
        </div>
        <div className="template-preview-info">
          <div className="template-preview-name">
            <span className="position-badge">#{template.position}</span>
            <h3>{template.name}</h3>
          </div>
          {template.description && (
            <div className="template-card-body">
              <p>{template.description}</p>
            </div>
          )}
        </div>
      </div>

      {sortedPeriods.length === 0 ? (
        <h4 className="query-message">Este template não possui itens.</h4>
      ) : (
        <div className="grid grid-2">
          {sortedPeriods.map((period) => (
            <div key={period.key} className="card card-checklist">
              <h3>
                <i className={period.icon || 'fas fa-tasks'}></i>
                {period.name}
              </h3>
              <div>
                {groupedItems[period.name].map((item, index) => (
                  <div key={index} className="checklist-item">
                    <input type="checkbox" disabled />
                    <label style={{ marginLeft: '10px', width: '100%' }}>
                      {item.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChecklistTemplatePreview;
