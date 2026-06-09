export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  thoughtProcess?: string[];
  codeBlock?: {
    filename: string;
    code: string;
    language: string;
  };
  sources?: string[];
  image?: {
    data: string;
    mimeType: string;
  };
  selectedDocName?: string;
}

export interface Document {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  chunks: number;
  status: 'indexed' | 'syncing' | 'failed';
  type: 'pdf' | 'csv' | 'md' | 'txt' | 'doc';
  similarity?: number;
  content?: string;
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  status: 'connected' | 'disconnected';
  description: string;
}

export interface ArchitectureNode {
  id: string;
  title: string;
  subtitle: string;
  category: 'client' | 'api' | 'orchestrator' | 'inference' | 'database';
  subcomponents: string[];
  metrics: {
    label: string;
    value: string;
    status: 'good' | 'warning' | 'critical';
  }[];
  description: string;
}
