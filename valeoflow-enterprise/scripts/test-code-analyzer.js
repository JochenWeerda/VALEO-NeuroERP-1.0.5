#!/usr/bin/env node

// ============================================================================================================================================================================
// Test-Skript für Code-Analyzer
// ============================================================================================================================================================================

const CodeAnalyzer = require('./code-analyzer');

async function testCodeAnalyzer() {
  // TODO: Remove console.log
  
  const analyzer = new CodeAnalyzer();
  
  try {
    // 1. Codebase analysieren
    // TODO: Remove console.log
    const issues = await analyzer.analyzeCodebase();
    
    // 2. Bericht generieren
    // TODO: Remove console.log
    const report = analyzer.generateReport();
    
    // 3. Ergebnisse anzeigen
    // TODO: Remove console.log
    // TODO: Remove console.log
    // TODO: Remove console.log
    // TODO: Remove console.log
    // TODO: Remove console.log
    // TODO: Remove console.log
    // TODO: Remove console.log
    // TODO: Remove console.log
    // TODO: Remove console.log
    
    // 4. Detaillierte Probleme anzeigen
    if (issues.length > 0) {
      // TODO: Remove console.log
      // TODO: Remove console.log
      
      issues.slice(0, 10).forEach((issue, index) => {
        // TODO: Remove console.log
        // TODO: Remove console.log
        // TODO: Remove console.log
        // TODO: Remove console.log
        // TODO: Remove console.log
        // TODO: Remove console.log
      });
      
      if (issues.length > 10) {
        // TODO: Remove console.log
      }
    } else {
      // TODO: Remove console.log
    }
    
    // 5. Automatische Fixes anwenden (falls Probleme vorhanden)
    if (issues.length > 0) {
      // TODO: Remove console.log
      await analyzer.applyFixes();
      
      // 6. Bericht nach Fixes
      const afterReport = analyzer.generateReport();
      // TODO: Remove console.log
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Testen des Code-Analyzers:', error);
  }
}

// Führe Test aus
testCodeAnalyzer(); 