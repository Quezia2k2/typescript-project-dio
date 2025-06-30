// Interface para definir a estrutura de uma tarefa
export interface ITask {
  readonly id: string;
  title: string;
  description: string;
  status: TaskStatus;
  readonly createdAt: Date;
  updatedAt: Date;
}

// Interface para dados de entrada de nova tarefa
export interface ICreateTaskInput {
  title: string;
  description: string;
}

// Interface para atualização de tarefa
export interface IUpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

// Interface para o serviço de tarefas
export interface ITaskService {
  createTask(input: ICreateTaskInput): ITask;
  getAllTasks(): readonly ITask[];
  getTaskById(id: string): ITask | undefined;
  updateTask(id: string, updates: IUpdateTaskInput): ITask | undefined;
  deleteTask(id: string): boolean;
  getTasksByStatus(status: TaskStatus): readonly ITask[];
}

// Enum para representar o status da tarefa
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

// Tipos literais para melhor tipagem
export type TaskStatusType = keyof typeof TaskStatus;
export type TaskId = string;
export type TaskTitle = string;
export type TaskDescription = string;