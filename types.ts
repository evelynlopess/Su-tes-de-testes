
export type TestStatus = 'PENDING' | 'OK' | 'NOK';
export type TestCategory = 'FUNCTIONAL' | 'NON_FUNCTIONAL' | 'REGRESSION' | 'SANITY' | 'CONFIRMATION';
export type ProjectStatus = 'BACKLOG' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';

export interface TestStep {
  id: string;
  description: string;
  completed: boolean;
}

export interface TestImage {
  url: string;
  description: string;
}

export interface TestTask {
  id: string;
  projectId: string; 
  title: string;
  description: string;
  steps: TestStep[];
  observations: string;
  logs: string;
  logFileName?: string; // Novo campo para nomear o arquivo .txt de log
  images: TestImage[]; 
  status: TestStatus;
  completed: boolean;
  createdAt: number;
}

export interface TestProject {
  id: string;
  name: string;
  description: string;
  category: TestCategory;
  status: ProjectStatus;
  createdAt: number;
}

export interface AppState {
  projects: TestProject[];
  tasks: TestTask[];
  currentProjectId: string | null;
}
