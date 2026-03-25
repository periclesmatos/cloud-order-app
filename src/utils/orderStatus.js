const STATUS_LABELS = {
  CREATED: 'Criado',
  SENT: 'Enviado',
  COMPLETED: 'Concluido',
  CANCELED: 'Cancelado',
};

export function getOrderStatusLabel(status) {
  return STATUS_LABELS[status] || status || '-';
}

export const ORDER_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos os status' },
  { value: 'CREATED', label: 'Criado' },
  { value: 'SENT', label: 'Enviado' },
  { value: 'COMPLETED', label: 'Concluido' },
  { value: 'CANCELED', label: 'Cancelado' },
];
