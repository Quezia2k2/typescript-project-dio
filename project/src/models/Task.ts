import { ITask, TaskStatus, TaskId } from './interfaces.js';

// Classe principal para representar uma tarefa
export class Task implements ITask {
  public readonly id: TaskId;
  private _title: string;
  private _description: string;
  private _status: TaskStatus;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: TaskId,
    title: string,
    description: string,
    status: TaskStatus = TaskStatus.PENDING
  ) {
    this.id = id;
    this._title = title;
    this._description = description;
    this._status = status;
    this.createdAt = new Date();
    this._updatedAt = new Date();
  }

  // Getters públicos para acessar propriedades privadas
  public get title(): string {
    return this._title;
  }

  public get description(): string {
    return this._description;
  }

  public get status(): TaskStatus {
    return this._status;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Setters públicos com validação
  public set title(newTitle: string) {
    if (newTitle.trim().length === 0) {
      throw new Error('Título não pode ser vazio');
    }
    this._title = newTitle.trim();
    this._updatedAt = new Date();
  }

  public set description(newDescription: string) {
    this._description = newDescription.trim();
    this._updatedAt = new Date();
  }

  public set status(newStatus: TaskStatus) {
    this._status = newStatus;
    this._updatedAt = new Date();
  }

  // Método público para verificar se a tarefa está concluída
  public isCompleted(): boolean {
    return this._status === TaskStatus.DONE;
  }

  // Método público para marcar como concluída
  public markAsCompleted(): void {
    this.status = TaskStatus.DONE;
  }

  // Método público para marcar como em progresso
  public markAsInProgress(): void {
    this.status = TaskStatus.IN_PROGRESS;
  }

  // Método público para marcar como pendente
  public markAsPending(): void {
    this.status = TaskStatus.PENDING;
  }

  // Método para converter para objeto plano (útil para JSON)
  public toPlainObject(): ITask {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Método para exibir informações da tarefa
  public toString(): string {
    return `Task(${this.id}): ${this.title} - ${this.status}`;
  }
}