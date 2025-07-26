/**
 * 🚀 Performance Monitoring für VALEO NeuroERP
 * Überwachung von Ladezeiten, Bundle-Größen und User Experience
 */

import React from 'react';

export interface PerformanceMetrics {
  // Navigation Timing
  navigationStart: number;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  domLoading: number;
  domInteractive: number;
  domContentLoaded: number;
  domComplete: number;
  loadEventStart: number;
  loadEventEnd: number;
  
  // Custom Metrics
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  
  // Bundle Metrics
  bundleSize?: number;
  chunkCount?: number;
  
  // User Experience
  timeToInteractive: number;
  totalBlockingTime?: number;
}

export interface ComponentLoadMetrics {
  componentName: string;
  loadStart: number;
  loadEnd: number;
  loadDuration: number;
  chunkSize?: number;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private componentMetrics: Map<string, ComponentLoadMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.metrics = this.initializeMetrics();
    this.setupObservers();
  }

  private initializeMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      navigationStart: navigation?.startTime || 0,
      fetchStart: navigation?.fetchStart || 0,
      domainLookupStart: navigation?.domainLookupStart || 0,
      domainLookupEnd: navigation?.domainLookupEnd || 0,
      connectStart: navigation?.connectStart || 0,
      connectEnd: navigation?.connectEnd || 0,
      requestStart: navigation?.requestStart || 0,
      responseStart: navigation?.responseStart || 0,
      responseEnd: navigation?.responseEnd || 0,
      domLoading: navigation?.domContentLoadedEventStart || 0,
      domInteractive: navigation?.domInteractive || 0,
      domContentLoaded: navigation?.domContentLoadedEventEnd || 0,
      domComplete: navigation?.domComplete || 0,
      loadEventStart: navigation?.loadEventStart || 0,
      loadEventEnd: navigation?.loadEventEnd || 0,
      timeToInteractive: 0,
    };
  }

  private setupObservers(): void {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries[entries.length - 1];
        this.metrics.firstContentfulPaint = fcp.startTime;
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lcp.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fid = entries[entries.length - 1] as any;
        this.metrics.firstInputDelay = fid.processingStart - fid.startTime;
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      this.observers = [fcpObserver, lcpObserver, fidObserver, clsObserver];
    }
  }

  // Component Loading Tracking
  trackComponentLoad(componentName: string, loadStart: number): void {
    const loadEnd = performance.now();
    const loadDuration = loadEnd - loadStart;

    this.componentMetrics.set(componentName, {
      componentName,
      loadStart,
      loadEnd,
      loadDuration,
    });

    console.log(`🧠 ${componentName} geladen in ${loadDuration.toFixed(2)}ms`);
  }

  // Bundle Size Tracking
  trackBundleSize(chunkName: string, size: number): void {
    console.log(`📦 Bundle ${chunkName}: ${(size / 1024).toFixed(2)}KB`);
  }

  // Error Tracking
  trackError(error: Error, context: string): void {
    console.error(`❌ Performance Error in ${context}:`, error);
  }

  // Get Performance Report
  getPerformanceReport(): {
    metrics: PerformanceMetrics;
    componentMetrics: ComponentLoadMetrics[];
    recommendations: string[];
  } {
    const componentMetricsArray = Array.from(this.componentMetrics.values());
    
    // Calculate Time to Interactive
    this.metrics.timeToInteractive = this.metrics.domInteractive - this.metrics.navigationStart;

    // Generate Recommendations
    const recommendations: string[] = [];
    
    if (this.metrics.firstContentfulPaint && this.metrics.firstContentfulPaint > 2000) {
      recommendations.push('⚠️ First Contentful Paint ist zu lang (>2s). Optimieren Sie das initiale Rendering.');
    }
    
    if (this.metrics.largestContentfulPaint && this.metrics.largestContentfulPaint > 4000) {
      recommendations.push('⚠️ Largest Contentful Paint ist zu lang (>4s). Optimieren Sie große Inhalte.');
    }
    
    if (this.metrics.firstInputDelay && this.metrics.firstInputDelay > 100) {
      recommendations.push('⚠️ First Input Delay ist zu hoch (>100ms). Reduzieren Sie JavaScript-Blockierung.');
    }
    
    if (this.metrics.cumulativeLayoutShift && this.metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('⚠️ Cumulative Layout Shift ist zu hoch (>0.1). Stabilisieren Sie das Layout.');
    }

    const slowComponents = componentMetricsArray.filter(cm => cm.loadDuration > 1000);
    if (slowComponents.length > 0) {
      recommendations.push(`⚠️ ${slowComponents.length} Komponenten laden langsam (>1s). Implementieren Sie besseres Code-Splitting.`);
    }

    return {
      metrics: this.metrics,
      componentMetrics: componentMetricsArray,
      recommendations,
    };
  }

  // Log Performance Report
  logPerformanceReport(): void {
    const report = this.getPerformanceReport();
    
    console.group('🚀 VALEO NeuroERP Performance Report');
    console.log('📊 Navigation Timing:', {
      'DOM Loading': `${(report.metrics.domLoading - report.metrics.navigationStart).toFixed(2)}ms`,
      'DOM Interactive': `${(report.metrics.domInteractive - report.metrics.navigationStart).toFixed(2)}ms`,
      'DOM Complete': `${(report.metrics.domComplete - report.metrics.navigationStart).toFixed(2)}ms`,
      'Load Event': `${(report.metrics.loadEventEnd - report.metrics.navigationStart).toFixed(2)}ms`,
    });
    
    if (report.metrics.firstContentfulPaint) {
      console.log('🎨 Paint Metrics:', {
        'First Contentful Paint': `${report.metrics.firstContentfulPaint.toFixed(2)}ms`,
        'Largest Contentful Paint': report.metrics.largestContentfulPaint ? `${report.metrics.largestContentfulPaint.toFixed(2)}ms` : 'N/A',
      });
    }
    
    if (report.metrics.firstInputDelay) {
      console.log('⚡ Interaction Metrics:', {
        'First Input Delay': `${report.metrics.firstInputDelay.toFixed(2)}ms`,
      });
    }
    
    if (report.componentMetrics.length > 0) {
      console.log('🧩 Component Loading:', report.componentMetrics.map(cm => ({
        component: cm.componentName,
        duration: `${cm.loadDuration.toFixed(2)}ms`,
      })));
    }
    
    if (report.recommendations.length > 0) {
      console.log('💡 Recommendations:', report.recommendations);
    }
    
    console.groupEnd();
  }

  // Cleanup
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.componentMetrics.clear();
  }
}

// Global Performance Monitor Instance
export const performanceMonitor = new PerformanceMonitor();

// Utility Functions - Optimiert für Stabilität
export const trackComponentLoad = (componentName: string) => {
  const startTime = performance.now();
  return () => {
    try {
      performanceMonitor.trackComponentLoad(componentName, startTime);
    } catch (error) {
      console.warn(`Performance tracking error for ${componentName}:`, error);
    }
  };
};

// Neue Hook-basierte Performance-Tracking-Funktion
export const useComponentTracker = (componentName: string) => {
  return React.useCallback(() => {
    const startTime = performance.now();
    return () => {
      try {
        const loadEnd = performance.now();
        const loadDuration = loadEnd - startTime;
        console.log(`🧠 ${componentName} geladen in ${loadDuration.toFixed(2)}ms`);
      } catch (error) {
        console.warn(`Performance tracking error for ${componentName}:`, error);
      }
    };
  }, [componentName]);
};

export const trackBundleSize = (chunkName: string, size: number) => {
  performanceMonitor.trackBundleSize(chunkName, size);
};

export const logPerformanceReport = () => {
  performanceMonitor.logPerformanceReport();
};

// Auto-log performance report on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      logPerformanceReport();
    }, 1000);
  });
} 