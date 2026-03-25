import { apiClient } from './apiClient';

export async function getActiveProducts() {
  const response = await apiClient.get('/products', {
    params: {
      isActive: true,
    },
  });

  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data;
}
