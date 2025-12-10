# Sistema de Permissões - EducaGestão

## Visão Geral

O sistema implementa controle de acesso baseado em cargos (RBAC - Role-Based Access Control), onde cada cargo possui permissões específicas para acessar e modificar recursos do sistema.

## Cargos e Permissões

### 1. Administrador / Diretor
**Acesso Total ao Sistema**

- ✅ Gerenciar usuários (criar, editar, excluir)
- ✅ Gerenciar alunos
- ✅ Gerenciar professores
- ✅ Gerenciar turmas
- ✅ Gerenciar matrículas
- ✅ Lançar e editar notas
- ✅ Registrar frequência
- ✅ Gerenciar eventos/calendário
- ✅ Visualizar todos os relatórios
- ✅ Acesso a configurações do sistema

**Páginas Exclusivas:**
- `/usuarios.html` - Gerenciamento de usuários do sistema

### 2. Coordenador
**Acesso Amplo (exceto gerenciamento de usuários)**

- ❌ Gerenciar usuários
- ✅ Gerenciar alunos
- ✅ Visualizar professores
- ✅ Gerenciar turmas
- ✅ Gerenciar matrículas
- ✅ Lançar e editar notas
- ✅ Registrar frequência
- ✅ Gerenciar eventos/calendário
- ✅ Visualizar relatórios

### 3. Professor
**Acesso Limitado às Suas Turmas**

- ❌ Gerenciar usuários
- ✅ Visualizar alunos (somente de suas turmas)
- ❌ Gerenciar professores
- ✅ Visualizar turmas (somente as suas)
- ❌ Gerenciar matrículas
- ✅ Lançar e editar notas (somente de suas turmas)
- ✅ Registrar frequência (somente de suas turmas)
- ✅ Visualizar eventos/calendário
- ❌ Visualizar relatórios completos

**Restrições:**
- Não pode excluir ou criar alunos
- Não pode modificar turmas
- Não pode acessar dados de outras turmas

### 4. Secretaria
**Acesso Administrativo (sem acesso pedagógico)**

- ❌ Gerenciar usuários
- ✅ Gerenciar alunos
- ✅ Visualizar professores
- ✅ Visualizar turmas
- ✅ Gerenciar matrículas
- ❌ Lançar notas
- ❌ Registrar frequência
- ❌ Gerenciar eventos
- ❌ Visualizar relatórios pedagógicos

## Implementação Técnica

### Backend (Flask)

O backend utiliza decorators para proteger as rotas:

```python
@app.route('/api/usuarios', methods=['GET'])
@require_auth
@require_permission('all')
def get_usuarios():
    # Apenas admin/diretor pode acessar
    pass
```

**Headers Necessários:**
- `X-User-Id`: ID do usuário autenticado
- `X-User-Cargo`: Cargo do usuário (admin, professor, etc.)

### Frontend (JavaScript)

O frontend verifica permissões antes de exibir elementos:

```javascript
// Verificar se usuário tem permissão
if (authManager.hasPermission('edit_alunos')) {
    // Mostrar botão de editar
}

// Verificar se é admin
if (authManager.isAdmin()) {
    // Mostrar funcionalidades administrativas
}
```

**Classes CSS para Controle de Visibilidade:**
- `.admin-only` - Visível apenas para admin/diretor
- `[data-permission="permissao"]` - Visível apenas com permissão específica

## Permissões Disponíveis

| Permissão | Descrição |
|-----------|-----------|
| `all` | Acesso total (admin/diretor) |
| `view_dashboard` | Visualizar dashboard |
| `view_alunos` | Visualizar lista de alunos |
| `edit_alunos` | Criar/editar/excluir alunos |
| `view_professores` | Visualizar lista de professores |
| `edit_professores` | Criar/editar/excluir professores |
| `view_turmas` | Visualizar turmas |
| `edit_turmas` | Criar/editar/excluir turmas |
| `view_notas` | Visualizar notas |
| `edit_notas` | Lançar/editar notas |
| `view_frequencia` | Visualizar frequência |
| `edit_frequencia` | Registrar frequência |
| `view_eventos` | Visualizar eventos |
| `edit_eventos` | Criar/editar eventos |
| `view_relatorios` | Visualizar relatórios |
| `view_matriculas` | Visualizar matrículas |
| `edit_matriculas` | Gerenciar matrículas |

## Usuários Padrão

O sistema vem com um usuário administrador padrão:

```
Email: admin@escola.com
Senha: admin123
Cargo: admin
```

**⚠️ IMPORTANTE:** Altere a senha padrão após o primeiro acesso!

## Segurança

### Boas Práticas Implementadas:

1. **Autenticação Obrigatória**: Todas as rotas protegidas requerem autenticação
2. **Validação de Permissões**: Backend valida permissões em cada requisição
3. **Headers de Autenticação**: Uso de headers customizados para identificação
4. **Sessões com Expiração**: Sessões temporárias expiram por inatividade
5. **Feedback de Erros**: Mensagens claras quando acesso é negado

### Melhorias Futuras Recomendadas:

- [ ] Implementar JWT (JSON Web Tokens)
- [ ] Hash de senhas com bcrypt
- [ ] Auditoria de ações (logs)
- [ ] Autenticação de dois fatores (2FA)
- [ ] Política de senhas fortes
- [ ] Bloqueio após tentativas falhas

## Como Adicionar Novas Permissões

### 1. Backend (app.py)

Adicione a permissão no dicionário `PERMISSIONS`:

```python
PERMISSIONS = {
    'professor': [
        'view_dashboard',
        'nova_permissao'  # Adicionar aqui
    ]
}
```

### 2. Proteger Rota

Use o decorator `@require_permission`:

```python
@app.route('/api/nova-funcionalidade', methods=['GET'])
@require_auth
@require_permission('nova_permissao')
def nova_funcionalidade():
    pass
```

### 3. Frontend

Verifique a permissão antes de exibir:

```javascript
if (authManager.hasPermission('nova_permissao')) {
    // Exibir funcionalidade
}
```

Ou use atributo HTML:

```html
<button data-permission="nova_permissao">Ação</button>
```

## Testando Permissões

Para testar diferentes níveis de acesso, use os usuários de teste no login ou crie novos usuários através da página de gerenciamento (apenas admin).

## Suporte

Para dúvidas ou problemas relacionados a permissões, consulte a documentação técnica ou entre em contato com o administrador do sistema.
