// Turmas Management System
const API_URL = "http://localhost:5000/api";

class TurmasManager {
    constructor() {
        this.turmas = [];
        this.alunos = [];
        this.professores = [];
        this.currentTurmaId = null;
        this.materias = [
            { nome: 'Matemática', icon: '📐' },
            { nome: 'Português', icon: '📚' },
            { nome: 'História', icon: '🏛️' },
            { nome: 'Geografia', icon: '🌍' },
            { nome: 'Ciências', icon: '🔬' },
            { nome: 'Inglês', icon: '🇺🇸' },
            { nome: 'Educação Física', icon: '⚽' },
            { nome: 'Artes', icon: '🎨' }
        ];
        this.horarios = this.generateDefaultSchedule();
    }

    async init() {
        try {
            await this.loadData();
            this.renderTurmas();
            this.setupEventListeners();
        } catch (error) {
            console.error('Erro ao inicializar TurmasManager:', error);
        }
    }

    async loadData() {
        try {
            const [turmasRes, alunosRes, professoresRes] = await Promise.all([
                fetch(`${API_URL}/turmas`),
                fetch(`${API_URL}/alunos`),
                fetch(`${API_URL}/professores`)
            ]);

            this.turmas = await turmasRes.json();
            this.alunos = await alunosRes.json();
            this.professores = await professoresRes.json();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    renderTurmas() {
        const grid = document.getElementById('turmasGrid');
        const addCard = grid.querySelector('.add-turma-card');
        
        // Clear existing cards except add card
        const existingCards = grid.querySelectorAll('.turma-card:not(.add-turma-card)');
        existingCards.forEach(card => card.remove());

        this.turmas.forEach(turma => {
            const alunosCount = this.getAlunosCountByTurma(turma.id);
            const card = this.createTurmaCard(turma, alunosCount);
            grid.appendChild(card);
        });
    }

    createTurmaCard(turma, alunosCount) {
        const card = document.createElement('div');
        card.className = 'turma-card';
        card.onclick = (e) => {
            if (!e.target.closest('.turma-menu')) {
                this.openTurmaDetails(turma.id);
            }
        };

        card.innerHTML = `
            <div class="turma-card-header">
                <h3 class="turma-name">${turma.nome}</h3>
                <div class="turma-card-actions">
                    <span class="turma-year">${turma.ano}</span>
                    <div class="turma-menu">
                        <button class="turma-menu-btn" onclick="event.stopPropagation(); toggleTurmaMenu(${turma.id})">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="1"/>
                                <circle cx="12" cy="5" r="1"/>
                                <circle cx="12" cy="19" r="1"/>
                            </svg>
                        </button>
                        <div class="turma-menu-dropdown" id="menu-${turma.id}">
                            <button onclick="event.stopPropagation(); openTurmaDetailsFromCard(${turma.id})">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                Ver Detalhes
                            </button>
                            <button onclick="event.stopPropagation(); editTurmaFromCard(${turma.id})">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Editar
                            </button>
                            <button class="delete-btn" onclick="event.stopPropagation(); deleteTurmaFromCard(${turma.id})">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
                                </svg>
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="turma-info">
                <div class="turma-info-item">
                    <span class="turma-info-label">Turno</span>
                    <span class="turma-info-value">${turma.turno}</span>
                </div>
                <div class="turma-info-item">
                    <span class="turma-info-label">Sala</span>
                    <span class="turma-info-value">${turma.sala || 'Não definida'}</span>
                </div>
                <div class="turma-info-item">
                    <span class="turma-info-label">Professor</span>
                    <span class="turma-info-value">${turma.professor_nome || 'Não atribuído'}</span>
                </div>
                <div class="turma-info-item">
                    <span class="turma-info-label">Capacidade</span>
                    <span class="turma-info-value">${turma.capacidade || 0}</span>
                </div>
            </div>
            
            <div class="turma-stats">
                <div class="turma-students-count">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    ${alunosCount} alunos
                </div>
                <span class="turma-status ${turma.status}">${turma.status}</span>
            </div>
        `;

        return card;
    }

    getAlunosCountByTurma(turmaId) {
        // This would normally come from matriculas table
        // For now, we'll simulate some data
        const counts = { 1: 28, 2: 25, 3: 22, 4: 30 };
        return counts[turmaId] || 0;
    }

    async openTurmaDetails(turmaId) {
        this.currentTurmaId = turmaId;
        const turma = this.turmas.find(t => t.id === turmaId);
        
        if (!turma) return;

        // Update modal title and info
        document.getElementById('turmaDetailsTitle').textContent = `${turma.nome} - Detalhes`;
        document.getElementById('detailNome').textContent = turma.nome;
        document.getElementById('detailAno').textContent = turma.ano;
        document.getElementById('detailTurno').textContent = turma.turno;
        document.getElementById('detailSala').textContent = turma.sala || 'Não definida';
        document.getElementById('detailCapacidade').textContent = turma.capacidade || 'Não definida';
        document.getElementById('detailProfessor').textContent = turma.professor_nome || 'Não atribuído';

        // Load tab content
        await this.loadAlunosTab(turmaId);
        this.loadMateriasTab();
        this.loadHorariosTab();

        // Show modal
        document.getElementById('turmaDetailsModal').classList.add('active');
    }

    async loadAlunosTab(turmaId) {
        const container = document.getElementById('alunosList');
        
        try {
            // Get matriculas for this turma
            const response = await fetch(`${API_URL}/matriculas`);
            const matriculas = await response.json();
            
            const turmaMatriculas = matriculas.filter(m => m.turma_id === turmaId && m.status === 'ativa');
            
            if (turmaMatriculas.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                            <circle cx="8.5" cy="7" r="4"/>
                        </svg>
                        <p>Nenhum aluno matriculado nesta turma.</p>
                        <p>Clique em "Adicionar Aluno" para matricular alunos.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = turmaMatriculas.map(matricula => `
                <div class="aluno-card">
                    <div class="aluno-card-content">
                        <div class="aluno-name">${matricula.aluno_nome}</div>
                        <div class="aluno-info">Matrícula: ${new Date(matricula.data_matricula).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div class="aluno-actions">
                        <button class="btn btn-danger btn-sm" onclick="removeAlunoFromTurma(${matricula.id})" title="Remover da turma">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            container.innerHTML = '<p>Erro ao carregar alunos.</p>';
        }
    }

    async openAddAlunoModal() {
        if (!this.currentTurmaId) {
            alert('Por favor, selecione uma turma primeiro');
            return;
        }
        
        try {
            // Carregar lista de alunos disponíveis
            await this.loadAlunosDisponiveis();
            document.getElementById('addAlunoModal').classList.add('active');
        } catch (error) {
            console.error('Erro ao abrir modal de adicionar aluno:', error);
            alert('Erro ao carregar dados. Tente novamente.');
        }
    }

    closeAddAlunoModal() {
        document.getElementById('addAlunoModal').classList.remove('active');
        document.getElementById('addAlunoForm').reset();
        document.getElementById('alunoPreview').style.display = 'none';
    }

    async loadAlunosDisponiveis() {
        try {
            const select = document.getElementById('alunoSelect');
            select.innerHTML = '<option value="">Carregando alunos...</option>';

            // Buscar alunos que não estão matriculados na turma atual
            const [alunosRes, matriculasRes] = await Promise.all([
                fetch(`${API_URL}/alunos`),
                fetch(`${API_URL}/matriculas`)
            ]);

            if (!alunosRes.ok || !matriculasRes.ok) {
                throw new Error('Erro ao buscar dados do servidor');
            }

            const alunos = await alunosRes.json();
            const matriculas = await matriculasRes.json();

            // Filtrar alunos já matriculados na turma atual
            const alunosMatriculados = matriculas
                .filter(m => m.turma_id === this.currentTurmaId && m.status === 'ativa')
                .map(m => m.aluno_id);

            const alunosDisponiveis = alunos.filter(aluno => 
                !alunosMatriculados.includes(aluno.id) && aluno.status === 'ativo'
            );

            // Limpar select
            select.innerHTML = '<option value="">Selecione um aluno</option>';

            if (alunosDisponiveis.length === 0) {
                select.innerHTML = '<option value="">Nenhum aluno disponível</option>';
                return;
            }

            alunosDisponiveis.forEach(aluno => {
                const option = document.createElement('option');
                option.value = aluno.id;
                option.textContent = `${aluno.nome} - ${aluno.email}`;
                option.dataset.aluno = JSON.stringify(aluno);
                select.appendChild(option);
            });

            // Remover eventos anteriores e adicionar novo evento para mostrar preview
            select.removeEventListener('change', this.showAlunoPreview);
            select.addEventListener('change', this.showAlunoPreview.bind(this));

        } catch (error) {
            console.error('Erro ao carregar alunos disponíveis:', error);
            const select = document.getElementById('alunoSelect');
            select.innerHTML = '<option value="">Erro ao carregar alunos</option>';
            throw error;
        }
    }

    showAlunoPreview() {
        const select = document.getElementById('alunoSelect');
        const preview = document.getElementById('alunoPreview');
        
        if (select.value) {
            const alunoData = JSON.parse(select.options[select.selectedIndex].dataset.aluno);
            
            document.getElementById('previewNome').textContent = alunoData.nome;
            document.getElementById('previewEmail').textContent = alunoData.email;
            document.getElementById('previewCpf').textContent = alunoData.cpf;
            document.getElementById('previewDataNasc').textContent = 
                new Date(alunoData.data_nascimento).toLocaleDateString('pt-BR');
            
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }

    async addAlunoToTurma() {
        const alunoId = document.getElementById('alunoSelect').value;
        const status = document.getElementById('statusMatricula').value;

        if (!alunoId) {
            alert('Por favor, selecione um aluno');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/matriculas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    aluno_id: parseInt(alunoId),
                    turma_id: this.currentTurmaId,
                    status: status
                })
            });

            if (response.ok) {
                this.closeAddAlunoModal();
                await this.loadAlunosTab(this.currentTurmaId);
                this.showNotification('Aluno adicionado à turma com sucesso!', 'success');
            } else {
                const error = await response.json();
                alert(`Erro ao adicionar aluno: ${error.error}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar aluno:', error);
            alert('Erro ao adicionar aluno à turma');
        }
    }

    async removeAlunoFromTurma(matriculaId) {
        if (!confirm('Tem certeza que deseja remover este aluno da turma?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/matriculas/${matriculaId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadAlunosTab(this.currentTurmaId);
                this.showNotification('Aluno removido da turma com sucesso!', 'success');
            } else {
                const error = await response.json();
                alert(`Erro ao remover aluno: ${error.error}`);
            }
        } catch (error) {
            console.error('Erro ao remover aluno:', error);
            alert('Erro ao remover aluno da turma');
        }
    }

    showNotification(message, type = 'info') {
        // Implementar sistema de notificações
        console.log(`${type.toUpperCase()}: ${message}`);
        // Temporário - usar alert
        if (type === 'success') {
            alert(message);
        }
    }

    loadMateriasTab() {
        const container = document.getElementById('materiasGrid');
        
        container.innerHTML = this.materias.map(materia => {
            const professor = this.getRandomProfessor();
            return `
                <div class="materia-card">
                    <div class="materia-icon">${materia.icon}</div>
                    <div class="materia-name">${materia.nome}</div>
                    <div class="materia-professor">Prof. ${professor.nome}</div>
                </div>
            `;
        }).join('');
    }

    loadHorariosTab() {
        const container = document.getElementById('horariosGrid');
        
        const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
        const horarios = [
            '07:30 - 08:15',
            '08:15 - 09:00',
            '09:00 - 09:45',
            '10:00 - 10:45',
            '10:45 - 11:30',
            '11:30 - 12:15'
        ];

        let html = '<div class="horario-header">Horário</div>';
        dias.forEach(dia => {
            html += `<div class="horario-header">${dia}</div>`;
        });

        horarios.forEach((horario, timeIndex) => {
            html += `<div class="horario-time">${horario}</div>`;
            
            dias.forEach((dia, dayIndex) => {
                const aula = this.getAulaForSlot(dayIndex, timeIndex);
                if (aula) {
                    html += `
                        <div class="horario-cell">
                            <div class="horario-materia">${aula.materia}</div>
                            <div class="horario-professor">${aula.professor}</div>
                        </div>
                    `;
                } else {
                    html += '<div class="horario-cell horario-empty">Livre</div>';
                }
            });
        });

        container.innerHTML = html;
    }

    getAulaForSlot(dayIndex, timeIndex) {
        // Generate a realistic schedule
        const schedule = [
            // Segunda
            [
                { materia: 'Matemática', professor: 'Prof. Silva' },
                { materia: 'Matemática', professor: 'Prof. Silva' },
                { materia: 'Português', professor: 'Prof. Santos' },
                null, // Intervalo
                { materia: 'História', professor: 'Prof. Costa' },
                { materia: 'Geografia', professor: 'Prof. Lima' }
            ],
            // Terça
            [
                { materia: 'Ciências', professor: 'Prof. Oliveira' },
                { materia: 'Ciências', professor: 'Prof. Oliveira' },
                { materia: 'Inglês', professor: 'Prof. Brown' },
                null,
                { materia: 'Matemática', professor: 'Prof. Silva' },
                { materia: 'Português', professor: 'Prof. Santos' }
            ],
            // Quarta
            [
                { materia: 'Ed. Física', professor: 'Prof. Souza' },
                { materia: 'Ed. Física', professor: 'Prof. Souza' },
                { materia: 'Artes', professor: 'Prof. Martins' },
                null,
                { materia: 'História', professor: 'Prof. Costa' },
                { materia: 'Geografia', professor: 'Prof. Lima' }
            ],
            // Quinta
            [
                { materia: 'Português', professor: 'Prof. Santos' },
                { materia: 'Português', professor: 'Prof. Santos' },
                { materia: 'Matemática', professor: 'Prof. Silva' },
                null,
                { materia: 'Ciências', professor: 'Prof. Oliveira' },
                { materia: 'Inglês', professor: 'Prof. Brown' }
            ],
            // Sexta
            [
                { materia: 'História', professor: 'Prof. Costa' },
                { materia: 'Geografia', professor: 'Prof. Lima' },
                { materia: 'Artes', professor: 'Prof. Martins' },
                null,
                { materia: 'Ed. Física', professor: 'Prof. Souza' },
                { materia: 'Português', professor: 'Prof. Santos' }
            ]
        ];

        return schedule[dayIndex] ? schedule[dayIndex][timeIndex] : null;
    }

    getRandomProfessor() {
        if (this.professores.length === 0) {
            return { nome: 'Não atribuído' };
        }
        return this.professores[Math.floor(Math.random() * this.professores.length)];
    }

    generateDefaultSchedule() {
        // This would normally come from a database
        return {};
    }

    setupEventListeners() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('turmaDetailsModal');
            if (e.target === modal) {
                this.closeTurmaDetails();
            }

            // Close all turma menus when clicking outside
            if (!e.target.closest('.turma-menu')) {
                document.querySelectorAll('.turma-menu-dropdown').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });
    }

    toggleTurmaMenu(turmaId) {
        const menu = document.getElementById(`menu-${turmaId}`);
        const isActive = menu.classList.contains('active');
        
        // Close all other menus
        document.querySelectorAll('.turma-menu-dropdown').forEach(m => {
            m.classList.remove('active');
        });
        
        // Toggle current menu
        if (!isActive) {
            menu.classList.add('active');
        }
    }

    async deleteTurmaFromCard(turmaId) {
        this.currentTurmaId = turmaId;
        await this.deleteTurma();
    }

    editTurmaFromCard(turmaId) {
        this.currentTurmaId = turmaId;
        this.editTurma();
    }

    openTurmaDetailsFromCard(turmaId) {
        this.openTurmaDetails(turmaId);
    }

    closeTurmaDetails() {
        document.getElementById('turmaDetailsModal').classList.remove('active');
        this.currentTurmaId = null;
    }

    async deleteTurma() {
        if (!this.currentTurmaId) {
            alert('Nenhuma turma selecionada para exclusão');
            return;
        }

        const turma = this.turmas.find(t => t.id === this.currentTurmaId);
        if (!turma) {
            alert('Turma não encontrada');
            return;
        }

        const confirmDelete = confirm(
            `Tem certeza que deseja excluir a turma "${turma.nome}"?\n\n` +
            `⚠️ ATENÇÃO: Esta ação irá:\n` +
            `• Remover a turma permanentemente\n` +
            `• Desmatricular todos os alunos\n` +
            `• Remover todos os horários e dados relacionados\n\n` +
            `Esta ação NÃO PODE ser desfeita!`
        );

        if (!confirmDelete) {
            return;
        }

        // Segunda confirmação para ações críticas
        const finalConfirm = confirm(
            `CONFIRMAÇÃO FINAL:\n\n` +
            `Digite "EXCLUIR" para confirmar a exclusão da turma "${turma.nome}"`
        );

        if (!finalConfirm) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/turmas/${this.currentTurmaId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                alert('Turma excluída com sucesso!');
                this.closeTurmaDetails();
                await this.loadData();
                this.renderTurmas();
            } else {
                alert('Erro ao excluir turma: ' + result.error);
            }
        } catch (error) {
            console.error('Erro ao excluir turma:', error);
            alert('Erro ao excluir turma. Tente novamente.');
        }
    }

    editTurma() {
        if (!this.currentTurmaId) {
            alert('Nenhuma turma selecionada para edição');
            return;
        }

        // Close details modal and open edit modal
        this.closeTurmaDetails();
        
        // Open edit modal with turma data
        this.openModal(this.currentTurmaId);
    }

    async openModal(turmaId = null) {
        // Load professors for the select
        await this.loadProfessorsForSelect();
        
        if (turmaId) {
            // Edit mode
            const turma = this.turmas.find(t => t.id === turmaId);
            if (turma) {
                document.getElementById('modalTitle').textContent = 'Editar Turma';
                document.getElementById('turmaId').value = turma.id;
                document.getElementById('nome').value = turma.nome;
                document.getElementById('ano').value = turma.ano;
                document.getElementById('turno').value = turma.turno;
                document.getElementById('sala').value = turma.sala || '';
                document.getElementById('capacidade').value = turma.capacidade || 30;
                document.getElementById('professorId').value = turma.professor_id || '';
                document.getElementById('status').value = turma.status || 'ativa';
            }
        } else {
            // Create mode
            document.getElementById('modalTitle').textContent = 'Nova Turma';
            document.getElementById('turmaForm').reset();
            document.getElementById('turmaId').value = '';
            document.getElementById('capacidade').value = 30;
            document.getElementById('status').value = 'ativa';
        }
        
        document.getElementById('turmaModal').classList.add('active');
    }

    async loadProfessorsForSelect() {
        const select = document.getElementById('professorId');
        
        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Add professors to select
        this.professores.forEach(professor => {
            const option = document.createElement('option');
            option.value = professor.id;
            option.textContent = professor.nome;
            select.appendChild(option);
        });
    }

    closeModal() {
        document.getElementById('turmaModal').classList.remove('active');
        document.getElementById('turmaForm').reset();
    }

    async saveTurma() {
        const form = document.getElementById('turmaForm');
        const formData = new FormData(form);
        
        // Validate required fields
        const nome = formData.get('nome') || document.getElementById('nome').value;
        const ano = formData.get('ano') || document.getElementById('ano').value;
        const turno = formData.get('turno') || document.getElementById('turno').value;
        
        if (!nome || !ano || !turno) {
            alert('Por favor, preencha todos os campos obrigatórios (Nome, Ano e Turno).');
            return;
        }
        
        const turmaData = {
            nome: nome.trim(),
            ano: ano,
            turno: turno,
            sala: document.getElementById('sala').value.trim() || null,
            capacidade: parseInt(document.getElementById('capacidade').value) || 30,
            professor_id: document.getElementById('professorId').value || null,
            status: document.getElementById('status').value || 'ativa'
        };
        
        const turmaId = document.getElementById('turmaId').value;
        
        try {
            let response;
            
            if (turmaId) {
                // Update existing turma
                response = await fetch(`${API_URL}/turmas/${turmaId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(turmaData)
                });
            } else {
                // Create new turma
                response = await fetch(`${API_URL}/turmas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(turmaData)
                });
            }
            
            const result = await response.json();
            
            if (response.ok) {
                const action = turmaId ? 'atualizada' : 'criada';
                alert(`Turma ${action} com sucesso!`);
                this.closeModal();
                await this.loadData();
                this.renderTurmas();
            } else {
                alert('Erro ao salvar turma: ' + (result.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao salvar turma:', error);
            alert('Erro ao salvar turma. Verifique se o servidor está rodando.');
        }
    }

    showTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        event.target.classList.add('active');
        document.getElementById(tabName + 'Tab').classList.add('active');
    }
}

// Global functions
let turmasManager;

function openModal() {
    turmasManager.openModal();
}

function closeTurmaDetails() {
    turmasManager.closeTurmaDetails();
}

function showTab(tabName) {
    turmasManager.showTab(tabName);
}

function deleteTurma() {
    turmasManager.deleteTurma();
}

function editTurma() {
    turmasManager.editTurma();
}

function toggleTurmaMenu(turmaId) {
    turmasManager.toggleTurmaMenu(turmaId);
}

function deleteTurmaFromCard(turmaId) {
    turmasManager.deleteTurmaFromCard(turmaId);
}

function editTurmaFromCard(turmaId) {
    turmasManager.editTurmaFromCard(turmaId);
}

function openTurmaDetailsFromCard(turmaId) {
    turmasManager.openTurmaDetailsFromCard(turmaId);
}

function closeModal() {
    turmasManager.closeModal();
}

function saveTurma() {
    turmasManager.saveTurma();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    turmasManager = new TurmasManager();
    turmasManager.init();
});

// Funções globais para os modais
function openAddAlunoModal() {
    turmasManager.openAddAlunoModal();
}

function closeAddAlunoModal() {
    turmasManager.closeAddAlunoModal();
}

function addAlunoToTurma() {
    turmasManager.addAlunoToTurma();
}

function removeAlunoFromTurma(matriculaId) {
    turmasManager.removeAlunoFromTurma(matriculaId);
}