#!/usr/bin/env tsx

/**
 * AST-based React Import and Client Directive Fixer
 * Uses ts-morph for safe, semantic code transformations
 *
 * Features:
 * - Merges React hook imports (useState, useCallback, etc.)
 * - Adds "use client" directive only when needed
 * - Dry-run mode for safety
 * - Comprehensive reporting
 */

import { Project, SyntaxKind, Node, SourceFile } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

interface FixOptions {
  dryRun?: boolean;
  targetDir?: string;
  backup?: boolean;
  verbose?: boolean;
}

interface FixResult {
  file: string;
  changes: string[];
  hasReactImports: boolean;
  hasClientDirective: boolean;
  needsClientDirective: boolean;
  addedHooks: string[];
}

class ReactImportFixer {
  private project: Project;
  private options: Required<FixOptions>;

  // React hooks that require client components
  private clientHooks = new Set([
    'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef',
    'useContext', 'useReducer', 'useImperativeHandle', 'useLayoutEffect',
    'useDeferredValue', 'useTransition', 'useId', 'useSyncExternalStore'
  ]);

  // Event handlers that indicate client-side code
  private clientPatterns = [
    /onClick|onChange|onSubmit|onMouse|onKey|onFocus|onBlur/i,
    /useState|useEffect|useCallback|useMemo|useRef/i,
    /document\.|window\.|localStorage|sessionStorage/i
  ];

  constructor(options: FixOptions = {}) {
    this.options = {
      dryRun: options.dryRun ?? true,
      targetDir: options.targetDir ?? './frontend/src',
      backup: options.backup ?? true,
      verbose: options.verbose ?? false
    };

    this.project = new Project({
      tsConfigFilePath: path.join(this.options.targetDir, '../../tsconfig.json'),
      skipAddingFilesFromTsConfig: true
    });
  }

  async fixAll(): Promise<FixResult[]> {
    const results: FixResult[] = [];
    const pattern = path.join(this.options.targetDir, '**/*.{ts,tsx}');

    // Add all TypeScript files
    this.project.addSourceFilesAtPaths(pattern);

    for (const sourceFile of this.project.getSourceFiles()) {
      const result = this.fixFile(sourceFile);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  private fixFile(sourceFile: SourceFile): FixResult | null {
    const filePath = sourceFile.getFilePath();
    const changes: string[] = [];

    // Skip non-TSX files for client directive checks
    const isTsx = filePath.endsWith('.tsx');

    // Find React import
    const reactImport = sourceFile.getImportDeclaration(
      (decl) => decl.getModuleSpecifierValue() === 'react'
    );

    // Analyze file for client-side patterns
    const needsClientDirective = isTsx && this.needsClientDirective(sourceFile);
    const hasClientDirective = this.hasClientDirective(sourceFile);

    // Check for missing React hooks
    const missingHooks = this.findMissingHooks(sourceFile);

    let hasChanges = false;

    // Add "use client" directive if needed
    if (needsClientDirective && !hasClientDirective) {
      this.addClientDirective(sourceFile);
      changes.push('Added "use client" directive');
      hasChanges = true;
    }

    // Fix React imports
    if (missingHooks.length > 0) {
      this.addMissingHooks(sourceFile, missingHooks, reactImport);
      changes.push(`Added React hooks: ${missingHooks.join(', ')}`);
      hasChanges = true;
    }

    // Save changes if not dry run
    if (hasChanges && !this.options.dryRun) {
      if (this.options.backup) {
        this.createBackup(filePath);
      }
      sourceFile.saveSync();
    }

    if (hasChanges || this.options.verbose) {
      return {
        file: path.relative(process.cwd(), filePath),
        changes,
        hasReactImports: !!reactImport,
        hasClientDirective,
        needsClientDirective,
        addedHooks: missingHooks
      };
    }

    return null;
  }

  private needsClientDirective(sourceFile: SourceFile): boolean {
    const text = sourceFile.getFullText();

    // Check for client-side patterns
    for (const pattern of this.clientPatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }

    // Check for JSX elements (indicates client component)
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement);
    const jsxFragments = sourceFile.getDescendantsOfKind(SyntaxKind.JsxFragment);

    return jsxElements.length > 0 || jsxFragments.length > 0;
  }

  private hasClientDirective(sourceFile: SourceFile): boolean {
    const statements = sourceFile.getStatements();

    if (statements.length === 0) return false;

    const firstStatement = statements[0];
    if (firstStatement.getKind() !== SyntaxKind.ExpressionStatement) return false;

    const expression = firstStatement.getExpression();
    if (expression.getKind() !== SyntaxKind.StringLiteral) return false;

    return expression.getText() === '"use client"';
  }

  private addClientDirective(sourceFile: SourceFile): void {
    const statements = sourceFile.getStatements();

    if (statements.length === 0) {
      sourceFile.insertText(0, '"use client";\n\n');
    } else {
      sourceFile.insertText(0, '"use client";\n\n');
    }
  }

  private findMissingHooks(sourceFile: SourceFile): string[] {
    const usedHooks = new Set<string>();
    const importedHooks = new Set<string>();

    // Find all hook usages
    for (const callExpr of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      const identifier = callExpr.getExpression();
      if (identifier.getKind() === SyntaxKind.Identifier) {
        const name = identifier.getText();
        if (this.clientHooks.has(name)) {
          usedHooks.add(name);
        }
      }
    }

    // Find imported hooks
    const reactImport = sourceFile.getImportDeclaration(
      (decl) => decl.getModuleSpecifierValue() === 'react'
    );

    if (reactImport) {
      const namedImports = reactImport.getNamedImports();
      for (const namedImport of namedImports) {
        importedHooks.add(namedImport.getName());
      }
    }

    // Return missing hooks
    const missing: string[] = [];
    for (const hook of usedHooks) {
      if (!importedHooks.has(hook)) {
        missing.push(hook);
      }
    }

    return missing.sort();
  }

  private addMissingHooks(
    sourceFile: SourceFile,
    missingHooks: string[],
    reactImport: Node | undefined
  ): void {
    if (!reactImport) {
      // Create new React import
      const importText = `import React, { ${missingHooks.join(', ')} } from 'react';\n`;
      sourceFile.insertText(0, importText);
    } else {
      // Update existing import
      const namedImports = reactImport.getNamedImports();
      const existingNames = namedImports.map(imp => imp.getName());

      // Merge and sort
      const allHooks = [...new Set([...existingNames, ...missingHooks])].sort();

      // Replace the import
      const importClause = reactImport.getImportClause();
      if (importClause) {
        const namedImportText = allHooks.length > 0 ? `{ ${allHooks.join(', ')} }` : '';
        const newImportText = `import React${namedImportText ? ', ' + namedImportText : ''} from 'react';`;
        reactImport.replaceWithText(newImportText);
      }
    }
  }

  private createBackup(filePath: string): void {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
  }

  async run(): Promise<void> {
    console.log(`🔧 React Import Fixer`);
    console.log(`📁 Target: ${this.options.targetDir}`);
    console.log(`🏃 Dry Run: ${this.options.dryRun ? 'YES' : 'NO'}`);
    console.log(`💾 Backup: ${this.options.backup ? 'YES' : 'NO'}`);
    console.log('');

    const results = await this.fixAll();

    console.log(`📊 Results: ${results.length} files processed`);
    console.log('');

    for (const result of results) {
      console.log(`📄 ${result.file}`);
      if (result.changes.length > 0) {
        for (const change of result.changes) {
          console.log(`  ✅ ${change}`);
        }
      } else {
        console.log(`  ℹ️  No changes needed`);
      }
      console.log('');
    }

    if (this.options.dryRun) {
      console.log(`💡 Run with --apply to make actual changes`);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: FixOptions = {
    dryRun: !args.includes('--apply'),
    targetDir: args.find(arg => arg.startsWith('--dir='))?.split('=')[1] ?? './frontend/src',
    backup: !args.includes('--no-backup'),
    verbose: args.includes('--verbose')
  };

  const fixer = new ReactImportFixer(options);
  await fixer.run();
}

if (require.main === module) {
  main().catch(console.error);
}

export { ReactImportFixer, FixOptions, FixResult };