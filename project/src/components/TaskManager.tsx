import React, { useState, useEffect, useRef } from 'react';
import { TaskService } from '../services/TaskService';
import { TaskStatus, ITask } from '../models/interfaces';
import { Plus, Filter, BarChart3, Trash2, Play, CheckCircle, Clock } from 'lucide-react';

export const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<readonly ITask[]>([]);
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [consoleLog, setConsoleLog] = useState<string[]>([]);
  const taskServiceRef = useRef(new TaskService());
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDemoData();
  }, []);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLog]);

  const logToConsole = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const logEntry = `[${timestamp}] ${message}`;
    setConsoleLog(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const loadDemoData = () => {
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
      taskServiceRef.current.createTask(task);
      if (index === 1) {
        const allTasks = taskServiceRef.current.getAllTasks();
        taskServiceRef.current.updateTask(allTasks[1].id, { status: TaskStatus.IN_PROGRESS });
      }
    });

    updateTasks();
    logToConsole('🎯 Dados de demonstração carregados');
  };

  const updateTasks = () => {
    if (filter === 'ALL') {
      setTasks(taskServiceRef.current.getAllTasks());
    } else {
      setTasks(taskServiceRef.current.getTasksByStatus(filter));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      logToConsole('❌ Erro: Título é obrigatório');
      return;
    }

    try {
      taskServiceRef.current.createTask({
        title: formData.title,
        description: formData.description
      });
      
      setFormData({ title: '', description: '' });
      updateTasks();
      logToConsole(`✅ Nova tarefa criada: "${formData.title}"`);
    } catch (error) {
      logToConsole(`❌ Erro: ${error}`);
    }
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    try {
      taskServiceRef.current.updateTask(taskId, { status: newStatus });
      updateTasks();
      logToConsole(`✏️ Status atualizado para: ${getStatusLabel(newStatus)}`);
    } catch (error) {
      logToConsole(`❌ Erro ao atualizar status: ${error}`);
    }
  };

  const handleDelete = (taskId: string) => {
    const success = taskServiceRef.current.deleteTask(taskId);
    if (success) {
      updateTasks();
      logToConsole(`🗑️ Tarefa removida: ${taskId}`);
    }
  };

  const handleFilterChange = (newFilter: TaskStatus | 'ALL') => {
    setFilter(newFilter);
    if (newFilter === 'ALL') {
      setTasks(taskServiceRef.current.getAllTasks());
    } else {
      setTasks(taskServiceRef.current.getTasksByStatus(newFilter));
    }
    logToConsole(`🔍 Filtro aplicado: ${newFilter}`);
  };

  const showStatistics = () => {
    const stats = taskServiceRef.current.getTasksStatistics();
    taskServiceRef.current.displayAllTasks();
    logToConsole('📊 Estatísticas exibidas no console do navegador');
  };

  const getStatusLabel = (status: TaskStatus): string => {
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
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return <Clock className="w-4 h-4" />;
      case TaskStatus.IN_PROGRESS:
        return <Play className="w-4 h-4" />;
      case TaskStatus.DONE:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.PENDING:
        return 'border-l-yellow-500 bg-yellow-50';
      case TaskStatus.IN_PROGRESS:
        return 'border-l-blue-500 bg-blue-50';
      case TaskStatus.DONE:
        return 'border-l-green-500 bg-green-50';
    }
  };

  const stats = taskServiceRef.current.getTasksStatistics();

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="w-[600px] mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-[28px] font-semibold text-gray-800 text-center mb-5">
          Sistema de Gerenciamento de Tarefas
        </h1>
        
        <p className="text-center text-gray-600 mb-8 text-sm">
          Demonstração educacional de TypeScript: Interfaces, Classes, Enums e Tipagem
        </p>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg text-center border">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-600 uppercase mt-1">Total</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-xs text-yellow-600 uppercase mt-1">Pendentes</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{stats.inProgress}</div>
            <div className="text-xs text-blue-600 uppercase mt-1">Progresso</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
            <div className="text-2xl font-bold text-green-700">{stats.done}</div>
            <div className="text-xs text-green-600 uppercase mt-1">Concluídas</div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-50 p-5 rounded-lg border mb-8">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Nova Tarefa</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-1">
                Título *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full h-12 px-4 text-base border-2 border-gray-300 rounded focus:border-green-500 focus:outline-none transition-colors"
                placeholder="Digite o título da tarefa"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">
                Descrição
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-20 px-4 py-3 text-base border-2 border-gray-300 rounded focus:border-green-500 focus:outline-none transition-colors resize-none"
                placeholder="Descreva a tarefa (opcional)"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-3 bg-green-500 text-white text-base font-medium rounded hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Tarefa
            </button>
          </form>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center justify-between mb-5 gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value as TaskStatus | 'ALL')}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
            >
              <option value="ALL">Todas</option>
              <option value={TaskStatus.PENDING}>Pendentes</option>
              <option value={TaskStatus.IN_PROGRESS}>Em Progresso</option>
              <option value={TaskStatus.DONE}>Concluídas</option>
            </select>
          </div>
          
          <button
            onClick={showStatistics}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Ver Estatísticas
          </button>
        </div>

        {/* Tasks List */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-700 mb-4">
            Lista de Tarefas ({tasks.length})
          </h2>
          
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4 opacity-50">📝</div>
              <p>Nenhuma tarefa encontrada</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${getStatusColor(task.status)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 flex-1 mr-4">{task.title}</h3>
                    <div className="flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-white bg-opacity-70">
                      {getStatusIcon(task.status)}
                      <span className="font-medium">{getStatusLabel(task.status)}</span>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Criado: {task.createdAt.toLocaleDateString('pt-BR')} | 
                    Atualizado: {task.updatedAt.toLocaleDateString('pt-BR')}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:border-green-500 focus:outline-none"
                    >
                      <option value={TaskStatus.PENDING}>Pendente</option>
                      <option value={TaskStatus.IN_PROGRESS}>Em Progresso</option>
                      <option value={TaskStatus.DONE}>Concluída</option>
                    </select>
                    
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Console Demo */}
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Console de Demonstração</h3>
            <button
              onClick={() => setConsoleLog([])}
              className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
            >
              Limpar
            </button>
          </div>
          <div
            ref={consoleRef}
            className="font-mono text-xs max-h-48 overflow-y-auto space-y-1"
          >
            {consoleLog.length === 0 ? (
              <div className="text-gray-500">Console vazio - interaja com as tarefas para ver os logs</div>
            ) : (
              consoleLog.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};