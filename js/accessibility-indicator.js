// Indicador Visual de Acessibilidade Ativa
(function() {
    'use strict';
    
    function createAccessibilityIndicator() {
        const settings = JSON.parse(localStorage.getItem('accessibilitySettings') || '{}');
        
        // Verificar se há configurações personalizadas
        const hasCustomSettings = 
            settings.fontSize !== 'normal' ||
            settings.highContrast ||
            settings.reducedMotion ||
            settings.theme !== 'light' ||
            (settings.primaryColor && settings.primaryColor !== '#667eea');
        
        if (!hasCustomSettings) return;
        
        // Criar indicador
        const indicator = document.createElement('div');
        indicator.id = 'accessibility-indicator';
        indicator.innerHTML = `
            <div class="accessibility-badge" title="Configurações de acessibilidade ativas - Clique para configurar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
                <span>Acessibilidade Ativa</span>
                <button class="reset-btn" title="Restaurar padrão">✕</button>
            </div>
        `;
        
        // Estilos
        const style = document.createElement('style');
        style.textContent = `
            #accessibility-indicator {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
            }
            
            .accessibility-badge {
                background: rgba(102, 126, 234, 0.95);
                color: white;
                padding: 10px 15px;
                border-radius: 25px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .accessibility-badge:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .accessibility-badge svg {
                flex-shrink: 0;
            }
            
            body.high-contrast .accessibility-badge {
                background: #000000;
                border: 2px solid #ffffff;
            }
            
            body.dark-theme .accessibility-badge {
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .reset-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                transition: all 0.2s;
                margin-left: 5px;
            }
            
            .reset-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }
            
            @media (max-width: 768px) {
                .accessibility-badge span {
                    display: none;
                }
                
                .accessibility-badge {
                    padding: 10px;
                }
                
                .reset-btn {
                    margin-left: 0;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(indicator);
        
        // Clicar no badge para ir ao perfil
        const badge = indicator.querySelector('.accessibility-badge');
        badge.addEventListener('click', (e) => {
            if (!e.target.classList.contains('reset-btn')) {
                window.location.href = 'perfil.html#acessibilidade';
            }
        });
        
        // Botão de reset
        const resetBtn = indicator.querySelector('.reset-btn');
        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Deseja restaurar as configurações de acessibilidade para o padrão?')) {
                localStorage.removeItem('accessibilitySettings');
                window.location.reload();
            }
        });
    }
    
    // Criar indicador quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createAccessibilityIndicator);
    } else {
        createAccessibilityIndicator();
    }
})();
