# Integração com Google Classroom

## 🎯 Objetivo
Permitir que professores conectem suas turmas do Google Classroom ao sistema EducaGestão.

## 📋 Funcionalidades

### Para Professores:
- ✅ Conectar conta do Google
- ✅ Importar turmas do Classroom
- ✅ Sincronizar lista de alunos
- ✅ Importar atividades e trabalhos
- ✅ Sincronizar notas automaticamente
- ✅ Ver anúncios do Classroom

## 🔧 Configuração Necessária

### 1. Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto: "EducaGestao-Classroom"
3. Ative a API do Google Classroom
4. Crie credenciais OAuth 2.0

### 2. Configurar OAuth 2.0

**Redirect URIs:**
```
http://localhost:8000/classroom-callback.html
http://localhost:8000/classroom.html
```

**Scopes necessários:**
```
https://www.googleapis.com/auth/classroom.courses.readonly
https://www.googleapis.com/auth/classroom.rosters.readonly
https://www.googleapis.com/auth/classroom.coursework.students.readonly
https://www.googleapis.com/auth/classroom.announcements.readonly
https://www.googleapis.com/auth/classroom.student-submissions.students.readonly
```

### 3. Obter Credenciais

Após criar, você receberá:
- **Client ID**: `seu-client-id.apps.googleusercontent.com`
- **Client Secret**: `seu-client-secret`

## 📁 Arquivos a Criar

### 1. `classroom.html` - Página de integração
### 2. `js/classroom.js` - Lógica de integração
### 3. `classroom-callback.html` - Callback OAuth
### 4. `backend/classroom_api.py` - Backend para Classroom

## 🚀 Implementação

### Fluxo de Autenticação:

1. Professor clica em "Conectar Google Classroom"
2. Redireciona para login do Google
3. Usuário autoriza acesso
4. Google redireciona de volta com token
5. Sistema salva token e sincroniza dados

### Fluxo de Sincronização:

1. Buscar turmas do Classroom
2. Mapear para turmas do sistema
3. Importar alunos
4. Sincronizar atividades
5. Atualizar notas

## 💾 Estrutura de Dados

### Tabela: classroom_connections
```sql
CREATE TABLE classroom_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_sync TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### Tabela: classroom_courses
```sql
CREATE TABLE classroom_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    classroom_id TEXT NOT NULL,
    turma_id INTEGER,
    nome TEXT NOT NULL,
    descricao TEXT,
    professor_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    FOREIGN KEY (professor_id) REFERENCES usuarios(id)
);
```

## 🔐 Segurança

- Tokens são criptografados no banco
- Refresh tokens para renovação automática
- Permissões apenas de leitura
- Cada professor acessa apenas suas turmas

## 📊 Benefícios

1. **Economia de Tempo**: Não precisa cadastrar alunos manualmente
2. **Sincronização**: Dados sempre atualizados
3. **Integração**: Trabalha com ferramenta já conhecida
4. **Automação**: Notas sincronizadas automaticamente

## ⚠️ Limitações

- Requer conta Google Workspace for Education
- Limite de requisições da API (10.000/dia)
- Apenas leitura (não modifica Classroom)
- Requer conexão com internet

## 🎓 Casos de Uso

### Caso 1: Professor Novo
1. Faz login no EducaGestão
2. Conecta Google Classroom
3. Importa turmas existentes
4. Sistema cria turmas automaticamente
5. Alunos são cadastrados

### Caso 2: Sincronização de Notas
1. Professor lança nota no Classroom
2. Sistema sincroniza automaticamente
3. Nota aparece no EducaGestão
4. Relatórios são atualizados

### Caso 3: Nova Atividade
1. Professor cria atividade no Classroom
2. Sistema detecta nova atividade
3. Importa para o calendário
4. Notifica coordenação

## 📞 Próximos Passos

1. Obter credenciais do Google Cloud
2. Implementar autenticação OAuth
3. Criar interface de sincronização
4. Testar com conta de professor
5. Documentar para usuários

## 💡 Quer que eu implemente?

Posso criar:
- ✅ Página de integração com Classroom
- ✅ Sistema de autenticação OAuth
- ✅ Sincronização de turmas e alunos
- ✅ Interface para gerenciar conexão
- ✅ Logs de sincronização

**Preciso que você:**
1. Crie projeto no Google Cloud Console
2. Ative a API do Classroom
3. Me forneça o Client ID e Client Secret

Ou posso criar com credenciais de exemplo para você configurar depois!
