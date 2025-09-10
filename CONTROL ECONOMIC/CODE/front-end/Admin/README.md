# Dashboard Administrativo - CONTROL

## Descrição
Dashboard administrativo completo para gereniamento e controle do sistema CONTROL, desenvolvido com HTML5, CSS3 e JavaScript vanilla.

## Funcionalidades

### 📊 Visão Geral
- **Cards de Estatísticas**: Total de usuários, usuários ativos, receita total, alertas do sistema
- **Gráficos Interativos**: Usuários ativos por período, distribuição de usuários por role
- **Atividade Recente**: Log das últimas atividades do sistema
- **Atualização em Tempo Real**: Dados atualizados automaticamente

### 👥 Gerenciamento de Usuários
- **Tabela de Usuários**: Lista completa com informações detalhadas
- **Adicionar Usuário**: Modal para criação de novos usuários
- **Editar/Deletar**: Ações para gerenciar usuários existentes
- **Filtros e Busca**: Localização rápida de usuários

### 📈 Analytics Avançados
- **Performance do Sistema**: Monitoramento de CPU, RAM, Disco, Rede
- **Uso de Recursos**: Gráficos de utilização em tempo real
- **Filtros por Período**: Análise de dados por diferentes períodos
- **Métricas Personalizadas**: Indicadores específicos do sistema

### 📋 Relatórios Administrativos
- **Relatório de Usuários**: Estatísticas e dados dos usuários
- **Relatório do Sistema**: Performance e logs do sistema
- **Relatório Financeiro**: Dados financeiros e receitas
- **Exportação**: Geração e download de relatórios

### ⚙️ Configurações do Sistema
- **Configurações Gerais**: Nome do sistema, timeout de sessão
- **Configurações de Segurança**: Tentativas de login, tamanho mínimo de senha
- **Salvamento Automático**: Persistência das configurações

### 📝 Logs de Acesso
- **Histórico Completo**: Todos os acessos ao sistema
- **Filtros Avançados**: Por tipo de ação, usuário, período
- **Detalhes de Acesso**: IP, timestamp, user agent
- **Limpeza de Logs**: Gerenciamento do histórico

## Estrutura de Arquivos

```
Admin/
├── AdminDashboard.html    # Interface principal do dashboard
├── AdminDashboard.css     # Estilos específicos para admin
├── AdminDashboard.js      # Funcionalidades JavaScript
└── README.md             # Documentação
```

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Flexbox, Grid, animações e responsividade
- **JavaScript ES6+**: Funcionalidades interativas e gerenciamento de estado
- **Chart.js**: Gráficos e visualizações avançadas
- **Font Awesome**: Ícones profissionais
- **Sistema de Sessão**: Integração com o sistema de login

## Características do Design

### Paleta de Cores Administrativa
- **Fundo**: Gradiente escuro (#0a0a0a → #1a1a1a)
- **Cards**: #1a1a1a com bordas #333
- **Destaque**: Laranja #ff6b35 (tema administrativo)
- **Sucesso**: Verde #4CAF50
- **Erro**: Vermelho #f44336
- **Texto**: Branco (#fff) e cinza (#888)

### Tipografia
- **Fonte Principal**: Segoe UI
- **Tamanhos**: 12px a 32px
- **Pesos**: 300, 500, 600, bold

### Animações
- Transições suaves (0.3s ease)
- Hover effects profissionais
- Fade in para elementos
- Notificações deslizantes

## Funcionalidades JavaScript

### Gráficos Interativos
- Gráfico de linha para usuários ativos
- Gráfico de pizza para distribuição de roles
- Gráfico de barras para performance
- Atualização dinâmica de dados

### Gerenciamento de Estado
- Sistema de navegação por seções
- Persistência de dados no localStorage
- Sincronização com sistema de login
- Gerenciamento de sessão

### Funcionalidades Administrativas
- CRUD de usuários
- Geração de relatórios
- Monitoramento de logs
- Configurações do sistema

## Responsividade

### Breakpoints
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

### Adaptações Mobile
- Sidebar colapsável
- Menu hambúrguer
- Grid responsivo
- Tabelas com scroll horizontal

## Acessibilidade

- Atributos `title` em todos os elementos interativos
- Labels descritivos
- Contraste adequado
- Navegação por teclado
- Textos alternativos em imagens
- Estrutura semântica

## Integração com Sistema de Login

### Verificação de Permissões
```javascript
// Verificar se usuário é admin
if (!sessionManager.isLoggedIn() || !sessionManager.isAdmin()) {
    window.location.href = '../Login/Login.html';
}
```

### Redirecionamento Automático
- **Admin**: Redirecionado para AdminDashboard.html
- **Super Admin**: Redirecionado para SuperAdminDashboard.html
- **Manager**: Redirecionado para ManagerDashboard.html
- **User**: Redirecionado para dashboard padrão

## Como Usar

### Acesso Administrativo
1. Faça login com credenciais de admin:
   - **Email**: `admin@control.com`
   - **Senha**: `123456`
2. Será redirecionado automaticamente para o dashboard administrativo
3. Explore as diferentes seções do painel

### Navegação
- **Sidebar**: Navegação entre seções
- **Header**: Busca global e notificações
- **Cards**: Estatísticas principais
- **Gráficos**: Visualizações interativas

### Gerenciamento
- **Usuários**: Adicionar, editar, deletar usuários
- **Relatórios**: Gerar relatórios específicos
- **Configurações**: Ajustar parâmetros do sistema
- **Logs**: Monitorar acessos e atividades

## Próximas Funcionalidades

- [ ] Dashboard de Super Admin
- [ ] Sistema de backup automático
- [ ] Notificações push
- [ ] API REST para integração
- [ ] Sistema de auditoria avançado
- [ ] Relatórios personalizáveis
- [ ] Exportação em múltiplos formatos
- [ ] Sistema de alertas em tempo real

## Desenvolvido por
Sistema CONTROL - Dashboard Administrativo
