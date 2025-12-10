// Global Notifications System
class GlobalNotifications {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.isVisible = false;
        this.init();
    }

    init() {
        this.loadNotifications();
        this.createNotificationDropdown();
        this.setupEventListeners();
        this.updateBadge();
        
        // Auto-refresh notifications every 30 seconds
        setInterval(() => {
            this.loadNotifications();
        }, 30000);
    }

    setupEventListeners() {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notifications-btn') && !e.target.closest('.notification-dropdown')) {
                this.hideDropdown();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hideDropdown();
            }
        });
    }

    async loadNotifications() {
        try {
            // Simulate API call - in real app, this would fetch from backend
            const notifications = this.generateSampleNotifications();
            this.notifications = notifications;
            this.unreadCount = notifications.filter(n => !n.read).length;
            this.updateBadge();
            this.updateDropdownContent();
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        }
    }

    generateSampleNotifications() {
        const now = new Date();
        const notifications = [
            {
                id: 1,
                type: 'system',
                title: 'Novo usuário cadastrado',
                message: 'Um novo professor foi cadastrado no sistema',
                time: new Date(now - 5 * 60 * 1000), // 5 minutes ago
                read: false,
                icon: 'user-plus'
            },
            {
                id: 2,
                type: 'event',
                title: 'Reunião de pais amanhã',
                message: 'Lembrete: Reunião de pais e mestres às 19:00',
                time: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
                read: false,
                icon: 'calendar'
            },
            {
                id: 3,
                type: 'warning',
                title: 'Backup do sistema',
                message: 'Backup automático será executado hoje às 23:00',
                time: new Date(now - 4 * 60 * 60 * 1000), // 4 hours ago
                read: true,
                icon: 'alert-triangle'
            },
            {
                id: 4,
                type: 'info',
                title: 'Novas notas lançadas',
                message: '15 novas notas foram adicionadas ao sistema',
                time: new Date(now - 6 * 60 * 60 * 1000), // 6 hours ago
                read: false,
                icon: 'file-text'
            }
        ];

        return notifications.sort((a, b) => b.time - a.time);
    }

    createNotificationDropdown() {
        // Remove existing dropdown if any
        const existingDropdown = document.querySelector('.notification-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'notification-dropdown';
        dropdown.innerHTML = `
            <div class="notification-dropdown-header">
                <h3>Notificações</h3>
                <div class="notification-dropdown-actions">
                    <button class="notification-action-btn" onclick="globalNotifications.markAllAsRead()" title="Marcar todas como lidas">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 12l2 2 4-4"/>
                            <circle cx="12" cy="12" r="10"/>
                        </svg>
                    </button>
                    <button class="notification-action-btn" onclick="globalNotifications.hideDropdown()" title="Fechar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="notification-dropdown-content">
                <div class="notification-loading">
                    <div class="spinner-small"></div>
                    <span>Carregando...</span>
                </div>
            </div>
            <div class="notification-dropdown-footer">
                <a href="notificacoes.html" class="notification-view-all">Ver todas as notificações</a>
            </div>
        `;

        document.body.appendChild(dropdown);
    }

    updateBadge() {
        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    }

    updateDropdownContent() {
        const content = document.querySelector('.notification-dropdown-content');
        if (!content) return;

        if (this.notifications.length === 0) {
            content.innerHTML = `
                <div class="notification-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                    <p>Nenhuma notificação</p>
                </div>
            `;
            return;
        }

        // Show only the 5 most recent notifications in dropdown
        const recentNotifications = this.notifications.slice(0, 5);
        
        content.innerHTML = recentNotifications.map(notification => `
            <div class="notification-dropdown-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                <div class="notification-dropdown-icon ${notification.type}">
                    ${this.getNotificationIcon(notification.icon)}
                </div>
                <div class="notification-dropdown-content-text">
                    <div class="notification-dropdown-title">${notification.title}</div>
                    <div class="notification-dropdown-message">${notification.message}</div>
                    <div class="notification-dropdown-time">${this.getTimeAgo(notification.time)}</div>
                </div>
                <button class="notification-dropdown-close" onclick="globalNotifications.dismissNotification(${notification.id})" title="Dispensar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    getNotificationIcon(iconType) {
        const icons = {
            'user-plus': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="8.5" cy="7" r="4"/>
                            <line x1="20" y1="8" x2="20" y2="14"/>
                            <line x1="23" y1="11" x2="17" y2="11"/>
                          </svg>`,
            'calendar': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                           <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                           <line x1="16" y1="2" x2="16" y2="6"/>
                           <line x1="8" y1="2" x2="8" y2="6"/>
                           <line x1="3" y1="10" x2="21" y2="10"/>
                         </svg>`,
            'alert-triangle': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                 <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                 <line x1="12" y1="9" x2="12" y2="13"/>
                                 <line x1="12" y1="17" x2="12.01" y2="17"/>
                               </svg>`,
            'file-text': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                          </svg>`
        };
        return icons[iconType] || icons['file-text'];
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Agora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }

    toggleDropdown() {
        const dropdown = document.querySelector('.notification-dropdown');
        const button = document.querySelector('.notifications-btn');
        
        if (!dropdown || !button) return;

        if (this.isVisible) {
            this.hideDropdown();
        } else {
            this.showDropdown();
        }
    }

    showDropdown() {
        const dropdown = document.querySelector('.notification-dropdown');
        const button = document.querySelector('.notifications-btn');
        
        if (!dropdown || !button) return;

        // Position dropdown
        const rect = button.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + 8}px`;
        dropdown.style.right = `${window.innerWidth - rect.right}px`;
        
        dropdown.classList.add('visible');
        this.isVisible = true;
        
        // Mark notifications as read when dropdown is opened
        setTimeout(() => {
            this.markVisibleAsRead();
        }, 1000);
    }

    hideDropdown() {
        const dropdown = document.querySelector('.notification-dropdown');
        if (dropdown) {
            dropdown.classList.remove('visible');
        }
        this.isVisible = false;
    }

    markVisibleAsRead() {
        let hasChanges = false;
        this.notifications.forEach(notification => {
            if (!notification.read) {
                notification.read = true;
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            this.unreadCount = 0;
            this.updateBadge();
            this.updateDropdownContent();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.unreadCount = 0;
        this.updateBadge();
        this.updateDropdownContent();
    }

    dismissNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        this.updateBadge();
        this.updateDropdownContent();
    }

    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            read: false,
            time: new Date(),
            ...notification
        };
        
        this.notifications.unshift(newNotification);
        this.unreadCount++;
        this.updateBadge();
        this.updateDropdownContent();
        
        // Show a brief animation
        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            badge.style.animation = 'none';
            badge.offsetHeight; // Trigger reflow
            badge.style.animation = 'pulse 2s infinite';
        });
    }
}

// Initialize global notifications
let globalNotifications;

// Function to toggle notifications dropdown
function toggleNotifications() {
    console.log('toggleNotifications called, globalNotifications:', globalNotifications);
    if (globalNotifications) {
        globalNotifications.toggleDropdown();
    } else {
        console.error('globalNotifications not initialized!');
        alert('Sistema de notificações não carregado. Recarregue a página.');
    }
}

// Debug function
window.debugNotifications = function() {
    console.log('=== DEBUG NOTIFICAÇÕES ===');
    console.log('globalNotifications:', globalNotifications);
    console.log('Botões encontrados:', document.querySelectorAll('.notifications-btn').length);
    console.log('Dropdown existe:', !!document.querySelector('.notification-dropdown'));
    console.log('Badge existe:', !!document.querySelector('.notification-badge'));
    
    if (globalNotifications) {
        console.log('Notificações:', globalNotifications.notifications.length);
        console.log('Não lidas:', globalNotifications.unreadCount);
        console.log('Dropdown visível:', globalNotifications.isVisible);
    }
};

// Initialize when DOM is loaded
function initializeNotifications() {
    if (!globalNotifications) {
        globalNotifications = new GlobalNotifications();
    }
    
    // Setup notification button click handlers
    const notificationButtons = document.querySelectorAll('.notifications-btn');
    notificationButtons.forEach(button => {
        // Remove existing onclick and add new event listener
        button.removeAttribute('onclick');
        
        // Remove existing listeners to avoid duplicates
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleNotifications();
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeNotifications);

// Also initialize after a short delay to catch any dynamically added buttons
setTimeout(initializeNotifications, 500);