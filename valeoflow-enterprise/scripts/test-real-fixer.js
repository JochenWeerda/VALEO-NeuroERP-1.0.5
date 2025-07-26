#!/usr/bin/env node

// ============================================================================================================================================================================
// Test-Skript für echten Code-Fixer
// ============================================================================================================================================================================

const RealCodeFixer = require('./real-code-fixer');

async function testRealCodeFixer() {
  console.log('🧪 Teste echten Code-Fixer...');
  
  const fixer = new RealCodeFixer();
  
  try {
    // 1. Codebase analysieren
    console.log('📊 Analysiere Codebase auf echte Probleme...');
    const issues = await fixer.analyzeAndFixCodebase();
    
    // 2. Bericht generieren
    console.log('📈 Generiere Bericht...');
    const report = fixer.generateReport();
    
    // 3. Ergebnisse anzeigen
    console.log('\n📋 Echte Code-Fix Ergebnisse:');
    console.log('================================================================');
    console.log(`Kritische Probleme: ${report.criticalIssues}`);
    console.log(`Hohe Priorität: ${report.highIssues}`);
    console.log(`Mittlere Priorität: ${report.mediumIssues}`);
    console.log(`Fixes angewendet: ${report.fixesApplied}`);
    
    // 4. Detaillierte Probleme anzeigen
    if (issues.length > 0) {
      console.log('\n🔍 Detaillierte echte Probleme:');
      console.log('===================================================================');
      
      issues.slice(0, 10).forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.file}`);
        console.log(`   Typ: ${issue.type}`);
        console.log(`   Priorität: ${issue.severity}`);
        console.log(`   Zeile: ${issue.line}`);
        console.log(`   Nachricht: ${issue.message}`);
        console.log('');
      });
      
      if (issues.length > 10) {
        console.log(`... und ${issues.length - 10} weitere echte Probleme`);
      }
    } else {
      console.log('\n✅ Keine echten Probleme gefunden!');
    }
    
    console.log('\n✅ Echter Code-Fixer Test abgeschlossen');
    
  } catch (error) {
    console.error('❌ Fehler beim Testen des echten Code-Fixers:', error);
  }
}

// Führe Test aus
testRealCodeFixer(); 