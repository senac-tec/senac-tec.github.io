// Utilitário para carregar dados do usuário em todas as páginas
class UserLoader {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.loadUserData();
        this.updateUserInterface();
    }

    async loadUserData() {
        try {
            // Buscar dados do usuário logado do localStorage
            const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            if (!userData.id) {
                console.error('❌ Usuário não encontrado no localStorage');
                // Verificar se não estamos na página de login
                if (!window.location.pathname.includes('index.html') && 
                    !window.location.pathname.endsWith('/')) {
                    window.location.href = 'index.html';
                }
                return;
            }

            this.currentUser = userData;
            console.log('✅ Dados do usuário carregados:', this.currentUser.nome);
        } catch (error) {
            console.error('❌ Erro ao carregar dados do usuário:', error);
        }
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        // Atualizar nome no header (se existir)
        const headerUserName = document.getElementById('headerUserName');
        if (headerUserName) {
            headerUserName.textContent = this.currentUser.nome || 'Usuário';
        }

        // Atualizar nome no dropdown (se existir)
        const dropdownUserName = document.getElementById('dropdownUserName');
        if (dropdownUserName) {
            dropdownUserName.textContent = this.currentUser.nome || 'Usuário';
        }

        // Atualizar email no dropdown (se existir)
        const dropdownUserEmail = document.getElementById('dropdownUserEmail');
        if (dropdownUserEmail) {
            dropdownUserEmail.textContent = this.currentUser.email || 'email@exemplo.com';
        }

        // Atualizar elementos com classe user-name (fallback)
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            if (!element.id) { // Só atualizar se não tiver ID específico
                element.textContent = this.currentUser.nome || 'Usuário';
            }
        });
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserPermissions() {
        return this.currentUser?.permissions || [];
    }

    hasPermission(permission) {
        const permissions = this.getUserPermissions();
        return permissions.includes('all') || permissions.includes(permission);
    }

    getUserRole() {
        return this.currentUser?.cargo || 'usuario';
    }
}

// Instância global
window.userLoader = new UserLoader();

// Função global para logout
function logout() {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

// Função global para toggle do menu de usuário
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    const button = document.querySelector('.user-menu-btn');
    
    if (dropdown && button) {
        dropdown.classList.toggle('active');
        button.classList.toggle('active');
    }
}

// Fechar dropdown quando clicar fora
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu && !userMenu.contains(event.target)) {
        const dropdown = document.getElementById('userDropdown');
        const button = document.querySelector('.user-menu-btn');
        if (dropdown) dropdown.classList.remove('active');
        if (button) button.classList.remove('active');
    }
});

console.log('🚀 Sistema de carregamento de usuário inicializado!');