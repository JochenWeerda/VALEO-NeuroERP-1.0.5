"use strict";
// ============================================================================================================================================================================
// VALEO-Die NeuroERP - Decision Engine
// ============================================================================================================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionEngine = void 0;
const events_1 = require("events");
class DecisionEngine extends events_1.EventEmitter {
    constructor() {
        super();
        this.decisionHistory = [];
        this.learningData = new Map();
        this.contextWeights = new Map();
        this.initializeWeights();
    }
    initializeWeights() {
        // Gewichtung für verschiedene Entscheidungsfaktoren
        this.contextWeights.set('businessPriority', 0.35);
        this.contextWeights.set('systemHealth', 0.25);
        this.contextWeights.set('performance', 0.20);
        this.contextWeights.set('quality', 0.15);
        this.contextWeights.set('resourceAvailability', 0.05);
    }
    async makeDecision(context) {
        // TODO: Remove console.log
        const priority = this.calculatePriority(context);
        const confidence = this.calculateConfidence(context);
        const reasoning = this.generateReasoning(context);
        const decision = {
            id: this.generateDecisionId(),
            type: 'resource_allocation',
            context,
            options: [],
            selectedOption: {
                id: 'default',
                description: 'Standard-Option',
                actions: [],
                expectedOutcome: {
                    performance: context.performanceMetrics,
                    quality: context.qualityMetrics,
                    cost: { monetary: 0, time: 0, resources: [], opportunity: 0 },
                    timeline: { start: new Date(), end: new Date(), milestones: [], criticalPath: [] },
                    risks: []
                },
                risks: [],
                confidence,
                cost: { monetary: 0, time: 0, resources: [], opportunity: 0 }
            },
            confidence,
            reasoning,
            expectedOutcome: {
                performance: context.performanceMetrics,
                quality: context.qualityMetrics,
                cost: { monetary: 0, time: 0, resources: [], opportunity: 0 },
                timeline: { start: new Date(), end: new Date(), milestones: [], criticalPath: [] },
                risks: []
            },
            implementation: {
                steps: [],
                resources: [],
                timeline: { start: new Date(), end: new Date(), milestones: [], criticalPath: [] },
                rollback: { triggers: [], steps: [], estimatedDuration: 0 },
                monitoring: { metrics: [], alerts: [], frequency: 0 }
            },
            timestamp: new Date()
        };
        this.decisionHistory.push(decision);
        this.learnFromDecision(decision);
        // TODO: Remove console.log})`);
        this.emit('decisionMade', decision);
        return decision;
    }
    calculatePriority(context) {
        const businessScore = this.evaluateBusinessPriority(context.businessPriorities);
        const healthScore = this.evaluateSystemHealth(context.systemHealth);
        const performanceScore = this.evaluatePerformance(context.performanceMetrics);
        const qualityScore = this.evaluateQuality(context.qualityMetrics);
        const weightedScore = businessScore * this.contextWeights.get('businessPriority') +
            healthScore * this.contextWeights.get('systemHealth') +
            performanceScore * this.contextWeights.get('performance') +
            qualityScore * this.contextWeights.get('quality');
        if (weightedScore >= 0.8)
            return 'critical';
        if (weightedScore >= 0.6)
            return 'high';
        if (weightedScore >= 0.4)
            return 'medium';
        return 'low';
    }
    evaluateBusinessPriority(priority) {
        let score = 0;
        if (priority.revenueImpact ====== 'high')
            score += 0.4;
        else if (priority.revenueImpact ====== 'medium')
            score += 0.2;
        if (priority.customerImpact ====== 'high')
            score += 0.3;
        else if (priority.customerImpact ====== 'medium')
            score += 0.15;
        if (priority.regulatoryCompliance)
            score += 0.2;
        if (priority.marketCompetition)
            score += 0.1;
        return Math.min(score, 1.0);
    }
    evaluateSystemHealth(health) {
        let score = 1.0;
        if (health.cpuUsage > 80)
            score -= 0.3;
        if (health.memoryUsage > 85)
            score -= 0.2;
        if (health.errorRate > 0.05)
            score -= 0.3;
        if (health.responseTime > 2000)
            score -= 0.2;
        return Math.max(score, 0.0);
    }
    evaluatePerformance(metrics) {
        let score = 1.0;
        if (metrics.successRate < 0.95)
            score -= 0.3;
        if (metrics.avgResponseTime > 1000)
            score -= 0.2;
        if (metrics.throughput < 100)
            score -= 0.2;
        if (metrics.errorRate > 0.02)
            score -= 0.3;
        return Math.max(score, 0.0);
    }
    evaluateQuality(metrics) {
        let score = 1.0;
        if (metrics.codeCoverage < 0.8)
            score -= 0.2;
        if (metrics.testPassRate < 0.95)
            score -= 0.3;
        if (metrics.bugDensity > 0.1)
            score -= 0.3;
        if (metrics.technicalDebt > 0.2)
            score -= 0.2;
        return Math.max(score, 0.0);
    }
    generateRecommendations(context) {
        const recommendations = [];
        // Performance-basierte Empfehlungen
        if (context.performance.successRate < 0.95) {
            recommendations.push('Implementiere Error Handling und Retry-Logik');
        }
        if (context.performance.avgResponseTime > 1000) {
            recommendations.push('Optimiere Datenbankabfragen und Caching');
        }
        // Quality-basierte Empfehlungen
        if (context.quality.codeCoverage < 0.8) {
            recommendations.push('Erweitere Unit Tests für bessere Code Coverage');
        }
        if (context.quality.bugDensity > 0.1) {
            recommendations.push('Führe Code Review und Bug Fixing durch');
        }
        // System Health-basierte Empfehlungen
        if (context.systemHealth.cpuUsage > 80) {
            recommendations.push('Skaliere Services oder optimiere CPU-intensive Operationen');
        }
        if (context.systemHealth.errorRate > 0.05) {
            recommendations.push('Implementiere Circuit Breaker und Fallback-Mechanismen');
        }
        return recommendations;
    }
    calculateConfidence(context) {
        const dataQuality = this.assessDataQuality(context);
        const historicalAccuracy = this.getHistoricalAccuracy();
        const contextCompleteness = this.assessContextCompleteness(context);
        return (dataQuality + historicalAccuracy + contextCompleteness) / 3;
    }
    assessDataQuality(context) {
        let quality = 1.0;
        if (!context.businessPriority)
            quality -= 0.3;
        if (!context.systemHealth)
            quality -= 0.2;
        if (!context.performance)
            quality -= 0.2;
        if (!context.quality)
            quality -= 0.2;
        return Math.max(quality, 0.0);
    }
    getHistoricalAccuracy() {
        if (this.decisionHistory.length < 5)
            return 0.7;
        // Vereinfachte Berechnung der historischen Genauigkeit
        const recentDecisions = this.decisionHistory.slice(-10);
        const successfulDecisions = recentDecisions.filter(d => d.confidence > 0.8);
        return successfulDecisions.length / recentDecisions.length;
    }
    assessContextCompleteness(context) {
        let completeness = 1.0;
        const requiredFields = ['businessPriority', 'systemHealth', 'performance', 'quality'];
        for (const field of requiredFields) {
            if (!context[field]) {
                completeness -= 0.25;
            }
        }
        return Math.max(completeness, 0.0);
    }
    generateReasoning(context) {
        const priority = this.calculatePriority(context);
        const reasoning = [];
        reasoning.push(`Priorität: ${priority.toUpperCase()}`);
        if (context.businessPriority?.revenueImpact ====== 'high') {
            reasoning.push('Hoher Umsatz-Impact erkannt');
        }
        if (context.systemHealth?.errorRate > 0.05) {
            reasoning.push('Erhöhte Fehlerrate erfordert sofortige Aufmerksamkeit');
        }
        if (context.performance?.successRate < 0.95) {
            reasoning.push('Niedrige Erfolgsrate erfordert Performance-Optimierung');
        }
        return reasoning.join(' | ');
    }
    learnFromDecision(decision) {
        const key = `${decision.context.businessPriority?.revenueImpact}-${decision.priority}`;
        const currentValue = this.learningData.get(key) || 0;
        this.learningData.set(key, currentValue + 1);
        // Lerne aus der Entscheidung und passe Gewichtungen an
        if (decision.confidence < 0.7) {
            this.adjustWeights(decision);
        }
    }
    adjustWeights(decision) {
        // Vereinfachte Gewichtungsanpassung basierend auf Entscheidungsqualität
        const adjustment = 0.01;
        if (decision.confidence < 0.5) {
            // Reduziere Gewichtung für Faktoren mit niedriger Konfidenz
            this.contextWeights.forEach((weight, key) => {
                this.contextWeights.set(key, Math.max(weight - adjustment, 0.1));
            });
        }
    }
    generateDecisionId() {
        return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getDecisionHistory() {
        return [...this.decisionHistory];
    }
    getLearningData() {
        return new Map(this.learningData);
    }
    reset() {
        this.decisionHistory = [];
        this.learningData.clear();
        this.initializeWeights();
    }
}
exports.DecisionEngine = DecisionEngine;
exports.default = DecisionEngine;
