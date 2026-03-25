import { apiClient } from './apiClient';

export async function loginCustomerByPhone(phone) {
  const response = await apiClient.post('/auth/customers/login', { phone });
  return response.data;
}

export async function createCustomer({ name, email, phone }) {
  const response = await apiClient.post('/customers', { name, email, phone });
  return response.data;
}

export async function getCustomerByPhone(phone) {
  const response = await apiClient.get(`/customers/phone/${phone}`);
  return response.data;
}
