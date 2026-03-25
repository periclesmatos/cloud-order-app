import { apiClient } from './apiClient';

export async function getDashboardStats(accessToken) {
  try {
    const [ordersResponse, productsResponse, customersResponse] = await Promise.all([
      apiClient.get('/orders', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      apiClient.get('/products', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      apiClient.get('/customers', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
    const products = Array.isArray(productsResponse.data) ? productsResponse.data : [];
    const customers = Array.isArray(customersResponse.data) ? customersResponse.data : [];

    return { orders, products, customers };
  } catch (err) {
    console.error('Erro ao buscar dados da dashboard:', err);
    throw err;
  }
}
