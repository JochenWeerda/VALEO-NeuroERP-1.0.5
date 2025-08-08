import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import { artifactsDir } from '../config.js';
import { CodeMap, QualityFinding } from '../types.js';

export async function analyzeQuality(codeMap: CodeMap): Promise<QualityFinding[]> {
  const findings: QualityFinding[] = [];

  for (const f of codeMap.files) {
    if (f.sizeBytes > 150_000) {
      findings.push({ filePath: f.path, severity: 'warning', rule: 'file.size', message: `Große Datei (${Math.round(f.sizeBytes/1024)} KB)` });
    }
    if (/\bany\b/.test(f.content)) {
      findings.push({ filePath: f.path, severity: 'warning', rule: 'ts.any', message: 'Verwendung von any gefunden' });
    }
    if (/TODO|FIXME/.test(f.content)) {
      findings.push({ filePath: f.path, severity: 'info', rule: 'comments.todo', message: 'TODO/FIXME Kommentar gefunden' });
    }
  }

  await fse.ensureDir(artifactsDir);
  fs.writeFileSync(path.join(artifactsDir, 'quality-findings.json'), JSON.stringify(findings, null, 2), 'utf8');
  return findings;
}
