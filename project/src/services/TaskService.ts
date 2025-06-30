import { Task } from '../models/Task.js';
import { 
  ITask, 
  ITaskService, 
  ICreateTaskInput, 
  IUpdateTaskInput, 
  TaskStatus, 
  TaskId 
} from '../models/interfaces.js';

export class TaskService implements ITaskService {
  private readonly tasks: Map<TaskId, Task>;
  private taskIdCounter: number;

  constructor() {
    this.tasks = new Map();
    this.taskIdCounter = 1;
  }

  // Método privado para gerar ID único
  private generateId(): TaskId {
    return `task-${this.taskIdCounter++}`;
  }

  // Método privado para validar entrada de tarefa
  private validateTaskInput(input: ICreateTaskInput): void {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Título é obrigatório');
    }
    if (input.title.trim().length > 100) {
      throw new Error('Título deve ter no máximo 100 caracteres');
    }
    if (input.description && input.description.length > 500) {
      throw new Error('Descrição deve ter no máximo 500 caracteres');
    }
  }

  public createTask(input: ICreateTaskInput): ITask {
    this.validateTaskInput(input);
    
    const id = this.generateId();
    const task = new Task(
      id,
      input.title.trim(),
      input.description?.trim() || '',
      TaskStatus.PENDING
    );

    this.tasks.set(id, task);
    
    console.log(`✅ Tarefa criada: ${task.toString()}`);
    return task.toPlainObject();
  }

  public getAllTasks(): readonly ITask[] {
    const allTasks = Array.from(this.tasks.values())
      .map(task => task.toPlainObject());
    
    console.log(`📋 Total de tarefas: ${allTasks.length}`);
    return allTasks;
  }

  public getTaskById(id: TaskId): ITask | undefined {
    const task = this.tasks.get(id);
    if (task) {
      console.log(`🔍 Tarefa encontrada: ${task.toString()}`);
      return task.toPlainObject();
    }
    console.log(`❌ Tarefa não encontrada: ${id}`);
    return undefined;
  }

  public updateTask(id: TaskId, updates: IUpdateTaskInput): ITask | undefined {
    const task = this.tasks.get(id);
    if (!task) {
      console.log(`❌ Não foi possível atualizar. Tarefa não encontrada: ${id}`);
      return undefined;
    }

    try {
      if (updates.title !== undefined) {
        task.title = updates.title;
      }
      if (updates.description !== undefined) {
        task.description = updates.description;
      }
      if (updates.status !== undefined) {
        task.status = updates.status;
      }

      console.log(`✏️ Tarefa atualizada: ${task.toString()}`);
      return task.toPlainObject();
    } catch (error) {
      console.error(`❌ Erro ao atualizar tarefa: ${error}`);
      throw error;
    }
  }

  public deleteTask(id: TaskId): boolean {
    const task = this.tasks.get(id);
    if (task) {
      this.tasks.delete(id);
      console.log(`🗑️ Tarefa removida: ${task.toString()}`);
      return true;
    }
    console.log(`❌ Não foi possível remover. Tarefa não encontrada: ${id}`);
    return false;
  }

  public getTasksByStatus(status: TaskStatus): readonly ITask[] {
    const filteredTasks = Array.from(this.tasks.values())
      .filter(task => task.status === status)
      .map(task => task.toPlainObject());
    
    console.log(`🔎 Tarefas com status ${status}: ${filteredTasks.length}`);
    return filteredTasks;
  }

  // Método adicional para demonstração educacional
  public getTasksStatistics(): {
    total: number;
    pending: number;
    inProgress: number;
    done: number;
  } {
    const stats = {
      total: this.tasks.size,
      pending: 0,
      inProgress: 0,
      done: 0
    };

    this.tasks.forEach(task => {
      switch (task.status) {
        case TaskStatus.PENDING:
          stats.pending++;
          break;
        case TaskStatus.IN_PROGRESS:
          stats.inProgress++;
          break;
        case TaskStatus.DONE:
          stats.done++;
          break;
      }
    });

    console.table(stats);
    return stats;
  }

  // Método para demonstração educacional - listar todas as tarefas no console
  public displayAllTasks(): void {
    if (this.tasks.size === 0) {
      console.log('📝 Nenhuma tarefa cadastrada');
      return;
    }

    console.log('\n📋 LISTA DE TAREFAS:');
    console.log('==================');
    
    const tasksArray = Array.from(this.tasks.values()).map(task => ({
      ID: task.id,
      Título: task.title,
      Descrição: task.description.substring(0, 30) + (task.description.length > 30 ? '...' : ''),
      Status: task.status,
      Criado_em: task.createdAt.toLocaleDateString('pt-BR'),
      Atualizado_em: task.updatedAt.toLocaleDateString('pt-BR')
    }));

    console.table(tasksArray);
  }
}