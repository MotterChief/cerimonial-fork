'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { getEvents, Event } from '@/services/event.service';
import {
  getChecklistsByEvent,
  ChecklistItem,
  addChecklistItem,
  getTemplates,
  deleteTemplate,
  deleteAllChecklistsByEvent,
  ChecklistTemplate,
} from '@/services/checklist.service';
import CustomSelect from '@/components/Select';
import ChecklistForm from '@/components/ChecklistForm';
import ChecklistDisplay from '@/components/ChecklistDisplay';
import HeaderHelper from '@/components/HeaderHelper';
import ChecklistTemplateForm from '@/components/ChecklistTemplateForm';
import ChecklistTemplateManager from '@/components/ChecklistTemplateManager';
import ChecklistTemplatePreview from '@/components/ChecklistTemplatePreview';
import ExpandableCard from '@/components/ExpandableCard';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function ChecklistsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loadingChecklist, setLoadingChecklist] = useState(false);

  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'templates' | 'criar'>('criar');
  const [viewingTemplate, setViewingTemplate] = useState<ChecklistTemplate | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const loadTemplates = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getTemplates(user.uid);
      setTemplates(data);
    } catch (error) {
      console.error('Falha ao carregar templates:', error);
    }
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      try {
        const userEvents = await getEvents(user.uid);
        setEvents(userEvents);
      } catch (error) {
        console.error('Falha ao encontrar evento:', error);
      }
    };

    fetchEvents();
    loadTemplates();
  }, [user, loadTemplates]);

  const refreshChecklistItems = useCallback(async () => {
    if (!user || !selectedEventId) return;
    try {
      const items = await getChecklistsByEvent(user.uid, selectedEventId);
      setChecklistItems(items);
    } catch (error) {
      console.error('Falha ao atualizar tarefas de checklists:', error);
    }
  }, [user, selectedEventId]);

  const loadChecklistForEvent = useCallback(async () => {
    if (!user || !selectedEventId) return;
    try {
      setLoadingChecklist(true);
      const items = await getChecklistsByEvent(user.uid, selectedEventId);
      setChecklistItems(items);
    } catch (error) {
      console.error('Falha ao carregar tarefas de checklists:', error);
    } finally {
      setLoadingChecklist(false);
    }
  }, [user, selectedEventId]);

  useEffect(() => {
    if (selectedEventId) {
      loadChecklistForEvent();
    } else {
      setChecklistItems([]);
    }
  }, [selectedEventId, loadChecklistForEvent]);

  const handleViewTemplate = (template: ChecklistTemplate) => {
    setViewingTemplate(template);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!user) return;
    try {
      await deleteTemplate(user.uid, templateId);
      await loadTemplates();
      addNotification('Template excluído com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      addNotification('Erro ao excluir template.', 'error');
    }
  };

  const handleApplyTemplate = async (template: ChecklistTemplate) => {
    if (!user || !selectedEventId) {
      addNotification('Selecione um evento antes de aplicar o template.', 'warning');
      return;
    }
    setIsApplying(true);
    try {
      for (const item of template.items) {
        await addChecklistItem(user.uid, {
          eventId: selectedEventId,
          title: item.title,
          period: item.period,
          completed: false,
        });
      }
      await refreshChecklistItems();
      addNotification(`Template "${template.name}" aplicado com sucesso!`, 'success');
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
      addNotification('Erro ao aplicar template.', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const handleReplaceWithTemplate = async (template: ChecklistTemplate) => {
    if (!user || !selectedEventId) {
      addNotification('Selecione um evento antes de substituir.', 'warning');
      return;
    }
    setIsApplying(true);
    try {
      await deleteAllChecklistsByEvent(user.uid, selectedEventId);
      for (const item of template.items) {
        await addChecklistItem(user.uid, {
          eventId: selectedEventId,
          title: item.title,
          period: item.period,
          completed: false,
        });
      }
      await refreshChecklistItems();
      addNotification(`Checklist substituído pelo template "${template.name}"!`, 'success');
    } catch (error) {
      console.error('Erro ao substituir com template:', error);
      addNotification('Erro ao substituir checklist.', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const eventOptions = events.map(event => ({ value: event.id, label: event.eventName }));

  const checklistStats = useMemo(() => {
    const total = checklistItems.length;
    const completed = checklistItems.filter(item => item.completed).length;
    return { total, completed, pending: total - completed };
  }, [checklistItems]);

  return (
    <>
      <LoadingOverlay isLoading={isApplying} />
      <HeaderHelper>Gerencie aqui os checklists dos seus eventos. <br></br> Selecione um evento para criar, visualizar e editar as tarefas.</HeaderHelper>
      <div className="card card-background">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'criar' ? 'active' : ''}`}
            onClick={() => setActiveTab('criar')}
          >
            <i className="fas fa-plus-circle" style={{ marginRight: '8px' }}></i>
            Gerenciador de Tarefas
          </button>
          <button
            className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <i className="fas fa-copy" style={{ marginRight: '8px' }}></i>
            Gerenciador de Templates
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'criar' ? (
            <motion.div
              key="criar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="filters-top">
                <h3><i className="fas fa-calendar-alt"></i> Selecione um Evento</h3>
                <CustomSelect
                  instanceId="event-select-page"
                  options={eventOptions}
                  value={eventOptions.find(opt => opt.value === selectedEventId) ?? null}
                  onChange={(option) => setSelectedEventId(option ? option.value : null)}
                  placeholder="Selecione um evento para ver e editar os checklists"
                  isClearable
                />
              </div>
              <ExpandableCard
                title="Criar Tarefa"
                iconName="fas fa-plus-circle"
                mobileOnly
                marginBottom
              >
                <ChecklistForm eventId={selectedEventId} onItemAdded={refreshChecklistItems} />
              </ExpandableCard>

              <AnimatePresence>
                {selectedEventId && !loadingChecklist && (
                  <motion.div
                    className="checklist-summary"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    {[
                      { label: 'Total',      value: checklistStats.total,     icon: 'fas fa-list-check',   modifier: 'total'   },
                      { label: 'Concluídas', value: checklistStats.completed,  icon: 'fas fa-circle-check', modifier: 'done'    },
                      { label: 'Pendentes',  value: checklistStats.pending,    icon: 'fas fa-clock',        modifier: 'pending' },
                    ].map(stat => (
                      <div key={stat.label} className="summary-card">
                        <div className={`summary-card-icon ${stat.modifier}`}>
                          <i className={stat.icon} />
                        </div>
                        <div>
                          <div className="summary-card-value">{stat.value}</div>
                          <div className="summary-card-label">{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {!selectedEventId ? (
                  <motion.h4
                    key="no-event"
                    className="query-message"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    Selecione um evento para ver os checklists associados.
                  </motion.h4>
                ) : loadingChecklist ? (
                  <motion.p
                    key="loading"
                    style={{ textAlign: 'center', padding: '40px' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    Carregando tarefas...
                  </motion.p>
                ) : (
                  <motion.div
                    key={selectedEventId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <ChecklistDisplay items={checklistItems} onItemUpdate={refreshChecklistItems} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <AnimatePresence mode="wait">
                {viewingTemplate ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <div className="card">
                      <ChecklistTemplatePreview
                        template={viewingTemplate}
                        onBack={() => setViewingTemplate(null)}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="manager"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <ExpandableCard
                      title="Criar Template"
                      iconName="fas fa-plus-circle"
                      mobileOnly
                      marginBottom
                    >
                      <ChecklistTemplateForm
                        checklistItems={checklistItems}
                        templates={templates}
                        onTemplateSaved={loadTemplates}
                      />
                    </ExpandableCard>
                    <div className="card">
                      <h3>
                        <i className="fas fa-copy"></i>
                        Templates Cadastrados
                        <span className="counter">{templates.length} encontrados</span>
                      </h3>
                      <ChecklistTemplateManager
                        templates={templates}
                        onDelete={handleDeleteTemplate}
                        onAdd={handleApplyTemplate}
                        onReplace={handleReplaceWithTemplate}
                        onView={handleViewTemplate}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
