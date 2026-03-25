import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createCustomer, getCustomerByPhone, loginCustomerByPhone } from '../../service/customerAuthService';
import { useCustomerAuthStore } from '../../store/customerAuthStore';

function getDigits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function formatLocalPhone(localDigits) {
  const areaCode = localDigits.slice(0, 2);
  const firstBlock = localDigits.slice(2, 7);
  const secondBlock = localDigits.slice(7, 11);

  if (!areaCode) {
    return '';
  }

  if (localDigits.length <= 2) {
    return `(${areaCode}`;
  }

  if (localDigits.length <= 7) {
    return `(${areaCode}) ${firstBlock}`;
  }

  return `(${areaCode}) ${firstBlock} - ${secondBlock}`;
}

function formatPhoneInput(value) {
  const digits = getDigits(value).slice(0, 14);

  if (digits.length <= 11) {
    return formatLocalPhone(digits);
  }

  const ddi = digits.slice(0, digits.length - 11);
  const local = digits.slice(-11);

  return `+${ddi} ${formatLocalPhone(local)}`;
}

function normalizePhoneForApi(phone) {
  const digits = getDigits(phone);

  if (!digits) {
    return '';
  }

  if (digits.length > 11) {
    return `+${digits}`;
  }

  return `+55${digits}`;
}

export default function CustomerAuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useCustomerAuthStore((state) => state.setSession);

  const redirectTo = useMemo(() => location.state?.from || '/', [location.state]);

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const phoneDigits = getDigits(phone);
    const normalizedPhone = normalizePhoneForApi(phone);

    if (phoneDigits.length < 10) {
      setError('Informe um telefone valido com DDD.');
      return;
    }

    if (needsRegistration && (!name.trim() || !email.trim())) {
      setError('Preencha nome e email para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      if (!needsRegistration) {
        const auth = await loginCustomerByPhone(normalizedPhone);
        const customer = await getCustomerByPhone(normalizedPhone);

        setSession({
          customer,
          accessToken: auth?.accessToken,
        });

        navigate(redirectTo, { replace: true });
        return;
      }

      await createCustomer({
        name: name.trim(),
        email: email.trim(),
        phone: normalizedPhone,
      });

      const auth = await loginCustomerByPhone(normalizedPhone);
      const customer = await getCustomerByPhone(normalizedPhone);

      setSession({
        customer,
        accessToken: auth?.accessToken,
      });

      navigate(redirectTo, { replace: true });
    } catch (err) {
      const statusCode = err?.response?.status;
      const apiError = err?.response?.data?.error;

      if (!needsRegistration && (statusCode === 404 || statusCode === 401)) {
        setNeedsRegistration(true);
        setError('Telefone nao cadastrado. Informe nome e email para criar sua conta.');
        setIsLoading(false);
        return;
      }

      setError(apiError || 'Nao foi possivel autenticar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl">
      <div className="card p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Autenticacao</p>
        <h1 className="section-title mt-2">Entrar com telefone</h1>
        <p className="mt-3 text-sm text-slate-600">
          Use seu telefone para continuar. Se ainda nao tiver cadastro, complete os dados para criar sua conta.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="phone">
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              className="input"
              placeholder="(85) 99999-9999"
              value={phone}
              onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
              disabled={isLoading}
              autoComplete="tel"
            />
            <p className="mt-1 text-xs text-slate-500">Formato: (DDD) 99999 - 9999 ou +DDI (DDD) 99999 - 9999</p>
          </div>

          {needsRegistration && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  className="input"
                  placeholder="Seu nome completo"
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
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </>
          )}

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Aguarde...' : needsRegistration ? 'Cadastrar e continuar' : 'Continuar'}
          </button>
        </form>
      </div>
    </section>
  );
}
