// Sistema de Perfil do Usuário
const API_URL = 'http://localhost:5000/api';
let currentUser = null;

// Carregar dados do usuário ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    setupForms();
    
    // Aguardar um pouco para garantir que o accessibility-global.js carregou primeiro
    setTimeout(() => {
        loadAccessibilitySettings();
        setupAccessibilityControls();
    }, 100);
});

function loadUserData() {
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!currentUser.id) {
            window.location.href = 'index.html';
            return;
        }
        
        // Atualizar header
        const inicial = currentUser.nome ? currentUser.nome.charAt(0).toUpperCase() : 'U';
        document.getElementById('perfilAvatar').textContent = inicial;
        document.getElementById('perfilNome').textContent = currentUser.nome;
        document.getElementById('perfilCargo').textContent = getCargoLabel(currentUser.cargo);
        
        // Preencher formulário
        document.getElementById('nome').value = currentUser.nome || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('cpf').value = currentUser.cpf || '';
        document.getElementById('telefone').value = currentUser.telefone || '';
        document.getElementById('cargo').value = getCargoLabel(currentUser.cargo);
        document.getElementById('status').value = 'Ativo';
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showAlert('Erro ao carregar dados do usuário', 'error');
    }
}

function getCargoLabel(cargo) {
    const labels = {
        'admin': 'Administrador',
        'diretor': 'Diretor',
        'coordenador': 'Coordenador',
        'professor': 'Professor',
        'secretaria': 'Secretaria'
    };
    return labels[cargo] || cargo;
}

function setupForms() {
    // Form de perfil
    document.getElementById('perfilForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updatePerfil();
    });
    
    // Form de senha
    document.getElementById('senhaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateSenha();
    });
    
    // Password strength indicator
    const novaSenhaInput = document.getElementById('novaSenha');
    const strengthBar = document.getElementById('strengthBar');
    
    if (novaSenhaInput && strengthBar) {
        novaSenhaInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strength = calculatePasswordStrength(password);
            
            strengthBar.className = 'password-strength-bar';
            if (strength === 'weak') {
                strengthBar.classList.add('strength-weak');
            } else if (strength === 'medium') {
                strengthBar.classList.add('strength-medium');
            } else if (strength === 'strong') {
                strengthBar.classList.add('strength-strong');
            }
        });
    }
    
    // Phone mask
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 6) {
                value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
            } else if (value.length > 0) {
                value = value.replace(/^(\d*)/, '($1');
            }
            
            e.target.value = value;
        });
    }
}

function calculatePasswordStrength(password) {
    if (password.length === 0) return 'none';
    if (password.length < 6) return 'weak';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 1) return 'weak';
    if (strength <= 2) return 'medium';
    return 'strong';
}

async function updatePerfil() {
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    
    try {
        const response = await fetch(`${API_URL}/usuarios/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': currentUser.id,
                'X-User-Cargo': currentUser.cargo
            },
            body: JSON.stringify({
                nome: nome,
                email: currentUser.email,
                cpf: currentUser.cpf,
                telefone: telefone,
                cargo: currentUser.cargo,
                status: 'ativo'
            })
        });
        
        if (!response.ok) {
            throw new Error('Erro ao atualizar perfil');
        }
        
        // Atualizar localStorage
        currentUser.nome = nome;
        currentUser.telefone = telefone;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Atualizar sessão
        const session = localStorage.getItem('educagestao_session');
        if (session) {
            const sessionData = JSON.parse(session);
            sessionData.name = nome;
            localStorage.setItem('educagestao_session', JSON.stringify(sessionData));
        }
        
        showAlert('Perfil atualizado com sucesso!', 'success');
        
        // Recarregar dados
        setTimeout(() => {
            loadUserData();
        }, 1000);
        
    } catch (error) {
        console.error('Erro:', error);
        showAlert(error.message || 'Erro ao atualizar perfil', 'error');
    }
}

async function updateSenha() {
    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    
    // Validações
    if (novaSenha !== confirmarSenha) {
        showAlert('As senhas não coincidem', 'error');
        return;
    }
    
    if (novaSenha.length < 6) {
        showAlert('A nova senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/usuarios/${currentUser.id}/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': currentUser.id,
                'X-User-Cargo': currentUser.cargo
            },
            body: JSON.stringify({
                currentPassword: senhaAtual,
                newPassword: novaSenha
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao alterar senha');
        }
        
        showAlert('Senha alterada com sucesso!', 'success');
        
        // Limpar formulário
        document.getElementById('senhaForm').reset();
        
    } catch (error) {
        console.error('Erro:', error);
        showAlert(error.message || 'Erro ao alterar senha', 'error');
    }
}

function showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    const icon = type === 'success' 
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    
    alert.innerHTML = `${icon}<span><strong>${type === 'success' ? 'Sucesso!' : 'Erro!'}</strong> ${message}</span>`;
    container.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// ==========================================
// ACCESSIBILITY FEATURES
// ==========================================

function loadAccessibilitySettings() {
    const settings = JSON.parse(localStorage.getItem('accessibilitySettings') || '{}');
    
    // Apply font size
    if (settings.fontSize) {
        applyFontSize(settings.fontSize);
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === settings.fontSize);
        });
    }
    
    // Apply high contrast
    if (settings.highContrast) {
        document.body.classList.add('high-contrast');
        const toggle = document.getElementById('highContrastToggle');
        if (toggle) toggle.checked = true;
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
        document.body.classList.add('reduced-motion');
        const toggle = document.getElementById('reducedMotionToggle');
        if (toggle) toggle.checked = true;
    }
    
    // Apply screen reader support
    if (settings.screenReader) {
        enableScreenReaderSupport();
        const toggle = document.getElementById('screenReaderToggle');
        if (toggle) toggle.checked = true;
    }
    
    // Apply keyboard navigation
    if (settings.keyboardNav !== false) {
        enableKeyboardNavigation();
        const toggle = document.getElementById('keyboardNavToggle');
        if (toggle) toggle.checked = true;
    }
    
    // Apply theme
    if (settings.theme) {
        applyTheme(settings.theme);
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === settings.theme);
        });
    }
    
    // Apply custom colors
    if (settings.primaryColor && settings.secondaryColor) {
        const primaryPicker = document.getElementById('primaryColorPicker');
        const secondaryPicker = document.getElementById('secondaryColorPicker');
        const primaryText = document.getElementById('primaryColorText');
        const secondaryText = document.getElementById('secondaryColorText');
        
        if (primaryPicker) {
            primaryPicker.value = settings.primaryColor;
            primaryText.value = settings.primaryColor;
        }
        if (secondaryPicker) {
            secondaryPicker.value = settings.secondaryColor;
            secondaryText.value = settings.secondaryColor;
        }
        
        applyCustomColors(settings.primaryColor, settings.secondaryColor);
    }
}

function setupAccessibilityControls() {
    console.log('Configurando controles de acessibilidade...');
    
    // Font size buttons
    const fontSizeBtns = document.querySelectorAll('.font-size-btn');
    console.log('Botões de tamanho de fonte encontrados:', fontSizeBtns.length);
    
    fontSizeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const size = btn.dataset.size;
            console.log('Tamanho de fonte selecionado:', size);
            applyFontSize(size);
            
            document.querySelectorAll('.font-size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // High contrast toggle
    const highContrastToggle = document.getElementById('highContrastToggle');
    console.log('Toggle alto contraste encontrado:', !!highContrastToggle);
    if (highContrastToggle) {
        highContrastToggle.addEventListener('change', (e) => {
            console.log('Alto contraste alterado:', e.target.checked);
            if (e.target.checked) {
                // Remove dark theme if active
                document.body.classList.remove('dark-theme');
                const themeStyle = document.getElementById('theme-style');
                if (themeStyle) themeStyle.remove();
                
                // Apply high contrast
                document.body.classList.add('high-contrast');
                document.body.style.background = '#000000';
                
                // Update theme selector
                document.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.theme === 'high-contrast');
                });
                
                showAlert('Alto contraste ativado', 'success');
            } else {
                document.body.classList.remove('high-contrast');
                document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                
                // Update theme selector to light
                document.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.theme === 'light');
                });
                
                showAlert('Alto contraste desativado', 'success');
            }
        });
    }
    
    // Reduced motion toggle
    const reducedMotionToggle = document.getElementById('reducedMotionToggle');
    console.log('Toggle reduzir animações encontrado:', !!reducedMotionToggle);
    if (reducedMotionToggle) {
        reducedMotionToggle.addEventListener('change', (e) => {
            console.log('Reduzir animações alterado:', e.target.checked);
            if (e.target.checked) {
                document.body.classList.add('reduced-motion');
                showAlert('Animações reduzidas', 'success');
            } else {
                document.body.classList.remove('reduced-motion');
                showAlert('Animações normais', 'success');
            }
        });
    }
    
    // Screen reader toggle
    const screenReaderToggle = document.getElementById('screenReaderToggle');
    console.log('Toggle leitor de tela encontrado:', !!screenReaderToggle);
    if (screenReaderToggle) {
        screenReaderToggle.addEventListener('change', (e) => {
            console.log('Leitor de tela alterado:', e.target.checked);
            if (e.target.checked) {
                enableScreenReaderSupport();
                showAlert('Suporte a leitor de tela ativado', 'success');
            } else {
                disableScreenReaderSupport();
                showAlert('Suporte a leitor de tela desativado', 'success');
            }
        });
    }
    
    // Keyboard navigation toggle
    const keyboardNavToggle = document.getElementById('keyboardNavToggle');
    console.log('Toggle navegação por teclado encontrado:', !!keyboardNavToggle);
    if (keyboardNavToggle) {
        keyboardNavToggle.addEventListener('change', (e) => {
            console.log('Navegação por teclado alterada:', e.target.checked);
            if (e.target.checked) {
                enableKeyboardNavigation();
                showAlert('Navegação por teclado aprimorada ativada', 'success');
            } else {
                disableKeyboardNavigation();
                showAlert('Navegação por teclado aprimorada desativada', 'success');
            }
        });
    }
    
    // Theme selection
    const themeOptions = document.querySelectorAll('.theme-option');
    console.log('Opções de tema encontradas:', themeOptions.length);
    
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            console.log('Tema selecionado:', theme);
            applyTheme(theme);
            
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Color pickers
    const primaryColorPicker = document.getElementById('primaryColorPicker');
    const secondaryColorPicker = document.getElementById('secondaryColorPicker');
    const primaryColorText = document.getElementById('primaryColorText');
    const secondaryColorText = document.getElementById('secondaryColorText');
    
    if (primaryColorPicker) {
        primaryColorPicker.addEventListener('input', (e) => {
            primaryColorText.value = e.target.value;
            applyCustomColors(e.target.value, secondaryColorPicker.value);
        });
    }
    
    if (secondaryColorPicker) {
        secondaryColorPicker.addEventListener('input', (e) => {
            secondaryColorText.value = e.target.value;
            applyCustomColors(primaryColorPicker.value, e.target.value);
        });
    }
    
    // Color presets
    const colorPresets = document.querySelectorAll('.color-preset');
    console.log('Botões de preset de cores encontrados:', colorPresets.length);
    
    colorPresets.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const primary = btn.dataset.primary;
            const secondary = btn.dataset.secondary;
            
            console.log('Preset selecionado:', primary, secondary);
            
            // Visual feedback
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
            
            if (primaryColorPicker) primaryColorPicker.value = primary;
            if (secondaryColorPicker) secondaryColorPicker.value = secondary;
            if (primaryColorText) primaryColorText.value = primary;
            if (secondaryColorText) secondaryColorText.value = secondary;
            
            applyCustomColors(primary, secondary);
            
            // Show which preset was selected
            const presetName = btn.textContent.trim();
            showAlert(`Cores ${presetName} aplicadas!`, 'success');
        });
    });
    
    // Save accessibility settings
    const saveBtn = document.getElementById('saveAccessibilityBtn');
    console.log('Botão salvar encontrado:', !!saveBtn);
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            console.log('Salvando configurações de acessibilidade...');
            saveAccessibilitySettings();
        });
    }
    
    // Reset accessibility settings
    const resetBtn = document.getElementById('resetAccessibilityBtn');
    console.log('Botão resetar encontrado:', !!resetBtn);
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            console.log('Resetando configurações de acessibilidade...');
            resetAccessibilitySettings();
        });
    }
    
    console.log('Controles de acessibilidade configurados com sucesso!');
}

function applyFontSize(size) {
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

function applyTheme(theme) {
    console.log('Aplicando tema:', theme);
    
    // Remove all theme classes
    document.body.classList.remove('high-contrast', 'dark-theme');
    
    // Remove existing theme style
    const existingThemeStyle = document.getElementById('theme-style');
    if (existingThemeStyle) existingThemeStyle.remove();
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.style.background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
        
        // Add dark theme styles
        const darkStyle = document.createElement('style');
        darkStyle.id = 'theme-style';
        darkStyle.textContent = `
            body.dark-theme {
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
            }
            body.dark-theme .perfil-card,
            body.dark-theme .perfil-header {
                background: #1e293b !important;
                color: #f1f5f9 !important;
            }
            body.dark-theme .card-title,
            body.dark-theme .option-title,
            body.dark-theme .perfil-info h1 {
                color: #f1f5f9 !important;
            }
            body.dark-theme .option-description,
            body.dark-theme .perfil-cargo,
            body.dark-theme .form-label {
                color: #cbd5e1 !important;
            }
            body.dark-theme .form-input {
                background: #0f172a !important;
                border-color: #334155 !important;
                color: #f1f5f9 !important;
            }
            body.dark-theme .form-input:disabled {
                background: #1e293b !important;
                color: #94a3b8 !important;
            }
            body.dark-theme .accessibility-option {
                background: #0f172a !important;
            }
            body.dark-theme .top-nav {
                background: rgba(15, 23, 42, 0.8) !important;
            }
            body.dark-theme .theme-name {
                color: #f1f5f9 !important;
            }
        `;
        document.head.appendChild(darkStyle);
        
        showAlert('Tema escuro ativado', 'success');
        
    } else if (theme === 'high-contrast') {
        document.body.classList.add('high-contrast');
        const toggle = document.getElementById('highContrastToggle');
        if (toggle) toggle.checked = true;
        
        showAlert('Alto contraste ativado', 'success');
        
    } else {
        // Light theme (default)
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        const toggle = document.getElementById('highContrastToggle');
        if (toggle) toggle.checked = false;
        
        showAlert('Tema claro ativado', 'success');
    }
}

function enableScreenReaderSupport() {
    // Add ARIA labels to all interactive elements
    document.querySelectorAll('button, a, input, select, textarea').forEach(element => {
        if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
            const text = element.textContent.trim() || element.placeholder || element.value;
            if (text) {
                element.setAttribute('aria-label', text);
            }
        }
    });
    
    // Add role attributes
    document.querySelectorAll('.perfil-card').forEach(card => {
        card.setAttribute('role', 'region');
        const title = card.querySelector('.card-title');
        if (title) {
            card.setAttribute('aria-labelledby', title.textContent);
        }
    });
    
    // Add live regions for alerts
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
        alertContainer.setAttribute('role', 'alert');
        alertContainer.setAttribute('aria-live', 'polite');
        alertContainer.setAttribute('aria-atomic', 'true');
    }
}

function disableScreenReaderSupport() {
    // Remove added ARIA attributes (optional - usually keep them)
    // This is a placeholder - in practice, screen reader support should always be on
}

function enableKeyboardNavigation() {
    // Add visible focus indicators
    const style = document.createElement('style');
    style.id = 'keyboard-nav-style';
    style.textContent = `
        *:focus {
            outline: 3px solid #667eea !important;
            outline-offset: 2px !important;
        }
        
        button:focus, a:focus, input:focus, select:focus, textarea:focus {
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Add keyboard shortcuts info
    document.addEventListener('keydown', (e) => {
        // Alt + H = Home
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            window.location.href = 'home.html';
        }
        
        // Alt + P = Profile (current page)
        if (e.altKey && e.key === 'p') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Escape = Close alerts
        if (e.key === 'Escape') {
            document.querySelectorAll('.alert').forEach(alert => alert.remove());
        }
    });
}

function disableKeyboardNavigation() {
    const style = document.getElementById('keyboard-nav-style');
    if (style) {
        style.remove();
    }
}

function applyCustomColors(primary, secondary) {
    console.log('Aplicando cores personalizadas:', primary, secondary);
    
    // Remove theme classes to apply custom colors
    document.body.classList.remove('high-contrast', 'dark-theme');
    const themeStyle = document.getElementById('theme-style');
    if (themeStyle) themeStyle.remove();
    
    // Update CSS variables
    document.documentElement.style.setProperty('--primary-color', primary);
    document.documentElement.style.setProperty('--secondary-color', secondary);
    
    // Enable custom colors mode
    document.body.setAttribute('data-custom-colors', 'true');
    
    // Force update of all elements with gradients
    const gradient = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
    const gradientHorizontal = `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`;
    
    // Update body background
    document.body.style.background = gradient;
    
    // Remove existing custom style
    const existingStyle = document.getElementById('custom-gradient-style');
    if (existingStyle) existingStyle.remove();
    
    // Create comprehensive custom style
    const style = document.createElement('style');
    style.id = 'custom-gradient-style';
    style.textContent = `
        body[data-custom-colors="true"] {
            background: ${gradient} !important;
        }
        
        body[data-custom-colors="true"] .perfil-avatar {
            background: ${gradient} !important;
        }
        
        body[data-custom-colors="true"] .perfil-header::before {
            background: ${gradientHorizontal} !important;
        }
        
        body[data-custom-colors="true"] .btn-primary {
            background: ${gradient} !important;
        }
        
        body[data-custom-colors="true"] .toggle-switch input:checked + .toggle-slider {
            background: ${gradient} !important;
        }
        
        body[data-custom-colors="true"] .font-size-btn.active {
            background: ${gradient} !important;
        }
        
        body[data-custom-colors="true"] .card-title svg {
            stroke: ${primary} !important;
        }
        
        body[data-custom-colors="true"] .form-input:focus {
            border-color: ${primary} !important;
        }
        
        body[data-custom-colors="true"] .font-size-btn:hover {
            border-color: ${primary} !important;
            color: ${primary} !important;
        }
        
        body[data-custom-colors="true"] .theme-option.active {
            border-color: ${primary} !important;
        }
        
        body[data-custom-colors="true"] .theme-option:hover {
            border-color: ${primary} !important;
        }
    `;
    document.head.appendChild(style);
    
    // Update theme selector to show custom
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('active');
    });
}

function saveAccessibilitySettings() {
    const primaryColor = document.getElementById('primaryColorPicker')?.value || '#667eea';
    const secondaryColor = document.getElementById('secondaryColorPicker')?.value || '#764ba2';
    
    const settings = {
        fontSize: document.querySelector('.font-size-btn.active')?.dataset.size || 'normal',
        highContrast: document.getElementById('highContrastToggle')?.checked || false,
        reducedMotion: document.getElementById('reducedMotionToggle')?.checked || false,
        screenReader: document.getElementById('screenReaderToggle')?.checked || false,
        keyboardNav: document.getElementById('keyboardNavToggle')?.checked !== false,
        theme: document.querySelector('.theme-option.active')?.dataset.theme || 'light',
        primaryColor: primaryColor,
        secondaryColor: secondaryColor
    };
    
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    showAlert('Preferências de acessibilidade salvas com sucesso!', 'success');
    
    // Apply settings immediately
    loadAccessibilitySettings();
}

function resetAccessibilitySettings() {
    // Clear localStorage
    localStorage.removeItem('accessibilitySettings');
    
    // Reset to defaults
    document.body.className = '';
    document.body.style.fontSize = '100%';
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.body.removeAttribute('data-custom-colors');
    
    // Remove custom gradient style
    const customStyle = document.getElementById('custom-gradient-style');
    if (customStyle) customStyle.remove();
    
    // Remove keyboard nav style
    const keyboardStyle = document.getElementById('keyboard-nav-style');
    if (keyboardStyle) keyboardStyle.remove();
    
    // Reset toggles
    if (document.getElementById('highContrastToggle')) document.getElementById('highContrastToggle').checked = false;
    if (document.getElementById('reducedMotionToggle')) document.getElementById('reducedMotionToggle').checked = false;
    if (document.getElementById('screenReaderToggle')) document.getElementById('screenReaderToggle').checked = false;
    if (document.getElementById('keyboardNavToggle')) document.getElementById('keyboardNavToggle').checked = true;
    
    // Reset font size buttons
    document.querySelectorAll('.font-size-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === 'normal');
    });
    
    // Reset theme
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === 'light');
    });
    
    // Reset colors
    if (document.getElementById('primaryColorPicker')) {
        document.getElementById('primaryColorPicker').value = '#667eea';
        document.getElementById('primaryColorText').value = '#667eea';
    }
    if (document.getElementById('secondaryColorPicker')) {
        document.getElementById('secondaryColorPicker').value = '#764ba2';
        document.getElementById('secondaryColorText').value = '#764ba2';
    }
    
    // Reset CSS variables
    document.documentElement.style.setProperty('--primary-color', '#667eea');
    document.documentElement.style.setProperty('--secondary-color', '#764ba2');
    
    // Reload page to ensure all styles are reset
    showAlert('Configurações restauradas! Recarregando página...', 'success');
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// Keyboard shortcuts help
function showKeyboardShortcuts() {
    const shortcuts = `
    Atalhos de Teclado Disponíveis:
    
    Alt + H = Voltar para Home
    Alt + P = Ir para o topo da página
    Escape = Fechar alertas
    Tab = Navegar entre elementos
    Shift + Tab = Navegar para trás
    Enter/Space = Ativar botões e links
    `;
    
    console.log(shortcuts);
}

// Add keyboard shortcuts info on Ctrl+/
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        showKeyboardShortcuts();
        showAlert('Atalhos de teclado exibidos no console (F12)', 'success');
    }
});


// ==========================================
// FUNÇÕES DE SALVAMENTO E APLICAÇÃO
// ==========================================

function saveAccessibilitySettings() {
    const primaryColor = document.getElementById('primaryColorPicker')?.value || '#667eea';
    const secondaryColor = document.getElementById('secondaryColorPicker')?.value || '#764ba2';
    
    const settings = {
        fontSize: document.querySelector('.font-size-btn.active')?.dataset.size || 'normal',
        highContrast: document.getElementById('highContrastToggle')?.checked || false,
        reducedMotion: document.getElementById('reducedMotionToggle')?.checked || false,
        screenReader: document.getElementById('screenReaderToggle')?.checked || false,
        keyboardNav: document.getElementById('keyboardNavToggle')?.checked !== false,
        theme: document.querySelector('.theme-option.active')?.dataset.theme || 'light',
        primaryColor: primaryColor,
        secondaryColor: secondaryColor
    };
    
    console.log('Salvando configurações:', settings);
    
    // Salvar no localStorage
    try {
        localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
        console.log('Configurações salvas com sucesso no localStorage');
        
        // Verificar se foi salvo
        const saved = localStorage.getItem('accessibilitySettings');
        console.log('Verificação - Configurações salvas:', saved);
        
        showAlert('Preferências de acessibilidade salvas com sucesso!', 'success');
        
        // Apply settings immediately
        setTimeout(() => {
            loadAccessibilitySettings();
            
            // Também notificar o sistema global
            if (window.AccessibilitySystem) {
                window.AccessibilitySystem.reload();
            }
        }, 300);
        
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        showAlert('Erro ao salvar configurações: ' + error.message, 'error');
    }
}

function applyCustomColors(primary, secondary) {
    console.log('Aplicando cores personalizadas:', primary, secondary);
    
    // Remove theme classes to apply custom colors
    document.body.classList.remove('high-contrast', 'dark-theme');
    const themeStyle = document.getElementById('theme-style');
    if (themeStyle) themeStyle.remove();
    
    // Update CSS variables
    document.documentElement.style.setProperty('--primary-color', primary);
    document.documentElement.style.setProperty('--secondary-color', secondary);
    
    // Enable custom colors mode
    document.body.setAttribute('data-custom-colors', 'true');
    
    // Force update of all elements with gradients
    const gradient = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
    const gradientHorizontal = `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`;
    
    // Update body background
    document.body.style.background = gradient;
    
    // Remove existing custom style
    const existingStyle = document.getElementById('custom-gradient-style');
    if (existingStyle) existingStyle.remove();
    
    // Create comprehensive custom style
    const style = document.createElement('style');
    style.id = 'custom-gradient-style';
    style.textContent = `
        body[data-custom-colors="true"] {
            background: ${gradient} !important;
        }
        
        body[data-custom-colors="true"] .perfil-avatar {
            background: ${gradient} !important;
        }
        
        body[data-custom-colors="true"] .perfil-header::before {
            background: ${gradientHorizontal} !important;
        }
        
        body[data-custom-colors="true"] .btn-primary {
            background: ${gradient} !important;
        }
        
        body[data-custom-colors="true"] .toggle-switch input:checked + .toggle-slider {
            background: ${gradient} !important;
        }
        
        body[data-custom-colors="true"] .font-size-btn.active {
            background: ${gradient} !important;
        }
        
        body[data-custom-colors="true"] .card-title svg {
            stroke: ${primary} !important;
        }
        
        body[data-custom-colors="true"] .form-input:focus {
            border-color: ${primary} !important;
        }
        
        body[data-custom-colors="true"] .font-size-btn:hover {
            border-color: ${primary} !important;
            color: ${primary} !important;
        }
        
        body[data-custom-colors="true"] .theme-option.active {
            border-color: ${primary} !important;
        }
        
        body[data-custom-colors="true"] .theme-option:hover {
            border-color: ${primary} !important;
        }
    `;
    document.head.appendChild(style);
    
    // Update theme selector to show custom
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('active');
    });
}

function applyFontSize(size) {
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

function disableKeyboardNavigation() {
    const style = document.getElementById('keyboard-nav-style');
    if (style) {
        style.remove();
    }
}


function loadAccessibilitySettings() {
    const settings = JSON.parse(localStorage.getItem('accessibilitySettings') || '{}');
    
    console.log('Carregando configurações:', settings);
    
    // Apply font size
    if (settings.fontSize) {
        applyFontSize(settings.fontSize);
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === settings.fontSize);
        });
    }
    
    // Apply high contrast
    if (settings.highContrast) {
        document.body.classList.add('high-contrast');
        const toggle = document.getElementById('highContrastToggle');
        if (toggle) toggle.checked = true;
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
        document.body.classList.add('reduced-motion');
        const toggle = document.getElementById('reducedMotionToggle');
        if (toggle) toggle.checked = true;
    }
    
    // Apply screen reader support
    if (settings.screenReader) {
        enableScreenReaderSupport();
        const toggle = document.getElementById('screenReaderToggle');
        if (toggle) toggle.checked = true;
    }
    
    // Apply keyboard navigation
    if (settings.keyboardNav !== false) {
        enableKeyboardNavigation();
        const toggle = document.getElementById('keyboardNavToggle');
        if (toggle) toggle.checked = true;
    }
    
    // Apply theme
    if (settings.theme) {
        applyTheme(settings.theme);
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === settings.theme);
        });
    }
    
    // Apply custom colors
    if (settings.primaryColor && settings.secondaryColor) {
        const primaryPicker = document.getElementById('primaryColorPicker');
        const secondaryPicker = document.getElementById('secondaryColorPicker');
        const primaryText = document.getElementById('primaryColorText');
        const secondaryText = document.getElementById('secondaryColorText');
        
        if (primaryPicker) {
            primaryPicker.value = settings.primaryColor;
            if (primaryText) primaryText.value = settings.primaryColor;
        }
        if (secondaryPicker) {
            secondaryPicker.value = settings.secondaryColor;
            if (secondaryText) secondaryText.value = settings.secondaryColor;
        }
        
        applyCustomColors(settings.primaryColor, settings.secondaryColor);
    }
    
    console.log('Configurações aplicadas com sucesso!');
}


function setupAccessibilityControls() {
    console.log('Configurando controles de acessibilidade...');
    
    // Font size buttons
    const fontSizeBtns = document.querySelectorAll('.font-size-btn');
    console.log('Botões de tamanho de fonte encontrados:', fontSizeBtns.length);
    
    fontSizeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const size = btn.dataset.size;
            console.log('Tamanho de fonte selecionado:', size);
            applyFontSize(size);
            
            document.querySelectorAll('.font-size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // High contrast toggle
    const highContrastToggle = document.getElementById('highContrastToggle');
    console.log('Toggle alto contraste encontrado:', !!highContrastToggle);
    if (highContrastToggle) {
        highContrastToggle.addEventListener('change', (e) => {
            console.log('Alto contraste alterado:', e.target.checked);
            if (e.target.checked) {
                // Remove dark theme if active
                document.body.classList.remove('dark-theme');
                const themeStyle = document.getElementById('theme-style');
                if (themeStyle) themeStyle.remove();
                
                // Apply high contrast
                document.body.classList.add('high-contrast');
                document.body.style.background = '#000000';
                
                // Update theme selector
                document.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.theme === 'high-contrast');
                });
                
                showAlert('Alto contraste ativado', 'success');
            } else {
                document.body.classList.remove('high-contrast');
                document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                
                // Update theme selector to light
                document.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.theme === 'light');
                });
                
                showAlert('Alto contraste desativado', 'success');
            }
        });
    }
    
    // Reduced motion toggle
    const reducedMotionToggle = document.getElementById('reducedMotionToggle');
    console.log('Toggle reduzir animações encontrado:', !!reducedMotionToggle);
    if (reducedMotionToggle) {
        reducedMotionToggle.addEventListener('change', (e) => {
            console.log('Reduzir animações alterado:', e.target.checked);
            if (e.target.checked) {
                document.body.classList.add('reduced-motion');
                showAlert('Animações reduzidas', 'success');
            } else {
                document.body.classList.remove('reduced-motion');
                showAlert('Animações normais', 'success');
            }
        });
    }
    
    // Screen reader toggle
    const screenReaderToggle = document.getElementById('screenReaderToggle');
    console.log('Toggle leitor de tela encontrado:', !!screenReaderToggle);
    if (screenReaderToggle) {
        screenReaderToggle.addEventListener('change', (e) => {
            console.log('Leitor de tela alterado:', e.target.checked);
            if (e.target.checked) {
                enableScreenReaderSupport();
                showAlert('Suporte a leitor de tela ativado', 'success');
            } else {
                disableScreenReaderSupport();
                showAlert('Suporte a leitor de tela desativado', 'success');
            }
        });
    }
    
    // Keyboard navigation toggle
    const keyboardNavToggle = document.getElementById('keyboardNavToggle');
    console.log('Toggle navegação por teclado encontrado:', !!keyboardNavToggle);
    if (keyboardNavToggle) {
        keyboardNavToggle.addEventListener('change', (e) => {
            console.log('Navegação por teclado alterada:', e.target.checked);
            if (e.target.checked) {
                enableKeyboardNavigation();
                showAlert('Navegação por teclado aprimorada ativada', 'success');
            } else {
                disableKeyboardNavigation();
                showAlert('Navegação por teclado aprimorada desativada', 'success');
            }
        });
    }
    
    // Theme selection
    const themeOptions = document.querySelectorAll('.theme-option');
    console.log('Opções de tema encontradas:', themeOptions.length);
    
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            console.log('Tema selecionado:', theme);
            applyTheme(theme);
            
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Color pickers
    const primaryColorPicker = document.getElementById('primaryColorPicker');
    const secondaryColorPicker = document.getElementById('secondaryColorPicker');
    const primaryColorText = document.getElementById('primaryColorText');
    const secondaryColorText = document.getElementById('secondaryColorText');
    
    if (primaryColorPicker) {
        primaryColorPicker.addEventListener('input', (e) => {
            if (primaryColorText) primaryColorText.value = e.target.value;
            if (secondaryColorPicker) {
                applyCustomColors(e.target.value, secondaryColorPicker.value);
            }
        });
    }
    
    if (secondaryColorPicker) {
        secondaryColorPicker.addEventListener('input', (e) => {
            if (secondaryColorText) secondaryColorText.value = e.target.value;
            if (primaryColorPicker) {
                applyCustomColors(primaryColorPicker.value, e.target.value);
            }
        });
    }
    
    // Color presets
    const colorPresets = document.querySelectorAll('.color-preset');
    console.log('Botões de preset de cores encontrados:', colorPresets.length);
    
    colorPresets.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const primary = btn.dataset.primary;
            const secondary = btn.dataset.secondary;
            
            console.log('Preset selecionado:', primary, secondary);
            
            // Visual feedback
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
            
            if (primaryColorPicker) primaryColorPicker.value = primary;
            if (secondaryColorPicker) secondaryColorPicker.value = secondary;
            if (primaryColorText) primaryColorText.value = primary;
            if (secondaryColorText) secondaryColorText.value = secondary;
            
            applyCustomColors(primary, secondary);
            
            // Show which preset was selected
            const presetName = btn.textContent.trim();
            showAlert(`Cores ${presetName} aplicadas!`, 'success');
        });
    });
    
    // Save accessibility settings
    const saveBtn = document.getElementById('saveAccessibilityBtn');
    console.log('Botão salvar encontrado:', !!saveBtn);
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            console.log('Salvando configurações de acessibilidade...');
            saveAccessibilitySettings();
        });
    }
    
    // Reset accessibility settings
    const resetBtn = document.getElementById('resetAccessibilityBtn');
    console.log('Botão resetar encontrado:', !!resetBtn);
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            console.log('Resetando configurações de acessibilidade...');
            resetAccessibilitySettings();
        });
    }
    
    console.log('Controles de acessibilidade configurados com sucesso!');
}
