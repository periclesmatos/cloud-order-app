import { useEffect } from 'react';
import { getMe } from '../service/customerAuthService';
import { useCustomerAuthStore } from '../store/customerAuthStore';

/**
 * Hook para validar e sincronizar dados do cliente autenticado com o servidor.
 * ✅ Melhores práticas implementadas:
 * - Usa /customers/me (rota autenticada) para validar dados REAIS do servidor
 * - Detecção automática de token inválido/expirado
 * - Sincronização de dados com servidor em casos críticos
 * - Logout automático em caso de falha de autenticação
 *
 * @param {boolean} shouldValidate - Se deve validar dados ao montar
 * @param {number} interval - Intervalo em ms para revalidação periódica (0 = desabilitado)
 */
export function useValidateMe(shouldValidate = false, interval = 0) {
  const accessToken = useCustomerAuthStore((state) => state.accessToken);
  const setCustomer = useCustomerAuthStore((state) => state.setCustomer);
  const clearSession = useCustomerAuthStore((state) => state.clearSession);

  useEffect(() => {
    if (!shouldValidate || !accessToken) {
      return;
    }

    async function validate() {
      try {
        const me = await getMe(accessToken);
        setCustomer(me);
      } catch (err) {
        const status = err?.response?.status;

        // Token inválido ou expirado
        if (status === 401 || status === 403) {
          console.warn('Token inválido/expirado. Limpando sessão.');
          clearSession();
          return;
        }

        console.error('Erro ao validar dados do cliente:', err);
      }
    }

    validate();

    // Revalidação periódica opcional
    if (interval > 0) {
      const timer = setInterval(validate, interval);
      return () => clearInterval(timer);
    }
  }, [shouldValidate, accessToken, setCustomer, clearSession, interval]);
}
