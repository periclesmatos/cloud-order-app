import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerAdmin, loginAdmin, getAdminMe } from '../../../service/adminAuthService';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { useToast } from '../../../hooks/useToast';

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const setSession = useAdminAuthStore((state) => state.setSession);
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const { success, error: toastError, loading: toastLoading } = useToast();

  // Redirecionar para dashboard se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const missingFields = !name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim();
    if (missingFields) {
      const msg = 'Preencha todos os campos para continuar.';
      setError(msg);
      toastError(msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'Senha deve ter no mínimo 6 caracteres.';
      setError(msg);
      toastError(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'As senhas não conferem.';
      setError(msg);
      toastError(msg);
      return;
    }

    setIsLoading(true);

    try {
      await registerAdmin({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      // Login automatico apos registro
      const auth = await loginAdmin({
        email: email.trim(),
        password: password.trim(),
      });

      const user = await getAdminMe(auth?.accessToken);

      setSession({
        user,
        accessToken: auth?.accessToken,
      });

      success(`Bem-vindo, ${user?.name}! Conta criada com sucesso! 🎉`);
      navigate('/admin', { replace: true });
    } catch (err) {
      const apiError = err?.response?.data?.error || 'Erro ao registrar. Email pode já estar cadastrado.';
      setError(apiError);
      toastError(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl">
      <div className="card p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Administrador</p>
        <h1 className="section-title mt-2">Criar conta</h1>
        <p className="mt-3 text-sm text-slate-600">Registre-se para acessar o painel administrativo.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              className="input"
              placeholder="Seu nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isLoading}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="admin@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="Minimo 6 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="input"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Criar conta'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Ja tem conta?{' '}
            <button type="button" onClick={() => navigate('/admin/login')} className="font-semibold text-brand-600 hover:text-brand-700">
              Faca login aqui
            </button>
          </p>
        </form>
      </div>
    </section>
  );
}
