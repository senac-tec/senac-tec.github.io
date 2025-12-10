#!/usr/bin/env python3
"""
Script para adicionar o sistema de banco local em todas as páginas HTML
"""

import os
import re

def adicionar_banco_local(arquivo_html):
    """Adiciona o script do banco local no arquivo HTML"""
    
    if not os.path.exists(arquivo_html):
        print(f"❌ Arquivo não encontrado: {arquivo_html}")
        return False
    
    try:
        with open(arquivo_html, 'r', encoding='utf-8') as f:
            conteudo = f.read()
        
        # Verificar se já tem o script do banco local
        if 'local-database.js' in conteudo:
            print(f"✅ {arquivo_html} já tem o banco local")
            return True
        
        # Procurar onde inserir o script (antes do primeiro script existente)
        patterns = [
            r'(\s*<script src="js/[^"]+"></script>)',
            r'(\s*<script[^>]*>)',
            r'(\s*</body>)'
        ]
        
        script_local = '    <!-- Sistema de Banco Local -->\n    <script src="js/local-database.js"></script>\n    \n'
        
        for pattern in patterns:
            match = re.search(pattern, conteudo)
            if match:
                # Inserir antes do primeiro script encontrado
                posicao = match.start()
                conteudo_novo = conteudo[:posicao] + script_local + conteudo[posicao:]
                
                # Salvar arquivo
                with open(arquivo_html, 'w', encoding='utf-8') as f:
                    f.write(conteudo_novo)
                
                print(f"✅ Banco local adicionado em: {arquivo_html}")
                return True
        
        print(f"⚠️  Não foi possível adicionar em: {arquivo_html}")
        return False
        
    except Exception as e:
        print(f"❌ Erro ao processar {arquivo_html}: {e}")
        return False

def main():
    """Função principal"""
    print("🎓 Adicionando sistema de banco local nas páginas HTML...")
    print()
    
    # Lista de arquivos HTML para processar
    arquivos_html = [
        'professores.html',
        'turmas.html',
        'notas.html',
        'presenca.html',
        'calendario.html',
        'relatorios.html',
        'perfil.html',
        'usuarios.html',
        'cadastro.html',
        'selecao-tipo.html'
    ]
    
    sucessos = 0
    total = len(arquivos_html)
    
    for arquivo in arquivos_html:
        if adicionar_banco_local(arquivo):
            sucessos += 1
    
    print()
    print(f"📊 Resultado: {sucessos}/{total} arquivos processados com sucesso")
    
    if sucessos == total:
        print("🎉 Todos os arquivos foram atualizados!")
        print("💡 Agora todas as páginas funcionam localmente sem servidor!")
    else:
        print("⚠️  Alguns arquivos podem precisar de ajuste manual")
    
    print()
    print("🚀 Para testar:")
    print("   1. Abra qualquer arquivo .html no navegador")
    print("   2. O sistema funcionará offline com localStorage")
    print("   3. Dados são salvos automaticamente")

if __name__ == "__main__":
    main()