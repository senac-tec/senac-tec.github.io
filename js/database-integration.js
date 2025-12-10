// Sistema de Integração com Banco de Dados - EducaGestaoDF
class DatabaseIntegration {
    constructor() {
        this.API_URL = "http://localhost:5000/api";
        this.isConnected = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        
        this.init();
    }

    async init() {
        console.log('🔌 Inicializando integração com banco de dados...');
        await this.checkConnection();
        this.setupGlobalErrorHandling();
        this.setupConnectionMonitoring();
    }

    async checkConnection() {
        try {
            const response = await fetch(`${this.API_URL}/stats`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                this.isConnected = true;
                console.log('✅ Conexão com banco de dados estabelecida');
                this.showConnectionStatus('connected');
                return true;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Erro na conexão com banco de dados:', error);
            this.isConnected = false;
            this.showConnectionStatus('disconnected');
            return false;
        }
    }

    async retryConnection() {
        for (let i = 0; i < this.retryAttempts; i++) {
            console.log(`🔄 Tentativa de reconexão ${i + 1}/${this.retryAttempts}...`);
            
            if (await this.checkConnection()) {
                return true;
            }
            
            if (i < this.retryAttempts - 1) {
                await this.delay(this.retryDelay * (i + 1));
            }
        }
        
        console.error('💥 Falha ao reconectar após múltiplas tentativas');
        return false;
    }

    setupGlobalErrorHandling() {
        // Interceptar erros de fetch globalmente
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                
                if (!response.ok && response.status >= 500) {
                    this.isConnected = false;
                    this.showConnectionStatus('error');
                }
                
                return response;
            } catch (error) {
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    this.isConnected = false;
                    this.showConnectionStatus('disconnected');
                    
                    // Tentar reconectar automaticamente
                    setTimeout(() => this.retryConnection(), 2000);
                }
                throw error;
            }
        };
    }

    setupConnectionMonitoring() {
        // Verificar conexão a cada 30 segundos
        setInterval(async () => {
            if (!this.isConnected) {
                await this.checkConnection();
            }
        }, 30000);
    }

    showConnectionStatus(status) {
        // Indicador visual removido - apenas log no console
        const messages = {
            connected: '✅ Banco conectado',
            disconnected: '❌ Banco desconectado',
            error: '⚠️ Erro no banco',
            reconnecting: '🔄 Reconectando...'
        };
        
        console.log(messages[status] || '❓ Status desconhecido');
    }

    createConnectionIndicator() {
        // Indicador visual removido - funcionalidade desabilitada
        return;
    }

    getStatusTooltip(status) {
        const tooltips = {
            connected: 'Banco de dados conectado e funcionando normalmente',
            disconnected: 'Sem conexão com o banco de dados. Verifique se o servidor está rodando.',
            error: 'Erro na comunicação com o banco de dados',
            reconnecting: 'Tentando reconectar com o banco de dados...'
        };
        return tooltips[status] || 'Status da conexão com banco de dados';
    }

    showConnectionDetails() {
        // Funcionalidade removida
        return;
    }

    // Métodos utilitários para as telas
    async safeApiCall(url, options = {}) {
        if (!this.isConnected) {
            const reconnected = await this.retryConnection();
            if (!reconnected) {
                throw new Error('Banco de dados indisponível');
            }
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na chamada da API:', error);
            throw error;
        }
    }

    // Métodos específicos para cada entidade
    async getAlunos(search = '') {
        const url = search ? 
            `${this.API_URL}/alunos?search=${encodeURIComponent(search)}` : 
            `${this.API_URL}/alunos`;
        return this.safeApiCall(url);
    }

    async getProfessores(search = '') {
        const url = search ? 
            `${this.API_URL}/professores?search=${encodeURIComponent(search)}` : 
            `${this.API_URL}/professores`;
        return this.safeApiCall(url);
    }

    async getTurmas(search = '') {
        const url = search ? 
            `${this.API_URL}/turmas?search=${encodeURIComponent(search)}` : 
            `${this.API_URL}/turmas`;
        return this.safeApiCall(url);
    }

    async getMatriculas() {
        return this.safeApiCall(`${this.API_URL}/matriculas`);
    }

    async getNotas() {
        return this.safeApiCall(`${this.API_URL}/notas`);
    }

    async getFrequencia(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? 
            `${this.API_URL}/frequencia?${queryString}` : 
            `${this.API_URL}/frequencia`;
        return this.safeApiCall(url);
    }

    async getEventos(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? 
            `${this.API_URL}/eventos?${queryString}` : 
            `${this.API_URL}/eventos`;
        return this.safeApiCall(url);
    }

    async getStats() {
        return this.safeApiCall(`${this.API_URL}/stats`);
    }

    // Métodos de criação
    async createAluno(data) {
        return this.safeApiCall(`${this.API_URL}/alunos`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async createProfessor(data) {
        return this.safeApiCall(`${this.API_URL}/professores`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async createTurma(data) {
        return this.safeApiCall(`${this.API_URL}/turmas`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async createEvento(data) {
        return this.safeApiCall(`${this.API_URL}/eventos`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Métodos de atualização
    async updateAluno(id, data) {
        return this.safeApiCall(`${this.API_URL}/alunos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async updateProfessor(id, data) {
        return this.safeApiCall(`${this.API_URL}/professores/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async updateTurma(id, data) {
        return this.safeApiCall(`${this.API_URL}/turmas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Métodos de exclusão
    async deleteAluno(id) {
        return this.safeApiCall(`${this.API_URL}/alunos/${id}`, {
            method: 'DELETE'
        });
    }

    async deleteProfessor(id) {
        return this.safeApiCall(`${this.API_URL}/professores/${id}`, {
            method: 'DELETE'
        });
    }

    async deleteTurma(id) {
        return this.safeApiCall(`${this.API_URL}/turmas/${id}`, {
            method: 'DELETE'
        });
    }

    // Utilitários
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR');
    }

    formatDateTime(date) {
        return new Date(date).toLocaleString('pt-BR');
    }

    // Validações
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(10))) return false;

        return true;
    }

    // Notificações
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease-out;
        `;

        const colors = {
            success: { bg: 'rgba(16, 185, 129, 0.9)', color: 'white' },
            error: { bg: 'rgba(239, 68, 68, 0.9)', color: 'white' },
            warning: { bg: 'rgba(245, 158, 11, 0.9)', color: 'white' },
            info: { bg: 'rgba(59, 130, 246, 0.9)', color: 'white' }
        };

        const style = colors[type] || colors.info;
        notification.style.background = style.bg;
        notification.style.color = style.color;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Instância global
window.dbIntegration = new DatabaseIntegration();

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseIntegration;
}

console.log('🚀 Sistema de integração com banco de dados carregado!');