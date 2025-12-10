// Authentication System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.inactivityTimer = null;
        this.INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutos em millisegundos
        this.permissions = {};
        this.init();
    }

    // Método para obter headers de autenticação para requisições
    getAuthHeaders() {
        const user = this.getCurrentUser();
        if (!user) return {};
        
        return {
            'X-User-Id': user.id || '',
            'X-User-Cargo': user.role || user.cargo || '',
            'Content-Type': 'application/json'
        };
    }

    // Método auxiliar para fazer requisições autenticadas
    async fetchWithAuth(url, options = {}) {
        const headers = {
            ...this.getAuthHeaders(),
            ...(options.headers || {})
        };
        
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        // Se receber 401 ou 403, redirecionar para login
        if (response.status === 401) {
            this.logout();
            throw new Error('Sessão expirada');
        }
        
        if (response.status === 403) {
            throw new Error('Acesso negado. Você não tem permissão para esta ação.');
        }
        
        return response;
    }

    init() {
        this.checkAuthentication();
        this.setupLogout();
        this.updateUserInfo();
        this.setupInactivityMonitor();
    }

    checkAuthentication() {
        const session = localStorage.getItem('educagestao_session');
        const tempSession = sessionStorage.getItem('educagestao_temp_session');
        
        // Verificar se há sessão temporária (sem "lembrar de mim")
        if (tempSession && !session) {
            try {
                const tempData = JSON.parse(tempSession);
                
                // Verificar se a sessão temporária expirou
                if (tempData.expires < Date.now()) {
                    this.logout();
                    return false;
                }
                
                this.currentUser = tempData;
                return true;
            } catch (error) {
                console.error('Sessão temporária inválida:', error);
                this.logout();
                return false;
            }
        }
        
        // Verificar sessão persistente ("lembrar de mim")
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                
                // Verificar se a sessão persistente expirou
                if (sessionData.expires < Date.now()) {
                    this.logout();
                    return false;
                }
                
                this.currentUser = sessionData;
                return true;
            } catch (error) {
                console.error('Sessão persistente inválida:', error);
                this.logout();
                return false;
            }
        }
        
        // Nenhuma sessão válida encontrada
        this.redirectToLogin();
        return false;
    }

    setupInactivityMonitor() {
        // Eventos que resetam o timer de inatividade
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        const resetTimer = () => {
            this.resetInactivityTimer();
        };
        
        // Adicionar listeners para todos os eventos
        events.forEach(event => {
            document.addEventListener(event, resetTimer, true);
        });
        
        // Iniciar o timer
        this.resetInactivityTimer();
    }

    resetInactivityTimer() {
        // Limpar timer existente
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        
        // Só aplicar timeout se não for sessão persistente
        const session = localStorage.getItem('educagestao_session');
        if (!session) {
            this.inactivityTimer = setTimeout(() => {
                this.logoutDueToInactivity();
            }, this.INACTIVITY_TIMEOUT);
        }
    }

    logoutDueToInactivity() {
        this.showInactivityMessage();
        setTimeout(() => {
            this.logout();
        }, 3000);
    }

    showInactivityMessage() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
        `;
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div style="margin-bottom: 1rem;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                </div>
                <div>Sessão expirada por inatividade</div>
                <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.8;">
                    Redirecionando para o login...
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        // Admin e diretor têm todas as permissões
        const cargo = this.currentUser.role || this.currentUser.cargo;
        if (cargo === 'admin' || cargo === 'diretor') return true;
        
        // Verificar se tem a permissão específica
        if (this.currentUser.permissions && this.currentUser.permissions.includes('all')) return true;
        if (this.currentUser.permissions && this.currentUser.permissions.includes(permission)) return true;
        
        return false;
    }

    isAdmin() {
        if (!this.currentUser) return false;
        const cargo = this.currentUser.role || this.currentUser.cargo;
        return cargo === 'admin' || cargo === 'diretor';
    }

    isProfessor() {
        if (!this.currentUser) return false;
        const cargo = this.currentUser.role || this.currentUser.cargo;
        return cargo === 'professor';
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        // Update user name in header if element exists
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.name;
        }

        // Update user role if element exists
        const userRoleElement = document.querySelector('.user-role');
        if (userRoleElement) {
            userRoleElement.textContent = this.getRoleDisplayName(this.currentUser.role);
        }

        // Show/hide elements based on permissions
        this.applyPermissions();
    }

    getRoleDisplayName(role) {
        const roleNames = {
            admin: 'Administrador',
            professor: 'Professor',
            secretaria: 'Secretária'
        };
        return roleNames[role] || role;
    }

    applyPermissions() {
        // Hide navigation items based on permissions
        const navItems = document.querySelectorAll('.nav-item[data-permission]');
        navItems.forEach(item => {
            const permission = item.getAttribute('data-permission');
            if (!this.hasPermission(permission)) {
                item.style.display = 'none';
            }
        });

        // Hide buttons based on permissions
        const protectedButtons = document.querySelectorAll('[data-permission]');
        protectedButtons.forEach(button => {
            const permission = button.getAttribute('data-permission');
            if (!this.hasPermission(permission)) {
                button.style.display = 'none';
            }
        });

        // Ocultar seções administrativas para não-admins
        if (!this.isAdmin()) {
            const adminSections = document.querySelectorAll('.admin-only');
            adminSections.forEach(section => {
                section.style.display = 'none';
            });
        }

        // Mostrar badge de cargo no header
        this.showUserBadge();
    }

    showUserBadge() {
        const cargo = this.currentUser?.role || this.currentUser?.cargo;
        if (!cargo) return;

        const badgeColors = {
            'admin': '#dc2626',
            'diretor': '#dc2626',
            'coordenador': '#2563eb',
            'professor': '#16a34a',
            'secretaria': '#9333ea'
        };

        const badgeLabels = {
            'admin': 'Administrador',
            'diretor': 'Diretor',
            'coordenador': 'Coordenador',
            'professor': 'Professor',
            'secretaria': 'Secretaria'
        };

        const userRoleElement = document.querySelector('.user-role');
        if (userRoleElement) {
            userRoleElement.textContent = badgeLabels[cargo] || cargo;
            userRoleElement.style.color = badgeColors[cargo] || '#64748b';
        }
    }

    setupLogout() {
        // Add logout functionality to existing user button
        const userButtons = document.querySelectorAll('.icon-button');
        if (userButtons.length > 1) {
            const userButton = userButtons[userButtons.length - 1]; // Last button is usually user
            userButton.addEventListener('click', () => {
                this.showLogoutMenu(userButton);
            });
        }

        // Add logout button to header if it doesn't exist
        this.addLogoutButton();
    }

    addLogoutButton() {
        const headerActions = document.querySelector('.header-actions');
        if (headerActions && !document.querySelector('.logout-button')) {
            const logoutButton = document.createElement('button');
            logoutButton.className = 'icon-button logout-button';
            logoutButton.title = 'Sair';
            logoutButton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
            `;
            logoutButton.addEventListener('click', () => this.logout());
            headerActions.appendChild(logoutButton);
        }
    }

    showLogoutMenu(button) {
        // Create dropdown menu for user options
        const existingMenu = document.querySelector('.user-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.className = 'user-menu';
        menu.innerHTML = `
            <div class="user-menu-content">
                <div class="user-info">
                    <div class="user-name">${this.currentUser.name}</div>
                    <div class="user-role">${this.getRoleDisplayName(this.currentUser.role)}</div>
                </div>
                <hr>
                <button class="menu-item" onclick="authManager.logout()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                    Sair
                </button>
            </div>
        `;

        // Position menu
        const rect = button.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = (rect.bottom + 10) + 'px';
        menu.style.right = (window.innerWidth - rect.right) + 'px';
        menu.style.zIndex = '1000';

        document.body.appendChild(menu);

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && e.target !== button) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    logout() {
        // Limpar timer de inatividade
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        
        // Limpar todos os dados de sessão
        localStorage.removeItem('educagestao_session');
        sessionStorage.removeItem('educagestao_temp_session');
        sessionStorage.removeItem('educagestao_active');
        
        // Mostrar mensagem de logout
        this.showLogoutMessage();
        
        // Redirecionar para login após delay
        setTimeout(() => {
            this.redirectToLogin();
        }, 1500);
    }

    showLogoutMessage() {
        // Create temporary overlay with logout message
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
        `;
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div style="margin-bottom: 1rem;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                </div>
                <div>Saindo do sistema...</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    redirectToLogin() {
        window.location.href = 'index.html';
    }

    // Utility method to format session time
    getSessionInfo() {
        if (!this.currentUser) return null;
        
        const loginTime = new Date(this.currentUser.loginTime);
        const expiresTime = new Date(this.currentUser.expires);
        
        return {
            loginTime: loginTime.toLocaleString('pt-BR'),
            expiresTime: expiresTime.toLocaleString('pt-BR'),
            timeRemaining: Math.max(0, this.currentUser.expires - Date.now())
        };
    }
}

// Add user menu styles
const userMenuStyles = `
    .user-menu {
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        border: 1px solid #e2e8f0;
        overflow: hidden;
        animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .user-menu-content {
        padding: 1rem;
        min-width: 200px;
    }
    
    .user-info {
        margin-bottom: 0.5rem;
    }
    
    .user-info .user-name {
        font-weight: 600;
        color: #1e293b;
        font-size: 0.9rem;
    }
    
    .user-info .user-role {
        font-size: 0.8rem;
        color: #64748b;
    }
    
    .user-menu hr {
        border: none;
        border-top: 1px solid #e2e8f0;
        margin: 0.75rem 0;
    }
    
    .menu-item {
        width: 100%;
        background: none;
        border: none;
        padding: 0.75rem;
        text-align: left;
        cursor: pointer;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #dc2626;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }
    
    .menu-item:hover {
        background-color: #fef2f2;
    }
    
    .menu-item svg {
        width: 16px;
        height: 16px;
    }
    
    .logout-button {
        color: #dc2626 !important;
    }
    
    .logout-button:hover {
        background-color: #fef2f2 !important;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = userMenuStyles;
document.head.appendChild(styleSheet);

// Global auth manager instance
let authManager;

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if not on login page
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath === '';
    
    if (!isLoginPage) {
        // Initialize auth manager with full authentication
        authManager = new AuthManager();
    }
});