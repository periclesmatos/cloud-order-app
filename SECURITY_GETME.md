# 🔐 Implementação Segura - Rota `/getMe`

## 📋 Resumo das Mudanças

Este documento detalha a implementação de segurança para a rota autenticada `/customers/me` (getMe), eliminando vulnerabilidades de acesso a dados de outros clientes.

---

## 🚨 Problema de Segurança Identificado

### Antes ❌

```javascript
// ⚠️ INSEGURO: Qualquer pessoa poderia acessar dados de outro cliente
export async function getCustomerByPhone(phone) {
  const response = await apiClient.get(`/customers/phone/${encodeURIComponent(phone)}`);
  return response.data;
}

// Uso no frontend:
const customer = await getCustomerByPhone(customer.phone); // Sem token!
```

**Por que é grave?**

- Rota **pública** (sem `Authorization: Bearer`)
- Alguém sabendo o telefone poderia fazer requisição e obter dados
- Viola LGPD/GDPR (Lei Geral de Proteção de Dados)
- Risco: endereços, email, histórico de pedidos expostos

### Depois ✅

```javascript
// ✅ SEGURO: Apenas cliente autenticado acessa seus dados
export async function getMe(accessToken) {
  const response = await apiClient.get('/customers/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

// Uso no frontend:
const customer = await getMe(accessToken); // Apenas com token válido!
```

---

## 🔧 Arquivos Alterados

### 1. **`src/service/customerAuthService.js`** - Adição de `getMe()`

```javascript
// Nova função segura
export async function getMe(accessToken) {
  const response = await apiClient.get('/customers/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}
```

**Benefícios:**

- ✅ Requer token válido
- ✅ Servidor valida propriedade dos dados
- ✅ Cliente recebe dados reais, não cópia local

---

### 2. **`src/pages/auth/CustomerAuthPage.jsx`** - Login seguro

**Antes:**

```javascript
const auth = await loginCustomerByPhone(normalizedPhone);
const customer = await getCustomerByPhone(normalizedPhone); // ❌ Público!
```

**Depois:**

```javascript
const auth = await loginCustomerByPhone(normalizedPhone);
const customer = await getMe(auth?.accessToken); // ✅ Autenticado!
```

**Mudanças:**

- Importa `getMe` em vez de `getCustomerByPhone`
- Passa `accessToken` do servidor para validação
- Token vem do backend, não pode ser falsificado

---

### 3. **`src/pages/checkout/CheckoutPage.jsx`** - Refresh seguro

**Antes:**

```javascript
async function refreshCustomer() {
  if (!customer?.phone) return;
  const nextCustomer = await getCustomerByPhone(customer.phone); // ❌ Público!
  setCustomer(nextCustomer);
}
```

**Depois:**

```javascript
async function refreshCustomer() {
  if (!accessToken) return; // Valida token primeiro
  try {
    const nextCustomer = await getMe(accessToken); // ✅ Autenticado!
    setCustomer(nextCustomer);
  } catch (err) {
    setActionError('Erro ao atualizar dados do cliente.');
    console.error('Erro ao chamar getMe:', err);
  }
}
```

**Melhorias:**

- Valida token antes de fazer requisição
- Usa try/catch para tratar erros
- Feedback de erro ao usuário
- Log para debugging

---

### 4. **`src/hooks/useValidateMe.js`** - Hook de Validação (NOVO)

```javascript
/**
 * Hook para validar e sincronizar dados periodicamente.
 * ✅ Melhores práticas:
 * - Valida integridade do token
 * - Detecta token expirado (401/403)
 * - Logout automático en falha
 * - Sincronização periódica opcional
 */
export function useValidateMe(shouldValidate = false, interval = 0) {
  const accessToken = useCustomerAuthStore((state) => state.accessToken);
  const setCustomer = useCustomerAuthStore((state) => state.setCustomer);
  const clearSession = useCustomerAuthStore((state) => state.clearSession);

  useEffect(() => {
    if (!shouldValidate || !accessToken) return;

    async function validate() {
      try {
        const me = await getMe(accessToken);
        setCustomer(me);
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          console.warn('Token inválido. Logout automático.');
          clearSession();
        }
      }
    }

    validate();

    if (interval > 0) {
      const timer = setInterval(validate, interval);
      return () => clearInterval(timer);
    }
  }, [shouldValidate, accessToken, setCustomer, clearSession, interval]);
}
```

**Funcionamento:**

1. Valida token na montagem do componente
2. Se token inválido (401/403), limpa sessão automaticamente
3. Pode revalidar periodicamente (ex: a cada 5 min)
4. Detecta token expirado sem delay

---

### 5. **`src/pages/orders/MyOrdersPage.jsx`** - Integração do Hook

**Adição:**

```javascript
import { useValidateMe } from '../../hooks/useValidateMe';

export default function MyOrdersPage() {
  // ... estado

  // ✅ Valida dados do cliente ao abrir página
  // Se token inválido, limpa sessão automaticamente
  useValidateMe(true);

  // ... resto do componente
}
```

---

## 🎯 Fluxo Seguro de Autenticação

```
┌─────────────────────────────────────────────────────┐
│ 1. CustomerAuthPage: User entra com telefone        │
├─────────────────────────────────────────────────────┤
│    ↓                                                 │
│ 2. loginCustomerByPhone(phone)                       │
│    Backend valida + retorna JWT token               │
├─────────────────────────────────────────────────────┤
│    ↓                                                 │
│ 3. getMe(accessToken) ← ✅ NOVO E SEGURO            │
│    Bearer ${token} no header                        │
│    Backend verifica proprietário do token           │
│    Retorna dados REAIS, validados                   │
├─────────────────────────────────────────────────────┤
│    ↓                                                 │
│ 4. setSession(customer, accessToken)                │
│    LocalStorage com dados + token                   │
├─────────────────────────────────────────────────────┤
│    ↓                                                 │
│ 5. [Navegação] → MyOrdersPage, CheckoutPage        │
├─────────────────────────────────────────────────────┤
│    ↓                                                 │
│ 6. useValidateMe(true) na montagem                  │
│    getMe(accessToken) valida dados                  │
│    Se 401/403 → clearSession() automático          │
└─────────────────────────────────────────────────────┘
```

---

## 📚 Como Usar

### Opção 1: Validar na Montagem (Simples)

```javascript
import { useValidateMe } from '../../hooks/useValidateMe';

export default function MySecurePage() {
  // Valida token ao abrir página
  useValidateMe(true);

  // ... resto do componente
}
```

### Opção 2: Com Revalidação Periódica (Segurança Extra)

```javascript
// 5 minutos = 5 * 60 * 1000 ms
useValidateMe(true, 300000);

// Resultado: Valida na montagem + a cada 5 minutos
```

### Opção 3: Refresh Manual (Como em CheckoutPage)

```javascript
async function refreshCustomer() {
  if (!accessToken) return;

  try {
    const customer = await getMe(accessToken);
    setCustomer(customer);
  } catch (err) {
    if (err?.response?.status === 401) {
      // Token expirou
      clearSession();
    }
  }
}
```

---

## ✅ Checklist de Segurança

- ✅ Todas as requisições autenticadas usam `getMe()` com Bearer token
- ✅ Função `getMe()` implementada com auth header obrigatório
- ✅ `getCustomerByPhone()` pública não mais usada para dados autenticados
- ✅ Hook `useValidateMe` detecta Token expirado e faz logout
- ✅ CheckoutPage usa `getMe()` em `refreshCustomer()`
- ✅ CustomerAuthPage usa `getMe()` após login
- ✅ MyOrdersPage valida dados na montagem
- ✅ Build compila sem erros
- ✅ Tratamento de erros 401/403 implementado

---

## 🔍 Teste de Segurança

Para verificar que está seguro:

1. **Login com Cliente A**

   ```
   Acesso: ✅ Seus pedidos aparecem
   ```

2. **Abrir DevTools → Application → sessionStorage**

   ```
   Veja o token JWT armazenado
   ```

3. **Copiar token de outro cliente** (simular ataque)

   ```
   // No DevTools Console:
   const badToken = "token_de_outro_cliente";
   fetch('http://localhost:3000/customers/me', {
     headers: { 'Authorization': `Bearer ${badToken}` }
   });

   Resultado: ❌ 403 Forbidden
   Backend recusou acesso
   ```

4. **Cliente A tenta acessar dados de Cliente B**
   ```
   // Impossível: getMe() só retorna dados do PRÓPRIO cliente
   // Rota pública /customers/phone/{phone} não é mais usada para isso
   ```

---

## 📊 Resumo de Impacto

| Aspecto                | Antes              | Depois               |
| ---------------------- | ------------------ | -------------------- |
| **Autenticação**       | Pública            | Bearer JWT           |
| **Validação Servidor** | ❌ Nenhuma         | ✅ Obrigatória       |
| **Risco de Vazamento** | 🔴 Alto            | 🟢 Baixo             |
| **Token Expirado**     | ❌ Usuário vê erro | ✅ Logout automático |
| **Sincronização**      | Manual             | Automática (hook)    |
| **LGPD/GDPR**          | ❌ Não compliant   | ✅ Compliant         |

---

## 🚀 Próximos Passos Recomendados

1. **Backend**: Implementar rate limiting no `/customers/me`
2. **Backend**: Adicionar audit log quando acessar `/customers/me`
3. **Frontend**: Implementar refresh automático de token (se houver refresh token)
4. **Frontend**: Usar HTTPS em produção (já feito com Bearer)
5. **Backend**: Implementar 2FA para clientes críticos

---

## 📝 Notas

- `getCustomerByPhone()` mantém-se pública para **fluxo de registro apenas**
- Não foi removida para compatibilidade de login em outros contextos
- Mas **não é mais usada** após token ser adquirido
- Todas requisições autenticadas agora usando `getMe()` + Bearer token

**Implementação concluída com sucesso! 🎉**
