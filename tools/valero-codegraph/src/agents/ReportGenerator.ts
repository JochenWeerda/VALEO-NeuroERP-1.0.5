import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import { artifactsDir, writeJsonArtifacts } from '../config.js';
import { ArchGraph, CodeMap, QualityFinding, RefactorSuggestion } from '../types.js';

export async function generateReport(params: {
  codeMap: CodeMap;
  arch: ArchGraph;
  findings: QualityFinding[];
  suggestions: RefactorSuggestion[];
}) {
  const { codeMap, arch, findings, suggestions } = params;
  await fse.ensureDir(artifactsDir);
  const out = path.join(artifactsDir, 'report.md');

  const md = `# VALERO CodeGraph Report\n\n`
    + `- Scan: ${codeMap.scannedAt}\n`
    + `- Dateien: ${codeMap.files.length}\n`
    + `- Chunks: ${codeMap.chunks.length}\n`
    + `- Abhaengigkeiten: ${arch.deps.length}\n`
    + `- Findings: ${findings.length}\n`
    + `- Refactor-Vorschlaege: ${suggestions.length}\n\n`
    + `## Hinweise\n\n`
    + `- Artefakte: ${artifactsDir}\n`
    + `- Arch-Graph: arch-graph.json\n`
    + `- Code-Map: code-map.json\n`
    + `- Quality: quality-findings.json\n`
    + `- Refactors: refactor-suggestions.json\n`;

  await writeJsonArtifacts('report.md', md);
  return out;
}
