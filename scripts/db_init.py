import sqlite3
import os

# Create database connection
db_path = os.path.join(os.path.dirname(__file__), '..', 'gestao_escolar.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create alunos (students) table
cursor.execute('''
CREATE TABLE IF NOT EXISTS alunos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    idade INTEGER NOT NULL,
    email TEXT,
    telefone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

# Create professores (teachers) table
cursor.execute('''
CREATE TABLE IF NOT EXISTS professores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    disciplina TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

# Create turmas (classes) table
cursor.execute('''
CREATE TABLE IF NOT EXISTS turmas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    professor_id INTEGER,
    ano TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES professores(id)
)
''')

# Create matriculas (enrollments) table
cursor.execute('''
CREATE TABLE IF NOT EXISTS matriculas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    turma_id INTEGER NOT NULL,
    data_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'ativo',
    FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    FOREIGN KEY (turma_id) REFERENCES turmas(id)
)
''')

# Insert sample data for alunos
sample_alunos = [
    ('João Silva', 15, 'joao@email.com', '(61) 99999-1111'),
    ('Maria Santos', 16, 'maria@email.com', '(61) 99999-2222'),
    ('Pedro Oliveira', 14, 'pedro@email.com', '(61) 99999-3333'),
    ('Ana Costa', 15, 'ana@email.com', '(61) 99999-4444'),
]

cursor.executemany('''
INSERT INTO alunos (nome, idade, email, telefone) VALUES (?, ?, ?, ?)
''', sample_alunos)

# Insert sample data for professores
sample_professores = [
    ('Prof. Carlos Mendes', 'Matemática', 'carlos@escola.com', '(61) 98888-1111'),
    ('Prof. Juliana Lima', 'Português', 'juliana@escola.com', '(61) 98888-2222'),
    ('Prof. Roberto Alves', 'História', 'roberto@escola.com', '(61) 98888-3333'),
]

cursor.executemany('''
INSERT INTO professores (nome, disciplina, email, telefone) VALUES (?, ?, ?, ?)
''', sample_professores)

# Insert sample data for turmas
sample_turmas = [
    ('9º Ano A', 1, '2025'),
    ('9º Ano B', 2, '2025'),
    ('1º Ano C', 3, '2025'),
]

cursor.executemany('''
INSERT INTO turmas (nome, professor_id, ano) VALUES (?, ?, ?)
''', sample_turmas)

# Insert sample data for matriculas
sample_matriculas = [
    (1, 1, 'ativo'),
    (2, 1, 'ativo'),
    (3, 2, 'ativo'),
    (4, 3, 'ativo'),
]

cursor.executemany('''
INSERT INTO matriculas (aluno_id, turma_id, status) VALUES (?, ?, ?)
''', sample_matriculas)

conn.commit()
conn.close()

print("Database initialized successfully!")
print(f"Database created at: {db_path}")
