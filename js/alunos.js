const API_URL = "http://localhost:5000/api"
let alunos = []
let turmas = []

// Carregar alunos
async function loadAlunos(search = "") {
  try {
    const url = search ? `${API_URL}/alunos?search=${encodeURIComponent(search)}` : `${API_URL}/alunos`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Erro ao carregar alunos');
    }
    
    alunos = await response.json()
    renderAlunos()
  } catch (error) {
    console.error("Erro ao carregar alunos:", error)
    document.getElementById("alunosTableBody").innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--danger);">
                    Erro ao carregar alunos. Verifique se o servidor está rodando.
                </td>
            </tr>
        `
  }
}

// Carregar turmas
async function loadTurmas() {
  try {
    const response = await fetch(`${API_URL}/turmas`)
    
    if (!response.ok) {
      throw new Error('Erro ao carregar turmas');
    }
    
    turmas = await response.json()
    populateTurmasSelect()
  } catch (error) {
    console.error("Erro ao carregar turmas:", error)
  }
}

// Popular select de turmas
function populateTurmasSelect() {
  const select = document.getElementById("turmaId")
  select.innerHTML = '<option value="">Selecione uma turma</option>'
  
  turmas.forEach(turma => {
    const option = document.createElement("option")
    option.value = turma.id
    option.textContent = `${turma.nome} - ${turma.turno}`
    select.appendChild(option)
  })
}

// Renderizar tabela de alunos
function renderAlunos() {
  const tbody = document.getElementById("alunosTableBody")

  if (alunos.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    Nenhum aluno encontrado
                </td>
            </tr>
        `
    return
  }

  // Verificar permissões
  const canEdit = hasPermission('edit_alunos')
  const canDelete = hasPermission('delete_alunos')

  tbody.innerHTML = alunos
    .map(
      (aluno) => `
        <tr>
            <td>${aluno.nome}</td>
            <td>${aluno.email}</td>
            <td>${aluno.cpf}</td>
            <td>${formatDate(aluno.data_nascimento)}</td>
            <td>${aluno.telefone || "-"}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(aluno.status)}">
                    ${aluno.status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewBoletim(${aluno.id})" title="Ver Boletim">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    Boletim
                </button>
                ${canEdit ? `<button class="btn btn-sm btn-secondary" onclick="editAluno(${aluno.id})">Editar</button>` : ''}
                ${canDelete ? `<button class="btn btn-sm btn-danger" onclick="deleteAluno(${aluno.id})">Excluir</button>` : ''}
            </td>
        </tr>
    `,
    )
    .join("")
}

// Formatar data
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR")
}

// Classe do badge de status
function getStatusBadgeClass(status) {
  switch (status) {
    case "ativo":
      return "badge-success"
    case "inativo":
      return "badge-danger"
    case "transferido":
      return "badge-warning"
    default:
      return "badge-success"
  }
}

// Abrir modal
async function openModal(id = null) {
  const modal = document.getElementById("alunoModal")
  const form = document.getElementById("alunoForm")
  const title = document.getElementById("modalTitle")

  form.reset()
  
  // Carregar turmas se ainda não foram carregadas
  if (turmas.length === 0) {
    await loadTurmas()
  }

  if (id) {
    title.textContent = "Editar Aluno"
    const aluno = alunos.find((a) => a.id === id)
    if (aluno) {
      document.getElementById("alunoId").value = aluno.id
      document.getElementById("nome").value = aluno.nome
      document.getElementById("email").value = aluno.email
      document.getElementById("cpf").value = aluno.cpf
      document.getElementById("dataNascimento").value = aluno.data_nascimento
      document.getElementById("telefone").value = aluno.telefone || ""
      document.getElementById("endereco").value = aluno.endereco || ""
      document.getElementById("status").value = aluno.status
      
      // Carregar turma atual do aluno (se houver matrícula)
      await loadAlunoTurma(aluno.id)
    }
  } else {
    title.textContent = "Novo Aluno"
    document.getElementById("alunoId").value = ""
  }

  modal.classList.add("active")
}

// Carregar turma atual do aluno
async function loadAlunoTurma(alunoId) {
  try {
    const response = await fetch(`${API_URL}/matriculas`)
    const matriculas = await response.json()
    const matricula = matriculas.find(m => m.aluno_id === alunoId && m.status === 'ativa')
    
    if (matricula) {
      document.getElementById("turmaId").value = matricula.turma_id
    }
  } catch (error) {
    console.error("Erro ao carregar turma do aluno:", error)
  }
}

// Fechar modal
function closeModal() {
  const modal = document.getElementById("alunoModal")
  modal.classList.remove("active")
}

// Salvar aluno
async function saveAluno() {
  const id = document.getElementById("alunoId").value
  const turmaId = document.getElementById("turmaId").value
  
  if (!turmaId) {
    alert("Por favor, selecione uma turma para o aluno.")
    return
  }
  
  const data = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    cpf: document.getElementById("cpf").value,
    data_nascimento: document.getElementById("dataNascimento").value,
    telefone: document.getElementById("telefone").value,
    endereco: document.getElementById("endereco").value,
    status: document.getElementById("status").value,
  }

  try {
    const url = id ? `${API_URL}/alunos/${id}` : `${API_URL}/alunos`
    const method = id ? "PUT" : "POST"

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      const result = await response.json()
      const alunoId = id || result.id
      
      // Criar ou atualizar matrícula
      await saveMatricula(alunoId, turmaId, id ? 'update' : 'create')
      
      closeModal()
      loadAlunos()
      alert(id ? "Aluno atualizado com sucesso!" : "Aluno criado e matriculado com sucesso!")
    } else {
      const error = await response.json()
      alert("Erro: " + error.error)
    }
  } catch (error) {
    console.error("Erro ao salvar aluno:", error)
    alert("Erro ao salvar aluno")
  }
}

// Salvar matrícula
async function saveMatricula(alunoId, turmaId, action) {
  try {
    if (action === 'update') {
      // Verificar se já existe matrícula ativa
      const matriculasResponse = await fetch(`${API_URL}/matriculas`)
      const matriculas = await matriculasResponse.json()
      const matriculaExistente = matriculas.find(m => m.aluno_id === parseInt(alunoId) && m.status === 'ativa')
      
      if (matriculaExistente && matriculaExistente.turma_id !== parseInt(turmaId)) {
        // Atualizar matrícula existente para nova turma
        await fetch(`${API_URL}/matriculas/${matriculaExistente.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aluno_id: parseInt(alunoId),
            turma_id: parseInt(turmaId),
            status: 'ativa'
          })
        })
      } else if (!matriculaExistente) {
        // Criar nova matrícula se não existir
        await fetch(`${API_URL}/matriculas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aluno_id: parseInt(alunoId),
            turma_id: parseInt(turmaId),
            status: 'ativa'
          })
        })
      }
    } else {
      // Criar nova matrícula
      await fetch(`${API_URL}/matriculas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aluno_id: parseInt(alunoId),
          turma_id: parseInt(turmaId),
          status: 'ativa'
        })
      })
    }
  } catch (error) {
    console.error("Erro ao salvar matrícula:", error)
  }
}

// Editar aluno
function editAluno(id) {
  // Verificar permissão
  if (!hasPermission('edit_alunos')) {
    alert('❌ Você não tem permissão para editar alunos.')
    return
  }
  openModal(id)
}

// Excluir aluno
async function deleteAluno(id) {
  // Verificar permissão
  if (!hasPermission('delete_alunos')) {
    alert('❌ Você não tem permissão para excluir alunos.')
    return
  }

  if (!confirm("Tem certeza que deseja excluir este aluno?")) {
    return
  }

  try {
    const response = await fetch(`${API_URL}/alunos/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      loadAlunos()
      alert("Aluno excluído com sucesso!")
    } else {
      alert("Erro ao excluir aluno")
    }
  } catch (error) {
    console.error("Erro ao excluir aluno:", error)
    alert("Erro ao excluir aluno")
  }
}

// Busca
document.getElementById("searchInput").addEventListener("input", (e) => {
  loadAlunos(e.target.value)
})

// Fechar modal ao clicar fora
document.getElementById("alunoModal").addEventListener("click", (e) => {
  if (e.target.id === "alunoModal") {
    closeModal()
  }
})

// Ver boletim do aluno
function viewBoletim(alunoId) {
  window.location.href = `boletim.html?id=${alunoId}`;
}

// Aplicar permissões na interface
function applyPermissions() {
  // Ocultar botão "Novo Aluno" se não tiver permissão
  const btnNovoAluno = document.querySelector('[onclick*="openModal"]')
  if (btnNovoAluno && !hasPermission('create_alunos')) {
    btnNovoAluno.style.display = 'none'
  }
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  loadAlunos()
  loadTurmas()
  
  // Aplicar permissões após carregar
  setTimeout(applyPermissions, 500)
})
