
import React from 'react';
import { TestTask } from '../types';
import { CheckCircle2, XCircle, Clock, CheckSquare, Square, Trash2, Edit2 } from 'lucide-react';

interface TaskListProps {
  tasks: TestTask[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, selectedId, onSelect, onToggleComplete, onDelete, onRename }) => {
  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs italic">
        Nenhuma tarefa encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const isSelected = task.id === selectedId;
        
        return (
          <div 
            key={task.id}
            onClick={() => onSelect(task.id)}
            className={`group p-3 rounded-lg border cursor-pointer transition-all ${
              isSelected 
                ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' 
                : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(task.id);
                }}
                className={`mt-0.5 flex-shrink-0 transition-colors ${
                  task.completed ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-400'
                }`}
              >
                {task.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm font-semibold truncate ${
                    task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                  }`}>
                    {task.title || 'Sem título'}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRename(task.id);
                      }}
                      className="p-1 text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Renomear cenário"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                      }}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Excluir da lista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5">
                    {task.status === 'OK' && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" /> OK
                      </span>
                    )}
                    {task.status === 'NOK' && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                        <XCircle className="w-3 h-3" /> NOK
                      </span>
                    )}
                    {task.status === 'PENDING' && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        <Clock className="w-3 h-3" /> NOVO
                      </span>
                    )}
                  </div>
                  
                  <div className="text-[10px] text-slate-400 font-mono">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
