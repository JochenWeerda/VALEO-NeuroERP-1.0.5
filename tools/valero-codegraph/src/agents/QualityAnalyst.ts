import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import { artifactsDir, artifactTopN, writeJsonArtifacts } from '../config.js';
import { CodeMap, QualityFinding } from '../types.js';

export async function analyzeQuality(codeMap: CodeMap): Promise<QualityFinding[]> {
  const findings: QualityFinding[] = [];

  for (const f of codeMap.files) {
    if (f.sizeBytes > 500_000) {
      findings.push({ filePath: f.path, severity: 'high', rule: 'file.size', message: `Sehr große Datei (${Math.round(f.sizeBytes/1024)} KB)` });
    } else if (f.sizeBytes > 200_000) {
      findings.push({ filePath: f.path, severity: 'medium', rule: 'file.size', message: `Große Datei (${Math.round(f.sizeBytes/1024)} KB)` });
    }
    if (/\bany\b/.test(f.content)) {
      findings.push({ filePath: f.path, severity: 'medium', rule: 'ts.any', message: 'Verwendung von any gefunden' });
    }
    if (/TODO|FIXME/.test(f.content)) {
      findings.push({ filePath: f.path, severity: 'low', rule: 'comments.todo', message: 'TODO/FIXME Kommentar gefunden' });
    }
  }

  const sorted = findings.sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity));
  const limited = artifactTopN ? sorted.slice(0, artifactTopN) : sorted;
  await writeJsonArtifacts('quality-findings.json', limited);
  return findings;
}

function severityWeight(s: QualityFinding['severity']): number {
  switch (s) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'warning':
      return 2; // Backward compat
    case 'low':
      return 1;
    case 'info':
      return 0;
    default:
      return 0;
  }
}
