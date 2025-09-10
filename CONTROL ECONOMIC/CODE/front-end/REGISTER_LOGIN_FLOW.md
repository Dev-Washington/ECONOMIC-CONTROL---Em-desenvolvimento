# Fluxo de Registro e Login - CONTROL

## ✅ Funcionalidade Implementada

### 🔄 **Fluxo Completo de Registro → Login:**

1. **Usuário acessa página de registro**
2. **Preenche formulário** com nome, email e senha
3. **Sistema cria conta** e salva no banco de dados local
4. **Redireciona para login** com email preenchido automaticamente
5. **Usuário digita senha** e faz login
6. **É redirecionado** para a tela principal

## 📋 **Detalhes da Implementação:**

### **1. Página de Registro (`Register/Register.html`)**
- ✅ Formulário completo com validações
- ✅ Campos: Nome, Email, Senha, Confirmar Senha
- ✅ Checkbox de termos de uso
- ✅ Link "Já tem uma conta? Faça login"

### **2. Processo de Registro (`Register.js`)**
```javascript
function simulateRegister(name, email, password) {
    // 1. Mostra loading "Criando conta..."
    // 2. Adiciona usuário ao banco local
    // 3. Salva email no localStorage
    // 4. Redireciona para login com email na URL
    window.location.href = '../Login/Login.html?email=' + encodeURIComponent(email);
}
```

### **3. Página de Login (`Login/Login.html`)**
- ✅ Detecta email na URL
- ✅ Preenche campo de email automaticamente
- ✅ Foca no campo de senha
- ✅ Mostra notificação de boas-vindas

### **4. Processo de Login (`Login.js`)**
```javascript
// Verifica email na URL
const emailFromUrl = urlParams.get('email');
if (emailFromUrl) {
    // Preenche email automaticamente
    emailInput.value = decodeURIComponent(emailFromUrl);
    // Foca na senha
    passwordInput.focus();
    // Mostra mensagem
    showNotification('Conta criada com sucesso! Agora faça login com sua senha.', 'success');
}
```

## 🗄️ **Sistema de Banco de Dados:**

### **Usuários Pré-cadastrados:**
```javascript
const userDatabase = {
    'admin@control.com': { password: '123456', role: 'admin' },
    'superadmin@control.com': { password: 'admin123', role: 'superadmin' },
    'user@control.com': { password: 'user123', role: 'user' },
    'manager@control.com': { password: 'manager123', role: 'manager' }
};
```

### **Usuários Registrados:**
- **Armazenamento**: localStorage
- **Chave**: `registeredUsers`
- **Formato**: Array de objetos JSON
- **Persistência**: Mantém dados entre sessões

## 🔄 **Fluxo Detalhado:**

### **Registro:**
```
1. Usuário preenche formulário
2. Validações (nome, email, senha, confirmação)
3. Loading: "Criando conta..."
4. Adiciona ao banco local
5. Notificação: "Conta criada com sucesso! Redirecionando para login..."
6. Redireciona para: Login.html?email=usuario@email.com
```

### **Login:**
```
1. Página de login carrega
2. Detecta email na URL
3. Preenche campo de email
4. Foca no campo de senha
5. Mostra: "Conta criada com sucesso! Agora faça login com sua senha."
6. Usuário digita senha
7. Sistema verifica credenciais
8. Login bem-sucedido
9. Redireciona para tela principal
```

## 🎯 **URLs e Redirecionamentos:**

### **Registro → Login:**
```
Register.html → Login.html?email=usuario@email.com
```

### **Login → Dashboard:**
```
Login.html → tela_principal1/principal.html (usuários normais)
Login.html → Admin/AdminDashboard.html (administradores)
```

## 🔐 **Validações Implementadas:**

### **Registro:**
- ✅ Nome: mínimo 2 caracteres
- ✅ Email: formato válido
- ✅ Senha: mínimo 6 caracteres
- ✅ Confirmação: senhas devem coincidir
- ✅ Termos: deve aceitar

### **Login:**
- ✅ Email: formato válido
- ✅ Senha: mínimo 6 caracteres
- ✅ Credenciais: verifica no banco

## 🧪 **Como Testar:**

### **1. Registro de Novo Usuário:**
1. Acesse `Register/Register.html`
2. Preencha: Nome, Email, Senha, Confirmação
3. Aceite os termos
4. Clique "Criar Conta"
5. Observe o redirecionamento para login
6. Verifique se o email está preenchido
7. Digite a senha e faça login

### **2. Login com Usuário Existente:**
1. Acesse `Login/Login.html`
2. Use credenciais pré-cadastradas
3. Faça login normalmente

## 📱 **Experiência do Usuário:**

### **Feedback Visual:**
- ✅ Loading durante criação da conta
- ✅ Notificação de sucesso
- ✅ Email preenchido automaticamente
- ✅ Foco automático no campo de senha
- ✅ Mensagem de boas-vindas

### **Navegação:**
- ✅ Link "Já tem uma conta?" no registro
- ✅ Redirecionamento automático
- ✅ URLs com parâmetros para preenchimento

## ✅ **Status Final:**
- ✅ Registro funcional
- ✅ Redirecionamento para login
- ✅ Email preenchido automaticamente
- ✅ Banco de dados local
- ✅ Validações completas
- ✅ Feedback visual
- ✅ Sem erros de linting

**O fluxo de registro → login está 100% funcional!** 🎉
