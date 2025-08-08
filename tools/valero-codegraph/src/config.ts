import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import zlib from 'zlib';

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

// Artifact Optimierung
export const artifactTopN: number | undefined = process.env.ARTIFACT_TOP_N
  ? Number.parseInt(process.env.ARTIFACT_TOP_N, 10)
  : undefined;
export const gzipArtifacts = process.env.GZIP_ARTIFACTS === '1' || process.env.GZIP_ARTIFACTS === 'true';
export const minifyArtifacts = process.env.MINIFY_ARTIFACTS === '1' || process.env.MINIFY_ARTIFACTS === 'true';

export async function writeJsonArtifacts(relFilePath: string, data: unknown) {
  await fse.ensureDir(artifactsDir);
  const outPath = path.join(artifactsDir, relFilePath);
  const json = minifyArtifacts ? JSON.stringify(data) : JSON.stringify(data, null, 2);
  fs.writeFileSync(outPath, json, 'utf8');
  if (gzipArtifacts) {
    const gz = zlib.gzipSync(json);
    fs.writeFileSync(outPath + '.gz', gz);
  }
}

export async function writeIndexFile(fileName: string, data: unknown) {
  await fse.ensureDir(indexDir);
  const outPath = path.join(indexDir, fileName);
  const json = minifyArtifacts ? JSON.stringify(data) : JSON.stringify(data, null, 2);
  fs.writeFileSync(outPath, json, 'utf8');
  if (gzipArtifacts) {
    const gz = zlib.gzipSync(json);
    fs.writeFileSync(outPath + '.gz', gz);
  }
}
