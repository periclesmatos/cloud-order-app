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

export async function getAllProducts(accessToken) {
  const response = await apiClient.get('/products', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data;
}

export async function createProduct(productData, accessToken) {
  const response = await apiClient.post('/products', productData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function updateProduct(productId, productData, accessToken) {
  const response = await apiClient.put(`/products/${productId}`, productData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function deleteProduct(productId, accessToken) {
  const response = await apiClient.delete(`/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function toggleProductStatus(productId, isActive, accessToken) {
  const response = await apiClient.patch(
    `/products/${productId}/status`,
    { isActive },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
}

export async function updateProductStock(productId, amount, accessToken) {
  const response = await apiClient.put(`/products/${productId}`, { amount }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}
