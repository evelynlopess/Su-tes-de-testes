
import React from 'react';
import { TestTask } from '../types';
import { CheckSquare, Square, ImageIcon, ChevronRight } from 'lucide-react';

interface TaskListProps {
  tasks: TestTask[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, selectedId, onSelect, onToggleComplete }) => {
  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
        Nenhuma tarefa criada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isSelected = task.id === selectedId;
        const hasImages = task.images && task.images.length > 0;
        
        return (
          <div 
            key={task.id}
            onClick={() => onSelect(task.id)}
            className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative ${
              isSelected 
                ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100 -translate-y-0.5' 
                : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(task.id);
                }}
                className={`flex-shrink-0 transition-all active:scale-75 ${
                  task.completed 
                    ? (isSelected ? 'text-white' : 'text-emerald-500') 
                    : (isSelected ? 'text-indigo-300' : 'text-slate-200 hover:text-indigo-400')
                }`}
              >
                {task.completed ? (
                  <CheckSquare className="w-6 h-6 fill-current bg-white rounded-md" />
                ) : (
                  <Square className="w-6 h-6 stroke-[2.5px]" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-bold truncate transition-all ${
                  task.completed 
                    ? (isSelected ? 'text-indigo-100 line-through opacity-60' : 'text-slate-400 line-through italic') 
                    : (isSelected ? 'text-white' : 'text-slate-800')
                }`}>
                  {task.title || 'Sem título'}
                </h3>
                
                <div className="flex items-center gap-3 mt-1.5">
                  {task.status !== 'PENDING' && (
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase ${
                      task.status === 'OK' 
                        ? (isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700') 
                        : (isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700')
                    }`}>
                      {task.status}
                    </span>
                  )}
                  {hasImages && (
                    <span className={`flex items-center gap-1 text-[9px] font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                      <ImageIcon className="w-3 h-3" /> {task.images.length}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className={`w-4 h-4 transition-all ${isSelected ? 'text-white translate-x-1' : 'text-slate-200 opacity-0 group-hover:opacity-100'}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
