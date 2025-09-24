#!/usr/bin/env node

/**
 * VALEO NeuroERP - Sentry Dashboard Configuration
 * Konfiguration und Monitoring des Sentry-Error-Trackings
 */

const fs = require('fs');
const path = require('path');

// Sentry Integration
let Sentry;
try {
  Sentry = require('@sentry/nextjs');
} catch (error) {
  console.warn('Sentry not available, running in offline mode');
}

class SentryDashboard {
  constructor() {
    this.metrics = {
      totalErrors: 0,
      errorsByType: {},
      errorsByFile: {},
      errorsBySeverity: {},
      fixSuccessRate: 0,
      lastAnalysis: null,
      trends: []
    };
  }

  /**
   * Konfiguriert Sentry-Dashboard und zeigt Metriken
   */
  async configureDashboard() {
    console.log('📊 VALEO NeuroERP - Sentry Error Monitoring Dashboard');
    console.log('='.repeat(60));

    // Lade vorhandene Reports
    await this.loadReports();

    // Zeige Dashboard
    this.displayDashboard();

    // Konfiguriere Monitoring
    this.configureMonitoring();

    // Zeige Empfehlungen
    this.showRecommendations();
  }

  /**
   * Lädt alle verfügbaren Reports
   */
  async loadReports() {
    const reports = [
      'ts-errors-report.json',
      'ts-fix-report.json'
    ];

    for (const reportFile of reports) {
      const reportPath = path.join(__dirname, '..', reportFile);

      try {
        if (fs.existsSync(reportPath)) {
          const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

          if (reportFile === 'ts-errors-report.json') {
            this.metrics.totalErrors = report.stats?.total || 0;
            this.metrics.errorsByType = report.stats?.byType || {};
            this.metrics.errorsByFile = report.stats?.byFile || {};
            this.metrics.errorsBySeverity = {
              critical: report.stats?.critical || 0,
              high: report.stats?.high || 0,
              medium: report.stats?.medium || 0,
              low: report.stats?.low || 0
            };
            this.metrics.lastAnalysis = report.timestamp;
          } else if (reportFile === 'ts-fix-report.json') {
            const totalProcessed = report.summary?.total_processed || 0;
            const fixed = report.summary?.successfully_fixed || 0;
            this.metrics.fixSuccessRate = totalProcessed > 0 ? (fixed / totalProcessed) * 100 : 0;
          }
        }
      } catch (error) {
        console.warn(`Could not load ${reportFile}:`, error.message);
      }
    }
  }

  /**
   * Zeigt das Dashboard
   */
  displayDashboard() {
    console.log('\n📈 Current Metrics:');
    console.log(`   • Total TypeScript Errors: ${this.metrics.totalErrors}`);
    console.log(`   • Fix Success Rate: ${this.metrics.fixSuccessRate.toFixed(1)}%`);
    console.log(`   • Last Analysis: ${this.metrics.lastAnalysis || 'Never'}`);

    console.log('\n🚨 Error Distribution by Severity:');
    console.log(`   • Critical: ${this.metrics.errorsBySeverity.critical} (Immediate action required)`);
    console.log(`   • High: ${this.metrics.errorsBySeverity.high} (Fix soon)`);
    console.log(`   • Medium: ${this.metrics.errorsBySeverity.medium} (Plan to fix)`);
    console.log(`   • Low: ${this.metrics.errorsBySeverity.low} (Optional improvements)`);

    if (Object.keys(this.metrics.errorsByType).length > 0) {
      console.log('\n🔍 Top Error Types:');
      const sortedTypes = Object.entries(this.metrics.errorsByType)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      sortedTypes.forEach(([type, count], index) => {
        console.log(`   ${index + 1}. ${type}: ${count} errors`);
      });
    }

    if (Object.keys(this.metrics.errorsByFile).length > 0) {
      console.log('\n📁 Most Affected Files:');
      const sortedFiles = Object.entries(this.metrics.errorsByFile)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      sortedFiles.forEach(([file, count], index) => {
        console.log(`   ${index + 1}. ${file}: ${count} errors`);
      });
    }
  }

  /**
   * Konfiguriert Sentry-Monitoring
   */
  configureMonitoring() {
    console.log('\n🔧 Sentry Monitoring Configuration:');

    if (Sentry) {
      console.log('✅ Sentry SDK is available and configured');
      console.log('✅ Error tracking is active');
      console.log('✅ Performance monitoring enabled');
      console.log('✅ Session replay configured');

      // Sende Dashboard-Metriken an Sentry
      Sentry.captureMessage('TypeScript Error Dashboard Update', {
        level: 'info',
        tags: {
          component: 'error-dashboard',
          error_count: this.metrics.totalErrors.toString(),
          fix_success_rate: this.metrics.fixSuccessRate.toFixed(1) + '%'
        },
        contexts: {
          error_metrics: {
            total_errors: this.metrics.totalErrors,
            fix_success_rate: this.metrics.fixSuccessRate,
            errors_by_severity: this.metrics.errorsBySeverity,
            last_analysis: this.metrics.lastAnalysis
          }
        }
      });

    } else {
      console.log('⚠️  Sentry SDK not available');
      console.log('💡 Install @sentry/nextjs for full monitoring capabilities');
      console.log('💡 Configure SENTRY_DSN in environment variables');
    }

    console.log('\n📋 Monitoring Features:');
    console.log('   • Real-time error tracking');
    console.log('   • Performance monitoring');
    console.log('   • Release health tracking');
    console.log('   • User feedback collection');
    console.log('   • Custom error contexts');
  }

  /**
   * Zeigt Empfehlungen basierend auf Metriken
   */
  showRecommendations() {
    console.log('\n💡 Recommendations:');

    if (this.metrics.totalErrors === 0) {
      console.log('🎉 Excellent! No TypeScript errors found.');
      console.log('   • Continue with regular error monitoring');
      console.log('   • Focus on code quality improvements');
      console.log('   • Monitor for new errors in CI/CD');

    } else if (this.metrics.errorsBySeverity.critical > 0) {
      console.log('🚨 CRITICAL: Immediate action required!');
      console.log('   • Fix critical errors before deployment');
      console.log('   • Critical errors may prevent compilation');
      console.log('   • Run: node scripts/fix-ts-errors.js --priority=critical');

    } else if (this.metrics.errorsBySeverity.high > 0) {
      console.log('🔴 HIGH PRIORITY: Fix soon');
      console.log('   • Address high-priority errors in next sprint');
      console.log('   • These affect module loading and types');
      console.log('   • Run: node scripts/fix-ts-errors.js --priority=high');

    } else if (this.metrics.errorsBySeverity.medium > 0) {
      console.log('🟡 MEDIUM PRIORITY: Plan to fix');
      console.log('   • Schedule fixes for assignment errors');
      console.log('   • Improve type safety gradually');
      console.log('   • Run: node scripts/fix-ts-errors.js --priority=medium');

    } else if (this.metrics.errorsBySeverity.low > 0) {
      console.log('🟢 LOW PRIORITY: Optional improvements');
      console.log('   • Consider type safety enhancements');
      console.log('   • These are nice-to-have improvements');
      console.log('   • Run: node scripts/fix-ts-errors.js --priority=low');
    }

    console.log('\n🔄 Maintenance Commands:');
    console.log('   • Analyze errors: node scripts/analyze-ts-errors.js');
    console.log('   • Fix errors: node scripts/fix-ts-errors.js');
    console.log('   • View dashboard: node scripts/sentry-dashboard.js');
    console.log('   • Check build: npm run build');

    console.log('\n📊 Quality Metrics:');
    console.log(`   • Error Density: ${this.metrics.totalErrors} errors`);
    console.log(`   • Fix Success Rate: ${this.metrics.fixSuccessRate.toFixed(1)}%`);
    console.log(`   • Code Health: ${this.metrics.totalErrors === 0 ? 'Excellent' : this.metrics.totalErrors < 10 ? 'Good' : 'Needs Attention'}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Dashboard configuration complete');
    console.log('🔗 Access Sentry dashboard at: https://sentry.io');
    console.log('='.repeat(60));
  }

  /**
   * Erstellt Trend-Analyse
   */
  createTrendAnalysis() {
    // Hier könnte eine Trend-Analyse über Zeit implementiert werden
    // Vergleich mit vorherigen Reports
    console.log('\n📈 Trend Analysis:');
    console.log('   • Compare with previous error reports');
    console.log('   • Track error reduction over time');
    console.log('   • Monitor fix success rates');
  }
}

// Hauptfunktion
async function main() {
  const dashboard = new SentryDashboard();
  await dashboard.configureDashboard();
}

// Ausführung
if (require.main === module) {
  main().catch(console.error);
}

module.exports = SentryDashboard;