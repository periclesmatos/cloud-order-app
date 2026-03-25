import axios from 'axios';

// Usar VITE_API_URL do .env, com fallback para localhost
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const timeout = import.meta.env.VITE_API_TIMEOUT ? Number(import.meta.env.VITE_API_TIMEOUT) : 10000;

// Validação: HTTPS obrigatória em produção
if (import.meta.env.PROD && !baseURL.startsWith('https://')) {
  console.error(`❌ ERRO DE SEGURANÇA: URL da API deve usar HTTPS em produção. Recebeu: ${baseURL}`);
  throw new Error('HTTPS obrigatória em produção. Verifique VITE_API_URL no .env.production');
}

export const apiClient = axios.create({
  baseURL,
  timeout,
});
