import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../home/components/EmptyState';
import CartItemCard from './components/CartItemCard';
import { formatCurrency } from '../../utils/format';
import { createOrder } from '../../service/orderService';
import {
  createCustomerAddress,
  deleteCustomerAddress,
  getMe,
  updateCustomerAddress,
  updateCustomerById,
} from '../../service/customerAuthService';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { useOrderStore } from '../../store/orderStore';
import { useProductStore } from '../../store/productStore';

const EMPTY_ADDRESS_FORM = {
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  postalCode: '',
  complement: '',
  reference: '',
};

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </svg>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const products = useProductStore((state) => state.products);
  const cart = useProductStore((state) => state.cart);
  const isLoading = useProductStore((state) => state.isLoading);
  const fetchActiveProducts = useProductStore((state) => state.fetchActiveProducts);
  const incrementItem = useProductStore((state) => state.incrementItem);
  const decrementItem = useProductStore((state) => state.decrementItem);
  const clearCart = useProductStore((state) => state.clearCart);
  const customer = useCustomerAuthStore((state) => state.customer);
  const accessToken = useCustomerAuthStore((state) => state.accessToken);
  const setCustomer = useCustomerAuthStore((state) => state.setCustomer);
  const setLastOrder = useOrderStore((state) => state.setLastOrder);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', email: '' });
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [editingAddressId, setEditingAddressId] = useState('');
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addresses = useMemo(() => customer?.addresses || [], [customer]);

  useEffect(() => {
    if (!products.length) {
      fetchActiveProducts();
    }
  }, [fetchActiveProducts, products.length]);

  useEffect(() => {
    setCustomerForm({
      name: customer?.name || '',
      email: customer?.email || '',
    });
  }, [customer?.name, customer?.email]);

  useEffect(() => {
    if (!addresses.length) {
      setSelectedAddressId('');
      return;
    }

    const selectedExists = addresses.some((address) => address.id === selectedAddressId);
    if (!selectedExists) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  async function refreshCustomer() {
    if (!accessToken) {
      return;
    }

    try {
      const nextCustomer = await getMe(accessToken);
      setCustomer(nextCustomer);
    } catch (err) {
      setActionError('Erro ao atualizar dados do cliente.');
      console.error('Erro ao chamar getMe:', err);
    }
  }

  async function handleSaveCustomer() {
    if (!customer?.id || !accessToken) {
      return;
    }

    setActionError('');
    setIsSubmitting(true);

    try {
      await updateCustomerById(
        customer.id,
        {
          name: customerForm.name.trim(),
          email: customerForm.email.trim(),
        },
        accessToken,
      );
      await refreshCustomer();
      setIsEditingCustomer(false);
    } catch (err) {
      setActionError(err?.response?.data?.error || 'Nao foi possivel atualizar os dados do cliente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenNewAddressForm() {
    setEditingAddressId('');
    setAddressForm(EMPTY_ADDRESS_FORM);
    setIsAddressFormOpen(true);
    setActionError('');
  }

  function handleOpenEditAddressForm(address) {
    setEditingAddressId(address.id);
    setAddressForm({
      street: address.street || '',
      number: address.number || '',
      neighborhood: address.neighborhood || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      complement: address.complement || '',
      reference: address.reference || '',
    });
    setIsAddressFormOpen(true);
    setActionError('');
  }

  async function handleSaveAddress(event) {
    event.preventDefault();

    if (!customer?.id || !accessToken) {
      return;
    }

    setActionError('');
    setIsSubmitting(true);

    const payload = {
      street: addressForm.street.trim(),
      number: addressForm.number.trim(),
      neighborhood: addressForm.neighborhood.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      postalCode: addressForm.postalCode.trim(),
      complement: addressForm.complement.trim() || null,
      reference: addressForm.reference.trim() || null,
    };

    try {
      if (editingAddressId) {
        await updateCustomerAddress(customer.id, editingAddressId, payload, accessToken);
      } else {
        await createCustomerAddress(customer.id, payload, accessToken);
      }

      await refreshCustomer();
      setIsAddressFormOpen(false);
      setEditingAddressId('');
      setAddressForm(EMPTY_ADDRESS_FORM);
    } catch (err) {
      setActionError(err?.response?.data?.error || 'Nao foi possivel salvar o endereco.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteAddress(addressId) {
    if (!customer?.id || !accessToken) {
      return;
    }

    const shouldDelete = window.confirm('Deseja realmente excluir este endereco?');
    if (!shouldDelete) {
      return;
    }

    setActionError('');
    setIsSubmitting(true);

    try {
      await deleteCustomerAddress(customer.id, addressId, accessToken);
      await refreshCustomer();
    } catch (err) {
      setActionError(err?.response?.data?.error || 'Nao foi possivel excluir o endereco.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFinalizeOrder() {
    if (!customer?.id || !selectedAddressId || !accessToken || !cartItems.length) {
      return;
    }

    setActionError('');
    setIsSubmitting(true);

    try {
      const payload = {
        customerId: customer.id,
        addressId: selectedAddressId,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await createOrder(payload, accessToken);

      const normalizedOrder = {
        id: response?.id,
        status: response?.status || 'CREATED',
        createdAt: response?.createdAt || new Date().toISOString(),
        total: Number(response?.totalAmount ?? cartTotal),
        items: (response?.items || []).map((item) => ({
          id: item.productId,
          name: item.productName,
          quantity: item.quantity,
          subtotal: Number(item.lineTotal ?? 0),
        })),
      };

      setLastOrder(normalizedOrder);
      clearCart();
      navigate('/checkout/success');
    } catch (err) {
      setActionError(err?.response?.data?.error || 'Nao foi possivel finalizar o pedido.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const cartItems = products
    .filter((product) => (cart[product.id] || 0) > 0)
    .map((product) => {
      const quantity = cart[product.id];
      return {
        ...product,
        quantity,
        subtotal: Number(product.price || 0) * quantity,
      };
    });

  const cartTotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (isLoading && !cartItems.length) {
    return (
      <section className="card p-6">
        <p className="text-slate-600">Carregando carrinho...</p>
      </section>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6">
        <div className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Cliente</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Informacoes de contato</h2>
            </div>
            <button
              type="button"
              className="btn-secondary px-3 py-2 text-sm"
              onClick={() => setIsEditingCustomer((state) => !state)}
              disabled={isSubmitting}
            >
              <span className="flex items-center gap-1.5">
                <EditIcon />
                Editar
              </span>
            </button>
          </div>

          {!isEditingCustomer ? (
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Nome:</span> {customer?.name || '-'}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Email:</span> {customer?.email || '-'}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Telefone:</span> {customer?.phone || '-'}
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                className="input"
                value={customerForm.name}
                onChange={(event) => setCustomerForm((state) => ({ ...state, name: event.target.value }))}
                placeholder="Nome"
                disabled={isSubmitting}
              />
              <input
                className="input"
                value={customerForm.email}
                onChange={(event) => setCustomerForm((state) => ({ ...state, email: event.target.value }))}
                placeholder="Email"
                disabled={isSubmitting}
              />
              <div className="sm:col-span-2">
                <button type="button" className="btn-primary" onClick={handleSaveCustomer} disabled={isSubmitting}>
                  Salvar dados
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Enderecos</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Escolha onde receber</h2>
            </div>
            <button type="button" className="btn-primary px-3 py-2 text-sm" onClick={handleOpenNewAddressForm} disabled={isSubmitting}>
              Adicionar endereco
            </button>
          </div>

          {addresses.length === 0 && <p className="text-sm text-slate-500">Nenhum endereco cadastrado.</p>}

          <div className="space-y-3">
            {addresses.map((address) => {
              const isSelected = selectedAddressId === address.id;

              return (
                <article
                  key={address.id}
                  className={`rounded-2xl border p-4 ${isSelected ? 'border-brand-500 bg-brand-50/40' : 'border-slate-200'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => setSelectedAddressId(address.id)} className="text-left text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">
                        {address.street}, {address.number}
                      </p>
                      <p>
                        {address.neighborhood} - {address.city}/{address.state}
                      </p>
                      <p>CEP: {address.postalCode}</p>
                      {address.complement && <p>Complemento: {address.complement}</p>}
                      {address.reference && <p>Referencia: {address.reference}</p>}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                        onClick={() => handleOpenEditAddressForm(address)}
                        disabled={isSubmitting}
                        aria-label="Editar endereco"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={isSubmitting}
                        aria-label="Excluir endereco"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {isAddressFormOpen && (
            <form className="mt-4 space-y-3 border-t border-slate-200 pt-4" onSubmit={handleSaveAddress}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="input sm:col-span-2"
                  placeholder="Rua"
                  value={addressForm.street}
                  onChange={(event) => setAddressForm((state) => ({ ...state, street: event.target.value }))}
                  required
                  disabled={isSubmitting}
                />
                <input
                  className="input"
                  placeholder="Numero"
                  value={addressForm.number}
                  onChange={(event) => setAddressForm((state) => ({ ...state, number: event.target.value }))}
                  required
                  disabled={isSubmitting}
                />
                <input
                  className="input"
                  placeholder="Bairro"
                  value={addressForm.neighborhood}
                  onChange={(event) => setAddressForm((state) => ({ ...state, neighborhood: event.target.value }))}
                  required
                  disabled={isSubmitting}
                />
                <input
                  className="input"
                  placeholder="Cidade"
                  value={addressForm.city}
                  onChange={(event) => setAddressForm((state) => ({ ...state, city: event.target.value }))}
                  required
                  disabled={isSubmitting}
                />
                <input
                  className="input"
                  placeholder="Estado"
                  value={addressForm.state}
                  onChange={(event) => setAddressForm((state) => ({ ...state, state: event.target.value }))}
                  required
                  disabled={isSubmitting}
                />
                <input
                  className="input"
                  placeholder="CEP"
                  value={addressForm.postalCode}
                  onChange={(event) => setAddressForm((state) => ({ ...state, postalCode: event.target.value }))}
                  required
                  disabled={isSubmitting}
                />
                <input
                  className="input"
                  placeholder="Complemento"
                  value={addressForm.complement}
                  onChange={(event) => setAddressForm((state) => ({ ...state, complement: event.target.value }))}
                  disabled={isSubmitting}
                />
                <input
                  className="input sm:col-span-2"
                  placeholder="Referencia"
                  value={addressForm.reference}
                  onChange={(event) => setAddressForm((state) => ({ ...state, reference: event.target.value }))}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {editingAddressId ? 'Salvar endereco' : 'Adicionar endereco'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsAddressFormOpen(false);
                    setEditingAddressId('');
                    setAddressForm(EMPTY_ADDRESS_FORM);
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {actionError && <p className="mt-3 text-sm font-medium text-red-600">{actionError}</p>}
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Carrinho</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Resumo da compra</h2>
          </div>
          <button type="button" onClick={clearCart} className="btn-secondary px-3 py-2 text-sm">
            Limpar
          </button>
        </div>

        {!cartItems.length ? (
          <EmptyState title="Carrinho vazio" description="Adicione produtos na home para seguir com seu pedido." compact />
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  footer={
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                      <button
                        type="button"
                        onClick={() => decrementItem(item.id)}
                        className="h-8 w-8 rounded-lg bg-white text-lg font-bold text-slate-700 transition hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="min-w-7 text-center font-semibold text-slate-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => incrementItem(item.id)}
                        disabled={item.quantity >= Number(item.amount || 0)}
                        className="h-8 w-8 rounded-lg bg-brand-600 text-lg font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  }
                />
              ))}
            </div>

            <section className="card p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">
                  Itens no carrinho: <span className="font-semibold text-slate-900">{totalQuantity}</span>
                </p>
                <p className="text-lg font-bold text-slate-900">Total: {formatCurrency(cartTotal)}</p>
              </div>
              <button
                type="button"
                className="btn-primary mt-4 w-full"
                disabled={!selectedAddressId || isSubmitting}
                onClick={handleFinalizeOrder}
              >
                Finalizar pedido
              </button>
              {!selectedAddressId && <p className="mt-2 text-xs text-slate-500">Selecione um endereco para continuar.</p>}
              {actionError && <p className="mt-2 text-xs text-red-600">{actionError}</p>}
            </section>
          </>
        )}
      </aside>
    </div>
  );
}
