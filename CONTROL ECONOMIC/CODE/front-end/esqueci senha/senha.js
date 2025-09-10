// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Adicionar event listener ao formulário
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Adicionar validação em tempo real
    addRealTimeValidation();
}

// Função para lidar com o envio do email de recuperação
function handleForgotPassword(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const email = formData.get('email');
    
    // Validação básica
    if (!validateEmail(email)) {
        showError('email', 'Por favor, insira um email válido');
        return;
    }
    
    // Simular envio de email (aqui você conectaria com sua API)
    simulateSendEmail(email);
}

// Função para ir para a página de login
function goToLogin() {
    window.location.href = '../Login/Login.html';
}

// Funções de validação
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Função para adicionar validação em tempo real
function addRealTimeValidation() {
    const inputs = document.querySelectorAll('input[type="email"]');
    
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
            if (value && !validateEmail(value)) {
                showFieldError(field, 'Email inválido');
            }
            break;
    }
}

// Função de simulação (substitua por chamadas reais à API)
function simulateSendEmail(email) {
    showLoading('Enviando email de recuperação...');
    
    setTimeout(() => {
        hideLoading();
        showSuccess('Email de recuperação enviado! Verifique sua caixa de entrada e spam.');
        
        // Limpar formulário
        document.getElementById('forgotPasswordForm').reset();
        
        // Opcional: redirecionar após alguns segundos
        setTimeout(() => {
            window.location.href = '../Login/Login.html';
        }, 3000);
    }, 2000);
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

function showLoading(message) {
    // Criar overlay de loading
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div style="text-align: center;">
            <div class="loading-spinner"></div>
            ${message}
        </div>
    `;
    
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
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
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

// Exportar funções para uso global
window.goToLogin = goToLogin;
