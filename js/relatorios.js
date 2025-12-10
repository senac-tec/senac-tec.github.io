// Sistema de Relatórios e Analytics - EducaGestaoDF
class RelatoriosManager {
    constructor() {
        this.API_URL = "http://localhost:5000/api";
        this.charts = {};
        this.currentPeriod = 'current';
        this.data = {
            notas: [],
            frequencia: [],
            matriculas: [],
            turmas: []
        };
        
        this.init();
    }

    async init() {
        console.log('Inicializando sistema de relatórios...');
        this.showLoading();
        
        try {
            await this.loadAllData();
            this.initializeCharts();
            this.updateKPIs();
            this.updateAnalysis();
            this.hideLoading();
        } catch (error) {
            console.error('Erro ao inicializar relatórios:', error);
            this.hideLoading();
            this.showError('Erro ao carregar dados dos relatórios');
        }
    }

    async loadAllData() {
        try {
            // Carregar dados das APIs reais
            const [notasRes, frequenciaRes, matriculasRes, turmasRes, statsRes] = await Promise.all([
                fetch(`${this.API_URL}/notas`).catch(() => ({ ok: false })),
                fetch(`${this.API_URL}/frequencia`).catch(() => ({ ok: false })),
                fetch(`${this.API_URL}/matriculas`).catch(() => ({ ok: false })),
                fetch(`${this.API_URL}/turmas`).catch(() => ({ ok: false })),
                fetch(`${this.API_URL}/relatorios/estatisticas`).catch(() => ({ ok: false }))
            ]);

            // Carregar dados reais se disponíveis
            if (notasRes.ok) {
                this.data.notas = await notasRes.json();
            }
            if (frequenciaRes.ok) {
                this.data.frequencia = await frequenciaRes.json();
            }
            if (matriculasRes.ok) {
                this.data.matriculas = await matriculasRes.json();
            }
            if (turmasRes.ok) {
                this.data.turmas = await turmasRes.json();
            }
            if (statsRes.ok) {
                this.data.estatisticas = await statsRes.json();
            }

            // Se não conseguir carregar dados reais, usar simulados
            if (this.data.notas.length === 0) {
                this.generateSampleData();
            }
            
            console.log('Dados carregados:', {
                notas: this.data.notas.length,
                frequencia: this.data.frequencia.length,
                matriculas: this.data.matriculas.length,
                turmas: this.data.turmas.length
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.generateSampleData(); // Fallback para dados simulados
        }
    }

    generateSampleData() {
        // Gerar dados de notas simulados
        const disciplinas = ['Matemática', 'Português', 'História', 'Geografia', 'Ciências', 'Inglês', 'Educação Física', 'Artes'];
        const alunos = [
            'Ana Silva', 'Bruno Santos', 'Carlos Oliveira', 'Diana Costa', 'Eduardo Lima',
            'Fernanda Souza', 'Gabriel Pereira', 'Helena Rodrigues', 'Igor Almeida', 'Julia Ferreira',
            'Kevin Barbosa', 'Larissa Martins', 'Marcos Ribeiro', 'Natália Carvalho', 'Otávio Nascimento',
            'Patrícia Gomes', 'Quintino Dias', 'Rafaela Moreira', 'Samuel Teixeira', 'Tatiana Vieira'
        ];
        const turmas = ['9º Ano A', '9º Ano B', '8º Ano A', '8º Ano B', '7º Ano A', '7º Ano B'];

        this.data.notas = [];
        this.data.frequencia = [];

        let notaId = 1;
        let freqId = 1;

        alunos.forEach((aluno, alunoIndex) => {
            const turma = turmas[alunoIndex % turmas.length];
            
            disciplinas.forEach(disciplina => {
                for (let bimestre = 1; bimestre <= 4; bimestre++) {
                    // Gerar nota com tendência baseada no aluno
                    const baseScore = 5 + (alunoIndex % 6); // Varia de 5 a 10
                    const variation = (Math.random() - 0.5) * 2; // ±1
                    const nota = Math.max(0, Math.min(10, baseScore + variation));

                    this.data.notas.push({
                        id: notaId++,
                        aluno_nome: aluno,
                        turma_nome: turma,
                        disciplina: disciplina,
                        nota: parseFloat(nota.toFixed(1)),
                        bimestre: bimestre,
                        created_at: new Date(2025, bimestre - 1, Math.floor(Math.random() * 28) + 1).toISOString()
                    });
                }
            });

            // Gerar dados de frequência
            for (let dia = 1; dia <= 30; dia++) {
                const presente = Math.random() > 0.1; // 90% de presença base
                this.data.frequencia.push({
                    id: freqId++,
                    aluno_nome: aluno,
                    turma_nome: turma,
                    data: new Date(2025, 10, dia).toISOString().split('T')[0],
                    presente: presente ? 1 : 0
                });
            }
        });
    }

    initializeCharts() {
        this.createDisciplinasChart();
        this.createEvolucaoChart();
        this.createDistribuicaoChart();
        this.createFrequenciaChart();
        
        // Gráficos avançados
        this.createComparacaoChart();
        this.createHeatmapChart();
        this.createTendenciasChart();
        this.createCorrelacaoChart();
        this.createIdadeChart();
        this.createProgressaoChart();
        
        // Popular seletor de alunos
        this.populateStudentSelector();
    }

    createDisciplinasChart() {
        const ctx = document.getElementById('disciplinasChart').getContext('2d');
        
        // Calcular médias por disciplina
        const disciplinas = [...new Set(this.data.notas.map(n => n.disciplina))];
        const medias = disciplinas.map(disciplina => {
            const notasDisciplina = this.data.notas.filter(n => n.disciplina === disciplina);
            const media = notasDisciplina.reduce((sum, n) => sum + n.nota, 0) / notasDisciplina.length;
            return parseFloat(media.toFixed(1));
        });

        this.charts.disciplinas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: disciplinas,
                datasets: [{
                    label: 'Média da Disciplina',
                    data: medias,
                    backgroundColor: disciplinas.map((_, index) => {
                        const colors = [
                            'rgba(79, 70, 229, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(236, 72, 153, 0.8)',
                            'rgba(34, 197, 94, 0.8)',
                            'rgba(251, 146, 60, 0.8)'
                        ];
                        return colors[index % colors.length];
                    }),
                    borderColor: disciplinas.map((_, index) => {
                        const colors = [
                            'rgba(79, 70, 229, 1)',
                            'rgba(16, 185, 129, 1)',
                            'rgba(245, 158, 11, 1)',
                            'rgba(239, 68, 68, 1)',
                            'rgba(139, 92, 246, 1)',
                            'rgba(236, 72, 153, 1)',
                            'rgba(34, 197, 94, 1)',
                            'rgba(251, 146, 60, 1)'
                        ];
                        return colors[index % colors.length];
                    }),
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `Média: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280',
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }

    createEvolucaoChart() {
        const ctx = document.getElementById('evolucaoChart').getContext('2d');
        
        // Calcular evolução por bimestre
        const bimestres = [1, 2, 3, 4];
        const mediasPorBimestre = bimestres.map(bimestre => {
            const notasBimestre = this.data.notas.filter(n => n.bimestre === bimestre);
            const media = notasBimestre.reduce((sum, n) => sum + n.nota, 0) / notasBimestre.length;
            return parseFloat(media.toFixed(1));
        });

        // Calcular por algumas disciplinas principais
        const disciplinasPrincipais = ['Matemática', 'Português', 'História', 'Ciências'];
        const datasets = disciplinasPrincipais.map((disciplina, index) => {
            const colors = [
                'rgba(79, 70, 229, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(239, 68, 68, 1)'
            ];
            
            const medias = bimestres.map(bimestre => {
                const notas = this.data.notas.filter(n => n.disciplina === disciplina && n.bimestre === bimestre);
                const media = notas.reduce((sum, n) => sum + n.nota, 0) / notas.length;
                return parseFloat(media.toFixed(1));
            });

            return {
                label: disciplina,
                data: medias,
                borderColor: colors[index],
                backgroundColor: colors[index].replace('1)', '0.1)'),
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: colors[index],
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            };
        });

        this.charts.evolucao = new Chart(ctx, {
            type: 'line',
            data: {
                labels: bimestres.map(b => `${b}º Bimestre`),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            color: '#374151'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    }
                }
            }
        });
    }

    createDistribuicaoChart() {
        const ctx = document.getElementById('distribuicaoChart').getContext('2d');
        
        // Calcular distribuição de notas
        const aprovados = this.data.notas.filter(n => n.nota >= 7).length;
        const recuperacao = this.data.notas.filter(n => n.nota >= 5 && n.nota < 7).length;
        const reprovados = this.data.notas.filter(n => n.nota < 5).length;

        this.charts.distribuicao = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Aprovados (≥7.0)', 'Recuperação (5.0-6.9)', 'Reprovados (<5.0)'],
                datasets: [{
                    data: [aprovados, recuperacao, reprovados],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)'
                    ],
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: '#374151'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed * 100) / total).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    createFrequenciaChart() {
        const ctx = document.getElementById('frequenciaChart').getContext('2d');
        
        // Calcular frequência por turma
        const turmas = [...new Set(this.data.frequencia.map(f => f.turma_nome))];
        const frequenciaPorTurma = turmas.map(turma => {
            const registrosTurma = this.data.frequencia.filter(f => f.turma_nome === turma);
            const presencas = registrosTurma.filter(f => f.presente === 1).length;
            const total = registrosTurma.length;
            return total > 0 ? parseFloat(((presencas / total) * 100).toFixed(1)) : 0;
        });

        this.charts.frequencia = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: turmas,
                datasets: [{
                    label: 'Taxa de Presença (%)',
                    data: frequenciaPorTurma,
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(79, 70, 229, 1)',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `Presença: ${context.parsed.r}%`;
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6b7280',
                            backdropColor: 'transparent'
                        },
                        pointLabels: {
                            color: '#374151',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    async updateKPIs() {
        try {
            // Usar dados das estatísticas da API se disponível
            if (this.data.estatisticas) {
                document.getElementById('mediaGeralKPI').textContent = this.data.estatisticas.notas.media_geral;
                document.getElementById('alunosAtivosKPI').textContent = this.data.estatisticas.geral.total_alunos;
                document.getElementById('frequenciaKPI').textContent = `${this.data.estatisticas.frequencia.taxa_presenca}%`;
                
                const totalNotas = this.data.estatisticas.notas.total_notas;
                const aprovados = this.data.estatisticas.notas.aprovados;
                const taxaAprovacao = totalNotas > 0 ? ((aprovados / totalNotas) * 100).toFixed(1) : 0;
                document.getElementById('aprovacaoKPI').textContent = `${taxaAprovacao}%`;
            } else {
                // Fallback para cálculo local
                const mediaGeral = this.data.notas.length > 0 ? 
                    (this.data.notas.reduce((sum, n) => sum + n.nota, 0) / this.data.notas.length).toFixed(1) : 0;
                
                const alunosAtivos = new Set(this.data.notas.map(n => n.aluno_nome)).size;
                
                const totalRegistrosFreq = this.data.frequencia.length;
                const presencas = this.data.frequencia.filter(f => f.presente === 1).length;
                const frequenciaMedia = totalRegistrosFreq > 0 ? 
                    ((presencas / totalRegistrosFreq) * 100).toFixed(1) : 0;
                
                const aprovados = this.data.notas.filter(n => n.nota >= 7).length;
                const totalNotas = this.data.notas.length;
                const taxaAprovacao = totalNotas > 0 ? 
                    ((aprovados / totalNotas) * 100).toFixed(1) : 0;

                document.getElementById('mediaGeralKPI').textContent = mediaGeral;
                document.getElementById('alunosAtivosKPI').textContent = alunosAtivos;
                document.getElementById('frequenciaKPI').textContent = `${frequenciaMedia}%`;
                document.getElementById('aprovacaoKPI').textContent = `${taxaAprovacao}%`;
            }
        } catch (error) {
            console.error('Erro ao atualizar KPIs:', error);
        }
    }

    updateAnalysis() {
        this.updateTopPerformers();
        this.updateRiskStudents();
        this.updateCriticalSubjects();
        this.updateHighlightClasses();
    }

    updateTopPerformers() {
        // Calcular médias por aluno
        const alunos = [...new Set(this.data.notas.map(n => n.aluno_nome))];
        const alunosComMedia = alunos.map(aluno => {
            const notasAluno = this.data.notas.filter(n => n.aluno_nome === aluno);
            const media = notasAluno.reduce((sum, n) => sum + n.nota, 0) / notasAluno.length;
            const turma = notasAluno[0]?.turma_nome || '';
            return {
                nome: aluno,
                turma: turma,
                media: parseFloat(media.toFixed(1))
            };
        });

        // Top 10 performers
        const topPerformers = alunosComMedia
            .sort((a, b) => b.media - a.media)
            .slice(0, 10);

        const container = document.getElementById('topPerformersList');
        container.innerHTML = topPerformers.map(aluno => `
            <div class="performer-item">
                <div class="performer-info">
                    <div class="performer-name">${aluno.nome}</div>
                    <div class="performer-details">${aluno.turma}</div>
                </div>
                <div class="performer-score score-high">${aluno.media}</div>
            </div>
        `).join('');

        document.getElementById('topPerformersCount').textContent = topPerformers.length;
    }

    updateRiskStudents() {
        // Alunos com média < 5.0
        const alunos = [...new Set(this.data.notas.map(n => n.aluno_nome))];
        const alunosEmRisco = alunos.map(aluno => {
            const notasAluno = this.data.notas.filter(n => n.aluno_nome === aluno);
            const media = notasAluno.reduce((sum, n) => sum + n.nota, 0) / notasAluno.length;
            const turma = notasAluno[0]?.turma_nome || '';
            return {
                nome: aluno,
                turma: turma,
                media: parseFloat(media.toFixed(1))
            };
        }).filter(aluno => aluno.media < 5.0)
          .sort((a, b) => a.media - b.media);

        const container = document.getElementById('riskStudentsList');
        container.innerHTML = alunosEmRisco.map(aluno => `
            <div class="performer-item">
                <div class="performer-info">
                    <div class="performer-name">${aluno.nome}</div>
                    <div class="performer-details">${aluno.turma}</div>
                </div>
                <div class="performer-score score-low">${aluno.media}</div>
            </div>
        `).join('');

        document.getElementById('riskStudentsCount').textContent = alunosEmRisco.length;
    }

    updateCriticalSubjects() {
        // Disciplinas com média < 6.0
        const disciplinas = [...new Set(this.data.notas.map(n => n.disciplina))];
        const disciplinasCriticas = disciplinas.map(disciplina => {
            const notasDisciplina = this.data.notas.filter(n => n.disciplina === disciplina);
            const media = notasDisciplina.reduce((sum, n) => sum + n.nota, 0) / notasDisciplina.length;
            const reprovados = notasDisciplina.filter(n => n.nota < 5).length;
            return {
                nome: disciplina,
                media: parseFloat(media.toFixed(1)),
                reprovados: reprovados
            };
        }).filter(disciplina => disciplina.media < 6.0)
          .sort((a, b) => a.media - b.media);

        const container = document.getElementById('criticalSubjectsList');
        container.innerHTML = disciplinasCriticas.map(disciplina => `
            <div class="subject-item">
                <div class="subject-info">
                    <div class="subject-name">${disciplina.nome}</div>
                    <div class="subject-details">${disciplina.reprovados} alunos com nota < 5.0</div>
                </div>
                <div class="subject-score score-low">${disciplina.media}</div>
            </div>
        `).join('');

        document.getElementById('criticalSubjectsCount').textContent = disciplinasCriticas.length;
    }

    updateHighlightClasses() {
        // Turmas com melhor desempenho
        const turmas = [...new Set(this.data.notas.map(n => n.turma_nome))];
        const turmasDestaque = turmas.map(turma => {
            const notasTurma = this.data.notas.filter(n => n.turma_nome === turma);
            const media = notasTurma.reduce((sum, n) => sum + n.nota, 0) / notasTurma.length;
            const aprovados = notasTurma.filter(n => n.nota >= 7).length;
            const total = new Set(notasTurma.map(n => n.aluno_nome)).size;
            return {
                nome: turma,
                media: parseFloat(media.toFixed(1)),
                aprovados: aprovados,
                total: total
            };
        }).filter(turma => turma.media >= 7.0)
          .sort((a, b) => b.media - a.media);

        const container = document.getElementById('highlightClassesList');
        container.innerHTML = turmasDestaque.map(turma => `
            <div class="class-item">
                <div class="class-info">
                    <div class="class-name">${turma.nome}</div>
                    <div class="class-details">${turma.aprovados}/${turma.total} alunos aprovados</div>
                </div>
                <div class="class-score score-high">${turma.media}</div>
            </div>
        `).join('');

        document.getElementById('highlightClassesCount').textContent = turmasDestaque.length;
    }

    changePeriod(period) {
        // Atualizar tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');

        // Mostrar/ocultar período customizado
        const customPeriod = document.getElementById('customPeriod');
        if (period === 'custom') {
            customPeriod.style.display = 'block';
        } else {
            customPeriod.style.display = 'none';
            this.currentPeriod = period;
            this.refreshReports();
        }
    }

    applyCustomPeriod() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!startDate || !endDate) {
            alert('Por favor, selecione as datas de início e fim');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert('A data de início deve ser anterior à data de fim');
            return;
        }

        this.currentPeriod = 'custom';
        this.customStartDate = startDate;
        this.customEndDate = endDate;
        this.refreshReports();
    }

    async refreshReports() {
        this.showLoading();
        
        try {
            await this.loadAllData();
            
            // Destruir gráficos existentes
            Object.values(this.charts).forEach(chart => {
                if (chart) chart.destroy();
            });
            
            this.initializeCharts();
            this.updateKPIs();
            this.updateAnalysis();
            
            this.hideLoading();
        } catch (error) {
            console.error('Erro ao atualizar relatórios:', error);
            this.hideLoading();
        }
    }

    exportChart(chartId) {
        const chart = this.charts[chartId.replace('Chart', '')];
        if (!chart) return;

        const url = chart.toBase64Image();
        const link = document.createElement('a');
        link.download = `${chartId}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = url;
        link.click();
    }

    generateReport(type) {
        this.showLoading();

        setTimeout(() => {
            let reportData = '';
            const timestamp = new Date().toISOString().split('T')[0];

            switch (type) {
                case 'boletim':
                    reportData = this.generateBoletimReport();
                    this.downloadCSV(reportData, `boletim_escolar_${timestamp}.csv`);
                    break;
                case 'frequencia':
                    reportData = this.generateFrequenciaReport();
                    this.downloadCSV(reportData, `relatorio_frequencia_${timestamp}.csv`);
                    break;
                case 'desempenho':
                    reportData = this.generateDesempenhoReport();
                    this.downloadCSV(reportData, `analise_desempenho_${timestamp}.csv`);
                    break;
                case 'comparativo':
                    reportData = this.generateComparativoReport();
                    this.downloadCSV(reportData, `relatorio_comparativo_${timestamp}.csv`);
                    break;
            }

            this.hideLoading();
        }, 1500);
    }

    generateBoletimReport() {
        const headers = ['Aluno', 'Turma', 'Disciplina', 'Bimestre', 'Nota', 'Status'];
        const rows = this.data.notas.map(nota => [
            `"${nota.aluno_nome}"`,
            `"${nota.turma_nome}"`,
            `"${nota.disciplina}"`,
            nota.bimestre,
            nota.nota,
            `"${this.getNotaStatus(nota.nota)}"`
        ]);

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    generateFrequenciaReport() {
        const headers = ['Aluno', 'Turma', 'Data', 'Presente', 'Status'];
        const rows = this.data.frequencia.map(freq => [
            `"${freq.aluno_nome}"`,
            `"${freq.turma_nome}"`,
            freq.data,
            freq.presente ? 'Sim' : 'Não',
            `"${freq.presente ? 'Presente' : 'Ausente'}"`
        ]);

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    generateDesempenhoReport() {
        const disciplinas = [...new Set(this.data.notas.map(n => n.disciplina))];
        const headers = ['Disciplina', 'Média', 'Aprovados', 'Recuperação', 'Reprovados', 'Total'];
        
        const rows = disciplinas.map(disciplina => {
            const notas = this.data.notas.filter(n => n.disciplina === disciplina);
            const media = (notas.reduce((sum, n) => sum + n.nota, 0) / notas.length).toFixed(1);
            const aprovados = notas.filter(n => n.nota >= 7).length;
            const recuperacao = notas.filter(n => n.nota >= 5 && n.nota < 7).length;
            const reprovados = notas.filter(n => n.nota < 5).length;
            
            return [
                `"${disciplina}"`,
                media,
                aprovados,
                recuperacao,
                reprovados,
                notas.length
            ];
        });

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    generateComparativoReport() {
        const bimestres = [1, 2, 3, 4];
        const headers = ['Bimestre', 'Média Geral', 'Aprovados', 'Recuperação', 'Reprovados'];
        
        const rows = bimestres.map(bimestre => {
            const notas = this.data.notas.filter(n => n.bimestre === bimestre);
            const media = notas.length > 0 ? (notas.reduce((sum, n) => sum + n.nota, 0) / notas.length).toFixed(1) : 0;
            const aprovados = notas.filter(n => n.nota >= 7).length;
            const recuperacao = notas.filter(n => n.nota >= 5 && n.nota < 7).length;
            const reprovados = notas.filter(n => n.nota < 5).length;
            
            return [
                `"${bimestre}º Bimestre"`,
                media,
                aprovados,
                recuperacao,
                reprovados
            ];
        });

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    exportAllReports() {
        this.showLoading();

        setTimeout(() => {
            const timestamp = new Date().toISOString().split('T')[0];
            
            // Gerar todos os relatórios
            const reports = [
                { data: this.generateBoletimReport(), name: `boletim_escolar_${timestamp}.csv` },
                { data: this.generateFrequenciaReport(), name: `relatorio_frequencia_${timestamp}.csv` },
                { data: this.generateDesempenhoReport(), name: `analise_desempenho_${timestamp}.csv` },
                { data: this.generateComparativoReport(), name: `relatorio_comparativo_${timestamp}.csv` }
            ];

            // Download de cada relatório
            reports.forEach((report, index) => {
                setTimeout(() => {
                    this.downloadCSV(report.data, report.name);
                }, index * 500);
            });

            this.hideLoading();
        }, 2000);
    }

    getNotaStatus(nota) {
        if (nota >= 7) return 'Aprovado';
        if (nota >= 5) return 'Recuperação';
        return 'Reprovado';
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    createComparacaoChart() {
        const ctx = document.getElementById('comparacaoChart').getContext('2d');
        
        const turmas = [...new Set(this.data.notas.map(n => n.turma_nome))];
        const disciplinas = ['Matemática', 'Português', 'História', 'Ciências'];
        
        const datasets = disciplinas.map((disciplina, index) => {
            const colors = [
                'rgba(79, 70, 229, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)'
            ];
            
            const data = turmas.map(turma => {
                const notas = this.data.notas.filter(n => n.turma_nome === turma && n.disciplina === disciplina);
                return notas.length > 0 ? 
                    parseFloat((notas.reduce((sum, n) => sum + n.nota, 0) / notas.length).toFixed(1)) : 0;
            });

            return {
                label: disciplina,
                data: data,
                backgroundColor: colors[index],
                borderColor: colors[index].replace('0.8', '1'),
                borderWidth: 2,
                borderRadius: 4
            };
        });

        this.charts.comparacao = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: turmas,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    createHeatmapChart() {
        const ctx = document.getElementById('heatmapChart').getContext('2d');
        
        const disciplinas = [...new Set(this.data.notas.map(n => n.disciplina))];
        const bimestres = [1, 2, 3, 4];
        
        // Criar dados para heatmap (simulado como scatter)
        const data = [];
        disciplinas.forEach((disciplina, discIndex) => {
            bimestres.forEach((bimestre, bimIndex) => {
                const notas = this.data.notas.filter(n => n.disciplina === disciplina && n.bimestre === bimestre);
                const media = notas.length > 0 ? 
                    notas.reduce((sum, n) => sum + n.nota, 0) / notas.length : 0;
                
                data.push({
                    x: bimIndex,
                    y: discIndex,
                    v: media
                });
            });
        });

        this.charts.heatmap = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Média por Disciplina/Bimestre',
                    data: data,
                    backgroundColor: data.map(point => {
                        const intensity = point.v / 10;
                        if (intensity >= 0.7) return 'rgba(16, 185, 129, 0.8)';
                        if (intensity >= 0.5) return 'rgba(245, 158, 11, 0.8)';
                        return 'rgba(239, 68, 68, 0.8)';
                    }),
                    borderColor: 'white',
                    borderWidth: 2,
                    pointRadius: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: () => '',
                            label: (context) => {
                                const point = context.raw;
                                return `${disciplinas[point.y]} - ${point.x + 1}º Bim: ${point.v.toFixed(1)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: -0.5,
                        max: 3.5,
                        ticks: {
                            stepSize: 1,
                            callback: (value) => `${value + 1}º Bim`
                        },
                        title: {
                            display: true,
                            text: 'Bimestres'
                        }
                    },
                    y: {
                        type: 'linear',
                        min: -0.5,
                        max: disciplinas.length - 0.5,
                        ticks: {
                            stepSize: 1,
                            callback: (value) => disciplinas[value] || ''
                        },
                        title: {
                            display: true,
                            text: 'Disciplinas'
                        }
                    }
                }
            }
        });
    }

    createTendenciasChart() {
        const ctx = document.getElementById('tendenciasChart').getContext('2d');
        
        // Simular dados mensais
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const mediasMensais = meses.map(() => 6 + Math.random() * 3);
        const frequenciaMensal = meses.map(() => 85 + Math.random() * 10);

        this.charts.tendencias = new Chart(ctx, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Média das Notas',
                    data: mediasMensais,
                    borderColor: 'rgba(79, 70, 229, 1)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                }, {
                    label: 'Frequência (%)',
                    data: frequenciaMensal,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        min: 0,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Média das Notas'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: 0,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Frequência (%)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    createCorrelacaoChart() {
        const ctx = document.getElementById('correlacaoChart').getContext('2d');
        
        // Calcular correlação entre notas e frequência por aluno
        const alunos = [...new Set(this.data.notas.map(n => n.aluno_nome))];
        const correlationData = alunos.map(aluno => {
            const notasAluno = this.data.notas.filter(n => n.aluno_nome === aluno);
            const freqAluno = this.data.frequencia.filter(f => f.aluno_nome === aluno);
            
            const mediaNota = notasAluno.reduce((sum, n) => sum + n.nota, 0) / notasAluno.length;
            const mediaFreq = freqAluno.reduce((sum, f) => sum + f.presente, 0) / freqAluno.length * 100;
            
            return {
                x: mediaFreq,
                y: mediaNota,
                aluno: aluno
            };
        });

        this.charts.correlacao = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Alunos',
                    data: correlationData,
                    backgroundColor: 'rgba(79, 70, 229, 0.6)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => context[0].raw.aluno,
                            label: (context) => {
                                const point = context.raw;
                                return [`Frequência: ${point.x.toFixed(1)}%`, `Nota: ${point.y.toFixed(1)}`];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Frequência (%)'
                        },
                        min: 0,
                        max: 100
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Média das Notas'
                        },
                        min: 0,
                        max: 10
                    }
                }
            }
        });
    }

    createIdadeChart() {
        const ctx = document.getElementById('idadeChart').getContext('2d');
        
        // Simular dados por faixa etária
        const faixasEtarias = ['12-13 anos', '13-14 anos', '14-15 anos', '15-16 anos', '16+ anos'];
        const mediasIdade = faixasEtarias.map(() => 6 + Math.random() * 3);

        this.charts.idade = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: faixasEtarias,
                datasets: [{
                    data: mediasIdade,
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: [
                        'rgba(79, 70, 229, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(139, 92, 246, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }

    createProgressaoChart() {
        const ctx = document.getElementById('progressaoChart').getContext('2d');
        
        // Gráfico vazio inicialmente
        this.charts.progressao = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1º Bim', '2º Bim', '3º Bim', '4º Bim'],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }

    populateStudentSelector() {
        const selector = document.getElementById('studentSelector');
        const alunos = [...new Set(this.data.notas.map(n => n.aluno_nome))].sort();
        
        selector.innerHTML = '<option value="">Selecione um aluno</option>';
        alunos.forEach(aluno => {
            const option = document.createElement('option');
            option.value = aluno;
            option.textContent = aluno;
            selector.appendChild(option);
        });
    }

    updateProgressaoChart() {
        const alunoSelecionado = document.getElementById('studentSelector').value;
        if (!alunoSelecionado) return;

        const notasAluno = this.data.notas.filter(n => n.aluno_nome === alunoSelecionado);
        const disciplinas = [...new Set(notasAluno.map(n => n.disciplina))];
        
        const datasets = disciplinas.slice(0, 4).map((disciplina, index) => {
            const colors = [
                'rgba(79, 70, 229, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(239, 68, 68, 1)'
            ];
            
            const notas = [1, 2, 3, 4].map(bimestre => {
                const nota = notasAluno.find(n => n.disciplina === disciplina && n.bimestre === bimestre);
                return nota ? nota.nota : 0;
            });

            return {
                label: disciplina,
                data: notas,
                borderColor: colors[index],
                backgroundColor: colors[index].replace('1)', '0.1)'),
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8
            };
        });

        this.charts.progressao.data.datasets = datasets;
        this.charts.progressao.update();
    }

    updateAdvancedCharts() {
        const filter = document.getElementById('advancedFilter').value;
        // Implementar filtros específicos para gráficos avançados
        console.log('Filtro aplicado:', filter);
        
        // Recriar gráficos com filtro
        if (this.charts.comparacao) {
            this.charts.comparacao.destroy();
            this.createComparacaoChart();
        }
    }

    toggleChartType(chartId) {
        const chart = this.charts[chartId.replace('Chart', '')];
        if (!chart) return;

        // Alternar entre tipos de gráfico
        const currentType = chart.config.type;
        const newType = currentType === 'bar' ? 'line' : 'bar';
        
        chart.config.type = newType;
        chart.update();
    }

    showError(message) {
        console.error(message);
        // Implementar sistema de notificações
        alert(message);
    }
}

// Funções globais
let relatoriosManager;

function changePeriod(period) {
    relatoriosManager.changePeriod(period);
}

function applyCustomPeriod() {
    relatoriosManager.applyCustomPeriod();
}

function refreshReports() {
    relatoriosManager.refreshReports();
}

function exportChart(chartId) {
    relatoriosManager.exportChart(chartId);
}

function generateReport(type) {
    relatoriosManager.generateReport(type);
}

function exportAllReports() {
    relatoriosManager.exportAllReports();
}

function updateAdvancedCharts() {
    relatoriosManager.updateAdvancedCharts();
}

function updateProgressaoChart() {
    relatoriosManager.updateProgressaoChart();
}

function toggleChartType(chartId) {
    relatoriosManager.toggleChartType(chartId);
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    relatoriosManager = new RelatoriosManager();
});