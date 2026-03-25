import { apiClient } from './apiClient';

export async function createOrder(payload, accessToken) {
  const response = await apiClient.post('/orders', payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function getCustomerOrders(customerId, accessToken) {
  const response = await apiClient.get(`/orders/customer/${customerId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data;
}

export async function cancelOrder(orderId, accessToken) {
  const response = await apiClient.patch(
    `/orders/${orderId}/status`,
    {
      status: 'CANCELED',
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}

export async function getAllOrders(accessToken) {
  const response = await apiClient.get('/orders', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data;
}

export async function updateOrderStatus(orderId, status, accessToken) {
  const response = await apiClient.patch(
    `/orders/${orderId}/status`,
    {
      status,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}
