// Variáveis globais
let currentUser = null;

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Adicionar event listeners ao formulário
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Adicionar validação em tempo real
    addRealTimeValidation();
    
    // Verificar se há usuário logado
    checkLoggedUser();
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

// Função de simulação (substitua por chamadas reais à API)
function simulateRegister(name, email, password) {
    showLoading('Criando conta...');
    
    setTimeout(() => {
        hideLoading();
        showSuccess('Conta criada com sucesso! Redirecionando para login...');
        
        // Adicionar usuário ao banco de dados local
        addUserToLocalDatabase(email, password, name);
        
        // Salvar email para preenchimento automático no login
        localStorage.setItem('registeredEmail', email);
        
        // Redirecionar para login com email preenchido
        setTimeout(() => {
            window.location.href = '../Login/Login.html?email=' + encodeURIComponent(email);
        }, 2000);
    }, 2000);
}

// Função para adicionar usuário ao banco de dados local
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

// Função para verificar usuário logado
function checkLoggedUser() {
    // Verifica se retornou de um registro social (GitHub/LinkedIn)
    const urlParams = new URLSearchParams(window.location.search);
    const oauth = urlParams.get('oauth');
    if (oauth === 'github' || oauth === 'linkedin') {
        // Aqui você faria a chamada para sua API/backend para trocar o "code" por um token e obter os dados do usuário
        // Para simulação, vamos apenas salvar um usuário fake e redirecionar
        showLoading('Finalizando registro social...');
        setTimeout(() => {
            hideLoading();
            showSuccess('Registro social realizado com sucesso!');
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
            // Redireciona para a página desejada após registro
            const redirectUrl = localStorage.getItem('postSocialLoginRedirect') || '../tela_principal1/principal.html';
            localStorage.removeItem('postSocialLoginRedirect');
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1200);
        }, 1500);
        return;
    }

    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (userData) {
        currentUser = JSON.parse(userData);
        // Usuário já está logado. Não redirecionar automaticamente a partir da página de registro.
        // Mantemos o usuário nesta página para evitar navegação indesejada.
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

// Função para voltar ao login
function goToLogin() {
    console.log('goToLogin() chamada - redirecionando para Login.html');
    try {
        window.location.href = '../Login/Login.html';
    } catch (error) {
        console.error('Erro ao redirecionar para Login.html:', error);
        // Tentar caminho absoluto como fallback
        window.location.href = './Login/Login.html';
    }
}

// Exportar funções para uso global
window.registerWithGoogle = registerWithGoogle;
window.registerWithGithub = registerWithGithub;
window.registerWithLinkedin = registerWithLinkedin;
window.togglePassword = togglePassword;
window.goToLogin = goToLogin;