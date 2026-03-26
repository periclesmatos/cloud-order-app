import axios from 'axios';

// Usar VITE_API_URL do .env, com fallback para localhost
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const timeout = import.meta.env.VITE_API_TIMEOUT ? Number(import.meta.env.VITE_API_TIMEOUT) : 10000;
const requireHttps = import.meta.env.VITE_REQUIRE_HTTPS !== 'false';

// Validação: HTTPS obrigatória em produção
if (import.meta.env.PROD && requireHttps && !baseURL.startsWith('https://')) {
  console.error(`❌ ERRO DE SEGURANÇA: URL da API deve usar HTTPS em produção. Recebeu: ${baseURL}`);
  throw new Error('HTTPS obrigatória em produção. Verifique VITE_API_URL e VITE_REQUIRE_HTTPS no .env.production');
}

export const apiClient = axios.create({
  baseURL,
  timeout,
});
