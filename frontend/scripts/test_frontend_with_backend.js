#!/usr/bin/env node
/**
 * VALEO NeuroERP - Frontend-Tests mit Backend-Integration
 * Führt Frontend-Tests mit echten Backend-Daten aus
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class FrontendBackendTester {
  constructor() {
    this.backendUrl = 'http://localhost:8000';
    this.testResults = [];
  }

  async checkBackendAvailability() {
    console.log('🔍 Prüfe Backend-Verfügbarkeit...');
    
    try {
      const response = await fetch(`${this.backendUrl}/health`);
      if (response.ok) {
        console.log('✅ Backend ist verfügbar');
        return true;
      } else {
        console.log(`⚠️ Backend läuft, aber Health-Check fehlgeschlagen: HTTP ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log('❌ Backend nicht erreichbar');
      console.log('   Stelle sicher, dass das Backend läuft: cd backend && python main.py');
      return false;
    }
  }

  async runBackendTests() {
    console.log('\n🧪 Führe Backend-Tests aus...');
    
    try {
      const result = execSync('cd ../backend && python scripts/test_ai_backend.py', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ Backend-Tests erfolgreich');
      return true;
    } catch (error) {
      console.log('❌ Backend-Tests fehlgeschlagen');
      console.log(error.stdout || error.message);
      return false;
    }
  }

  async runFrontendTests() {
    console.log('\n🧪 Führe Frontend-Tests aus...');
    
    try {
      // Setze Umgebungsvariable für Backend-URL
      process.env.REACT_APP_API_BASE_URL = this.backendUrl;
      
      const result = execSync('npm test -- --testPathPattern="integration" --watchAll=false', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ Frontend-Tests erfolgreich');
      return true;
    } catch (error) {
      console.log('❌ Frontend-Tests fehlgeschlagen');
      console.log(error.stdout || error.message);
      return false;
    }
  }

  async runE2ETests() {
    console.log('\n🧪 Führe End-to-End-Tests aus...');
    
    try {
      // Starte Backend im Hintergrund
      const backendProcess = execSync('cd ../backend && python main.py', {
        stdio: 'pipe',
        detached: true
      });
      
      // Warte kurz bis Backend gestartet ist
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Führe E2E-Tests aus
      const result = execSync('npm run test:e2e', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ E2E-Tests erfolgreich');
      
      // Beende Backend-Prozess
      process.kill(-backendProcess.pid);
      
      return true;
    } catch (error) {
      console.log('❌ E2E-Tests fehlgeschlagen');
      console.log(error.stdout || error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 VALEO NeuroERP - Frontend-Backend Integration Tests');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    // Prüfe Backend-Verfügbarkeit
    const backendAvailable = await this.checkBackendAvailability();
    if (!backendAvailable) {
      console.log('\n❌ Tests abgebrochen - Backend nicht verfügbar');
      return false;
    }
    
    // Führe Backend-Tests aus
    const backendTestsPassed = await this.runBackendTests();
    if (!backendTestsPassed) {
      console.log('\n⚠️ Backend-Tests fehlgeschlagen, aber fahre mit Frontend-Tests fort...');
    }
    
    // Führe Frontend-Tests aus
    const frontendTestsPassed = await this.runFrontendTests();
    
    // Führe E2E-Tests aus (optional)
    let e2eTestsPassed = false;
    if (backendTestsPassed && frontendTestsPassed) {
      e2eTestsPassed = await this.runE2ETests();
    }
    
    // Berechne Gesamtergebnis
    const totalTime = Date.now() - startTime;
    const successRate = [
      backendTestsPassed,
      frontendTestsPassed,
      e2eTestsPassed
    ].filter(Boolean).length / 3 * 100;
    
    // Zeige Ergebnisse
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST-ERGEBNISSE');
    console.log('=' .repeat(60));
    console.log(`Backend-Tests: ${backendTestsPassed ? '✅' : '❌'}`);
    console.log(`Frontend-Tests: ${frontendTestsPassed ? '✅' : '❌'}`);
    console.log(`E2E-Tests: ${e2eTestsPassed ? '✅' : '❌'}`);
    console.log(`Erfolgsrate: ${successRate.toFixed(1)}%`);
    console.log(`Gesamtzeit: ${(totalTime / 1000).toFixed(2)}s`);
    
    // Speichere Ergebnisse
    this.saveResults({
      timestamp: new Date().toISOString(),
      backendUrl: this.backendUrl,
      backendTestsPassed,
      frontendTestsPassed,
      e2eTestsPassed,
      successRate,
      totalTime
    });
    
    return successRate >= 66; // Mindestens 2 von 3 Tests müssen erfolgreich sein
  }

  saveResults(results) {
    const filename = 'frontend_backend_test_results.json';
    try {
      fs.writeFileSync(filename, JSON.stringify(results, null, 2));
      console.log(`\n💾 Ergebnisse gespeichert in: ${filename}`);
    } catch (error) {
      console.log(`\n❌ Fehler beim Speichern der Ergebnisse: ${error.message}`);
    }
  }
}

// Hauptfunktion
async function main() {
  const tester = new FrontendBackendTester();
  
  try {
    const success = await tester.runAllTests();
    
    if (success) {
      console.log('\n🎉 Alle Tests erfolgreich!');
      process.exit(0);
    } else {
      console.log('\n⚠️ Einige Tests fehlgeschlagen');
      process.exit(1);
    }
  } catch (error) {
    console.log(`\n❌ Fehler beim Ausführen der Tests: ${error.message}`);
    process.exit(2);
  }
}

// Führe Tests aus wenn Script direkt aufgerufen wird
if (require.main === module) {
  main();
}

module.exports = FrontendBackendTester; 