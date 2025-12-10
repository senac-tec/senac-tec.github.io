# 🎓 EducaGestaoDF - Sistema de Gestão Escolar

Sistema completo de gestão escolar com **servidor integrado**, banco de dados automático e interface moderna.

## 🚀 Inicialização Rápida

### **🆕 Método 1: Sistema Local (SUPER SIMPLES!)**

**Não precisa instalar NADA! Funciona offline!**

```bash
# Windows: Clique duas vezes
abrir-sistema-local.bat

# Ou abra diretamente qualquer página HTML
home.html
alunos.html
professores.html
# etc...
```

**✅ Vantagens:**
- Zero configuração
- Funciona sem internet
- Dados salvos automaticamente
- Todas as páginas funcionam offline

### **🧪 Testar o Sistema:**

```bash
# Para verificar se tudo está funcionando
testar-sistema.bat
```

### **Método 2: Sistema Completo (Com Servidor)**

**Windows:**
```bash
# Clique duas vezes no arquivo
iniciar.bat
```

**Linux/Mac:**
```bash
# No terminal
./iniciar.sh
```

### **Método 3: Linha de Comando**

```bash
# Executar diretamente
python app.py

# Ou usando npm
npm run escola
```

## 🎯 Duas Versões Disponíveis

### 🌟 **Versão Local** (`sistema-local.html`)
- ✅ **Zero configuração** - Clique duplo e funciona
- ✅ **Sem servidor** - Abre direto no navegador
- ✅ **Funciona offline** - Não precisa de internet
- ✅ **Dados automáticos** - Salva no localStorage
- ✅ **Compartilhamento fácil** - Um arquivo só
- ⚠️ **Recursos básicos** - CRUD simples

### 🚀 **Versão Completa** (`app.py`)
- ✅ **Recursos avançados** - Relatórios, gráficos, etc
- ✅ **Banco SQLite** - Dados persistentes
- ✅ **API REST** - Integração com outros sistemas
- ✅ **Multi-usuário** - Sistema de login
- ⚠️ **Precisa Python** - Instalação necessária

## ✨ O que mudou?

### 🔄 **Sistema Integrado**
- ✅ **Um único arquivo** (`app.py`) roda tudo
- ✅ **Banco de dados automático** - cria se não existir
- ✅ **Servidor web integrado** - não precisa de dois terminais
- ✅ **Inicialização automática** do navegador

### 📁 **Estrutura Simplificada**

```
gestao-escolar/
├── app.py                # 🆕 SERVIDOR INTEGRADO (novo)
├── iniciar.bat           # 🆕 Script Windows (novo)
├── iniciar.sh            # 🆕 Script Linux/Mac (novo)
├── start.py              # ⚠️  Método antigo (ainda funciona)
├── backend/              # ⚠️  Pasta antiga (ainda funciona)
├── css/                  # Estilos CSS
├── js/                   # JavaScript
├── *.html                # Páginas do sistema
└── escola.db             # Banco SQLite (criado automaticamente)
```

## 🎯 Como Funciona Agora

1. **Execute um comando** → `python app.py`
2. **Sistema inicia automaticamente:**
   - 🗄️ Cria banco de dados (se não existir)
   - 🌐 Inicia servidor web (porta 8000)
   - 🔧 Inicia API (porta 5000)
   - 🌍 Abre navegador automaticamente
3. **Pronto para usar!** → `http://localhost:8000`

## 💡 Vantagens do Sistema Integrado

### ✅ **Mais Simples**
- Um único arquivo para executar
- Não precisa gerenciar dois servidores
- Instalação automática de dependências

### ✅ **Mais Confiável**
- Banco de dados criado automaticamente
- Não perde dados entre execuções
- Tratamento de erros melhorado

### ✅ **Mais Rápido**
- Inicialização em segundos
- Abertura automática do navegador
- Feedback visual do status

## ✨ Funcionalidades Principais

### 🏠 **Dashboard Inteligente**
- ✅ **Estatísticas em tempo real** do banco de dados
- ✅ **Atividades recentes** automáticas
- ✅ **Mini calendário** com eventos
- ✅ **Indicador de conexão** visual

### 👥 **Gestão Completa de Pessoas**
- ✅ **Alunos**: CRUD completo com validações
- ✅ **Professores**: Especialização por disciplina
- ✅ **Busca avançada** por qualquer campo
- ✅ **Status dinâmicos** (Ativo/Inativo/Licença)

### 🏫 **Gestão Acadêmica**
- ✅ **Turmas**: Capacidade e horários
- ✅ **Matrículas**: Controle de vínculos
- ✅ **Notas**: Sistema completo por disciplina/bimestre
- ✅ **Frequência**: Controle de presença por turma

### 📅 **Calendário Escolar**
- ✅ **Eventos** com tipos diferenciados
- ✅ **Associação** com turmas e professores
- ✅ **Visualização mensal** interativa
- ✅ **CRUD completo** de eventos

### 📊 **Sistema de Relatórios Avançado**
- ✅ **10 tipos de gráficos** interativos
- ✅ **KPIs em tempo real** calculados
- ✅ **Análises automáticas** (top performers, alunos em risco)
- ✅ **Exportação** CSV/PNG profissional

### 📋 **Boletim Individual**
- ✅ **Dados reais** do banco por aluno
- ✅ **Gráficos personalizados** de desempenho
- ✅ **Cálculo automático** de médias e frequência
- ✅ **Status de aprovação** dinâmico

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização moderna e responsiva
- **JavaScript (Vanilla)** - Lógica e interação com API

### Backend
- **Python 3** - Linguagem de programação
- **Flask** - Framework web integrado
- **SQLite** - Banco de dados automático
- **Flask-CORS** - Suporte a CORS

## 📡 API Endpoints

### Estatísticas
- `GET /api/stats` - Retorna estatísticas do dashboard

### Alunos
- `GET /api/alunos` - Lista todos os alunos
- `GET /api/alunos/<id>` - Busca um aluno específico
- `POST /api/alunos` - Cria um novo aluno
- `PUT /api/alunos/<id>` - Atualiza um aluno
- `DELETE /api/alunos/<id>` - Exclui um aluno

### Professores
- `GET /api/professores` - Lista todos os professores
- `POST /api/professores` - Cria um novo professor

### Turmas
- `GET /api/turmas` - Lista todas as turmas
- `POST /api/turmas` - Cria uma nova turma

### Matrículas
- `GET /api/matriculas` - Lista todas as matrículas
- `POST /api/matriculas` - Cria uma nova matrícula

## 🗄️ Banco de Dados

O sistema utiliza SQLite com as seguintes tabelas:

- **alunos** - Informações dos alunos
- **professores** - Informações dos professores
- **turmas** - Informações das turmas
- **matriculas** - Relacionamento entre alunos e turmas
- **notas** - Notas dos alunos
- **frequencia** - Registro de frequência
- **eventos** - Calendário escolar
- **usuarios** - Sistema de login

## 🎨 Design

O sistema possui um design moderno e responsivo com:
- Sidebar de navegação fixa
- Cards de estatísticas com ícones coloridos
- Tabelas responsivas
- Modais para formulários
- Badges de status coloridos
- Paleta de cores profissional (azul, verde, roxo, laranja)

## 📋 Requisitos

- **Python 3.7+** (instalação automática de dependências)
- **Navegador web moderno** (Chrome, Firefox, Safari, Edge)

## 🆘 Suporte

Para problemas ou dúvidas, verifique:

1. **Sistema não inicia:**
   - Verifique se Python está instalado: `python --version`
   - Execute: `python app.py` no terminal para ver erros

2. **Página não carrega:**
   - Aguarde alguns segundos após executar
   - Acesse manualmente: `http://localhost:8000`

3. **Dados não aparecem:**
   - Verifique se o arquivo `escola.db` foi criado
   - Reinicie o sistema: Ctrl+C e execute novamente

4. **Erro de porta ocupada:**
   - Feche outros programas que usem as portas 5000 ou 8000
   - Ou reinicie o computador

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de demonstração.

---

**🎓 Sistema pronto para uso! Execute `python app.py` e comece a gerenciar sua escola.**