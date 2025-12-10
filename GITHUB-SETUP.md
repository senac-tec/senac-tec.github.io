# 🚀 Configuração do GitHub Pages

## 📋 **Passos para ativar o GitHub Pages:**

### 1. **Configurar o Repositório**
1. Vá para **Settings** do seu repositório
2. Role até a seção **Pages** (no menu lateral)
3. Em **Source**, selecione **GitHub Actions**
4. Salve as configurações

### 2. **Aguardar o Deploy**
- O GitHub Actions vai fazer o deploy automaticamente
- Aguarde alguns minutos
- Verifique na aba **Actions** se o deploy foi bem-sucedido

### 3. **Acessar o Sistema**
Seu sistema estará disponível em:
```
https://SEU-USUARIO.github.io/EducaGestaoDF/home.html
```

## 🔧 **Personalização**

### **Atualizar URLs no README**
Substitua `seu-usuario` pelo seu nome de usuário do GitHub nos arquivos:
- `README.md`
- `index.md`
- `_config.yml`
- `.github/README.md`

### **Exemplo:**
Se seu usuário é `joaosilva`, as URLs ficarão:
```
https://joaosilva.github.io/EducaGestaoDF/home.html
```

## 🎯 **Melhorar a Apresentação**

### **1. Adicionar Screenshots**
- Tire prints das telas do sistema
- Faça upload para uma pasta `screenshots/`
- Atualize o README.md com as imagens reais

### **2. Criar um Logo**
- Crie um logo para o projeto
- Adicione no README.md
- Use como favicon

### **3. Adicionar Badges**
O README já inclui badges automáticos que mostram:
- Status do projeto
- Número de estrelas
- Licença
- Issues abertas

## 📱 **Tornar PWA (Opcional)**

Para transformar em um app instalável:

1. **Criar `manifest.json`:**
```json
{
  "name": "EducaGestãoDF",
  "short_name": "EGD",
  "description": "Sistema de Gestão Escolar",
  "start_url": "/EducaGestaoDF/home.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

2. **Adicionar Service Worker**
3. **Incluir meta tags no HTML**

## 🌟 **Promover o Projeto**

### **1. Adicionar Tópicos**
No GitHub, adicione tópicos como:
- `gestao-escolar`
- `sistema-educacional`
- `javascript`
- `html-css`
- `offline-first`
- `pwa`

### **2. Criar Releases**
- Marque versões importantes
- Adicione changelog
- Anexe arquivos ZIP

### **3. Documentação**
- Wiki do GitHub
- GitHub Discussions
- Issues templates

## 🔗 **Links Úteis**

- [GitHub Pages Docs](https://docs.github.com/pages)
- [GitHub Actions](https://docs.github.com/actions)
- [Markdown Guide](https://guides.github.com/features/mastering-markdown/)

---

**🎉 Pronto! Seu sistema estará online e acessível para qualquer pessoa!**