
import React, { useRef, useEffect } from 'react';
import { TestTask, TestStep, TestStatus, TestImage } from '../types';
import { 
  Trash2, 
  Plus, 
  X, 
  Image as ImageIcon, 
  FileText, 
  MessageSquare, 
  ListChecks, 
  Code,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Edit2,
  Type
} from 'lucide-react';

interface AutoResizingTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const AutoResizingTextarea: React.FC<AutoResizingTextareaProps> = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${className} resize-none overflow-hidden`}
    />
  );
};

interface TaskEditorProps {
  task: TestTask;
  onUpdate: (task: TestTask) => void;
  onDelete: () => void;
}

const TaskEditor: React.FC<TaskEditorProps> = ({ task, onUpdate, onDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof TestTask, value: any) => {
    onUpdate({ ...task, [field]: value });
  };

  const addStep = () => {
    const newStep: TestStep = { id: crypto.randomUUID(), description: '', completed: false };
    updateField('steps', [...task.steps, newStep]);
  };

  const updateStep = (id: string, updates: Partial<TestStep>) => {
    const newSteps = task.steps.map(s => s.id === id ? { ...s, ...updates } : s);
    updateField('steps', newSteps);
  };

  const removeStep = (id: string) => {
    updateField('steps', task.steps.filter(s => s.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newImage: TestImage = { url: base64, description: '' };
        updateField('images', [...(task.images || []), newImage]);
      };
      reader.readAsDataURL(file);
    });
    // Limpa o input para permitir o mesmo arquivo novamente se necessário
    e.target.value = '';
  };

  const updateImageDescription = (index: number, description: string) => {
    const newImages = [...task.images];
    newImages[index] = { ...newImages[index], description };
    updateField('images', newImages);
  };

  const removeImage = (index: number) => {
    updateField('images', task.images.filter((_, i) => i !== index));
  };

  const toggleStatus = (target: TestStatus) => {
    if (task.status === target) {
      updateField('status', 'PENDING');
    } else {
      updateField('status', target);
    }
  };

  const resetStatus = () => {
    updateField('status', 'PENDING');
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-2 group/title">
            <input 
              type="text"
              className="text-2xl font-bold text-slate-800 w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded-lg px-2 -ml-2 outline-none placeholder:text-slate-300 transition-all hover:bg-slate-50 focus:bg-white"
              value={task.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Nome da tarefa de teste..."
            />
            <Edit2 className="w-4 h-4 text-slate-300 opacity-0 group-hover/title:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <div className="flex items-center gap-6 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-mono uppercase"><Clock className="w-3.5 h-3.5" /> ID: {task.id.split('-')[0]}</span>
            <span className="flex items-center gap-1 uppercase tracking-wider font-semibold">
              Status Atual: 
              <span className={`ml-1 font-bold ${
                task.status === 'OK' ? 'text-emerald-600' : task.status === 'NOK' ? 'text-rose-600' : 'text-slate-500'
              }`}>
                {task.status === 'PENDING' ? 'PENDENTE' : task.status}
              </span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {task.status !== 'PENDING' && (
            <button 
              onClick={resetStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Status
            </button>
          )}
          <button 
            onClick={handleDeleteClick}
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            title="Excluir Tarefa"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto p-8 space-y-10">
          
          {/* Status Buttons */}
          <section className="flex gap-4">
            <button 
              onClick={() => toggleStatus('OK')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all ${
                task.status === 'OK' 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md ring-4 ring-emerald-500/10' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'
              }`}
            >
              <CheckCircle2 className={`w-6 h-6 ${task.status === 'OK' ? 'text-emerald-500' : 'text-slate-200'}`} />
              <div className="text-left">
                <div className="text-sm font-bold leading-none uppercase">Teste OK</div>
                <div className="text-[10px] mt-1 opacity-70">
                  {task.status === 'OK' ? 'Clique para desmarcar' : 'Teste funcionou com sucesso'}
                </div>
              </div>
            </button>
            <button 
              onClick={() => toggleStatus('NOK')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all ${
                task.status === 'NOK' 
                  ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-md ring-4 ring-rose-500/10' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-rose-200'
              }`}
            >
              <XCircle className={`w-6 h-6 ${task.status === 'NOK' ? 'text-rose-500' : 'text-slate-200'}`} />
              <div className="text-left">
                <div className="text-sm font-bold leading-none uppercase">Teste NOK</div>
                <div className="text-[10px] mt-1 opacity-70">
                  {task.status === 'NOK' ? 'Clique para desmarcar' : 'Falha encontrada no teste'}
                </div>
              </div>
            </button>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-10">
              
              <section>
                <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold uppercase text-xs tracking-wider">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <h3>Descrição do Teste</h3>
                </div>
                <textarea 
                  className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none resize-none"
                  value={task.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Descreva o que este cenário de teste verifica..."
                />
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold uppercase text-xs tracking-wider">
                    <ListChecks className="w-4 h-4 text-indigo-500" />
                    <h3>Passo a Passo</h3>
                  </div>
                  <button 
                    onClick={addStep}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-bold uppercase tracking-tighter"
                  >
                    <Plus className="w-3 h-3" /> Adicionar Passo
                  </button>
                </div>
                <div className="space-y-2">
                  {task.steps.map((step, idx) => (
                    <div key={step.id} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg group">
                      <input 
                        type="checkbox" 
                        checked={step.completed}
                        onChange={(e) => updateStep(step.id, { completed: e.target.checked })}
                        className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="mt-1 text-xs font-mono text-slate-400 w-4">{idx + 1}.</span>
                      <AutoResizingTextarea
                        value={step.description}
                        onChange={(val) => updateStep(step.id, { description: val })}
                        placeholder="Ação a ser realizada..."
                        className={`flex-1 bg-transparent border-none text-sm p-0 focus:ring-0 outline-none ${
                          step.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                        }`}
                      />
                      <button 
                        onClick={() => removeStep(step.id)}
                        className="mt-1 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {task.steps.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-xs italic">
                      Nenhum passo definido.
                    </div>
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold uppercase text-xs tracking-wider">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  <h3>Observações</h3>
                </div>
                <textarea 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none min-h-[100px] resize-none"
                  value={task.observations}
                  onChange={(e) => updateField('observations', e.target.value)}
                  placeholder="Informações adicionais, contextos ou notas importantes..."
                />
              </section>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 space-y-10">
              
              <section>
                <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold uppercase text-xs tracking-wider">
                  <Code className="w-4 h-4 text-indigo-500" />
                  <h3>Logs de Evidência</h3>
                </div>
                <div className="relative group">
                  <textarea 
                    className="w-full min-h-[250px] p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed rounded-xl border border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none custom-scrollbar resize-y shadow-inner"
                    value={task.logs}
                    onChange={(e) => updateField('logs', e.target.value)}
                    placeholder="// Cole logs de console, retornos de rede ou mensagens do sistema aqui..."
                  />
                  <div className="absolute top-3 right-3 opacity-20 text-indigo-400 group-focus-within:opacity-50 transition-opacity">
                    <Code className="w-5 h-5" />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold uppercase text-xs tracking-wider">
                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                    <h3>Imagens de Evidência</h3>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-bold uppercase"
                  >
                    <Plus className="w-3 h-3" /> Upload
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {(task.images || []).map((img, i) => (
                    <div key={i} className="flex flex-col gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl group relative">
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-100 shadow-sm bg-white ring-1 ring-slate-100">
                        <img src={img.url} alt={`Evidence ${i}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <button 
                            onClick={() => removeImage(i)}
                            className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                        <Type className="w-3.5 h-3.5 text-slate-400" />
                        <input 
                          type="text"
                          value={img.description}
                          onChange={(e) => updateImageDescription(i, e.target.value)}
                          placeholder="Adicionar descrição da imagem..."
                          className="flex-1 text-[11px] font-medium text-slate-700 outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50 transition-all gap-1 group"
                  >
                    <div className="p-2 bg-slate-50 group-hover:bg-indigo-100 rounded-full transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Nova Imagem</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskEditor;
