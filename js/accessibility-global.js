// ==========================================
// SISTEMA GLOBAL DE ACESSIBILIDADE
// ==========================================
// Este arquivo aplica as configurações de acessibilidade em todas as páginas do sistema

(function() {
    'use strict';
    
    console.log('🎨 Carregando configurações de acessibilidade...');
    
    // Carregar configurações salvas
    function loadGlobalAccessibilitySettings() {
        const settings = JSON.parse(localStorage.getItem('accessibilitySettings') || '{}');
        
        console.log('Configurações carregadas:', settings);
        
        // Aplicar tamanho de fonte
        if (settings.fontSize) {
            applyGlobalFontSize(settings.fontSize);
        }
        
        // Aplicar alto contraste
        if (settings.highContrast) {
            document.body.classList.add('high-contrast');
        }
        
        // Aplicar redução de movimento
        if (settings.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }
        
        // Aplicar tema
        if (settings.theme) {
            applyGlobalTheme(settings.theme);
        }
        
        // Aplicar cores personalizadas
        if (settings.primaryColor && settings.secondaryColor) {
            applyGlobalCustomColors(settings.primaryColor, settings.secondaryColor);
        }
        
        // Aplicar navegação por teclado
        if (settings.keyboardNav !== false) {
            enableGlobalKeyboardNavigation();
        }
        
        // Aplicar suporte a leitor de tela
        if (settings.screenReader) {
            enableGlobalScreenReaderSupport();
        }
        
        console.log('✅ Configurações de acessibilidade aplicadas!');
    }
    
    // Aplicar tamanho de fonte
    function applyGlobalFontSize(size) {
        document.body.classList.remove('small-text', 'large-text');
        
        if (size === 'small') {
            document.body.style.fontSize = '90%';
        } else if (size === 'large') {
            document.body.classList.add('large-text');
            document.body.style.fontSize = '110%';
        } else {
            document.body.style.fontSize = '100%';
        }
    }
    
    // Aplicar tema
    function applyGlobalTheme(theme) {
        document.body.classList.remove('high-contrast', 'dark-theme');
        
        // Remove existing theme style
        const existingThemeStyle = document.getElementById('global-theme-style');
        if (existingThemeStyle) existingThemeStyle.remove();
        
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            
            const darkStyle = document.createElement('style');
            darkStyle.id = 'global-theme-style';
            darkStyle.textContent = `
                body.dark-theme {
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
                }
                
                body.dark-theme .sidebar {
                    background: #0f172a !important;
                }
                
                body.dark-theme .main-content {
                    background: #1e293b !important;
                }
                
                body.dark-theme .card,
                body.dark-theme .stats-card,
                body.dark-theme .activity-card,
                body.dark-theme .calendar-card {
                    background: #1e293b !important;
                    color: #f1f5f9 !important;
                    border: 1px solid #334155 !important;
                }
                
                body.dark-theme h1, body.dark-theme h2, body.dark-theme h3,
                body.dark-theme h4, body.dark-theme h5, body.dark-theme h6 {
                    color: #f1f5f9 !important;
                }
                
                body.dark-theme p, body.dark-theme span, body.dark-theme label {
                    color: #cbd5e1 !important;
                }
                
                body.dark-theme input, body.dark-theme select, body.dark-theme textarea {
                    background: #0f172a !important;
                    border-color: #334155 !important;
                    color: #f1f5f9 !important;
                }
                
                body.dark-theme input:disabled {
                    background: #1e293b !important;
                    color: #94a3b8 !important;
                }
                
                body.dark-theme table {
                    background: #1e293b !important;
                }
                
                body.dark-theme th {
                    background: #0f172a !important;
                    color: #f1f5f9 !important;
                }
                
                body.dark-theme td {
                    color: #cbd5e1 !important;
                    border-color: #334155 !important;
                }
                
                body.dark-theme .header {
                    background: #0f172a !important;
                    border-bottom: 1px solid #334155 !important;
                }
            `;
            document.head.appendChild(darkStyle);
            
        } else if (theme === 'high-contrast') {
            document.body.classList.add('high-contrast');
        }
    }
    
    // Aplicar cores personalizadas
    function applyGlobalCustomColors(primary, secondary) {
        document.documentElement.style.setProperty('--primary-color', primary);
        document.documentElement.style.setProperty('--secondary-color', secondary);
        
        document.body.setAttribute('data-custom-colors', 'true');
        
        const gradient = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
        
        // Remove existing custom style
        const existingStyle = document.getElementById('global-custom-colors-style');
        if (existingStyle) existingStyle.remove();
        
        const style = document.createElement('style');
        style.id = 'global-custom-colors-style';
        style.textContent = `
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) {
                background: ${gradient} !important;
            }
            
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) .sidebar {
                background: linear-gradient(180deg, ${primary} 0%, ${secondary} 100%) !important;
            }
            
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) .main-content {
                background: rgba(255, 255, 255, 0.95) !important;
            }
            
            body[data-custom-colors="true"] .btn-primary,
            body[data-custom-colors="true"] button.primary {
                background: ${gradient} !important;
            }
            
            body[data-custom-colors="true"] .nav-item.active,
            body[data-custom-colors="true"] .nav-item:hover {
                background: rgba(255, 255, 255, 0.1) !important;
            }
            
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) .stats-card .icon,
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) .card-icon {
                background: ${gradient} !important;
            }
            
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) .stats-card,
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) .card,
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) .activity-card,
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) .calendar-card {
                background: white !important;
                border: 1px solid rgba(0, 0, 0, 0.1) !important;
            }
            
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) input:focus,
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) select:focus,
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) textarea:focus {
                border-color: ${primary} !important;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2) !important;
            }
            
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) .badge-primary {
                background: ${primary} !important;
            }
            
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) .nav-item.active {
                background: rgba(255, 255, 255, 0.15) !important;
            }
            
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) .progress-bar {
                background: ${gradient} !important;
            }
            
            body[data-custom-colors="true"]:not(.high-contrast):not(.dark-theme) .header {
                background: white !important;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Habilitar navegação por teclado
    function enableGlobalKeyboardNavigation() {
        const style = document.createElement('style');
        style.id = 'global-keyboard-nav-style';
        style.textContent = `
            *:focus {
                outline: 3px solid #667eea !important;
                outline-offset: 2px !important;
            }
            
            button:focus, a:focus, input:focus, select:focus, textarea:focus {
                box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3) !important;
            }
        `;
        
        // Remove existing style
        const existing = document.getElementById('global-keyboard-nav-style');
        if (existing) existing.remove();
        
        document.head.appendChild(style);
        
        // Atalhos de teclado globais
        document.addEventListener('keydown', (e) => {
            // Alt + H = Home
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                window.location.href = 'home.html';
            }
            
            // Alt + P = Perfil
            if (e.altKey && e.key === 'p') {
                e.preventDefault();
                window.location.href = 'perfil.html';
            }
            
            // Alt + A = Alunos
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                window.location.href = 'alunos.html';
            }
            
            // Alt + T = Turmas
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                window.location.href = 'turmas.html';
            }
            
            // Escape = Fechar modais/alertas
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal, .alert, .popup').forEach(el => {
                    el.style.display = 'none';
                    el.remove();
                });
            }
        });
    }
    
    // Habilitar suporte a leitor de tela
    function enableGlobalScreenReaderSupport() {
        // Adicionar ARIA labels a elementos interativos
        document.querySelectorAll('button, a, input, select, textarea').forEach(element => {
            if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
                const text = element.textContent.trim() || element.placeholder || element.value || element.title;
                if (text) {
                    element.setAttribute('aria-label', text);
                }
            }
        });
        
        // Adicionar roles
        document.querySelectorAll('.card, .stats-card, .activity-card').forEach(card => {
            if (!card.getAttribute('role')) {
                card.setAttribute('role', 'region');
            }
        });
        
        // Adicionar live regions
        document.querySelectorAll('.alert, .notification').forEach(alert => {
            alert.setAttribute('role', 'alert');
            alert.setAttribute('aria-live', 'polite');
        });
    }
    
    // Adicionar estilos CSS globais de acessibilidade
    function addGlobalAccessibilityStyles() {
        const style = document.createElement('style');
        style.id = 'global-accessibility-base-styles';
        style.textContent = `
            /* High Contrast Mode */
            body.high-contrast {
                background: #000000 !important;
            }
            
            body.high-contrast * {
                border-color: #000000 !important;
            }
            
            body.high-contrast .sidebar,
            body.high-contrast .main-content,
            body.high-contrast .card,
            body.high-contrast .stats-card,
            body.high-contrast .header {
                background: #ffffff !important;
                border: 4px solid #000000 !important;
                color: #000000 !important;
            }
            
            body.high-contrast h1, body.high-contrast h2, body.high-contrast h3,
            body.high-contrast h4, body.high-contrast h5, body.high-contrast h6,
            body.high-contrast p, body.high-contrast span, body.high-contrast label {
                color: #000000 !important;
            }
            
            body.high-contrast input, body.high-contrast select, body.high-contrast textarea {
                background: #ffffff !important;
                border: 3px solid #000000 !important;
                color: #000000 !important;
            }
            
            body.high-contrast button, body.high-contrast .btn {
                background: #000000 !important;
                color: #ffffff !important;
                border: 3px solid #000000 !important;
            }
            
            body.high-contrast a {
                color: #000000 !important;
                text-decoration: underline !important;
            }
            
            /* Large Text Mode */
            body.large-text {
                font-size: 110% !important;
            }
            
            body.large-text h1 { font-size: 2.5rem !important; }
            body.large-text h2 { font-size: 2rem !important; }
            body.large-text h3 { font-size: 1.75rem !important; }
            
            /* Reduced Motion */
            body.reduced-motion * {
                animation: none !important;
                transition: none !important;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addGlobalAccessibilityStyles();
            loadGlobalAccessibilitySettings();
        });
    } else {
        addGlobalAccessibilityStyles();
        loadGlobalAccessibilitySettings();
    }
    
    // Exportar funções para uso global
    window.AccessibilitySystem = {
        reload: loadGlobalAccessibilitySettings,
        applyFontSize: applyGlobalFontSize,
        applyTheme: applyGlobalTheme,
        applyColors: applyGlobalCustomColors
    };
    
})();
