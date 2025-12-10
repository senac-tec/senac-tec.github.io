# Guia Prático de Implementação de Permissões

## 🎯 Objetivo
Implementar controle granular de permissões onde cada cargo tem poderes específicos.

## 📋 Permissões por Cargo

### 🔐 Admin/Diretor
```
✅ TUDO - Acesso total ao sistema
```

### 👔 Coordenador
```
✅ Criar/Editar/Excluir alunos
✅ Visualizar professores (sem editar)
✅ Criar/Editar/Excluir turmas
✅ Criar/Editar/Excluir notas (todas as turmas)
✅ Criar/Editar/Excluir frequência (todas as turmas)
✅ Criar/Editar/Excluir eventos
✅ Visualizar relatórios
✅ Criar/Editar/Excluir matrículas
❌ Gerenciar usuários
❌ Editar professores
```

### 👨‍🏫 Professor
```
✅ Visualizar alunos (apenas suas turmas)
✅ Visualizar turmas (apenas as suas)
✅ Criar/Editar notas (apenas suas turmas)
✅ Criar/Editar frequência (apenas suas turmas)
✅ Visualizar eventos
❌ Criar/Editar/Excluir alunos
❌ Criar/Editar/Excluir turmas
❌ Criar eventos
❌ Visualizar relatórios
❌ Gerenciar matrículas
```

### 📝 Secretaria
```
✅ Criar/Editar alunos
✅ Visualizar professores
✅ Visualizar turmas
✅ Criar/Editar/Excluir matrículas
❌ Excluir alunos
❌ Editar professores
❌ Lançar notas
❌ Registrar frequência
❌ Criar eventos
❌ Visualizar relatórios
```

## 🔧 Como Implementar no HTML

### 1. Adicionar atributos de permissão nos botões

#### Botão de Criar (Novo Aluno)
```html
<button class="btn-primary" data-permission-create="alunos" onclick="openModalNovoAluno()">
    <svg>...</svg>
    Novo Aluno
</button>
```

#### Botão de Editar
```html
<button class="btn-edit" data-permission-edit="alunos" onclick="editarAluno(${id})">
    <svg>...</svg>
    Editar
</button>
```

#### Botão de Excluir
```html
<button class="btn-delete" data-permission-delete="alunos" onclick="excluirAluno(${id})">
    <svg>...</svg>
    Excluir
</button>
```

### 2. Ocultar seções inteiras
```html
<div class="relatorios-section" data-permission-view="relatorios">
    <!-- Conteúdo de relatórios -->
</div>
```

## 💻 Como Implementar no JavaScript

### 1. Verificar permissão antes de ação

```javascript
async function excluirAluno(id, nome) {
    // Verificar permissão
    if (!hasPermission('delete_alunos')) {
        showPermissionDenied('excluir alunos');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir ${nome}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/alunos/${id}`, {
            method: 'DELETE',
            headers: authManager.getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Erro ao excluir aluno');
        }
        
        showAlert('Aluno excluído com sucesso!', 'success');
        loadAlunos();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}
```

### 2. Ocultar botões dinamicamente

```javascript
function renderAlunos() {
    const canEdit = hasPermission('edit_alunos');
    const canDelete = hasPermission('delete_alunos');
    
    const html = alunos.map(aluno => `
        <tr>
            <td>${aluno.nome}</td>
            <td>${aluno.email}</td>
            <td>
                ${canEdit ? `<button onclick="editarAluno(${aluno.id})">Editar</button>` : ''}
                ${canDelete ? `<button onclick="excluirAluno(${aluno.id})">Excluir</button>` : ''}
            </td>
        </tr>
    `).join('');
    
    document.getElementById('alunosTable').innerHTML = html;
}
```

### 3. Filtrar dados para professores

```javascript
async function loadAlunos() {
    try {
        let url = `${API_URL}/alunos`;
        
        // Se for professor, filtrar apenas alunos de suas turmas
        if (authManager.isProfessor()) {
            const minhasTurmas = await getMinhasTurmas();
            const turmaIds = minhasTurmas.map(t => t.id).join(',');
            url += `?turmas=${turmaIds}`;
        }
        
        const response = await fetch(url);
        const alunos = await response.json();
        renderAlunos(alunos);
    } catch (error) {
        console.error('Erro:', error);
    }
}
```

## 📝 Checklist de Implementação

### Página de Alunos
- [ ] Botão "Novo Aluno" - ocultar para Professor
- [ ] Botão "Editar" - ocultar para Professor
- [ ] Botão "Excluir" - ocultar para Professor e Secretaria
- [ ] Filtrar alunos por turma para Professor
- [ ] Adicionar verificações no JavaScript

### Página de Professores
- [ ] Botão "Novo Professor" - ocultar para todos exceto Admin
- [ ] Botão "Editar" - ocultar para todos exceto Admin
- [ ] Botão "Excluir" - ocultar para todos exceto Admin

### Página de Turmas
- [ ] Botão "Nova Turma" - ocultar para Professor e Secretaria
- [ ] Botão "Editar" - ocultar para Professor e Secretaria
- [ ] Botão "Excluir" - ocultar para Professor e Secretaria

### Página de Notas
- [ ] Botão "Lançar Notas" - ocultar para Secretaria
- [ ] Filtrar turmas para Professor (apenas as suas)
- [ ] Permitir edição apenas para Admin, Coordenador e Professor

### Página de Frequência
- [ ] Botão "Registrar Frequência" - ocultar para Secretaria
- [ ] Filtrar turmas para Professor (apenas as suas)
- [ ] Permitir edição apenas para Admin, Coordenador e Professor

### Página de Calendário/Eventos
- [ ] Botão "Novo Evento" - ocultar para Professor e Secretaria
- [ ] Botão "Editar Evento" - ocultar para Professor e Secretaria
- [ ] Botão "Excluir Evento" - ocultar para Professor e Secretaria

### Página de Relatórios
- [ ] Ocultar página inteira para Professor e Secretaria
- [ ] Adicionar no menu: `data-permission-view="relatorios"`

### Página de Usuários
- [ ] Já implementado - apenas Admin/Diretor

## 🚀 Próximos Passos

1. **Testar cada cargo**:
   - Criar usuários de teste para cada cargo
   - Fazer login com cada um
   - Verificar se as permissões estão corretas

2. **Ajustar conforme necessário**:
   - Se alguma permissão estiver errada, ajustar em `permissions.js`
   - Atualizar backend em `app.py` se necessário

3. **Documentar mudanças**:
   - Atualizar `PERMISSOES.md` com qualquer alteração
   - Manter este guia atualizado

## 📞 Suporte

Para dúvidas:
- Consulte `permissions.js` - código fonte das permissões
- Consulte `PERMISSOES.md` - documentação completa
- Consulte `backend/app.py` - implementação no servidor
