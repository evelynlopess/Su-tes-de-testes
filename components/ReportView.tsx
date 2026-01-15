
import React, { useState } from 'react';
import { TestTask } from '../types';
import { X, Download, FileText, FileSpreadsheet, CheckCircle2, XCircle, Clock, Loader2, Code, ListChecks, FileSearch, MessageSquare, ImageIcon, FileSignature, FileCode, Tags, FolderArchive } from 'lucide-react';

interface ReportViewProps {
  tasks: TestTask[];
  onClose: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ tasks, onClose }) => {
  const [isGenerating, setIsGenerating] = useState<'pdf' | 'excel' | null>(null);
  const [reportName, setReportName] = useState(`Relatorio_QA_${new Date().toISOString().split('T')[0]}`);

  const stats = {
    total: tasks.length,
    ok: tasks.filter(t => t.status === 'OK').length,
    nok: tasks.filter(t => t.status === 'NOK').length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
  };

  const createZipWithLogs = async (mainFileBlob: Blob, mainFileName: string) => {
    // @ts-ignore
    const zip = new JSZip();
    zip.file(mainFileName, mainFileBlob);
    
    const logsFolder = zip.folder("logs_evidencias");
    
    tasks.filter(t => t.logs && t.logs.trim() !== '').forEach((task, index) => {
      const logHeader = `================================================================================\n`;
      const logBody = `RELATÓRIO DE LOG - CENÁRIO: ${task.title}\nID: ${task.id}\nSTATUS: ${task.status}\nDATA: ${new Date().toLocaleString()}\n${logHeader}\n\n${task.logs}\n\n${logHeader}FIM DO LOG`;
      
      const customName = task.logFileName?.trim() 
        ? task.logFileName.replace(/[^a-z0-9]/gi, '_').toLowerCase() 
        : `log_cenario_${index + 1}_${task.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
        
      logsFolder.file(`${customName}.txt`, logBody);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName}_EVIDENCIAS.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    setIsGenerating('pdf');
    const element = document.getElementById('report-content-pdf');
    
    const opt = {
      margin: [10, 10, 10, 10], // Margens padrão de documento (superior, esquerda, inferior, direita)
      filename: `${reportName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false,
        width: 794, // Largura aproximada de um A4 em pixels (96dpi) para evitar distorção
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { 
        mode: ['css', 'legacy'], // Respeita as regras de CSS (page-break-before)
        before: '.page-break'
      }
    };

    try {
      // @ts-ignore
      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
      await createZipWithLogs(pdfBlob, `${reportName}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleExportExcel = async () => {
    setIsGenerating('excel');
    try {
      const data = tasks.map((t, idx) => ({
        '#': idx + 1,
        'Cenário': t.title,
        'Status': t.status,
        'Descrição': t.description,
        'Passos': `${t.steps.filter(s => s.completed).length}/${t.steps.length}`,
        'Log': t.logFileName ? `${t.logFileName}.txt` : 'N/A'
      }));

      // @ts-ignore
      const ws = XLSX.utils.json_to_sheet(data);
      // @ts-ignore
      const wb = XLSX.utils.book_new();
      // @ts-ignore
      XLSX.utils.book_append_sheet(wb, ws, "QA");
      // @ts-ignore
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      await createZipWithLogs(excelBlob, `${reportName}.xlsx`);
    } catch (error) {
      console.error("Erro ao gerar Excel:", error);
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-10">
      <div className="bg-white w-full max-w-6xl h-full rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Toolbar Superior */}
        <header className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white no-print">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Exportar Relatório e Logs</h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              <span className="flex items-center gap-1 text-indigo-500 font-bold"><FolderArchive className="w-3 h-3" /> Pacote ZIP</span>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <span className="flex items-center gap-1">Padrão: 1 Cenário por Página</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Nome do Projeto</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                <FileSignature className="w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-48"
                />
              </div>
            </div>

            <div className="h-8 w-px bg-slate-100 mx-2" />

            <div className="flex items-center gap-3">
              <button 
                onClick={handleExportExcel}
                disabled={isGenerating !== null}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
              >
                {isGenerating === 'excel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                ZIP (Excel)
              </button>
              <button 
                onClick={handleExportPDF}
                disabled={isGenerating !== null}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
              >
                {isGenerating === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                ZIP (PDF)
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* ÁREA DO CONTEÚDO (Otimizada para PDF) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-200 p-8 flex justify-center">
          <div 
            id="report-content-pdf" 
            className="w-[794px] bg-white shadow-none text-slate-900 border border-slate-200"
            style={{ fontFamily: "'Inter', Arial, sans-serif" }}
          >
            {/* Capa do Relatório */}
            <div className="p-16 border-b-8 border-slate-900 text-center mb-16">
              <h1 className="text-5xl font-bold uppercase tracking-tighter mb-4">Relatório de Testes QA</h1>
              <p className="text-xl text-slate-600 font-medium mb-12">Documentação Técnica de Evidências</p>
              
              <div className="grid grid-cols-2 gap-8 text-left mb-20 max-w-lg mx-auto bg-slate-50 p-8 rounded-lg border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projeto</p>
                  <p className="text-sm font-bold text-slate-800">{reportName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data de Emissão</p>
                  <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 border border-slate-100 rounded bg-white">
                  <p className="text-xl font-bold">{stats.total}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Cenários</p>
                </div>
                <div className="p-4 border border-slate-100 rounded bg-emerald-50">
                  <p className="text-xl font-bold text-emerald-600">{stats.ok}</p>
                  <p className="text-[9px] font-bold text-emerald-400 uppercase">OK</p>
                </div>
                <div className="p-4 border border-slate-100 rounded bg-rose-50">
                  <p className="text-xl font-bold text-rose-600">{stats.nok}</p>
                  <p className="text-[9px] font-bold text-rose-400 uppercase">NOK</p>
                </div>
                <div className="p-4 border border-slate-100 rounded bg-slate-50">
                  <p className="text-xl font-bold text-slate-400">{stats.pending}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Pendente</p>
                </div>
              </div>
            </div>

            {/* Iteração de Cenários (Cada um em uma folha) */}
            <div>
              {tasks.map((task, idx) => (
                <div 
                  key={task.id} 
                  className="page-break" 
                  style={{ pageBreakBefore: 'always', padding: '40px' }}
                >
                  {/* Cabeçalho do Cenário */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {String(idx + 1).padStart(2, '0')}. {task.title}
                      </h2>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">ID: {task.id}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded text-[11px] font-bold border-2 ${
                      task.status === 'OK' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      task.status === 'NOK' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      STATUS: {task.status === 'PENDING' ? 'PENDENTE' : task.status}
                    </div>
                  </div>

                  <div className="space-y-10">
                    
                    {/* Descrição */}
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 border-l-4 border-slate-400 pl-3">
                        01. Objetivo do Teste
                      </h3>
                      <div className="text-sm text-slate-700 leading-relaxed pl-4">
                        {task.description || "Nenhuma descrição fornecida."}
                      </div>
                    </section>

                    {/* Passos */}
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 border-l-4 border-slate-400 pl-3">
                        02. Procedimentos e Execução
                      </h3>
                      <div className="space-y-3 pl-4">
                        {task.steps.map((step, sIdx) => (
                          <div key={step.id} className="flex gap-4 text-sm">
                            <span className="font-bold text-slate-300">{sIdx + 1}.</span>
                            <span className={`flex-1 ${step.completed ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                              {step.description}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-slate-300">
                              {step.completed ? '[OK]' : '[...]'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Imagens (CENTRALIZADAS) */}
                    {task.images && task.images.length > 0 && (
                      <section className="pt-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-8 border-l-4 border-slate-400 pl-3">
                          03. Registro de Evidências Visuais
                        </h3>
                        <div className="space-y-12">
                          {task.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="flex flex-col items-center">
                              <div className="border border-slate-200 p-1 bg-white inline-block">
                                <img 
                                  src={img.url} 
                                  alt={`Evidência ${idx + 1}.${imgIdx + 1}`} 
                                  className="max-h-[480px] w-auto block object-contain"
                                />
                              </div>
                              <div className="mt-4 text-center max-w-[80%]">
                                <p className="text-[11px] font-bold text-slate-900 border-t border-slate-100 pt-2">
                                  Figura {idx + 1}.{imgIdx + 1}: {img.description || "Captura de tela da execução."}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Logs */}
                    {task.logs && (
                      <section>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 border-l-4 border-slate-400 pl-3">
                          04. Retorno de Sistema / Console
                        </h3>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-slate-600 overflow-hidden">
                          <pre className="whitespace-pre-wrap break-all leading-relaxed">
                            {task.logs.slice(0, 3000)}{task.logs.length > 3000 ? '... [Log truncado para o PDF - Ver arquivo .txt no ZIP]' : ''}
                          </pre>
                        </div>
                      </section>
                    )}

                    {/* Notas */}
                    {task.observations && (
                      <section className="p-4 bg-slate-50 border border-slate-100 italic text-sm text-slate-600 rounded">
                        <strong>Observações:</strong> {task.observations}
                      </section>
                    )}

                  </div>

                  {/* Rodapé da Página */}
                  <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-300 uppercase font-bold tracking-widest">
                    <span>Documento Oficial QA</span>
                    <span>Página {idx + 2}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Página de Encerramento */}
            <div className="page-break p-16 flex flex-col items-center justify-center min-h-[600px]" style={{ pageBreakBefore: 'always' }}>
              <div className="text-center space-y-20 w-full">
                <div className="h-0.5 bg-slate-100 w-full" />
                <div className="grid grid-cols-2 gap-20">
                  <div className="space-y-4">
                    <div className="h-px bg-slate-900 w-full" />
                    <p className="text-[10px] font-bold uppercase text-slate-900">Assinatura do Analista</p>
                    <p className="text-[9px] text-slate-400">{new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="h-px bg-slate-900 w-full" />
                    <p className="text-[10px] font-bold uppercase text-slate-900">Validação QA Lead</p>
                  </div>
                </div>
                <div className="pt-20">
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
                    Fim do Relatório Técnico
                  </p>
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
