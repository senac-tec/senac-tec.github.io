// Gerenciamento de Usuários
const API_URL = 'http://localhost:5000/api';
let usuarios = [];
let editingId = null;

// Carregar usuários ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadUsuarios();
    setupSearch();
    setupForm();
});

async function loadUsuarios() {
    try {
        const response = await authManager.fetchWithAuth(`${API_URL}/usuarios`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar usuários');
        }
        
        usuarios = await response.json();
        renderUsuarios(usuarios);
    } catch (error) {
        console.error('Erro:', error);
        showAlert(error.message || 'Erro ao carregar usuários', 'error');
    }
}

function renderUsuarios(usuariosList) {
    const grid = document.getElementById('usuariosGrid');
    
    if (usuariosList.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
                <p>Nenhum usuário encontrado</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = usuariosList.map(usuario => `
        <div class="usuario-card">
            <div class="usuario-info">
                <h3>${usuario.nome}</h3>
                <div class="usuario-details">
                    <div class="usuario-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        ${usuario.email}
                    </div>
                    <div class="usuario-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                        </svg>
                        ${usuario.telefone || 'Não informado'}
                    </div>
                    <span class="cargo-badge cargo-${usuario.cargo}">
                        ${getCargoLabel(usuario.cargo)}
                    </span>
                    <span class="status-badge status-${usuario.status}">
                        ${usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
            </div>
            <div class="usuario-actions">
                <button class="btn-icon edit" onclick="editUsuario(${usuario.id})" title="Editar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="btn-icon delete" onclick="deleteUsuario(${usuario.id}, '${usuario.nome}')" title="Excluir">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
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

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = usuarios.filter(usuario => 
            usuario.nome.toLowerCase().includes(term) ||
            usuario.email.toLowerCase().includes(term) ||
            usuario.cargo.toLowerCase().includes(term)
        );
        renderUsuarios(filtered);
    });
}

function setupForm() {
    const form = document.getElementById('usuarioForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveUsuario();
    });
}

function openModal(id = null) {
    const modal = document.getElementById('usuarioModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('usuarioForm');
    const senhaGroup = document.getElementById('senhaGroup');
    const senhaInput = document.getElementById('senha');
    
    form.reset();
    editingId = id;
    
    if (id) {
        modalTitle.textContent = 'Editar Usuário';
        senhaGroup.style.display = 'none';
        senhaInput.required = false;
        loadUsuarioData(id);
    } else {
        modalTitle.textContent = 'Novo Usuário';
        senhaGroup.style.display = 'block';
        senhaInput.required = true;
    }
    
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('usuarioModal');
    modal.classList.remove('active');
    editingId = null;
}

async function loadUsuarioData(id) {
    try {
        const response = await authManager.fetchWithAuth(`${API_URL}/usuarios/${id}`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar dados do usuário');
        }
        
        const usuario = await response.json();
        
        document.getElementById('usuarioId').value = usuario.id;
        document.getElementById('nome').value = usuario.nome;
        document.getElementById('email').value = usuario.email;
        document.getElementById('cpf').value = usuario.cpf;
        document.getElementById('telefone').value = usuario.telefone || '';
        document.getElementById('cargo').value = usuario.cargo;
        document.getElementById('status').value = usuario.status;
    } catch (error) {
        console.error('Erro:', error);
        showAlert(error.message || 'Erro ao carregar dados do usuário', 'error');
    }
}

async function saveUsuario() {
    const id = editingId;
    const data = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        cpf: document.getElementById('cpf').value,
        telefone: document.getElementById('telefone').value,
        cargo: document.getElementById('cargo').value,
        status: document.getElementById('status').value
    };
    
    // Adicionar senha apenas se for novo usuário
    if (!id) {
        data.senha = document.getElementById('senha').value;
    }
    
    try {
        const url = id ? `${API_URL}/usuarios/${id}` : `${API_URL}/usuarios`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await authManager.fetchWithAuth(url, {
            method: method,
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao salvar usuário');
        }
        
        showAlert(id ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!', 'success');
        closeModal();
        loadUsuarios();
    } catch (error) {
        console.error('Erro:', error);
        showAlert(error.message || 'Erro ao salvar usuário', 'error');
    }
}

function editUsuario(id) {
    openModal(id);
}

async function deleteUsuario(id, nome) {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) {
        return;
    }
    
    try {
        const response = await authManager.fetchWithAuth(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao excluir usuário');
        }
        
        showAlert('Usuário excluído com sucesso!', 'success');
        loadUsuarios();
    } catch (error) {
        console.error('Erro:', error);
        showAlert(error.message || 'Erro ao excluir usuário', 'error');
    }
}

function showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    const icon = type === 'success' 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    
    alert.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Fechar modal ao clicar fora
document.getElementById('usuarioModal').addEventListener('click', (e) => {
    if (e.target.id === 'usuarioModal') {
        closeModal();
    }
});
