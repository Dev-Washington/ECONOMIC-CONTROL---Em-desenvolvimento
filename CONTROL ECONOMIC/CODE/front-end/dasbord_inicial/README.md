# Dashboard CONTROL

## Descrição
Dashboard moderno e responsivo para controle financeiro pessoal, desenvolvido com HTML5, CSS3 e JavaScript vanilla.

## Funcionalidades

### 📊 Estatísticas em Tempo Real
- Cards com métricas principais (Receita, Despesas, Economia, Meta)
- Indicadores visuais de crescimento/declínio
- Atualização automática de dados

### 📈 Gráficos Interativos
- Gráfico de linha para Receitas vs Despesas
- Gráfico de pizza para distribuição de gastos
- Filtros por período (7, 30, 90 dias)
- Biblioteca Chart.js para visualizações

### 🎯 Navegação Intuitiva
- Sidebar responsiva com menu de navegação
- Design mobile-first
- Toggle de menu para dispositivos móveis

### 🔍 Funcionalidades de Busca
- Busca em tempo real na lista de atividades
- Filtros dinâmicos
- Interface limpa e organizada

### 📱 Design Responsivo
- Adaptável para desktop, tablet e mobile
- Sidebar colapsável em telas pequenas
- Grid responsivo para cards e ações

### ⚡ Ações Rápidas
- Botões para adicionar despesas/receitas
- Criação de metas financeiras
- Geração de relatórios

## Estrutura de Arquivos

```
dasbord_inicial/
├── bord1.html          # Estrutura HTML principal
├── bord1.css           # Estilos e layout responsivo
├── bord1.js            # Funcionalidades JavaScript
└── README.md           # Documentação
```

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Flexbox, Grid, animações e responsividade
- **JavaScript ES6+**: Funcionalidades interativas
- **Chart.js**: Gráficos e visualizações
- **Font Awesome**: Ícones
- **Google Fonts**: Tipografia

## Características do Design

### Paleta de Cores
- **Fundo**: Gradiente escuro (#0f0f0f → #1a1a1a)
- **Cards**: #1a1a1a com bordas #333
- **Destaque**: Verde #4CAF50
- **Erro**: Vermelho #f44336
- **Texto**: Branco (#fff) e cinza (#888)

### Tipografia
- **Fonte Principal**: Segoe UI
- **Tamanhos**: 12px a 32px
- **Pesos**: 300, 500, 600, bold

### Animações
- Transições suaves (0.3s ease)
- Hover effects
- Fade in para elementos
- Notificações deslizantes

## Funcionalidades JavaScript

### Gráficos
- Inicialização automática dos gráficos
- Atualização dinâmica de dados
- Redimensionamento responsivo

### Navegação
- Toggle de sidebar
- Navegação ativa
- Fechamento automático em mobile

### Busca
- Filtro em tempo real
- Busca por título e descrição
- Interface limpa

### Notificações
- Sistema de notificações toast
- Diferentes tipos (success, error, warning, info)
- Animações de entrada e saída

## Responsividade

### Breakpoints
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

### Adaptações Mobile
- Sidebar oculta por padrão
- Menu hambúrguer
- Grid de 1 coluna
- Botões maiores para touch

## Acessibilidade

- Atributos `title` em botões
- Labels descritivos
- Contraste adequado
- Navegação por teclado
- Textos alternativos em imagens

## Como Usar

1. Abra o arquivo `bord1.html` em um navegador
2. Navegue pelos diferentes menus da sidebar
3. Use a busca para filtrar atividades
4. Clique nos botões de ação rápida
5. Altere o período dos gráficos
6. Teste a responsividade redimensionando a janela

## Próximas Funcionalidades

- [ ] Integração com API de dados reais
- [ ] Modo escuro/claro
- [ ] Exportação de relatórios
- [ ] Configurações personalizáveis
- [ ] Notificações push
- [ ] Sincronização em nuvem

## Desenvolvido por
Sistema CONTROL - Controle Financeiro Pessoal

