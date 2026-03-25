# Hook useToast - Notificações Toast

Sistema centralizado de notificações usando a library **Sonner**.

## 📦 Instalação

```bash
npm install sonner
```

## 🎯 Uso Básico

### Importar o hook

```javascript
import { useToast } from '../../hooks/useToast';

export default function MyComponent() {
  const { success, error, loading, info, promise, dismiss } = useToast();

  // ... seu código
}
```

### Notificação de Sucesso

```javascript
const { success } = useToast();

// Simples
success('Operação realizada!');

// Com opções
success('Produto criado!', {
  duration: 5000, // Manter por 5 segundos
  icon: '🎉', // Ícone customizado
});
```

### Notificação de Erro

```javascript
const { error } = useToast();

error('Erro ao salvar produto');
error('Email já cadastrado', {
  duration: 4000,
});
```

### Notificação de Carregamento

```javascript
const { loading, dismiss } = useToast();

// Mostrar loading
const toastId = loading('Salvando...');

// Depois esconder
dismiss(toastId);
```

### Promise Toast (Para requisições)

```javascript
const { promise } = useToast();

const myPromise = fetch('/api/products').then((r) => r.json());

promise(myPromise, {
  loading: 'Carregando produtos...',
  success: 'Productos carregados! ✅',
  error: 'Erro ao carregar produtos',
});
```

### Notificação de Info

```javascript
const { info } = useToast();

info('Este é um aviso');
```

## 🎨 Posições Disponíveis

Por padrão, o toast aparece em `top-right`. Você pode personalizar:

```javascript
success('Mensagem', {
  position: 'top-left',    // top-left, top-right, top-center
             'bottom-left', // bottom-left, bottom-right, bottom-center
});
```

## 📋 Tipos de Notificação

Cada tipo tem um tempo de exibição padrão:

| Tipo        | Duração | Cor      | Ícone |
| ----------- | ------- | -------- | ----- |
| `success()` | 3s      | Verde    | ✅    |
| `error()`   | 4s      | Vermelho | ❌    |
| `loading()` | ∞       | Âmbar    | ⏳    |
| `info()`    | 3s      | Azul     | ℹ️    |

## 💡 Exemplos Reais

### Criar Produto

```javascript
const { success, error, loading, dismiss } = useToast();

async function handleCreateProduct(formData) {
  const toastId = loading('Criando produto...');

  try {
    const result = await createProduct(formData, accessToken);
    dismiss(toastId);
    success(`Produto "${result.name}" criado com sucesso! 🎉`);
    setProducts((prev) => [...prev, result]);
  } catch (err) {
    dismiss(toastId);
    error(err?.response?.data?.error || 'Erro ao criar produto');
  }
}
```

### Atualizar Endereço

```javascript
const { success, error } = useToast();

async function handleUpdateAddress(address) {
  try {
    const result = await updateAddress(address, token);
    success('Endereço atualizado! 📍');
    setCustomer(result);
  } catch (err) {
    error('Erro ao atualizar endereço');
  }
}
```

### Deletar com Confirmação

```javascript
const { success, error } = useToast();

async function handleDelete(id) {
  if (!window.confirm('Tem certeza?')) return;

  try {
    await deleteItem(id, token);
    success('Item deletado! 🗑️');
  } catch (err) {
    error('Erro ao deletar');
  }
}
```

## 🎯 Boas Práticas

✅ **Use mensagens claras**

```javascript
// Bom
success('Produto "Açúcar 5kg" criado com sucesso!');

// Ruim
success('OK');
```

✅ **Adicione emojis relevantes**

```javascript
success('Pedido enviado! 📦');
error('Pagamento recusado! 💳');
info('Sessão expirando em 2 minutos ⏰');
```

✅ **Trate erros do backend**

```javascript
catch (err) {
  const msg = err?.response?.data?.error || 'Erro desconhecido';
  error(msg);
}
```

✅ **Use loading para requisições longas**

```javascript
const toastId = loading('Processando...');
try {
  await slowOperation();
  dismiss(toastId);
  success('Concluído!');
} catch (err) {
  dismiss(toastId);
  error('Falhou');
}
```

❌ **Não abuse de toasts**

```javascript
// Ruim - Spam
for (let i = 0; i < 100; i++) {
  success(`Item ${i} adicionado`);
}

// Bom
success('100 itens adicionados com sucesso!');
```

## 🎨 Customização de Estilo

Os toasts usam classes Tailwind CSS definidas em `src/index.css`:

```css
:global([data-sonner-toast][data-type='success']) {
  @apply border-emerald-200 bg-emerald-50;
}

:global([data-sonner-toast][data-type='error']) {
  @apply border-red-200 bg-red-50;
}
```

Para customizar, edite o arquivo CSS.

## 📚 Referência Completa

```javascript
const {
  success, // Sucesso - cor verde, 3s padrão
  error, // Erro - cor vermelha, 4s padrão
  loading, // Carregando - cor âmbar, duração infinita
  info, // Info - cor azul, 3s padrão
  promise, // Promise toast para requisições
  dismiss, // Função para remover um toast por ID
} = useToast();
```

---

**Última atualização:** 25/03/2026
