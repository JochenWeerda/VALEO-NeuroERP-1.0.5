#!/usr/bin/env node

/**
 * VALEO NeuroERP Frontend - Error Fixer
 * Systematische Behebung von ESLint-Fehlern und Warnings im Frontend
 */

const fs = require('fs');
const path = require('path');

// Sentry Integration (falls verfügbar)
let Sentry;
try {
  Sentry = require('@sentry/nextjs');
} catch (error) {
  console.warn('Sentry not available, running in offline mode');
}

class FrontendErrorFixer {
  constructor() {
    this.fixedErrors = [];
    this.failedFixes = [];
  }

  /**
   * Führt ESLint aus und behebt gefundene Fehler systematisch
   */
  async fixFrontendErrors() {
    console.log('🔧 VALEO NeuroERP Frontend - Error Fixer');
    console.log('='.repeat(60));

    // Führe ESLint aus und sammle Fehler
    await this.runESLint();

    if (this.eslintOutput.length === 0) {
      console.log('✅ No ESLint errors found!');
      return;
    }

    console.log(`📊 Found ${this.eslintOutput.split('\n').length} ESLint issues\n`);

    // Parse ESLint Output
    this.parseESLintOutput();

    // Behebe Fehler nach Priorität
    await this.fixCriticalErrors();
    await this.fixUnusedVariables();
    await this.fixAnyTypes();
    await this.fixReactHooks();

    // Bericht generieren
    this.generateFixReport();
  }

  /**
   * Führt ESLint aus und sammelt die Ausgabe
   */
  async runESLint() {
    const { execSync } = require('child_process');

    try {
      // ESLint ausführen und Output sammeln
      this.eslintOutput = execSync('npm run lint', {
        encoding: 'utf8',
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });

      console.log('ESLint completed successfully');
    } catch (error) {
      // Fehler-Ausgabe sammeln
      this.eslintOutput = error.stdout || '';
      console.log('ESLint found errors, analyzing...');
    }
  }

  /**
   * Parst ESLint-Ausgabe und extrahiert Fehler
   */
  parseESLintOutput() {
    this.errors = [];
    const lines = this.eslintOutput.split('\n').filter(line => line.trim());

    for (const line of lines) {
      // ESLint Fehler Pattern: file:line:col: error|warning message
      const errorMatch = line.match(/^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+(.+)$/);

      if (errorMatch) {
        const [, file, lineNum, col, severity, message] = errorMatch;

        const error = {
          file: file.replace(/\\/g, '/'),
          line: parseInt(lineNum),
          column: parseInt(col),
          severity,
          message: message.trim(),
          category: this.getCategory(message),
          timestamp: new Date().toISOString()
        };

        this.errors.push(error);
      }
    }

    console.log(`Parsed ${this.errors.length} ESLint issues`);
  }

  /**
   * Bestimmt Kategorie basierend auf Fehlermeldung
   */
  getCategory(message) {
    if (message.includes('Parsing error')) return 'parsing';
    if (message.includes('no-unused-vars')) return 'unused';
    if (message.includes('no-explicit-any')) return 'any-type';
    if (message.includes('react-hooks')) return 'react-hooks';
    if (message.includes('exhaustive-deps')) return 'react-hooks';
    return 'other';
  }

  /**
   * Behebt Critical Parsing Errors (höchste Priorität)
   */
  async fixCriticalErrors() {
    console.log('\n🚨 FIXING CRITICAL PARSING ERRORS (Syntax Issues)');
    console.log('-'.repeat(50));

    const parsingErrors = this.errors.filter(e => e.category === 'parsing');

    if (parsingErrors.length === 0) {
      console.log('✅ No parsing errors found!');
      return;
    }

    console.log(`Found ${parsingErrors.length} parsing errors\n`);

    for (const error of parsingErrors) {
      try {
        console.log(`🔧 Fixing: ${error.file}:${error.line} - ${error.message}`);

        const fixed = await this.fixParsingError(error);
        if (fixed) {
          this.fixedErrors.push({ ...error, priority: 'critical' });
          console.log('✅ Fixed successfully');
        } else {
          this.failedFixes.push({ ...error, priority: 'critical' });
          console.log('❌ Could not fix automatically');
        }
      } catch (fixError) {
        console.error(`❌ Fix failed: ${fixError.message}`);
        this.failedFixes.push({ ...error, priority: 'critical' });
      }
    }
  }

  /**
   * Behebt Unused Variables/Imports
   */
  async fixUnusedVariables() {
    console.log('\n🧹 CLEANING UNUSED VARIABLES AND IMPORTS');
    console.log('-'.repeat(50));

    const unusedErrors = this.errors.filter(e => e.category === 'unused');

    if (unusedErrors.length === 0) {
      console.log('✅ No unused variables found!');
      return;
    }

    console.log(`Found ${unusedErrors.length} unused variables\n`);

    for (const error of unusedErrors) {
      try {
        console.log(`🧹 Cleaning: ${error.file}:${error.line} - ${error.message}`);

        const fixed = await this.removeUnusedVariable(error);
        if (fixed) {
          this.fixedErrors.push({ ...error, priority: 'cleanup' });
          console.log('✅ Cleaned successfully');
        } else {
          this.failedFixes.push({ ...error, priority: 'cleanup' });
          console.log('❌ Could not clean automatically');
        }
      } catch (fixError) {
        console.error(`❌ Clean failed: ${fixError.message}`);
        this.failedFixes.push({ ...error, priority: 'cleanup' });
      }
    }
  }

  /**
   * Behebt 'any' Types
   */
  async fixAnyTypes() {
    console.log('\n🎯 REPLACING ANY TYPES WITH SPECIFIC TYPES');
    console.log('-'.repeat(50));

    const anyErrors = this.errors.filter(e => e.category === 'any-type');

    if (anyErrors.length === 0) {
      console.log('✅ No any types found!');
      return;
    }

    console.log(`Found ${anyErrors.length} any type usages\n`);

    for (const error of anyErrors) {
      try {
        console.log(`🎯 Fixing: ${error.file}:${error.line} - ${error.message}`);

        const fixed = await this.replaceAnyType(error);
        if (fixed) {
          this.fixedErrors.push({ ...error, priority: 'types' });
          console.log('✅ Type fixed successfully');
        } else {
          this.failedFixes.push({ ...error, priority: 'types' });
          console.log('❌ Could not fix type automatically');
        }
      } catch (fixError) {
        console.error(`❌ Type fix failed: ${fixError.message}`);
        this.failedFixes.push({ ...error, priority: 'types' });
      }
    }
  }

  /**
   * Behebt React Hook Dependencies
   */
  async fixReactHooks() {
    console.log('\n⚛️ FIXING REACT HOOK DEPENDENCIES');
    console.log('-'.repeat(50));

    const hookErrors = this.errors.filter(e => e.category === 'react-hooks');

    if (hookErrors.length === 0) {
      console.log('✅ No React hook issues found!');
      return;
    }

    console.log(`Found ${hookErrors.length} React hook issues\n`);

    for (const error of hookErrors) {
      try {
        console.log(`⚛️ Fixing: ${error.file}:${error.line} - ${error.message}`);

        const fixed = await this.fixReactHook(error);
        if (fixed) {
          this.fixedErrors.push({ ...error, priority: 'hooks' });
          console.log('✅ Hook fixed successfully');
        } else {
          this.failedFixes.push({ ...error, priority: 'hooks' });
          console.log('❌ Could not fix hook automatically');
        }
      } catch (fixError) {
        console.error(`❌ Hook fix failed: ${fixError.message}`);
        this.failedFixes.push({ ...error, priority: 'hooks' });
      }
    }
  }

  /**
   * Fix für Parsing Errors (fehlende Kommas, etc.)
   */
  async fixParsingError(error) {
    const filePath = path.join(__dirname, '..', error.file);

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        let line = lines[lineIndex];

        // Häufige Parsing-Fehler beheben
        if (error.message.includes("',' expected")) {
          // Fehlendes Komma hinzufügen
          if (!line.trim().endsWith(',')) {
            line = line.trimEnd() + ',';
            lines[lineIndex] = line;
            fs.writeFileSync(filePath, lines.join('\n'));
            return true;
          }
        }

        if (error.message.includes("'Identifier expected'")) {
          // Mögliche Syntaxfehler (z.B. fehlende Klammern)
          // Diese sind komplexer und brauchen manuelle Behebung
          return false;
        }

        if (error.message.includes("'Expression expected'")) {
          // Fehlende Ausdrücke
          return false;
        }
      }

      return false;
    } catch (fileError) {
      return false;
    }
  }

  /**
   * Entfernt unbenutzte Variablen/Imports
   */
  async removeUnusedVariable(error) {
    const filePath = path.join(__dirname, '..', error.file);

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];

        // Import-Zeilen identifizieren und entfernen
        if (line.includes('import') && line.includes('from')) {
          // Extrahiere den unbenutzten Import-Namen aus der Fehlermeldung
          const unusedMatch = error.message.match(/'([^']+)' is defined but never used/);
          if (unusedMatch) {
            const unusedVar = unusedMatch[1];

            // Entferne den unbenutzten Import aus der Zeile
            const importPattern = new RegExp(`\\b${unusedVar}\\b,?\\s*`, 'g');
            const newLine = line.replace(importPattern, '').replace(/,\s*,/g, ',').replace(/{\s*,/g, '{').replace(/,\s*}/g, '}');

            if (newLine !== line) {
              lines[lineIndex] = newLine;
              fs.writeFileSync(filePath, lines.join('\n'));
              return true;
            }
          }
        }

        // Unbenutzte Variablen-Deklarationen
        if (error.message.includes('is assigned a value but never used')) {
          // Für Variablen ist es sicherer, sie zu kommentieren statt zu entfernen
          const varMatch = error.message.match(/'([^']+)' is assigned/);
          if (varMatch) {
            const unusedVar = varMatch[1];
            const varPattern = new RegExp(`(let|const|var)\\s+${unusedVar}\\b.*;`, 'g');
            const newLine = line.replace(varPattern, `// $& // UNUSED: ${unusedVar}`);
            lines[lineIndex] = newLine;
            fs.writeFileSync(filePath, lines.join('\n'));
            return true;
          }
        }
      }

      return false;
    } catch (fileError) {
      return false;
    }
  }

  /**
   * Ersetzt 'any' Types durch spezifische Typen
   */
  async replaceAnyType(error) {
    const filePath = path.join(__dirname, '..', error.file);

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        let line = lines[lineIndex];

        // Einfache 'any' Ersetzungen
        if (line.includes(': any')) {
          // Für Event Handler
          if (error.message.includes('event') || error.message.includes('Event')) {
            line = line.replace(': any', ': React.ChangeEvent<HTMLInputElement>');
            lines[lineIndex] = line;
            fs.writeFileSync(filePath, lines.join('\n'));
            return true;
          }

          // Für generische Objekte
          if (error.message.includes('object') || error.message.includes('Object')) {
            line = line.replace(': any', ': Record<string, unknown>');
            lines[lineIndex] = line;
            fs.writeFileSync(filePath, lines.join('\n'));
            return true;
          }

          // Für API Responses
          if (error.message.includes('response') || error.message.includes('Response')) {
            line = line.replace(': any', ': unknown');
            lines[lineIndex] = line;
            fs.writeFileSync(filePath, lines.join('\n'));
            return true;
          }
        }
      }

      return false;
    } catch (fileError) {
      return false;
    }
  }

  /**
   * Behebt React Hook Dependencies
   */
  async fixReactHook(error) {
    const filePath = path.join(__dirname, '..', error.file);

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        let line = lines[lineIndex];

        // useEffect Dependencies
        if (error.message.includes('has missing dependencies')) {
          // Extrahiere fehlende Dependencies aus der Meldung
          const depMatch = error.message.match(/'([^']+)' and '([^']+)'/);
          if (depMatch) {
            // Finde die nächste useEffect-Zeile und füge Dependencies hinzu
            for (let i = lineIndex; i < lines.length; i++) {
              if (lines[i].includes('useEffect') && lines[i].includes('}, [')) {
                // Dependencies-Array gefunden
                const deps = lines[i].match(/}, \[(.*?)\]/);
                if (deps) {
                  const currentDeps = deps[1];
                  const newDeps = currentDeps ? `${currentDeps}, ${depMatch[1]}, ${depMatch[2]}` : `${depMatch[1]}, ${depMatch[2]}`;
                  lines[i] = lines[i].replace(/}, \[(.*?)\]/, `}, [${newDeps}]`);
                  fs.writeFileSync(filePath, lines.join('\n'));
                  return true;
                }
              }
            }
          }
        }

        // useEffect exhaustive-deps
        if (error.message.includes('has a missing dependency')) {
          const depMatch = error.message.match(/'([^']+)'/);
          if (depMatch) {
            for (let i = lineIndex; i < lines.length; i++) {
              if (lines[i].includes('useEffect') && lines[i].includes('}, [')) {
                const deps = lines[i].match(/}, \[(.*?)\]/);
                if (deps) {
                  const currentDeps = deps[1];
                  const newDeps = currentDeps ? `${currentDeps}, ${depMatch[1]}` : depMatch[1];
                  lines[i] = lines[i].replace(/}, \[(.*?)\]/, `}, [${newDeps}]`);
                  fs.writeFileSync(filePath, lines.join('\n'));
                  return true;
                }
              }
            }
          }
        }
      }

      return false;
    } catch (fileError) {
      return false;
    }
  }

  /**
   * Generiert Bericht über behobene Fehler
   */
  generateFixReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 VALEO NeuroERP Frontend - Error Fix Report');
    console.log('='.repeat(60));

    console.log(`\n✅ Successfully Fixed: ${this.fixedErrors.length} issues`);
    console.log(`❌ Failed to Fix: ${this.failedFixes.length} issues`);
    console.log(`📊 Total Processed: ${this.errors.length} issues`);

    if (this.fixedErrors.length > 0) {
      console.log('\n🎯 Fixed Issues by Category:');

      const byCategory = {};
      this.fixedErrors.forEach(error => {
        byCategory[error.priority] = (byCategory[error.priority] || 0) + 1;
      });

      Object.entries(byCategory).forEach(([priority, count]) => {
        console.log(`   • ${priority}: ${count} issues`);
      });
    }

    if (this.failedFixes.length > 0) {
      console.log('\n⚠️  Issues requiring manual fixes:');

      const byCategory = {};
      this.failedFixes.forEach(error => {
        byCategory[error.priority] = (byCategory[error.priority] || 0) + 1;
      });

      Object.entries(byCategory).forEach(([priority, count]) => {
        console.log(`   • ${priority}: ${count} issues`);
      });

      console.log('\n💡 Manual Fix Recommendations:');
      console.log('   • Critical: Fix parsing errors immediately (missing commas, brackets)');
      console.log('   • Cleanup: Remove truly unused imports and variables');
      console.log('   • Types: Replace any types with specific interfaces');
      console.log('   • Hooks: Add missing dependencies to useEffect arrays');
    }

    // Sentry-Tracking für Fix-Ergebnisse
    if (Sentry) {
      Sentry.captureMessage(`Frontend ESLint Fixes: ${this.fixedErrors.length} fixed, ${this.failedFixes.length} failed`, {
        level: 'info',
        tags: {
          component: 'frontend-fixer',
          fix_success_rate: ((this.fixedErrors.length / this.errors.length) * 100).toFixed(1) + '%'
        },
        contexts: {
          fix_results: {
            total_issues: this.errors.length,
            fixed_issues: this.fixedErrors.length,
            failed_fixes: this.failedFixes.length,
            success_rate: (this.fixedErrors.length / this.errors.length) * 100
          }
        }
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Frontend error fixing complete - Run lint again to verify');
    console.log('='.repeat(60));

    // Speichere Fix-Report
    const fixReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total_processed: this.errors.length,
        successfully_fixed: this.fixedErrors.length,
        failed_fixes: this.failedFixes.length,
        success_rate: (this.fixedErrors.length / this.errors.length) * 100
      },
      fixed_issues: this.fixedErrors,
      failed_fixes: this.failedFixes
    };

    fs.writeFileSync(
      path.join(__dirname, '..', 'frontend-fix-report.json'),
      JSON.stringify(fixReport, null, 2)
    );

    console.log('📄 Fix report saved to: frontend-fix-report.json');
  }
}

// Hauptfunktion
async function main() {
  const fixer = new FrontendErrorFixer();
  await fixer.fixFrontendErrors();
}

// Ausführung
if (require.main === module) {
  main().catch(console.error);
}

module.exports = FrontendErrorFixer;