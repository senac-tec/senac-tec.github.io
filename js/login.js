// Login System
class LoginManager {
    constructor() {
        this.users = {
            'admin@escola.com': {
                password: 'admin123',
                role: 'admin',
                name: 'Administrador',
                permissions: ['all']
            },
            'professor@escola.com': {
                password: 'prof123',
                role: 'professor',
                name: 'Professor Silva',
                permissions: ['turmas', 'alunos', 'notas', 'calendario']
            },
            'secretaria@escola.com': {
                password: 'sec123',
                role: 'secretaria',
                name: 'Secretária Ana',
                permissions: ['alunos', 'professores', 'turmas', 'matriculas']
            }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
        this.showAccessTypeIndicator();
    }

    showAccessTypeIndicator() {
        const userType = sessionStorage.getItem('userType');
        const indicator = document.getElementById('accessTypeIndicator');
        
        if (userType && indicator) {
            indicator.style.display = 'block';
            
            if (userType === 'admin') {
                indicator.style.background = '#fee2e2';
                indicator.style.color = '#dc2626';
                indicator.innerHTML = `
                    <strong>🔐 Acesso Administrativo</strong><br>
                    <small>Use suas credenciais de administrador</small>
                `;
            } else {
                indicator.style.background = '#dcfce7';
                indicator.style.color = '#16a34a';
                indicator.innerHTML = `
                    <strong>👨‍🏫 Acesso Profissional</strong><br>
                    <small>Use suas credenciais de professor, coordenador ou secretaria</small>
                `;
            }
        }
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        // Enter key on password field
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin(e);
            }
        });
    }

    checkExistingSession() {
        const session = localStorage.getItem('educagestao_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                if (sessionData.expires > Date.now()) {
                    // Valid session exists, redirect to dashboard
                    this.redirectToDashboard();
                    return;
                }
            } catch (error) {
                console.error('Invalid session data:', error);
            }
            // Clear invalid session
            localStorage.removeItem('educagestao_session');
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        if (!email || !password) {
            this.showAlert('Por favor, preencha todos os campos.', 'error');
            return;
        }

        this.setLoading(true);

        try {
            let result;
            let response = { ok: false };

            // Verificar se temos banco local disponível
            if (window.localDB) {
                console.log('🏠 Usando banco local para autenticação');
                // Usar banco local diretamente
                const usuarios = localDB.getAll('usuarios');
                const usuario = usuarios.find(u => u.email === email && u.senha === password && u.status === 'ativo');
                
                if (usuario) {
                    result = {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email,
                        cargo: usuario.cargo
                    };
                    response = { ok: true };
                } else {
                    result = { error: 'E-mail ou senha incorretos' };
                    response = { ok: false };
                }
            } else {
                // Tentar API se banco local não estiver disponível
                try {
                    console.log('🌐 Tentando API do servidor');
                    response = await fetch('http://localhost:5000/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    });
                    result = await response.json();
                } catch (apiError) {
                    console.log('❌ API não disponível, usando fallback');
                    response = { ok: false };
                }
            }

            // Se API não funcionou, usar autenticação local
            if (!response.ok) {
                // Verificar no banco local
                if (window.localDB) {
                    const usuarios = localDB.getAll('usuarios');
                    const usuario = usuarios.find(u => u.email === email && u.senha === password && u.status === 'ativo');
                    
                    if (usuario) {
                        result = {
                            id: usuario.id,
                            nome: usuario.nome,
                            email: usuario.email,
                            cargo: usuario.cargo
                        };
                        response = { ok: true };
                    } else {
                        result = { error: 'E-mail ou senha incorretos' };
                    }
                } else {
                    // Fallback para usuários hardcoded
                    if (this.validateCredentials(email, password)) {
                        const user = this.users[email];
                        result = {
                            id: 1,
                            nome: user.name,
                            email: email,
                            cargo: user.role
                        };
                        response = { ok: true };
                    } else {
                        result = { error: 'E-mail ou senha incorretos' };
                    }
                }
            }

            if (response.ok) {
                // Verificar se o tipo selecionado corresponde ao cargo
                const userType = sessionStorage.getItem('userType');
                const isAdmin = result.cargo === 'admin' || result.cargo === 'diretor';
                const isProfessional = result.cargo === 'professor' || result.cargo === 'coordenador' || result.cargo === 'secretaria';
                
                // Validar correspondência
                if (userType === 'admin' && !isAdmin) {
                    this.showAlert(`Você selecionou "Administrador" mas sua conta é de ${result.cargo}. Por favor, selecione "Profissional".`, 'error');
                    setTimeout(() => {
                        window.location.href = 'selecao-tipo.html';
                    }, 3000);
                    return;
                }
                
                if (userType === 'professional' && !isProfessional) {
                    this.showAlert(`Você selecionou "Profissional" mas sua conta é de ${result.cargo}. Por favor, selecione "Administrador".`, 'error');
                    setTimeout(() => {
                        window.location.href = 'selecao-tipo.html';
                    }, 3000);
                    return;
                }
                
                // Create session with real user data
                const user = {
                    id: result.id,
                    nome: result.nome,
                    email: result.email,
                    cargo: result.cargo,
                    role: result.cargo,  // Adicionar role também
                    permissions: this.getPermissionsByRole(result.cargo)
                };
                
                // Salvar dados completos do usuário no localStorage
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                this.createSession(user, email, remember);
                this.showAlert(`Bem-vindo, ${user.nome}!`, 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1000);
            } else {
                this.showAlert(result.error || 'E-mail ou senha incorretos.', 'error');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            this.showAlert('Erro de conexão. Tente novamente.', 'error');
        }

        this.setLoading(false);
    }

    validateCredentials(email, password) {
        const user = this.users[email];
        return user && user.password === password;
    }

    getPermissionsByRole(cargo) {
        const permissions = {
            'admin': ['all'],
            'diretor': ['all'],
            'coordenador': ['turmas', 'alunos', 'professores', 'notas', 'calendario', 'matriculas'],
            'professor': ['turmas', 'alunos', 'notas', 'calendario'],
            'secretaria': ['alunos', 'professores', 'turmas', 'matriculas']
        };
        
        return permissions[cargo] || ['alunos'];
    }

    createSession(user, email, remember) {
        const sessionData = {
            id: user.id,
            email: email,
            name: user.nome,
            role: user.cargo,
            cargo: user.cargo,
            permissions: user.permissions,
            loginTime: Date.now(),
            remember: remember
        };

        if (remember) {
            // Sessão persistente - "lembrar de mim" marcado
            sessionData.expires = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 dias
            localStorage.setItem('educagestao_session', JSON.stringify(sessionData));
            console.log('Sessão persistente criada - válida por 7 dias');
        } else {
            // Sessão temporária - sem "lembrar de mim"
            sessionData.expires = Date.now() + (2 * 60 * 60 * 1000); // 2 horas máximo
            sessionStorage.setItem('educagestao_temp_session', JSON.stringify(sessionData));
            console.log('Sessão temporária criada - expira por inatividade ou ao fechar navegador');
        }
    }

    redirectToDashboard() {
        window.location.href = 'home.html';
    }

    setLoading(loading) {
        const button = document.getElementById('loginButton');
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.eye-icon');
    
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

function fillCredentials(userType) {
    const credentials = {
        admin: { email: 'admin@escola.com', password: 'admin123' },
        professor: { email: 'professor@escola.com', password: 'prof123' },
        secretaria: { email: 'secretaria@escola.com', password: 'sec123' }
    };

    const cred = credentials[userType];
    if (cred) {
        document.getElementById('email').value = cred.email;
        document.getElementById('password').value = cred.password;
        
        // Add visual feedback
        const button = event.target;
        const originalBg = button.style.backgroundColor;
        button.style.backgroundColor = '#e0f2fe';
        setTimeout(() => {
            button.style.backgroundColor = originalBg;
        }, 200);
    }
}

function showForgotPassword() {
    loginManager.showAlert(
        'Entre em contato com o administrador do sistema para recuperar sua senha.',
        'warning'
    );
}

function showRegisterInfo() {
    loginManager.showAlert(
        'Para criar uma conta, entre em contato com o administrador do sistema.',
        'warning'
    );
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

// Initialize login manager
let loginManager;
document.addEventListener('DOMContentLoaded', () => {
    loginManager = new LoginManager();
});