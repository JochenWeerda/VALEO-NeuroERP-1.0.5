import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import { artifactTopN, writeJsonArtifacts } from '../config.js';
import { QualityFinding, RefactorSuggestion } from '../types.js';

export async function planRefactors(findings: QualityFinding[]): Promise<RefactorSuggestion[]> {
  const suggestions: RefactorSuggestion[] = [];

  for (const f of findings) {
    if (f.rule === 'ts.any') {
      suggestions.push({
        filePath: f.filePath,
        title: 'Ersetze any durch spezifische Typen',
        description: 'Führe generische Typen oder konkrete Interfaces ein, um Type‑Safety zu erhöhen.',
        impact: impactFromSeverity(f.severity),
        // Komponente ableiten (oberstes Verzeichnis unterhalb des Projekts)
        component: f.filePath.split(/\\|\//).slice(0, 3).join('/'),
      });
    }
    if (f.rule === 'file.size') {
      suggestions.push({
        filePath: f.filePath,
        title: 'Komponente/Modul aufteilen',
        description: 'Splitte die Datei in kleinere, klar abgegrenzte Einheiten zur Verbesserung der Wartbarkeit.',
        impact: impactFromSeverity(f.severity),
        component: f.filePath.split(/\\|\//).slice(0, 3).join('/'),
      });
    }
  }

  const ranked = suggestions.sort((a, b) => impactWeight(b.impact) - impactWeight(a.impact));
  const limited = artifactTopN ? ranked.slice(0, artifactTopN) : ranked;
  await writeJsonArtifacts('refactor-suggestions.json', limited);
  return suggestions;
}

function impactFromSeverity(sev: QualityFinding['severity']): RefactorSuggestion['impact'] {
  switch (sev) {
    case 'high':
      return 'high';
    case 'medium':
    case 'warning':
      return 'medium';
    case 'low':
    case 'info':
      return 'low';
    default:
      return 'medium';
  }
}

function impactWeight(i: RefactorSuggestion['impact']): number {
  switch (i) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    default:
      return 0;
  }
}
