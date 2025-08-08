import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import { artifactsDir } from '../config.js';
import { QualityFinding, RefactorSuggestion } from '../types.js';

export async function planRefactors(findings: QualityFinding[]): Promise<RefactorSuggestion[]> {
  const suggestions: RefactorSuggestion[] = [];

  for (const f of findings) {
    if (f.rule === 'ts.any') {
      suggestions.push({
        filePath: f.filePath,
        title: 'Ersetze any durch spezifische Typen',
        description: 'Führe generische Typen oder konkrete Interfaces ein, um Type‑Safety zu erhöhen.',
        impact: 'medium',
      });
    }
    if (f.rule === 'file.size') {
      suggestions.push({
        filePath: f.filePath,
        title: 'Komponente/Modul aufteilen',
        description: 'Splitte die Datei in kleinere, klar abgegrenzte Einheiten zur Verbesserung der Wartbarkeit.',
        impact: 'high',
      });
    }
  }

  await fse.ensureDir(artifactsDir);
  fs.writeFileSync(path.join(artifactsDir, 'refactor-suggestions.json'), JSON.stringify(suggestions, null, 2), 'utf8');
  return suggestions;
}
