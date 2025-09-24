#!/usr/bin/env node

/**
 * VALEO NeuroERP - TypeScript Error Fixer
 * Systematische Behebung von TypeScript-Fehlern nach Prioritäten
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

class TypeScriptErrorFixer {
  constructor() {
    this.errors = [];
    this.fixedErrors = [];
    this.failedFixes = [];
  }

  /**
   * Lädt Fehler-Report und behebt sie systematisch
   */
  async fixErrorsByPriority() {
    console.log('🔧 VALEO NeuroERP - TypeScript Error Fixer');
    console.log('=' .repeat(60));

    // Lade Fehler-Report
    await this.loadErrorReport();

    if (this.errors.length === 0) {
      console.log('✅ No errors to fix!');
      return;
    }

    console.log(`📊 Found ${this.errors.length} errors to process\n`);

    // Behebe Fehler nach Priorität
    await this.fixCriticalErrors();
    await this.fixHighPriorityErrors();
    await this.fixMediumPriorityErrors();
    await this.fixLowPriorityErrors();

    // Bericht generieren
    this.generateFixReport();
  }

  /**
   * Lädt den Fehler-Report
   */
  async loadErrorReport() {
    const reportPath = path.join(__dirname, '..', 'ts-errors-report.json');

    try {
      const reportData = fs.readFileSync(reportPath, 'utf8');
      const report = JSON.parse(reportData);
      this.errors = report.errors || [];
      console.log(`📄 Loaded error report with ${this.errors.length} errors`);
    } catch (error) {
      console.error('❌ Could not load error report:', error.message);
      console.log('💡 Run "node scripts/analyze-ts-errors.js" first to generate the report');
      process.exit(1);
    }
  }

  /**
   * Behebt Critical Errors (höchste Priorität)
   */
  async fixCriticalErrors() {
    console.log('\n🚨 FIXING CRITICAL ERRORS (Syntax/Import Issues)');
    console.log('-'.repeat(50));

    const criticalErrors = this.errors.filter(e => e.severity === 'critical');

    if (criticalErrors.length === 0) {
      console.log('✅ No critical errors found!');
      return;
    }

    console.log(`Found ${criticalErrors.length} critical errors\n`);

    for (const error of criticalErrors) {
      try {
        console.log(`🔧 Fixing: ${error.file}:${error.line} - ${error.code}: ${error.message}`);

        const fixed = await this.applyCriticalFix(error);
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
   * Behebt High Priority Errors (Module/Type Issues)
   */
  async fixHighPriorityErrors() {
    console.log('\n🔴 FIXING HIGH PRIORITY ERRORS (Module/Type Issues)');
    console.log('-'.repeat(50));

    const highErrors = this.errors.filter(e => e.severity === 'high');

    if (highErrors.length === 0) {
      console.log('✅ No high priority errors found!');
      return;
    }

    console.log(`Found ${highErrors.length} high priority errors\n`);

    for (const error of highErrors) {
      try {
        console.log(`🔧 Fixing: ${error.file}:${error.line} - ${error.code}: ${error.message}`);

        const fixed = await this.applyHighPriorityFix(error);
        if (fixed) {
          this.fixedErrors.push({ ...error, priority: 'high' });
          console.log('✅ Fixed successfully');
        } else {
          this.failedFixes.push({ ...error, priority: 'high' });
          console.log('❌ Could not fix automatically');
        }
      } catch (fixError) {
        console.error(`❌ Fix failed: ${fixError.message}`);
        this.failedFixes.push({ ...error, priority: 'high' });
      }
    }
  }

  /**
   * Behebt Medium Priority Errors (Assignment Issues)
   */
  async fixMediumPriorityErrors() {
    console.log('\n🟡 FIXING MEDIUM PRIORITY ERRORS (Assignment Issues)');
    console.log('-'.repeat(50));

    const mediumErrors = this.errors.filter(e => e.severity === 'medium');

    if (mediumErrors.length === 0) {
      console.log('✅ No medium priority errors found!');
      return;
    }

    console.log(`Found ${mediumErrors.length} medium priority errors\n`);

    for (const error of mediumErrors) {
      try {
        console.log(`🔧 Fixing: ${error.file}:${error.line} - ${error.code}: ${error.message}`);

        const fixed = await this.applyMediumPriorityFix(error);
        if (fixed) {
          this.fixedErrors.push({ ...error, priority: 'medium' });
          console.log('✅ Fixed successfully');
        } else {
          this.failedFixes.push({ ...error, priority: 'medium' });
          console.log('❌ Could not fix automatically');
        }
      } catch (fixError) {
        console.error(`❌ Fix failed: ${fixError.message}`);
        this.failedFixes.push({ ...error, priority: 'medium' });
      }
    }
  }

  /**
   * Behebt Low Priority Errors (Type Safety)
   */
  async fixLowPriorityErrors() {
    console.log('\n🟢 FIXING LOW PRIORITY ERRORS (Type Safety Improvements)');
    console.log('-'.repeat(50));

    const lowErrors = this.errors.filter(e => e.severity === 'low');

    if (lowErrors.length === 0) {
      console.log('✅ No low priority errors found!');
      return;
    }

    console.log(`Found ${lowErrors.length} low priority errors\n`);

    for (const error of lowErrors) {
      try {
        console.log(`🔧 Fixing: ${error.file}:${error.line} - ${error.code}: ${error.message}`);

        const fixed = await this.applyLowPriorityFix(error);
        if (fixed) {
          this.fixedErrors.push({ ...error, priority: 'low' });
          console.log('✅ Fixed successfully');
        } else {
          this.failedFixes.push({ ...error, priority: 'low' });
          console.log('❌ Could not fix automatically');
        }
      } catch (fixError) {
        console.error(`❌ Fix failed: ${fixError.message}`);
        this.failedFixes.push({ ...error, priority: 'low' });
      }
    }
  }

  /**
   * Wendet Critical Error Fixes an
   */
  async applyCriticalFix(error) {
    const filePath = path.join(__dirname, '..', error.file);

    switch (error.code) {
      case 'TS1005': // Missing semicolon or bracket
        return this.fixSyntaxError(filePath, error);

      case 'TS1015': // Invalid character
        return this.fixInvalidCharacter(filePath, error);

      case 'TS1038': // Declaration or statement expected
        return this.fixDeclarationExpected(filePath, error);

      default:
        return false; // Cannot fix automatically
    }
  }

  /**
   * Wendet High Priority Error Fixes an
   */
  async applyHighPriorityFix(error) {
    const filePath = path.join(__dirname, '..', error.file);

    switch (error.code) {
      case 'TS2307': // Cannot find module
        return this.fixMissingModule(filePath, error);

      case 'TS2304': // Cannot find name
        return this.fixCannotFindName(filePath, error);

      case 'TS2604': // JSX element type does not have construct signature
        return this.fixJSXComponentError(filePath, error);

      default:
        return false; // Cannot fix automatically
    }
  }

  /**
   * Wendet Medium Priority Error Fixes an
   */
  async applyMediumPriorityFix(error) {
    const filePath = path.join(__dirname, '..', error.file);

    switch (error.code) {
      case 'TS2322': // Type assignment error
        return this.fixTypeAssignment(filePath, error);

      case 'TS2345': // Argument type error
        return this.fixArgumentType(filePath, error);

      default:
        return false; // Cannot fix automatically
    }
  }

  /**
   * Wendet Low Priority Error Fixes an
   */
  async applyLowPriorityFix(error) {
    // Low priority errors are usually type safety improvements
    // These are often too complex to fix automatically
    return false;
  }

  /**
   * Fix für fehlende Module
   */
  async fixMissingModule(filePath, error) {
    // Einfache Modul-Fehler können oft durch Type-Assertions behoben werden
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // Finde die problematische Zeile
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];

        // Wenn es ein Import ist, versuche es mit optional chaining oder type assertion
        if (line.includes('import') && line.includes('from')) {
          // Für komplexe Import-Fehler ist manuelle Behebung besser
          return false;
        }
      }

      return false;
    } catch (fileError) {
      return false;
    }
  }

  /**
   * Fix für Type Assignment Errors
   */
  async fixTypeAssignment(filePath, error) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        let line = lines[lineIndex];

        // Einfache Type Assertions für häufige Fälle
        if (line.includes(' as ')) {
          // Bereits eine Type Assertion vorhanden
          return false;
        }

        // Für 'any' zu spezifischen Typen
        if (error.message.includes('Type \'any\' is not assignable to type')) {
          // Füge 'as any' hinzu für temporäre Fixes
          line = line.replace(/=\s*([^;]+);/, '= $1 as any;');
          lines[lineIndex] = line;

          fs.writeFileSync(filePath, lines.join('\n'));
          return true;
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
    console.log('📋 VALEO NeuroERP - TypeScript Error Fix Report');
    console.log('='.repeat(60));

    console.log(`\n✅ Successfully Fixed: ${this.fixedErrors.length} errors`);
    console.log(`❌ Failed to Fix: ${this.failedFixes.length} errors`);
    console.log(`📊 Total Processed: ${this.errors.length} errors`);

    if (this.fixedErrors.length > 0) {
      console.log('\n🎯 Fixed Errors by Priority:');

      const byPriority = {};
      this.fixedErrors.forEach(error => {
        byPriority[error.priority] = (byPriority[error.priority] || 0) + 1;
      });

      Object.entries(byPriority).forEach(([priority, count]) => {
        console.log(`   • ${priority}: ${count} errors`);
      });
    }

    if (this.failedFixes.length > 0) {
      console.log('\n⚠️  Errors requiring manual fixes:');

      const byPriority = {};
      this.failedFixes.forEach(error => {
        byPriority[error.priority] = (byPriority[error.priority] || 0) + 1;
      });

      Object.entries(byPriority).forEach(([priority, count]) => {
        console.log(`   • ${priority}: ${count} errors`);
      });

      console.log('\n💡 Manual Fix Recommendations:');
      console.log('   • Critical: Fix syntax/import errors immediately');
      console.log('   • High: Review module/type declarations');
      console.log('   • Medium: Add proper type annotations');
      console.log('   • Low: Consider type safety improvements');
    }

    // Sentry-Tracking für Fix-Ergebnisse
    if (Sentry) {
      Sentry.captureMessage(`TypeScript Error Fixes: ${this.fixedErrors.length} fixed, ${this.failedFixes.length} failed`, {
        level: 'info',
        tags: {
          component: 'typescript-fixer',
          fix_success_rate: ((this.fixedErrors.length / this.errors.length) * 100).toFixed(1) + '%'
        },
        contexts: {
          fix_results: {
            total_errors: this.errors.length,
            fixed_errors: this.fixedErrors.length,
            failed_fixes: this.failedFixes.length,
            success_rate: (this.fixedErrors.length / this.errors.length) * 100
          }
        }
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Error fixing complete - Run analysis again to verify');
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
      fixed_errors: this.fixedErrors,
      failed_fixes: this.failedFixes
    };

    fs.writeFileSync(
      path.join(__dirname, '..', 'ts-fix-report.json'),
      JSON.stringify(fixReport, null, 2)
    );

    console.log('📄 Fix report saved to: ts-fix-report.json');
  }

  // Placeholder-Methoden für komplexe Fixes (werden später implementiert)
  async fixSyntaxError(filePath, error) { return false; }
  async fixInvalidCharacter(filePath, error) { return false; }
  async fixDeclarationExpected(filePath, error) { return false; }
  async fixCannotFindName(filePath, error) { return false; }
  async fixJSXComponentError(filePath, error) { return false; }
  async fixArgumentType(filePath, error) { return false; }
}

// Hauptfunktion
async function main() {
  const fixer = new TypeScriptErrorFixer();
  await fixer.fixErrorsByPriority();
}

// Ausführung
if (require.main === module) {
  main().catch(console.error);
}

module.exports = TypeScriptErrorFixer;