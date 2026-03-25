import { apiClient } from './apiClient';

export async function getDashboardStats(accessToken) {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const [ordersResponse, productsResponse] = await Promise.all([
      apiClient.get('/orders', { headers }).catch((err) => {
        console.error('Erro ao buscar pedidos:', err?.response?.status, err?.response?.data);
        return { data: [] };
      }),
      apiClient.get('/products', { headers }).catch((err) => {
        console.error('Erro ao buscar produtos:', err?.response?.status, err?.response?.data);
        return { data: [] };
      }),
    ]);

    const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
    const products = Array.isArray(productsResponse.data) ? productsResponse.data : [];

    return { orders, products, customers: [] };
  } catch (err) {
    console.error('Erro ao buscar dados da dashboard:', err?.response?.status, err?.response?.data);
    throw err;
  }
}
