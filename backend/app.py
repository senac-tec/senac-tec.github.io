from flask import Flask, jsonify, request
from flask_cors import CORS
from functools import wraps
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Definição de permissões por cargo - GRANULAR
PERMISSIONS = {
    'admin': ['all'],  # Acesso total
    'diretor': ['all'],  # Acesso total
    
    'coordenador': [
        'view_dashboard',
        'view_alunos', 'create_alunos', 'edit_alunos', 'delete_alunos',
        'view_professores',
        'view_turmas', 'create_turmas', 'edit_turmas', 'delete_turmas',
        'view_notas', 'create_notas', 'edit_notas', 'delete_notas',
        'view_frequencia', 'create_frequencia', 'edit_frequencia', 'delete_frequencia',
        'view_eventos', 'create_eventos', 'edit_eventos', 'delete_eventos',
        'view_relatorios',
        'view_matriculas', 'create_matriculas', 'edit_matriculas', 'delete_matriculas'
    ],
    
    'professor': [
        'view_dashboard',
        'view_alunos',  # Apenas de suas turmas
        'view_turmas',  # Apenas suas turmas
        'view_notas', 'create_notas', 'edit_notas',  # Apenas de suas turmas
        'view_frequencia', 'create_frequencia', 'edit_frequencia',  # Apenas de suas turmas
        'view_eventos'
    ],
    
    'secretaria': [
        'view_dashboard',
        'view_alunos', 'create_alunos', 'edit_alunos',  # SEM delete
        'view_professores',
        'view_turmas',
        'view_matriculas', 'create_matriculas', 'edit_matriculas', 'delete_matriculas'
    ]
}

# Decorator para verificar autenticação
def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = request.headers.get('X-User-Id')
        user_cargo = request.headers.get('X-User-Cargo')
        
        if not user_id or not user_cargo:
            return jsonify({'error': 'Autenticação necessária'}), 401
        
        # Adicionar informações do usuário ao request
        request.user_id = user_id
        request.user_cargo = user_cargo
        
        return f(*args, **kwargs)
    return decorated_function

# Decorator para verificar permissões
def require_permission(permission):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_cargo = request.headers.get('X-User-Cargo')
            
            if not user_cargo:
                return jsonify({'error': 'Autenticação necessária'}), 401
            
            # Admin e diretor têm acesso total
            if user_cargo in ['admin', 'diretor']:
                return f(*args, **kwargs)
            
            # Verificar se o cargo tem a permissão necessária
            user_permissions = PERMISSIONS.get(user_cargo, [])
            if permission not in user_permissions:
                return jsonify({'error': 'Acesso negado. Você não tem permissão para esta ação.'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

DATABASE = 'escola.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    # Só remove o banco se não existir ou se for explicitamente solicitado
    # Para preservar dados existentes
    conn = get_db()
    cursor = conn.cursor()
    
    # Verificar se as tabelas já existem
    tables_exist = cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='alunos'"
    ).fetchone()
    
    if tables_exist:
        print("📊 Banco de dados já existe. Mantendo dados existentes.")
        conn.close()
        return
    
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
    
    print("📊 Criando banco de dados inicial...")
    
    # Inserir apenas dados mínimos necessários para funcionamento
    # Usuário administrador padrão
    cursor.execute(
        'INSERT INTO usuarios (nome, email, cpf, telefone, cargo, senha, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ('Administrador', 'admin@escola.com', '000.000.000-00', '(61) 99999-0000', 'admin', 'admin123', 'ativo')
    )
    
    print("✅ Banco de dados criado! Pronto para receber dados dinâmicos.")
    
    conn.commit()
    conn.close()

# Estatísticas do Dashboard
@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db()
    cursor = conn.cursor()
    
    total_alunos = cursor.execute('SELECT COUNT(*) FROM alunos WHERE status = "ativo"').fetchone()[0]
    total_professores = cursor.execute('SELECT COUNT(*) FROM professores WHERE status = "ativo"').fetchone()[0]
    total_turmas = cursor.execute('SELECT COUNT(*) FROM turmas WHERE status = "ativa"').fetchone()[0]
    
    # Calcular taxa de aprovação real baseada nas notas
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

# Atividades recentes
@app.route('/api/atividades', methods=['GET'])
def get_atividades():
    conn = get_db()
    cursor = conn.cursor()
    
    # Buscar atividades reais do banco
    atividades = []
    
    # Últimas matrículas
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
    
    # Últimas notas lançadas
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
    
    conn.close()
    return jsonify(atividades[:5])  # Limitar a 5 atividades

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
@require_auth
@require_permission('create_alunos')
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
@require_auth
@require_permission('edit_alunos')
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
@require_auth
@require_permission('delete_alunos')
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

@app.route('/api/professores/<int:id>', methods=['GET'])
def get_professor(id):
    conn = get_db()
    cursor = conn.cursor()
    professor = cursor.execute('SELECT * FROM professores WHERE id = ?', (id,)).fetchone()
    conn.close()
    
    if professor:
        return jsonify(dict(professor))
    return jsonify({'error': 'Professor não encontrado'}), 404

@app.route('/api/professores', methods=['POST'])
@require_auth
@require_permission('create_professores')
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

@app.route('/api/professores/<int:id>', methods=['PUT'])
@require_auth
@require_permission('edit_professores')
def update_professor(id):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'UPDATE professores SET nome = ?, email = ?, cpf = ?, telefone = ?, especializacao = ?, status = ? WHERE id = ?',
            (data['nome'], data['email'], data['cpf'], data.get('telefone', ''),
             data.get('especializacao', ''), data.get('status', 'ativo'), id)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Professor atualizado com sucesso'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/professores/<int:id>', methods=['DELETE'])
@require_auth
@require_permission('delete_professores')
def delete_professor(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM professores WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Professor excluído com sucesso'})

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

@app.route('/api/turmas/<int:id>', methods=['GET'])
def get_turma(id):
    conn = get_db()
    cursor = conn.cursor()
    turma = cursor.execute(
        '''SELECT t.*, p.nome as professor_nome 
           FROM turmas t 
           LEFT JOIN professores p ON t.professor_id = p.id 
           WHERE t.id = ?''', 
        (id,)
    ).fetchone()
    conn.close()
    
    if turma:
        return jsonify(dict(turma))
    return jsonify({'error': 'Turma não encontrada'}), 404

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

@app.route('/api/turmas/<int:id>', methods=['PUT'])
def update_turma(id):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'UPDATE turmas SET nome = ?, ano = ?, turno = ?, sala = ?, capacidade = ?, professor_id = ?, status = ? WHERE id = ?',
            (data['nome'], data['ano'], data['turno'], data.get('sala', ''),
             data.get('capacidade', 30), data.get('professor_id'), data.get('status', 'ativa'), id)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Turma atualizada com sucesso'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/turmas/<int:id>', methods=['DELETE'])
def delete_turma(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM turmas WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Turma excluída com sucesso'})

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

@app.route('/api/matriculas/<int:id>', methods=['PUT'])
def update_matricula(id):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'UPDATE matriculas SET aluno_id = ?, turma_id = ?, status = ? WHERE id = ?',
            (data['aluno_id'], data['turma_id'], data.get('status', 'ativa'), id)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Matrícula atualizada com sucesso'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/matriculas/<int:id>', methods=['DELETE'])
def delete_matricula(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM matriculas WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Matrícula excluída com sucesso'})

# CRUD Frequência
@app.route('/api/frequencia', methods=['GET'])
def get_frequencia():
    conn = get_db()
    cursor = conn.cursor()
    
    turma_id = request.args.get('turma_id')
    data = request.args.get('data')
    mes = request.args.get('mes')
    ano = request.args.get('ano')
    
    query = '''
        SELECT f.*, m.aluno_id, a.nome as aluno_nome, t.nome as turma_nome, t.id as turma_id
        FROM frequencia f 
        JOIN matriculas m ON f.matricula_id = m.id 
        JOIN alunos a ON m.aluno_id = a.id 
        JOIN turmas t ON m.turma_id = t.id 
        WHERE 1=1
    '''
    params = []
    
    if turma_id:
        query += ' AND t.id = ?'
        params.append(turma_id)
    
    if data:
        query += ' AND f.data = ?'
        params.append(data)
    
    if mes and ano:
        query += ' AND strftime("%m", f.data) = ? AND strftime("%Y", f.data) = ?'
        params.extend([f'{int(mes):02d}', ano])
    
    query += ' ORDER BY a.nome, f.data'
    
    frequencias = cursor.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(freq) for freq in frequencias])

@app.route('/api/frequencia/turma/<int:turma_id>/data/<data>', methods=['GET'])
def get_frequencia_turma_data(turma_id, data):
    conn = get_db()
    cursor = conn.cursor()
    
    # Buscar todos os alunos da turma
    alunos = cursor.execute(
        '''SELECT m.id as matricula_id, a.id as aluno_id, a.nome as aluno_nome
           FROM matriculas m 
           JOIN alunos a ON m.aluno_id = a.id 
           WHERE m.turma_id = ? AND m.status = "ativa"
           ORDER BY a.nome''',
        (turma_id,)
    ).fetchall()
    
    # Buscar frequências existentes para a data
    frequencias = cursor.execute(
        '''SELECT f.matricula_id, f.presente
           FROM frequencia f 
           JOIN matriculas m ON f.matricula_id = m.id
           WHERE m.turma_id = ? AND f.data = ?''',
        (turma_id, data)
    ).fetchall()
    
    # Criar dicionário de frequências
    freq_dict = {f['matricula_id']: f['presente'] for f in frequencias}
    
    # Montar resultado
    resultado = []
    for aluno in alunos:
        resultado.append({
            'matricula_id': aluno['matricula_id'],
            'aluno_id': aluno['aluno_id'],
            'aluno_nome': aluno['aluno_nome'],
            'presente': freq_dict.get(aluno['matricula_id'], 1)  # Default: presente
        })
    
    conn.close()
    return jsonify(resultado)

@app.route('/api/frequencia', methods=['POST'])
def create_frequencia():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO frequencia (matricula_id, data, presente) VALUES (?, ?, ?)',
            (data['matricula_id'], data['data'], data.get('presente', 1))
        )
        conn.commit()
        freq_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': freq_id, 'message': 'Frequência registrada com sucesso'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/frequencia/lote', methods=['POST'])
def save_frequencia_lote():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        turma_id = data['turma_id']
        data_aula = data['data']
        frequencias = data['frequencias']
        
        # Remover frequências existentes para a data/turma
        cursor.execute(
            '''DELETE FROM frequencia 
               WHERE matricula_id IN (
                   SELECT m.id FROM matriculas m WHERE m.turma_id = ?
               ) AND data = ?''',
            (turma_id, data_aula)
        )
        
        # Inserir novas frequências
        for freq in frequencias:
            cursor.execute(
                'INSERT INTO frequencia (matricula_id, data, presente) VALUES (?, ?, ?)',
                (freq['matricula_id'], data_aula, freq['presente'])
            )
        
        conn.commit()
        conn.close()
        return jsonify({'message': 'Frequências salvas com sucesso'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/frequencia/<int:id>', methods=['PUT'])
def update_frequencia(id):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'UPDATE frequencia SET matricula_id = ?, data = ?, presente = ? WHERE id = ?',
            (data['matricula_id'], data['data'], data.get('presente', 1), id)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Frequência atualizada com sucesso'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/frequencia/<int:id>', methods=['DELETE'])
def delete_frequencia(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM frequencia WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Frequência excluída com sucesso'})

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
    
    eventos = cursor.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(evento) for evento in eventos])

@app.route('/api/eventos/<int:id>', methods=['GET'])
def get_evento(id):
    conn = get_db()
    cursor = conn.cursor()
    evento = cursor.execute(
        '''SELECT e.*, t.nome as turma_nome, p.nome as professor_nome 
           FROM eventos e 
           LEFT JOIN turmas t ON e.turma_id = t.id 
           LEFT JOIN professores p ON e.professor_id = p.id 
           WHERE e.id = ?''', 
        (id,)
    ).fetchone()
    conn.close()
    
    if evento:
        return jsonify(dict(evento))
    return jsonify({'error': 'Evento não encontrado'}), 404

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

@app.route('/api/eventos/<int:id>', methods=['PUT'])
def update_evento(id):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            '''UPDATE eventos SET titulo = ?, descricao = ?, data_inicio = ?, data_fim = ?, 
               hora_inicio = ?, hora_fim = ?, tipo = ?, turma_id = ?, professor_id = ?, cor = ?, status = ? 
               WHERE id = ?''',
            (data['titulo'], data.get('descricao', ''), data['data_inicio'], data.get('data_fim'),
             data.get('hora_inicio'), data.get('hora_fim'), data.get('tipo', 'evento'),
             data.get('turma_id'), data.get('professor_id'), data.get('cor', '#3498db'), 
             data.get('status', 'ativo'), id)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Evento atualizado com sucesso'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/eventos/<int:id>', methods=['DELETE'])
def delete_evento(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM eventos WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Evento excluído com sucesso'})

# Eventos próximos para o dashboard
@app.route('/api/eventos/proximos', methods=['GET'])
def get_eventos_proximos():
    conn = get_db()
    cursor = conn.cursor()
    
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

# CRUD Notas
@app.route('/api/notas', methods=['GET'])
def get_notas():
    conn = get_db()
    cursor = conn.cursor()
    
    # Parâmetros de filtro
    turma_id = request.args.get('turma_id')
    disciplina = request.args.get('disciplina')
    bimestre = request.args.get('bimestre')
    aluno_id = request.args.get('aluno_id')
    
    query = '''
        SELECT n.*, m.aluno_id, a.nome as aluno_nome, t.nome as turma_nome, t.id as turma_id
        FROM notas n 
        JOIN matriculas m ON n.matricula_id = m.id 
        JOIN alunos a ON m.aluno_id = a.id 
        JOIN turmas t ON m.turma_id = t.id 
        WHERE 1=1
    '''
    params = []
    
    if turma_id:
        query += ' AND t.id = ?'
        params.append(turma_id)
    
    if disciplina:
        query += ' AND n.disciplina = ?'
        params.append(disciplina)
    
    if bimestre:
        query += ' AND n.bimestre = ?'
        params.append(bimestre)
    
    if aluno_id:
        query += ' AND a.id = ?'
        params.append(aluno_id)
    
    query += ' ORDER BY a.nome, n.disciplina, n.bimestre'
    
    notas = cursor.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(nota) for nota in notas])

@app.route('/api/notas/<int:id>', methods=['GET'])
def get_nota(id):
    conn = get_db()
    cursor = conn.cursor()
    nota = cursor.execute(
        '''SELECT n.*, m.aluno_id, a.nome as aluno_nome, t.nome as turma_nome 
           FROM notas n 
           JOIN matriculas m ON n.matricula_id = m.id 
           JOIN alunos a ON m.aluno_id = a.id 
           JOIN turmas t ON m.turma_id = t.id 
           WHERE n.id = ?''', 
        (id,)
    ).fetchone()
    conn.close()
    
    if nota:
        return jsonify(dict(nota))
    return jsonify({'error': 'Nota não encontrada'}), 404

@app.route('/api/notas', methods=['POST'])
def create_nota():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Verificar se já existe nota para esta matrícula/disciplina/bimestre
        existing = cursor.execute(
            'SELECT id FROM notas WHERE matricula_id = ? AND disciplina = ? AND bimestre = ?',
            (data['matricula_id'], data['disciplina'], data['bimestre'])
        ).fetchone()
        
        if existing:
            conn.close()
            return jsonify({'error': 'Já existe nota para esta disciplina e bimestre'}), 400
        
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

@app.route('/api/notas/<int:id>', methods=['PUT'])
def update_nota(id):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'UPDATE notas SET matricula_id = ?, disciplina = ?, nota = ?, bimestre = ? WHERE id = ?',
            (data['matricula_id'], data['disciplina'], data['nota'], data['bimestre'], id)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Nota atualizada com sucesso'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/notas/<int:id>', methods=['DELETE'])
def delete_nota(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM notas WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Nota excluída com sucesso'})

# Relatórios de notas
@app.route('/api/notas/relatorio', methods=['GET'])
def get_relatorio_notas():
    conn = get_db()
    cursor = conn.cursor()
    
    turma_id = request.args.get('turma_id')
    bimestre = request.args.get('bimestre')
    
    query = '''
        SELECT 
            a.nome as aluno_nome,
            t.nome as turma_nome,
            n.disciplina,
            n.nota,
            n.bimestre,
            CASE 
                WHEN n.nota >= 7 THEN 'Aprovado'
                WHEN n.nota >= 5 THEN 'Recuperação'
                ELSE 'Reprovado'
            END as status
        FROM notas n 
        JOIN matriculas m ON n.matricula_id = m.id 
        JOIN alunos a ON m.aluno_id = a.id 
        JOIN turmas t ON m.turma_id = t.id 
        WHERE 1=1
    '''
    params = []
    
    if turma_id:
        query += ' AND t.id = ?'
        params.append(turma_id)
    
    if bimestre:
        query += ' AND n.bimestre = ?'
        params.append(bimestre)
    
    query += ' ORDER BY t.nome, a.nome, n.disciplina'
    
    relatorio = cursor.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(item) for item in relatorio])

# Boletim do aluno
@app.route('/api/alunos/<int:aluno_id>/boletim', methods=['GET'])
def get_boletim_aluno(aluno_id):
    conn = get_db()
    cursor = conn.cursor()
    
    # Dados do aluno
    aluno = cursor.execute('SELECT * FROM alunos WHERE id = ?', (aluno_id,)).fetchone()
    if not aluno:
        conn.close()
        return jsonify({'error': 'Aluno não encontrado'}), 404
    
    # Notas do aluno
    notas = cursor.execute(
        '''SELECT n.*, t.nome as turma_nome
           FROM notas n 
           JOIN matriculas m ON n.matricula_id = m.id 
           JOIN turmas t ON m.turma_id = t.id
           WHERE m.aluno_id = ?
           ORDER BY n.disciplina, n.bimestre''',
        (aluno_id,)
    ).fetchall()
    
    conn.close()
    
    return jsonify({
        'aluno': dict(aluno),
        'notas': [dict(nota) for nota in notas]
    })

# Relatórios e Analytics
@app.route('/api/relatorios/estatisticas', methods=['GET'])
def get_estatisticas_relatorios():
    conn = get_db()
    cursor = conn.cursor()
    
    # Estatísticas gerais
    total_alunos = cursor.execute('SELECT COUNT(*) FROM alunos WHERE status = "ativo"').fetchone()[0]
    total_professores = cursor.execute('SELECT COUNT(*) FROM professores WHERE status = "ativo"').fetchone()[0]
    total_turmas = cursor.execute('SELECT COUNT(*) FROM turmas WHERE status = "ativa"').fetchone()[0]
    
    # Estatísticas de notas
    notas_stats = cursor.execute(
        '''SELECT 
            COUNT(*) as total_notas,
            AVG(nota) as media_geral,
            COUNT(CASE WHEN nota >= 7 THEN 1 END) as aprovados,
            COUNT(CASE WHEN nota >= 5 AND nota < 7 THEN 1 END) as recuperacao,
            COUNT(CASE WHEN nota < 5 THEN 1 END) as reprovados
           FROM notas'''
    ).fetchone()
    
    # Estatísticas de frequência
    freq_stats = cursor.execute(
        '''SELECT 
            COUNT(*) as total_registros,
            COUNT(CASE WHEN presente = 1 THEN 1 END) as presencas,
            ROUND(AVG(CASE WHEN presente = 1 THEN 100.0 ELSE 0.0 END), 1) as taxa_presenca
           FROM frequencia'''
    ).fetchone()
    
    conn.close()
    
    return jsonify({
        'geral': {
            'total_alunos': total_alunos,
            'total_professores': total_professores,
            'total_turmas': total_turmas
        },
        'notas': {
            'total_notas': notas_stats['total_notas'],
            'media_geral': round(notas_stats['media_geral'] or 0, 1),
            'aprovados': notas_stats['aprovados'],
            'recuperacao': notas_stats['recuperacao'],
            'reprovados': notas_stats['reprovados']
        },
        'frequencia': {
            'total_registros': freq_stats['total_registros'],
            'presencas': freq_stats['presencas'],
            'taxa_presenca': freq_stats['taxa_presenca'] or 0
        }
    })

@app.route('/api/relatorios/desempenho-disciplinas', methods=['GET'])
def get_desempenho_disciplinas():
    conn = get_db()
    cursor = conn.cursor()
    
    disciplinas_stats = cursor.execute(
        '''SELECT 
            disciplina,
            COUNT(*) as total_notas,
            AVG(nota) as media,
            COUNT(CASE WHEN nota >= 7 THEN 1 END) as aprovados,
            COUNT(CASE WHEN nota >= 5 AND nota < 7 THEN 1 END) as recuperacao,
            COUNT(CASE WHEN nota < 5 THEN 1 END) as reprovados
           FROM notas 
           GROUP BY disciplina
           ORDER BY media DESC'''
    ).fetchall()
    
    conn.close()
    
    return jsonify([{
        'disciplina': row['disciplina'],
        'total_notas': row['total_notas'],
        'media': round(row['media'], 1),
        'aprovados': row['aprovados'],
        'recuperacao': row['recuperacao'],
        'reprovados': row['reprovados']
    } for row in disciplinas_stats])

@app.route('/api/relatorios/evolucao-bimestres', methods=['GET'])
def get_evolucao_bimestres():
    conn = get_db()
    cursor = conn.cursor()
    
    evolucao = cursor.execute(
        '''SELECT 
            bimestre,
            disciplina,
            AVG(nota) as media
           FROM notas 
           GROUP BY bimestre, disciplina
           ORDER BY bimestre, disciplina'''
    ).fetchall()
    
    conn.close()
    
    # Organizar dados por bimestre
    resultado = {}
    for row in evolucao:
        bimestre = row['bimestre']
        if bimestre not in resultado:
            resultado[bimestre] = {}
        resultado[bimestre][row['disciplina']] = round(row['media'], 1)
    
    return jsonify(resultado)

@app.route('/api/relatorios/ranking-alunos', methods=['GET'])
def get_ranking_alunos():
    conn = get_db()
    cursor = conn.cursor()
    
    tipo = request.args.get('tipo', 'melhores')  # 'melhores' ou 'risco'
    limite = int(request.args.get('limite', 10))
    
    if tipo == 'melhores':
        ordem = 'DESC'
        condicao = ''
    else:
        ordem = 'ASC'
        condicao = 'HAVING media < 5'
    
    ranking = cursor.execute(f'''
        SELECT 
            a.nome as aluno_nome,
            t.nome as turma_nome,
            AVG(n.nota) as media,
            COUNT(n.id) as total_notas
        FROM notas n
        JOIN matriculas m ON n.matricula_id = m.id
        JOIN alunos a ON m.aluno_id = a.id
        JOIN turmas t ON m.turma_id = t.id
        GROUP BY a.id, a.nome, t.nome
        {condicao}
        ORDER BY media {ordem}
        LIMIT ?
    ''', (limite,)).fetchall()
    
    conn.close()
    
    return jsonify([{
        'aluno_nome': row['aluno_nome'],
        'turma_nome': row['turma_nome'],
        'media': round(row['media'], 1),
        'total_notas': row['total_notas']
    } for row in ranking])

@app.route('/api/relatorios/desempenho-turmas', methods=['GET'])
def get_desempenho_turmas():
    conn = get_db()
    cursor = conn.cursor()
    
    turmas_stats = cursor.execute(
        '''SELECT 
            t.nome as turma_nome,
            COUNT(DISTINCT m.aluno_id) as total_alunos,
            AVG(n.nota) as media,
            COUNT(CASE WHEN n.nota >= 7 THEN 1 END) as aprovados,
            COUNT(CASE WHEN n.nota >= 5 AND n.nota < 7 THEN 1 END) as recuperacao,
            COUNT(CASE WHEN n.nota < 5 THEN 1 END) as reprovados
           FROM turmas t
           JOIN matriculas m ON t.id = m.turma_id
           LEFT JOIN notas n ON m.id = n.matricula_id
           WHERE t.status = "ativa"
           GROUP BY t.id, t.nome
           ORDER BY media DESC'''
    ).fetchall()
    
    conn.close()
    
    return jsonify([{
        'turma_nome': row['turma_nome'],
        'total_alunos': row['total_alunos'],
        'media': round(row['media'] or 0, 1),
        'aprovados': row['aprovados'],
        'recuperacao': row['recuperacao'],
        'reprovados': row['reprovados']
    } for row in turmas_stats])

@app.route('/api/relatorios/frequencia-turmas', methods=['GET'])
def get_frequencia_turmas():
    conn = get_db()
    cursor = conn.cursor()
    
    frequencia_turmas = cursor.execute(
        '''SELECT 
            t.nome as turma_nome,
            COUNT(f.id) as total_registros,
            COUNT(CASE WHEN f.presente = 1 THEN 1 END) as presencas,
            ROUND(AVG(CASE WHEN f.presente = 1 THEN 100.0 ELSE 0.0 END), 1) as taxa_presenca
           FROM turmas t
           JOIN matriculas m ON t.id = m.turma_id
           LEFT JOIN frequencia f ON m.id = f.matricula_id
           WHERE t.status = "ativa"
           GROUP BY t.id, t.nome
           ORDER BY taxa_presenca DESC'''
    ).fetchall()
    
    conn.close()
    
    return jsonify([{
        'turma_nome': row['turma_nome'],
        'total_registros': row['total_registros'],
        'presencas': row['presencas'],
        'taxa_presenca': row['taxa_presenca'] or 0
    } for row in frequencia_turmas])

# CRUD Usuários (APENAS ADMIN)
@app.route('/api/usuarios', methods=['GET'])
@require_auth
@require_permission('all')
def get_usuarios():
    conn = get_db()
    cursor = conn.cursor()
    
    search = request.args.get('search', '')
    
    if search:
        usuarios = cursor.execute(
            'SELECT id, nome, email, cpf, telefone, cargo, status, created_at FROM usuarios WHERE nome LIKE ? OR email LIKE ? OR cargo LIKE ? ORDER BY nome',
            (f'%{search}%', f'%{search}%', f'%{search}%')
        ).fetchall()
    else:
        usuarios = cursor.execute('SELECT id, nome, email, cpf, telefone, cargo, status, created_at FROM usuarios ORDER BY nome').fetchall()
    
    conn.close()
    return jsonify([dict(usuario) for usuario in usuarios])

@app.route('/api/usuarios/<int:id>', methods=['GET'])
def get_usuario(id):
    conn = get_db()
    cursor = conn.cursor()
    usuario = cursor.execute('SELECT id, nome, email, cpf, telefone, cargo, status, created_at FROM usuarios WHERE id = ?', (id,)).fetchone()
    conn.close()
    
    if usuario:
        return jsonify(dict(usuario))
    return jsonify({'error': 'Usuário não encontrado'}), 404

@app.route('/api/usuarios', methods=['POST'])
@require_auth
@require_permission('all')
def create_usuario():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Verificar se email já existe
        existing = cursor.execute('SELECT id, cargo FROM usuarios WHERE email = ?', (data['email'],)).fetchone()
        if existing:
            conn.close()
            return jsonify({'error': f'E-mail já cadastrado para um usuário com cargo: {existing["cargo"]}'}), 400
        
        # Verificar se CPF já existe
        existing_cpf = cursor.execute('SELECT id, cargo FROM usuarios WHERE cpf = ?', (data['cpf'],)).fetchone()
        if existing_cpf:
            conn.close()
            return jsonify({'error': f'CPF já cadastrado para um usuário com cargo: {existing_cpf["cargo"]}'}), 400
        
        cursor.execute(
            'INSERT INTO usuarios (nome, email, cpf, telefone, cargo, senha, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (data['nome'], data['email'], data['cpf'], data.get('telefone', ''),
             data['cargo'], data['senha'], data.get('status', 'ativo'))
        )
        conn.commit()
        usuario_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': usuario_id, 'message': 'Usuário criado com sucesso'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/usuarios/<int:id>', methods=['PUT'])
@require_auth
@require_permission('all')
def update_usuario(id):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Verificar se email já existe em outro usuário
        existing = cursor.execute('SELECT id FROM usuarios WHERE email = ? AND id != ?', (data['email'], id)).fetchone()
        if existing:
            conn.close()
            return jsonify({'error': 'E-mail já cadastrado para outro usuário'}), 400
        
        cursor.execute(
            'UPDATE usuarios SET nome = ?, email = ?, cpf = ?, telefone = ?, cargo = ?, status = ? WHERE id = ?',
            (data['nome'], data['email'], data['cpf'], data.get('telefone', ''),
             data['cargo'], data.get('status', 'ativo'), id)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Usuário atualizado com sucesso'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/usuarios/<int:id>', methods=['DELETE'])
@require_auth
@require_permission('all')
def delete_usuario(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM usuarios WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Usuário excluído com sucesso'})

# Autenticação
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    senha = data.get('password')
    
    if not email or not senha:
        return jsonify({'error': 'E-mail e senha são obrigatórios'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Buscar usuário por email
    usuario = cursor.execute(
        'SELECT id, nome, email, cargo, senha, status FROM usuarios WHERE email = ?',
        (email,)
    ).fetchone()
    
    if not usuario:
        conn.close()
        return jsonify({'error': 'E-mail ou senha incorretos'}), 401
    
    # Verificar senha (em produção usar hash)
    if usuario['senha'] != senha:
        conn.close()
        return jsonify({'error': 'E-mail ou senha incorretos'}), 401
    
    # Verificar se usuário está ativo
    if usuario['status'] != 'ativo':
        conn.close()
        return jsonify({'error': 'Usuário inativo. Entre em contato com o administrador.'}), 401
    
    # Verificar se o tipo de acesso selecionado corresponde ao cargo do usuário
    # (Opcional - pode ser removido se quiser permitir qualquer acesso)
    # userType = sessionStorage.getItem('userType') no frontend
    # Se userType == 'admin' mas cargo != 'admin' ou 'diretor', bloquear
    
    # Atualizar último login
    cursor.execute('UPDATE usuarios SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (usuario['id'],))
    conn.commit()
    conn.close()
    
    # Retornar dados do usuário (sem senha)
    return jsonify({
        'id': usuario['id'],
        'nome': usuario['nome'],
        'email': usuario['email'],
        'cargo': usuario['cargo'],
        'message': 'Login realizado com sucesso'
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    
    # Validações básicas
    required_fields = ['nome', 'email', 'cpf', 'cargo', 'senha']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'Campo {field} é obrigatório'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Verificar se email já existe (em qualquer cargo)
        existing = cursor.execute('SELECT id, nome, cargo FROM usuarios WHERE email = ?', (data['email'],)).fetchone()
        if existing:
            conn.close()
            return jsonify({'error': f'Este e-mail já está cadastrado no sistema como {existing["cargo"]}. Cada pessoa pode ter apenas uma conta.'}), 400
        
        # Verificar se CPF já existe (em qualquer cargo)
        existing_cpf = cursor.execute('SELECT id, nome, cargo FROM usuarios WHERE cpf = ?', (data['cpf'],)).fetchone()
        if existing_cpf:
            conn.close()
            return jsonify({'error': f'Este CPF já está cadastrado no sistema como {existing_cpf["cargo"]}. Cada pessoa pode ter apenas uma conta.'}), 400
        
        # Criar usuário
        cursor.execute(
            'INSERT INTO usuarios (nome, email, cpf, telefone, cargo, senha, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (data['nome'], data['email'], data['cpf'], data.get('telefone', ''),
             data['cargo'], data['senha'], 'ativo')
        )
        conn.commit()
        usuario_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'id': usuario_id,
            'message': 'Usuário cadastrado com sucesso'
        }), 201
        
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

# Endpoint para resetar banco (apenas para desenvolvimento)
@app.route('/api/admin/reset-db', methods=['POST'])
def reset_database():
    """Reset completo do banco de dados - CUIDADO!"""
    try:
        if os.path.exists(DATABASE):
            os.remove(DATABASE)
        init_db()
        return jsonify({'message': 'Banco de dados resetado com sucesso!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint para popular com dados de exemplo
@app.route('/api/admin/populate-sample', methods=['POST'])
def populate_sample_data():
    """Popula o banco com dados de exemplo"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Verificar se já existem dados
        count_alunos = cursor.execute('SELECT COUNT(*) FROM alunos').fetchone()[0]
        if count_alunos > 0:
            conn.close()
            return jsonify({'message': 'Banco já possui dados. Use reset primeiro se necessário.'}), 400
        
        # Executar script de inicialização com dados
        conn.close()
        os.system('python inicializar-banco.py')
        
        return jsonify({'message': 'Dados de exemplo inseridos com sucesso!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint para alterar senha
@app.route('/api/usuarios/<int:id>/change-password', methods=['POST'])
def change_password(id):
    data = request.json
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Senha atual e nova senha são obrigatórias'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Buscar usuário
    usuario = cursor.execute('SELECT * FROM usuarios WHERE id = ?', (id,)).fetchone()
    if not usuario:
        conn.close()
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    # Verificar senha atual (em produção usar hash)
    if usuario['senha'] != current_password:
        conn.close()
        return jsonify({'error': 'Senha atual incorreta'}), 400
    
    # Atualizar senha
    cursor.execute('UPDATE usuarios SET senha = ? WHERE id = ?', (new_password, id))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Senha alterada com sucesso'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)

# Rotas de Relatórios
@app.route('/api/relatorios/estatisticas', methods=['GET'])
def relatorios_estatisticas():
    conn = get_db()
    cursor = conn.cursor()
    
    # Estatísticas básicas
    total_alunos = cursor.execute('SELECT COUNT(*) FROM alunos WHERE status = "ativo"').fetchone()[0]
    total_notas = cursor.execute('SELECT COUNT(*) FROM notas').fetchone()[0]
    media_geral = cursor.execute('SELECT AVG(nota) FROM notas').fetchone()[0] or 0
    
    conn.close()
    
    return jsonify({
        'total_alunos': total_alunos,
        'total_notas': total_notas,
        'media_geral': round(media_geral, 1)
    })