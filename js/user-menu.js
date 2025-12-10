// Sistema de Menu de Usuário - Versão Simplificada
class UserMenu {
    constructor() {
        this.isOpen = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateUserInterface();
    }

    loadUserData() {
        try {
            const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            if (!userData.id) {
                console.log('⚠️ Usuário não encontrado, redirecionando para login');
                if (!window.location.pathname.includes('index.html') && 
                    !window.location.pathname.endsWith('/')) {
                    window.location.href = 'index.html';
                }
                return;
            }

            this.currentUser = userData;
            console.log('✅ Usuário carregado:', this.currentUser.nome);
        } catch (error) {
            console.error('❌ Erro ao carregar dados do usuário:', error);
        }
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        // Atualizar nome no botão
        const headerUserName = document.getElementById('headerUserName');
        if (headerUserName) {
            headerUserName.textContent = this.currentUser.nome || 'Usuário';
        }

        // Atualizar nome no dropdown
        const dropdownUserName = document.getElementById('dropdownUserName');
        if (dropdownUserName) {
            dropdownUserName.textContent = this.currentUser.nome || 'Usuário';
        }

        // Atualizar email no dropdown
        const dropdownUserEmail = document.getElementById('dropdownUserEmail');
        if (dropdownUserEmail) {
            dropdownUserEmail.textContent = this.currentUser.email || 'email@exemplo.com';
        }
    }

    setupEventListeners() {
        const userBtn = document.getElementById('userMenuBtn');
        const dropdownMenu = document.getElementById('userDropdownMenu');

        if (!userBtn || !dropdownMenu) {
            console.error('❌ Elementos do menu não encontrados');
            return;
        }

        // Click no botão
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Click fora do menu para fechar
        document.addEventListener('click', (e) => {
            if (!userBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Tecla ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        const userBtn = document.getElementById('userMenuBtn');
        const dropdownMenu = document.getElementById('userDropdownMenu');

        if (userBtn && dropdownMenu) {
            userBtn.classList.add('active');
            dropdownMenu.classList.add('show');
            this.isOpen = true;
            console.log('✅ Menu aberto');
        }
    }

    closeMenu() {
        const userBtn = document.getElementById('userMenuBtn');
        const dropdownMenu = document.getElementById('userDropdownMenu');

        if (userBtn && dropdownMenu) {
            userBtn.classList.remove('active');
            dropdownMenu.classList.remove('show');
            this.isOpen = false;
            console.log('✅ Menu fechado');
        }
    }
}

// Função global para logout
function handleLogout() {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

// Inicializar quando a página carregar
let userMenu;
document.addEventListener('DOMContentLoaded', () => {
    userMenu = new UserMenu();
});

// Exportar para uso global
window.userMenu = userMenu;

console.log('🚀 Sistema de menu de usuário carregado!');