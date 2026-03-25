import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit2, Plus, Check, X, Package, DollarSign, Box, ToggleRight, Settings } from 'lucide-react';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  updateProductStock,
} from '../../service/productService';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/format';

function ProductForm({ product, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState(
    product || {
      name: '',
      description: '',
      price: '',
      amount: '',
      isActive: true,
    },
  );

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Nome do produto é obrigatório');
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError('Preço deve ser maior que zero');
      return;
    }

    if (!formData.amount || Number(formData.amount) < 0) {
      setError('Estoque não pode ser negativo');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Nome do Produto</label>
        <input
          type="text"
          name="name"
          className="input"
          placeholder="Ex: Açúcar"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Descrição</label>
        <textarea
          name="description"
          className="input min-h-20 resize-none"
          placeholder="Descrição do produto"
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Preço (R$)</label>
          <input
            type="number"
            name="price"
            className="input"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Estoque</label>
          <input
            type="number"
            name="amount"
            className="input"
            placeholder="0"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          disabled={loading}
          className="h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm font-medium text-slate-700">Ativo</span>
      </label>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? 'Salvando...' : product ? 'Atualizar' : 'Criar'}
        </button>
        <button type="button" className="btn-secondary flex-1" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const clearSession = useAdminAuthStore((state) => state.clearSession);
  const { success, error: toastError } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [stockInput, setStockInput] = useState({});

  useEffect(() => {
    async function loadProducts() {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await getAllProducts(accessToken);
        setProducts(data);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          clearSession();
          navigate('/admin/login');
          return;
        }
        setError('Erro ao carregar produtos');
        console.error('Erro ao carregar produtos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [accessToken, clearSession, navigate]);

  const filteredProducts = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return products.filter(
      (p) => !query || (p?.name && p.name.toLowerCase().includes(query)) || (p?.description && p.description.toLowerCase().includes(query)),
    );
  }, [products, searchText]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSubmitForm = async (formData) => {
    setFormLoading(true);
    setError('');

    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, formData, accessToken);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
        success(`Produto "${formData.name}" atualizado com sucesso! ✨`);
      } else {
        const created = await createProduct(formData, accessToken);
        setProducts((prev) => [...prev, created]);
        success(`Produto "${formData.name}" criado com sucesso! 🎉`);
      }
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      const errorMessage = err?.response?.data?.error || 'Erro ao salvar produto';
      setError(errorMessage);
      toastError(errorMessage);
      console.error('Erro:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return;

    setActionLoading(productId);
    setError('');

    try {
      await deleteProduct(productId, accessToken);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      success('Produto deletado com sucesso! 🗑️');
    } catch (err) {
      const errorMessage = err?.response?.data?.error || 'Erro ao deletar produto';
      setError(errorMessage);
      toastError(errorMessage);
      console.error('Erro:', err);
    } finally {
      setActionLoading('');
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    setActionLoading(productId);
    setError('');

    try {
      const updated = await toggleProductStatus(productId, !currentStatus, accessToken);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      const status = !currentStatus ? 'ativado' : 'desativado';
      success(`Produto ${status} com sucesso! ✅`);
    } catch (err) {
      const errorMessage = err?.response?.data?.error || 'Erro ao atualizar status';
      setError(errorMessage);
      toastError(errorMessage);
      console.error('Erro:', err);
    } finally {
      setActionLoading('');
    }
  };

  const handleUpdateStock = async (productId, newAmount) => {
    const amount = Number(newAmount);

    if (isNaN(amount) || amount < 0) {
      const msg = 'Estoque inválido. Digite um número válido maior ou igual a 0.';
      setError(msg);
      toastError(msg);
      return;
    }

    setActionLoading(productId);
    setError('');

    try {
      const updated = await updateProductStock(productId, amount, accessToken);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      setStockInput((prev) => ({ ...prev, [productId]: '' }));
      success(`Estoque atualizado para ${amount} unidades! 📦`);
    } catch (err) {
      const errorMessage = err?.response?.data?.error || 'Erro ao atualizar estoque';
      setError(errorMessage);
      toastError(errorMessage);
      console.error('Erro ao atualizar estoque:', err?.response?.data || err.message);
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <section className="card p-8">
        <p className="text-slate-600">Carregando produtos...</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Gerenciamento</p>
        <h1 className="section-title mt-2">Produtos</h1>
      </div>

      {error && (
        <section className="card p-4">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </section>
      )}

      {showForm && (
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
          <ProductForm product={editingProduct} onSubmit={handleSubmitForm} onCancel={() => setShowForm(false)} loading={formLoading} />
        </section>
      )}

      <section className="card p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            className="input"
            placeholder="Buscar por nome ou descrição..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAddProduct}
            disabled={showForm}
            className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2 text-sm whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </button>
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <section className="card p-8 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <p className="text-lg font-semibold text-slate-900">Nenhum produto encontrado</p>
          <p className="mt-1 text-sm text-slate-500">Crie um novo produto para começar</p>
        </section>
      ) : (
        <section className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-gradient-to-r from-slate-100 to-slate-50">
                <th className="px-6 py-5 text-left">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-bold text-slate-800 tracking-wide">PRODUTO</span>
                  </div>
                </th>
                <th className="px-6 py-5 text-left">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-bold text-slate-800 tracking-wide">PREÇO</span>
                  </div>
                </th>
                <th className="px-6 py-5 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <Box className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-bold text-slate-800 tracking-wide">ESTOQUE</span>
                  </div>
                </th>
                <th className="px-6 py-5 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <ToggleRight className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-bold text-slate-800 tracking-wide">STATUS</span>
                  </div>
                </th>
                <th className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Settings className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-bold text-slate-800 tracking-wide">AÇÕES</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-semibold">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="input w-16 text-center text-sm"
                        placeholder={String(product.amount)}
                        value={stockInput[product.id] ?? product.amount}
                        onChange={(e) => setStockInput((prev) => ({ ...prev, [product.id]: e.target.value }))}
                        disabled={actionLoading === product.id}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newAmount = stockInput[product.id] ?? product.amount;
                          handleUpdateStock(product.id, newAmount);
                        }}
                        disabled={actionLoading === product.id}
                        className="rounded px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                        title="Atualizar estoque"
                      >
                        OK
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(product.id, product.isActive)}
                        disabled={actionLoading === product.id}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all ${
                          product.isActive ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'
                        } disabled:opacity-50`}
                        title={product.isActive ? 'Clique para desativar' : 'Clique para ativar'}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                            product.isActive ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditProduct(product)}
                        disabled={showForm || actionLoading === product.id}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                      >
                        <Edit2 className="h-3 w-3" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={actionLoading === product.id}
                        className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
