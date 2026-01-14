
import React, { useState } from 'react';
import { TestTask } from '../types';
import { X, Download, FileText, FileSpreadsheet, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';

interface ReportViewProps {
  tasks: TestTask[];
  onClose: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ tasks, onClose }) => {
  const [isGenerating, setIsGenerating] = useState<'pdf' | 'excel' | null>(null);

  const stats = {
    total: tasks.length,
    ok: tasks.filter(t => t.status === 'OK').length,
    nok: tasks.filter(t => t.status === 'NOK').length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
  };

  const handleExportPDF = async () => {
    setIsGenerating('pdf');
    const element = document.getElementById('report-content');
    const opt = {
      margin: 10,
      filename: `Relatorio_QA_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Verifique o console.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleExportExcel = () => {
    setIsGenerating('excel');
    try {
      const data = tasks.map((t, idx) => ({
        '#': idx + 1,
        'Título': t.title,
        'Status': t.status,
        'Descrição': t.description,
        'Passos': t.steps.map(s => `[${s.completed ? 'X' : ' '}] ${s.description}`).join('\n'),
        'Observações': t.observations,
        'Logs de Evidência': t.logs,
        'Qtd Imagens': t.images?.length || 0,
        'Data de Criação': new Date(t.createdAt).toLocaleString()
      }));

      // @ts-ignore
      const ws = XLSX.utils.json_to_sheet(data);
      // @ts-ignore
      const wb = XLSX.utils.book_new();
      // @ts-ignore
      XLSX.utils.book_append_sheet(wb, ws, "Relatório de Testes");
      
      // @ts-ignore
      XLSX.writeFile(wb, `Relatorio_QA_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Erro ao gerar Excel:", error);
      alert("Erro ao gerar Excel.");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-10">
      <div className="bg-white w-full max-w-6xl h-full rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <header className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white no-print">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Relatório de Execução QA</h2>
            <p className="text-xs text-slate-400">Gerado em {new Date().toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportExcel}
              disabled={isGenerating !== null}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
            >
              {isGenerating === 'excel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Excel
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={isGenerating !== null}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              {isGenerating === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Gerar PDF Completo
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Report Content */}
        <div id="report-content" className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Report Header Visual */}
            <div className="text-center mb-10 border-b pb-8">
              <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Sumário de Execução de Testes</h1>
              <p className="text-slate-500 font-medium">Data do Relatório: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Dashboard Mini */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <div className="text-3xl font-black text-slate-800">{stats.total}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cenários</div>
              </div>
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                <div className="text-3xl font-black text-emerald-600">{stats.ok}</div>
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Sucesso (OK)</div>
              </div>
              <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                <div className="text-3xl font-black text-rose-600">{stats.nok}</div>
                <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Falha (NOK)</div>
              </div>
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                <div className="text-3xl font-black text-amber-600">{stats.pending}</div>
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-1">Pendentes</div>
              </div>
            </div>

            {/* Tasks Detail List */}
            <div className="space-y-16">
              {tasks.map((task, idx) => (
                <div key={task.id} className="pt-8 first:pt-0 border-b border-slate-100 pb-12 last:border-0">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-black px-3 py-1 bg-slate-900 text-white rounded-lg">CENÁRIO #{idx + 1}</span>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{task.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">{task.description || "Sem descrição informada."}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      {task.status === 'OK' && (
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black border-b-4 border-emerald-700 uppercase shadow-sm">
                          <CheckCircle2 className="w-4 h-4" /> Passed
                        </div>
                      )}
                      {task.status === 'NOK' && (
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black border-b-4 border-rose-700 uppercase shadow-sm">
                          <XCircle className="w-4 h-4" /> Failed
                        </div>
                      )}
                      {task.status === 'PENDING' && (
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 text-slate-600 rounded-xl text-xs font-black border-b-4 border-slate-400 uppercase shadow-sm">
                          <Clock className="w-4 h-4" /> Pending
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Coluna Esquerda: Texto */}
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Passo a Passo da Execução</h4>
                        <ul className="space-y-3">
                          {task.steps.length > 0 ? task.steps.map((step, sIdx) => (
                            <li key={step.id} className="flex gap-3 text-sm font-medium">
                              <span className="text-indigo-500 font-black">{sIdx + 1}.</span>
                              <span className={`flex-1 ${step.completed ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                {step.description}
                              </span>
                              {step.completed ? 
                                <span className="text-[9px] font-black text-emerald-500 bg-white px-2 py-0.5 rounded-md border border-emerald-100">OK</span> : 
                                <span className="text-[9px] font-black text-rose-300 bg-white px-2 py-0.5 rounded-md border border-rose-50">SKIP</span>
                              }
                            </li>
                          )) : (
                            <li className="text-xs italic text-slate-400">Nenhum passo definido.</li>
                          )}
                        </ul>
                      </div>

                      {task.observations && (
                        <div className="p-5 border-l-4 border-indigo-500 bg-indigo-50/30 rounded-r-2xl">
                          <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Observações Adicionais</h4>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed italic">"{task.observations}"</p>
                        </div>
                      )}

                      {task.logs && (
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Evidências de Log (Console/System)</h4>
                          <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-[10px] font-mono leading-relaxed overflow-x-auto border border-slate-800">
                            {task.logs}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Coluna Direita: Imagens */}
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Capturas de Tela de Evidência</h4>
                      {task.images && task.images.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                          {task.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="space-y-2 group">
                              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm transition-transform hover:scale-[1.01]">
                                <img src={img.url} alt={`Evidence ${imgIdx}`} className="w-full h-auto object-contain max-h-[400px]" />
                              </div>
                              {img.description && (
                                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                                  <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                                    {img.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 text-xs font-bold uppercase tracking-widest">
                          Sem evidências visuais
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Sign-off para Relatórios Oficiais */}
            <div className="pt-20 pb-10 grid grid-cols-2 gap-16">
              <div className="space-y-2">
                <div className="h-px bg-slate-900 w-full" />
                <div className="text-center">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Responsável pela Execução</span>
                  <p className="text-xs text-slate-400 mt-1">QA Engineer / Analyst</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-px bg-slate-900 w-full" />
                <div className="text-center">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Aprovação / Stakeholder</span>
                  <p className="text-xs text-slate-400 mt-1">Product Owner / Tech Lead</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
