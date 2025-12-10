from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'gestao_escolar.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ============ ALUNOS (STUDENTS) ROUTES ============

@app.route('/api/alunos', methods=['GET'])
def get_alunos():
    conn = get_db_connection()
    alunos = conn.execute('SELECT * FROM alunos ORDER BY nome').fetchall()
    conn.close()
    return jsonify([dict(aluno) for aluno in alunos])

@app.route('/api/alunos/<int:id>', methods=['GET'])
def get_aluno(id):
    conn = get_db_connection()
    aluno = conn.execute('SELECT * FROM alunos WHERE id = ?', (id,)).fetchone()
    conn.close()
    if aluno is None:
        return jsonify({'error': 'Aluno não encontrado'}), 404
    return jsonify(dict(aluno))

@app.route('/api/alunos', methods=['POST'])
def create_aluno():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO alunos (nome, idade, email, telefone)
        VALUES (?, ?, ?, ?)
    ''', (data['nome'], data['idade'], data.get('email'), data.get('telefone')))
    conn.commit()
    aluno_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': aluno_id, 'message': 'Aluno criado com sucesso'}), 201

@app.route('/api/alunos/<int:id>', methods=['PUT'])
def update_aluno(id):
    data = request.json
    conn = get_db_connection()
    conn.execute('''
        UPDATE alunos
        SET nome = ?, idade = ?, email = ?, telefone = ?
        WHERE id = ?
    ''', (data['nome'], data['idade'], data.get('email'), data.get('telefone'), id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Aluno atualizado com sucesso'})

@app.route('/api/alunos/<int:id>', methods=['DELETE'])
def delete_aluno(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM alunos WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Aluno excluído com sucesso'})

# ============ PROFESSORES (TEACHERS) ROUTES ============

@app.route('/api/professores', methods=['GET'])
def get_professores():
    conn = get_db_connection()
    professores = conn.execute('SELECT * FROM professores ORDER BY nome').fetchall()
    conn.close()
    return jsonify([dict(professor) for professor in professores])

@app.route('/api/professores/<int:id>', methods=['GET'])
def get_professor(id):
    conn = get_db_connection()
    professor = conn.execute('SELECT * FROM professores WHERE id = ?', (id,)).fetchone()
    conn.close()
    if professor is None:
        return jsonify({'error': 'Professor não encontrado'}), 404
    return jsonify(dict(professor))

@app.route('/api/professores', methods=['POST'])
def create_professor():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO professores (nome, disciplina, email, telefone)
        VALUES (?, ?, ?, ?)
    ''', (data['nome'], data['disciplina'], data.get('email'), data.get('telefone')))
    conn.commit()
    professor_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': professor_id, 'message': 'Professor criado com sucesso'}), 201

@app.route('/api/professores/<int:id>', methods=['PUT'])
def update_professor(id):
    data = request.json
    conn = get_db_connection()
    conn.execute('''
        UPDATE professores
        SET nome = ?, disciplina = ?, email = ?, telefone = ?
        WHERE id = ?
    ''', (data['nome'], data['disciplina'], data.get('email'), data.get('telefone'), id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Professor atualizado com sucesso'})

@app.route('/api/professores/<int:id>', methods=['DELETE'])
def delete_professor(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM professores WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Professor excluído com sucesso'})

# ============ TURMAS (CLASSES) ROUTES ============

@app.route('/api/turmas', methods=['GET'])
def get_turmas():
    conn = get_db_connection()
    turmas = conn.execute('''
        SELECT t.*, p.nome as professor_nome
        FROM turmas t
        LEFT JOIN professores p ON t.professor_id = p.id
        ORDER BY t.nome
    ''').fetchall()
    conn.close()
    return jsonify([dict(turma) for turma in turmas])

@app.route('/api/turmas/<int:id>', methods=['GET'])
def get_turma(id):
    conn = get_db_connection()
    turma = conn.execute('''
        SELECT t.*, p.nome as professor_nome
        FROM turmas t
        LEFT JOIN professores p ON t.professor_id = p.id
        WHERE t.id = ?
    ''', (id,)).fetchone()
    conn.close()
    if turma is None:
        return jsonify({'error': 'Turma não encontrada'}), 404
    return jsonify(dict(turma))

@app.route('/api/turmas', methods=['POST'])
def create_turma():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO turmas (nome, professor_id, ano)
        VALUES (?, ?, ?)
    ''', (data['nome'], data.get('professor_id'), data.get('ano')))
    conn.commit()
    turma_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': turma_id, 'message': 'Turma criada com sucesso'}), 201

@app.route('/api/turmas/<int:id>', methods=['PUT'])
def update_turma(id):
    data = request.json
    conn = get_db_connection()
    conn.execute('''
        UPDATE turmas
        SET nome = ?, professor_id = ?, ano = ?
        WHERE id = ?
    ''', (data['nome'], data.get('professor_id'), data.get('ano'), id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Turma atualizada com sucesso'})

@app.route('/api/turmas/<int:id>', methods=['DELETE'])
def delete_turma(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM turmas WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Turma excluída com sucesso'})

# ============ MATRICULAS (ENROLLMENTS) ROUTES ============

@app.route('/api/matriculas', methods=['GET'])
def get_matriculas():
    conn = get_db_connection()
    matriculas = conn.execute('''
        SELECT m.*, a.nome as aluno_nome, t.nome as turma_nome
        FROM matriculas m
        JOIN alunos a ON m.aluno_id = a.id
        JOIN turmas t ON m.turma_id = t.id
        ORDER BY m.data_matricula DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(matricula) for matricula in matriculas])

@app.route('/api/matriculas/<int:id>', methods=['GET'])
def get_matricula(id):
    conn = get_db_connection()
    matricula = conn.execute('''
        SELECT m.*, a.nome as aluno_nome, t.nome as turma_nome
        FROM matriculas m
        JOIN alunos a ON m.aluno_id = a.id
        JOIN turmas t ON m.turma_id = t.id
        WHERE m.id = ?
    ''', (id,)).fetchone()
    conn.close()
    if matricula is None:
        return jsonify({'error': 'Matrícula não encontrada'}), 404
    return jsonify(dict(matricula))

@app.route('/api/matriculas', methods=['POST'])
def create_matricula():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO matriculas (aluno_id, turma_id, status)
        VALUES (?, ?, ?)
    ''', (data['aluno_id'], data['turma_id'], data.get('status', 'ativo')))
    conn.commit()
    matricula_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': matricula_id, 'message': 'Matrícula criada com sucesso'}), 201

@app.route('/api/matriculas/<int:id>', methods=['PUT'])
def update_matricula(id):
    data = request.json
    conn = get_db_connection()
    conn.execute('''
        UPDATE matriculas
        SET aluno_id = ?, turma_id = ?, status = ?
        WHERE id = ?
    ''', (data['aluno_id'], data['turma_id'], data.get('status', 'ativo'), id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Matrícula atualizada com sucesso'})

@app.route('/api/matriculas/<int:id>', methods=['DELETE'])
def delete_matricula(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM matriculas WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Matrícula excluída com sucesso'})

# ============ DASHBOARD STATS ============

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()
    
    total_alunos = conn.execute('SELECT COUNT(*) as count FROM alunos').fetchone()['count']
    total_professores = conn.execute('SELECT COUNT(*) as count FROM professores').fetchone()['count']
    total_turmas = conn.execute('SELECT COUNT(*) as count FROM turmas').fetchone()['count']
    total_matriculas = conn.execute('SELECT COUNT(*) as count FROM matriculas WHERE status = "ativo"').fetchone()['count']
    
    conn.close()
    
    return jsonify({
        'total_alunos': total_alunos,
        'total_professores': total_professores,
        'total_turmas': total_turmas,
        'total_matriculas': total_matriculas
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
