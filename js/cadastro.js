// Sistema de Cadastro
const API_URL = 'http://localhost:5000/api';

class RegisterManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupMasks();
        this.setupCargoOptions();
    }

    setupCargoOptions() {
        const userType = sessionStorage.getItem('userType');
        const cargoSelect = document.getElementById('cargo');
        const indicator = document.getElementById('userTypeIndicator');
        
        // Limpar opções existentes (exceto a primeira)
        cargoSelect.innerHTML = '<option value="">Selecione seu cargo</option>';
        
        if (userType === 'admin') {
            // Cargos administrativos
            cargoSelect.innerHTML += `
                <option value="admin">Administrador</option>
                <option value="diretor">Diretor</option>
            `;
            
            // Mostrar indicador
            if (indicator) {
                indicator.style.display = 'block';
                indicator.style.background = '#fee2e2';
                indicator.style.color = '#dc2626';
                indicator.innerHTML = `
                    <strong>🔐 Cadastro Administrativo</strong><br>
                    <small>Você está criando uma conta com privilégios administrativos</small>
                `;
            }
        } else {
            // Cargos profissionais
            cargoSelect.innerHTML += `
                <option value="professor">Professor</option>
                <option value="coordenador">Coordenador</option>
                <option value="secretaria">Secretaria</option>
            `;
            
            // Mostrar indicador
            if (indicator) {
                indicator.style.display = 'block';
                indicator.style.background = '#dcfce7';
                indicator.style.color = '#16a34a';
                indicator.innerHTML = `
                    <strong>👨‍🏫 Cadastro Profissional</strong><br>
                    <small>Você está criando uma conta profissional</small>
                `;
            }
        }
    }

    setupEventListeners() {
        const registerForm = document.getElementById('registerForm');
        registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    setupMasks() {
        // Máscara para CPF
        const cpfInput = document.getElementById('cpf');
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            }
        });

        // Máscara para Telefone
        const telefoneInput = document.getElementById('telefone');
        telefoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            }
        });
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const cargo = document.getElementById('cargo').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validações
        if (!nome || !email || !cpf || !cargo || !password || !confirmPassword) {
            this.showAlert('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showAlert('As senhas não coincidem.', 'error');
            return;
        }

        if (password.length < 6) {
            this.showAlert('A senha deve ter no mínimo 6 caracteres.', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showAlert('Por favor, insira um e-mail válido.', 'error');
            return;
        }

        if (!this.validateCPF(cpf)) {
            this.showAlert('Por favor, insira um CPF válido.', 'error');
            return;
        }

        this.setLoading(true);

        try {
            let success = false;
            let errorMsg = '';

            // Verificar se temos banco local disponível
            if (window.localDB) {
                console.log('🏠 Usando banco local para cadastro');
                
                // Verificar se email já existe
                const usuarios = localDB.getAll('usuarios');
                const emailExiste = usuarios.find(u => u.email === email);
                const cpfExiste = usuarios.find(u => u.cpf === cpf);
                
                if (emailExiste) {
                    errorMsg = 'Este e-mail já está cadastrado no sistema.';
                } else if (cpfExiste) {
                    errorMsg = 'Este CPF já está cadastrado no sistema.';
                } else {
                    // Criar novo usuário
                    const novoUsuario = {
                        nome: nome,
                        email: email,
                        cpf: cpf,
                        telefone: telefone || '',
                        cargo: cargo,
                        senha: password,
                        status: 'ativo'
                    };
                    
                    localDB.create('usuarios', novoUsuario);
                    success = true;
                }
            } else {
                // Tentar API se banco local não estiver disponível
                try {
                    console.log('🌐 Tentando API do servidor para cadastro');
                    const response = await fetch(`${API_URL}/auth/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            nome: nome,
                            email: email,
                            cpf: cpf,
                            telefone: telefone,
                            cargo: cargo,
                            senha: password
                        })
                    });

                    const result = await response.json();
                    
                    if (response.ok) {
                        success = true;
                    } else {
                        errorMsg = result.error || 'Erro ao criar conta. Tente novamente.';
                    }
                } catch (apiError) {
                    console.log('❌ API não disponível');
                    errorMsg = 'Sistema offline. Não é possível criar conta no momento.';
                }
            }

            if (success) {
                this.showAlert('✅ Conta criada com sucesso! Redirecionando para o login...', 'success');
                
                // Redirecionar para login após 2 segundos
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                // Mensagem mais amigável para erros comuns
                if (errorMsg.includes('já está cadastrado')) {
                    this.showAlert('⚠️ ' + errorMsg, 'error');
                } else {
                    this.showAlert('❌ ' + errorMsg, 'error');
                }
            }
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            this.showAlert('❌ Erro inesperado. Tente novamente.', 'error');
        }

        this.setLoading(false);
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11) return false;
        
        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validação básica (pode ser melhorada)
        return true;
    }

    setLoading(loading) {
        const button = document.getElementById('registerButton');
        const buttonText = button.querySelector('.button-text');
        const buttonLoader = button.querySelector('.button-loader');

        if (loading) {
            button.disabled = true;
            buttonText.style.opacity = '0';
            buttonLoader.style.display = 'block';
        } else {
            button.disabled = false;
            buttonText.style.opacity = '1';
            buttonLoader.style.display = 'none';
        }
    }

    showAlert(message, type = 'info') {
        const container = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;

        const icon = this.getAlertIcon(type);
        alert.innerHTML = `
            ${icon}
            <span>${message}</span>
        `;

        container.appendChild(alert);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => {
                    container.removeChild(alert);
                }, 300);
            }
        }, 5000);
    }

    getAlertIcon(type) {
        const icons = {
            success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="10"/>
                      </svg>`,
            error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>`,
            warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>`
        };
        return icons[type] || icons.info;
    }
}

// Função global para toggle de senha
function togglePassword(fieldId) {
    const passwordInput = document.getElementById(fieldId);
    const button = event.currentTarget;
    const eyeIcon = button.querySelector('.eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        `;
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        `;
    }
}

// Add slideOut animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Initialize register manager
let registerManager;
document.addEventListener('DOMContentLoaded', () => {
    registerManager = new RegisterManager();
});
