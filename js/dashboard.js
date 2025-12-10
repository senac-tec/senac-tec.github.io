const API_URL = "http://localhost:5000/api"

// Carregar estatísticas
async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/stats`)
    const data = await response.json()

    document.getElementById("totalAlunos").textContent = data.total_alunos.toLocaleString()
    document.getElementById("totalProfessores").textContent = data.total_professores
    document.getElementById("totalTurmas").textContent = data.total_turmas
    document.getElementById("taxaAprovacao").textContent = data.taxa_aprovacao + "%"
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error)
  }
}

// Carregar atividades recentes
async function loadAtividades() {
  try {
    const response = await fetch(`${API_URL}/atividades`)
    const atividades = await response.json()

    const atividadesList = document.getElementById("atividadesList")
    atividadesList.innerHTML = ""

    atividades.forEach((atividade) => {
      const indicatorClass = atividade.tipo === "matricula" ? "blue" : atividade.tipo === "nota" ? "green" : "purple"

      const item = document.createElement("div")
      item.className = "activity-item"
      item.innerHTML = `
                <div class="activity-indicator ${indicatorClass}"></div>
                <div class="activity-content">
                    <div class="activity-title">${atividade.descricao}</div>
                    <div class="activity-details">${atividade.detalhes}</div>
                    <div class="activity-time">${atividade.tempo}</div>
                </div>
            `
      atividadesList.appendChild(item)
    })
  } catch (error) {
    console.error("Erro ao carregar atividades:", error)
  }
}

// Mini Calendar
class MiniCalendar {
  constructor() {
    this.currentDate = new Date()
    this.currentMonth = this.currentDate.getMonth()
    this.currentYear = this.currentDate.getFullYear()
    this.events = []
  }

  async init() {
    await this.loadEvents()
    this.render()
    this.loadMiniEvents()
  }

  async loadEvents() {
    try {
      const response = await fetch(`${API_URL}/eventos?mes=${this.currentMonth + 1}&ano=${this.currentYear}`)
      this.events = await response.json()
    } catch (error) {
      console.error("Erro ao carregar eventos:", error)
      this.events = []
    }
  }

  render() {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]

    document.getElementById('miniMonthTitle').textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`

    const firstDay = new Date(this.currentYear, this.currentMonth, 1)
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const calendarBody = document.getElementById('miniCalendarBody')
    calendarBody.innerHTML = ''

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)

      const dayElement = this.createDayElement(currentDate)
      calendarBody.appendChild(dayElement)
    }
  }

  createDayElement(date) {
    const dayElement = document.createElement('div')
    dayElement.className = 'mini-day'

    const isCurrentMonth = date.getMonth() === this.currentMonth
    const isToday = this.isToday(date)

    if (!isCurrentMonth) {
      dayElement.classList.add('other-month')
    }

    if (isToday) {
      dayElement.classList.add('today')
    }

    const dayEvents = this.getEventsForDate(date)
    if (dayEvents.length > 0) {
      dayElement.classList.add('has-events')
    }

    dayElement.textContent = date.getDate()

    dayElement.addEventListener('click', () => {
      window.location.href = 'calendario.html'
    })

    return dayElement
  }

  getEventsForDate(date) {
    const dateStr = this.formatDate(date)
    return this.events.filter(event => event.data_inicio === dateStr)
  }

  isToday(date) {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  formatDate(date) {
    return date.toISOString().split('T')[0]
  }

  formatDateBR(dateStr) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  async loadMiniEvents() {
    try {
      const response = await fetch(`${API_URL}/eventos/proximos`)
      const eventos = await response.json()

      const miniEventsList = document.getElementById('miniEventsList')

      if (eventos.length === 0) {
        miniEventsList.innerHTML = `
          <div class="mini-event-item">
            <span class="mini-event-dot blue"></span>
            <span class="mini-event-text">Nenhum evento próximo</span>
          </div>
        `
        return
      }

      miniEventsList.innerHTML = eventos.slice(0, 4).map(evento => {
        const colorClass = evento.tipo === 'evento' ? 'blue' : 
                          evento.tipo === 'reuniao' ? 'red' : 
                          evento.tipo === 'prova' ? 'orange' : 'green'

        return `
          <div class="mini-event-item">
            <span class="mini-event-dot ${colorClass}"></span>
            <span class="mini-event-text" onclick="window.location.href='calendario.html'">${evento.titulo}</span>
            <span class="mini-event-date">${this.formatDateBR(evento.data_inicio)}</span>
          </div>
        `
      }).join('')

    } catch (error) {
      console.error("Erro ao carregar eventos do mini calendário:", error)
    }
  }

  async previousMonth() {
    this.currentMonth--
    if (this.currentMonth < 0) {
      this.currentMonth = 11
      this.currentYear--
    }
    await this.loadEvents()
    this.render()
    this.loadMiniEvents()
  }

  async nextMonth() {
    this.currentMonth++
    if (this.currentMonth > 11) {
      this.currentMonth = 0
      this.currentYear++
    }
    await this.loadEvents()
    this.render()
    this.loadMiniEvents()
  }
}

let miniCalendar

// Global functions for mini calendar
function previousMiniMonth() {
  miniCalendar.previousMonth()
}

function nextMiniMonth() {
  miniCalendar.nextMonth()
}

// Inicializar dashboard
document.addEventListener("DOMContentLoaded", () => {
  loadStats()
  loadAtividades()
  
  // Inicializar mini calendário
  miniCalendar = new MiniCalendar()
  miniCalendar.init()
})

// Session Status Manager
class SessionStatusManager {
    constructor() {
        this.indicator = document.getElementById('sessionIndicator');
        this.statusText = document.getElementById('sessionStatus');
        this.updateInterval = null;
        this.init();
    }

    init() {
        if (this.indicator && this.statusText) {
            this.updateSessionStatus();
            // Atualizar a cada 30 segundos
            this.updateInterval = setInterval(() => {
                this.updateSessionStatus();
            }, 30000);
        }
    }

    updateSessionStatus() {
        const persistentSession = localStorage.getItem('educagestao_session');
        const tempSession = sessionStorage.getItem('educagestao_temp_session');
        
        if (persistentSession) {
            try {
                const sessionData = JSON.parse(persistentSession);
                const timeLeft = sessionData.expires - Date.now();
                const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));
                
                this.indicator.className = 'session-indicator persistent';
                this.statusText.textContent = `Sessão persistente (${daysLeft} dias)`;
                this.indicator.title = 'Sessão salva - "Lembrar de mim" ativo';
            } catch (error) {
                console.error('Erro ao ler sessão persistente:', error);
            }
        } else if (tempSession) {
            try {
                const sessionData = JSON.parse(tempSession);
                const timeLeft = sessionData.expires - Date.now();
                const minutesLeft = Math.ceil(timeLeft / (60 * 1000));
                
                if (minutesLeft <= 10) {
                    this.indicator.className = 'session-indicator expiring';
                    this.statusText.textContent = `Expira em ${minutesLeft}min`;
                    this.indicator.title = 'Sessão expirando em breve';
                } else {
                    this.indicator.className = 'session-indicator temporary';
                    this.statusText.textContent = 'Sessão temporária';
                    this.indicator.title = 'Sessão temporária - expira por inatividade';
                }
            } catch (error) {
                console.error('Erro ao ler sessão temporária:', error);
            }
        } else {
            this.indicator.className = 'session-indicator';
            this.statusText.textContent = 'Sem sessão';
            this.indicator.title = 'Nenhuma sessão ativa';
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Inicializar gerenciador de status de sessão
let sessionStatusManager;

// Atualizar a inicialização do dashboard
const originalDOMContentLoaded = document.addEventListener;
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadAtividades();
    
    // Inicializar mini calendário
    miniCalendar = new MiniCalendar();
    miniCalendar.init();
    
    // Inicializar gerenciador de status de sessão
    sessionStatusManager = new SessionStatusManager();
});