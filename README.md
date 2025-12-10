# 🎓 EducaGestãoDF - Sistema de Gestão Escolar

<div align="center">

![Sistema de Gestão Escolar](https://img.shields.io/badge/Sistema-Gestão%20Escolar-blue?style=for-the-badge)
![Versão](https://img.shields.io/badge/Versão-2.0-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Funcionando-success?style=for-the-badge)
![Offline](https://img.shields.io/badge/Funciona-Offline-orange?style=for-the-badge)

**Sistema completo de gestão escolar que funciona 100% offline!**

[🚀 **DEMO AO VIVO**](https://seu-usuario.github.io/EducaGestaoDF/home.html) | [📖 **Documentação**](#-funcionalidades) | [🛠️ **Instalação**](#-como-usar)

</div>

---

## ✨ **Destaques**

- 🌐 **Funciona 100% offline** - Não precisa de servidor
- 💾 **Dados salvos automaticamente** - localStorage do navegador
- 🎨 **Interface moderna** - Design responsivo e profissional
- 🔐 **Sistema de login** - Múltiplos tipos de usuário
- 📊 **Dashboard completo** - Estatísticas em tempo real
- 📱 **Mobile-friendly** - Funciona em qualquer dispositivo

## 🎯 **Funcionalidades**

### 👥 **Gestão de Pessoas**
- ✅ **Alunos** - Cadastro completo com dados pessoais
- ✅ **Professores** - Gestão com especialização por disciplina
- ✅ **Usuários** - Sistema de permissões por cargo

### 🏫 **Gestão Acadêmica**
- ✅ **Turmas** - Criação e associação com professores
- ✅ **Matrículas** - Sistema de vínculos aluno-turma
- ✅ **Notas** - Lançamento por disciplina e bimestre
- ✅ **Frequência** - Controle de presença por turma

### 📅 **Calendário e Eventos**
- ✅ **Calendário escolar** - Eventos e atividades
- ✅ **Agenda** - Compromissos e reuniões
- ✅ **Notificações** - Lembretes automáticos

### 📊 **Relatórios e Analytics**
- ✅ **Dashboard** - Estatísticas em tempo real
- ✅ **Gráficos** - Visualização de dados
- ✅ **Relatórios** - Desempenho e frequência
- ✅ **Exportação** - Dados em CSV/PDF

## 🚀 **Como Usar**

### **Método 1: GitHub Pages (Recomendado)**
```
1. Acesse: https://seu-usuario.github.io/EducaGestaoDF/home.html
2. Faça login com: admin@escola.com / admin123
3. Comece a usar!
```

### **Método 2: Download Local**
```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/EducaGestaoDF.git

# 2. Abra qualquer arquivo HTML no navegador
# Windows:
start home.html

# Linux/Mac:
open home.html
```

### **Método 3: Um Clique (Windows)**
```bash
# Baixe e execute
abrir-sistema-local.bat
```

## 🔑 **Login Padrão**

```
👤 Administrador
Email: admin@escola.com
Senha: admin123

👨‍🏫 Professor
Email: professor@escola.com  
Senha: prof123

📋 Secretaria
Email: secretaria@escola.com
Senha: sec123
```

## 🛠️ **Tecnologias**

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![LocalStorage](https://img.shields.io/badge/LocalStorage-FF6B6B?style=for-the-badge&logo=html5&logoColor=white)

</div>

### **Frontend**
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna com Flexbox/Grid
- **JavaScript (Vanilla)** - Lógica e interatividade
- **LocalStorage** - Banco de dados local

### **Recursos**
- **Responsivo** - Mobile-first design
- **PWA Ready** - Pode ser instalado como app
- **Offline First** - Funciona sem internet
- **Cross-platform** - Windows, Mac, Linux, Mobile

## 📁 **Estrutura do Projeto**

```
EducaGestaoDF/
├── 📄 home.html              # Dashboard principal
├── 👥 alunos.html           # Gestão de alunos
├── 👨‍🏫 professores.html      # Gestão de professores
├── 🏫 turmas.html           # Gestão de turmas
├── 📝 notas.html            # Sistema de notas
├── 📅 calendario.html       # Calendário escolar
├── 📊 relatorios.html       # Relatórios
├── 🔐 index.html            # Página de login
├── 📋 cadastro.html         # Cadastro de usuários
├── 🎨 css/                  # Estilos CSS
├── ⚡ js/                   # Scripts JavaScript
│   ├── local-database.js    # Banco de dados local
│   ├── login.js            # Sistema de autenticação
│   └── ...                 # Outros módulos
└── 🛠️ utils/               # Utilitários e testes
```

## 🎨 **Screenshots**

<div align="center">

### Dashboard Principal
![Dashboard](https://via.placeholder.com/800x400/4f46e5/ffffff?text=Dashboard+Principal)

### Gestão de Alunos
![Alunos](https://via.placeholder.com/800x400/10b981/ffffff?text=Gestão+de+Alunos)

### Sistema de Notas
![Notas](https://via.placeholder.com/800x400/f59e0b/ffffff?text=Sistema+de+Notas)

</div>

## 🧪 **Testes**

O sistema inclui páginas de teste para verificar funcionamento:

```bash
# Teste geral do sistema
testar-sistema.bat

# Teste específico de cadastro
testar-cadastro.bat
```

**Ou acesse:**
- [🧪 Teste Geral](teste-sistema.html)
- [👤 Teste de Cadastro](teste-cadastro.html)

## 📱 **Compatibilidade**

### **Navegadores Suportados**
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Opera 47+

### **Sistemas Operacionais**
- ✅ Windows 7+
- ✅ macOS 10.12+
- ✅ Linux (qualquer distribuição)
- ✅ Android 7+ (Chrome/Firefox)
- ✅ iOS 11+ (Safari)

## 🤝 **Contribuindo**

Contribuições são bem-vindas! Para contribuir:

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Commit** suas mudanças
5. **Push** para a branch
6. **Abra** um Pull Request

```bash
git clone https://github.com/seu-usuario/EducaGestaoDF.git
cd EducaGestaoDF
git checkout -b minha-feature
git commit -m "Adiciona nova feature"
git push origin minha-feature
```

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 **Suporte**

### **Problemas Comuns**

<details>
<summary>❓ Sistema não carrega</summary>

- Verifique se JavaScript está habilitado
- Tente outro navegador
- Limpe o cache (Ctrl+F5)
</details>

<details>
<summary>❓ Dados não aparecem</summary>

- Aguarde alguns segundos para carregar
- Verifique o console (F12) para erros
- Recarregue a página
</details>

<details>
<summary>❓ Login não funciona</summary>

- Use as credenciais padrão
- Verifique se não está em modo privado
- Limpe o localStorage se necessário
</details>

### **Contato**

- 📧 **Email**: seu-email@exemplo.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/seu-usuario/EducaGestaoDF/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/EducaGestaoDF/discussions)

## 🌟 **Roadmap**

### **Versão 2.1** (Em breve)
- [ ] Sistema de backup/restore
- [ ] Mais tipos de relatórios
- [ ] Integração com Google Classroom
- [ ] Notificações push

### **Versão 3.0** (Futuro)
- [ ] PWA completo
- [ ] Sincronização na nuvem
- [ ] App mobile nativo
- [ ] API REST opcional

## 📈 **Estatísticas**

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/seu-usuario/EducaGestaoDF?style=social)
![GitHub forks](https://img.shields.io/github/forks/seu-usuario/EducaGestaoDF?style=social)
![GitHub issues](https://img.shields.io/github/issues/seu-usuario/EducaGestaoDF)
![GitHub license](https://img.shields.io/github/license/seu-usuario/EducaGestaoDF)

</div>

---

<div align="center">

**⭐ Se este projeto te ajudou, deixe uma estrela!**

**🚀 [Experimente agora mesmo!](https://seu-usuario.github.io/EducaGestaoDF/home.html)**

</div>