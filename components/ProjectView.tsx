
import React, { useState, useMemo, useCallback } from 'react';
import { TestProject, TestTask, TestStatus, TestCategory } from '../types';
import { 
  Plus, 
  Download, 
  Search, 
  LayoutDashboard, 
  Eraser, 
  ArrowLeft,
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  SearchCheck, 
  CheckSquare,
  Trash2
} from 'lucide-react';
import TaskList from './TaskList';
import TaskEditor from './TaskEditor';
import ReportView from './ReportView';

interface ProjectViewProps {
  project: TestProject;
  allTasks: TestTask[];
  onTasksChange: (tasks: TestTask[]) => void;
  onBack: () => void;
}

const CAT_STYLES: Record<TestCategory, { name: string; icon: any; color: string }> = {
  FUNCTIONAL: { name: 'Funcional', icon: CheckSquare, color: 'text-blue-500 bg-blue-500' },
  NON_FUNCTIONAL: { name: 'Não Funcional', icon: ShieldCheck, color: 'text-purple-500 bg-purple-500' },
  REGRESSION: { name: 'Regressão', icon: RotateCcw, color: 'text-orange-500 bg-orange-500' },
  SANITY: { name: 'Sanidade', icon: Zap, color: 'text-amber-500 bg-amber-500' },
  CONFIRMATION: { name: 'Confirmação', icon: SearchCheck, color: 'text-emerald-500 bg-emerald-500' }
};

const ProjectView: React.FC<ProjectViewProps> = ({ project, allTasks, onTasksChange, onBack }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TestStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReport, setShowReport] = useState(false);

  const catStyle = CAT_STYLES[project.category] || CAT_STYLES.FUNCTIONAL;
  const CatIcon = catStyle.icon;

  const projectTasks = useMemo(() => 
    allTasks.filter(t => t.projectId === project.id)
  , [allTasks, project.id]);

  const filteredTasks = useMemo(() => {
    return projectTasks.filter(task => {
      const matchesFilter = filter === 'ALL' || task.status === filter;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            task.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [projectTasks, filter, searchQuery]);

  const selectedTask = useMemo(() => 
    projectTasks.find(t => t.id === selectedTaskId), 
  [projectTasks, selectedTaskId]);

  const handleAddTask = () => {
    const newTask: TestTask = {
      id: crypto.randomUUID(),
      projectId: project.id,
      title: 'Novo Cenário de Teste',
      description: '',
      steps: [],
      observations: '',
      logs: '',
      images: [],
      status: 'PENDING',
      completed: false,
      createdAt: Date.now(),
    };
    onTasksChange([newTask, ...allTasks]);
    setSelectedTaskId(newTask.id);
  };

  const handleUpdateTask = (updatedTask: TestTask) => {
    onTasksChange(allTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  // Função centralizada de exclusão
  const handleDeleteTask = (id: string) => {
    if (window.confirm('Excluir cenário permanentemente? Esta ação não pode ser desfeita.')) {
      const newTasksList = allTasks.filter(t => t.id !== id);
      onTasksChange(newTasksList);
      if (selectedTaskId === id) {
        setSelectedTaskId(null);
      }
    }
  };

  const handleRenameTask = (id: string) => {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;
    const newTitle = window.prompt('Novo nome do cenário:', task.title);
    if (newTitle) handleUpdateTask({ ...task, title: newTitle });
  };

  const handleClearAll = () => {
    if (window.confirm('Excluir TODAS as tarefas DESTE projeto?')) {
      onTasksChange(allTasks.filter(t => t.projectId !== project.id));
      setSelectedTaskId(null);
    }
  };

  const handleToggleComplete = (id: string) => {
    onTasksChange(allTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const stats = {
    ok: projectTasks.filter(t => t.status === 'OK').length,
    nok: projectTasks.filter(t => t.status === 'NOK').length,
    pending: projectTasks.filter(t => t.status === 'PENDING').length,
  };

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden">
      <aside className="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-2xl z-20">
        <div className="p-4 border-b border-slate-100">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-indigo-600 transition-all mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar à Home
          </button>
          
          <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden group/header">
            <div className={`absolute top-0 right-0 w-24 h-24 ${catStyle.color} opacity-20 blur-2xl -mr-8 -mt-8 rounded-full`} />
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className={`p-1.5 rounded-lg bg-white/10 ${catStyle.color.split(' ')[0]}`}>
                <CatIcon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{catStyle.name}</span>
            </div>
            <h2 className="font-black truncate text-base mb-4 relative z-10 leading-tight">{project.name}</h2>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-black relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center group-hover/header:bg-white/10 transition-colors">
                <div className="opacity-40 uppercase tracking-tighter mb-0.5">OK</div>
                <div className="text-sm text-emerald-400">{stats.ok}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center group-hover/header:bg-white/10 transition-colors">
                <div className="opacity-40 uppercase tracking-tighter mb-0.5">NOK</div>
                <div className="text-sm text-rose-400">{stats.nok}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center group-hover/header:bg-white/10 transition-colors">
                <div className="opacity-40 uppercase tracking-tighter mb-0.5">NEW</div>
                <div className="text-sm text-indigo-300">{stats.pending}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-hidden flex-1">
          <button 
            onClick={handleAddTask}
            className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" /> Novo Cenário
          </button>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl text-xs font-bold focus:ring-0 focus:border-indigo-200 focus:bg-white transition-all outline-none placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-1 p-1.5 bg-slate-100 rounded-2xl text-[9px] font-black uppercase tracking-widest">
            {(['ALL', 'OK', 'NOK', 'PENDING'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  filter === s ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {s === 'ALL' ? 'Tudo' : s}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar pr-1 -mr-1">
            {filteredTasks.length > 0 ? (
              <TaskList 
                tasks={filteredTasks} 
                selectedId={selectedTaskId} 
                onSelect={setSelectedTaskId}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onRename={handleRenameTask}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <div className="p-4 bg-slate-50 rounded-full mb-4 opacity-50">
                  <SearchCheck className="w-10 h-10" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  {searchQuery ? 'Nenhum resultado' : 'Nenhum cenário criado'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <button 
            onClick={() => setShowReport(true)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
          >
            <Download className="w-4 h-4" /> Gerar Relatório
          </button>
          <button 
            onClick={handleClearAll}
            className="flex items-center justify-center gap-2 w-full py-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all"
          >
            <Eraser className="w-3.5 h-3.5" /> Resetar Dados
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative flex flex-col bg-white">
        {selectedTask ? (
          <TaskEditor 
            key={selectedTask.id}
            task={selectedTask} 
            onUpdate={handleUpdateTask} 
            onDelete={() => handleDeleteTask(selectedTask.id)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 text-center animate-in fade-in zoom-in duration-500">
            <div className="p-8 bg-slate-50 rounded-full mb-8">
              <LayoutDashboard className="w-24 h-24 opacity-5" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Pronto para Testar</h2>
            <p className="max-w-md text-slate-500 font-medium leading-relaxed">Selecione um cenário à esquerda para detalhar passos, anexar evidências visuais e coletar logs de execução.</p>
          </div>
        )}
      </main>

      {showReport && (
        <ReportView 
          tasks={projectTasks} 
          onClose={() => setShowReport(false)} 
        />
      )}
    </div>
  );
};

export default ProjectView;
