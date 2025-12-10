const API_URL = "http://localhost:5000/api"
let turmas = []
let presencaData = []
let currentTurma = null
let currentData = null

// Carregar turmas
async function loadTurmas() {
    try {
        const response = await fetch(`${API_URL}/turmas`)
        turmas = await response.json()
        populateTurmasSelect()
    } catch (error) {
        console.error("Erro ao carregar turmas:", error)
        alert("Erro ao carregar turmas. Verifique se o servidor está rodando.")
    }
}

// Popular select de turmas
function populateTurmasSelect() {
    const select = document.getElementById("turmaSelect")
    select.innerHTML = '<option value="">Selecione uma turma</option>'

    turmas
        .filter((t) => t.status === "ativa")
        .forEach((turma) => {
            const option = document.createElement("option")
            option.value = turma.id
            option.textContent = `${turma.nome} - ${turma.turno}`
            select.appendChild(option)
        })
}

// Carregar dados de presença
async function loadPresencaData() {
    const turmaId = document.getElementById("turmaSelect").value
    const data = document.getElementById("dataSelect").value

    if (!turmaId || !data) {
        showEmptyState()
        return
    }

    currentTurma = turmaId
    currentData = data

    try {
        const response = await fetch(`${API_URL}/frequencia/turma/${turmaId}/data/${data}`)
        presencaData = await response.json()
        
        if (presencaData.length === 0) {
            showEmptyState("Nenhum aluno encontrado nesta turma.")
            return
        }

        renderPresencaTable()
        showPresencaContainer()
        updateStats()
        
        // Habilitar botão salvar
        document.getElementById("salvarBtn").disabled = false
        
    } catch (error) {
        console.error("Erro ao carregar dados de presença:", error)
        alert("Erro ao carregar dados de presença.")
        showEmptyState()
    }
}

// Renderizar tabela de presença
function renderPresencaTable() {
    const tbody = document.getElementById("presencaTableBody")
    const turma = turmas.find(t => t.id == currentTurma)
    const dataFormatada = formatDateBR(currentData)
    
    // Atualizar título
    document.getElementById("presencaTitle").textContent = 
        `Presença - ${turma?.nome || 'Turma'} - ${dataFormatada}`

    tbody.innerHTML = presencaData
        .map((aluno, index) => `
            <tr>
                <td class="aluno-numero">${index + 1}</td>
                <td class="aluno-nome">${aluno.aluno_nome}</td>
                <td class="presenca-radio">
                    <input 
                        type="radio" 
                        name="presenca_${aluno.matricula_id}" 
                        value="1" 
                        class="radio-input presente-radio"
                        ${aluno.presente === 1 ? 'checked' : ''}
                        onchange="updatePresenca(${aluno.matricula_id}, 1)"
                    >
                </td>
                <td class="presenca-radio">
                    <input 
                        type="radio" 
                        name="presenca_${aluno.matricula_id}" 
                        value="0" 
                        class="radio-input ausente-radio"
                        ${aluno.presente === 0 ? 'checked' : ''}
                        onchange="updatePresenca(${aluno.matricula_id}, 0)"
                    >
                </td>
            </tr>
        `)
        .join("")
}

// Atualizar presença de um aluno
function updatePresenca(matriculaId, presente) {
    const aluno = presencaData.find(a => a.matricula_id === matriculaId)
    if (aluno) {
        aluno.presente = presente
        updateStats()
    }
}

// Atualizar estatísticas
function updateStats() {
    const total = presencaData.length
    const presentes = presencaData.filter(a => a.presente === 1).length
    const ausentes = total - presentes

    document.getElementById("totalAlunos").textContent = total
    document.getElementById("totalPresentes").textContent = presentes
    document.getElementById("totalAusentes").textContent = ausentes
}

// Marcar todos como presentes
function marcarTodosPresentes() {
    if (!presencaData.length) return

    presencaData.forEach(aluno => {
        aluno.presente = 1
    })

    // Atualizar radio buttons
    presencaData.forEach(aluno => {
        const presenteRadio = document.querySelector(`input[name="presenca_${aluno.matricula_id}"][value="1"]`)
        if (presenteRadio) {
            presenteRadio.checked = true
        }
    })

    updateStats()
}

// Salvar presença
async function salvarPresenca() {
    if (!currentTurma || !currentData || !presencaData.length) {
        alert("Selecione uma turma e data primeiro.")
        return
    }

    const frequencias = presencaData.map(aluno => ({
        matricula_id: aluno.matricula_id,
        presente: aluno.presente
    }))

    const data = {
        turma_id: parseInt(currentTurma),
        data: currentData,
        frequencias: frequencias
    }

    try {
        const response = await fetch(`${API_URL}/frequencia/lote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        if (response.ok) {
            alert("Presença salva com sucesso!")
        } else {
            const error = await response.json()
            alert("Erro: " + error.error)
        }
    } catch (error) {
        console.error("Erro ao salvar presença:", error)
        alert("Erro ao salvar presença")
    }
}

// Mostrar container de presença
function showPresencaContainer() {
    document.getElementById("presencaContainer").style.display = "block"
    document.getElementById("emptyState").style.display = "none"
}

// Mostrar estado vazio
function showEmptyState(message = null) {
    document.getElementById("presencaContainer").style.display = "none"
    document.getElementById("emptyState").style.display = "flex"
    
    if (message) {
        document.querySelector("#emptyState p").textContent = message
    } else {
        document.querySelector("#emptyState p").textContent = 
            "Escolha uma turma e uma data para visualizar e gerenciar a presença dos alunos."
    }
    
    // Desabilitar botão salvar
    document.getElementById("salvarBtn").disabled = true
}

// Formatar data para exibição
function formatDateBR(dateString) {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString("pt-BR", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// Definir data atual como padrão
function setDefaultDate() {
    const today = new Date()
    const dateString = today.toISOString().split('T')[0]
    document.getElementById("dataSelect").value = dateString
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    loadTurmas()
    setDefaultDate()
    showEmptyState()
})