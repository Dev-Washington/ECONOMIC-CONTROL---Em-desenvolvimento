// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    if (!sessionManager.isLoggedIn()) {
        // Se não estiver logado, redirecionar para login
        window.location.href = '../Login/Login.html';
        return;
    }
    
    // Atualizar informações do usuário na interface
    updateUserInfo();
    
    // Inicializar funcionalidades
    initializeFeatures();
});

// Atualizar informações do usuário na interface
function updateUserInfo() {
    const user = sessionManager.getUser();
    if (user) {
        // Atualizar nome do usuário
        const userNameElement = document.getElementById('userName');
        if (userNameElement && user.name) {
            userNameElement.textContent = user.name;
        }
    }
}

// Inicializar funcionalidades
function initializeFeatures() {
    // Adicionar event listeners
    addEventListeners();
    
    // Mostrar notificação de boas-vindas
    showWelcomeNotification();
}

// Adicionar event listeners
function addEventListeners() {
    // Navegação
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            setActiveNavLink(this);
        });
    });
}

// Definir link de navegação ativo
function setActiveNavLink(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

// Mostrar notificação de boas-vindas
function showWelcomeNotification() {
    const user = sessionManager.getUser();
    if (user) {
        setTimeout(() => {
            showNotification(`Bem-vindo de volta, ${user.name}!`, 'success');
        }, 1000);
    }
}

// Função para lidar com o clique no logo/home
function handleHomeClick() {
    // Se já estiver na tela principal e logado, não fazer nada
    if (sessionManager.isLoggedIn()) {
        // Scroll para o topo ou mostrar mensagem
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showNotification('Você já está na tela principal!', 'info');
        return;
    }
    
    // Se não estiver logado, redirecionar para criar conta
    sessionManager.redirectToRegisterIfNotLoggedIn();
}

// Funções de navegação
function goToDashboard() {
    showNotification('Redirecionando para o dashboard...', 'info');
    setTimeout(() => {
        window.location.href = '../dasbord_inicial/bord1.html';
    }, 500);
}

function addTransaction() {
    showNotification('Funcionalidade em desenvolvimento...', 'info');
    // Aqui você implementaria a lógica para adicionar transação
}

function viewReports() {
    showNotification('Funcionalidade em desenvolvimento...', 'info');
    // Aqui você implementaria a lógica para visualizar relatórios
}

function settings() {
    showNotification('Funcionalidade em desenvolvimento...', 'info');
    // Aqui você implementaria a lógica para configurações
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        showNotification('Saindo do sistema...', 'success');
        
        // Adicionar efeito visual
        document.body.style.transition = 'opacity 0.3s ease-out';
        document.body.style.opacity = '0.8';
        
        try {
            // Fazer logout usando o sistema de sessão
            sessionManager.logout();
            console.log('Logout realizado com sucesso');
            
            // Redirecionar com replace para evitar voltar
            setTimeout(() => {
                window.location.replace('../Login/Login.html');
            }, 1000);
            
        } catch (error) {
            console.error('Erro durante logout:', error);
            // Mesmo com erro, redirecionar
            setTimeout(() => {
                window.location.replace('../Login/Login.html');
            }, 500);
        }
    }
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Adicionar estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#4CAF50',
        'error': '#f44336',
        'warning': '#FF9800',
        'info': '#2196F3'
    };
    return colors[type] || '#2196F3';
}

// Adicionar estilos de animação para notificações
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
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Exportar funções para uso global
window.handleHomeClick = handleHomeClick;
window.goToDashboard = goToDashboard;
window.addTransaction = addTransaction;
window.viewReports = viewReports;
window.settings = settings;
window.logout = logout;
