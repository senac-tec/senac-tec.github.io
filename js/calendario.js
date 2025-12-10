// Calendar JavaScript
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.events = [];
        this.turmas = [];
        this.professores = [];
        this.editingEventId = null;
        
        this.init();
    }
    
    async init() {
        await this.loadTurmas();
        await this.loadProfessores();
        await this.loadEvents();
        this.renderCalendar();
        this.renderEventsList();
        this.setupEventListeners();
    }
    
    async loadTurmas() {
        try {
            const response = await fetch('http://localhost:5000/api/turmas');
            this.turmas = await response.json();
            this.populateTurmasSelect();
        } catch (error) {
            console.error('Erro ao carregar turmas:', error);
        }
    }
    
    async loadProfessores() {
        try {
            const response = await fetch('http://localhost:5000/api/professores');
            this.professores = await response.json();
            this.populateProfessoresSelect();
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
        }
    }
    
    async loadEvents() {
        try {
            const response = await fetch(`http://localhost:5000/api/eventos?mes=${this.currentMonth + 1}&ano=${this.currentYear}`);
            this.events = await response.json();
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            this.events = [];
        }
    }
    
    populateTurmasSelect() {
        const select = document.getElementById('turma_id');
        select.innerHTML = '<option value="">Selecione uma turma</option>';
        this.turmas.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma.id;
            option.textContent = turma.nome;
            select.appendChild(option);
        });
    }
    
    populateProfessoresSelect() {
        const select = document.getElementById('professor_id');
        select.innerHTML = '<option value="">Selecione um professor</option>';
        this.professores.forEach(professor => {
            const option = document.createElement('option');
            option.value = professor.id;
            option.textContent = professor.nome;
            select.appendChild(option);
        });
    }
    
    renderCalendar() {
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        document.getElementById('currentMonth').textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const calendarBody = document.getElementById('calendarBody');
        calendarBody.innerHTML = '';
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = this.createDayElement(currentDate);
            calendarBody.appendChild(dayElement);
        }
    }
    
    createDayElement(date) {
        const dayElement = document.createElement('div');
        dayElement.className = 'main-day';
        
        const isCurrentMonth = date.getMonth() === this.currentMonth;
        const isToday = this.isToday(date);
        
        if (!isCurrentMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        const dayEvents = this.getEventsForDate(date);
        if (dayEvents.length > 0) {
            dayElement.classList.add('has-events');
        }
        
        dayElement.innerHTML = `
            <div class="main-day-number">${date.getDate()}</div>
            <div class="main-day-events">
                ${dayEvents.slice(0, 2).map(event => `
                    <div class="main-event-item ${event.tipo}" onclick="openEventDetails(${event.id})" title="${event.titulo}">
                        ${event.titulo}
                    </div>
                `).join('')}
                ${dayEvents.length > 2 ? `<div class="main-event-item">+${dayEvents.length - 2} mais</div>` : ''}
            </div>
        `;
        
        dayElement.addEventListener('click', (e) => {
            if (isCurrentMonth && !e.target.classList.contains('main-event-item')) {
                this.openEventModal(date);
            }
        });
        
        return dayElement;
    }
    
    getEventsForDate(date) {
        const dateStr = this.formatDate(date);
        return this.events.filter(event => event.data_inicio === dateStr);
    }
    
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    formatDateBR(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    }
    
    async renderEventsList() {
        try {
            const response = await fetch('http://localhost:5000/api/eventos/proximos');
            const proximosEventos = await response.json();
            
            const eventsList = document.getElementById('eventsList');
            
            if (proximosEventos.length === 0) {
                eventsList.innerHTML = '<p class="text-muted">Nenhum evento próximo</p>';
                return;
            }
            
            eventsList.innerHTML = proximosEventos.map(event => `
                <div class="event-card ${event.tipo}" onclick="openEventDetails(${event.id})">
                    <div class="event-title">${event.titulo}</div>
                    <div class="event-date">
                        ${this.formatDateBR(event.data_inicio)}
                        ${event.hora_inicio ? ` às ${event.hora_inicio}` : ''}
                    </div>
                    ${event.descricao ? `<div class="event-description">${event.descricao}</div>` : ''}
                    <span class="event-type ${event.tipo}">${event.tipo}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Erro ao carregar próximos eventos:', error);
        }
    }
    
    setupEventListeners() {
        document.getElementById('eventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });
    }
    
    async previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        await this.loadEvents();
        this.renderCalendar();
    }
    
    async nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        await this.loadEvents();
        this.renderCalendar();
    }
    
    openEventModal(date = null) {
        const modal = document.getElementById('eventModal');
        const form = document.getElementById('eventForm');
        const deleteBtn = document.getElementById('deleteEventBtn');
        
        // Reset form
        form.reset();
        this.editingEventId = null;
        
        // Set default date if provided
        if (date) {
            document.getElementById('data_inicio').value = this.formatDate(date);
        }
        
        // Hide delete button for new events
        deleteBtn.style.display = 'none';
        
        document.getElementById('modalTitle').textContent = 'Novo Evento';
        modal.classList.add('active');
    }
    
    closeEventModal() {
        const modal = document.getElementById('eventModal');
        const deleteBtn = document.getElementById('deleteEventBtn');
        modal.classList.remove('active');
        this.editingEventId = null;
        deleteBtn.style.display = 'none';
    }
    
    async openEventDetails(eventId) {
        try {
            const response = await fetch(`http://localhost:5000/api/eventos/${eventId}`);
            const event = await response.json();
            
            if (event.error) {
                alert('Evento não encontrado');
                return;
            }
            
            // Fill form with event data
            document.getElementById('titulo').value = event.titulo;
            document.getElementById('descricao').value = event.descricao || '';
            document.getElementById('data_inicio').value = event.data_inicio;
            document.getElementById('data_fim').value = event.data_fim || '';
            document.getElementById('hora_inicio').value = event.hora_inicio || '';
            document.getElementById('hora_fim').value = event.hora_fim || '';
            document.getElementById('tipo').value = event.tipo;
            document.getElementById('cor').value = event.cor;
            document.getElementById('turma_id').value = event.turma_id || '';
            document.getElementById('professor_id').value = event.professor_id || '';
            
            this.editingEventId = eventId;
            document.getElementById('modalTitle').textContent = 'Editar Evento';
            
            // Show delete button for existing events
            const deleteBtn = document.getElementById('deleteEventBtn');
            deleteBtn.style.display = 'flex';
            
            document.getElementById('eventModal').classList.add('active');
            
        } catch (error) {
            console.error('Erro ao carregar evento:', error);
            alert('Erro ao carregar evento');
        }
    }
    
    async saveEvent() {
        const formData = new FormData(document.getElementById('eventForm'));
        const eventData = {};
        
        for (let [key, value] of formData.entries()) {
            eventData[key] = value || null;
        }
        
        try {
            let response;
            if (this.editingEventId) {
                response = await fetch(`http://localhost:5000/api/eventos/${this.editingEventId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventData)
                });
            } else {
                response = await fetch('http://localhost:5000/api/eventos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventData)
                });
            }
            
            const result = await response.json();
            
            if (response.ok) {
                alert(result.message);
                this.closeEventModal();
                await this.loadEvents();
                this.renderCalendar();
                this.renderEventsList();
            } else {
                alert('Erro: ' + result.error);
            }
        } catch (error) {
            console.error('Erro ao salvar evento:', error);
            alert('Erro ao salvar evento');
        }
    }
    
    async filterEvents() {
        const tipo = document.getElementById('tipoFilter').value;
        try {
            let url = `http://localhost:5000/api/eventos?mes=${this.currentMonth + 1}&ano=${this.currentYear}`;
            if (tipo) {
                url += `&tipo=${tipo}`;
            }
            
            const response = await fetch(url);
            this.events = await response.json();
            this.renderCalendar();
        } catch (error) {
            console.error('Erro ao filtrar eventos:', error);
        }
    }
    
    async deleteEvent() {
        if (!this.editingEventId) {
            alert('Nenhum evento selecionado para exclusão');
            return;
        }
        
        const confirmDelete = confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.');
        
        if (!confirmDelete) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/api/eventos/${this.editingEventId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Evento excluído com sucesso!');
                this.closeEventModal();
                await this.loadEvents();
                this.renderCalendar();
                this.renderEventsList();
            } else {
                alert('Erro ao excluir evento: ' + result.error);
            }
        } catch (error) {
            console.error('Erro ao excluir evento:', error);
            alert('Erro ao excluir evento');
        }
    }
}

// Global functions
let calendar;

function previousMonth() {
    calendar.previousMonth();
}

function nextMonth() {
    calendar.nextMonth();
}

function openEventModal(date = null) {
    calendar.openEventModal(date);
}

function closeEventModal() {
    calendar.closeEventModal();
}

function openEventDetails(eventId) {
    calendar.openEventDetails(eventId);
}

function filterEvents() {
    calendar.filterEvents();
}

function deleteEvent() {
    calendar.deleteEvent();
}

// Initialize calendar when page loads
document.addEventListener('DOMContentLoaded', () => {
    calendar = new Calendar();
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('eventModal');
    if (e.target === modal) {
        closeEventModal();
    }
});