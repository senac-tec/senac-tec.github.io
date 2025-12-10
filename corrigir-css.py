#!/usr/bin/env python3
"""
Script para corrigir referências CSS duplicadas e caracteres especiais
"""

import os
import re

def corrigir_referencias_css(arquivo_html):
    """Corrige referências CSS no arquivo HTML"""
    
    if not os.path.exists(arquivo_html):
        print(f"❌ Arquivo não encontrado: {arquivo_html}")
        return False
    
    try:
        with open(arquivo_html, 'r', encoding='utf-8') as f:
            conteudo = f.read()
        
        # Remover caracteres especiais das referências CSS
        conteudo = re.sub(r'`n\s*', '\n    ', conteudo)
        
        # Corrigir referências CSS duplicadas
        css_refs = [
            'css/styles.css',
            'css/accessibility-fixes.css',
            'css/notifications-global.css',
            'css/user-menu.css'
        ]
        
        # Remover todas as referências CSS existentes
        for css_ref in css_refs:
            # Remover duplicatas
            pattern = rf'<link rel="stylesheet" href="{css_ref}"[^>]*>\s*'
            matches = re.findall(pattern, conteudo)
            if len(matches) > 1:
                # Manter apenas a primeira ocorrência
                conteudo = re.sub(pattern, '', conteudo)
                # Adicionar uma única referência limpa
                head_pattern = r'(<title>[^<]*</title>)'
                replacement = rf'\1\n    <link rel="stylesheet" href="{css_ref}">'
                conteudo = re.sub(head_pattern, replacement, conteudo, count=1)
        
        # Salvar arquivo corrigido
        with open(arquivo_html, 'w', encoding='utf-8') as f:
            f.write(conteudo)
        
        print(f"✅ CSS corrigido em: {arquivo_html}")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao processar {arquivo_html}: {e}")
        return False

def main():
    """Função principal"""
    print("🎨 Corrigindo referências CSS nas páginas HTML...")
    print()
    
    # Lista de arquivos HTML para processar
    arquivos_html = [
        'alunos.html',
        'professores.html',
        'turmas.html',
        'notas.html',
        'presenca.html',
        'calendario.html',
        'relatorios.html',
        'usuarios.html'
    ]
    
    sucessos = 0
    total = len(arquivos_html)
    
    for arquivo in arquivos_html:
        if corrigir_referencias_css(arquivo):
            sucessos += 1
    
    print()
    print(f"📊 Resultado: {sucessos}/{total} arquivos corrigidos")
    
    if sucessos == total:
        print("🎉 Todas as referências CSS foram corrigidas!")
        print("💡 Agora as fontes devem aparecer corretamente!")
    else:
        print("⚠️  Alguns arquivos podem precisar de ajuste manual")

if __name__ == "__main__":
    main()