import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import fse from 'fs-extra';
import { artifactsDir, ignoreGlobs, scanRoots } from '../config.js';
import { CodeFile, CodeMap, CodeChunk } from '../types.js';

const TEXT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt', '.yml', '.yaml', '.css', '.scss'];

export async function scanRepo(): Promise<CodeMap> {
  const files: CodeFile[] = [];
  const chunks: CodeChunk[] = [];

  for (const root of scanRoots) {
    const patterns = TEXT_EXTENSIONS.map(ext => path.join(root, '**', `*${ext}`));
    const matches = await glob(patterns, { ignore: ignoreGlobs, nodir: true, windowsPathsNoEscape: true });

    for (const filePath of matches) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const sizeBytes = Buffer.byteLength(content, 'utf8');
        const language = path.extname(filePath).replace('.', '');
        const imports = extractImports(content);

        files.push({ path: filePath, language, sizeBytes, content, imports });

        // naive single-chunk per file (can be improved with AST)
        const lines = content.split(/\r?\n/);
        chunks.push({
          id: `${filePath}#0`,
          filePath,
          startLine: 1,
          endLine: lines.length,
          text: content,
        });
      } catch {
        // ignore unreadable files
      }
    }
  }

  const codeMap: CodeMap = {
    scannedAt: new Date().toISOString(),
    rootDir: process.cwd(),
    files,
    chunks,
  };

  await fse.ensureDir(artifactsDir);
  fs.writeFileSync(path.join(artifactsDir, 'code-map.json'), JSON.stringify(codeMap, null, 2), 'utf8');
  return codeMap;
}

function extractImports(content: string): string[] {
  const imports: string[] = [];
  const importRegex = /import\s+[^;]*from\s+['"]([^'"]+)['"];?/g;
  const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = importRegex.exec(content))) imports.push(m[1]);
  while ((m = requireRegex.exec(content))) imports.push(m[1]);
  return imports;
}
