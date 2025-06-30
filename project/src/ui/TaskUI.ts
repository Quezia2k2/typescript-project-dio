import { TaskService } from '../services/TaskService.js';
import { TaskStatus, ITask } from '../models/interfaces.js';

export class TaskUI {
  private taskService: TaskService;
  private currentFilter: TaskStatus | 'ALL';

  constructor() {
    this.taskService = new TaskService();
    this.currentFilter = 'ALL';
    this.initializeUI();
    this.attachEventListeners();
    this.loadDemoData();
  }

  private initializeUI(): void {
    this.renderStats();
    this.renderTasks();
  }

  private attachEventListeners(): void {
    // Formulário de nova tarefa
    const taskForm = document.getElementById('task-form') as HTMLFormElement;
    taskForm?.addEventListener('submit', (e) => this.handleCreateTask(e));

    // Filtros
    const filterSelect = document.getElementById('status-filter') as HTMLSelectElement;
    filterSelect?.addEventListener('change', (e) => this.handleFilterChange(e));

    // Botão de mostrar estatísticas
    const statsBtn = document.getElementById('show-stats');
    statsBtn?.addEventListener('click', () => this.showStatistics());

    // Botão de limpar console
    const clearConsoleBtn = document.getElementById('clear-console');
    clearConsoleBtn?.addEventListener('click', () => this.clearConsole());
  }

  private handleCreateTask(event: Event): void {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    try {
      this.taskService.createTask({ title, description });
      form.reset();
      this.renderTasks();
      this.renderStats();
      this.logToConsole(`✅ Nova tarefa criada: "${title}"`);
    } catch (error) {
      this.logToConsole(`❌ Erro: ${error}`);
      alert(`Erro ao criar tarefa: ${error}`);
    }
  }

  private handleFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentFilter = select.value as TaskStatus | 'ALL';
    this.renderTasks();
    this.logToConsole(`🔍 Filtro aplicado: ${this.currentFilter}`);
  }

  private handleStatusChange(taskId: string, newStatus: TaskStatus): void {
    try {
      this.taskService.updateTask(taskId, { status: newStatus });
      this.renderTasks();
      this.renderStats();
      this.logToConsole(`✏️ Status atualizado para: ${newStatus}`);
    } catch (error) {
      this.logToConsole(`❌ Erro ao atualizar status: ${error}`);
    }
  }

  private handleDeleteTask(taskId: string): void {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      const success = this.taskService.deleteTask(taskId);
      if (success) {
        this.renderTasks();
        this.renderStats();
        this.logToConsole(`🗑️ Tarefa removida: ${taskId}`);
      }
    }
  }

  private renderStats(): void {
    const stats = this.taskService.getTasksStatistics();
    
    document.getElementById('total-count')!.textContent = stats.total.toString();
    document.getElementById('pending-count')!.textContent = stats.pending.toString();
    document.getElementById('progress-count')!.textContent = stats.inProgress.toString();
    document.getElementById('done-count')!.textContent = stats.done.toString();
  }

  private renderTasks(): void {
    const tasksList = document.getElementById('tasks-list')!;
    
    let tasks: readonly ITask[];
    if (this.currentFilter === 'ALL') {
      tasks = this.taskService.getAllTasks();
    } else {
      tasks = this.taskService.getTasksByStatus(this.currentFilter);
    }

    if (tasks.length === 0) {
      tasksList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <p>Nenhuma tarefa encontrada</p>
        </div>
      `;
      return;
    }

    tasksList.innerHTML = tasks.map(task => this.renderTaskItem(task)).join('');
    
    // Adicionar event listeners para os botões
    this.attachTaskEventListeners();
  }

  private renderTaskItem(task: ITask): string {
    const statusClass = task.status.toLowerCase().replace('_', '-');
    const statusLabel = this.getStatusLabel(task.status);
    
    return `
      <li class="task-item ${statusClass}" data-task-id="${task.id}">
        <div class="task-header">
          <h3 class="task-title">${task.title}</h3>
          <span class="task-status status-${statusClass}">${statusLabel}</span>
        </div>
        
        ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
        
        <div class="task-meta">
          <small>
            Criado: ${task.createdAt.toLocaleDateString('pt-BR')} | 
            Atualizado: ${task.updatedAt.toLocaleDateString('pt-BR')}
          </small>
        </div>
        
        <div class="task-actions">
          <select class="status-select" data-task-id="${task.id}">
            <option value="${TaskStatus.PENDING}" ${task.status === TaskStatus.PENDING ? 'selected' : ''}>
              Pendente
            </option>
            <option value="${TaskStatus.IN_PROGRESS}" ${task.status === TaskStatus.IN_PROGRESS ? 'selected' : ''}>
              Em Progresso
            </option>
            <option value="${TaskStatus.DONE}" ${task.status === TaskStatus.DONE ? 'selected' : ''}>
              Concluída
            </option>
          </select>
          
          <button class="btn-secondary btn-danger delete-btn" data-task-id="${task.id}">
            Excluir
          </button>
        </div>
      </li>
    `;
  }

  private attachTaskEventListeners(): void {
    // Status change listeners
    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const taskId = target.getAttribute('data-task-id')!;
        const newStatus = target.value as TaskStatus;
        this.handleStatusChange(taskId, newStatus);
      });
    });

    // Delete button listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const taskId = target.getAttribute('data-task-id')!;
        this.handleDeleteTask(taskId);
      });
    });
  }

  private getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING:
        return 'Pendente';
      case TaskStatus.IN_PROGRESS:
        return 'Em Progresso';
      case TaskStatus.DONE:
        return 'Concluída';
      default:
        return status;
    }
  }

  private showStatistics(): void {
    this.taskService.getTasksStatistics();
    this.taskService.displayAllTasks();
    this.logToConsole('📊 Estatísticas exibidas no console do navegador');
  }

  private logToConsole(message: string): void {
    const consoleOutput = document.getElementById('console-output')!;
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const logEntry = `[${timestamp}] ${message}`;
    
    consoleOutput.innerHTML += `<div>${logEntry}</div>`;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
    
    // Log também no console do navegador
    console.log(logEntry);
  }

  private clearConsole(): void {
    document.getElementById('console-output')!.innerHTML = '';
  }

  private loadDemoData(): void {
    // Carregar dados de demonstração
    const demoTasks = [
      {
        title: 'Estudar TypeScript',
        description: 'Aprender sobre interfaces, classes e enums'
      },
      {
        title: 'Implementar projeto educacional',
        description: 'Criar sistema de tarefas demonstrando conceitos TypeScript'
      },
      {
        title: 'Documentar código',
        description: 'Adicionar comentários explicativos sobre os padrões utilizados'
      }
    ];

    demoTasks.forEach((task, index) => {
      this.taskService.createTask(task);
      if (index === 1) {
        // Marcar segunda tarefa como em progresso
        const tasks = this.taskService.getAllTasks();
        this.taskService.updateTask(tasks[1].id, { status: TaskStatus.IN_PROGRESS });
      }
    });

    this.renderTasks();
    this.renderStats();
    this.logToConsole('🎯 Dados de demonstração carregados');
  }
}