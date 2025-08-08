export interface CodeFile {
  path: string;
  language: string;
  sizeBytes: number;
  content: string;
  imports: string[];
}

export interface CodeChunk {
  id: string;
  filePath: string;
  startLine: number;
  endLine: number;
  text: string;
  meta?: Record<string, unknown>;
}

export interface CodeMap {
  scannedAt: string;
  rootDir: string;
  files: CodeFile[];
  chunks: CodeChunk[];
}

export interface ArchNode {
  id: string;
  type: 'file' | 'directory' | 'module';
  path: string;
  children?: ArchNode[];
}

export interface DependencyEdge {
  from: string; // file path
  to: string;   // imported path (normalized)
}

export interface ArchGraph {
  createdAt: string;
  nodes: ArchNode[];
  deps: DependencyEdge[];
}

export interface QualityFinding {
  filePath: string;
  severity: 'info' | 'warning' | 'error';
  rule: string;
  message: string;
}

export interface RefactorSuggestion {
  filePath: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  component?: string;
}

export interface RagVector {
  id: string; // chunk id
  vector: number[];
  meta: { filePath: string; startLine: number; endLine: number };
}

export interface RagIndex {
  builtAt: string;
  dim: number;
  vectors: RagVector[];
}
