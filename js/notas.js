// Sistema de Gerenciamento de Notas - Versão Profissional
class NotasManager {
    constructor() {
        this.API_URL = "http://localhost:5000/api";
        this.notas = [];
        this.matriculas = [];
        this.turmas = [];
        this.filteredNotas = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortColumn = '';
        this.sortDirection = 'asc';
        
        this.init();
    }

    async init() {
        console.log('Inicializando sistema de notas...');
        await this.loadData();
        this.setupEventListeners();
        this.setupNotaInputs();
    }

    async loadData() {
        try {
            await Promise.all([
                this.loadNotas(),
                this.loadMatriculas(),
                this.loadTurmas()
            ]);
            this.populateFilters();
            this.renderNotas();
            this.updateStats();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showError('Erro ao carregar dados. Verifique se o servidor está rodando.');
        }
    }

    async loadNotas() {
        try {
            const response = await fetch(`${this.API_URL}/notas`);
            if (response.ok) {
                this.notas = await response.json();
            } else {
                // Se não conseguir carregar da API, usar dados simulados
                this.notas = this.generateSampleNotas();
            }
            console.log('Notas carregadas:', this.notas.length);
        } catch (error) {
            console.error('Erro ao carregar notas:', error);
            // Fallback para dados simulados
            this.notas = this.generateSampleNotas();
        }
    }

    async loadMatriculas() {
        try {
            const response = await fetch(`${this.API_URL}/matriculas`);
            this.matriculas = await response.json();
            console.log('Matrículas carregadas:', this.matriculas.length);
        } catch (error) {
            console.error('Erro ao carregar matrículas:', error);
            this.matriculas = [];
        }
    }

    // Método para recarregar dados (útil quando novos alunos são adicionados)
    async reloadData() {
        await this.loadData();
    }

    async loadTurmas() {
        try {
            const response = await fetch(`${this.API_URL}/turmas`);
            this.turmas = await response.json();
            console.log('Turmas carregadas:', this.turmas.length);
        } catch (error) {
            console.error('Erro ao carregar turmas:', error);
            this.turmas = [];
        }
    }

    generateSampleNotas() {
        const disciplinas = ['Matemática', 'Português', 'História', 'Geografia', 'Ciências', 'Inglês', 'Educação Física', 'Artes'];
        const notas = [];
        let id = 1;

        // Gerar notas para cada matrícula
        this.matriculas.forEach(matricula => {
            disciplinas.forEach(disciplina => {
                for (let bimestre = 1; bimestre <= 4; bimestre++) {
                    const nota = Math.random() * 10;
                    notas.push({
                        id: id++,
                        matricula_id: matricula.id,
                        aluno_nome: matricula.aluno_nome,
                        turma_nome: matricula.turma_nome,
                        disciplina: disciplina,
                        nota: parseFloat(nota.toFixed(1)),
                        bimestre: bimestre,
                        created_at: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
                    });
                }
            });
        });

        return notas;
    }

    populateFilters() {
        // Popular filtro de turmas
        const turmaFilter = document.getElementById('turmaFilter');
        turmaFilter.innerHTML = '<option value="">Todas as turmas</option>';
        
        const uniqueTurmas = [...new Set(this.notas.map(n => n.turma_nome))];
        uniqueTurmas.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma;
            option.textContent = turma;
            turmaFilter.appendChild(option);
        });

        // Popular select de matrículas no modal
        const matriculaSelect = document.getElementById('matriculaId');
        matriculaSelect.innerHTML = '<option value="">Selecione uma matrícula</option>';
        
        this.matriculas.forEach(matricula => {
            const option = document.createElement('option');
            option.value = matricula.id;
            option.textContent = `${matricula.aluno_nome} - ${matricula.turma_nome}`;
            option.dataset.aluno = matricula.aluno_nome;
            option.dataset.turma = matricula.turma_nome;
            matriculaSelect.appendChild(option);
        });
    }

    filterNotas() {
        const turmaFilter = document.getElementById('turmaFilter').value;
        const disciplinaFilter = document.getElementById('disciplinaFilter').value;
        const bimestreFilter = document.getElementById('bimestreFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        this.filteredNotas = this.notas.filter(nota => {
            const matchTurma = !turmaFilter || nota.turma_nome === turmaFilter;
            const matchDisciplina = !disciplinaFilter || nota.disciplina === disciplinaFilter;
            const matchBimestre = !bimestreFilter || nota.bimestre.toString() === bimestreFilter;
            const matchSearch = !searchTerm || nota.aluno_nome.toLowerCase().includes(searchTerm);

            return matchTurma && matchDisciplina && matchBimestre && matchSearch;
        });

        this.currentPage = 1;
        this.renderNotas();
        this.updateStats();
    }

    sortTable(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        const dataToSort = this.filteredNotas.length > 0 ? this.filteredNotas : this.notas;
        
        dataToSort.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            if (column === 'aluno') {
                aVal = a.aluno_nome;
                bVal = b.aluno_nome;
            } else if (column === 'turma') {
                aVal = a.turma_nome;
                bVal = b.turma_nome;
            }

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        this.updateSortIcons(column);
        this.renderNotas();
    }

    updateSortIcons(activeColumn) {
        document.querySelectorAll('.sortable').forEach(th => {
            th.classList.remove('sorted', 'desc');
            if (th.onclick.toString().includes(activeColumn)) {
                th.classList.add('sorted');
                if (this.sortDirection === 'desc') {
                    th.classList.add('desc');
                }
            }
        });
    }

    renderNotas() {
        const tbody = document.getElementById('notasTableBody');
        const dataToRender = this.filteredNotas.length > 0 ? this.filteredNotas : this.notas;
        
        if (dataToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-cell">
                        Nenhuma nota encontrada
                    </td>
                </tr>
            `;
            this.updatePagination(0);
            return;
        }

        // Paginação
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedData = dataToRender.slice(startIndex, endIndex);

        tbody.innerHTML = paginatedData.map(nota => `
            <tr class="fade-in">
                <td>
                    <div class="student-info">
                        <div class="student-name">${nota.aluno_nome}</div>
                    </div>
                </td>
                <td>
                    <span class="turma-badge">${nota.turma_nome}</span>
                </td>
                <td>
                    <span class="disciplina-tag">${nota.disciplina}</span>
                </td>
                <td>
                    <span class="bimestre-indicator">${nota.bimestre}º</span>
                </td>
                <td>
                    <div class="nota-value ${this.getNotaClass(nota.nota)}">${nota.nota}</div>
                </td>
                <td>
                    <span class="nota-badge ${this.getNotaClass(nota.nota)}">${this.getNotaStatus(nota.nota)}</span>
                </td>
                <td>
                    <span class="date-text">${this.formatDate(nota.created_at)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-edit tooltip" 
                                onclick="notasManager.editNota(${nota.id})"
                                data-tooltip="Editar nota">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn action-btn-delete tooltip" 
                                onclick="notasManager.deleteNota(${nota.id})"
                                data-tooltip="Excluir nota">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePagination(dataToRender.length);
        document.getElementById('totalRegistros').textContent = `${dataToRender.length} registro${dataToRender.length !== 1 ? 's' : ''}`;
    }

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        document.getElementById('paginationStart').textContent = startItem;
        document.getElementById('paginationEnd').textContent = endItem;
        document.getElementById('paginationTotal').textContent = totalItems;

        // Botões anterior/próximo
        document.getElementById('prevBtn').disabled = this.currentPage <= 1;
        document.getElementById('nextBtn').disabled = this.currentPage >= totalPages;

        // Números da paginação
        const numbersContainer = document.getElementById('paginationNumbers');
        numbersContainer.innerHTML = '';

        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-number ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => this.goToPage(i);
            numbersContainer.appendChild(pageBtn);
        }
    }

    changePage(direction) {
        const totalPages = Math.ceil((this.filteredNotas.length > 0 ? this.filteredNotas.length : this.notas.length) / this.itemsPerPage);
        const newPage = this.currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.renderNotas();
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderNotas();
    }

    updateStats() {
        const dataToAnalyze = this.filteredNotas.length > 0 ? this.filteredNotas : this.notas;
        
        const aprovados = dataToAnalyze.filter(n => n.nota >= 7).length;
        const recuperacao = dataToAnalyze.filter(n => n.nota >= 5 && n.nota < 7).length;
        const reprovados = dataToAnalyze.filter(n => n.nota < 5).length;
        const mediaGeral = dataToAnalyze.length > 0 ? 
            (dataToAnalyze.reduce((sum, n) => sum + n.nota, 0) / dataToAnalyze.length).toFixed(1) : 0;

        document.getElementById('aprovadosCount').textContent = aprovados;
        document.getElementById('recuperacaoCount').textContent = recuperacao;
        document.getElementById('reprovadosCount').textContent = reprovados;
        document.getElementById('mediaGeral').textContent = mediaGeral;
    }

    getNotaClass(nota) {
        if (nota >= 7) return 'aprovado';
        if (nota >= 5) return 'recuperacao';
        return 'reprovado';
    }

    getNotaStatus(nota) {
        if (nota >= 7) return 'Aprovado';
        if (nota >= 5) return 'Recuperação';
        return 'Reprovado';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    setupEventListeners() {
        // Filtros
        document.getElementById('turmaFilter').addEventListener('change', () => this.filterNotas());
        document.getElementById('disciplinaFilter').addEventListener('change', () => this.filterNotas());
        document.getElementById('bimestreFilter').addEventListener('change', () => this.filterNotas());
        document.getElementById('searchInput').addEventListener('input', () => this.filterNotas());

        // Modais
        document.getElementById('notaModal').addEventListener('click', (e) => {
            if (e.target.id === 'notaModal') this.closeNotaModal();
        });

        document.getElementById('editNotaModal').addEventListener('click', (e) => {
            if (e.target.id === 'editNotaModal') this.closeEditNotaModal();
        });
    }

    setupNotaInputs() {
        // Input de nota principal
        const notaInput = document.getElementById('nota');
        const notaStatus = document.getElementById('notaStatus');
        const scaleFill = document.getElementById('scaleFill');

        notaInput.addEventListener('input', (e) => {
            const valor = parseFloat(e.target.value) || 0;
            this.updateNotaVisual(valor, notaStatus, scaleFill);
        });

        // Input de edição de nota
        const editNotaInput = document.getElementById('editNota');
        const editNotaStatus = document.getElementById('editNotaStatus');
        const editScaleFill = document.getElementById('editScaleFill');

        editNotaInput.addEventListener('input', (e) => {
            const valor = parseFloat(e.target.value) || 0;
            this.updateNotaVisual(valor, editNotaStatus, editScaleFill);
        });
    }

    updateNotaVisual(valor, statusElement, fillElement) {
        const percentage = (valor / 10) * 100;
        fillElement.style.width = `${percentage}%`;

        let status = '';
        let className = '';

        if (valor >= 7) {
            status = 'Aprovado';
            className = 'aprovado';
        } else if (valor >= 5) {
            status = 'Recuperação';
            className = 'recuperacao';
        } else {
            status = 'Reprovado';
            className = 'reprovado';
        }

        statusElement.textContent = status;
        statusElement.className = `nota-status ${className}`;
    }

    updateAlunoTurma() {
        const select = document.getElementById('matriculaId');
        const selectedOption = select.options[select.selectedIndex];
        const alunoInfo = document.getElementById('alunoInfo');

        if (selectedOption.value) {
            document.getElementById('infoAluno').textContent = selectedOption.dataset.aluno;
            document.getElementById('infoTurma').textContent = selectedOption.dataset.turma;
            alunoInfo.style.display = 'block';
        } else {
            alunoInfo.style.display = 'none';
        }
    }

    async openNotaModal() {
        // Recarregar matrículas para pegar novos alunos
        await this.loadMatriculas();
        this.populateFilters();
        
        document.getElementById('notaForm').reset();
        document.getElementById('alunoInfo').style.display = 'none';
        document.getElementById('notaModal').classList.add('active');
    }

    closeNotaModal() {
        document.getElementById('notaModal').classList.remove('active');
    }

    async saveNota() {
        const formData = {
            matricula_id: parseInt(document.getElementById('matriculaId').value),
            disciplina: document.getElementById('disciplina').value,
            bimestre: parseInt(document.getElementById('bimestre').value),
            nota: parseFloat(document.getElementById('nota').value)
        };

        if (!formData.matricula_id || !formData.disciplina || !formData.bimestre || isNaN(formData.nota)) {
            this.showAlert('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }

        if (formData.nota < 0 || formData.nota > 10) {
            this.showAlert('A nota deve estar entre 0 e 10', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/notas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await this.loadNotas();
                this.closeNotaModal();
                this.filterNotas();
                this.showAlert('Nota lançada com sucesso!', 'success');
            } else {
                const error = await response.json();
                this.showAlert(error.error || 'Erro ao salvar nota', 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar nota:', error);
            this.showAlert('Erro ao conectar com o servidor', 'error');
        }
    }

    editNota(id) {
        const nota = this.notas.find(n => n.id === id);
        if (!nota) return;

        document.getElementById('editNotaId').value = nota.id;
        document.getElementById('editNota').value = nota.nota;
        this.updateNotaVisual(nota.nota, 
            document.getElementById('editNotaStatus'), 
            document.getElementById('editScaleFill'));
        
        document.getElementById('editNotaModal').classList.add('active');
    }

    closeEditNotaModal() {
        document.getElementById('editNotaModal').classList.remove('active');
    }

    async updateNota() {
        const id = parseInt(document.getElementById('editNotaId').value);
        const novaNota = parseFloat(document.getElementById('editNota').value);

        if (isNaN(novaNota) || novaNota < 0 || novaNota > 10) {
            this.showAlert('A nota deve estar entre 0 e 10', 'error');
            return;
        }

        try {
            const notaOriginal = this.notas.find(n => n.id === id);
            const formData = {
                matricula_id: notaOriginal.matricula_id,
                disciplina: notaOriginal.disciplina,
                bimestre: notaOriginal.bimestre,
                nota: novaNota
            };

            const response = await fetch(`${this.API_URL}/notas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await this.loadNotas();
                this.closeEditNotaModal();
                this.filterNotas();
                this.showAlert('Nota atualizada com sucesso!', 'success');
            } else {
                const error = await response.json();
                this.showAlert(error.error || 'Erro ao atualizar nota', 'error');
            }
        } catch (error) {
            console.error('Erro ao atualizar nota:', error);
            this.showAlert('Erro ao conectar com o servidor', 'error');
        }
    }

    async deleteNota(id) {
        if (!confirm('Tem certeza que deseja excluir esta nota?')) return;

        try {
            const response = await fetch(`${this.API_URL}/notas/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadNotas();
                this.filterNotas();
                this.showAlert('Nota excluída com sucesso!', 'success');
            } else {
                const error = await response.json();
                this.showAlert(error.error || 'Erro ao excluir nota', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir nota:', error);
            this.showAlert('Erro ao conectar com o servidor', 'error');
        }
    }

    exportarNotas() {
        const dataToExport = this.filteredNotas.length > 0 ? this.filteredNotas : this.notas;
        
        if (dataToExport.length === 0) {
            this.showAlert('Nenhuma nota para exportar', 'warning');
            return;
        }

        // Criar CSV
        const headers = ['Aluno', 'Turma', 'Disciplina', 'Bimestre', 'Nota', 'Status', 'Data'];
        const csvContent = [
            headers.join(','),
            ...dataToExport.map(nota => [
                `"${nota.aluno_nome}"`,
                `"${nota.turma_nome}"`,
                `"${nota.disciplina}"`,
                nota.bimestre,
                nota.nota,
                `"${this.getNotaStatus(nota.nota)}"`,
                `"${this.formatDate(nota.created_at)}"`
            ].join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `notas_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        this.showAlert('Relatório exportado com sucesso!', 'success');
    }

    showAlert(message, type = 'info') {
        // Implementar sistema de alertas (pode usar o mesmo do cadastro)
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(message); // Temporário
    }

    showError(message) {
        document.getElementById('notasTableBody').innerHTML = `
            <tr>
                <td colspan="8" class="loading-cell" style="color: #ef4444;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-bottom: 0.5rem;">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <br>
                    ${message}
                </td>
            </tr>
        `;
    }
}

// Funções globais para compatibilidade
let notasManager;

function filterNotas() {
    notasManager.filterNotas();
}

function sortTable(column) {
    notasManager.sortTable(column);
}

function changePage(direction) {
    notasManager.changePage(direction);
}

function openNotaModal() {
    notasManager.openNotaModal();
}

function closeNotaModal() {
    notasManager.closeNotaModal();
}

function saveNota() {
    notasManager.saveNota();
}

function closeEditNotaModal() {
    notasManager.closeEditNotaModal();
}

function updateNota() {
    notasManager.updateNota();
}

function updateAlunoTurma() {
    notasManager.updateAlunoTurma();
}

function exportarNotas() {
    notasManager.exportarNotas();
}

function reloadNotasData() {
    if (notasManager) {
        notasManager.reloadData();
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    notasManager = new NotasManager();
});
