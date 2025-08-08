import ts from 'typescript'
import path from 'path'
import { projectRoot, writeJsonArtifacts } from '../config.js'

export interface TypeSuggestion {
  filePath: string
  line: number
  column: number
  kind: 'parameter' | 'variable' | 'property' | 'return' | 'other'
  name?: string
  currentType: string
  suggestedType: string
  note: string
}

function isAny(type: ts.Type): boolean {
  return (type.flags & ts.TypeFlags.Any) !== 0
}

export async function runTypeSuggestor(targetGlobs: string[] = ['frontend/src/pages']): Promise<{ suggestions: TypeSuggestion[]; summaryPath: string }> {
  const tsconfigPath = ts.findConfigFile(path.join(projectRoot, 'frontend'), ts.sys.fileExists, 'tsconfig.json')
  if (!tsconfigPath) throw new Error('tsconfig.json in frontend nicht gefunden')

  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
  if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'))
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(tsconfigPath))

  const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options })
  const checker = program.getTypeChecker()

  const targetRoots = targetGlobs.map(g => path.resolve(projectRoot, g))

  const suggestions: TypeSuggestion[] = []
  for (const sf of program.getSourceFiles()) {
    const fileName = sf.fileName
    if (!targetRoots.some(r => fileName.startsWith(r))) continue
    if (fileName.includes('node_modules')) continue

    const visit = (node: ts.Node) => {
      // Parameters
      if (ts.isParameter(node) && !node.type) {
        const type = checker.getTypeAtLocation(node)
        if (isAny(type)) {
          const { line, character } = sf.getLineAndCharacterOfPosition(node.pos)
          suggestions.push({
            filePath: fileName,
            line: line + 1,
            column: character + 1,
            kind: 'parameter',
            name: (node.name as ts.Identifier)?.text,
            currentType: 'any (implicit)',
            suggestedType: 'unknown',
            note: 'Parameter ohne Typ. unknown bevorzugen oder generischen Typ einführen.',
          })
        }
      }
      // Variable Declarations
      if (ts.isVariableDeclaration(node) && !node.type) {
        const type = checker.getTypeAtLocation(node)
        if (isAny(type)) {
          const { line, character } = sf.getLineAndCharacterOfPosition(node.pos)
          suggestions.push({
            filePath: fileName,
            line: line + 1,
            column: character + 1,
            kind: 'variable',
            name: (node.name as ts.Identifier)?.text,
            currentType: 'any (implicit)',
            suggestedType: 'unknown',
            note: 'Variable ohne Typ. unknown oder konkreten Interface-Typ angeben.',
          })
        }
      }
      // Function return type
      if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isArrowFunction(node)) && !node.type) {
        const type = checker.getReturnTypeOfSignature(checker.getSignatureFromDeclaration(node as ts.SignatureDeclaration)!)
        if (type && isAny(type)) {
          const { line, character } = sf.getLineAndCharacterOfPosition(node.pos)
          suggestions.push({
            filePath: fileName,
            line: line + 1,
            column: character + 1,
            kind: 'return',
            name: undefined,
            currentType: 'any (implicit)',
            suggestedType: 'unknown',
            note: 'Rückgabetyp angeben. unknown oder konkreten Typ definieren.',
          })
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(sf)
  }

  // Deduplicate by position
  const seen = new Set<string>()
  const dedup = suggestions.filter(s => {
    const key = `${s.filePath}:${s.line}:${s.column}:${s.kind}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  await writeJsonArtifacts('type-suggestions.json', dedup)
  const md = ['# Type Suggestions (Dry-Run)', '', ...dedup.slice(0, 100).map((s, i) => `- ${i + 1}. ${s.filePath}:${s.line}:${s.column} · ${s.kind} · ${s.currentType} → ${s.suggestedType} — ${s.note}`)].join('\n')
  await writeJsonArtifacts('type-suggestions.md', md)

  return { suggestions: dedup, summaryPath: 'type-suggestions.md' }
}


