import { apiClient } from './apiClient';

export async function registerAdmin({ name, email, password }) {
  const response = await apiClient.post('/auth/users/register', {
    name,
    email,
    password,
  });
  return response.data;
}

export async function loginAdmin({ email, password }) {
  const response = await apiClient.post('/auth/users/login', {
    email,
    password,
  });
  return response.data;
}

export async function getAdminMe(accessToken) {
  const response = await apiClient.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}
