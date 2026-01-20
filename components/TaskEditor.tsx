import React, { useRef, useEffect, useState } from 'react';
import { TestTask, TestStep, TestImage } from '../types';
import { 
  Trash2, 
  Plus, 
  X, 
  Image as ImageIcon, 
  FileText, 
  ListChecks, 
  Camera,
  Clipboard,
  Check,
  Type
} from 'lucide-react';

interface TaskEditorProps {
  task: TestTask;
  onUpdate: (task: TestTask) => void;
  onDelete: () => void;
}

const TaskEditor: React.FC<TaskEditorProps> = ({ task, onUpdate, onDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);

  const updateField = (field: keyof TestTask, value: any) => {
    onUpdate({ ...task, [field]: value });
  };

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              updateField('images', [...(task.images || []), { url: base64, description: 'Imagem colada em ' + new Date().toLocaleTimeString() }]);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [task.images]);

  const addStep = () => {
    updateField('steps', [...task.steps, { id: crypto.randomUUID(), description: '', completed: false }]);
  };

  const updateStep = (id: string, updates: Partial<TestStep>) => {
    updateField('steps', task.steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeStep = (id: string) => {
    updateField('steps', task.steps.filter(s => s.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => updateField('images', [...(task.images || []), { url: reader.result as string, description: '' }]);
      reader.readAsDataURL(file);
    });
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Câmera não disponível.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      updateField('images', [...(task.images || []), { url: canvas.toDataURL('image/png'), description: 'Foto capturada' }]);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden text-slate-900">
      <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex-1 mr-4">
          <input 
            type="text"
            className="text-2xl font-black text-slate-900 w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-50 rounded-xl px-2 -ml-2 outline-none transition-all placeholder:text-slate-300"
            value={task.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Título da Tarefa..."
          />
          <div className="flex items-center gap-4 mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>ID: {task.id.split('-')[0]}</span>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span>Criado em {new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <button onClick={onDelete} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
          <section className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => updateField('status', task.status === 'OK' ? 'PENDING' : 'OK')}
              className={`flex flex-col items-center justify-center gap-3 py-10 rounded-[2.5rem] border-4 transition-all ${
                task.status === 'OK' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xl shadow-emerald-100' : 'bg-slate-50 border-transparent text-slate-500 hover:border-emerald-200'
              }`}
            >
              <div className={`p-4 rounded-full transition-all ${task.status === 'OK' ? 'bg-emerald-500 text-white scale-125' : 'bg-slate-200 text-white'}`}>
                <Check className="w-10 h-10 stroke-[4px]" />
              </div>
              <span className="font-black uppercase tracking-[0.2em] text-xs">Tarefa Concluída</span>
            </button>
            <button 
              onClick={() => updateField('status', task.status === 'NOK' ? 'PENDING' : 'NOK')}
              className={`flex flex-col items-center justify-center gap-3 py-10 rounded-[2.5rem] border-4 transition-all ${
                task.status === 'NOK' ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xl shadow-rose-100' : 'bg-slate-50 border-transparent text-slate-500 hover:border-rose-200'
              }`}
            >
              <div className={`p-4 rounded-full transition-all ${task.status === 'NOK' ? 'bg-rose-500 text-white scale-125' : 'bg-slate-200 text-white'}`}>
                <X className="w-10 h-10 stroke-[4px]" />
              </div>
              <span className="font-black uppercase tracking-[0.2em] text-xs">Reportar Falha</span>
            </button>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-2 mb-4 text-slate-900 font-black uppercase text-[10px] tracking-widest">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3>Descrição Detalhada</h3>
                </div>
                <textarea 
                  className="w-full min-h-[150px] p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-sm font-medium text-slate-900 focus:bg-white focus:ring-8 focus:ring-indigo-50/50 focus:border-indigo-200 transition-all outline-none resize-none leading-relaxed placeholder:text-slate-300"
                  value={task.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Escreva aqui o que precisa ser feito..."
                />
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest">
                    <ListChecks className="w-4 h-4 text-indigo-600" />
                    <h3>Checklist Interno</h3>
                  </div>
                  <button onClick={addStep} className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95">
                    + Novo Item
                  </button>
                </div>
                <div className="space-y-3 bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
                  {task.steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group transition-all hover:shadow-md">
                      <input 
                        type="checkbox" 
                        checked={step.completed}
                        onChange={(e) => updateStep(step.id, { completed: e.target.checked })}
                        className="w-5 h-5 text-indigo-600 rounded-lg focus:ring-indigo-500 cursor-pointer border-slate-300"
                      />
                      <input 
                        type="text"
                        value={step.description}
                        onChange={(e) => updateStep(step.id, { description: e.target.value })}
                        className={`flex-1 bg-transparent border-none text-sm p-0 focus:ring-0 font-bold ${step.completed ? 'text-slate-300 line-through italic' : 'text-slate-900'}`}
                        placeholder="Nome do item..."
                      />
                      <button onClick={() => removeStep(step.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-10">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <h3>Evidências e Fotos</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={startCamera} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-90"><Camera className="w-4 h-4" /></button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all shadow-sm active:scale-90"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
                <div className="grid grid-cols-1 gap-6">
                  {task.images.map((img, i) => (
                    <div key={i} className="group relative bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                      <div className="aspect-video flex items-center justify-center bg-slate-50"><img src={img.url} className="max-w-full max-h-full object-contain" /></div>
                      <div className="p-4 flex items-center gap-3 border-t border-slate-100 bg-white">
                        <Type className="w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          value={img.description}
                          onChange={(e) => {
                            const newImgs = [...task.images];
                            newImgs[i].description = e.target.value;
                            updateField('images', newImgs);
                          }}
                          className="flex-1 bg-transparent border-none text-[11px] font-black text-slate-900 outline-none"
                          placeholder="Adicione uma legenda..."
                        />
                        <button onClick={() => updateField('images', task.images.filter((_, idx) => idx !== i))} className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  <div className="py-16 border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 group hover:border-indigo-300 transition-all">
                    <Clipboard className="w-12 h-12 mb-4 opacity-30 group-hover:scale-110 group-hover:text-indigo-600 transition-all" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center leading-relaxed">Pressione <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Ctrl + V</span> para<br/>colar um print aqui.</p>
                  </div>
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