
import React, { useState, useEffect, useMemo } from 'react';
import { TestProject, TestTask, TestStatus, TestCategory, ProjectStatus } from './types';
import HomeView from './components/HomeView';
import ProjectView from './components/ProjectView';

const App: React.FC = () => {
  const [projects, setProjects] = useState<TestProject[]>(() => {
    const saved = localStorage.getItem('testmaster_projects');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [tasks, setTasks] = useState<TestTask[]>(() => {
    const saved = localStorage.getItem('testmaster_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('testmaster_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('testmaster_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleCreateProject = (name: string, description: string, category: TestCategory) => {
    const newProject: TestProject = {
      id: crypto.randomUUID(),
      name,
      description,
      category,
      status: 'BACKLOG',
      createdAt: Date.now(),
    };
    setProjects([newProject, ...projects]);
  };

  const handleUpdateProject = (projectId: string, updates: Partial<TestProject>) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Tem certeza? Isso excluirá o projeto e TODAS as tarefas dentro dele.')) {
      setProjects(projects.filter(p => p.id !== projectId));
      setTasks(tasks.filter(t => t.projectId !== projectId));
      if (currentProjectId === projectId) setCurrentProjectId(null);
    }
  };

  const handleUpdateTasks = (updatedTasks: TestTask[]) => {
    setTasks(updatedTasks);
  };

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === currentProjectId) || null
  , [projects, currentProjectId]);

  return (
    <div className="h-screen w-screen overflow-hidden font-sans bg-slate-50 text-slate-900">
      {!currentProjectId ? (
        <HomeView 
          projects={projects} 
          tasks={tasks}
          onCreateProject={handleCreateProject}
          onUpdateProject={handleUpdateProject}
          onSelectProject={setCurrentProjectId}
          onDeleteProject={handleDeleteProject}
        />
      ) : (
        <ProjectView 
          project={selectedProject!}
          allTasks={tasks}
          onTasksChange={handleUpdateTasks}
          onBack={() => setCurrentProjectId(null)}
        />
      )}
    </div>
  );
};

export default App;
