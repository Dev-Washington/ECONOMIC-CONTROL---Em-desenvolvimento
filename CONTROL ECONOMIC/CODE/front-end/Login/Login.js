// Variáveis globais
let currentUser = null;

// Sistema de usuários e níveis de acesso
let userDatabase = {
    'admin@control.com': {
        password: '123456',
        name: 'Desenvolvedores',
        role: 'admin',
        permissions: ['dashboard', 'users', 'reports', 'settings', 'analytics']
    },
    'superadmin@control.com': {
        password: 'admin123',
        name: 'Super Administrador',
        role: 'superadmin',
        permissions: ['dashboard', 'users', 'reports', 'settings', 'analytics', 'system', 'backup']
    },
    'user@control.com': {
        password: 'user123',
        name: 'Usuário Padrão',
        role: 'user',
        permissions: ['dashboard', 'reports']
    },
    'manager@control.com': {
        password: 'manager123',
        name: 'Gerente',
        role: 'manager',
        permissions: ['dashboard', 'users', 'reports', 'analytics']
    }
};

// Função para adicionar novo usuário ao banco de dados
function addUserToDatabase(email, password, name) {
    userDatabase[email.toLowerCase()] = {
        password: password,
        name: name,
        role: 'user',
        permissions: ['dashboard', 'reports']
    };
}

// Função para adicionar usuário ao banco de dados local (para registro)
function addUserToLocalDatabase(email, password, name) {
    // Criar objeto de usuário
    const newUser = {
        email: email.toLowerCase(),
        password: password,
        name: name,
        role: 'user',
        permissions: ['dashboard', 'reports'],
        createdAt: new Date().toISOString()
    };
    
    // Salvar no localStorage para persistência
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

// Sistema de gerenciamento de sessão
const sessionManager = {
    // Verificar se usuário está logado
    isLoggedIn() {
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        if (!userData) return false;
        
        const user = JSON.parse(userData);
        const now = new Date();
        const loginTime = new Date(user.loginTime);
        
        // Verificar se a sessão não expirou (24 horas)
        const sessionTimeout = 24 * 60 * 60 * 1000; // 24 horas em ms
        if (now - loginTime > sessionTimeout) {
            this.logout();
            return false;
        }
        
        return true;
    },
    
    // Obter dados do usuário atual
    getUser() {
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    },
    
    // Verificar se usuário tem permissão específica
    hasPermission(permission) {
        const user = this.getUser();
        return user && user.permissions && user.permissions.includes(permission);
    },
    
    // Verificar se usuário tem role específico
    hasRole(role) {
        const user = this.getUser();
        return user && user.role === role;
    },
    
    // Verificar se é administrador
    isAdmin() {
        return this.hasRole('admin') || this.hasRole('superadmin');
    },
    
    // Verificar se é super administrador
    isSuperAdmin() {
        return this.hasRole('superadmin');
    },
    
    // Atualizar último acesso
    updateLastAccess() {
        const user = this.getUser();
        if (user) {
            user.lastAccess = new Date().toISOString();
            const storage = localStorage.getItem('userData') ? localStorage : sessionStorage;
            storage.setItem('userData', JSON.stringify(user));
        }
    },
    
    // Logout
    logout() {
        const user = this.getUser();
        if (user) {
            logUserAccess(user.email, user.role, 'logout');
        }
        
        localStorage.removeItem('userData');
        sessionStorage.removeItem('userData');
        currentUser = null;
        // Não redirecionar aqui - deixar para a função que chama decidir o redirecionamento
    },
    
    // Redirecionar para registro se não estiver logado
    redirectToRegisterIfNotLoggedIn() {
        if (!this.isLoggedIn()) {
            window.location.href = '../Register/Register.html';
        }
    }
};

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Adicionar event listeners aos formulários
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Adicionar validação em tempo real
    addRealTimeValidation();
    
    // Verificar se há usuário logado
    checkLoggedUser();
}

// Redireciona para a tela de carregamento e depois para o destino (padrão: bord1)
function redirectAfterAuth(targetPath) {
    const target = targetPath || '../dasbord_inicial/bord1.html';
    const delayMs = 4000;
    window.location.href = `../tela_carregamento/telacar.html?to=${encodeURIComponent(target)}&delay=${delayMs}`;
}

// Função para mostrar o modal de registro
function showRegister() {
    console.log('showRegister() chamada - redirecionando para Register.html');
    // Redirecionar para a página de registro
    try {
        window.location.href = '../Register/Register.html';
    } catch (error) {
        console.error('Erro ao redirecionar para Register.html:', error);
        // Tentar caminho absoluto como fallback
        window.location.href = './Register/Register.html';
    }
}

// Função para ir para a página de registro
function goToRegister() {
    console.log('goToRegister() chamada - redirecionando para Register.html');
    try {
        window.location.href = '../Register/Register.html';
    } catch (error) {
        console.error('Erro ao redirecionar para Register.html:', error);
        // Tentar caminho absoluto como fallback
        window.location.href = './Register/Register.html';
    }
}

// Função de teste para redirecionamento
function testRedirect() {
    console.log('testRedirect() chamada');
    console.log('URL atual:', window.location.href);
    console.log('Tentando redirecionar para Register.html...');
    
    // Testar se o arquivo existe
    fetch('../Register/Register.html')
        .then(response => {
            console.log('Resposta do fetch:', response.status);
            if (response.ok) {
                console.log('Arquivo Register.html encontrado, redirecionando...');
                window.location.href = '../Register/Register.html';
            } else {
                console.error('Arquivo Register.html não encontrado');
                alert('Erro: Arquivo Register.html não encontrado');
            }
        })
        .catch(error => {
            console.error('Erro ao verificar arquivo:', error);
            console.log('Tentando redirecionamento direto...');
            window.location.href = '../Register/Register.html';
        });
}

// Função para fechar o modal de registro
function closeRegister() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Limpar formulário
        const form = document.getElementById('registerForm');
        if (form) {
            form.reset();
            clearValidationErrors(form);
        }
    }
}

// Fechar modal clicando fora dele
window.onclick = function(event) {
    const modal = document.getElementById('registerModal');
    if (event.target === modal) {
        closeRegister();
    }
}

// Função para lidar com o login
function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const email = formData.get('email');
    const password = formData.get('password');
    const remember = document.getElementById('remember').checked;
    
    // Validação básica
    if (!validateEmail(email)) {
        showError('email', 'Por favor, insira um email válido');
        return;
    }
    
    if (password.length < 6) {
        showError('password', 'A senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    // Simular login (aqui você conectaria com sua API)
    simulateLogin(email, password, remember);
}

// Função para lidar com o registro
function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const terms = document.getElementById('terms').checked;
    
    // Validações
    if (!validateName(name)) {
        showError('regName', 'Nome deve ter pelo menos 2 caracteres');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('regEmail', 'Por favor, insira um email válido');
        return;
    }
    
    if (password.length < 6) {
        showError('regPassword', 'A senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('regConfirmPassword', 'As senhas não coincidem');
        return;
    }
    
    if (!terms) {
        showError('terms', 'Você deve aceitar os termos de uso');
        return;
    }
    
    // Simular registro (aqui você conectaria com sua API)
    simulateRegister(name, email, password);
}

// Funções de login social
function loginWithGoogle() {
    // Integração real com Google OAuth 2.0 usando popup
    // Substitua pelo seu CLIENT_ID do Google Cloud Console
    const CLIENT_ID = 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com';
    const REDIRECT_URI = window.location.origin + '/front-end/Login/google-callback.html';
    const SCOPE = 'email profile openid';
    const RESPONSE_TYPE = 'token id_token';
    const STATE = Math.random().toString(36).substring(2);

    // Monta a URL de autenticação do Google
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${encodeURIComponent(RESPONSE_TYPE)}&scope=${encodeURIComponent(SCOPE)}&state=${encodeURIComponent(STATE)}&prompt=select_account`;

    // Abre popup para o usuário escolher a conta Google
    const width = 500;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const popup = window.open(
        authUrl,
        'GoogleLogin',
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
    );

    // Listener para receber mensagem do popup (google-callback.html)
    window.addEventListener('message', function handleGoogleLogin(event) {
        // Verifica origem por segurança
        if (event.origin !== window.location.origin) return;
        if (event.data && event.data.type === 'google-auth-success') {
            // Aqui você pode pegar o token e os dados do usuário
            const { profileObj, tokenObj } = event.data;
            // Exemplo: salvar usuário e redirecionar
            showLoading('Entrando com Google...');
            setTimeout(() => {
                hideLoading();
                showSuccess('Login com Google realizado com sucesso!');
                // Salvar dados do usuário
                const userData = {
                    email: profileObj.email,
                    name: profileObj.name,
                    role: 'user',
                    permissions: ['dashboard', 'reports'],
                    loginTime: new Date().toISOString(),
                    googleId: profileObj.sub
                };
                localStorage.setItem('userData', JSON.stringify(userData));
                setTimeout(() => {
                    redirectAfterAuth();
                }, 1500);
            }, 1000);
            window.removeEventListener('message', handleGoogleLogin);
        } else if (event.data && event.data.type === 'google-auth-error') {
            showError('', 'Erro ao autenticar com Google');
            window.removeEventListener('message', handleGoogleLogin);
        }
    });
}

// Função auxiliar para obter a URL atual (sem hash)
function getCurrentUrlWithoutHash() {
    return window.location.origin + window.location.pathname + window.location.search;
}

// Função para login com GitHub
function loginWithGithub() {
    // Redireciona para página de login do GitHub OAuth
    // Substitua CLIENT_ID e ajuste REDIRECT_URI conforme seu app
    const CLIENT_ID = 'SEU_CLIENT_ID_GITHUB';
    // Após login, o usuário será redirecionado de volta para esta página
    const REDIRECT_URI = encodeURIComponent(getCurrentUrlWithoutHash() + '?oauth=github');
    const SCOPE = 'read:user user:email';
    const STATE = Math.random().toString(36).substring(2);

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}`;

    // Salva a URL de retorno para depois do login
    localStorage.setItem('postSocialLoginRedirect', '../dashboard/dashboard.html');

    window.location.href = authUrl;
}

// Função para login com LinkedIn
function loginWithLinkedin() {
    // Redireciona para página de login do LinkedIn OAuth
    // Substitua CLIENT_ID e ajuste REDIRECT_URI conforme seu app
    const CLIENT_ID = 'SEU_CLIENT_ID_LINKEDIN';
    // Após login, o usuário será redirecionado de volta para esta página
    const REDIRECT_URI = encodeURIComponent(getCurrentUrlWithoutHash() + '?oauth=linkedin');
    const SCOPE = 'r_liteprofile r_emailaddress';
    const STATE = Math.random().toString(36).substring(2);

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}`;

    // Salva a URL de retorno para depois do login
    localStorage.setItem('postSocialLoginRedirect', '../dashboard/dashboard.html');

    window.location.href = authUrl;
}

// Funções de registro social
function registerWithGoogle() {
    // Mesma lógica do login, mas pode diferenciar se necessário
    loginWithGoogle();
}

function registerWithGithub() {
    // Para registro, também redireciona para login do GitHub
    loginWithGithub();
}

function registerWithLinkedin() {
    // Para registro, também redireciona para login do LinkedIn
    loginWithLinkedin();
}

// Função para esqueci minha senha
function forgotPassword() {
    // Redirecionar para a página de esqueci a senha
    window.location.href = '../esqueci senha/senha.html';
}

// Função para alternar visibilidade da senha
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentNode.querySelector('.password-toggle');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.style.opacity = '1';
    } else {
        input.type = 'password';
        toggle.style.opacity = '0.6';
    }
}

// Funções de validação
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateName(name) {
    return name && name.trim().length >= 2;
}

function validatePassword(password) {
    return password && password.length >= 6;
}

// Função para adicionar validação em tempo real
function addRealTimeValidation() {
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Função para validar campo individual
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name || field.id;
    
    clearFieldError(field);
    
    switch (fieldName) {
        case 'email':
        case 'regEmail':
            if (value && !validateEmail(value)) {
                showFieldError(field, 'Email inválido');
            }
            break;
        case 'password':
        case 'regPassword':
            if (value && !validatePassword(value)) {
                showFieldError(field, 'Senha deve ter pelo menos 6 caracteres');
            }
            break;
        case 'name':
        case 'regName':
            if (value && !validateName(value)) {
                showFieldError(field, 'Nome deve ter pelo menos 2 caracteres');
            }
            break;
        case 'confirmPassword':
            const password = document.getElementById('regPassword').value;
            if (value && value !== password) {
                showFieldError(field, 'As senhas não coincidem');
            }
            break;
    }
}

// Funções de simulação (substitua por chamadas reais à API)
function simulateLogin(email, password, remember) {
    showLoading('Entrando...');
    
    // Simular delay da API
    setTimeout(() => {
        hideLoading();
        
        // Verificar credenciais no banco de dados
        let user = userDatabase[email.toLowerCase()];
        
        // Se não encontrou no banco principal, verificar usuários registrados
        if (!user) {
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const registeredUser = registeredUsers.find(u => u.email === email.toLowerCase());
            if (registeredUser) {
                user = registeredUser;
            }
        }
        
        if (user && user.password === password) {
            showSuccess(`Login realizado com sucesso! Bem-vindo, ${user.name}`);
            
            // Salvar dados do usuário com informações de role
            const userData = {
                email: email.toLowerCase(),
                name: user.name,
                role: user.role,
                permissions: user.permissions,
                loginTime: new Date().toISOString(),
                lastAccess: new Date().toISOString()
            };
            
            if (remember) {
                localStorage.setItem('userData', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('userData', JSON.stringify(userData));
            }
            
            // Log de acesso
            logUserAccess(email, user.role, 'login_success');
            
            // Redirecionar baseado no role
            setTimeout(() => {
                redirectBasedOnRole(user.role);
            }, 1500);
        } else {
            showError('', 'Email ou senha incorretos');
            logUserAccess(email, 'unknown', 'login_failed');
        }
    }, 2000);
}

// Função para redirecionar baseado no role do usuário
function redirectBasedOnRole(role) {
    let targetPath;
    
    switch(role) {
        case 'superadmin':
        case 'admin':
        case 'manager':
            // Todos os níveis administrativos vão para o mesmo painel
            targetPath = '../Admin/AdminDashboard.html';
            break;
        case 'user':
        default:
            // Usuários normais vão para a tela principal
            targetPath = '../tela_principal1/principal.html';
            break;
    }
    
    redirectAfterAuth(targetPath);
}

// Função para log de acesso
function logUserAccess(email, role, action) {
    const logEntry = {
        email: email,
        role: role,
        action: action,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1', // Em produção, pegar IP real
        userAgent: navigator.userAgent
    };
    
    // Salvar log localmente (em produção, enviar para servidor)
    const logs = JSON.parse(localStorage.getItem('accessLogs') || '[]');
    logs.push(logEntry);
    
    // Manter apenas os últimos 100 logs
    if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('accessLogs', JSON.stringify(logs));
}

function simulateRegister(name, email, password) {
    showLoading('Criando conta...');
    
    setTimeout(() => {
        hideLoading();
        showSuccess('Conta criada com sucesso! Redirecionando para login...');
        
        // Adicionar usuário ao banco de dados local
        addUserToLocalDatabase(email, password, name);
        
        // Salvar email para preenchimento automático no login
        localStorage.setItem('registeredEmail', email);
        
        closeRegister();
        
        // Redirecionar para a página de login
        setTimeout(() => {
            window.location.href = '../Login/Login.html';
        }, 2000);
    }, 2000);
}

// Função para verificar usuário logado
function checkLoggedUser() {
    // Verificar se há email na URL (vindo do registro)
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    
    // Verificar se há email salvo no localStorage (vindo do registro)
    const registeredEmail = localStorage.getItem('registeredEmail');
    if (registeredEmail && !emailFromUrl) {
        // Preencher campo de email automaticamente
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = registeredEmail;
            // Focar no campo de senha
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.focus();
            }
        }
        
        // Limpar email do localStorage
        localStorage.removeItem('registeredEmail');
        
        // Mostrar mensagem de boas-vindas
        setTimeout(() => {
            showNotification('Conta criada com sucesso! Agora faça login com sua senha.', 'success');
        }, 500);
    }
    
    if (emailFromUrl) {
        // Preencher campo de email automaticamente
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = decodeURIComponent(emailFromUrl);
            // Focar no campo de senha
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.focus();
            }
        }
        
        // Mostrar mensagem de boas-vindas
        setTimeout(() => {
            showNotification('Conta criada com sucesso! Agora faça login com sua senha.', 'success');
        }, 500);
    }
    
    // Verifica se retornou de um login social (GitHub/LinkedIn)
    const oauth = urlParams.get('oauth');
    if (oauth === 'github' || oauth === 'linkedin') {
        // Aqui você faria a chamada para sua API/backend para trocar o "code" por um token e obter os dados do usuário
        // Para simulação, vamos apenas salvar um usuário fake e redirecionar
        showLoading('Finalizando login social...');
        setTimeout(() => {
            hideLoading();
            showSuccess('Login social realizado com sucesso!');
            // Salvar dados fake do usuário
            const userData = {
                email: oauth === 'github' ? 'githubuser@exemplo.com' : 'linkedinuser@exemplo.com',
                name: oauth === 'github' ? 'GitHub User' : 'LinkedIn User',
                role: 'user',
                permissions: ['dashboard', 'reports'],
                loginTime: new Date().toISOString(),
                social: oauth
            };
            localStorage.setItem('userData', JSON.stringify(userData));
            // Redireciona para a página desejada após login
            const redirectUrl = localStorage.getItem('postSocialLoginRedirect') || '../dasbord_inicial/bord1.html';
            localStorage.removeItem('postSocialLoginRedirect');
            setTimeout(() => {
                redirectAfterAuth(redirectUrl);
            }, 1200);
        }, 1500);
        return;
    }

    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (userData) {
        currentUser = JSON.parse(userData);
        // Se já estiver logado, redirecionar para dashboard
        // window.location.href = '../dashboard/dashboard.html';
    }
}

// Funções de feedback visual
function showError(fieldId, message) {
    if (fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            showFieldError(field, message);
        }
    } else {
        showNotification(message, 'error');
    }
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remover mensagem de erro anterior
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Adicionar nova mensagem de erro
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function clearValidationErrors(form) {
    const errorFields = form.querySelectorAll('.error');
    const errorMessages = form.querySelectorAll('.error-message');
    
    errorFields.forEach(field => field.classList.remove('error'));
    errorMessages.forEach(message => message.remove());
}

function showLoading(message) {
    // Criar overlay de loading
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
        font-size: 1.2rem;
    `;
    loadingOverlay.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 50px; height: 50px; border: 3px solid #333; border-top: 3px solid #4CAF50; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            ${message}
        </div>
    `;
    
    // Adicionar animação CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(loadingOverlay);
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    }
    
    notification.textContent = message;
    
    // Adicionar animação CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Função para logout (compatibilidade)
function logout() {
    sessionManager.logout();
}

// Exportar funções para uso global
window.showRegister = showRegister;
window.goToRegister = goToRegister;
window.testRedirect = testRedirect;
window.closeRegister = closeRegister;
window.loginWithGoogle = loginWithGoogle;
window.loginWithGithub = loginWithGithub;
window.loginWithLinkedin = loginWithLinkedin;
window.registerWithGoogle = registerWithGoogle;
window.registerWithGithub = registerWithGithub;
window.registerWithLinkedin = registerWithLinkedin;
window.forgotPassword = forgotPassword;
window.togglePassword = togglePassword;
window.logout = logout;
window.sessionManager = sessionManager;
