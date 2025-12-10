-- Insert sample teachers
INSERT INTO teachers (name, email, cpf, phone, specialization, hire_date, status) VALUES
('Maria Silva', 'maria.silva@escola.com', '123.456.789-01', '(61) 98765-4321', 'Matemática', '2020-01-15', 'active'),
('João Santos', 'joao.santos@escola.com', '234.567.890-12', '(61) 98765-4322', 'Português', '2019-03-20', 'active'),
('Ana Costa', 'ana.costa@escola.com', '345.678.901-23', '(61) 98765-4323', 'História', '2021-02-10', 'active'),
('Pedro Oliveira', 'pedro.oliveira@escola.com', '456.789.012-34', '(61) 98765-4324', 'Ciências', '2018-08-05', 'active'),
('Carla Souza', 'carla.souza@escola.com', '567.890.123-45', '(61) 98765-4325', 'Geografia', '2020-06-12', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample classes
INSERT INTO classes (name, grade, shift, teacher_id, capacity, year, status)
SELECT 
  '9º Ano A', '9º Ano', 'morning', t.id, 30, 2025, 'active'
FROM teachers t WHERE t.email = 'maria.silva@escola.com'
ON CONFLICT DO NOTHING;

INSERT INTO classes (name, grade, shift, teacher_id, capacity, year, status)
SELECT 
  '8º Ano B', '8º Ano', 'afternoon', t.id, 30, 2025, 'active'
FROM teachers t WHERE t.email = 'joao.santos@escola.com'
ON CONFLICT DO NOTHING;

INSERT INTO classes (name, grade, shift, teacher_id, capacity, year, status)
SELECT 
  '1º Ano C - Manhã', '1º Ano', 'morning', t.id, 25, 2025, 'active'
FROM teachers t WHERE t.email = 'ana.costa@escola.com'
ON CONFLICT DO NOTHING;

-- Insert sample students
INSERT INTO students (name, email, cpf, birth_date, phone, address, enrollment_date, status) VALUES
('João Silva', 'joao.silva@email.com', '111.222.333-44', '2010-05-15', '(61) 91234-5678', 'QNN 14 Conjunto A Casa 10, Ceilândia', '2024-01-10', 'active'),
('Maria Santos', 'maria.santos@email.com', '222.333.444-55', '2011-08-20', '(61) 91234-5679', 'QNM 36 Conjunto E Casa 5, Ceilândia', '2024-01-10', 'active'),
('Pedro Costa', 'pedro.costa@email.com', '333.444.555-66', '2010-03-12', '(61) 91234-5680', 'QNO 15 Conjunto B Casa 8, Ceilândia', '2024-01-10', 'active'),
('Ana Oliveira', 'ana.oliveira@email.com', '444.555.666-77', '2011-11-25', '(61) 91234-5681', 'QNP 28 Conjunto D Casa 12, Ceilândia', '2024-01-10', 'active'),
('Lucas Pereira', 'lucas.pereira@email.com', '555.666.777-88', '2010-07-08', '(61) 91234-5682', 'EQNM 18/20 Casa 15, Ceilândia', '2024-01-10', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample enrollments
INSERT INTO enrollments (student_id, class_id, enrollment_date, status, attendance_rate)
SELECT s.id, c.id, '2025-01-15', 'active', 95.5
FROM students s, classes c
WHERE s.email = 'joao.silva@email.com' AND c.name = '9º Ano A'
ON CONFLICT (student_id, class_id) DO NOTHING;

INSERT INTO enrollments (student_id, class_id, enrollment_date, status, attendance_rate)
SELECT s.id, c.id, '2025-01-15', 'active', 92.0
FROM students s, classes c
WHERE s.email = 'maria.santos@email.com' AND c.name = '8º Ano B'
ON CONFLICT (student_id, class_id) DO NOTHING;

INSERT INTO enrollments (student_id, class_id, enrollment_date, status, attendance_rate)
SELECT s.id, c.id, '2025-01-15', 'active', 98.5
FROM students s, classes c
WHERE s.email = 'pedro.costa@email.com' AND c.name = '9º Ano A'
ON CONFLICT (student_id, class_id) DO NOTHING;
