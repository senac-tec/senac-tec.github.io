#!/usr/bin/env python3
"""
Sistema de Gestão Escolar Integrado
Servidor único que combina API Flask + Servidor de arquivos estáticos
"""

import os
import sys
import time
import threading
import webbrowser
from pathlib import Path
import subprocess
from http.server import HTTPServer, SimpleHTTPRequestHandler
import socketserver

# Importar Flask e dependências
try:
    from flask import Flask, jsonify, request, send_from_directory
    from flask_cors import CORS
    from functools import wraps
    import sqlite3
    from datetime import datetime
except ImportError:
    print("📦 Instalando dependências...")
    subprocess.run([sys.executable, "-m", "pip", "install", "Flask", "Flask-CORS"])
    from flask import Flask, jsonify, request, send_from_directory
    from flask_cors import CORS
    from functools import wraps
    import sqlite3
    from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configurações
DATABASE = 'escola.db'
STATIC_PORT = 8000
API_PORT = 5000

# ============ CONFIGURAÇÃO DO BANCO DE DADOS ============

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inicializa o banco de dados se não existir"""
    if os.path.exists(DATABASE):
        print("📊 Banco de dados já existe. Mantendo dados existentes.")
        return
    
    print("📊 Criando banco de dados inicial...")
    conn = get_db()
    cursor = conn.cursor()
    
    # Criar tabelas
    cursor.execute('''
        CREATE TABLE alunos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            cpf TEXT UNIQUE NOT NULL,
            data_nascimento TEXT NOT NULL,
            telefone TEXT,
            endereco TEXT,
            status TEXT DEFAULT 'ativo',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE professores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            cpf TEXT UNIQUE NOT NULL,
            telefone TEXT,
            especializacao TEXT,
            status TEXT DEFAULT 'ativo',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE turmas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            ano TEXT NOT NULL,
            turno TEXT NOT NULL,
            sala TEXT,
            capacidade INTEGER,
            professor_id INTEGER,
            status TEXT DEFAULT 'ativa',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (professor_id) REFERENCES professores(id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE matriculas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aluno_id INTEGER NOT NULL,
            turma_id INTEGER NOT NULL,
            data_matricula TEXT DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'ativa',
            FOREIGN KEY (aluno_id) REFERENCES alunos(id),
            FOREIGN KEY (turma_id) REFERENCES turmas(id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE notas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            matricula_id INTEGER NOT NULL,
            disciplina TEXT NOT NULL,
            nota REAL NOT NULL,
            bimestre INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (matricula_id) REFERENCES matriculas(id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE frequencia (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            matricula_id INTEGER NOT NULL,
            data TEXT NOT NULL,
            presente INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (matricula_id) REFERENCES matriculas(id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE eventos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT,
            data_inicio TEXT NOT NULL,
            data_fim TEXT,
            hora_inicio TEXT,
            hora_fim TEXT,
            tipo TEXT DEFAULT 'evento',
            turma_id INTEGER,
            professor_id INTEGER,
            cor TEXT DEFAULT '#3498db',
            status TEXT DEFAULT 'ativo',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (turma_id) REFERENCES turmas(id),
            FOREIGN KEY (professor_id) REFERENCES professores(id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            cpf TEXT UNIQUE NOT NULL,
            telefone TEXT,
            cargo TEXT NOT NULL,
            senha TEXT NOT NULL,
            status TEXT DEFAULT 'ativo',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_login TEXT,
            reset_token TEXT,
            reset_expires TEXT
        )
    ''')
    
    # Inserir usuário administrador padrão
    cursor.execute(
        'INSERT INTO usuarios (nome, email, cpf, telefone, cargo, senha, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ('Administrador', 'admin@escola.com', '000.000.000-00', '(61) 99999-0000', 'admin', 'admin123', 'ativo')
    )
    
    print("✅ Banco de dados criado com sucesso!")
    conn.commit()
    conn.close()

# ============ ROTAS DA API ============

# Estatísticas do Dashboard
@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db()
    cursor = conn.cursor()
    
    total_alunos = cursor.execute('SELECT COUNT(*) FROM alunos WHERE status = "ativo"').fetchone()[0]
    total_professores = cursor.execute('SELECT COUNT(*) FROM professores WHERE status = "ativo"').fetchone()[0]
    total_turmas = cursor.execute('SELECT COUNT(*) FROM turmas WHERE status = "ativa"').fetchone()[0]
    
    # Calcular taxa de aprovação
    aprovacao_result = cursor.execute(
        'SELECT COUNT(CASE WHEN nota >= 7 THEN 1 END) * 100.0 / COUNT(*) FROM notas'
    ).fetchone()
    taxa_aprovacao = round(aprovacao_result[0] if aprovacao_result[0] else 0, 1)
    
    conn.close()
    
    return jsonify({
        'total_alunos': total_alunos,
        'total_professores': total_professores,
        'total_turmas': total_turmas,
        'taxa_aprovacao': taxa_aprovacao
    })

# CRUD Alunos
@app.route('/api/alunos', methods=['GET'])
def get_alunos():
    conn = get_db()
    cursor = conn.cursor()
    
    search = request.args.get('search', '')
    
    if search:
        alunos = cursor.execute(
            'SELECT * FROM alunos WHERE nome LIKE ? OR email LIKE ? OR cpf LIKE ? ORDER BY nome',
            (f'%{search}%', f'%{search}%', f'%{search}%')
        ).fetchall()
    else:
        alunos = cursor.execute('SELECT * FROM alunos ORDER BY nome').fetchall()
    
    conn.close()
    return jsonify([dict(aluno) for aluno in alunos])

@app.route('/api/alunos/<int:id>', methods=['GET'])
def get_aluno(id):
    conn = get_db()
    cursor = conn.cursor()
    aluno = cursor.execute('SELECT * FROM alunos WHERE id = ?', (id,)).fetchone()
    conn.close()
    
    if aluno:
        return jsonify(dict(aluno))
    return jsonify({'error': 'Aluno não encontrado'}), 404

@app.route('/api/alunos', methods=['POST'])
def create_aluno():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO alunos (nome, email, cpf, data_nascimento, telefone, endereco, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (data['nome'], data['email'], data['cpf'], data['data_nascimento'], 
             data.get('telefone', ''), data.get('endereco', ''), data.get('status', 'ativo'))
        )
        conn.commit()
        aluno_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': aluno_id, 'message': 'Aluno criado com sucesso'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/alunos/<int:id>', methods=['PUT'])
def update_aluno(id):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'UPDATE alunos SET nome = ?, email = ?, cpf = ?, data_nascimento = ?, telefone = ?, endereco = ?, status = ? WHERE id = ?',
            (data['nome'], data['email'], data['cpf'], data['data_nascimento'],
             data.get('telefone', ''), data.get('endereco', ''), data.get('status', 'ativo'), id)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Aluno atualizado com sucesso'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/alunos/<int:id>', methods=['DELETE'])
def delete_aluno(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM alunos WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Aluno excluído com sucesso'})

# CRUD Professores
@app.route('/api/professores', methods=['GET'])
def get_professores():
    conn = get_db()
    cursor = conn.cursor()
    
    search = request.args.get('search', '')
    
    if search:
        professores = cursor.execute(
            'SELECT * FROM professores WHERE nome LIKE ? OR email LIKE ? OR cpf LIKE ? OR especializacao LIKE ? ORDER BY nome',
            (f'%{search}%', f'%{search}%', f'%{search}%', f'%{search}%')
        ).fetchall()
    else:
        professores = cursor.execute('SELECT * FROM professores ORDER BY nome').fetchall()
    
    conn.close()
    return jsonify([dict(professor) for professor in professores])

@app.route('/api/professores', methods=['POST'])
def create_professor():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO professores (nome, email, cpf, telefone, especializacao, status) VALUES (?, ?, ?, ?, ?, ?)',
            (data['nome'], data['email'], data['cpf'], data.get('telefone', ''),
             data.get('especializacao', ''), data.get('status', 'ativo'))
        )
        conn.commit()
        professor_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': professor_id, 'message': 'Professor criado com sucesso'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

# CRUD Turmas
@app.route('/api/turmas', methods=['GET'])
def get_turmas():
    conn = get_db()
    cursor = conn.cursor()
    
    search = request.args.get('search', '')
    
    if search:
        turmas = cursor.execute(
            '''SELECT t.*, p.nome as professor_nome 
               FROM turmas t 
               LEFT JOIN professores p ON t.professor_id = p.id 
               WHERE t.nome LIKE ? OR t.ano LIKE ? OR t.turno LIKE ? 
               ORDER BY t.nome''',
            (f'%{search}%', f'%{search}%', f'%{search}%')
        ).fetchall()
    else:
        turmas = cursor.execute(
            '''SELECT t.*, p.nome as professor_nome 
               FROM turmas t 
               LEFT JOIN professores p ON t.professor_id = p.id 
               ORDER BY t.nome'''
        ).fetchall()
    
    conn.close()
    return jsonify([dict(turma) for turma in turmas])

@app.route('/api/turmas', methods=['POST'])
def create_turma():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO turmas (nome, ano, turno, sala, capacidade, professor_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (data['nome'], data['ano'], data['turno'], data.get('sala', ''),
             data.get('capacidade', 30), data.get('professor_id'), data.get('status', 'ativa'))
        )
        conn.commit()
        turma_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': turma_id, 'message': 'Turma criada com sucesso'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

# CRUD Matrículas
@app.route('/api/matriculas', methods=['GET'])
def get_matriculas():
    conn = get_db()
    cursor = conn.cursor()
    
    matriculas = cursor.execute(
        '''SELECT m.*, a.nome as aluno_nome, t.nome as turma_nome 
           FROM matriculas m 
           JOIN alunos a ON m.aluno_id = a.id 
           JOIN turmas t ON m.turma_id = t.id 
           ORDER BY m.data_matricula DESC'''
    ).fetchall()
    
    conn.close()
    return jsonify([dict(matricula) for matricula in matriculas])

@app.route('/api/matriculas', methods=['POST'])
def create_matricula():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO matriculas (aluno_id, turma_id, status) VALUES (?, ?, ?)',
            (data['aluno_id'], data['turma_id'], data.get('status', 'ativa'))
        )
        conn.commit()
        matricula_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': matricula_id, 'message': 'Matrícula criada com sucesso'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

# Atividades recentes para o dashboard
@app.route('/api/atividades', methods=['GET'])
def get_atividades():
    conn = get_db()
    cursor = conn.cursor()
    
    atividades = []
    
    # Últimas matrículas
    try:
        matriculas_recentes = cursor.execute(
            '''SELECT a.nome, t.nome as turma_nome, m.data_matricula
               FROM matriculas m
               JOIN alunos a ON m.aluno_id = a.id
               JOIN turmas t ON m.turma_id = t.id
               ORDER BY m.data_matricula DESC
               LIMIT 3'''
        ).fetchall()
        
        for matricula in matriculas_recentes:
            atividades.append({
                'tipo': 'matricula',
                'descricao': 'Novo aluno matriculado',
                'detalhes': f'{matricula[0]} - {matricula[1]}',
                'tempo': 'Recente'
            })
    except:
        pass
    
    # Últimas notas lançadas
    try:
        notas_recentes = cursor.execute(
            '''SELECT a.nome, n.disciplina, n.created_at
               FROM notas n
               JOIN matriculas m ON n.matricula_id = m.id
               JOIN alunos a ON m.aluno_id = a.id
               ORDER BY n.created_at DESC
               LIMIT 2'''
        ).fetchall()
        
        for nota in notas_recentes:
            atividades.append({
                'tipo': 'nota',
                'descricao': 'Notas lançadas',
                'detalhes': f'{nota[1]} - {nota[0]}',
                'tempo': 'Recente'
            })
    except:
        pass
    
    # Se não há atividades, retornar algumas padrão
    if not atividades:
        atividades = [
            {
                'tipo': 'sistema',
                'descricao': 'Sistema iniciado',
                'detalhes': 'Banco de dados criado com sucesso',
                'tempo': 'Agora'
            },
            {
                'tipo': 'info',
                'descricao': 'Pronto para uso',
                'detalhes': 'Comece cadastrando alunos e professores',
                'tempo': 'Agora'
            }
        ]
    
    conn.close()
    return jsonify(atividades[:5])

# CRUD Eventos
@app.route('/api/eventos', methods=['GET'])
def get_eventos():
    conn = get_db()
    cursor = conn.cursor()
    
    # Parâmetros de filtro
    mes = request.args.get('mes')
    ano = request.args.get('ano')
    tipo = request.args.get('tipo')
    
    query = '''
        SELECT e.*, t.nome as turma_nome, p.nome as professor_nome 
        FROM eventos e 
        LEFT JOIN turmas t ON e.turma_id = t.id 
        LEFT JOIN professores p ON e.professor_id = p.id 
        WHERE e.status = "ativo"
    '''
    params = []
    
    if mes and ano:
        query += ' AND strftime("%m", e.data_inicio) = ? AND strftime("%Y", e.data_inicio) = ?'
        params.extend([f'{int(mes):02d}', ano])
    
    if tipo:
        query += ' AND e.tipo = ?'
        params.append(tipo)
    
    query += ' ORDER BY e.data_inicio, e.hora_inicio'
    
    try:
        eventos = cursor.execute(query, params).fetchall()
        conn.close()
        return jsonify([dict(evento) for evento in eventos])
    except:
        conn.close()
        return jsonify([])

@app.route('/api/eventos/proximos', methods=['GET'])
def get_eventos_proximos():
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        eventos = cursor.execute(
            '''SELECT e.*, t.nome as turma_nome, p.nome as professor_nome 
               FROM eventos e 
               LEFT JOIN turmas t ON e.turma_id = t.id 
               LEFT JOIN professores p ON e.professor_id = p.id 
               WHERE e.status = "ativo" AND date(e.data_inicio) >= date('now')
               ORDER BY e.data_inicio, e.hora_inicio 
               LIMIT 5'''
        ).fetchall()
        
        conn.close()
        return jsonify([dict(evento) for evento in eventos])
    except:
        conn.close()
        return jsonify([])

@app.route('/api/eventos', methods=['POST'])
def create_evento():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            '''INSERT INTO eventos (titulo, descricao, data_inicio, data_fim, hora_inicio, hora_fim, tipo, turma_id, professor_id, cor, status) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (data['titulo'], data.get('descricao', ''), data['data_inicio'], data.get('data_fim'), 
             data.get('hora_inicio'), data.get('hora_fim'), data.get('tipo', 'evento'),
             data.get('turma_id'), data.get('professor_id'), data.get('cor', '#3498db'), data.get('status', 'ativo'))
        )
        conn.commit()
        evento_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': evento_id, 'message': 'Evento criado com sucesso'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

# CRUD Notas
@app.route('/api/notas', methods=['GET'])
def get_notas():
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        notas = cursor.execute(
            '''SELECT n.*, m.aluno_id, a.nome as aluno_nome, t.nome as turma_nome, t.id as turma_id
               FROM notas n 
               JOIN matriculas m ON n.matricula_id = m.id 
               JOIN alunos a ON m.aluno_id = a.id 
               JOIN turmas t ON m.turma_id = t.id 
               ORDER BY a.nome, n.disciplina, n.bimestre'''
        ).fetchall()
        
        conn.close()
        return jsonify([dict(nota) for nota in notas])
    except:
        conn.close()
        return jsonify([])

@app.route('/api/notas', methods=['POST'])
def create_nota():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO notas (matricula_id, disciplina, nota, bimestre) VALUES (?, ?, ?, ?)',
            (data['matricula_id'], data['disciplina'], data['nota'], data['bimestre'])
        )
        conn.commit()
        nota_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': nota_id, 'message': 'Nota criada com sucesso'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

# Autenticação básica
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    senha = data.get('password')
    
    if not email or not senha:
        return jsonify({'error': 'E-mail e senha são obrigatórios'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Buscar usuário por email
        usuario = cursor.execute(
            'SELECT id, nome, email, cargo, senha, status FROM usuarios WHERE email = ?',
            (email,)
        ).fetchone()
        
        if not usuario or usuario['senha'] != senha or usuario['status'] != 'ativo':
            conn.close()
            return jsonify({'error': 'E-mail ou senha incorretos'}), 401
        
        conn.close()
        return jsonify({
            'id': usuario['id'],
            'nome': usuario['nome'],
            'email': usuario['email'],
            'cargo': usuario['cargo'],
            'message': 'Login realizado com sucesso'
        })
    except:
        conn.close()
        return jsonify({'error': 'Erro interno do servidor'}), 500

# Servir arquivos estáticos
@app.route('/')
def index():
    return send_from_directory('.', 'selecao-tipo.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# ============ SERVIDOR INTEGRADO ============

class QuietHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Handler HTTP que não imprime logs desnecessários"""
    def log_message(self, format, *args):
        pass  # Silenciar logs do servidor de arquivos

def start_static_server():
    """Inicia servidor de arquivos estáticos em thread separada"""
    try:
        with socketserver.TCPServer(("", STATIC_PORT), QuietHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except Exception as e:
        print(f"⚠️  Erro no servidor estático: {e}")

def main():
    print("🎓 Iniciando Sistema de Gestão Escolar Integrado...")
    
    # Inicializar banco de dados
    init_db()
    
    print("🚀 Iniciando servidores integrados...")
    
    # Iniciar servidor de arquivos estáticos em thread separada
    static_thread = threading.Thread(target=start_static_server, daemon=True)
    static_thread.start()
    
    # Aguardar um pouco para os servidores iniciarem
    time.sleep(2)
    
    # Abrir navegador
    print("🌍 Abrindo navegador...")
    webbrowser.open(f"http://localhost:{STATIC_PORT}/selecao-tipo.html")
    
    print("✅ Sistema iniciado com sucesso!")
    print(f"   🌐 Site: http://localhost:{STATIC_PORT}")
    print(f"   🔧 API:  http://localhost:{API_PORT}")
    print("\n💡 Dicas:")
    print("   • O banco de dados salva automaticamente")
    print("   • Todos os dados ficam no arquivo 'escola.db'")
    print("   • Para parar o sistema, pressione Ctrl+C")
    print("\n⚠️  Pressione Ctrl+C para parar o sistema")
    
    try:
        # Iniciar servidor Flask (API)
        app.run(debug=False, port=API_PORT, host='0.0.0.0')
    except KeyboardInterrupt:
        print("\n🛑 Parando sistema...")
        print("✅ Sistema parado com sucesso!")

if __name__ == "__main__":
    main()