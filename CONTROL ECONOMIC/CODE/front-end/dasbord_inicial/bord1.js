// Variáveis globais
let expenseChart, pieChart;
let currentSection = 'dashboard';
let currentDate = new Date();
let events = [];

// Função para limpar todos os dados existentes
function clearAllData() {
    localStorage.removeItem('recentActivities');
    localStorage.removeItem('events');
    localStorage.removeItem('tasks');
    localStorage.removeItem('settings');
    console.log('Todos os dados foram limpos do localStorage');
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    if (!sessionManager.isLoggedIn()) {
        // Se não estiver logado, redirecionar para login
        window.location.href = '../Login/Login.html';
        return;
    }
    
    // Limpar dados existentes para começar do zero
    clearAllData();
    
    // Atualizar informações do usuário na interface
    updateUserInfo();
    
    initializeCharts();
    initializeEventListeners();
    loadDashboardData();
    initializeCalendar();
    loadTasks();
    loadEvents();
    initializeSettingsForms();
    
    // Verificar se há hash na URL para mostrar seção específica
    setTimeout(() => {
        const hash = window.location.hash.substring(1); // Remove o #
        console.log('Hash detectado:', hash); // Debug
        console.log('URL completa:', window.location.href); // Debug
        
        if (hash && ['dashboard', 'reports', 'finances', 'agenda', 'tasks', 'settings'].includes(hash)) {
            console.log('Mostrando seção:', hash); // Debug
            showSection(hash);
        } else {
            // Mostrar dashboard por padrão
            console.log('Mostrando dashboard padrão'); // Debug
            showSection('dashboard');
        }
    }, 200);
    
    // Adicionar listener para mudanças no hash
    window.addEventListener('hashchange', function() {
        const newHash = window.location.hash.substring(1);
        if (newHash && ['dashboard', 'reports', 'finances', 'agenda', 'tasks', 'settings'].includes(newHash)) {
            showSection(newHash);
        }
    });
    
    // Adicionar listener para o formulário de tarefas
    const taskForm = document.getElementById('newTaskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskFormSubmit);
    }
    
    // Adicionar listeners para os formulários de despesa e receita
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }
    
    const incomeForm = document.getElementById('incomeForm');
    if (incomeForm) {
        incomeForm.addEventListener('submit', handleIncomeSubmit);
    }
});

// Inicializar gráficos
function initializeCharts() {
    // Gráfico de linha - Receitas vs Despesas
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    expenseChart = new Chart(expenseCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Receitas',
                data: [2200, 2400, 2100, 2600, 2300, 2500, 2800, 2700, 2400, 2600, 2500, 2450],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }, {
                label: 'Despesas',
                data: [1800, 1900, 1750, 2000, 1850, 1950, 2100, 2050, 1800, 1900, 1850, 1890],
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
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
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#888'
                    },
                    grid: {
                        color: '#333'
                    }
                },
                y: {
                    ticks: {
                        color: '#888',
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    },
                    grid: {
                        color: '#333'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    // Gráfico de pizza - Distribuição de gastos
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Outros'],
            datasets: [{
                data: [35, 20, 25, 10, 5, 5],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FF9800',
                    '#9C27B0',
                    '#f44336',
                    '#607D8B'
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
                        font: {
                            size: 12
                        },
                        padding: 20
                    }
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
        const sidebar = document.querySelector('.sidebar');
        const toggle = document.querySelector('.sidebar-toggle');
        
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !toggle.contains(e.target) && 
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // Filtro de período do gráfico
    const chartSelect = document.querySelector('.chart-select');
    if (chartSelect) {
        chartSelect.addEventListener('change', updateChartData);
    }

    // Busca
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Navegação
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            setActiveNavItem(this);
        });
    });
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Atualizar dados do gráfico baseado no período selecionado
function updateChartData() {
    const period = document.querySelector('.chart-select').value;
    let labels, incomeData, expenseData;

    switch(period) {
        case '7':
            labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
            incomeData = [320, 280, 350, 400, 380, 420, 300];
            expenseData = [180, 220, 190, 250, 200, 280, 150];
            break;
        case '30':
            labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
            incomeData = [1200, 1300, 1100, 1250];
            expenseData = [800, 900, 750, 850];
            break;
        case '90':
            labels = ['Mês 1', 'Mês 2', 'Mês 3'];
            incomeData = [2400, 2500, 2450];
            expenseData = [1800, 1900, 1890];
            break;
    }

    expenseChart.data.labels = labels;
    expenseChart.data.datasets[0].data = incomeData;
    expenseChart.data.datasets[1].data = expenseData;
    expenseChart.update();
}

// Buscar funcionalidade
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const activityItems = document.querySelectorAll('.activity-item');
    
    activityItems.forEach(item => {
        const title = item.querySelector('h4').textContent.toLowerCase();
        const description = item.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Definir item de navegação ativo
function setActiveNavItem(activeLink) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    activeLink.parentElement.classList.add('active');
}

// Carregar dados do dashboard
function loadDashboardData() {
    // Simular carregamento de dados
    updateStatsCards();
    updateActivityList();
}

// Atualizar cards de estatísticas
function updateStatsCards() {
    // Simular dados dinâmicos
    const stats = [
        { value: 'R$ 2.450,00', change: '+12%', type: 'positive' },
        { value: 'R$ 1.890,00', change: '+8%', type: 'negative' },
        { value: 'R$ 560,00', change: '+15%', type: 'positive' },
        { value: '77%', change: '+5%', type: 'positive' }
    ];

    const statValues = document.querySelectorAll('.stat-value');
    const statChanges = document.querySelectorAll('.stat-change');

    statValues.forEach((element, index) => {
        if (stats[index]) {
            element.textContent = stats[index].value;
        }
    });

    statChanges.forEach((element, index) => {
        if (stats[index]) {
            element.textContent = stats[index].change;
            element.className = `stat-change ${stats[index].type}`;
        }
    });
}

// Atualizar lista de atividades
function updateActivityList() {
    // Carregar atividades do localStorage
    const savedActivities = localStorage.getItem('recentActivities');
    let activities = [];
    
    if (savedActivities) {
        activities = JSON.parse(savedActivities);
    } else {
        // Começar com lista vazia - sem atividades de exemplo
        activities = [];
        saveActivities(activities);
    }

    const activityList = document.querySelector('.activity-list');
    activityList.innerHTML = '';

    // Mostrar todas as atividades (mais recentes primeiro)
    if (activities.length > 0) {
        // Ordenar por data (mais recentes primeiro)
        const sortedActivities = activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        sortedActivities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                    <small class="activity-time">${formatActivityTime(activity.timestamp)}</small>
                </div>
                <span class="activity-amount ${activity.type}">${activity.amount}</span>
            `;
            activityList.appendChild(activityItem);
        });
    } else {
        activityList.innerHTML = '<div class="no-activities">Nenhuma atividade adicionada ainda. Use as ações rápidas para adicionar despesas e receitas.</div>';
    }
}

// Função para formatar o tempo da atividade
function formatActivityTime(timestamp) {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
    
    if (diffInMinutes < 1) {
        return 'Agora mesmo';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} min atrás`;
    } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours}h atrás`;
    } else {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} dias atrás`;
    }
}

// Funções de ações rápidas
function showAddExpenseModal() {
    console.log('Tentando abrir modal de despesa...');
    const modal = document.getElementById('expenseModal');
    const form = document.getElementById('expenseForm');
    
    if (!modal) {
        console.error('Modal de despesa não encontrado!');
        showNotification('Erro: Modal não encontrado', 'error');
        return;
    }
    
    if (!form) {
        console.error('Formulário de despesa não encontrado!');
        showNotification('Erro: Formulário não encontrado', 'error');
        return;
    }
    
    // Limpar formulário
    form.reset();
    
    // Definir data de hoje como padrão
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) {
        dateInput.value = today;
    }
    
    // Mostrar modal
    modal.classList.add('show');
    console.log('Modal de despesa aberto com sucesso');
    
    // Focar no primeiro campo
    const descriptionInput = document.getElementById('expenseDescription');
    if (descriptionInput) {
        descriptionInput.focus();
    }
}

function showAddIncomeModal() {
    console.log('Tentando abrir modal de receita...');
    const modal = document.getElementById('incomeModal');
    const form = document.getElementById('incomeForm');
    
    if (!modal) {
        console.error('Modal de receita não encontrado!');
        showNotification('Erro: Modal não encontrado', 'error');
        return;
    }
    
    if (!form) {
        console.error('Formulário de receita não encontrado!');
        showNotification('Erro: Formulário não encontrado', 'error');
        return;
    }
    
    // Limpar formulário
    form.reset();
    
    // Definir data de hoje como padrão
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('incomeDate');
    if (dateInput) {
        dateInput.value = today;
    }
    
    // Mostrar modal
    modal.classList.add('show');
    console.log('Modal de receita aberto com sucesso');
    
    // Focar no primeiro campo
    const descriptionInput = document.getElementById('incomeDescription');
    if (descriptionInput) {
        descriptionInput.focus();
    }
}

function closeExpenseModal() {
    const modal = document.getElementById('expenseModal');
    modal.classList.remove('show');
    document.getElementById('expenseForm').reset();
}

function closeIncomeModal() {
    const modal = document.getElementById('incomeModal');
    modal.classList.remove('show');
    document.getElementById('incomeForm').reset();
}

// Salvar atividades no localStorage
function saveActivities(activities) {
    localStorage.setItem('recentActivities', JSON.stringify(activities));
}

// Adicionar nova atividade
function addActivity(activity) {
    const savedActivities = localStorage.getItem('recentActivities');
    let activities = [];
    
    if (savedActivities) {
        activities = JSON.parse(savedActivities);
    }
    
    // Adicionar nova atividade
    activities.push(activity);
    
    // Manter apenas as últimas 10 atividades para não sobrecarregar
    if (activities.length > 10) {
        activities = activities.slice(-10);
    }
    
    // Salvar no localStorage
    saveActivities(activities);
    
    // Atualizar a lista de atividades
    updateActivityList();
}

function generateReport() {
    showNotification('Gerando relatório...', 'info');
    // Aqui você implementaria a lógica para gerar relatório
}

// Processar formulário de despesa
function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('expenseForm');
    const formData = new FormData(form);
    
    // Validar campos obrigatórios
    const description = formData.get('description');
    const amount = parseFloat(formData.get('amount'));
    const category = formData.get('category');
    const date = formData.get('date');
    const currency = formData.get('currency') || 'BRL';
    
    if (!description || !amount || !category || !date) {
        showNotification('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    if (!validateAmount(amount)) {
        showNotification('O valor deve estar entre R$ 0,01 e R$ 999.999.999,00.', 'error');
        return;
    }
    
    // Criar atividade
    const activity = {
        icon: 'fas fa-shopping-cart',
        title: description,
        description: `${formatCurrency(amount, currency)} - ${formatDate(date)}`,
        amount: `-${formatCurrency(amount, currency)}`,
        type: 'negative',
        date: new Date(date),
        category: category,
        currency: currency,
        originalAmount: amount
    };
    
    // Adicionar atividade
    addActivity(activity);
    
    // Fechar modal
    closeExpenseModal();
    
    // Mostrar notificação de sucesso
    showNotification('Despesa adicionada com sucesso!', 'success');
}

// Processar formulário de receita
function handleIncomeSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('incomeForm');
    const formData = new FormData(form);
    
    // Validar campos obrigatórios
    const description = formData.get('description');
    const amount = parseFloat(formData.get('amount'));
    const category = formData.get('category');
    const date = formData.get('date');
    const currency = formData.get('currency') || 'BRL';
    
    if (!description || !amount || !category || !date) {
        showNotification('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    if (!validateAmount(amount)) {
        showNotification('O valor deve estar entre R$ 0,01 e R$ 999.999.999,00.', 'error');
        return;
    }
    
    // Criar atividade
    const activity = {
        icon: 'fas fa-arrow-up',
        title: description,
        description: `${formatCurrency(amount, currency)} - ${formatDate(date)}`,
        amount: `+${formatCurrency(amount, currency)}`,
        type: 'positive',
        date: new Date(date),
        category: category,
        currency: currency,
        originalAmount: amount
    };
    
    // Adicionar atividade
    addActivity(activity);
    
    // Fechar modal
    closeIncomeModal();
    
    // Mostrar notificação de sucesso
    showNotification('Receita adicionada com sucesso!', 'success');
}

// Formatar data para exibição
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ontem';
    } else {
        const diffTime = Math.abs(today - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} dias atrás`;
    }
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

// Função para lidar com o clique no logo/home
function handleHomeClick() {
    // Se já estiver no dashboard e logado, não fazer nada
    if (sessionManager.isLoggedIn()) {
        // Opcional: scroll para o topo ou mostrar mensagem
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showNotification('Você já está no dashboard!', 'info');
        return;
    }
    
    // Se não estiver logado, redirecionar para criar conta
    sessionManager.redirectToRegisterIfNotLoggedIn();
}

// Atualizar informações do usuário na interface
function updateUserInfo() {
    const user = sessionManager.getUser();
    if (user) {
        // Atualizar nome do usuário
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement && user.name) {
            userNameElement.textContent = user.name;
        }
        
        // Atualizar email do usuário
        const userEmailElement = document.querySelector('.user-email');
        if (userEmailElement && user.email) {
            userEmailElement.textContent = user.email;
        }
        
        // Atualizar avatar se fornecido
        const userAvatarElement = document.querySelector('.user-avatar');
        if (userAvatarElement && user.avatar) {
            userAvatarElement.src = user.avatar;
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
            document.body.removeChild(notification);
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

// Atualizar dados em tempo real (simulação)
setInterval(() => {
    // Simular atualização de dados
    const randomChange = () => Math.floor(Math.random() * 20) - 10;
    
    // Atualizar valores dos cards
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length > 0) {
        // Simular pequenas variações nos valores
        const currentValue = parseFloat(statValues[0].textContent.replace('R$ ', '').replace('.', '').replace(',', '.'));
        const newValue = currentValue + randomChange();
        statValues[0].textContent = `R$ ${newValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
}, 30000); // Atualizar a cada 30 segundos

// Redimensionar gráficos quando a janela é redimensionada
window.addEventListener('resize', () => {
    if (expenseChart) {
        expenseChart.resize();
    }
    if (pieChart) {
        pieChart.resize();
    }
    
    // Redimensionar gráficos de relatórios
    if (window.reportCharts) {
        window.reportCharts.forEach(chart => {
            if (chart) chart.resize();
        });
    }
});

// ==================== FUNÇÕES DE NAVEGAÇÃO ====================

// Mostrar seção específica
function showSection(sectionName) {
    // Esconder todas as seções de conteúdo
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Esconder seções do dashboard principal (apenas as que estão fora das seções de conteúdo)
    const dashboardSections = document.querySelectorAll('.stats-section, .charts-section');
    dashboardSections.forEach(section => section.style.display = 'none');
    
    // Esconder seções de atividade e ações rápidas que estão fora das seções de conteúdo
    const mainActivitySections = document.querySelectorAll('main .activity-section, main .quick-actions');
    mainActivitySections.forEach(section => {
        // Só esconder se não estiver dentro de uma seção de conteúdo
        if (!section.closest('.content-section')) {
            section.style.display = 'none';
        }
    });
    
    // Mostrar seção selecionada
    if (sectionName === 'dashboard') {
        // Para dashboard, mostrar as seções principais
        showDashboardMain();
    } else {
        // Para outras seções, mostrar a seção específica
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
            console.log(`Mostrando seção: ${sectionName}`, targetSection); // Debug
        } else {
            console.log(`Seção não encontrada: ${sectionName}-section`); // Debug
        }
    }
    
    // Atualizar navegação ativa
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeNavItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`).parentElement;
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Atualizar título da página
    updatePageTitle(sectionName);
    
    currentSection = sectionName;
    
    // Carregar dados específicos da seção
    switch(sectionName) {
        case 'dashboard':
            showDashboardMain();
            break;
        case 'reports':
            loadReportsData();
            break;
        case 'finances':
            console.log('Carregando dados de finanças...'); // Debug
            loadFinancesData();
            break;
        case 'agenda':
            loadAgendaData();
            break;
    }
}

// Mostrar dashboard principal
function showDashboardMain() {
    // Esconder todas as seções de conteúdo
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.style.display = 'none');
    
    // Mostrar apenas as seções do dashboard principal (stats e charts)
    const statsSection = document.querySelector('.stats-section');
    const chartsSection = document.querySelector('.charts-section');
    
    if (statsSection) statsSection.style.display = 'block';
    if (chartsSection) chartsSection.style.display = 'block';
}

// Atualizar título da página
function updatePageTitle(sectionName) {
    const pageTitle = document.querySelector('.page-title');
    const pageSubtitle = document.querySelector('.page-subtitle');
    
    if (!pageTitle || !pageSubtitle) return;
    
    switch(sectionName) {
        case 'dashboard':
            pageTitle.textContent = 'Dashboard';
            pageSubtitle.textContent = 'Bem-vindo de volta! Aqui está um resumo do seu controle financeiro.';
            break;
        case 'reports':
            pageTitle.textContent = 'Relatórios';
            pageSubtitle.textContent = 'Análises detalhadas e relatórios financeiros.';
            break;
        case 'finances':
            pageTitle.textContent = 'Finanças';
            pageSubtitle.textContent = 'Gerencie suas contas, orçamentos e metas financeiras.';
            break;
        case 'agenda':
            pageTitle.textContent = 'Agenda';
            pageSubtitle.textContent = 'Organize seus eventos e compromissos.';
            break;
    }
}

// ==================== FUNÇÕES DE MOEDA ====================

// Símbolos das moedas
const CURRENCY_SYMBOLS = {
    'BRL': 'R$',
    'USD': '$',
    'EUR': '€'
};

// Formatação de valores por moeda
function formatCurrency(amount, currency = 'BRL') {
    const symbol = CURRENCY_SYMBOLS[currency] || 'R$';
    
    if (currency === 'BRL') {
        return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
    } else {
        return `${symbol} ${amount.toFixed(2)}`;
    }
}

// Converter valor para Real (usado para cálculos internos)
function convertToBRL(amount, currency = 'BRL') {
    // Taxas de conversão aproximadas (você pode integrar com uma API real)
    const exchangeRates = {
        'BRL': 1.0,
        'USD': 5.2,  // 1 USD = 5.2 BRL
        'EUR': 5.7   // 1 EUR = 5.7 BRL
    };
    
    return amount * (exchangeRates[currency] || 1.0);
}

// Validar valor máximo (até milhões)
function validateAmount(amount) {
    const maxAmount = 999999999; // 999 milhões
    return amount >= 0.01 && amount <= maxAmount;
}

// Adicionar despesa rápida
function addQuickExpense() {
    const nameInput = document.getElementById('quickValueName');
    const amountInput = document.getElementById('quickValueAmount');
    const currencySelect = document.getElementById('quickValueCurrency');
    
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const currency = currencySelect.value;
    
    if (!name) {
        showNotification('Por favor, insira o nome da despesa.', 'error');
        return;
    }
    
    if (!amount || !validateAmount(amount)) {
        showNotification('Por favor, insira um valor válido entre R$ 0,01 e R$ 999.999.999,00.', 'error');
        return;
    }
    
    // Criar atividade de despesa rápida
    const activity = {
        icon: 'fas fa-shopping-cart',
        title: name,
        description: `${formatCurrency(amount, currency)} - ${formatDate(new Date().toISOString().split('T')[0])}`,
        amount: `-${formatCurrency(amount, currency)}`,
        type: 'negative',
        date: new Date(),
        category: 'outros',
        currency: currency,
        originalAmount: amount
    };
    
    // Adicionar atividade
    addActivity(activity);
    
    // Limpar campos
    nameInput.value = '';
    amountInput.value = '';
    
    // Mostrar notificação
    showNotification('Despesa adicionada com sucesso!', 'success');
}

// Adicionar receita rápida
function addQuickIncome() {
    const nameInput = document.getElementById('quickValueName');
    const amountInput = document.getElementById('quickValueAmount');
    const currencySelect = document.getElementById('quickValueCurrency');
    
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const currency = currencySelect.value;
    
    if (!name) {
        showNotification('Por favor, insira o nome da receita.', 'error');
        return;
    }
    
    if (!amount || !validateAmount(amount)) {
        showNotification('Por favor, insira um valor válido entre R$ 0,01 e R$ 999.999.999,00.', 'error');
        return;
    }
    
    // Criar atividade de receita rápida
    const activity = {
        icon: 'fas fa-arrow-up',
        title: name,
        description: `${formatCurrency(amount, currency)} - ${formatDate(new Date().toISOString().split('T')[0])}`,
        amount: `+${formatCurrency(amount, currency)}`,
        type: 'positive',
        date: new Date(),
        category: 'outros',
        currency: currency,
        originalAmount: amount
    };
    
    // Adicionar atividade
    addActivity(activity);
    
    // Limpar campos
    nameInput.value = '';
    amountInput.value = '';
    
    // Mostrar notificação
    showNotification('Receita adicionada com sucesso!', 'success');
}

// ==================== FUNÇÕES DE RELATÓRIOS ====================

function loadReportsData() {
    // Carregar dados de todas as fontes
    loadFinancialData();
    loadAgendaData();
    
    // Inicializar gráficos de relatórios com dados integrados
    initializeReportCharts();
    
    // Atualizar dados dinâmicos dos relatórios
    updateReportsData();
    
    // Carregar dados específicos dos relatórios
    loadReportsSummary();
    
    // Mostrar notificação de carregamento
    showNotification('Relatórios carregados com sucesso!', 'success');
}

// Carregar dados financeiros integrados
function loadFinancialData() {
    // Carregar atividades recentes (despesas e receitas)
    const savedActivities = localStorage.getItem('recentActivities');
    let activities = [];
    
    if (savedActivities) {
        activities = JSON.parse(savedActivities);
    }
    
    // Carregar eventos da agenda com dados financeiros
    const savedEvents = localStorage.getItem('events');
    let events = [];
    
    if (savedEvents) {
        events = JSON.parse(savedEvents);
    }
    
    // Armazenar dados globalmente para uso nos relatórios
    window.financialData = {
        activities: activities,
        events: events,
        totalIncome: calculateTotalIncome(activities, events),
        totalExpenses: calculateTotalExpenses(activities, events),
        categories: calculateCategories(activities, events)
    };
    
    console.log('Dados financeiros carregados:', window.financialData);
}

// Calcular receita total
function calculateTotalIncome(activities, events) {
    let total = 0;
    
    // Somar receitas das atividades
    activities.forEach(activity => {
        if (activity.type === 'positive') {
            let amount = 0;
            if (activity.originalAmount) {
                // Usar valor original e converter para BRL
                amount = convertToBRL(activity.originalAmount, activity.currency || 'BRL');
            } else {
                // Fallback para parsing do texto (compatibilidade)
                const amountText = activity.amount.replace(/[+-]/g, '').replace(/[R$€$]/g, '').replace(',', '.');
                amount = parseFloat(amountText) || 0;
            }
            total += amount;
        }
    });
    
    // Somar receitas dos eventos
    events.forEach(event => {
        if (event.income && event.income > 0) {
            total += convertToBRL(event.income, event.incomeCurrency || 'BRL');
        }
    });
    
    return total;
}

// Calcular despesas totais
function calculateTotalExpenses(activities, events) {
    let total = 0;
    
    // Somar despesas das atividades
    activities.forEach(activity => {
        if (activity.type === 'negative') {
            let amount = 0;
            if (activity.originalAmount) {
                // Usar valor original e converter para BRL
                amount = convertToBRL(activity.originalAmount, activity.currency || 'BRL');
            } else {
                // Fallback para parsing do texto (compatibilidade)
                const amountText = activity.amount.replace(/[+-]/g, '').replace(/[R$€$]/g, '').replace(',', '.');
                amount = parseFloat(amountText) || 0;
            }
            total += amount;
        }
    });
    
    // Somar despesas dos eventos
    events.forEach(event => {
        if (event.expense && event.expense > 0) {
            total += convertToBRL(event.expense, event.expenseCurrency || 'BRL');
        }
    });
    
    return total;
}

// Calcular categorias
function calculateCategories(activities, events) {
    const categories = {
        income: {},
        expenses: {}
    };
    
    // Processar atividades
    activities.forEach(activity => {
        let amount = 0;
        if (activity.originalAmount) {
            // Usar valor original e converter para BRL
            amount = convertToBRL(activity.originalAmount, activity.currency || 'BRL');
        } else {
            // Fallback para parsing do texto (compatibilidade)
            const amountText = activity.amount.replace(/[+-]/g, '').replace(/[R$€$]/g, '').replace(',', '.');
            amount = parseFloat(amountText) || 0;
        }
        const category = activity.category || 'outros';
        
        if (activity.type === 'positive') {
            categories.income[category] = (categories.income[category] || 0) + amount;
        } else {
            categories.expenses[category] = (categories.expenses[category] || 0) + amount;
        }
    });
    
    // Processar eventos
    events.forEach(event => {
        if (event.income && event.income > 0) {
            const category = 'eventos';
            const amount = convertToBRL(event.income, event.incomeCurrency || 'BRL');
            categories.income[category] = (categories.income[category] || 0) + amount;
        }
        if (event.expense && event.expense > 0) {
            const category = 'eventos';
            const amount = convertToBRL(event.expense, event.expenseCurrency || 'BRL');
            categories.expenses[category] = (categories.expenses[category] || 0) + amount;
        }
    });
    
    return categories;
}

function loadReportsSummary() {
    // Usar dados reais se disponíveis
    const financialData = window.financialData;
    
    if (financialData) {
        const totalIncome = financialData.totalIncome;
        const totalExpenses = financialData.totalExpenses;
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
        
        // Atualizar resumo executivo com dados reais
        const summaryItems = document.querySelectorAll('.summary-item');
        if (summaryItems.length >= 4) {
            summaryItems[0].querySelector('.summary-value').textContent = `R$ ${totalIncome.toFixed(2).replace('.', ',')}`;
            summaryItems[1].querySelector('.summary-value').textContent = `R$ ${totalExpenses.toFixed(2).replace('.', ',')}`;
            summaryItems[2].querySelector('.summary-value').textContent = `R$ ${balance.toFixed(2).replace('.', ',')}`;
            summaryItems[3].querySelector('.summary-value').textContent = `${savingsRate}%`;
        }
    } else {
        // Sem dados - mostrar zeros
        const summaryItems = document.querySelectorAll('.summary-item');
        if (summaryItems.length >= 4) {
            summaryItems[0].querySelector('.summary-value').textContent = 'R$ 0,00';
            summaryItems[1].querySelector('.summary-value').textContent = 'R$ 0,00';
            summaryItems[2].querySelector('.summary-value').textContent = 'R$ 0,00';
            summaryItems[3].querySelector('.summary-value').textContent = '0%';
        }
    }
    
    // Atualizar controles de período
    const periodSelect = document.querySelector('.chart-select');
    if (periodSelect) {
        periodSelect.innerHTML = `
            <option value="7">Últimos 7 dias</option>
            <option value="30" selected>Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
        `;
    }
}

function initializeReportCharts() {
    // Aguardar um pouco para garantir que os elementos estejam visíveis
    setTimeout(() => {
        // Destruir gráficos existentes se houver
        if (window.reportCharts) {
            window.reportCharts.forEach(chart => {
                if (chart) chart.destroy();
            });
        }
        
        window.reportCharts = [];
        
        // Obter dados financeiros
        const financialData = window.financialData;
        
        // Gerar dados mensais baseados nas transações
        const monthlyData = generateMonthlyData(financialData);
        
        // Gráfico de receitas
        const incomeCtx = document.getElementById('incomeReportChart');
        if (incomeCtx) {
            const incomeChart = new Chart(incomeCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: monthlyData.labels,
                    datasets: [{
                        label: 'Receitas',
                        data: monthlyData.income,
                        backgroundColor: '#4CAF50',
                        borderColor: '#4CAF50',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#fff'
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#ccc' },
                            grid: { color: '#333' }
                        },
                        y: {
                            ticks: { 
                                color: '#ccc',
                                callback: function(value) {
                                    return 'R$ ' + value.toLocaleString('pt-BR');
                                }
                            },
                            grid: { color: '#333' }
                        }
                    }
                }
            });
            window.reportCharts.push(incomeChart);
        }
        
        // Gráfico de despesas
        const expenseCtx = document.getElementById('expenseReportChart');
        if (expenseCtx) {
            const expenseChart = new Chart(expenseCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: monthlyData.labels,
                    datasets: [{
                        label: 'Despesas',
                        data: monthlyData.expenses,
                        backgroundColor: '#f44336',
                        borderColor: '#f44336',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#fff'
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#ccc' },
                            grid: { color: '#333' }
                        },
                        y: {
                            ticks: { 
                                color: '#ccc',
                                callback: function(value) {
                                    return 'R$ ' + value.toLocaleString('pt-BR');
                                }
                            },
                            grid: { color: '#333' }
                        }
                    }
                }
            });
            window.reportCharts.push(expenseChart);
        }
        
        // Gráfico de categorias
        const categoryCtx = document.getElementById('categoryReportChart');
        if (categoryCtx) {
            const categoryData = generateCategoryData(financialData);
            const categoryChart = new Chart(categoryCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: categoryData.labels,
                    datasets: [{
                        data: categoryData.data,
                        backgroundColor: categoryData.colors,
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
                                padding: 20
                            }
                        }
                    }
                }
            });
            window.reportCharts.push(categoryChart);
        }
    }, 100);
}

// Gerar dados mensais baseados nas transações
function generateMonthlyData(financialData) {
    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const income = [0, 0, 0, 0, 0, 0];
    const expenses = [0, 0, 0, 0, 0, 0];
    
    if (financialData) {
        // Processar atividades
        financialData.activities.forEach(activity => {
            const date = new Date(activity.date);
            const month = date.getMonth();
            if (month >= 0 && month < 6) {
                const amount = parseFloat(activity.amount.replace(/[+-]R\$ /, '').replace(',', '.'));
                if (activity.type === 'positive') {
                    income[month] += amount;
                } else {
                    expenses[month] += amount;
                }
            }
        });
        
        // Processar eventos
        financialData.events.forEach(event => {
            const date = new Date(event.date);
            const month = date.getMonth();
            if (month >= 0 && month < 6) {
                if (event.income && event.income > 0) {
                    income[month] += event.income;
                }
                if (event.expense && event.expense > 0) {
                    expenses[month] += event.expense;
                }
            }
        });
    }
    
    // Se não há dados, mostrar zeros
    if (income.every(val => val === 0) && expenses.every(val => val === 0)) {
        return {
            labels: labels,
            income: [0, 0, 0, 0, 0, 0],
            expenses: [0, 0, 0, 0, 0, 0]
        };
    }
    
    return { labels, income, expenses };
}

// Gerar dados de categorias
function generateCategoryData(financialData) {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B', '#E91E63', '#795548'];
    
    if (financialData && financialData.categories) {
        const categories = financialData.categories.expenses;
        const labels = Object.keys(categories);
        const data = Object.values(categories);
        
        // Se não há dados, mostrar vazio
        if (labels.length === 0) {
            return {
                labels: ['Sem dados'],
                data: [100],
                colors: ['#666']
            };
        }
        
        return {
            labels: labels,
            data: data,
            colors: colors.slice(0, labels.length)
        };
    }
    
    // Fallback para dados vazios
    return {
        labels: ['Sem dados'],
        data: [100],
        colors: ['#666']
    };
}

function exportReport() {
    showNotification('Exportando relatório em PDF...', 'info');
    setTimeout(() => {
        showNotification('Relatório exportado com sucesso!', 'success');
    }, 2000);
}

// ==================== FUNÇÕES DE FINANÇAS ====================

function loadFinancesData() {
    // Carregar dados financeiros
    updateFinancesData();
    
    // Carregar dados específicos das finanças
    loadFinancesSummary();
    
    // Mostrar notificação de carregamento
    showNotification('Dados financeiros carregados com sucesso!', 'success');
}

function loadFinancesSummary() {
    // Atualizar saldos das contas
    const accountBalances = document.querySelectorAll('.account-balance');
    if (accountBalances.length >= 3) {
        accountBalances[0].textContent = 'R$ 12.450,80';
        accountBalances[1].textContent = 'R$ 5.230,50';
        accountBalances[2].textContent = 'R$ 8.900,00';
    }
    
    // Atualizar progresso dos orçamentos
    const budgetProgress = document.querySelectorAll('.progress-fill');
    if (budgetProgress.length >= 3) {
        budgetProgress[0].style.width = '75%';
        budgetProgress[1].style.width = '60%';
        budgetProgress[2].style.width = '90%';
    }
    
    // Atualizar valores dos orçamentos
    const budgetAmounts = document.querySelectorAll('.budget-amount');
    if (budgetAmounts.length >= 3) {
        budgetAmounts[0].textContent = 'R$ 3.750 / R$ 5.000';
        budgetAmounts[1].textContent = 'R$ 1.200 / R$ 2.000';
        budgetAmounts[2].textContent = 'R$ 900 / R$ 1.000';
    }
    
    // Atualizar metas financeiras
    const goalAmounts = document.querySelectorAll('.goal-amount');
    if (goalAmounts.length >= 2) {
        goalAmounts[0].textContent = 'R$ 4.500 / R$ 10.000';
        goalAmounts[1].textContent = 'R$ 1.600 / R$ 2.000';
    }
}

function showAddTransactionModal() {
    showNotification('Modal de nova transação em desenvolvimento...', 'info');
}

// ==================== FUNÇÕES DE AGENDA ====================

function initializeCalendar() {
    updateCalendar();
}

function loadAgendaData() {
    // Carregar todos os dados da agenda
    loadEvents();
    updateCalendar();
    loadAgendaSummary();
    loadUpcomingEvents();
    
    // Mostrar notificação
    showNotification('Agenda carregada com sucesso!', 'success');
}

function updateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Atualizar título do mês
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Gerar calendário
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    let calendarHTML = '<div class="calendar-weekdays">';
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekdays.forEach(day => {
        calendarHTML += `<div class="weekday">${day}</div>`;
    });
    calendarHTML += '</div>';
    
    calendarHTML += '<div class="calendar-days">';
    
    // Dias vazios do início do mês
    for (let i = 0; i < startingDay; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
        const hasEvent = events.some(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year;
        });
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}" 
                 onclick="selectDate(${day})">
                <span class="day-number">${day}</span>
                ${hasEvent ? '<div class="event-indicator"></div>' : ''}
            </div>
        `;
    }
    
    calendarHTML += '</div>';
    calendarGrid.innerHTML = calendarHTML;
}

function loadAgendaSummary() {
    // Atualizar lista de eventos de hoje
    const todayEventsList = document.getElementById('todayEvents');
    if (todayEventsList) {
        todayEventsList.innerHTML = '';
        
        const todayEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            const today = new Date();
            return eventDate.toDateString() === today.toDateString();
        });
        
        if (todayEvents.length === 0) {
            todayEventsList.innerHTML = '<div class="no-events">Nenhum evento para hoje</div>';
        } else {
            todayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                
                // Criar informações financeiras se houver
                let financialInfo = '';
                if (event.expense > 0 || event.income > 0) {
                    financialInfo = '<div class="event-financial">';
                    if (event.expense > 0) {
                        financialInfo += `<span class="expense">-R$ ${event.expense.toFixed(2)}</span>`;
                    }
                    if (event.income > 0) {
                        financialInfo += `<span class="income">+R$ ${event.income.toFixed(2)}</span>`;
                    }
                    financialInfo += '</div>';
                }
                
                eventElement.innerHTML = `
                    <div class="event-time">${event.time}</div>
                    <div class="event-content">
                        <h5>${event.title}</h5>
                        <p>${event.description}</p>
                        ${financialInfo}
                    </div>
                    <div class="event-actions">
                        <button type="button" class="btn-edit" onclick="editEvent(${event.id})" title="Editar evento">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn-delete" onclick="deleteEvent(${event.id})" title="Remover evento">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                todayEventsList.appendChild(eventElement);
            });
        }
    }
}

function loadUpcomingEvents() {
    // Atualizar lista de próximos eventos
    const upcomingEventsList = document.getElementById('upcomingEvents');
    if (upcomingEventsList) {
        upcomingEventsList.innerHTML = '';
        
        const today = new Date();
        const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate > today;
        }).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);
        
        if (upcomingEvents.length === 0) {
            upcomingEventsList.innerHTML = '<div class="no-events">Nenhum evento próximo</div>';
        } else {
            upcomingEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                const eventDate = new Date(event.date);
                const day = eventDate.getDate();
                const month = eventDate.toLocaleDateString('pt-BR', { month: 'short' });
                
                // Criar informações financeiras se houver
                let financialInfo = '';
                if (event.expense > 0 || event.income > 0) {
                    financialInfo = '<div class="event-financial">';
                    if (event.expense > 0) {
                        financialInfo += `<span class="expense">-R$ ${event.expense.toFixed(2)}</span>`;
                    }
                    if (event.income > 0) {
                        financialInfo += `<span class="income">+R$ ${event.income.toFixed(2)}</span>`;
                    }
                    financialInfo += '</div>';
                }
                
                eventElement.innerHTML = `
                    <div class="event-date">${day} ${month}</div>
                    <div class="event-content">
                        <h5>${event.title}</h5>
                        <p>${event.description}</p>
                        ${financialInfo}
                    </div>
                    <div class="event-actions">
                        <button type="button" class="btn-edit" onclick="editEvent(${event.id})" title="Editar evento">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn-delete" onclick="deleteEvent(${event.id})" title="Remover evento">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                upcomingEventsList.appendChild(eventElement);
            });
        }
    }
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
}

function selectDate(day) {
    // Abrir modal para adicionar evento na data selecionada
    openEventModal(day);
}

function openEventModal(day) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    
    // Limpar formulário
    form.reset();
    
    // Definir data selecionada
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = selectedDate.toLocaleDateString('pt-BR');
    
    // Atualizar título do modal
    document.querySelector('#eventModal .modal-header h3').textContent = `Adicionar Evento - ${dateString}`;
    
    // Mostrar modal
    modal.classList.add('show');
    
    // Focar no primeiro campo
    document.getElementById('eventTitle').focus();
    
    // Adicionar data ao formulário (campo oculto)
    let dateInput = document.getElementById('selectedDate');
    if (!dateInput) {
        dateInput = document.createElement('input');
        dateInput.type = 'hidden';
        dateInput.id = 'selectedDate';
        dateInput.name = 'date';
        form.appendChild(dateInput);
    }
    dateInput.value = selectedDate.toISOString();
}

function closeEventModal() {
    const modal = document.getElementById('eventModal');
    modal.classList.remove('show');
    
    // Limpar formulário
    document.getElementById('eventForm').reset();
    
    // Remover campos ocultos se existirem
    const editingEventId = document.getElementById('editingEventId');
    if (editingEventId) {
        editingEventId.remove();
    }
    
    // Resetar título do modal
    document.querySelector('#eventModal .modal-header h3').textContent = 'Adicionar Evento';
}

function showAddEventModal() {
    // Abrir modal para hoje
    const today = new Date().getDate();
    openEventModal(today);
}

// Adicionar event listener para o formulário
document.addEventListener('DOMContentLoaded', function() {
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveEvent();
        });
    }
    
    // Fechar modal ao clicar fora dele
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeEventModal();
            }
        });
    }
    
    // Fechar modal de confirmação ao clicar fora dele
    const deleteModal = document.getElementById('deleteEventModal');
    if (deleteModal) {
        deleteModal.addEventListener('click', function(e) {
            if (e.target === deleteModal) {
                closeDeleteModal();
            }
        });
    }
    
    // Fechar modais de despesa e receita ao clicar fora deles
    const expenseModal = document.getElementById('expenseModal');
    if (expenseModal) {
        expenseModal.addEventListener('click', function(e) {
            if (e.target === expenseModal) {
                closeExpenseModal();
            }
        });
    }
    
    const incomeModal = document.getElementById('incomeModal');
    if (incomeModal) {
        incomeModal.addEventListener('click', function(e) {
            if (e.target === incomeModal) {
                closeIncomeModal();
            }
        });
    }
});

function saveEvent() {
    const form = document.getElementById('eventForm');
    const formData = new FormData(form);
    
    // Validar campos obrigatórios
    const title = formData.get('title');
    const type = formData.get('type');
    const time = formData.get('time');
    const date = formData.get('date');
    
    if (!title || !type || !time || !date) {
        showNotification('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    // Verificar se é edição ou novo evento
    const editingEventId = formData.get('eventId');
    const isEditing = editingEventId && editingEventId !== '';
    
    if (isEditing) {
        // Editar evento existente
        const eventIndex = events.findIndex(e => e.id == editingEventId);
        if (eventIndex !== -1) {
            events[eventIndex] = {
                id: parseInt(editingEventId),
                title: title,
                type: type,
                description: formData.get('description') || '',
                date: new Date(date),
                time: time,
                expense: parseFloat(formData.get('expense')) || 0,
                income: parseFloat(formData.get('income')) || 0
            };
            
            // Salvar no localStorage
            saveEvents();
            
            // Atualizar calendário e listas
            updateCalendar();
            loadAgendaSummary();
            loadUpcomingEvents();
            
            // Fechar modal
            closeEventModal();
            
            // Mostrar notificação de sucesso
            showNotification('Evento editado com sucesso!', 'success');
            
            console.log('Evento editado:', events[eventIndex]);
        } else {
            showNotification('Evento não encontrado para edição!', 'error');
        }
    } else {
        // Criar novo evento
        const newEvent = {
            id: Date.now(), // ID único baseado no timestamp
            title: title,
            type: type,
            description: formData.get('description') || '',
            date: new Date(date),
            time: time,
            expense: parseFloat(formData.get('expense')) || 0,
            income: parseFloat(formData.get('income')) || 0
        };
        
        // Adicionar evento à lista
        events.push(newEvent);
        
        // Salvar no localStorage
        saveEvents();
        
        // Atualizar calendário e listas
        updateCalendar();
        loadAgendaSummary();
        loadUpcomingEvents();
        
        // Fechar modal
        closeEventModal();
        
        // Mostrar notificação de sucesso
        showNotification('Evento adicionado com sucesso!', 'success');
        
        console.log('Novo evento adicionado:', newEvent);
    }
}

function editEvent(eventId) {
    // Encontrar o evento pelo ID
    const event = events.find(e => e.id === eventId);
    if (!event) {
        showNotification('Evento não encontrado!', 'error');
        return;
    }
    
    // Abrir modal com dados do evento
    openEventModalForEdit(event);
}

function deleteEvent(eventId) {
    // Encontrar o evento pelo ID
    const event = events.find(e => e.id === eventId);
    if (!event) {
        showNotification('Evento não encontrado!', 'error');
        return;
    }
    
    // Mostrar modal de confirmação personalizado
    showDeleteModal(event);
}

function showDeleteModal(event) {
    const modal = document.getElementById('deleteEventModal');
    
    // Preencher informações do evento
    document.getElementById('deleteEventTitle').innerHTML = `Evento: <strong>${event.title}</strong>`;
    
    const eventDate = new Date(event.date);
    const dateString = eventDate.toLocaleDateString('pt-BR');
    document.getElementById('deleteEventDate').innerHTML = `Data: <strong>${dateString}</strong>`;
    
    // Armazenar ID do evento para confirmação
    modal.dataset.eventId = event.id;
    
    // Mostrar modal
    modal.classList.add('show');
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteEventModal');
    modal.classList.remove('show');
    
    // Limpar dados
    delete modal.dataset.eventId;
}

function confirmDeleteEvent() {
    const modal = document.getElementById('deleteEventModal');
    const eventId = parseInt(modal.dataset.eventId);
    
    if (!eventId) {
        showNotification('Erro ao identificar evento!', 'error');
        return;
    }
    
    // Encontrar o evento pelo ID
    const event = events.find(e => e.id === eventId);
    if (!event) {
        showNotification('Evento não encontrado!', 'error');
        closeDeleteModal();
        return;
    }
    
    // Remover evento da lista
    events = events.filter(e => e.id !== eventId);
    
    // Salvar no localStorage
    saveEvents();
    
    // Atualizar calendário e listas
    updateCalendar();
    loadAgendaSummary();
    loadUpcomingEvents();
    
    // Fechar modal
    closeDeleteModal();
    
    // Mostrar notificação de sucesso
    showNotification('Evento removido com sucesso!', 'success');
    
    console.log('Evento removido:', event);
}

function openEventModalForEdit(event) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    
    // Limpar formulário
    form.reset();
    
    // Preencher campos com dados do evento
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventType').value = event.type;
    document.getElementById('eventTime').value = event.time;
    document.getElementById('eventExpense').value = event.expense || '';
    document.getElementById('eventIncome').value = event.income || '';
    document.getElementById('eventDescription').value = event.description || '';
    
    // Definir data do evento
    const eventDate = new Date(event.date);
    const dateString = eventDate.toLocaleDateString('pt-BR');
    
    // Atualizar título do modal
    document.querySelector('#eventModal .modal-header h3').textContent = `Editar Evento - ${dateString}`;
    
    // Adicionar ID do evento ao formulário (campo oculto)
    let eventIdInput = document.getElementById('editingEventId');
    if (!eventIdInput) {
        eventIdInput = document.createElement('input');
        eventIdInput.type = 'hidden';
        eventIdInput.id = 'editingEventId';
        eventIdInput.name = 'eventId';
        form.appendChild(eventIdInput);
    }
    eventIdInput.value = event.id;
    
    // Adicionar data ao formulário (campo oculto)
    let dateInput = document.getElementById('selectedDate');
    if (!dateInput) {
        dateInput = document.createElement('input');
        dateInput.type = 'hidden';
        dateInput.id = 'selectedDate';
        dateInput.name = 'date';
        form.appendChild(dateInput);
    }
    dateInput.value = eventDate.toISOString();
    
    // Mostrar modal
    modal.classList.add('show');
    
    // Focar no primeiro campo
    document.getElementById('eventTitle').focus();
}





// ==================== FUNÇÕES DE EVENTOS ====================

function loadEvents() {
    // Carregar eventos do localStorage
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
        events = JSON.parse(savedEvents);
    } else {
        // Começar com lista vazia - sem eventos de exemplo
        events = [];
        saveEvents();
    }
}

function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

// ==================== FUNÇÕES ESPECÍFICAS POR SEÇÃO ====================

// Atualizar dados dos relatórios
function updateReportsData() {
    // Recarregar dados financeiros para garantir que estão atualizados
    loadFinancialData();
    
    const financialData = window.financialData;
    
    if (financialData) {
        const totalIncome = financialData.totalIncome;
        const totalExpenses = financialData.totalExpenses;
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
        
        // Atualizar valores com dados reais
        const summaryItems = document.querySelectorAll('.summary-value');
        if (summaryItems.length >= 4) {
            summaryItems[0].textContent = `R$ ${totalIncome.toFixed(2).replace('.', ',')}`; // Receita Total
            summaryItems[1].textContent = `R$ ${totalExpenses.toFixed(2).replace('.', ',')}`; // Despesa Total
            summaryItems[2].textContent = `R$ ${balance.toFixed(2).replace('.', ',')}`;   // Saldo
            summaryItems[3].textContent = `${savingsRate}%`;       // Economia
        }
        
        console.log('Relatórios atualizados com dados reais:', {
            totalIncome,
            totalExpenses,
            balance,
            savingsRate
        });
    } else {
        // Sem dados - mostrar zeros
        const summaryItems = document.querySelectorAll('.summary-value');
        if (summaryItems.length >= 4) {
            summaryItems[0].textContent = 'R$ 0,00'; // Receita Total
            summaryItems[1].textContent = 'R$ 0,00'; // Despesa Total
            summaryItems[2].textContent = 'R$ 0,00'; // Saldo
            summaryItems[3].textContent = '0%';      // Economia
        }
    }
}

// Atualizar dados financeiros
function updateFinancesData() {
    // Simular atualização de saldos
    const accountBalances = document.querySelectorAll('.account-balance');
    if (accountBalances.length >= 2) {
        accountBalances[0].textContent = 'R$ 1.250,00'; // Conta Corrente
        accountBalances[1].textContent = 'R$ 3.200,00'; // Poupança
    }
    
    // Atualizar progresso do orçamento
    updateBudgetProgress();
}

// Atualizar progresso do orçamento
function updateBudgetProgress() {
    const budgetItems = document.querySelectorAll('.budget-item');
    budgetItems.forEach((item, index) => {
        const progressFill = item.querySelector('.progress-fill');
        if (progressFill) {
            // Simular diferentes percentuais
            const percentages = [75, 60, 90];
            if (percentages[index]) {
                progressFill.style.width = `${percentages[index]}%`;
            }
        }
    });
}


// Exportar funções para uso global

window.toggleSidebar = toggleSidebar;
window.showAddExpenseModal = showAddExpenseModal;
window.showAddIncomeModal = showAddIncomeModal;
window.closeExpenseModal = closeExpenseModal;
window.closeIncomeModal = closeIncomeModal;
window.generateReport = generateReport;
window.logout = logout;
window.handleHomeClick = handleHomeClick;
window.showSection = showSection;
window.exportReport = exportReport;
window.showAddTransactionModal = showAddTransactionModal;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.selectDate = selectDate;
window.showAddEventModal = showAddEventModal;
window.updateReportsData = updateReportsData;
window.updateFinancesData = updateFinancesData;
window.addQuickExpense = addQuickExpense;
window.addQuickIncome = addQuickIncome;
