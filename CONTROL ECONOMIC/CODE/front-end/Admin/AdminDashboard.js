// Variáveis globais
let usersChart, rolesChart, performanceChart, resourcesChart;
let currentSection = 'overview';

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado e tem permissões administrativas
    if (!sessionManager.isLoggedIn() || (!sessionManager.isAdmin() && !sessionManager.hasRole('manager'))) {
        window.location.href = '../Login/Login.html';
        return;
    }
    
    initializeAdminDashboard();
});

function initializeAdminDashboard() {
    updateUserInfo();
    updateDashboardForRole();
    initializeCharts();
    initializeEventListeners();
    loadDashboardData();
    loadUsersData();
    loadLogsData();
    updateNotificationCount();
}

// Atualizar dashboard baseado no role do usuário
function updateDashboardForRole() {
    const user = sessionManager.getUser();
    if (!user) return;
    
    // Atualizar título da página baseado no role
    const pageTitle = document.querySelector('.page-title');
    const pageSubtitle = document.querySelector('.page-subtitle');
    const logoText = document.querySelector('.logo-text');
    
    switch(user.role) {
        case 'CeoControl':
            pageTitle.textContent = 'Dashboard Ceo Control';
            pageSubtitle.textContent = 'Painel de controle completo do sistema';
            logoText.textContent = 'Ceo Control';
            logoText.style.color = '#9C27B0'; // Roxo para ceo admin
            break;
        case 'admin':
            pageTitle.textContent = 'Dashboard Desenvolvedores';
            pageSubtitle.textContent = 'Painel de controle e gerenciamento do sistema';
            logoText.textContent = 'Desenvolvedores';
            logoText.style.color = '#ff6b35'; // Laranja para admin
            break;
        case 'manager':
            pageTitle.textContent = 'Dashboard Gerencial';
            pageSubtitle.textContent = 'Painel de controle e gerenciamento da equipe';
            logoText.textContent = 'MANAGER';
            logoText.style.color = '#2196F3'; // Azul para manager
            break;
    }
    
    // Mostrar/ocultar funcionalidades baseadas no role
    updateNavigationForRole(user.role);
}

// Atualizar navegação baseada no role
function updateNavigationForRole(role) {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const section = link.getAttribute('onclick').match(/'([^']+)'/)[1];
        
        // Manager não tem acesso a logs e algumas configurações
        if (role === 'manager') {
            if (section === 'logs' || section === 'settings') {
                item.style.display = 'none';
            }
        }
        
        // Super admin tem acesso a tudo
        if (role === 'CeoControl') {
            item.style.display = 'block';
        }
    });
}

// Inicializar gráficos
function initializeCharts() {
    // Gráfico de usuários ativos
    const usersCtx = document.getElementById('usersChart').getContext('2d');
    usersChart = new Chart(usersCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Usuários Ativos',
                data: [120, 135, 150, 140, 160, 175, 180, 170, 185, 190, 195, 200],
                borderColor: '#ff6b35',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff',
                        font: { size: 14 }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#888' },
                    grid: { color: '#333' }
                },
                y: {
                    ticks: { color: '#888' },
                    grid: { color: '#333' }
                }
            }
        }
    });

    // Gráfico de distribuição de roles
    const rolesCtx = document.getElementById('rolesChart').getContext('2d');
    rolesChart = new Chart(rolesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Usuários', 'Gerentes', 'Desenvolvedores', 'Ceo Control'],
            datasets: [{
                data: [60, 25, 10, 5],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#ff6b35',
                    '#9C27B0'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#fff',
                        font: { size: 12 },
                        padding: 20
                    }
                }
            }
        }
    });

    // Gráfico de performance
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    performanceChart = new Chart(performanceCtx, {
        type: 'bar',
        data: {
            labels: ['CPU', 'RAM', 'Disco', 'Rede'],
            datasets: [{
                label: 'Uso (%)',
                data: [65, 80, 45, 30],
                backgroundColor: [
                    '#ff6b35',
                    '#4CAF50',
                    '#2196F3',
                    '#FF9800'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff',
                        font: { size: 14 }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#888' },
                    grid: { color: '#333' }
                },
                y: {
                    ticks: { color: '#888' },
                    grid: { color: '#333' }
                }
            }
        }
    });

    // Gráfico de recursos
    const resourcesCtx = document.getElementById('resourcesChart').getContext('2d');
    resourcesChart = new Chart(resourcesCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: 'Usuários Online',
                data: [50, 30, 80, 120, 100, 70],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff',
                        font: { size: 14 }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#888' },
                    grid: { color: '#333' }
                },
                y: {
                    ticks: { color: '#888' },
                    grid: { color: '#333' }
                }
            }
        }
    });
}

// Inicializar event listeners
function initializeEventListeners() {
    // Toggle sidebar em mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Fechar sidebar ao clicar fora (mobile)
    document.addEventListener('click', function(e) {
        const sidebar = document.querySelector('.admin-sidebar');
        const toggle = document.querySelector('.sidebar-toggle');
        
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !toggle.contains(e.target) && 
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // Filtros de período
    const usersChartPeriod = document.getElementById('usersChartPeriod');
    if (usersChartPeriod) {
        usersChartPeriod.addEventListener('change', updateUsersChart);
    }

    const analyticsPeriod = document.getElementById('analyticsPeriod');
    if (analyticsPeriod) {
        analyticsPeriod.addEventListener('change', updateAnalytics);
    }

    // Filtro de logs
    const logsFilter = document.getElementById('logsFilter');
    if (logsFilter) {
        logsFilter.addEventListener('change', filterLogs);
    }

    // Busca global
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', handleGlobalSearch);
    }

    // Formulário de adicionar usuário
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }

    // Formulários de configurações
    const settingsForms = document.querySelectorAll('.settings-form');
    settingsForms.forEach(form => {
        form.addEventListener('submit', handleSettingsSave);
    });
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    sidebar.classList.toggle('open');
}

// Mostrar seção específica
function showSection(sectionName) {
    // Esconder todas as seções
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));

    // Mostrar seção selecionada
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Atualizar navegação ativa
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    const activeNavItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`).parentElement;
    activeNavItem.classList.add('active');

    currentSection = sectionName;

    // Carregar dados específicos da seção
    switch(sectionName) {
        case 'users':
            loadUsersData();
            break;
        case 'analytics':
            updateAnalytics();
            break;
        case 'logs':
            loadLogsData();
            break;
    }
}

// Carregar dados do dashboard
function loadDashboardData() {
    updateStatsCards();
    loadRecentActivity();
}

// Atualizar cards de estatísticas
function updateStatsCards() {
    // Simular dados dinâmicos
    const stats = {
        totalUsers: 250,
        activeUsers: 180,
        totalRevenue: 125000,
        systemAlerts: 3
    };

    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('activeUsers').textContent = stats.activeUsers;
    document.getElementById('totalRevenue').textContent = `R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`;
    document.getElementById('systemAlerts').textContent = stats.systemAlerts;

    // Atualizar mudanças
    document.getElementById('usersChange').textContent = '+12%';
    document.getElementById('activeChange').textContent = '+8%';
    document.getElementById('revenueChange').textContent = '+15%';
    document.getElementById('alertsChange').textContent = '+2';
}

// Carregar atividade recente
function loadRecentActivity() {
    const activities = [
        {
            icon: 'fas fa-user-plus',
            title: 'Novo usuário registrado',
            description: 'joao.silva@email.com - 2 minutos atrás',
            type: 'positive'
        },
        {
            icon: 'fas fa-exclamation-triangle',
            title: 'Tentativa de login falhada',
            description: 'admin@control.com - 5 minutos atrás',
            type: 'negative'
        },
        {
            icon: 'fas fa-chart-line',
            title: 'Relatório gerado',
            description: 'Relatório mensal - 10 minutos atrás',
            type: 'positive'
        },
        {
            icon: 'fas fa-cog',
            title: 'Configurações atualizadas',
            description: 'Sistema - 15 minutos atrás',
            type: 'positive'
        }
    ];

    const activityList = document.getElementById('recentActivity');
    activityList.innerHTML = '';

    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <span class="activity-amount ${activity.type}">
                ${activity.type === 'positive' ? '+' : '-'}
            </span>
        `;
        activityList.appendChild(activityItem);
    });
}

// Carregar dados de usuários
function loadUsersData() {
    const users = [
        {
            name: 'João Silva',
            email: 'joao@email.com',
            role: 'user',
            status: 'active',
            lastAccess: '2024-01-15 14:30'
        },
        {
            name: 'Washington Lourenço',
            email: 'CeoL@control.com',
            role: 'CeoControl',
            status: 'active',
            lastAccess: '2024-01-15 13:45'
        },
        {
            name: 'Pedro Costa',
            email: 'pedro@email.com',
            role: 'admin',
            status: 'inactive',
            lastAccess: '2024-01-14 09:20'
        },
        {
            name: 'Ana Oliveira',
            email: 'ana@email.com',
            role: 'user',
            status: 'active',
            lastAccess: '2024-01-15 15:10'
        }
    ];

    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.role}">${user.role}</span></td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>${user.lastAccess}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editUser('${user.email}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.email}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Carregar logs de acesso
function loadLogsData() {
    const logs = JSON.parse(localStorage.getItem('accessLogs') || '[]');
    const tableBody = document.getElementById('logsTableBody');
    tableBody.innerHTML = '';

    if (logs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">Nenhum log encontrado</td></tr>';
        return;
    }

    // Mostrar apenas os últimos 50 logs
    const recentLogs = logs.slice(-50).reverse();

    recentLogs.forEach(log => {
        const row = document.createElement('tr');
        const timestamp = new Date(log.timestamp).toLocaleString('pt-BR');
        const actionClass = log.action === 'login_success' ? 'positive' : 
                           log.action === 'login_failed' ? 'negative' : 'neutral';
        
        row.innerHTML = `
            <td>${timestamp}</td>
            <td>${log.email}</td>
            <td>${log.role}</td>
            <td><span class="action-badge action-${actionClass}">${log.action}</span></td>
            <td>${log.ip}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Filtrar logs
function filterLogs() {
    const filter = document.getElementById('logsFilter').value;
    const logs = JSON.parse(localStorage.getItem('accessLogs') || '[]');
    const tableBody = document.getElementById('logsTableBody');
    
    let filteredLogs = logs;
    if (filter !== 'all') {
        filteredLogs = logs.filter(log => log.action === filter);
    }

    tableBody.innerHTML = '';

    if (filteredLogs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">Nenhum log encontrado</td></tr>';
        return;
    }

    const recentLogs = filteredLogs.slice(-50).reverse();

    recentLogs.forEach(log => {
        const row = document.createElement('tr');
        const timestamp = new Date(log.timestamp).toLocaleString('pt-BR');
        const actionClass = log.action === 'login_success' ? 'positive' : 
                           log.action === 'login_failed' ? 'negative' : 'neutral';
        
        row.innerHTML = `
            <td>${timestamp}</td>
            <td>${log.email}</td>
            <td>${log.role}</td>
            <td><span class="action-badge action-${actionClass}">${log.action}</span></td>
            <td>${log.ip}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Atualizar gráfico de usuários
function updateUsersChart() {
    const period = document.getElementById('usersChartPeriod').value;
    let labels, data;

    switch(period) {
        case '7':
            labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
            data = [45, 52, 48, 61, 55, 67, 58];
            break;
        case '30':
            labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
            data = [180, 195, 210, 200];
            break;
        case '90':
            labels = ['Mês 1', 'Mês 2', 'Mês 3'];
            data = [150, 175, 200];
            break;
    }

    usersChart.data.labels = labels;
    usersChart.data.datasets[0].data = data;
    usersChart.update();
}

// Atualizar analytics
function updateAnalytics() {
    const period = document.getElementById('analyticsPeriod').value;
    // Atualizar dados dos gráficos baseado no período
    console.log('Atualizando analytics para período:', period);
}

// Busca global
function handleGlobalSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    console.log('Busca global:', searchTerm);
    // Implementar busca global
}

// Atualizar contagem de notificações
function updateNotificationCount() {
    const count = Math.floor(Math.random() * 10) + 1;
    document.getElementById('notificationCount').textContent = count;
}

// Mostrar notificações
function showNotifications() {
    showNotification('Sistema de notificações em desenvolvimento', 'info');
}

// Atualizar dados
function refreshData() {
    showNotification('Atualizando dados...', 'info');
    setTimeout(() => {
        loadDashboardData();
        loadUsersData();
        loadLogsData();
        showNotification('Dados atualizados com sucesso!', 'success');
    }, 1000);
}

// Modal de adicionar usuário
function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'block';
}

function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
    document.getElementById('addUserForm').reset();
}

function handleAddUser(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        name: formData.get('newUserName'),
        email: formData.get('newUserEmail'),
        password: formData.get('newUserPassword'),
        role: formData.get('newUserRole')
    };

    showNotification('Usuário adicionado com sucesso!', 'success');
    closeAddUserModal();
    loadUsersData();
}

// Editar usuário
function editUser(email) {
    showNotification(`Editando usuário: ${email}`, 'info');
}

// Deletar usuário
function deleteUser(email) {
    if (confirm(`Tem certeza que deseja deletar o usuário ${email}?`)) {
        showNotification('Usuário deletado com sucesso!', 'success');
        loadUsersData();
    }
}

// Gerar relatórios
function generateReport() {
    showNotification('Gerando relatório...', 'info');
    setTimeout(() => {
        showNotification('Relatório gerado com sucesso!', 'success');
    }, 2000);
}

function generateUserReport() {
    showNotification('Gerando relatório de usuários...', 'info');
}

function generateSystemReport() {
    showNotification('Gerando relatório do sistema...', 'info');
}

function generateFinancialReport() {
    showNotification('Gerando relatório financeiro...', 'info');
}

// Salvar configurações
function handleSettingsSave(e) {
    e.preventDefault();
    showNotification('Configurações salvas com sucesso!', 'success');
}

// Limpar logs
function clearLogs() {
    if (confirm('Tem certeza que deseja limpar todos os logs?')) {
        localStorage.removeItem('accessLogs');
        loadLogsData();
        showNotification('Logs limpos com sucesso!', 'success');
    }
}

// Atualizar informações do usuário
function updateUserInfo() {
    const user = sessionManager.getUser();
    if (user) {
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = user.name;
        }
        
        const userRoleElement = document.querySelector('.user-role');
        if (userRoleElement) {
            userRoleElement.textContent = user.role.toUpperCase();
        }
    }
}

// Logout
function logout() {
    // Criar modal de confirmação personalizado
    const confirmModal = document.createElement('div');
    confirmModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    confirmModal.innerHTML = `
        <div style="
            background: #2a2a2a;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            border: 1px solid #444;
            max-width: 400px;
            width: 90%;
        ">
            <div style="
                width: 60px;
                height: 60px;
                background: #ff6b35;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                font-size: 24px;
                color: white;
            ">
                <i class="fas fa-sign-out-alt"></i>
            </div>
            <h3 style="color: #fff; margin-bottom: 15px; font-size: 20px;">Confirmar Logout</h3>
            <p style="color: #ccc; margin-bottom: 25px; line-height: 1.5;">
                Tem certeza que deseja sair do sistema?<br>
                Você será redirecionado para a página de login.
            </p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="cancelLogout" style="
                    background: #666;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#777'" onmouseout="this.style.background='#666'">
                    Cancelar
                </button>
                <button id="confirmLogout" style="
                    background: #ff6b35;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#e55a2b'" onmouseout="this.style.background='#ff6b35'">
                    Sim, Sair
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    // Event listeners para os botões
    document.getElementById('cancelLogout').onclick = () => {
        document.body.removeChild(confirmModal);
    };
    
    document.getElementById('confirmLogout').onclick = () => {
        document.body.removeChild(confirmModal);
        
        // Mostrar loading com animação
        showNotification('Saindo do sistema...', 'info');
        
        // Adicionar efeito de fade out na página
        document.body.style.transition = 'opacity 0.5s ease-out';
        document.body.style.opacity = '0.7';
        
        // Fazer logout
        try {
            sessionManager.logout();
            
            // Log de logout bem-sucedido
            console.log('Logout realizado com sucesso');
            
            // Redirecionar após um breve delay
            setTimeout(() => {
                // Garantir que o redirecionamento funcione
                window.location.replace('../Login/Login.html');
            }, 1500);
            
        } catch (error) {
            console.error('Erro durante logout:', error);
            
            // Mesmo com erro, redirecionar para login
            setTimeout(() => {
                window.location.replace('../Login/Login.html');
            }, 1000);
        }
    };
    
    // Fechar modal clicando fora dele
    confirmModal.onclick = (e) => {
        if (e.target === confirmModal) {
            document.body.removeChild(confirmModal);
        }
    };
}

// Função para lidar com o clique no logo/home
function handleHomeClick() {
    if (sessionManager.isLoggedIn()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showNotification('Você já está no dashboard administrativo!', 'info');
        return;
    }
    
    sessionManager.redirectToRegisterIfNotLoggedIn();
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
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
            if (notification.parentNode) {
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
        'info': '#ff6b35'
    };
    return colors[type] || '#ff6b35';
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
    
    .role-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .role-user { background: rgba(76, 175, 80, 0.2); color: #4CAF50; }
    .role-manager { background: rgba(33, 150, 243, 0.2); color: #2196F3; }
    .role-admin { background: rgba(255, 107, 53, 0.2); color: #ff6b35; }
    .role-CeoControl { background: rgba(156, 39, 176, 0.2); color: #9C27B0; }
    
    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-active { background: rgba(76, 175, 80, 0.2); color: #4CAF50; }
    .status-inactive { background: rgba(244, 67, 54, 0.2); color: #f44336; }
    
    .action-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .action-positive { background: rgba(76, 175, 80, 0.2); color: #4CAF50; }
    .action-negative { background: rgba(244, 67, 54, 0.2); color: #f44336; }
    .action-neutral { background: rgba(158, 158, 158, 0.2); color: #9E9E9E; }
    
    .btn-sm {
        padding: 8px 12px;
        font-size: 12px;
    }
`;
document.head.appendChild(style);

// Redimensionar gráficos quando a janela é redimensionada
window.addEventListener('resize', () => {
    if (usersChart) usersChart.resize();
    if (rolesChart) rolesChart.resize();
    if (performanceChart) performanceChart.resize();
    if (resourcesChart) resourcesChart.resize();
});

// Exportar funções para uso global
window.toggleSidebar = toggleSidebar;
window.showSection = showSection;
window.showAddUserModal = showAddUserModal;
window.closeAddUserModal = closeAddUserModal;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.generateReport = generateReport;
window.generateUserReport = generateUserReport;
window.generateSystemReport = generateSystemReport;
window.generateFinancialReport = generateFinancialReport;
window.clearLogs = clearLogs;
window.logout = logout;
window.handleHomeClick = handleHomeClick;
window.showNotifications = showNotifications;
window.refreshData = refreshData;
