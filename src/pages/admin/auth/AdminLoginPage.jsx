import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginAdmin, getAdminMe } from '../../../service/adminAuthService';
import { useAdminAuthStore } from '../../../store/adminAuthStore';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAdminAuthStore((state) => state.setSession);
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);

  // Redirecionar para dashboard se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const redirectTo = location.state?.from || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      const auth = await loginAdmin({
        email: email.trim(),
        password: password.trim(),
      });

      const user = await getAdminMe(auth?.accessToken);

      setSession({
        user,
        accessToken: auth?.accessToken,
      });

      navigate(redirectTo, { replace: true });
    } catch (err) {
      const apiError = err?.response?.data?.error;
      setError(apiError || 'Email ou senha invalidos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl">
      <div className="card p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Administrador</p>
        <h1 className="section-title mt-2">Entrar no painel</h1>
        <p className="mt-3 text-sm text-slate-600">Use sua conta de administrador para acessar o painel de controle.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
              placeholder="Sua senha segura"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Autenticando...' : 'Entrar'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Nao tem conta?{' '}
            <button type="button" onClick={() => navigate('/admin/register')} className="font-semibold text-brand-600 hover:text-brand-700">
              Registre-se aqui
            </button>
          </p>
        </form>
      </div>
    </section>
  );
}
