import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CartSummary from './components/CartSummary';
import ProductCard from './components/ProductCard';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { useProductStore } from '../../store/productStore';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const products = useProductStore((state) => state.products);
  const cart = useProductStore((state) => state.cart);
  const isLoading = useProductStore((state) => state.isLoading);
  const error = useProductStore((state) => state.error);
  const fetchActiveProducts = useProductStore((state) => state.fetchActiveProducts);
  const incrementItem = useProductStore((state) => state.incrementItem);
  const decrementItem = useProductStore((state) => state.decrementItem);
  const clearCart = useProductStore((state) => state.clearCart);
  const isAuthenticated = useCustomerAuthStore((state) => state.isAuthenticated);

  const cartItems = products
    .filter((product) => (cart[product.id] || 0) > 0)
    .map((product) => {
      const quantity = cart[product.id];
      const unitPrice = Number(product.price || 0);

      return {
        ...product,
        quantity,
        subtotal: quantity * unitPrice,
      };
    });

  const cartTotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);

  useEffect(() => {
    fetchActiveProducts();
  }, [fetchActiveProducts]);

  const handleProceedOrder = () => {
    if (!cartItems.length) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/customer/auth', { state: { from: location.pathname } });
      return;
    }

    navigate('/checkout');
  };

  return (
    <div className="space-y-8">
      <section id="produtos" className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Produtos</p>
              <h2 className="section-title mt-2">Escolha seus itens</h2>
            </div>
          </div>

          {isLoading && (
            <div className="card p-6">
              <p className="text-slate-600">Carregando produtos ativos...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="card p-6">
              <p className="font-medium text-red-600">Erro ao buscar produtos</p>
              <p className="mt-2 text-sm text-slate-600">{error}</p>
            </div>
          )}

          {!isLoading && !error && products.length === 0 && (
            <div className="card p-6">
              <p className="text-slate-600">Nenhum produto ativo com estoque encontrado.</p>
            </div>
          )}

          {!isLoading && !error && products.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              {products.map((product) => {
                const quantity = cart[product.id] || 0;
                const stock = Number(product.amount) || 0;
                const isAddDisabled = quantity >= stock;

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={quantity}
                    onIncrement={() => incrementItem(product.id)}
                    onDecrement={() => decrementItem(product.id)}
                    disableIncrement={isAddDisabled}
                    disableDecrement={quantity === 0}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          <div className="flex justify-end">
            {cartItems.length > 0 && (
              <button type="button" className="text-sm font-semibold text-brand-700 hover:text-brand-800" onClick={clearCart}>
                Limpar itens
              </button>
            )}
          </div>
          <CartSummary
            items={cartItems}
            total={cartTotal}
            actionLabel="Confirmar Pedido"
            disabled={!cartItems.length}
            onAction={handleProceedOrder}
          />
        </div>
      </section>
    </div>
  );
}
