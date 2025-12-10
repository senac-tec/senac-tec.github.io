# 🔧 Solução de Problemas - Acessibilidade

## Problemas Comuns e Soluções

### 1. **Cores estão bagunçadas / Layout desorganizado**

**Causa**: Conflito entre cores personalizadas e CSS original

**Solução**:
1. Abra o console do navegador (F12)
2. Verifique se há erros JavaScript
3. Clique no botão "✕" no indicador de acessibilidade (canto inferior direito)
4. Ou vá em Perfil → Acessibilidade → Restaurar Padrão

### 2. **Configurações não estão sendo aplicadas**

**Causa**: Scripts não carregados ou localStorage bloqueado

**Solução**:
1. Verifique se `accessibility-global.js` está sendo carregado
2. Abra o console e digite: `localStorage.getItem('accessibilitySettings')`
3. Se retornar `null`, as configurações não foram salvas
4. Tente salvar novamente em Perfil → Acessibilidade

### 3. **Tema escuro não funciona**

**Causa**: Conflito com cores personalizadas

**Solução**:
1. Vá em Perfil → Acessibilidade
2. Clique em "Restaurar Padrão"
3. Selecione apenas o tema "🌙 Escuro"
4. Clique em "Salvar Preferências"

### 4. **Alto contraste não ativa**

**Causa**: Toggle não está funcionando

**Solução**:
1. Vá em Perfil → Acessibilidade
2. Clique no toggle "Alto Contraste"
3. OU selecione o tema "⚫ Alto Contraste"
4. Salve as preferências

### 5. **Indicador de acessibilidade não aparece**

**Causa**: Nenhuma configuração personalizada ativa

**Solução**:
- O indicador só aparece quando há configurações diferentes do padrão
- Configure algo em Perfil → Acessibilidade e salve

### 6. **Atalhos de teclado não funcionam**

**Causa**: Navegação por teclado desativada

**Solução**:
1. Vá em Perfil → Acessibilidade
2. Ative "Navegação por Teclado Aprimorada"
3. Salve as preferências

### 7. **Cores personalizadas não aparecem em todas as páginas**

**Causa**: CSS de correção não carregado

**Solução**:
1. Verifique se `accessibility-fixes.css` está no `<head>` da página
2. Limpe o cache do navegador (Ctrl + Shift + Delete)
3. Recarregue a página (Ctrl + F5)

### 8. **Texto muito pequeno/grande**

**Causa**: Tamanho de fonte incorreto

**Solução**:
1. Vá em Perfil → Acessibilidade
2. Ajuste "Tamanho da Fonte"
3. Escolha: Pequeno, Normal ou Grande
4. Salve as preferências

## Comandos de Debug

Abra o console (F12) e execute:

```javascript
// Ver configurações atuais
console.log(JSON.parse(localStorage.getItem('accessibilitySettings')));

// Resetar tudo
localStorage.removeItem('accessibilitySettings');
window.location.reload();

// Forçar recarregar configurações
window.AccessibilitySystem.reload();

// Aplicar tema específico
window.AccessibilitySystem.applyTheme('dark');

// Aplicar cores específicas
window.AccessibilitySystem.applyColors('#3b82f6', '#1e40af');
```

## Verificação de Arquivos

Certifique-se de que estes arquivos existem:

- ✅ `js/accessibility-global.js`
- ✅ `js/accessibility-indicator.js`
- ✅ `js/perfil.js`
- ✅ `css/accessibility-fixes.css`
- ✅ `perfil.html`

## Ordem de Carregamento Correta

No `<head>` de cada página HTML:

```html
<!-- CSS -->
<link rel="stylesheet" href="css/styles.css">
<link rel="stylesheet" href="css/accessibility-fixes.css">

<!-- JavaScript (antes do </body>) -->
<script src="js/accessibility-global.js"></script>
<script src="js/accessibility-indicator.js"></script>
```

## Resetar Completamente

Se nada funcionar:

1. Abra o console (F12)
2. Execute:
```javascript
localStorage.clear();
window.location.reload();
```

3. Ou delete manualmente:
   - Vá em DevTools → Application → Local Storage
   - Delete `accessibilitySettings`

## Suporte a Navegadores

| Navegador | Versão Mínima | Status |
|-----------|---------------|--------|
| Chrome    | 90+           | ✅ Total |
| Firefox   | 88+           | ✅ Total |
| Safari    | 14+           | ✅ Total |
| Edge      | 90+           | ✅ Total |
| IE        | Qualquer      | ❌ Não suportado |

## Contato

Se o problema persistir:
1. Anote a mensagem de erro do console
2. Tire um print da tela
3. Descreva o que estava fazendo quando o erro ocorreu
4. Informe qual navegador e versão está usando
