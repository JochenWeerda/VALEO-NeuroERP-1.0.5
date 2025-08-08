import fse from 'fs-extra';
import path from 'path';
import { artifactsDir, indexDir, storageDir } from './config.js';
import { scanRepo } from './agents/CodeScanner.js';
import { mapStructure } from './agents/StructureMapper.js';
import { buildIndex } from './agents/RAGMemoryManager.js';
import { analyzeQuality } from './agents/QualityAnalyst.js';
import { planRefactors } from './agents/SerenaRefactor.js';
import { logChanges } from './agents/ChangeLogger.js';
import { generateReport } from './agents/ReportGenerator.js';
import { runCodemodDryRun } from './agents/CodemodDryRun.js';
import { runTypeSuggestor } from './agents/TypeSuggestor.js';
import { applyCodemods } from './agents/CodemodApply.js';

export async function run(command: string, arg?: string) {
  await fse.ensureDir(storageDir);
  await fse.ensureDir(artifactsDir);
  await fse.ensureDir(indexDir);

  if (command === 'pipeline') {
    const codeMap = await scanRepo();
    const arch = await mapStructure(codeMap);
    await buildIndex(codeMap);
    const findings = await analyzeQuality(codeMap);
    const suggestions = await planRefactors(findings);
    await logChanges(suggestions);
    const out = await generateReport({ codeMap, arch, findings, suggestions });
    await runCodemodDryRun(codeMap, findings);
    await runTypeSuggestor(['frontend/src/pages']);
    console.log('✔ Pipeline abgeschlossen. Report:', out);
    return;
  }

  if (command === 'index') {
    const codeMap = await scanRepo();
    await buildIndex(codeMap);
    console.log('✔ Index erstellt.');
    return;
  }

  if (command === 'quality') {
    const codeMap = await scanRepo();
    const findings = await analyzeQuality(codeMap);
    console.log(`✔ Quality‑Check: ${findings.length} Findings`);
    return;
  }

  if (command === 'refactor') {
    const codeMap = await scanRepo();
    const findings = await analyzeQuality(codeMap);
    const suggestions = await planRefactors(findings);
    await logChanges(suggestions);
    console.log(`✔ Refactor‑Plan: ${suggestions.length} Vorschläge`);
    return;
  }

  if (command === 'report') {
    const codeMap = await scanRepo();
    const arch = await mapStructure(codeMap);
    const findings = await analyzeQuality(codeMap);
    const suggestions = await planRefactors(findings);
    const out = await generateReport({ codeMap, arch, findings, suggestions });
    console.log('✔ Report erstellt:', out);
    return;
  }

  if (command === 'codemod-dryrun') {
    const codeMap = await scanRepo();
    const findings = await analyzeQuality(codeMap);
    // Enges Ziel: src/pages + nur Dateien mit any-Findings
    const anyFiles = Array.from(
      new Set(
        findings
          .filter(f => f.rule === 'ts.any' && /frontend[\\\/]src[\\\/]pages/.test(f.filePath))
          .map(f => f.filePath)
      )
    );
    const targets = anyFiles.length > 0 ? anyFiles : ['frontend/src/pages'];
    await runTypeSuggestor(targets);
    console.log(`✔ Codemod Dry-Run: ${targets.length} Ziele`);
    return;
  }

  if (command === 'plan') {
    const codeMap = await scanRepo();
    const findings = await analyzeQuality(codeMap);
    const suggestions = await planRefactors(findings);
    await runCodemodDryRun(codeMap, findings);
    await runTypeSuggestor(['frontend/src/pages']);
    console.log(`✔ Plan erstellt: ${findings.length} Findings → ${suggestions.length} Vorschläge`);
    return;
  }

  if (command === 'query') {
    const { query } = await import('./agents/QueryAgent.js');
    const q = arg || process.argv.slice(3).join(' ');
    const results = query(q, 5);
    console.log('Top‑Treffer:', results);
    return;
  }

  if (command === 'apply-codemods') {
    const narrowTargets = ['frontend/src']
    const { changedFiles } = await applyCodemods({ targets: narrowTargets, useUnknown: true });
    console.log(`✔ Codemods angewendet (Scope: ${narrowTargets.join(', ')}): ${changedFiles} Dateien geändert`)
    return
  }

  // default
  console.log('Befehle: pipeline | index | quality | refactor | query | report | plan');
}

// Immer CLI ausführen, unabhängig von tsx/ts-node Modulauflösung
const cmd = process.argv[2] || 'pipeline';
run(cmd).catch(err => {
  console.error('Fehler in Pipeline:', err);
  process.exit(1);
});
