# Backend - Sistema de Gestão Escolar

## Instalação

1. Instale as dependências:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Execute o servidor:
\`\`\`bash
python app.py
\`\`\`

O servidor estará rodando em `http://localhost:5000`

## Endpoints da API

### Estatísticas
- GET `/api/stats` - Retorna estatísticas do dashboard

### Alunos
- GET `/api/alunos` - Lista todos os alunos
- GET `/api/alunos/<id>` - Busca um aluno específico
- POST `/api/alunos` - Cria um novo aluno
- PUT `/api/alunos/<id>` - Atualiza um aluno
- DELETE `/api/alunos/<id>` - Exclui um aluno

### Professores
- GET `/api/professores` - Lista todos os professores
- GET `/api/professores/<id>` - Busca um professor específico
- POST `/api/professores` - Cria um novo professor
- PUT `/api/professores/<id>` - Atualiza um professor
- DELETE `/api/professores/<id>` - Exclui um professor

### Turmas
- GET `/api/turmas` - Lista todas as turmas
- GET `/api/turmas/<id>` - Busca uma turma específica
- POST `/api/turmas` - Cria uma nova turma
- PUT `/api/turmas/<id>` - Atualiza uma turma
- DELETE `/api/turmas/<id>` - Exclui uma turma

### Matrículas
- GET `/api/matriculas` - Lista todas as matrículas
- POST `/api/matriculas` - Cria uma nova matrícula
