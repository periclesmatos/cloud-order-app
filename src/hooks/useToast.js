import { toast } from 'sonner';
import { useCallback } from 'react';

/**
 * Hook customizado para gerenciar notificações toast
 * Facilita o uso de toasts em toda a aplicação
 * 
 * @example
 * const { success, error, loading, info } = useToast();
 * 
 * success('Produto criado!');
 * const toastId = loading('Salvando...');
 * 
 * // Depois:
 * toast.dismiss(toastId);
 * success('Salvo com sucesso!');
 */
export function useToast() {
  const success = useCallback((message, options = {}) => {
    return toast.success(message, {
      position: 'top-right',
      duration: 3000,
      ...options,
    });
  }, []);

  const error = useCallback((message, options = {}) => {
    return toast.error(message, {
      position: 'top-right',
      duration: 4000,
      ...options,
    });
  }, []);

  const loading = useCallback((message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      ...options,
    });
  }, []);

  const info = useCallback((message, options = {}) => {
    return toast.info(message, {
      position: 'top-right',
      duration: 3000,
      ...options,
    });
  }, []);

  const promise = useCallback((promise, { loading: loadingMsg, success: successMsg, error: errorMsg }, options = {}) => {
    return toast.promise(promise, {
      loading: loadingMsg || 'Carregando...',
      success: successMsg || 'Sucesso!',
      error: errorMsg || 'Erro',
      position: 'top-right',
      ...options,
    });
  }, []);

  return {
    success,
    error,
    loading,
    info,
    promise,
    dismiss: toast.dismiss,
  };
}
