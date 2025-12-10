// Sistema de Permissões Granulares
const PERMISSIONS_MAP = {
    'admin': ['all'],
    'diretor': ['all'],
    
    'coordenador': [
        'view_dashboard',
        'view_alunos', 'create_alunos', 'edit_alunos', 'delete_alunos',
        'view_professores',
        'view_turmas', 'create_turmas', 'edit_turmas', 'delete_turmas',
        'view_notas', 'create_notas', 'edit_notas', 'delete_notas',
        'view_frequencia', 'create_frequencia', 'edit_frequencia', 'delete_frequencia',
        'view_eventos', 'create_eventos', 'edit_eventos', 'delete_eventos',
        'view_relatorios',
        'view_matriculas', 'create_matriculas', 'edit_matriculas', 'delete_matriculas'
    ],
    
    'professor': [
        'view_dashboard',
        'view_alunos',
        'view_turmas',
        'view_notas', 'create_notas', 'edit_notas',
        'view_frequencia', 'create_frequencia', 'edit_frequencia',
        'view_eventos'
    ],
    
    'secretaria': [
        'view_dashboard',
        'view_alunos', 'create_alunos', 'edit_alunos',
        'view_professores',
        'view_turmas',
        'view_matriculas', 'create_matriculas', 'edit_matriculas', 'delete_matriculas'
    ]
};

// Função para verificar se o usuário tem uma permissão específica
function hasPermission(permission) {
    if (!authManager || !authManager.currentUser) return false;
    
    const cargo = authManager.currentUser.role || authManager.currentUser.cargo;
    
    // Admin e diretor têm todas as permissões
    if (cargo === 'admin' || cargo === 'diretor') return true;
    
    // Verificar permissão específica
    const userPermissions = PERMISSIONS_MAP[cargo] || [];
    return userPermissions.includes(permission);
}

// Função para ocultar elementos baseado em permissões
function applyPermissionsToPage() {
    // Ocultar botões de criar
    document.querySelectorAll('[data-permission-create]').forEach(btn => {
        const permission = btn.getAttribute('data-permission-create');
        if (!hasPermission(`create_${permission}`)) {
            btn.style.display = 'none';
        }
    });
    
    // Ocultar botões de editar
    document.querySelectorAll('[data-permission-edit]').forEach(btn => {
        const permission = btn.getAttribute('data-permission-edit');
        if (!hasPermission(`edit_${permission}`)) {
            btn.style.display = 'none';
        }
    });
    
    // Ocultar botões de excluir
    document.querySelectorAll('[data-permission-delete]').forEach(btn => {
        const permission = btn.getAttribute('data-permission-delete');
        if (!hasPermission(`delete_${permission}`)) {
            btn.style.display = 'none';
        }
    });
    
    // Ocultar seções inteiras
    document.querySelectorAll('[data-permission-view]').forEach(section => {
        const permission = section.getAttribute('data-permission-view');
        if (!hasPermission(`view_${permission}`)) {
            section.style.display = 'none';
        }
    });
}

// Função para mostrar mensagem de permissão negada
function showPermissionDenied(action = 'realizar esta ação') {
    if (typeof showAlert === 'function') {
        showAlert(`Você não tem permissão para ${action}.`, 'error');
    } else {
        alert(`Você não tem permissão para ${action}.`);
    }
}

// Descrições amigáveis das permissões por cargo
const CARGO_DESCRIPTIONS = {
    'admin': {
        title: 'Administrador',
        color: '#dc2626',
        permissions: [
            '✅ Acesso total ao sistema',
            '✅ Gerenciar usuários',
            '✅ Todas as funcionalidades'
        ]
    },
    'diretor': {
        title: 'Diretor',
        color: '#dc2626',
        permissions: [
            '✅ Acesso total ao sistema',
            '✅ Gerenciar usuários',
            '✅ Todas as funcionalidades'
        ]
    },
    'coordenador': {
        title: 'Coordenador',
        color: '#2563eb',
        permissions: [
            '✅ Criar/Editar/Excluir alunos',
            '✅ Gerenciar turmas',
            '✅ Lançar notas (todas as turmas)',
            '✅ Registrar frequência (todas as turmas)',
            '✅ Criar eventos',
            '✅ Visualizar relatórios',
            '❌ Gerenciar usuários'
        ]
    },
    'professor': {
        title: 'Professor',
        color: '#16a34a',
        permissions: [
            '✅ Visualizar alunos (suas turmas)',
            '✅ Lançar notas (suas turmas)',
            '✅ Registrar frequência (suas turmas)',
            '✅ Visualizar calendário',
            '❌ Criar/Editar/Excluir alunos',
            '❌ Criar eventos',
            '❌ Visualizar relatórios'
        ]
    },
    'secretaria': {
        title: 'Secretaria',
        color: '#9333ea',
        permissions: [
            '✅ Criar/Editar alunos',
            '✅ Gerenciar matrículas',
            '✅ Visualizar professores',
            '❌ Excluir alunos',
            '❌ Editar professores',
            '❌ Lançar notas',
            '❌ Registrar frequência'
        ]
    }
};

// Função para obter descrição do cargo
function getCargoDescription(cargo) {
    return CARGO_DESCRIPTIONS[cargo] || {
        title: cargo,
        color: '#64748b',
        permissions: []
    };
}

// Aplicar permissões quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(applyPermissionsToPage, 100);
    });
} else {
    setTimeout(applyPermissionsToPage, 100);
}
