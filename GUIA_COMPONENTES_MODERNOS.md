# 🎨 Guia de Componentes Modernos - EducaGestaoDF

## Visão Geral

Este guia mostra como usar os componentes modernos baseados no design da tela de perfil para criar interfaces consistentes em todo o sistema.

## Como Usar

### 1. Incluir o CSS

Adicione no `<head>` de cada página HTML:

```html
<link rel="stylesheet" href="css/modern-components.css">
<link rel="stylesheet" href="css/accessibility-fixes.css">
```

### 2. Estrutura Básica da Página

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Título da Página - EducaGestaoDF</title>
    <link rel="stylesheet" href="css/modern-components.css">
    <link rel="stylesheet" href="css/accessibility-fixes.css">
</head>
<body>
    <!-- Top Navigation -->
    <div class="modern-top-nav">
        <div class="modern-logo-section">
            <div class="modern-logo-icon">🎓</div>
            <h1 class="modern-logo-text">EducaGestaoDF</h1>
        </div>
        <a href="home.html" class="modern-btn-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Voltar
        </a>
    </div>

    <div class="modern-container">
        <!-- Conteúdo aqui -->
    </div>

    <!-- Scripts -->
    <script src="js/accessibility-global.js"></script>
    <script src="js/accessibility-indicator.js"></script>
    <script src="js/auth.js"></script>
</body>
</html>
```

## Componentes Disponíveis

### 📦 Cards

#### Card Básico
```html
<div class="modern-card">
    <h2 class="modern-card-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <!-- Ícone SVG -->
        </svg>
        Título do Card
    </h2>
    
    <!-- Conteúdo do card -->
</div>
```

#### Header Card com Avatar
```html
<div class="modern-header-card">
    <div class="modern-avatar">J</div>
    <div class="modern-header-info">
        <h1>João Silva</h1>
        <p class="modern-header-subtitle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <!-- Ícone -->
            </svg>
            Professor
        </p>
        <span class="modern-badge">✓ Ativo</span>
    </div>
</div>
```

### 📊 Stats Cards

```html
<div class="modern-stats-grid">
    <div class="modern-stat-card">
        <div class="modern-stat-icon">👥</div>
        <div class="modern-stat-info">
            <h3>150</h3>
            <p>Total de Alunos</p>
        </div>
    </div>
    
    <div class="modern-stat-card">
        <div class="modern-stat-icon">📚</div>
        <div class="modern-stat-info">
            <h3>12</h3>
            <p>Turmas Ativas</p>
        </div>
    </div>
</div>
```

### 📝 Formulários

#### Grid de Formulário
```html
<form>
    <div class="modern-info-grid">
        <div class="modern-form-group">
            <label class="modern-form-label">Nome</label>
            <input type="text" class="modern-form-input" placeholder="Digite o nome">
        </div>
        
        <div class="modern-form-group">
            <label class="modern-form-label">Email</label>
            <input type="email" class="modern-form-input" placeholder="email@exemplo.com">
        </div>
    </div>
    
    <div class="modern-form-actions">
        <button type="button" class="modern-btn-secondary">Cancelar</button>
        <button type="submit" class="modern-btn-primary">Salvar</button>
    </div>
</form>
```

### 🔘 Botões

```html
<!-- Primário -->
<button class="modern-btn-primary">Salvar</button>

<!-- Secundário -->
<button class="modern-btn-secondary">Cancelar</button>

<!-- Sucesso -->
<button class="modern-btn-success">Aprovar</button>

<!-- Perigo -->
<button class="modern-btn-danger">Excluir</button>
```

### 📋 Tabelas

```html
<table class="modern-table">
    <thead>
        <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Status</th>
            <th>Ações</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>João Silva</td>
            <td>joao@email.com</td>
            <td><span class="modern-badge-success">Ativo</span></td>
            <td>
                <button class="modern-btn-secondary">Editar</button>
            </td>
        </tr>
    </tbody>
</table>
```

### 🔔 Alertas

```html
<!-- Sucesso -->
<div class="modern-alert modern-alert-success">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
    <span>Operação realizada com sucesso!</span>
</div>

<!-- Erro -->
<div class="modern-alert modern-alert-error">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
    <span>Erro ao processar a solicitação.</span>
</div>

<!-- Aviso -->
<div class="modern-alert modern-alert-warning">
    <span>⚠️ Atenção: Esta ação não pode ser desfeita.</span>
</div>

<!-- Info -->
<div class="modern-alert modern-alert-info">
    <span>ℹ️ Informação importante sobre o sistema.</span>
</div>
```

### 🏷️ Badges

```html
<span class="modern-badge-primary">Primário</span>
<span class="modern-badge-success">Ativo</span>
<span class="modern-badge-danger">Inativo</span>
<span class="modern-badge-warning">Pendente</span>
```

## Exemplos Completos

### Página de Listagem

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Alunos - EducaGestaoDF</title>
    <link rel="stylesheet" href="css/modern-components.css">
    <link rel="stylesheet" href="css/accessibility-fixes.css">
</head>
<body>
    <div class="modern-top-nav">
        <div class="modern-logo-section">
            <div class="modern-logo-icon">🎓</div>
            <h1 class="modern-logo-text">EducaGestaoDF</h1>
        </div>
        <a href="home.html" class="modern-btn-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Voltar
        </a>
    </div>

    <div class="modern-container">
        <!-- Stats -->
        <div class="modern-stats-grid">
            <div class="modern-stat-card">
                <div class="modern-stat-icon">👥</div>
                <div class="modern-stat-info">
                    <h3>150</h3>
                    <p>Total de Alunos</p>
                </div>
            </div>
        </div>

        <!-- Card Principal -->
        <div class="modern-card">
            <h2 class="modern-card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                Lista de Alunos
            </h2>

            <div class="modern-form-actions" style="margin-top: 0; padding-top: 0; border-top: none;">
                <button class="modern-btn-primary">+ Novo Aluno</button>
            </div>

            <table class="modern-table" style="margin-top: 2rem;">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Matrícula</th>
                        <th>Turma</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>João Silva</td>
                        <td>2024001</td>
                        <td>9º Ano A</td>
                        <td><span class="modern-badge-success">Ativo</span></td>
                        <td>
                            <button class="modern-btn-secondary" style="padding: 0.5rem 1rem;">Editar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <script src="js/accessibility-global.js"></script>
    <script src="js/accessibility-indicator.js"></script>
    <script src="js/auth.js"></script>
</body>
</html>
```

## Cores do Sistema

### Gradiente Principal
- Primário: `#667eea`
- Secundário: `#764ba2`
- Gradiente: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### Cores de Status
- Sucesso: `#10b981`
- Erro: `#ef4444`
- Aviso: `#f59e0b`
- Info: `#2563eb`

### Cores de Texto
- Título: `#1e293b`
- Subtítulo: `#64748b`
- Texto: `#475569`

## Dicas de Uso

1. **Consistência**: Use sempre os mesmos componentes para ações similares
2. **Espaçamento**: Mantenha o espaçamento de 2rem entre cards
3. **Ícones**: Use SVG inline para melhor controle de cores
4. **Responsividade**: Todos os componentes são responsivos por padrão
5. **Acessibilidade**: Os componentes já incluem suporte a acessibilidade

## Migração de Páginas Antigas

Para migrar uma página antiga:

1. Adicione `modern-components.css` no `<head>`
2. Substitua a estrutura antiga pela nova top-nav
3. Envolva o conteúdo em `<div class="modern-container">`
4. Substitua cards antigos por `modern-card`
5. Atualize botões para usar classes `modern-btn-*`
6. Atualize formulários para usar `modern-form-*`

## Suporte

Para dúvidas ou sugestões sobre os componentes, consulte este guia ou veja exemplos em `perfil.html`.
