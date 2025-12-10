const API_URL = "http://localhost:5000/api"
let professores = []

// Carregar professores
async function loadProfessores(search = "") {
  try {
    const url = search ? `${API_URL}/professores?search=${encodeURIComponent(search)}` : `${API_URL}/professores`
    const response = await fetch(url)
    professores = await response.json()
    renderProfessores()
  } catch (error) {
    console.error("Erro ao carregar professores:", error)
    document.getElementById("professoresTableBody").innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--danger);">
                    Erro ao carregar professores. Verifique se o servidor está rodando.
                </td>
            </tr>
        `
  }
}

// Renderizar tabela de professores
function renderProfessores() {
  const tbody = document.getElementById("professoresTableBody")

  if (professores.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    Nenhum professor encontrado
                </td>
            </tr>
        `
    return
  }

  tbody.innerHTML = professores
    .map(
      (professor) => `
        <tr>
            <td>${professor.nome}</td>
            <td>${professor.email}</td>
            <td>${professor.cpf}</td>
            <td>${professor.telefone || "-"}</td>
            <td>${professor.especializacao || "-"}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(professor.status)}">
                    ${professor.status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editProfessor(${professor.id})">
                    Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProfessor(${professor.id})">
                    Excluir
                </button>
            </td>
        </tr>
    `,
    )
    .join("")
}

// Classe do badge de status
function getStatusBadgeClass(status) {
  switch (status) {
    case "ativo":
      return "badge-success"
    case "inativo":
      return "badge-danger"
    case "licenca":
      return "badge-warning"
    default:
      return "badge-success"
  }
}

// Abrir modal
function openModal(id = null) {
  const modal = document.getElementById("professorModal")
  const form = document.getElementById("professorForm")
  const title = document.getElementById("modalTitle")

  form.reset()

  if (id) {
    title.textContent = "Editar Professor"
    const professor = professores.find((p) => p.id === id)
    if (professor) {
      document.getElementById("professorId").value = professor.id
      document.getElementById("nome").value = professor.nome
      document.getElementById("email").value = professor.email
      document.getElementById("cpf").value = professor.cpf
      document.getElementById("telefone").value = professor.telefone || ""
      document.getElementById("especializacao").value = professor.especializacao || ""
      document.getElementById("status").value = professor.status
    }
  } else {
    title.textContent = "Novo Professor"
    document.getElementById("professorId").value = ""
  }

  modal.classList.add("active")
}

// Fechar modal
function closeModal() {
  const modal = document.getElementById("professorModal")
  modal.classList.remove("active")
}

// Salvar professor
async function saveProfessor() {
  const id = document.getElementById("professorId").value
  const data = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    cpf: document.getElementById("cpf").value,
    telefone: document.getElementById("telefone").value,
    especializacao: document.getElementById("especializacao").value,
    status: document.getElementById("status").value,
  }

  try {
    const url = id ? `${API_URL}/professores/${id}` : `${API_URL}/professores`
    const method = id ? "PUT" : "POST"

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      closeModal()
      loadProfessores()
      alert(id ? "Professor atualizado com sucesso!" : "Professor criado com sucesso!")
    } else {
      const error = await response.json()
      alert("Erro: " + error.error)
    }
  } catch (error) {
    console.error("Erro ao salvar professor:", error)
    alert("Erro ao salvar professor")
  }
}

// Editar professor
function editProfessor(id) {
  openModal(id)
}

// Excluir professor
async function deleteProfessor(id) {
  if (!confirm("Tem certeza que deseja excluir este professor?")) {
    return
  }

  try {
    const response = await fetch(`${API_URL}/professores/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      loadProfessores()
      alert("Professor excluído com sucesso!")
    } else {
      alert("Erro ao excluir professor")
    }
  } catch (error) {
    console.error("Erro ao excluir professor:", error)
    alert("Erro ao excluir professor")
  }
}

// Busca
document.getElementById("searchInput").addEventListener("input", (e) => {
  loadProfessores(e.target.value)
})

// Fechar modal ao clicar fora
document.getElementById("professorModal").addEventListener("click", (e) => {
  if (e.target.id === "professorModal") {
    closeModal()
  }
})

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  loadProfessores()
})
