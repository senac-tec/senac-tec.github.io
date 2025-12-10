/**
 * Sistema de Banco de Dados Local
 * Substitui as chamadas de API por localStorage
 */

class LocalDatabase {
    constructor() {
        this.initializeData();
    }

    // Inicializar dados padrão se não existirem
    initializeData() {
        if (!localStorage.getItem('escola_initialized')) {
            // Dados iniciais
            const dadosIniciais = {
                alunos: [
                    {
                        id: 1,
                        nome: "Ana Silva",
                        email: "ana.silva@email.com",
                        cpf: "123.456.789-01",
                        data_nascimento: "2010-05-15",
                        telefone: "(61) 99999-1111",
                        endereco: "Rua das Flores, 123",
                        status: "ativo",
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 2,
                        nome: "João Santos",
                        email: "joao.santos@email.com",
                        cpf: "987.654.321-09",
                        data_nascimento: "2009-08-22",
                        telefone: "(61) 99999-2222",
                        endereco: "Av. Central, 456",
                        status: "ativo",
                        created_at: new Date().toISOString()
                    }
                ],
                professores: [
                    {
                        id: 1,
                        nome: "Prof. Maria Oliveira",
                        email: "maria.oliveira@escola.com",
                        cpf: "111.222.333-44",
                        telefone: "(61) 99999-3333",
                        especializacao: "Matemática",
                        status: "ativo",
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 2,
                        nome: "Prof. Carlos Lima",
                        email: "carlos.lima@escola.com",
                        cpf: "555.666.777-88",
                        telefone: "(61) 99999-4444",
                        especializacao: "Português",
                        status: "ativo",
                        created_at: new Date().toISOString()
                    }
                ],
                turmas: [
                    {
                        id: 1,
                        nome: "5º Ano A",
                        ano: "5º Ano",
                        turno: "Matutino",
                        sala: "Sala 101",
                        capacidade: 30,
                        professor_id: 1,
                        status: "ativa",
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 2,
                        nome: "4º Ano B",
                        ano: "4º Ano",
                        turno: "Vespertino",
                        sala: "Sala 102",
                        capacidade: 25,
                        professor_id: 2,
                        status: "ativa",
                        created_at: new Date().toISOString()
                    }
                ],
                matriculas: [
                    {
                        id: 1,
                        aluno_id: 1,
                        turma_id: 1,
                        data_matricula: new Date().toISOString(),
                        status: "ativa"
                    },
                    {
                        id: 2,
                        aluno_id: 2,
                        turma_id: 2,
                        data_matricula: new Date().toISOString(),
                        status: "ativa"
                    }
                ],
                notas: [
                    {
                        id: 1,
                        matricula_id: 1,
                        disciplina: "Matemática",
                        nota: 8.5,
                        bimestre: 1,
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 2,
                        matricula_id: 1,
                        disciplina: "Português",
                        nota: 9.0,
                        bimestre: 1,
                        created_at: new Date().toISOString()
                    }
                ],
                frequencia: [
                    {
                        id: 1,
                        matricula_id: 1,
                        data: new Date().toISOString().split('T')[0],
                        presente: 1,
                        created_at: new Date().toISOString()
                    }
                ],
                eventos: [
                    {
                        id: 1,
                        titulo: "Reunião de Pais",
                        descricao: "Reunião bimestral com os pais",
                        data_inicio: "2024-12-15",
                        data_fim: "2024-12-15",
                        hora_inicio: "19:00",
                        hora_fim: "21:00",
                        tipo: "reuniao",
                        turma_id: null,
                        professor_id: null,
                        cor: "#3498db",
                        status: "ativo",
                        created_at: new Date().toISOString()
                    }
                ],
                usuarios: [
                    {
                        id: 1,
                        nome: "Administrador",
                        email: "admin@escola.com",
                        cpf: "000.000.000-00",
                        telefone: "(61) 99999-0000",
                        cargo: "admin",
                        senha: "admin123",
                        status: "ativo",
                        created_at: new Date().toISOString()
                    }
                ]
            };

            // Salvar dados iniciais
            Object.keys(dadosIniciais).forEach(key => {
                localStorage.setItem(`escola_${key}`, JSON.stringify(dadosIniciais[key]));
            });

            localStorage.setItem('escola_initialized', 'true');
            console.log('📊 Banco de dados local inicializado com dados de exemplo');
        }
    }

    // Métodos genéricos para CRUD
    getAll(table) {
        const data = localStorage.getItem(`escola_${table}`);
        return data ? JSON.parse(data) : [];
    }

    getById(table, id) {
        const items = this.getAll(table);
        return items.find(item => item.id == id);
    }

    create(table, data) {
        const items = this.getAll(table);
        const newId = Math.max(...items.map(item => item.id || 0), 0) + 1;
        
        const newItem = {
            ...data,
            id: newId,
            created_at: new Date().toISOString()
        };

        items.push(newItem);
        localStorage.setItem(`escola_${table}`, JSON.stringify(items));
        return newItem;
    }

    update(table, id, data) {
        const items = this.getAll(table);
        const index = items.findIndex(item => item.id == id);
        
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            localStorage.setItem(`escola_${table}`, JSON.stringify(items));
            return items[index];
        }
        return null;
    }

    delete(table, id) {
        const items = this.getAll(table);
        const filtered = items.filter(item => item.id != id);
        localStorage.setItem(`escola_${table}`, JSON.stringify(filtered));
        return true;
    }

    // Métodos específicos para consultas complexas
    getMatriculasByAluno(alunoId) {
        const matriculas = this.getAll('matriculas');
        return matriculas.filter(m => m.aluno_id == alunoId);
    }

    getMatriculasByTurma(turmaId) {
        const matriculas = this.getAll('matriculas');
        return matriculas.filter(m => m.turma_id == turmaId);
    }

    getNotasByMatricula(matriculaId) {
        const notas = this.getAll('notas');
        return notas.filter(n => n.matricula_id == matriculaId);
    }

    // Estatísticas para o dashboard
    getStats() {
        const alunos = this.getAll('alunos').filter(a => a.status === 'ativo');
        const professores = this.getAll('professores').filter(p => p.status === 'ativo');
        const turmas = this.getAll('turmas').filter(t => t.status === 'ativa');
        const notas = this.getAll('notas');
        
        const taxaAprovacao = notas.length > 0 
            ? Math.round((notas.filter(n => n.nota >= 7).length / notas.length) * 100)
            : 0;

        return {
            total_alunos: alunos.length,
            total_professores: professores.length,
            total_turmas: turmas.length,
            taxa_aprovacao: taxaAprovacao
        };
    }

    // Atividades recentes
    getAtividades() {
        const matriculas = this.getAll('matriculas');
        const alunos = this.getAll('alunos');
        const turmas = this.getAll('turmas');
        const notas = this.getAll('notas');

        const atividades = [];

        // Últimas matrículas
        matriculas.slice(-3).forEach(matricula => {
            const aluno = alunos.find(a => a.id == matricula.aluno_id);
            const turma = turmas.find(t => t.id == matricula.turma_id);
            
            if (aluno && turma) {
                atividades.push({
                    tipo: 'matricula',
                    descricao: 'Novo aluno matriculado',
                    detalhes: `${aluno.nome} - ${turma.nome}`,
                    tempo: 'Recente'
                });
            }
        });

        // Últimas notas
        notas.slice(-2).forEach(nota => {
            const matricula = matriculas.find(m => m.id == nota.matricula_id);
            if (matricula) {
                const aluno = alunos.find(a => a.id == matricula.aluno_id);
                if (aluno) {
                    atividades.push({
                        tipo: 'nota',
                        descricao: 'Notas lançadas',
                        detalhes: `${nota.disciplina} - ${aluno.nome}`,
                        tempo: 'Recente'
                    });
                }
            }
        });

        return atividades.slice(0, 5);
    }

    // Busca com filtros
    search(table, searchTerm) {
        const items = this.getAll(table);
        if (!searchTerm) return items;

        const term = searchTerm.toLowerCase();
        return items.filter(item => {
            return Object.values(item).some(value => 
                String(value).toLowerCase().includes(term)
            );
        });
    }

    // Limpar todos os dados (reset)
    clearAll() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('escola_'));
        keys.forEach(key => localStorage.removeItem(key));
        this.initializeData();
    }
}

// Instância global do banco de dados
window.localDB = new LocalDatabase();

// Simulador de API para compatibilidade com código existente
window.LocalAPI = {
    baseURL: '', // Não usado na versão local
    
    // Simular fetch para manter compatibilidade
    async fetch(url, options = {}) {
        return new Promise((resolve) => {
            setTimeout(() => { // Simular delay de rede
                try {
                    const result = this.handleRequest(url, options);
                    resolve({
                        ok: true,
                        json: () => Promise.resolve(result)
                    });
                } catch (error) {
                    resolve({
                        ok: false,
                        json: () => Promise.resolve({ error: error.message })
                    });
                }
            }, 100);
        });
    },

    handleRequest(url, options) {
        console.log('🔧 Processando requisição:', url, options?.method || 'GET');
        
        const method = options.method || 'GET';
        const body = options.body ? JSON.parse(options.body) : null;
        
        // Limpar URL e extrair partes
        const cleanUrl = url.replace('/api/', '').replace(/^\//, '');
        const urlParts = cleanUrl.split('/');
        const table = urlParts[0];
        const id = urlParts[1];

        console.log('📋 Tabela:', table, 'ID:', id, 'Método:', method);

        try {
            switch (method) {
                case 'GET':
                    if (url.includes('/stats')) {
                        console.log('📊 Retornando estatísticas');
                        return localDB.getStats();
                    }
                    if (url.includes('/atividades')) {
                        console.log('📝 Retornando atividades');
                        return localDB.getAtividades();
                    }
                    if (url.includes('/auth/login')) {
                        console.log('🔐 Processando login');
                        const { email, password } = body || {};
                        const usuarios = localDB.getAll('usuarios');
                        const usuario = usuarios.find(u => u.email === email && u.senha === password && u.status === 'ativo');
                        
                        if (usuario) {
                            return {
                                id: usuario.id,
                                nome: usuario.nome,
                                email: usuario.email,
                                cargo: usuario.cargo,
                                message: 'Login realizado com sucesso'
                            };
                        } else {
                            throw new Error('E-mail ou senha incorretos');
                        }
                    }
                    if (id) {
                        console.log('🔍 Buscando item por ID');
                        return localDB.getById(table, id);
                    }
                    console.log('📋 Listando todos os itens da tabela');
                    return localDB.getAll(table);

                case 'POST':
                    if (url.includes('/auth/login')) {
                        console.log('🔐 Processando login via POST');
                        const { email, password } = body || {};
                        const usuarios = localDB.getAll('usuarios');
                        const usuario = usuarios.find(u => u.email === email && u.senha === password && u.status === 'ativo');
                        
                        if (usuario) {
                            return {
                                id: usuario.id,
                                nome: usuario.nome,
                                email: usuario.email,
                                cargo: usuario.cargo,
                                message: 'Login realizado com sucesso'
                            };
                        } else {
                            throw new Error('E-mail ou senha incorretos');
                        }
                    }
                    console.log('➕ Criando novo item');
                    return localDB.create(table, body);

                case 'PUT':
                    console.log('✏️ Atualizando item');
                    return localDB.update(table, id, body);

                case 'DELETE':
                    console.log('🗑️ Excluindo item');
                    localDB.delete(table, id);
                    return { message: 'Item excluído com sucesso' };

                default:
                    throw new Error(`Método ${method} não suportado`);
            }
        } catch (error) {
            console.error('❌ Erro ao processar requisição:', error);
            throw error;
        }
    }
};

// Substituir fetch global para interceptar chamadas de API
const originalFetch = window.fetch;
window.fetch = function(url, options) {
    console.log('🔍 Interceptando fetch:', url);
    
    // Se for uma chamada para a API local, usar LocalAPI
    if (url.includes('/api/') || url.includes('localhost:5000') || url.includes('localhost:8000')) {
        console.log('📡 Usando banco local para:', url);
        const apiUrl = url.replace('http://localhost:5000', '').replace('http://localhost:8000', '');
        return LocalAPI.fetch(apiUrl, options);
    }
    
    // Caso contrário, usar fetch original
    console.log('🌐 Usando fetch original para:', url);
    return originalFetch.apply(this, arguments);
};

console.log('🎓 Sistema de banco de dados local carregado!');
console.log('📊 Dados disponíveis:', Object.keys(localStorage).filter(k => k.startsWith('escola_')));