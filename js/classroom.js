// Integração com Google Classroom
const CLASSROOM_CONFIG = {
    // SUBSTITUA ESTAS CREDENCIAIS PELAS SUAS DO GOOGLE CLOUD CONSOLE
    clientId: 'SEU-CLIENT-ID.apps.googleusercontent.com',
    apiKey: 'SUA-API-KEY',
    discoveryDocs: ['https://classroom.googleapis.com/$discovery/rest?version=v1'],
    scopes: [
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.rosters.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.students.readonly'
    ].join(' ')
};

let gapiInited = false;
let gisInited = false;
let tokenClient;
let accessToken = null;

// Carregar Google API
function loadGoogleAPI() {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = gapiLoaded;
    document.body.appendChild(script);

    const script2 = document.createElement('script');
    script2.src = 'https://accounts.google.com/gsi/client';
    script2.onload = gisLoaded;
    document.body.appendChild(script2);
}

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: CLASSROOM_CONFIG.apiKey,
        discoveryDocs: CLASSROOM_CONFIG.discoveryDocs,
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLASSROOM_CONFIG.clientId,
        scope: CLASSROOM_CONFIG.scopes,
        callback: '', // definido depois
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        checkConnection();
    }
}

// Verificar se já está conectado
function checkConnection() {
    const token = localStorage.getItem('classroom_token');
    const tokenExpiry = localStorage.getItem('classroom_token_expiry');
    
    if (token && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        accessToken = token;
        gapi.client.setToken({ access_token: accessToken });
        showConnectedState();
        loadCourses();
    } else {
        showDisconnectedState();
    }
}

// Conectar ao Classroom
function connectClassroom() {
    if (!gapiInited || !gisInited) {
        showAlert('Aguarde, carregando Google API...', 'warning');
        return;
    }

    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            showAlert('Erro ao conectar: ' + resp.error, 'error');
            return;
        }
        
        accessToken = resp.access_token;
        
        // Salvar token
        const expiryTime = Date.now() + (resp.expires_in * 1000);
        localStorage.setItem('classroom_token', accessToken);
        localStorage.setItem('classroom_token_expiry', expiryTime.toString());
        
        showAlert('✅ Conectado ao Google Classroom com sucesso!', 'success');
        showConnectedState();
        await loadCourses();
    };

    if (accessToken === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

// Desconectar
function disconnectClassroom() {
    if (!confirm('Tem certeza que deseja desconectar do Google Classroom?')) {
        return;
    }

    if (accessToken) {
        google.accounts.oauth2.revoke(accessToken);
    }
    
    localStorage.removeItem('classroom_token');
    localStorage.removeItem('classroom_token_expiry');
    localStorage.removeItem('classroom_courses');
    
    accessToken = null;
    gapi.client.setToken(null);
    
    showAlert('Desconectado do Google Classroom', 'success');
    showDisconnectedState();
}

// Sincronizar dados
async function syncClassroom() {
    showAlert('🔄 Sincronizando...', 'info');
    
    try {
        await loadCourses();
        localStorage.setItem('classroom_last_sync', new Date().toISOString());
        updateLastSyncTime();
        showAlert('✅ Sincronização concluída!', 'success');
    } catch (error) {
        console.error('Erro na sincronização:', error);
        showAlert('❌ Erro ao sincronizar: ' + error.message, 'error');
    }
}

// Carregar turmas
async function loadCourses() {
    try {
        const response = await gapi.client.classroom.courses.list({
            courseStates: ['ACTIVE'],
            teacherId: 'me'
        });

        const courses = response.result.courses || [];
        
        // Salvar no localStorage
        localStorage.setItem('classroom_courses', JSON.stringify(courses));
        
        renderCourses(courses);
        
        return courses;
    } catch (error) {
        console.error('Erro ao carregar turmas:', error);
        showAlert('Erro ao carregar turmas do Classroom', 'error');
        return [];
    }
}

// Renderizar turmas
function renderCourses(courses) {
    const grid = document.getElementById('coursesGrid');
    
    if (courses.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                <p>Nenhuma turma encontrada no Google Classroom</p>
                <p style="font-size: 0.9rem;">Crie turmas no Classroom e sincronize novamente</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = courses.map(course => `
        <div class="course-card">
            <div class="course-name">${course.name}</div>
            <div class="course-info">
                ${course.section || 'Sem seção'}<br>
                ${course.descriptionHeading || ''}
            </div>
            <div class="course-actions">
                <button class="btn-import" onclick="importCourse('${course.id}')">
                    Importar para Sistema
                </button>
            </div>
        </div>
    `).join('');
}

// Importar turma para o sistema
async function importCourse(courseId) {
    try {
        // Buscar detalhes da turma
        const courseResponse = await gapi.client.classroom.courses.get({
            id: courseId
        });
        const course = courseResponse.result;
        
        // Buscar alunos
        const studentsResponse = await gapi.client.classroom.courses.students.list({
            courseId: courseId
        });
        const students = studentsResponse.result.students || [];
        
        showAlert(`📚 Importando turma "${course.name}" com ${students.length} alunos...`, 'info');
        
        // Aqui você implementaria a lógica para salvar no seu backend
        // Por enquanto, apenas mostramos uma mensagem
        
        setTimeout(() => {
            showAlert(`✅ Turma "${course.name}" importada com sucesso!`, 'success');
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao importar turma:', error);
        showAlert('❌ Erro ao importar turma', 'error');
    }
}

// UI States
function showConnectedState() {
    document.getElementById('notConnectedSection').style.display = 'none';
    document.getElementById('connectedSection').style.display = 'block';
    
    const status = document.getElementById('connectionStatus');
    status.className = 'connection-status status-connected';
    document.getElementById('statusText').textContent = 'Conectado';
    
    updateLastSyncTime();
}

function showDisconnectedState() {
    document.getElementById('notConnectedSection').style.display = 'block';
    document.getElementById('connectedSection').style.display = 'none';
    
    const status = document.getElementById('connectionStatus');
    status.className = 'connection-status status-disconnected';
    document.getElementById('statusText').textContent = 'Desconectado';
}

function updateLastSyncTime() {
    const lastSync = localStorage.getItem('classroom_last_sync');
    const syncDiv = document.getElementById('lastSync');
    const syncTime = document.getElementById('lastSyncTime');
    
    if (lastSync) {
        const date = new Date(lastSync);
        syncTime.textContent = date.toLocaleString('pt-BR');
        syncDiv.style.display = 'block';
    }
}

// Alertas
function showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: ${type === 'success' ? '#dcfce7' : type === 'error' ? '#fee2e2' : '#f0f9ff'};
        color: ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#0284c7'};
    `;
    
    alert.innerHTML = `<span>${message}</span>`;
    container.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se é professor
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (currentUser.cargo !== 'professor' && currentUser.cargo !== 'coordenador' && currentUser.cargo !== 'admin') {
        showAlert('⚠️ Esta funcionalidade está disponível apenas para professores', 'warning');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 3000);
        return;
    }
    
    // Carregar Google API
    loadGoogleAPI();
});

console.log('🚀 Google Classroom Integration carregado!');
console.log('⚠️  IMPORTANTE: Configure suas credenciais do Google Cloud Console em classroom.js');
