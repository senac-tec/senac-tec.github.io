// ===== GERENCIADOR DE TEMAS E ACESSIBILIDADE =====
class ThemeManager {
    constructor() {
        this.currentTheme = 'purple';
        this.accessibilityMode = 'none';
        this.profilePicture = null;
        this.init();
    }

    init() {
        this.loadSettings();
        this.applyTheme();
        this.applyAccessibility();
        this.loadProfilePicture();
        console.log('✅ Theme Manager inicializado');
    }

    loadSettings() {
        this.currentTheme = localStorage.getItem('theme') || 'purple';
        this.accessibilityMode = localStorage.getItem('accessibility') || 'none';
        this.profilePicture = localStorage.getItem('profilePicture');
    }

    // ===== TEMAS =====
    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        this.applyTheme();
        this.showNotification(`Tema alterado para: ${this.getThemeName(theme)}`);
    }

    applyTheme() {
        const themes = {
            purple: { primary: '#667eea', secondary: '#764ba2', dark: false },
            blue: { primary: '#3b82f6', secondary: '#1e40af', dark: false },
            green: { primary: '#10b981', secondary: '#047857', dark: false },
            orange: { primary: '#f59e0b', secondary: '#d97706', dark: false },
            red: { primary: '#ef4444', secondary: '#dc2626', dark: false },
            pink: { primary: '#ec4899', secondary: '#be185d', dark: false },
            dark: { primary: '#60a5fa', secondary: '#3b82f6', dark: true }
        };

        const theme = themes[this.currentTheme] || themes.purple;
        
        document.documentElement.style.setProperty('--theme-primary', theme.primary);
        document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
        
        // Aplicar classe no body
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${this.currentTheme}`);
        
        // Aplicar modo escuro
        if (theme.dark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    getThemeName(theme) {
        const names = {
            purple: 'Roxo',
            blue: 'Azul',
            green: 'Verde',
            orange: 'Laranja',
            red: 'Vermelho',
            pink: 'Rosa',
            dark: 'Modo Preto'
        };
        return names[theme] || theme;
    }

    // ===== ACESSIBILIDADE =====
    setAccessibility(mode) {
        this.accessibilityMode = mode;
        localStorage.setItem('accessibility', mode);
        this.applyAccessibility();
        this.showNotification(`Modo de acessibilidade: ${this.getAccessibilityName(mode)}`);
    }

    applyAccessibility() {
        console.log('♿ Aplicando acessibilidade:', this.accessibilityMode);
        
        // Remover classes antigas
        document.body.className = document.body.className.replace(/accessibility-\w+/g, '');
        
        // Reset estilos
        document.documentElement.style.fontSize = '';
        document.body.style.fontFamily = '';
        document.body.style.letterSpacing = '';
        document.body.style.lineHeight = '';
        document.documentElement.style.setProperty('--text-primary', '');
        document.documentElement.style.setProperty('--bg-primary', '');
        
        if (this.accessibilityMode !== 'none') {
            document.body.classList.add(`accessibility-${this.accessibilityMode}`);
            console.log('✅ Classe adicionada:', `accessibility-${this.accessibilityMode}`);
        }

        // Aplicar ajustes específicos
        switch(this.accessibilityMode) {
            case 'high-contrast':
                document.body.style.filter = 'contrast(1.5)';
                console.log('✅ Alto contraste ativado');
                break;
            case 'large-text':
                document.documentElement.style.fontSize = '20px';
                console.log('✅ Texto grande ativado');
                break;
            case 'dyslexia':
                document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
                document.body.style.letterSpacing = '0.08em';
                document.body.style.lineHeight = '2';
                document.body.style.wordSpacing = '0.16em';
                console.log('✅ Modo dislexia ativado');
                break;
            case 'colorblind':
                // Aplicado via CSS
                console.log('✅ Modo daltônico ativado');
                break;
            default:
                document.body.style.filter = '';
                console.log('✅ Modo normal');
        }
    }

    getAccessibilityName(mode) {
        const names = {
            none: 'Desativado',
            'high-contrast': 'Alto Contraste',
            'large-text': 'Texto Grande',
            'dyslexia': 'Modo Dislexia',
            'colorblind': 'Modo Daltônico'
        };
        return names[mode] || mode;
    }

    // ===== FOTO DE PERFIL =====
    setProfilePicture(imageData) {
        this.profilePicture = imageData;
        localStorage.setItem('profilePicture', imageData);
        this.loadProfilePicture();
        this.showNotification('Foto de perfil atualizada!');
    }

    loadProfilePicture() {
        if (this.profilePicture) {
            const images = document.querySelectorAll('.user-avatar, .profile-picture, .dropdown-avatar');
            images.forEach(img => {
                img.src = this.profilePicture;
            });
        }
    }

    removeProfilePicture() {
        this.profilePicture = null;
        localStorage.removeItem('profilePicture');
        const images = document.querySelectorAll('.user-avatar, .profile-picture, .dropdown-avatar');
        images.forEach(img => {
            img.src = 'public/placeholder-user.jpg';
        });
        this.showNotification('Foto de perfil removida');
    }

    // ===== NOTIFICAÇÕES =====
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Inicializar automaticamente
const themeManager = new ThemeManager();
window.themeManager = themeManager;

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    
    /* Aplicar tema */
    :root {
        --theme-primary: #667eea;
        --theme-secondary: #764ba2;
    }
    
    /* Temas */
    .theme-purple { --theme-primary: #667eea; --theme-secondary: #764ba2; }
    .theme-blue { --theme-primary: #3b82f6; --theme-secondary: #1e40af; }
    .theme-green { --theme-primary: #10b981; --theme-secondary: #047857; }
    .theme-orange { --theme-primary: #f59e0b; --theme-secondary: #d97706; }
    .theme-red { --theme-primary: #ef4444; --theme-secondary: #dc2626; }
    .theme-pink { --theme-primary: #ec4899; --theme-secondary: #be185d; }
    .theme-dark { --theme-primary: #60a5fa; --theme-secondary: #3b82f6; }
    
    /* ===== MODO ESCURO COMPLETO ===== */
    body.dark-mode {
        background: #0a0a0a !important;
        color: #e5e7eb !important;
    }
    
    body.dark-mode .sidebar {
        background: #1a1a1a !important;
        border-right-color: #2a2a2a !important;
    }
    
    body.dark-mode .sidebar-header {
        background: linear-gradient(135deg, #1a1a1a, #2a2a2a) !important;
        color: #60a5fa !important;
    }
    
    body.dark-mode .logo-text {
        color: #e5e7eb !important;
    }
    
    body.dark-mode .nav-item {
        color: #9ca3af !important;
    }
    
    body.dark-mode .nav-item:hover,
    body.dark-mode .nav-item.active {
        background: linear-gradient(135deg, #60a5fa, #3b82f6) !important;
        color: #ffffff !important;
    }
    
    body.dark-mode .main-content {
        background: #0a0a0a !important;
    }
    
    body.dark-mode .header {
        background: #1a1a1a !important;
        border-bottom-color: #2a2a2a !important;
    }
    
    body.dark-mode .page-title {
        color: #e5e7eb !important;
    }
    
    body.dark-mode .card {
        background: #1a1a1a !important;
        border-color: #2a2a2a !important;
    }
    
    body.dark-mode .card-header {
        background: linear-gradient(135deg, #60a5fa, #3b82f6) !important;
    }
    
    body.dark-mode .card-content {
        background: #1a1a1a !important;
    }
    
    body.dark-mode .form-input,
    body.dark-mode .form-select,
    body.dark-mode .form-textarea {
        background: #0a0a0a !important;
        border-color: #2a2a2a !important;
        color: #e5e7eb !important;
    }
    
    body.dark-mode .form-input:focus {
        background: #1a1a1a !important;
        border-color: #60a5fa !important;
    }
    
    body.dark-mode .form-input:read-only {
        background: #1a1a1a !important;
        color: #6b7280 !important;
    }
    
    body.dark-mode .form-label {
        color: #d1d5db !important;
    }
    
    body.dark-mode .btn-secondary {
        background: #2a2a2a !important;
        color: #e5e7eb !important;
        border-color: #3a3a3a !important;
    }
    
    body.dark-mode .btn-secondary:hover {
        background: #3a3a3a !important;
    }
    
    body.dark-mode .table {
        background: #1a1a1a !important;
    }
    
    body.dark-mode .table thead {
        background: #0a0a0a !important;
    }
    
    body.dark-mode .table tbody tr {
        border-bottom-color: #2a2a2a !important;
    }
    
    body.dark-mode .table tbody tr:hover {
        background: #2a2a2a !important;
    }
    
    body.dark-mode .modal-content {
        background: #1a1a1a !important;
    }
    
    body.dark-mode .theme-option,
    body.dark-mode .accessibility-option {
        background: #2a2a2a !important;
        border-color: #3a3a3a !important;
    }
    
    body.dark-mode .theme-option:hover,
    body.dark-mode .accessibility-option:hover {
        background: #3a3a3a !important;
    }
    
    body.dark-mode .theme-option span,
    body.dark-mode .accessibility-option .option-title {
        color: #e5e7eb !important;
    }
    
    body.dark-mode .accessibility-option .option-desc {
        color: #9ca3af !important;
    }
    
    body.dark-mode .section-title {
        color: #e5e7eb !important;
    }
    
    body.dark-mode .personalization-section {
        border-bottom-color: #2a2a2a !important;
    }
    
    body.dark-mode .profile-picture {
        border-color: #3a3a3a !important;
    }
    
    body.dark-mode .status-indicator {
        background: linear-gradient(135deg, #1a3a1a, #0f2f0f) !important;
        border-color: #2a4a2a !important;
    }
    
    body.dark-mode .status-text {
        color: #86efac !important;
    }
    
    body.dark-mode .account-content {
        background: #0a0a0a !important;
    }
    
    body.dark-mode .icon-button {
        color: #9ca3af !important;
    }
    
    body.dark-mode .icon-button:hover {
        background: #2a2a2a !important;
        color: #e5e7eb !important;
    }
    
    body.dark-mode .user-dropdown-menu {
        background: #1a1a1a !important;
        border-color: #2a2a2a !important;
    }
    
    body.dark-mode .menu-item {
        color: #e5e7eb !important;
    }
    
    body.dark-mode .menu-item:hover {
        background: #2a2a2a !important;
    }
    
    body.dark-mode .user-email {
        color: #9ca3af !important;
    }
    
    /* Aplicar cores do tema */
    .btn-primary,
    .card-header,
    .tab-button.active,
    .sidebar-header {
        background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary)) !important;
    }
    
    .nav-item.active,
    .nav-item:hover {
        background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary)) !important;
        color: white !important;
    }
    
    /* Acessibilidade - Alto Contraste */
    .accessibility-high-contrast {
        filter: contrast(1.5);
    }
    
    .accessibility-high-contrast * {
        border-color: #000 !important;
    }
    
    /* Acessibilidade - Texto Grande */
    .accessibility-large-text {
        font-size: 18px !important;
    }
    
    .accessibility-large-text * {
        font-size: inherit !important;
    }
    
    /* Acessibilidade - Dislexia */
    .accessibility-dyslexia {
        font-family: Arial, sans-serif !important;
        letter-spacing: 0.05em !important;
        line-height: 1.8 !important;
    }
    
    /* Acessibilidade - Daltônico */
    .accessibility-colorblind .btn-primary { background: #0077bb !important; }
    .accessibility-colorblind .btn-success { background: #0077bb !important; }
    .accessibility-colorblind .btn-danger { background: #cc3311 !important; }
    .accessibility-colorblind .btn-warning { background: #ee7733 !important; }
`;
document.head.appendChild(style);

console.log('🎨 Theme Manager carregado!');
