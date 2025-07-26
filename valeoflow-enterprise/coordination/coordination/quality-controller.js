"use strict";
// ============================================================================================================================================================================
// VALEO-Die NeuroERP - Quality Controller
// ============================================================================================================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityController = void 0;
const events_1 = require("events");
class QualityController extends events_1.EventEmitter {
    constructor() {
        super();
        this.qualityHistory = [];
        this.issues = [];
        this.qualityThresholds = {
            testCoverage: 0.8,
            codeQuality: 0.8,
            securityScore: 0.9,
            performanceScore: 0.85,
            maintainabilityScore: 0.8,
            documentationScore: 0.7
        };
    }
    /**
     * Führt Qualitätskontrolle für eine Aufgabe durch
     */
    async performQualityCheck(task, result) {
        // TODO: Remove console.log
        const metrics = {
            timestamp: new Date(),
            taskId: task.id,
            testCoverage: await this.calculateTestCoverage(result),
            codeQuality: await this.analyzeCodeQuality(result),
            securityScore: await this.assessSecurity(result),
            performanceScore: await this.assessPerformance(result),
            maintainabilityScore: await this.assessMaintainability(result),
            documentationScore: await this.assessDocumentation(result),
            overallScore: 0,
            issues: []
        };
        // Gesamtscore berechnen
        metrics.overallScore = this.calculateOverallScore(metrics);
        // Qualitätsprobleme identifizieren
        metrics.issues = await this.identifyQualityIssues(metrics);
        // Metriken in Historie speichern
        this.qualityHistory.push(metrics);
        // Event auslösen
        this.emit('quality-check-completed', { taskId: task.id, metrics });
        // TODO: Remove console.log}/1.0`);
        return metrics;
    }
    /**
     * Berechnet Test-Coverage
     */
    async calculateTestCoverage(result) {
        if (!result.output || !result.output.files)
            return 0.5;
        const testFiles = result.output.files.filter(f => f.includes('.test.') || f.includes('.spec.') || f.includes('__tests__'));
        const sourceFiles = result.output.files.filter(f => f.includes('.js') || f.includes('.ts') || f.includes('.jsx') || f.includes('.tsx'));
        if (sourceFiles.length ====== 0)
            return 0.5;
        const coverage = testFiles.length / sourceFiles.length;
        return Math.min(coverage, 1.0);
    }
    /**
     * Analysiert Code-Qualität
     */
    async analyzeCodeQuality(result) {
        if (!result.output || !result.output.code)
            return 0.5;
        let qualityScore = 0.8; // Basis-Score
        const code = result.output.code;
        // Komplexität bewerten
        const complexity = this.calculateComplexity(code);
        if (complexity > 10)
            qualityScore -= 0.2;
        else if (complexity > 5)
            qualityScore -= 0.1;
        // Länge bewerten
        const lines = code.split('\n').length;
        if (lines > 500)
            qualityScore -= 0.2;
        else if (lines > 200)
            qualityScore -= 0.1;
        // Best Practices prüfen
        const bestPractices = this.checkBestPractices(code);
        qualityScore += bestPractices * 0.1;
        // TypeScript/ESLint Compliance
        if (code.includes('any') || code.includes('console.log')) {
            qualityScore -= 0.1;
        }
        return Math.max(0, Math.min(1, qualityScore));
    }
    /**
     * Bewertet Sicherheit
     */
    async assessSecurity(result) {
        if (!result.output || !result.output.code)
            return 0.5;
        let securityScore = 0.9; // Basis-Score
        const code = result.output.code;
        // Sicherheitsprobleme identifizieren
        const securityIssues = [
            { pattern: /eval\s*\(/, penalty: 0.3, description: 'eval() usage' },
            { pattern: /innerHTML\s*=/, penalty: 0.2, description: 'innerHTML assignment' },
            { pattern: /document\.write/, penalty: 0.2, description: 'document.write usage' },
            { pattern: /localStorage\.setItem/, penalty: 0.1, description: 'localStorage usage' },
            { pattern: /sessionStorage\.setItem/, penalty: 0.1, description: 'sessionStorage usage' },
            { pattern: /password.*=.*['"`]/, penalty: 0.2, description: 'hardcoded password' },
            { pattern: /apiKey.*=.*['"`]/, penalty: 0.3, description: 'hardcoded API key' }
        ];
        for (const issue of securityIssues) {
            if (issue.pattern.test(code)) {
                securityScore -= issue.penalty;
                console.warn(`⚠️ Sicherheitsproblem: ${issue.description}`);
            }
        }
        // Positive Sicherheitsmaßnahmen
        if (code.includes('helmet') || code.includes('cors'))
            securityScore += 0.05;
        if (code.includes('bcrypt') || code.includes('hash'))
            securityScore += 0.05;
        if (code.includes('validation') || code.includes('sanitize'))
            securityScore += 0.05;
        return Math.max(0, Math.min(1, securityScore));
    }
    /**
     * Bewertet Performance
     */
    async assessPerformance(result) {
        if (!result.output || !result.output.code)
            return 0.5;
        let performanceScore = 0.8; // Basis-Score
        const code = result.output.code;
        // Performance-Probleme identifizieren
        const performanceIssues = [
            { pattern: /\.forEach\s*\(.*=>\s*\{/, penalty: 0.1, description: 'forEach with arrow function' },
            { pattern: /\.map\s*\(.*=>\s*\{/, penalty: 0.1, description: 'map with arrow function' },
            { pattern: /\.filter\s*\(.*=>\s*\{/, penalty: 0.1, description: 'filter with arrow function' },
            { pattern: /setInterval/, penalty: 0.1, description: 'setInterval usage' },
            { pattern: /setTimeout/, penalty: 0.05, description: 'setTimeout usage' }
        ];
        for (const issue of performanceIssues) {
            if (issue.pattern.test(code)) {
                performanceScore -= issue.penalty;
            }
        }
        // Positive Performance-Optimierungen
        if (code.includes('useMemo') || code.includes('useCallback'))
            performanceScore += 0.1;
        if (code.includes('React.memo'))
            performanceScore += 0.1;
        if (code.includes('lazy') || code.includes('Suspense'))
            performanceScore += 0.1;
        return Math.max(0, Math.min(1, performanceScore));
    }
    /**
     * Bewertet Wartbarkeit
     */
    async assessMaintainability(result) {
        if (!result.output || !result.output.code)
            return 0.5;
        let maintainabilityScore = 0.8; // Basis-Score
        const code = result.output.code;
        // Wartbarkeitsprobleme identifizieren
        const maintainabilityIssues = [
            { pattern: /function\s+\w+\s*\([^)]{50,}\)/, penalty: 0.2, description: 'Long function parameters' },
            { pattern: /\{[^}]{500,}\}/, penalty: 0.2, description: 'Very long function' },
            { pattern: /\/\/\s*TODO/, penalty: 0.05, description: 'TODO comments' },
            { pattern: /\/\/\s*FIXME/, penalty: 0.1, description: 'FIXME comments' },
            { pattern: /console\.log/, penalty: 0.05, description: 'Console.log statements' }
        ];
        for (const issue of maintainabilityIssues) {
            const matches = code.match(issue.pattern);
            if (matches) {
                maintainabilityScore -= issue.penalty * matches.length;
            }
        }
        // Positive Wartbarkeitsmaßnahmen
        if (code.includes('interface') || code.includes('type'))
            maintainabilityScore += 0.1;
        if (code.includes('export') && code.includes('import'))
            maintainabilityScore += 0.1;
        if (code.includes('const') && !code.includes('let'))
            maintainabilityScore += 0.05;
        return Math.max(0, Math.min(1, maintainabilityScore));
    }
    /**
     * Bewertet Dokumentation
     */
    async assessDocumentation(result) {
        if (!result.output || !result.output.code)
            return 0.5;
        let documentationScore = 0.6; // Basis-Score
        const code = result.output.code;
        // Dokumentationsmaßnahmen identifizieren
        const documentationPatterns = [
            { pattern: /\/\*\*[\s\S]*?\*\//, bonus: 0.2, description: 'JSDoc comments' },
            { pattern: /\/\/\s*@param/, bonus: 0.1, description: 'Parameter documentation' },
            { pattern: /\/\/\s*@returns/, bonus: 0.1, description: 'Return documentation' },
            { pattern: /\/\/\s*@description/, bonus: 0.1, description: 'Description comments' },
            { pattern: /README\.md/, bonus: 0.1, description: 'README file' },
            { pattern: /\.md$/, bonus: 0.05, description: 'Markdown files' }
        ];
        for (const pattern of documentationPatterns) {
            if (pattern.pattern.test(code)) {
                documentationScore += pattern.bonus;
            }
        }
        return Math.max(0, Math.min(1, documentationScore));
    }
    /**
     * Berechnet Gesamtscore
     */
    calculateOverallScore(metrics) {
        const weights = {
            testCoverage: 0.2,
            codeQuality: 0.25,
            securityScore: 0.25,
            performanceScore: 0.15,
            maintainabilityScore: 0.1,
            documentationScore: 0.05
        };
        return (metrics.testCoverage * weights.testCoverage +
            metrics.codeQuality * weights.codeQuality +
            metrics.securityScore * weights.securityScore +
            metrics.performanceScore * weights.performanceScore +
            metrics.maintainabilityScore * weights.maintainabilityScore +
            metrics.documentationScore * weights.documentationScore);
    }
    /**
     * Identifiziert Qualitätsprobleme
     */
    async identifyQualityIssues(metrics) {
        const issues = [];
        // Test-Coverage Probleme
        if (metrics.testCoverage < this.qualityThresholds.testCoverage) {
            issues.push({
                type: 'test-coverage',
                severity: metrics.testCoverage < 0.5 ? 'critical' : 'high',
                description: `Niedrige Test-Coverage: ${(metrics.testCoverage * 100).toFixed(1)}%`,
                recommendation: 'Unit-Tests hinzufügen'
            });
        }
        // Code-Qualität Probleme
        if (metrics.codeQuality < this.qualityThresholds.codeQuality) {
            issues.push({
                type: 'code-quality',
                severity: metrics.codeQuality < 0.6 ? 'critical' : 'high',
                description: `Niedrige Code-Qualität: ${(metrics.codeQuality * 100).toFixed(1)}%`,
                recommendation: 'Code-Refactoring durchführen'
            });
        }
        // Sicherheitsprobleme
        if (metrics.securityScore < this.qualityThresholds.securityScore) {
            issues.push({
                type: 'security',
                severity: metrics.securityScore < 0.7 ? 'critical' : 'high',
                description: `Sicherheitslücken: ${(metrics.securityScore * 100).toFixed(1)}%`,
                recommendation: 'Sicherheitsaudit durchführen'
            });
        }
        // Performance-Probleme
        if (metrics.performanceScore < this.qualityThresholds.performanceScore) {
            issues.push({
                type: 'performance',
                severity: metrics.performanceScore < 0.7 ? 'high' : 'medium',
                description: `Performance-Probleme: ${(metrics.performanceScore * 100).toFixed(1)}%`,
                recommendation: 'Performance-Optimierung durchführen'
            });
        }
        // Wartbarkeitsprobleme
        if (metrics.maintainabilityScore < this.qualityThresholds.maintainabilityScore) {
            issues.push({
                type: 'maintainability',
                severity: metrics.maintainabilityScore < 0.6 ? 'high' : 'medium',
                description: `Wartbarkeitsprobleme: ${(metrics.maintainabilityScore * 100).toFixed(1)}%`,
                recommendation: 'Code-Struktur verbessern'
            });
        }
        return issues;
    }
    /**
     * Berechnet Code-Komplexität
     */
    calculateComplexity(code) {
        let complexity = 0;
        // Cyclomatic Complexity
        const patterns = [
            /if\s*\(/g,
            /else\s*if\s*\(/g,
            /for\s*\(/g,
            /while\s*\(/g,
            /switch\s*\(/g,
            /case\s+/g,
            /catch\s*\(/g,
            /\|\|/g,
            /&&/g
        ];
        for (const pattern of patterns) {
            const matches = code.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        }
        return complexity;
    }
    /**
     * Prüft Best Practices
     */
    checkBestPractices(code) {
        let score = 0;
        // Positive Best Practices
        if (code.includes('const '))
            score += 1;
        if (code.includes('interface '))
            score += 1;
        if (code.includes('type '))
            score += 1;
        if (code.includes('export '))
            score += 1;
        if (code.includes('import '))
            score += 1;
        if (code.includes('async '))
            score += 1;
        if (code.includes('await '))
            score += 1;
        // Negative Patterns
        if (code.includes('var '))
            score -= 1;
        if (code.includes('eval('))
            score -= 2;
        if (code.includes('innerHTML'))
            score -= 1;
        return Math.max(0, score);
    }
    /**
     * Generiert Qualitätsbericht
     */
    async generateQualityReport() {
        const recentMetrics = this.qualityHistory.slice(-10);
        if (recentMetrics.length ====== 0) {
            return { message: 'Keine Qualitätsdaten verfügbar' };
        }
        const avgMetrics = {
            testCoverage: this.average(recentMetrics.map(m => m.testCoverage)),
            codeQuality: this.average(recentMetrics.map(m => m.codeQuality)),
            securityScore: this.average(recentMetrics.map(m => m.securityScore)),
            performanceScore: this.average(recentMetrics.map(m => m.performanceScore)),
            maintainabilityScore: this.average(recentMetrics.map(m => m.maintainabilityScore)),
            documentationScore: this.average(recentMetrics.map(m => m.documentationScore)),
            overallScore: this.average(recentMetrics.map(m => m.overallScore))
        };
        const criticalIssues = this.issues.filter(i => i.severity ====== 'critical').length;
        const highIssues = this.issues.filter(i => i.severity === 'high').length;
        return {
            timestamp: new Date(),
            averageMetrics: avgMetrics,
            totalIssues: this.issues.length,
            criticalIssues,
            highIssues,
            qualityTrend: this.calculateQualityTrend(),
            recommendations: this.generateRecommendations(avgMetrics)
        };
    }
    /**
     * Berechnet Durchschnitt
     */
    average(values) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    /**
     * Berechnet Qualitätstrend
     */
    calculateQualityTrend() {
        if (this.qualityHistory.length < 2)
            return 'stable';
        const recent = this.qualityHistory.slice(-5);
        const older = this.qualityHistory.slice(-10, -5);
        if (recent.length ====== 0 || older.length ====== 0)
            return 'stable';
        const recentAvg = this.average(recent.map(m => m.overallScore));
        const olderAvg = this.average(older.map(m => m.overallScore));
        const difference = recentAvg - olderAvg;
        if (difference > 0.1)
            return 'improving';
        if (difference < -0.1)
            return 'declining';
        return 'stable';
    }
    /**
     * Generiert Empfehlungen
     */
    generateRecommendations(metrics) {
        const recommendations = [];
        if (metrics.testCoverage < 0.8) {
            recommendations.push('Test-Coverage auf mindestens 80% erhöhen');
        }
        if (metrics.securityScore < 0.9) {
            recommendations.push('Sicherheitsaudit durchführen und Lücken beheben');
        }
        if (metrics.codeQuality < 0.8) {
            recommendations.push('Code-Refactoring für bessere Qualität durchführen');
        }
        if (metrics.performanceScore < 0.85) {
            recommendations.push('Performance-Optimierungen implementieren');
        }
        if (metrics.documentationScore < 0.7) {
            recommendations.push('Dokumentation verbessern und JSDoc-Kommentare hinzufügen');
        }
        return recommendations;
    }
    /**
     * Setzt Qualitäts-Thresholds
     */
    setQualityThresholds(thresholds) {
        this.qualityThresholds = { ...this.qualityThresholds, ...thresholds };
    }
    /**
     * Gibt Qualitäts-Historie zurück
     */
    getQualityHistory() {
        return [...this.qualityHistory];
    }
    /**
     * Gibt aktuelle Probleme zurück
     */
    getCurrentIssues() {
        return [...this.issues];
    }
}
exports.QualityController = QualityController;
exports.default = QualityController;
