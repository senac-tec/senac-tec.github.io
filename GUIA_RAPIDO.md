# Guia Rápido - Sistema de Controle de Acesso

## 🎯 O que foi implementado?

O sistema agora possui **controle de acesso baseado em perfis**, separando as funcionalidades entre **Administradores** e **Professores** (e outros cargos).

## 🔐 Cargos Disponíveis

### 👑 Administrador / Diretor
- **Acesso total** ao sistema
- Pode gerenciar usuários, alunos, professores, turmas, notas, frequência
- Acesso exclusivo à página de **Gerenciamento de Usuários**

### 👨‍🏫 Professor
- Acesso **limitado** às suas turmas
- Pode lançar notas e registrar frequência
- **NÃO pode** excluir alunos, criar turmas ou gerenciar usuários

### 📋 Coordenador
- Acesso amplo (exceto gerenciamento de usuários)
- Pode gerenciar alunos, turmas, notas e frequência

### 📝 Secretaria
- Foco em tarefas administrativas
- Pode gerenciar alunos e matrículas
- **NÃO pode** lançar notas ou registrar frequência

## 🚀 Como Usar

### 1. Fazer Login

```
Administrador:
Email: admin@escola.com
Senha: admin123
```

### 2. Gerenciar Usuários (Apenas Admin)

1. Acesse o menu lateral
2. Clique em **"Usuários"** (ícone com check)
3. Clique em **"Novo Usuário"**
4. Preencha os dados:
   - Nome completo
   - E-mail
   - CPF
   - Telefone (opcional)
   - **Cargo** (define as permissões)
   - Senha
   - Status (Ativo/Inativo)
5. Clique em **"Salvar"**

### 3. Editar ou Excluir Usuários

- Clique no ícone de **lápis** para editar
- Clique no ícone de **lixeira** para excluir
- Use a **barra de busca** para encontrar usuários

### 4. Verificar Permissões

O sistema automaticamente:
- **Oculta** menus que o usuário não tem acesso
- **Bloqueia** ações não permitidas
- **Exibe mensagens** quando acesso é negado

## 🛡️ Segurança Implementada

### Backend (API)
✅ Todas as rotas protegidas requerem autenticação  
✅ Validação de permissões em cada requisição  
✅ Headers de autenticação obrigatórios  
✅ Mensagens de erro claras (401, 403)  

### Frontend (Interface)
✅ Elementos ocultos baseados em permissões  
✅ Requisições incluem dados de autenticação  
✅ Redirecionamento automático se não autenticado  
✅ Badges visuais indicando cargo do usuário  

## 📊 Diferenças entre Cargos

| Funcionalidade | Admin | Coordenador | Professor | Secretaria |
|----------------|-------|-------------|-----------|------------|
| Gerenciar Usuários | ✅ | ❌ | ❌ | ❌ |
| Criar/Excluir Alunos | ✅ | ✅ | ❌ | ✅ |
| Gerenciar Professores | ✅ | ❌ | ❌ | ❌ |
| Criar/Excluir Turmas | ✅ | ✅ | ❌ | ❌ |
| Lançar Notas | ✅ | ✅ | ✅* | ❌ |
| Registrar Frequência | ✅ | ✅ | ✅* | ❌ |
| Ver Relatórios | ✅ | ✅ | ❌ | ❌ |
| Gerenciar Matrículas | ✅ | ✅ | ❌ | ✅ |

*Professores só podem lançar notas e frequência de suas próprias turmas

## 🎨 Identificação Visual

Cada cargo possui uma cor específica:

- 🔴 **Administrador/Diretor**: Vermelho
- 🔵 **Coordenador**: Azul
- 🟢 **Professor**: Verde
- 🟣 **Secretaria**: Roxo

## ⚠️ Mensagens de Erro Comuns

### "Autenticação necessária"
- Você não está logado
- Faça login novamente

### "Acesso negado. Você não tem permissão para esta ação."
- Seu cargo não permite esta ação
- Contate um administrador se precisar de mais permissões

### "Sessão expirada"
- Sua sessão expirou por inatividade
- Faça login novamente

## 🔧 Configurações Técnicas

### Headers de Autenticação
Todas as requisições ao backend incluem:
```
X-User-Id: [ID do usuário]
X-User-Cargo: [Cargo do usuário]
```

### Estrutura de Permissões
```javascript
PERMISSIONS = {
    'admin': ['all'],
    'professor': ['view_alunos', 'edit_notas', 'edit_frequencia'],
    // ...
}
```

## 📝 Próximos Passos Recomendados

1. **Alterar senha padrão** do administrador
2. **Criar usuários** para cada professor e funcionário
3. **Testar permissões** com diferentes cargos
4. **Configurar backup** do banco de dados
5. **Implementar logs** de auditoria (futuro)

## 🆘 Problemas Comuns

### Não consigo ver o menu "Usuários"
- Apenas administradores e diretores veem este menu
- Verifique se está logado com o cargo correto

### Botões de editar/excluir não aparecem
- Seu cargo pode não ter permissão para estas ações
- Verifique suas permissões com um administrador

### Erro ao salvar dados
- Verifique se todos os campos obrigatórios estão preenchidos
- Verifique se o e-mail/CPF já não está cadastrado

## 📚 Documentação Adicional

- `PERMISSOES.md` - Documentação completa de permissões
- `README.md` - Documentação geral do sistema

## 💡 Dicas

1. **Use a busca** para encontrar usuários rapidamente
2. **Desative usuários** ao invés de excluir (mantém histórico)
3. **Revise permissões** periodicamente
4. **Mantenha senhas seguras** e únicas
5. **Faça backup** regular do banco de dados

---

**Desenvolvido para EducaGestão - Sistema de Gestão Escolar**
