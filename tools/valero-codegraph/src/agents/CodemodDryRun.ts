import fs from 'fs'
import path from 'path'
import { CodeMap, QualityFinding } from '../types.js'
import { writeJsonArtifacts } from '../config.js'

interface AnyOccurrence {
  filePath: string
  line: number
  lineText: string
}

interface LargeFileSuggestion {
  filePath: string
  sizeKB: number
  exportCount: number
  suggestedSplit: number
}

export async function runCodemodDryRun(
  codeMap: CodeMap,
  findings: QualityFinding[],
): Promise<{ anyOccurrences: AnyOccurrence[]; largeFiles: LargeFileSuggestion[]; summaryPath: string }> {
  const anyFiles = new Set(findings.filter(f => f.rule === 'ts.any').map(f => f.filePath))
  const sizeFindings = findings.filter(f => f.rule === 'file.size')

  const filesByPath = new Map(codeMap.files.map(f => [path.normalize(f.path), f]))

  const anyOccurrences: AnyOccurrence[] = []
  for (const filePath of anyFiles) {
    const file = filesByPath.get(path.normalize(filePath))
    if (!file) continue
    const lines = file.content.split(/\r?\n/)
    let countInFile = 0
    for (let i = 0; i < lines.length; i++) {
      if (/\bany\b/.test(lines[i])) {
        anyOccurrences.push({ filePath, line: i + 1, lineText: lines[i].slice(0, 200) })
        countInFile++
        if (countInFile >= 10) break // pro Datei begrenzen
      }
    }
    if (anyOccurrences.length >= 1000) break // global begrenzen
  }

  const largeFiles: LargeFileSuggestion[] = []
  for (const f of sizeFindings) {
    const file = filesByPath.get(path.normalize(f.filePath))
    if (!file) continue
    const exportCount = (file.content.match(/\bexport\s+(?:default\s+)?(?:const|function|class|interface|type)\b/g) || [])
      .length
    const sizeKB = Math.round(file.sizeBytes / 1024)
    const suggestedSplit = Math.max(2, Math.min(8, Math.ceil(exportCount / 5)))
    largeFiles.push({ filePath: f.filePath, sizeKB, exportCount, suggestedSplit })
    if (largeFiles.length >= 200) break
  }

  // Artefakte schreiben
  await writeJsonArtifacts('codemod-any-occurrences.json', anyOccurrences)
  await writeJsonArtifacts('codemod-large-files.json', largeFiles)

  // Markdown Summary
  const topAny = anyOccurrences.slice(0, 50)
  const topLarge = largeFiles.slice(0, 50)
  const md = [
    '# Codemod Dry-Run',
    '',
    '## any → spezifische Typen (Top 50)',
    ...topAny.map((o, i) => `- ${i + 1}. ${o.filePath}:${o.line} — ${escapeMd(o.lineText)}`),
    '',
    '## Große Dateien splitten (Top 50)',
    ...topLarge.map((l, i) => `- ${i + 1}. ${l.filePath} — ${l.sizeKB} KB · Exporte: ${l.exportCount} · Vorschlag: ${l.suggestedSplit} Teilmodule`),
    '',
  ].join('\n')

  await writeJsonArtifacts('codemod-summary.md', md)

  return { anyOccurrences, largeFiles, summaryPath: 'codemod-summary.md' }
}

function escapeMd(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/`/g, '\\`').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}


