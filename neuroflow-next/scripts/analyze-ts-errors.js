#!/usr/bin/env node

/**
 * VALEO NeuroERP - TypeScript Error Analysis with Sentry
 * Systematische Analyse und Tracking aller TypeScript-Fehler
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Sentry Integration (falls verfügbar)
let Sentry;
try {
  Sentry = require('@sentry/nextjs');
} catch (error) {
  console.warn('Sentry not available, running in offline mode');
}

class TypeScriptErrorAnalyzer {
  constructor() {
    this.errors = [];
    this.errorStats = {
      total: 0,
      byType: {},
      byFile: {},
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
  }

  /**
   * Führt TypeScript-Kompilierung durch und sammelt Fehler
   */
  async analyzeErrors() {
    console.log('🔍 Analyzing TypeScript errors with Sentry integration...\n');

    try {
      // TypeScript-Kompilierung ohne Emission
      execSync('npx tsc --noEmit', {
        encoding: 'utf8',
        cwd: path.join(__dirname, '..')
      });

      console.log('✅ No TypeScript errors found!');

    } catch (error) {
      // Fehler aus der Exception extrahieren
      const errorOutput = error.stdout || '';
      console.log('Found TypeScript compilation errors, analyzing...');
      console.log('Error output length:', errorOutput.length);
      this.parseTypeScriptOutput(errorOutput);
    }

    // Fehler an Sentry senden
    await this.sendErrorsToSentry();

    // Bericht generieren
    this.generateReport();
  }

  /**
   * Parst TypeScript-Ausgabe und extrahiert Fehler
   */
  parseTypeScriptOutput(output) {
    console.log('Parsing TypeScript output...');
    const lines = output.split('\n').filter(line => line.trim());
    console.log(`Found ${lines.length} lines to process`);

    for (const line of lines) {
      // TypeScript-Fehler Pattern: file(line,col): error TS####: message
      const errorMatch = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);

      if (errorMatch) {
        const [, file, lineNum, col, code, message] = errorMatch;

        const error = {
          file: file.replace(/\\/g, '/'), // Normalize path separators
          line: parseInt(lineNum),
          column: parseInt(col),
          code,
          message: message.trim(),
          severity: this.getSeverity(code),
          category: this.getCategory(code),
          timestamp: new Date().toISOString()
        };

        console.log(`Successfully parsed error: ${error.file}:${error.line} - ${error.code}`);
        this.errors.push(error);

        // Statistiken aktualisieren
        this.updateStats(error);
      }
    }

    console.log(`Parsed ${this.errors.length} errors total`);

    // Nur unsere Code-Fehler filtern (nicht node_modules)
    const beforeFilter = this.errors.length;
    this.errors = this.errors.filter(error =>
      !error.file.includes('node_modules')
    );
    console.log(`After filtering node_modules: ${this.errors.length} errors (filtered ${beforeFilter - this.errors.length})`);
  }

  /**
   * Bestimmt Schweregrad basierend auf Fehlercode
   */
  getSeverity(code) {
    const criticalCodes = ['TS1005', 'TS1015', 'TS1029', 'TS1030', 'TS1035', 'TS1038', 'TS1046'];
    const highCodes = ['TS2307', 'TS2304', 'TS2305', 'TS2604', 'TS2786'];

    if (criticalCodes.includes(code)) return 'critical';
    if (highCodes.includes(code)) return 'high';
    if (code.startsWith('TS23')) return 'medium';
    return 'low';
  }

  /**
   * Bestimmt Kategorie basierend auf Fehlercode
   */
  getCategory(code) {
    if (code.startsWith('TS100')) return 'syntax';
    if (code.startsWith('TS101')) return 'syntax';
    if (code.startsWith('TS102')) return 'syntax';
    if (code.startsWith('TS103')) return 'syntax';
    if (code.startsWith('TS104')) return 'module';
    if (code.startsWith('TS109')) return 'module';
    if (code.startsWith('TS110')) return 'module';
    if (code.startsWith('TS111')) return 'module';
    if (code.startsWith('TS112')) return 'module';
    if (code.startsWith('TS114')) return 'module';
    if (code.startsWith('TS230')) return 'type';
    if (code.startsWith('TS231')) return 'type';
    if (code.startsWith('TS232')) return 'assignment';
    if (code.startsWith('TS233')) return 'property';
    if (code.startsWith('TS234')) return 'argument';
    if (code.startsWith('TS235')) return 'index';
    if (code.startsWith('TS236')) return 'arithmetic';
    if (code.startsWith('TS237')) return 'comparison';
    if (code.startsWith('TS238')) return 'logical';
    if (code.startsWith('TS239')) return 'bitwise';
    if (code.startsWith('TS240')) return 'assignment';
    if (code.startsWith('TS241')) return 'type';
    if (code.startsWith('TS242')) return 'type';
    if (code.startsWith('TS243')) return 'type';
    if (code.startsWith('TS244')) return 'scope';
    if (code.startsWith('TS245')) return 'type';
    if (code.startsWith('TS246')) return 'type';
    if (code.startsWith('TS247')) return 'type';
    if (code.startsWith('TS248')) return 'type';
    if (code.startsWith('TS249')) return 'type';
    if (code.startsWith('TS250')) return 'type';
    if (code.startsWith('TS251')) return 'type';
    if (code.startsWith('TS252')) return 'type';
    if (code.startsWith('TS253')) return 'type';
    if (code.startsWith('TS254')) return 'type';
    if (code.startsWith('TS255')) return 'type';
    if (code.startsWith('TS256')) return 'type';
    if (code.startsWith('TS257')) return 'type';
    if (code.startsWith('TS258')) return 'type';
    if (code.startsWith('TS259')) return 'type';
    if (code.startsWith('TS260')) return 'jsx';
    if (code.startsWith('TS261')) return 'jsx';
    if (code.startsWith('TS262')) return 'jsx';
    if (code.startsWith('TS263')) return 'jsx';
    if (code.startsWith('TS264')) return 'jsx';
    if (code.startsWith('TS265')) return 'jsx';
    if (code.startsWith('TS266')) return 'jsx';
    if (code.startsWith('TS267')) return 'jsx';
    if (code.startsWith('TS268')) return 'jsx';
    if (code.startsWith('TS269')) return 'jsx';
    if (code.startsWith('TS270')) return 'jsx';
    if (code.startsWith('TS271')) return 'jsx';
    if (code.startsWith('TS272')) return 'jsx';
    if (code.startsWith('TS273')) return 'jsx';
    if (code.startsWith('TS274')) return 'jsx';
    if (code.startsWith('TS275')) return 'jsx';
    if (code.startsWith('TS276')) return 'jsx';
    if (code.startsWith('TS277')) return 'jsx';
    if (code.startsWith('TS278')) return 'jsx';
    if (code.startsWith('TS279')) return 'jsx';
    if (code.startsWith('TS280')) return 'jsx';
    return 'other';
  }

  /**
   * Aktualisiert Fehler-Statistiken
   */
  updateStats(error) {
    this.errorStats.total++;

    // Nach Typ
    this.errorStats.byType[error.code] = (this.errorStats.byType[error.code] || 0) + 1;

    // Nach Datei
    this.errorStats.byFile[error.file] = (this.errorStats.byFile[error.file] || 0) + 1;

    // Nach Schweregrad
    this.errorStats[error.severity]++;
  }

  /**
   * Sendet Fehler an Sentry
   */
  async sendErrorsToSentry() {
    if (!Sentry) {
      console.log('⚠️  Sentry not available, skipping error reporting');
      return;
    }

    console.log('📤 Sending errors to Sentry...');

    for (const error of this.errors) {
      try {
        Sentry.withScope(scope => {
          scope.setTag('error_type', 'typescript');
          scope.setTag('error_code', error.code);
          scope.setTag('severity', error.severity);
          scope.setTag('category', error.category);
          scope.setTag('file', error.file);

          scope.setContext('typescript_error', {
            file: error.file,
            line: error.line,
            column: error.column,
            code: error.code,
            message: error.message,
            timestamp: error.timestamp
          });

          Sentry.captureMessage(`TypeScript Error ${error.code}: ${error.message}`, {
            level: error.severity === 'critical' ? 'fatal' :
                   error.severity === 'high' ? 'error' :
                   error.severity === 'medium' ? 'warning' : 'info',
            tags: {
              component: 'typescript-analyzer',
              error_category: error.category,
              error_severity: error.severity
            }
          });
        });
      } catch (sentryError) {
        console.error('Failed to send error to Sentry:', sentryError);
      }
    }

    console.log(`✅ Sent ${this.errors.length} errors to Sentry`);
  }

  /**
   * Generiert detaillierten Bericht
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 VALEO NeuroERP - TypeScript Error Analysis Report');
    console.log('='.repeat(80));

    console.log(`\n📊 Gesamtstatistik:`);
    console.log(`   • Total Errors: ${this.errorStats.total}`);
    console.log(`   • Critical: ${this.errorStats.critical}`);
    console.log(`   • High: ${this.errorStats.high}`);
    console.log(`   • Medium: ${this.errorStats.medium}`);
    console.log(`   • Low: ${this.errorStats.low}`);

    console.log(`\n🔍 Top 10 Error Types:`);
    const sortedTypes = Object.entries(this.errorStats.byType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    sortedTypes.forEach(([code, count], index) => {
      console.log(`   ${index + 1}. ${code}: ${count} errors`);
    });

    console.log(`\n📁 Top 10 Affected Files:`);
    const sortedFiles = Object.entries(this.errorStats.byFile)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    sortedFiles.forEach(([file, count], index) => {
      console.log(`   ${index + 1}. ${file}: ${count} errors`);
    });

    console.log(`\n🚨 Critical Errors (Top 5):`);
    const criticalErrors = this.errors
      .filter(e => e.severity === 'critical')
      .slice(0, 5);

    if (criticalErrors.length === 0) {
      console.log('   ✅ No critical errors found!');
    } else {
      criticalErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.file}:${error.line} - ${error.code}: ${error.message}`);
      });
    }

    console.log(`\n💡 Recommendations:`);
    if (this.errorStats.critical > 0) {
      console.log('   • Fix critical errors immediately (syntax/import issues)');
    }
    if (this.errorStats.high > 0) {
      console.log('   • Address high-priority errors (module/type issues)');
    }
    if (this.errorStats.medium > 0) {
      console.log('   • Review medium-priority errors (assignment issues)');
    }
    if (this.errorStats.low > 0) {
      console.log('   • Consider low-priority improvements (type safety)');
    }

    console.log('\n📋 Error Categories:');
    const categories = {};
    this.errors.forEach(error => {
      categories[error.category] = (categories[error.category] || 0) + 1;
    });

    Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   • ${category}: ${count} errors`);
      });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Analysis complete - Errors tracked in Sentry');
    console.log('='.repeat(80));

    // JSON-Export für weitere Analyse
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.errorStats,
      errors: this.errors.slice(0, 50), // Top 50 errors
      summary: {
        total: this.errorStats.total,
        critical: this.errorStats.critical,
        high: this.errorStats.high,
        medium: this.errorStats.medium,
        low: this.errorStats.low,
        topErrorTypes: sortedTypes.slice(0, 5),
        topAffectedFiles: sortedFiles.slice(0, 5)
      }
    };

    fs.writeFileSync(
      path.join(__dirname, '..', 'ts-errors-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('📄 Detailed report saved to: ts-errors-report.json');
  }
}

// Hauptfunktion
async function main() {
  const analyzer = new TypeScriptErrorAnalyzer();
  await analyzer.analyzeErrors();
}

// Ausführung
if (require.main === module) {
  main().catch(console.error);
}

module.exports = TypeScriptErrorAnalyzer;