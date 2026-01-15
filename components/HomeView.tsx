
import React, { useState, useEffect } from 'react';
import { TestProject, TestTask, TestCategory, ProjectStatus } from '../types';
import { 
  Plus, 
  FolderKanban, 
  Trash2, 
  CheckSquare, 
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  SearchCheck, 
  MoreHorizontal,
  Edit3,
  X,
  GripVertical
} from 'lucide-react';

interface HomeViewProps {
  projects: TestProject[];
  tasks: TestTask[];
  onCreateProject: (name: string, description: string, category: TestCategory) => void;
  onUpdateProject: (id: string, updates: Partial<TestProject>) => void;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

const CATEGORIES: { id: TestCategory; name: string; desc: string; icon: any; color: string }[] = [
  { id: 'FUNCTIONAL', name: 'Funcional', desc: 'Valida requisitos e regras de negócio.', icon: CheckSquare, color: 'bg-blue-500' },
  { id: 'NON_FUNCTIONAL', name: 'Não Funcional', desc: 'Performance, segurança e usabilidade.', icon: ShieldCheck, color: 'bg-purple-500' },
  { id: 'REGRESSION', name: 'Regressão', desc: 'Garante que nada quebrou após mudanças.', icon: RotateCcw, color: 'bg-orange-500' },
  { id: 'SANITY', name: 'Sanidade', desc: 'Check rápido de estabilidade da build.', icon: Zap, color: 'bg-amber-500' },
  { id: 'CONFIRMATION', name: 'Confirmação', desc: 'Valida especificamente a correção de bugs.', icon: SearchCheck, color: 'bg-emerald-500' }
];

const COLUMNS: { id: ProjectStatus; name: string; color: string }[] = [
  { id: 'BACKLOG', name: 'Planejado', color: 'border-t-slate-300' },
  { id: 'IN_PROGRESS', name: 'Em Execução', color: 'border-t-indigo-500' },
  { id: 'DONE', name: 'Concluído', color: 'border-t-emerald-500' },
  { id: 'ARCHIVED', name: 'Arquivado', color: 'border-t-rose-300' }
];

const HomeView: React.FC<HomeViewProps> = ({ projects, tasks, onCreateProject, onUpdateProject, onSelectProject, onDeleteProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<TestProject | null>(null);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dropTargetColumn, setDropTargetColumn] = useState<ProjectStatus | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedCat, setSelectedCat] = useState<TestCategory>('FUNCTIONAL');

  useEffect(() => {
    if (editingProject) {
      setNewName(editingProject.name);
      setNewDesc(editingProject.description);
      setSelectedCat(editingProject.category);
      setIsModalOpen(true);
    }
  }, [editingProject]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setNewName('');
    setNewDesc('');
    setSelectedCat('FUNCTIONAL');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      if (editingProject) {
        onUpdateProject(editingProject.id, {
          name: newName.trim(),
          description: newDesc.trim(),
          category: selectedCat
        });
      } else {
        onCreateProject(newName.trim(), newDesc.trim(), selectedCat);
      }
      closeModal();
    }
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    return {
      total: projectTasks.length,
      ok: projectTasks.filter(t => t.status === 'OK').length,
      nok: projectTasks.filter(t => t.status === 'NOK').length,
    };
  };

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProjectId(projectId);
    e.dataTransfer.setData('projectId', projectId);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedProjectId(null);
    setDropTargetColumn(null);
  };

  const handleDragOverColumn = (e: React.DragEvent, columnId: ProjectStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetColumn !== columnId) {
      setDropTargetColumn(columnId);
    }
  };

  const handleDropOnColumn = (e: React.DragEvent, columnId: ProjectStatus) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('projectId') || draggedProjectId;
    if (projectId) {
      onUpdateProject(projectId, { status: columnId });
    }
    setDropTargetColumn(null);
    setDraggedProjectId(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
      <header className="px-8 py-6 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">QA Kanban Board</h1>
          <p className="text-slate-500 text-sm font-medium">Gerencie suas suítes de teste.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Nova Suíte
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto custom-scrollbar p-6">
        <div className="flex gap-6 h-full min-w-max">
          {COLUMNS.map(column => {
            const columnProjects = projects.filter(p => p.status === column.id);
            const isTarget = dropTargetColumn === column.id;
            
            return (
              <div 
                key={column.id} 
                className="w-80 flex flex-col h-full group"
                onDragOver={(e) => handleDragOverColumn(e, column.id)}
                onDragLeave={() => setDropTargetColumn(null)}
                onDrop={(e) => handleDropOnColumn(e, column.id)}
              >
                <div className={`mb-4 flex items-center justify-between p-3 bg-white rounded-xl border-t-4 ${column.color} shadow-sm transition-all ${isTarget ? 'ring-2 ring-indigo-500 ring-offset-2 scale-[1.02]' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-700 uppercase tracking-widest">{column.name}</span>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {columnProjects.length}
                    </span>
                  </div>
                </div>

                <div className={`flex-1 rounded-2xl p-3 overflow-y-auto custom-scrollbar border-2 transition-all ${
                  isTarget ? 'bg-indigo-50 border-indigo-200 border-dashed' : 'bg-slate-100/50 border-transparent group-hover:border-slate-200/50'
                }`}>
                  <div className="space-y-4">
                    {columnProjects.map(project => {
                      const stats = getProjectStats(project.id);
                      const progress = stats.total > 0 ? Math.round(((stats.ok + stats.nok) / stats.total) * 100) : 0;
                      const catInfo = CATEGORIES.find(c => c.id === project.category)!;
                      const CatIcon = catInfo.icon;

                      return (
                        <div 
                          key={project.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, project.id)}
                          onDragEnd={handleDragEnd}
                          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group/card relative animate-in fade-in zoom-in duration-300"
                          onClick={() => onSelectProject(project.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 ${catInfo.color} text-white rounded-lg shadow-sm`}>
                                <CatIcon className="w-4 h-4" />
                              </div>
                              <GripVertical className="w-4 h-4 text-slate-200 group-hover/card:text-slate-300" />
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingProject(project);
                                }}
                                className="p-2 text-slate-300 hover:text-indigo-500 transition-all rounded-lg hover:bg-indigo-50"
                                title="Editar Suíte"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteProject(project.id);
                                }}
                                className="p-2 text-slate-300 hover:text-rose-600 transition-all rounded-lg hover:bg-rose-50"
                                title="Excluir Permanentemente"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 group-hover/card:text-indigo-600 transition-colors">{project.name}</h3>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mb-4 leading-relaxed">{project.description || 'Sem descrição.'}</p>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-tighter text-slate-400">
                              <span>Progresso QA</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${catInfo.color} transition-all duration-500`} 
                                style={{ width: `${progress}%` }} 
                              />
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex gap-2 text-[10px] font-bold text-slate-400">
                                <span className="flex items-center gap-0.5" title="Tarefas OK"><CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> {stats.ok}</span>
                                <span className="flex items-center gap-0.5" title="Tarefas NOK"><MoreHorizontal className="w-3.5 h-3.5 text-rose-500" /> {stats.nok}</span>
                              </div>
                              <span className="text-[9px] text-slate-300 font-mono">{new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {columnProjects.length === 0 && (
                      <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                        <FolderKanban className="w-8 h-8 mx-auto text-slate-200 mb-2" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Vazio</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto custom-scrollbar transform transition-all animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900">{editingProject ? 'Editar Suíte' : 'Nova Suíte'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Nome do Projeto</label>
                <input 
                  type="text" autoFocus required
                  placeholder="Ex: App de Delivery - Sprint 12"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-lg font-bold text-black"
                  value={newName} onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Categoria de Teste</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => (
                    <div 
                      key={cat.id}
                      onClick={() => setSelectedCat(cat.id)}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedCat === cat.id ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${selectedCat === cat.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">{cat.name}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{cat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Descrição (Opcional)</label>
                <textarea 
                  placeholder="Objetivo dos testes, ambiente, requisitos..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all h-32 resize-none font-medium text-black"
                  value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
                  {editingProject ? 'Salvar Alterações' : 'Criar Suíte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
