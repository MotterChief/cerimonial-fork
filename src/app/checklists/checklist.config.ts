export const CHECKLIST_PERIODS = [
  { key: 9, name: '12 meses antes', icon: 'fas fa-calendar-minus' },
  { key: 8, name: '9 meses antes', icon: 'fas fa-calendar-minus' },
  { key: 7, name: '6 meses antes', icon: 'fas fa-calendar-minus' },
  { key: 6, name: '3 meses antes', icon: 'fas fa-calendar-alt' },
  { key: 5, name: '1 mês antes', icon: 'fas fa-calendar-day' },
  { key: 4, name: '1 semana antes', icon: 'fas fa-calendar-week' },
  { key: 3, name: 'Na véspera', icon: 'fas fa-bell' },
  { key: 2, name: 'No dia do evento', icon: 'fas fa-calendar-check' },
  { key: 1, name: 'Pós-evento', icon: 'fas fa-history' }
];

export const periodOrder = CHECKLIST_PERIODS.map(p => p.name);

export const periodIcons = CHECKLIST_PERIODS.reduce((acc, period) => {
  acc[period.name] = period.icon;
  return acc;
}, {} as Record<string, string>);

export const checklistFormOptions = CHECKLIST_PERIODS.map(p => ({ value: p.key, label: p.name }));

export const periodNameByKey = CHECKLIST_PERIODS.reduce((acc, period) => {
  acc[period.key] = period.name;
  return acc;
}, {} as Record<number, string>);
