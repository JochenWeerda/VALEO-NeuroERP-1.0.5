import path from 'path';

export const projectRoot = path.resolve(process.cwd(), '..', '..');

export const scanRoots = [
  path.join(projectRoot, 'frontend'),
];

export const ignoreGlobs = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/.turbo/**',
  '**/.cache/**',
];

export const storageDir = path.join(projectRoot, 'tools', 'valero-codegraph', 'storage');
export const artifactsDir = path.join(storageDir, 'artifacts');
export const indexDir = path.join(storageDir, 'index');

export const embeddingDim = 256;
