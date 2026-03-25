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
  const response = await apiClient.get(`/customers/phone/${encodeURIComponent(phone)}`);
  return response.data;
}

export async function updateCustomerById(customerId, data, accessToken) {
  const response = await apiClient.put(`/customers/${customerId}`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function createCustomerAddress(customerId, payload, accessToken) {
  const response = await apiClient.post(`/customers/${customerId}/addresses`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function updateCustomerAddress(customerId, addressId, payload, accessToken) {
  const response = await apiClient.put(`/customers/${customerId}/addresses/${addressId}`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function deleteCustomerAddress(customerId, addressId, accessToken) {
  await apiClient.delete(`/customers/${customerId}/addresses/${addressId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getMe(accessToken) {
  const response = await apiClient.get('/customers/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}
