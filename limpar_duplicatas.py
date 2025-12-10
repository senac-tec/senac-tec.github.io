#!/usr/bin/env python3
"""
Script para limpar usuários duplicados no banco de dados
Mantém apenas a conta mais recente de cada email/CPF
"""

import sqlite3
from datetime import datetime

DATABASE = 'escola.db'

def limpar_duplicatas():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("🔍 Verificando duplicatas no banco de dados...\n")
    
    # Encontrar emails duplicados
    emails_duplicados = cursor.execute('''
        SELECT email, COUNT(*) as total, GROUP_CONCAT(id) as ids, GROUP_CONCAT(cargo) as cargos
        FROM usuarios 
        GROUP BY email 
        HAVING COUNT(*) > 1
    ''').fetchall()
    
    # Encontrar CPFs duplicados
    cpfs_duplicados = cursor.execute('''
        SELECT cpf, COUNT(*) as total, GROUP_CONCAT(id) as ids, GROUP_CONCAT(cargo) as cargos
        FROM usuarios 
        GROUP BY cpf 
        HAVING COUNT(*) > 1
    ''').fetchall()
    
    if not emails_duplicados and not cpfs_duplicados:
        print("✅ Nenhuma duplicata encontrada! Banco de dados está limpo.")
        conn.close()
        return
    
    print("⚠️  DUPLICATAS ENCONTRADAS:\n")
    
    # Mostrar emails duplicados
    if emails_duplicados:
        print("📧 E-mails duplicados:")
        for row in emails_duplicados:
            print(f"   Email: {row['email']}")
            print(f"   Total: {row['total']} contas")
            print(f"   IDs: {row['ids']}")
            print(f"   Cargos: {row['cargos']}")
            print()
    
    # Mostrar CPFs duplicados
    if cpfs_duplicados:
        print("🆔 CPFs duplicados:")
        for row in cpfs_duplicados:
            print(f"   CPF: {row['cpf']}")
            print(f"   Total: {row['total']} contas")
            print(f"   IDs: {row['ids']}")
            print(f"   Cargos: {row['cargos']}")
            print()
    
    # Perguntar se deseja limpar
    resposta = input("❓ Deseja limpar as duplicatas? (s/n): ").lower()
    
    if resposta != 's':
        print("❌ Operação cancelada.")
        conn.close()
        return
    
    print("\n🧹 Limpando duplicatas...\n")
    
    removidos = 0
    
    # Limpar emails duplicados
    for row in emails_duplicados:
        ids = [int(id) for id in row['ids'].split(',')]
        
        # Buscar detalhes de cada conta
        contas = []
        for id in ids:
            conta = cursor.execute('SELECT * FROM usuarios WHERE id = ?', (id,)).fetchone()
            contas.append(dict(conta))
        
        # Ordenar por data de criação (mais recente primeiro)
        contas.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        # Manter a mais recente
        manter = contas[0]
        remover = contas[1:]
        
        print(f"📧 Email: {row['email']}")
        print(f"   ✅ Mantendo: ID {manter['id']} - {manter['cargo']} (criado em {manter.get('created_at', 'N/A')})")
        
        # Remover as outras
        for conta in remover:
            cursor.execute('DELETE FROM usuarios WHERE id = ?', (conta['id'],))
            print(f"   ❌ Removendo: ID {conta['id']} - {conta['cargo']}")
            removidos += 1
        
        print()
    
    # Limpar CPFs duplicados (que não foram pegos por email)
    for row in cpfs_duplicados:
        ids = [int(id) for id in row['ids'].split(',')]
        
        # Verificar se ainda existem (podem ter sido removidos na limpeza de email)
        ids_existentes = []
        for id in ids:
            existe = cursor.execute('SELECT id FROM usuarios WHERE id = ?', (id,)).fetchone()
            if existe:
                ids_existentes.append(id)
        
        if len(ids_existentes) <= 1:
            continue  # Já foi limpo
        
        # Buscar detalhes de cada conta
        contas = []
        for id in ids_existentes:
            conta = cursor.execute('SELECT * FROM usuarios WHERE id = ?', (id,)).fetchone()
            contas.append(dict(conta))
        
        # Ordenar por data de criação (mais recente primeiro)
        contas.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        # Manter a mais recente
        manter = contas[0]
        remover = contas[1:]
        
        print(f"🆔 CPF: {row['cpf']}")
        print(f"   ✅ Mantendo: ID {manter['id']} - {manter['cargo']}")
        
        # Remover as outras
        for conta in remover:
            cursor.execute('DELETE FROM usuarios WHERE id = ?', (conta['id'],))
            print(f"   ❌ Removendo: ID {conta['id']} - {conta['cargo']}")
            removidos += 1
        
        print()
    
    # Salvar mudanças
    conn.commit()
    conn.close()
    
    print(f"\n✅ Limpeza concluída!")
    print(f"📊 Total de contas removidas: {removidos}")
    print(f"💾 Banco de dados atualizado com sucesso!")
    print(f"\n⚠️  IMPORTANTE: Agora cada pessoa tem apenas UMA conta no sistema.")

def verificar_banco():
    """Apenas verificar sem fazer alterações"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("🔍 Verificando banco de dados...\n")
    
    # Total de usuários
    total = cursor.execute('SELECT COUNT(*) as total FROM usuarios').fetchone()['total']
    print(f"👥 Total de usuários: {total}")
    
    # Usuários por cargo
    cargos = cursor.execute('''
        SELECT cargo, COUNT(*) as total 
        FROM usuarios 
        GROUP BY cargo 
        ORDER BY total DESC
    ''').fetchall()
    
    print("\n📊 Usuários por cargo:")
    for row in cargos:
        print(f"   {row['cargo']}: {row['total']}")
    
    # Verificar duplicatas
    emails_dup = cursor.execute('''
        SELECT COUNT(*) as total 
        FROM (
            SELECT email 
            FROM usuarios 
            GROUP BY email 
            HAVING COUNT(*) > 1
        )
    ''').fetchone()['total']
    
    cpfs_dup = cursor.execute('''
        SELECT COUNT(*) as total 
        FROM (
            SELECT cpf 
            FROM usuarios 
            GROUP BY cpf 
            HAVING COUNT(*) > 1
        )
    ''').fetchone()['total']
    
    print(f"\n⚠️  E-mails duplicados: {emails_dup}")
    print(f"⚠️  CPFs duplicados: {cpfs_dup}")
    
    if emails_dup > 0 or cpfs_dup > 0:
        print("\n❌ Há duplicatas no banco de dados!")
        print("💡 Execute: python limpar_duplicatas.py --limpar")
    else:
        print("\n✅ Banco de dados está limpo!")
    
    conn.close()

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--limpar':
        limpar_duplicatas()
    else:
        verificar_banco()
        print("\n💡 Para limpar duplicatas, execute:")
        print("   python limpar_duplicatas.py --limpar")
