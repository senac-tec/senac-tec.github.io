@echo off
echo ========================================
echo  ATUALIZACAO DO REPOSITORIO GITHUB
echo ========================================
echo.
echo Este script ira atualizar seu repositorio GitHub
echo com todas as novas funcionalidades implementadas:
echo.
echo ✅ Sistema de recuperacao de senha
echo ✅ Deteccao avancada de robo  
echo ✅ CAPTCHA offline integrado
echo ✅ Interface moderna e responsiva
echo.
echo Pressione qualquer tecla para continuar...
pause >nul
echo.

echo 📁 Verificando status do repositorio...
git status
echo.

echo 📋 Adicionando todos os arquivos...
git add .
echo.

echo 📊 Verificando arquivos a serem commitados...
git status
echo.

echo 💾 Fazendo commit com mensagem descritiva...
git commit -m "🔐 Implementação completa de segurança e recuperação de senha

✨ Novas funcionalidades:
- Sistema de recuperação de senha com 4 etapas
- Detecção avançada de robô com análise comportamental  
- CAPTCHA offline com 3 tipos de desafios
- Integração completa de segurança em todas as páginas

🛡️ Segurança:
- Análise de movimento do mouse em tempo real
- Detecção de padrões suspeitos de robôs
- Validação dupla (CAPTCHA + comportamento)
- Sistema de pontuação humana (0-100)

📱 Interface:
- Design responsivo e moderno
- Feedback visual em tempo real
- Animações suaves e intuitivas
- Compatível com dispositivos móveis

🧪 Testes:
- Scripts de teste automatizados
- Páginas de demonstração  
- Documentação completa
- Guias de uso detalhados

📁 Arquivos principais:
- esqueci-senha.html (recuperação de senha)
- js/robot-detection.js (detecção de robô)
- js/captcha.js (sistema CAPTCHA)
- css/robot-detection.css (estilos)
- Documentação completa (.md)
- Scripts de teste (.bat)"
echo.

echo 🚀 Enviando para o GitHub...
git push origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo  ✅ ATUALIZACAO CONCLUIDA COM SUCESSO!
    echo ========================================
    echo.
    echo Seu repositorio foi atualizado com:
    echo.
    echo 🔐 Sistema de recuperacao de senha completo
    echo 🤖 Deteccao avancada de robo
    echo 🛡️ CAPTCHA offline integrado
    echo 📱 Interface responsiva moderna
    echo 📚 Documentacao completa
    echo 🧪 Testes automatizados
    echo.
    echo Acesse seu repositorio no GitHub para verificar!
    echo.
    echo Quer abrir o GitHub no navegador? (S/N)
    set /p choice=
    if /i "%choice%"=="S" (
        echo Abrindo GitHub...
        start https://github.com
    )
) else (
    echo ========================================
    echo  ❌ ERRO NA ATUALIZACAO
    echo ========================================
    echo.
    echo Verifique:
    echo 1. Se voce esta conectado a internet
    echo 2. Se o repositorio existe no GitHub
    echo 3. Se voce tem permissoes de escrita
    echo 4. Se o Git esta configurado corretamente
    echo.
    echo Tente executar os comandos manualmente:
    echo git add .
    echo git commit -m "Atualizacao do sistema"
    echo git push origin main
)

echo.
echo Pressione qualquer tecla para sair...
pause >nul