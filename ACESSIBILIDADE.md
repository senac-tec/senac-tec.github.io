# 🎨 Sistema Global de Acessibilidade - EducaGestaoDF

## Visão Geral

O sistema de acessibilidade do EducaGestaoDF permite que os usuários personalizem completamente a interface de acordo com suas necessidades, com as configurações sendo aplicadas automaticamente em todas as páginas do sistema.

## Funcionalidades

### 1. **Tamanho da Fonte** 📝
- **Pequeno** (90%): Para usuários que preferem mais conteúdo na tela
- **Normal** (100%): Tamanho padrão
- **Grande** (110%): Para melhor legibilidade

### 2. **Temas** 🌓
- **☀️ Claro**: Tema padrão com fundo gradiente roxo
- **🌙 Escuro**: Fundo escuro (#1e293b → #0f172a) para reduzir fadiga ocular
- **⚫ Alto Contraste**: Preto e branco puro para máxima visibilidade

### 3. **Cores Personalizadas** 🎨
Escolha suas próprias cores para personalizar todo o sistema:
- **Cor Principal**: Cor primária do gradiente
- **Cor Secundária**: Cor secundária do gradiente

**Presets Disponíveis:**
- 🟣 Roxo (Padrão)
- 🔵 Azul
- 🟢 Verde
- 🟠 Laranja
- 🔴 Vermelho
- 🩷 Rosa
- 🔷 Ciano
- 💜 Violeta

### 4. **Alto Contraste** ⚫⚪
- Ativa automaticamente cores de alto contraste
- Bordas grossas (3-4px) em preto
- Fundo preto puro (#000000)
- Texto e elementos em branco puro (#FFFFFF)

### 5. **Reduzir Animações** 🎬
- Remove todas as animações e transições
- Ideal para usuários sensíveis a movimento
- Melhora performance em dispositivos mais lentos

### 6. **Suporte a Leitor de Tela** 🔊
- Adiciona atributos ARIA automaticamente
- Labels descritivos em todos os elementos interativos
- Regiões ARIA para melhor navegação
- Live regions para alertas e notificações

### 7. **Navegação por Teclado Aprimorada** ⌨️
- Indicadores visuais de foco (outline roxo 3px)
- Sombras em elementos focados

**Atalhos de Teclado Globais:**
- `Alt + H` = Ir para Home
- `Alt + P` = Ir para Perfil
- `Alt + A` = Ir para Alunos
- `Alt + T` = Ir para Turmas
- `Escape` = Fechar modais e alertas
- `Ctrl + /` = Mostrar atalhos (no console)

## Como Usar

### Para Usuários

1. **Acessar Configurações**
   - Clique no seu nome no canto superior direito
   - Selecione "Meu Perfil"
   - Role até a seção "Acessibilidade"

2. **Configurar Preferências**
   - Ajuste cada opção conforme sua necessidade
   - As mudanças são aplicadas em tempo real
   - Clique em "Salvar Preferências" para manter as configurações

3. **Restaurar Padrão**
   - Clique em "Restaurar Padrão" para voltar às configurações originais

### Persistência

Todas as configurações são salvas no `localStorage` do navegador e aplicadas automaticamente em todas as páginas do sistema.

## Arquitetura Técnica

### Arquivos Principais

1. **`js/accessibility-global.js`**
   - Script global carregado em todas as páginas
   - Aplica configurações automaticamente ao carregar
   - Gerencia temas, cores e funcionalidades de acessibilidade

2. **`js/perfil.js`**
   - Interface de configuração no perfil do usuário
   - Controles interativos para ajustar preferências
   - Salva configurações no localStorage

3. **`perfil.html`**
   - Página de configuração de acessibilidade
   - Interface visual para todas as opções

### Estrutura de Dados

As configurações são armazenadas no localStorage como JSON:

```javascript
{
  "fontSize": "normal" | "small" | "large",
  "highContrast": boolean,
  "reducedMotion": boolean,
  "screenReader": boolean,
  "keyboardNav": boolean,
  "theme": "light" | "dark" | "high-contrast",
  "primaryColor": "#667eea",
  "secondaryColor": "#764ba2"
}
```

### Integração

O script `accessibility-global.js` é carregado em todas as páginas HTML:

```html
<script src="js/accessibility-global.js"></script>
```

Ele deve ser carregado **ANTES** de outros scripts para garantir que as configurações sejam aplicadas corretamente.

## Classes CSS Aplicadas

### Temas
- `.dark-theme` - Tema escuro
- `.high-contrast` - Alto contraste
- `.large-text` - Texto grande
- `.reduced-motion` - Animações reduzidas

### Atributos
- `data-custom-colors="true"` - Cores personalizadas ativas

### Variáveis CSS
- `--primary-color` - Cor primária personalizada
- `--secondary-color` - Cor secundária personalizada

## API JavaScript

O sistema expõe uma API global para uso programático:

```javascript
// Recarregar configurações
window.AccessibilitySystem.reload();

// Aplicar tamanho de fonte
window.AccessibilitySystem.applyFontSize('large');

// Aplicar tema
window.AccessibilitySystem.applyTheme('dark');

// Aplicar cores personalizadas
window.AccessibilitySystem.applyColors('#3b82f6', '#1e40af');
```

## Compatibilidade

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Acessibilidade WCAG

O sistema segue as diretrizes WCAG 2.1 Nível AA:

- ✅ **1.4.3 Contraste Mínimo**: Alto contraste garante razão 7:1
- ✅ **1.4.4 Redimensionamento de Texto**: Suporte a 200% de zoom
- ✅ **2.1.1 Teclado**: Navegação completa por teclado
- ✅ **2.4.7 Foco Visível**: Indicadores claros de foco
- ✅ **4.1.2 Nome, Função, Valor**: ARIA labels em todos os elementos

## Suporte

Para problemas ou sugestões relacionadas à acessibilidade:
- Abra o console do navegador (F12) para ver logs de debug
- Verifique se o arquivo `accessibility-global.js` está sendo carregado
- Confirme que as configurações estão salvas no localStorage

## Changelog

### Versão 1.0.0 (Novembro 2025)
- ✨ Lançamento inicial do sistema de acessibilidade
- 🎨 8 presets de cores
- 🌓 3 temas (Claro, Escuro, Alto Contraste)
- ⌨️ Atalhos de teclado globais
- 🔊 Suporte completo a leitores de tela
- 💾 Persistência de configurações
- 🌐 Aplicação global em todas as páginas
