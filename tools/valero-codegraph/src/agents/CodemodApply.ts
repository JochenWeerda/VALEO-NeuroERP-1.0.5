import ts from 'typescript'
import path from 'path'
import fs from 'fs'
import { projectRoot } from '../config.js'

export interface ApplyOptions {
  targets?: string[]
  useUnknown?: boolean
}

export async function applyCodemods(options: ApplyOptions = {}) {
  const { targets = ['frontend/src/pages'], useUnknown = process.env.APPLY_UNKNOWN === '1' } = options
  const targetRoots = targets.map(t => path.resolve(projectRoot, t))

  const tsconfigPath = ts.findConfigFile(path.join(projectRoot, 'frontend'), ts.sys.fileExists, 'tsconfig.json')
  if (!tsconfigPath) throw new Error('tsconfig.json in frontend nicht gefunden')
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
  if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'))
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(tsconfigPath))

  const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options })
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

  const unknownType = ts.factory.createKeywordTypeNode(
    useUnknown ? ts.SyntaxKind.UnknownKeyword : ts.SyntaxKind.AnyKeyword,
  )

  let changedFiles = 0
  for (const sf of program.getSourceFiles()) {
    const fileName = sf.fileName
    if (!targetRoots.some(r => fileName.startsWith(r))) continue
    if (!/\.(ts|tsx)$/.test(fileName)) continue
    if (fileName.includes('node_modules')) continue

    let modified = false

    function isInFunctionScope(n: ts.Node): boolean {
      let current: ts.Node | undefined = n.parent
      while (current) {
        if (
          ts.isFunctionDeclaration(current) ||
          ts.isMethodDeclaration(current) ||
          ts.isConstructorDeclaration(current) ||
          ts.isGetAccessorDeclaration(current) ||
          ts.isSetAccessorDeclaration(current) ||
          ts.isArrowFunction(current) ||
          ts.isFunctionExpression(current)
        ) {
          return true
        }
        current = current.parent
      }
      return false
    }

    function nearestFunction(node: ts.Node): ts.FunctionLikeDeclarationBase | undefined {
      let current: ts.Node | undefined = node.parent
      while (current) {
        if (
          ts.isFunctionDeclaration(current) ||
          ts.isMethodDeclaration(current) ||
          ts.isConstructorDeclaration(current) ||
          ts.isGetAccessorDeclaration(current) ||
          ts.isSetAccessorDeclaration(current) ||
          ts.isArrowFunction(current) ||
          ts.isFunctionExpression(current)
        ) {
          return current as ts.FunctionLikeDeclarationBase
        }
        current = current.parent
      }
      return undefined
    }

    function isTopLevelExportedFunction(fn: ts.FunctionLikeDeclarationBase | undefined): boolean {
      if (!fn) return false
      // Arrow/functions assigned to exported const are tricky; be conservative: if top-level and has export modifier → skip
      if (fn.parent && ts.isSourceFile(fn.parent)) {
        const modifiers = (fn as ts.FunctionDeclaration).modifiers
        return !!modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
      }
      return false
    }

    function visitor(node: ts.Node): ts.Node {
      // VariableDeclaration: local-only fixes
      if (ts.isVariableDeclaration(node)) {
        // Update explicit : any to : unknown if local (inside a function)
        if (
          node.type &&
          ts.isKeywordTypeNode(node.type) &&
          node.type.kind === ts.SyntaxKind.AnyKeyword &&
          isInFunctionScope(node)
        ) {
          modified = true
          return ts.factory.updateVariableDeclaration(
            node,
            node.name,
            node.exclamationToken,
            unknownType,
            node.initializer,
          )
        }
        // Add : unknown only if no type and no initializer (avoid breaking inference)
        if (!node.type && !node.initializer && ts.isIdentifier(node.name) && isInFunctionScope(node)) {
          modified = true
          return ts.factory.updateVariableDeclaration(
            node,
            node.name,
            node.exclamationToken,
            unknownType,
            node.initializer,
          )
        }
      }

      // ParameterDeclaration: convert explicit any → unknown for non-exported, non-top-level functions
      if (ts.isParameter(node) && node.type && ts.isKeywordTypeNode(node.type) && node.type.kind === ts.SyntaxKind.AnyKeyword) {
        const fn = nearestFunction(node)
        if (fn && !isTopLevelExportedFunction(fn)) {
          modified = true
          return ts.factory.updateParameterDeclaration(
            node,
            node.modifiers,
            node.dotDotDotToken,
            node.name,
            node.questionToken,
            unknownType,
            node.initializer,
          )
        }
      }

      return ts.visitEachChild(node, visitor, context)
    }

    const context = ts.nullTransformationContext
    const transformed = ts.visitNode(sf, visitor)

    if (modified && transformed) {
      const printed = printer.printFile(transformed as ts.SourceFile)
      fs.writeFileSync(fileName, printed, 'utf8')
      changedFiles++
    }
  }

  return { changedFiles }
}


