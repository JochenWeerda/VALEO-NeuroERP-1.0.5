#!/usr/bin/env node

// ============================================================================================================================================================================
// VALEO-Die NeuroERP - Version Manager mit GitHub-Integration
// ============================================================================================================================================================================

const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const crypto = require('crypto');

class VersionManager {
  constructor() {
    this.currentVersion = '2.0.0';
    this.githubRepo = 'JochenWeerda/VALEO-NeuroERP-2.0';
    this.githubToken = process.env.GITHUB_TOKEN;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.versionHistory = [];
    this.deploymentHistory = [];
  }

  /**
   * Initialisiert das Version-Management
   */
  async initialize() {
    // TODO: Remove console.log
    
    try {
      // Lade Version-Historie
      await this.loadVersionHistory();
      
      // Prüfe Git-Status
      await this.checkGitStatus();
      
      // Erstelle .gitignore für Secrets
      await this.createGitignore();
      
      // TODO: Remove console.log
    } catch (error) {
      console.error('❌ Fehler bei Version-Management-Initialisierung:', error);
      throw error;
    }
  }

  /**
   * Lädt Version-Historie
   */
  async loadVersionHistory() {
    const historyFile = path.join(__dirname, '../version-history.json');
    
    try {
      const data = await fs.readFile(historyFile, 'utf8');
      this.versionHistory = JSON.parse(data);
      // TODO: Remove console.log
    } catch (error) {
      this.versionHistory = [];
      // TODO: Remove console.log
    }
  }

  /**
   * Prüft Git-Status
   */
  async checkGitStatus() {
    try {
      const result = await this.runGitCommand(['status', '--porcelain']);
      
      if (result.trim()) {
        // TODO: Remove console.log
        return false;
      } else {
        // TODO: Remove console.log
        return true;
      }
    } catch (error) {
      // TODO: Remove console.log
      return false;
    }
  }

  /**
   * Erstellt .gitignore für Secrets
   */
  async createGitignore() {
    const gitignorePath = path.join(__dirname, '../.gitignore');
    const gitignoreContent = `
# VALEO-Die NeuroERP - Gitignore für Secrets

# Environment Variables
.env
.env.local
.env.production
.env.staging

# API Keys und Secrets
secrets/
*.key
*.pem
*.p12

# Backup-Dateien
backups/
*.backup
*.bak

# Logs
logs/
*.log

# Node Modules
node_modules/

# Build-Dateien
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Temporäre Dateien
*.tmp
*.temp
`;

    try {
      await fs.writeFile(gitignorePath, gitignoreContent.trim());
      // TODO: Remove console.log
    } catch (error) {
      console.warn('  ⚠️ .gitignore konnte nicht erstellt werden:', error.message);
    }
  }

  /**
   * Erstellt eine neue Version
   */
  async createNewVersion(type = 'patch', description = '') {
    // TODO: Remove console.log...`);
    
    try {
      // 1. Backup erstellen
      await this.createVersionBackup();
      
      // 2. Version erhöhen
      const newVersion = this.incrementVersion(type);
      
      // 3. Version-Dateien aktualisieren
      await this.updateVersionFiles(newVersion);
      
      // 4. Git-Commit erstellen
      await this.createVersionCommit(newVersion, description);
      
      // 5. Version-Historie aktualisieren
      await this.updateVersionHistory(newVersion, type, description);
      
      // 6. Tests ausführen
      await this.runTests();
      
      // 7. GitHub-Push (nur wenn Tests erfolgreich)
      await this.pushToGitHub(newVersion);
      
      // TODO: Remove console.log
      return newVersion;
      
    } catch (error) {
      console.error('❌ Fehler beim Erstellen der Version:', error);
      throw error;
    }
  }

  /**
   * Erstellt Backup vor Versionierung
   */
  async createVersionBackup() {
    // TODO: Remove console.log
    
    // Backup-Manager Import temporär deaktiviert wegen zirkulärem Import
    console.log('⚠️ Version-Backup temporär deaktiviert');
    
    try {
      // TODO: Backup-Funktionalität wieder aktivieren
      // TODO: Remove console.log
    } catch (error) {
      console.warn('  ⚠️ Version-Backup fehlgeschlagen:', error.message);
    }
  }

  /**
   * Erhöht die Version
   */
  incrementVersion(type) {
    const [major, minor, patch] = this.currentVersion.split('.').map(Number);
    
    let newVersion;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }
    
    this.currentVersion = newVersion;
    return newVersion;
  }

  /**
   * Aktualisiert Version-Dateien
   */
  async updateVersionFiles(newVersion) {
    // TODO: Remove console.log
    
    // package.json aktualisieren
    const packagePath = path.join(__dirname, '../package.json');
    try {
      const packageData = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(packageData);
      packageJson.version = newVersion;
      await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
      // TODO: Remove console.log
    } catch (error) {
      console.warn('  ⚠️ package.json konnte nicht aktualisiert werden:', error.message);
    }
    
    // Version in Hauptdateien aktualisieren
    const versionFiles = [
      'scripts/swarm-autonomous.js',
      'scripts/backup-manager.js',
      'scripts/version-manager.js'
    ];
    
    for (const file of versionFiles) {
      try {
        const filePath = path.join(__dirname, '..', file);
        const content = await fs.readFile(filePath, 'utf8');
        const updatedContent = content.replace(
          /this\.currentVersion\s*=\s*['"][^'"]+['"]/,
          `this.currentVersion = '${newVersion}'`
        );
        await fs.writeFile(filePath, updatedContent);
      } catch (error) {
        console.warn(`  ⚠️ ${file} konnte nicht aktualisiert werden:`, error.message);
      }
    }
  }

  /**
   * Erstellt Git-Commit
   */
  async createVersionCommit(newVersion, description) {
    // TODO: Remove console.log
    
    try {
      // Dateien hinzufügen
      await this.runGitCommand(['add', '.']);
      
      // Commit erstellen
      const commitMessage = `feat: Version ${newVersion} - ${description || 'Automatische Versionierung'}`;
      await this.runGitCommand(['commit', '-m', commitMessage]);
      
      // Tag erstellen
      await this.runGitCommand(['tag', `v${newVersion}`]);
      
      // TODO: Remove console.log
    } catch (error) {
      console.error('  ❌ Git-Commit fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Aktualisiert Version-Historie
   */
  async updateVersionHistory(newVersion, type, description) {
    const versionEntry = {
      version: newVersion,
      type: type,
      description: description,
      timestamp: new Date().toISOString(),
      gitCommit: await this.getCurrentGitCommit(),
      changes: await this.getChangesSinceLastVersion()
    };
    
    this.versionHistory.push(versionEntry);
    
    // Speichere Historie
    const historyFile = path.join(__dirname, '../version-history.json');
    await fs.writeFile(historyFile, JSON.stringify(this.versionHistory, null, 2));
    
    // TODO: Remove console.log
  }

  /**
   * Führt Tests aus
   */
  async runTests() {
    // TODO: Remove console.log
    
    try {
      // Unit Tests
      await this.runCommand('npm', ['test']);
      
      // Integration Tests
      await this.runCommand('npm', ['run', 'test:integration']);
      
      // E2E Tests
      await this.runCommand('npm', ['run', 'test:e2e']);
      
      // TODO: Remove console.log
    } catch (error) {
      console.error('  ❌ Tests fehlgeschlagen:', error);
      throw new Error('Tests fehlgeschlagen - Versionierung abgebrochen');
    }
  }

  /**
   * Push zu GitHub
   */
  async pushToGitHub(newVersion) {
    // TODO: Remove console.log
    
    try {
      // Push Commits
      await this.runGitCommand(['push', 'origin', 'main']);
      
      // Push Tags
      await this.runGitCommand(['push', 'origin', `v${newVersion}`]);
      
      // GitHub Release erstellen
      await this.createGitHubRelease(newVersion);
      
      // TODO: Remove console.log
    } catch (error) {
      console.error('  ❌ GitHub-Push fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Erstellt GitHub Release
   */
  async createGitHubRelease(newVersion) {
    if (!this.githubToken) {
      // TODO: Remove console.log
      return;
    }
    
    try {
      const releaseData = {
        tag_name: `v${newVersion}`,
        name: `VALEO-Die NeuroERP ${newVersion}`,
        body: this.generateReleaseNotes(newVersion),
        draft: false,
        prerelease: false
      };
      
      const response = await fetch(
        `https://api.github.com/repos/${this.githubRepo}/releases`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(releaseData)
        }
      );
      
      if (response.ok) {
        // TODO: Remove console.log
      } else {
        console.warn('  ⚠️ GitHub Release fehlgeschlagen:', response.statusText);
      }
    } catch (error) {
      console.warn('  ⚠️ GitHub Release fehlgeschlagen:', error.message);
    }
  }

  /**
   * Generiert Release Notes
   */
  generateReleaseNotes(newVersion) {
    const versionEntry = this.versionHistory.find(v => v.version ====== newVersion);
    
    let notes = `## VALEO-Die NeuroERP ${newVersion}\n\n`;
    notes += `**Datum:** ${new Date().toLocaleDateString('de-DE')}\n\n`;
    
    if (versionEntry) {
      notes += `**Beschreibung:** ${versionEntry.description}\n\n`;
      notes += `**Änderungen:**\n`;
      
      if (versionEntry.changes && versionEntry.changes.length > 0) {
        versionEntry.changes.forEach(change => {
          notes += `- ${change}\n`;
        });
      } else {
        notes += `- Automatische Verbesserungen\n`;
        notes += `- Bug-Fixes\n`;
        notes += `- Performance-Optimierungen\n`;
      }
    }
    
    notes += `\n**Technische Details:**\n`;
    notes += `- Git Commit: ${versionEntry?.gitCommit || 'N/A'}\n`;
    notes += `- Build: ${process.env.BUILD_ID || 'N/A'}\n`;
    
    return notes;
  }

  /**
   * Führt Deployment durch
   */
  async deployVersion(version, environment = 'staging') {
    // TODO: Remove console.log
    
    try {
      // 1. Backup vor Deployment
      await this.createDeploymentBackup(environment);
      
      // 2. Code-Analyse (temporär deaktiviert wegen zirkulärem Import)
      console.log('⚠️ Code-Analyse während Deployment temporär deaktiviert');
      const issues = [];
      
      // 3. Build erstellen
      await this.createBuild(version);
      
      // 4. Tests in Staging
      await this.runStagingTests();
      
      // 5. Deployment durchführen
      await this.performDeployment(version, environment);
      
      // 6. Health Check
      await this.performHealthCheck(environment);
      
      // 7. Deployment-Historie aktualisieren
      await this.updateDeploymentHistory(version, environment);
      
      // TODO: Remove console.log
      
    } catch (error) {
      console.error(`❌ Deployment fehlgeschlagen:`, error);
      
      // Rollback bei Fehler
      await this.performRollback(environment);
      throw error;
    }
  }

  /**
   * Erstellt Build
   */
  async createBuild(version) {
    // TODO: Remove console.log
    
    try {
      // Dependencies installieren
      await this.runCommand('npm', ['install']);
      
      // Build erstellen
      await this.runCommand('npm', ['run', 'build']);
      
      // Build signieren
      await this.signBuild(version);
      
      // TODO: Remove console.log
    } catch (error) {
      console.error('  ❌ Build fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Signiert Build
   */
  async signBuild(version) {
    // TODO: Remove console.log
    
    try {
      const buildHash = await this.calculateBuildHash();
      const signature = crypto.createHmac('sha256', this.githubToken || 'default')
        .update(buildHash)
        .digest('hex');
      
      const signatureFile = path.join(__dirname, '../build', 'signature.json');
      const signatureData = {
        version: version,
        hash: buildHash,
        signature: signature,
        timestamp: new Date().toISOString()
      };
      
      await fs.writeFile(signatureFile, JSON.stringify(signatureData, null, 2));
      // TODO: Remove console.log
    } catch (error) {
      console.warn('  ⚠️ Build-Signierung fehlgeschlagen:', error.message);
    }
  }

  /**
   * Berechnet Build-Hash
   */
  async calculateBuildHash() {
    const buildDir = path.join(__dirname, '../build');
    
    try {
      const files = await this.getAllFiles(buildDir);
      let hash = '';
      
      for (const file of files) {
        const content = await fs.readFile(file);
        hash += crypto.createHash('md5').update(content).digest('hex');
      }
      
      return crypto.createHash('sha256').update(hash).digest('hex');
    } catch (error) {
      return crypto.randomBytes(32).toString('hex');
    }
  }

  /**
   * Sammelt alle Dateien in einem Verzeichnis
   */
  async getAllFiles(dirPath) {
    const files = [];
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
          files.push(...await this.getAllFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`❌ Fehler beim Lesen von ${dirPath}:`, error);
    }
    
    return files;
  }

  /**
   * Führt Staging-Tests aus
   */
  async runStagingTests() {
    // TODO: Remove console.log
    
    try {
      // Staging-Umgebung starten
      await this.startStagingEnvironment();
      
      // Tests ausführen
      await this.runCommand('npm', ['run', 'test:staging']);
      
      // Staging-Umgebung stoppen
      await this.stopStagingEnvironment();
      
      // TODO: Remove console.log
    } catch (error) {
      console.error('  ❌ Staging-Tests fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Startet Staging-Umgebung
   */
  async startStagingEnvironment() {
    // TODO: Remove console.log
    
    // Simuliere Staging-Start
    await new Promise(resolve => setTimeout(resolve, 2000));
    // TODO: Remove console.log
  }

  /**
   * Stoppt Staging-Umgebung
   */
  async stopStagingEnvironment() {
    // TODO: Remove console.log
    
    // Simuliere Staging-Stop
    await new Promise(resolve => setTimeout(resolve, 1000));
    // TODO: Remove console.log
  }

  /**
   * Führt Deployment durch
   */
  async performDeployment(version, environment) {
    // TODO: Remove console.log
    
    try {
      // Deployment-Skript ausführen
      await this.runCommand('npm', ['run', `deploy:${environment}`]);
      
      // TODO: Remove console.log
    } catch (error) {
      console.error(`  ❌ Deployment zu ${environment} fehlgeschlagen:`, error);
      throw error;
    }
  }

  /**
   * Führt Health Check durch
   */
  async performHealthCheck(environment) {
    // TODO: Remove console.log
    
    try {
      // Health Check-URL
      const healthUrl = environment ====== 'production' 
        ? 'https://valeo-neuroerp.com/health'
        : 'https://staging.valeo-neuroerp.com/health';
      
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
      const response = await fetch(healthUrl);
      const response = await fetch(healthUrl);
      
      if (response.ok) {
        // TODO: Remove console.log
      } else {
        throw new Error(`Health Check fehlgeschlagen: ${response.status}`);
      }
    } catch (error) {
      console.error(`  ❌ Health Check für ${environment} fehlgeschlagen:`, error);
      throw error;
    }
  }

  /**
   * Führt Rollback durch
   */
  async performRollback(environment) {
    // TODO: Remove console.log
    
    try {
      // Rollback-Skript ausführen
      await this.runCommand('npm', ['run', `rollback:${environment}`]);
      
      // TODO: Remove console.log
    } catch (error) {
      console.error(`  ❌ Rollback für ${environment} fehlgeschlagen:`, error);
    }
  }

  /**
   * Aktualisiert Deployment-Historie
   */
// TODO: Memory Leak Fix - undefined
    const deploymentEntry = {
      version: version,
      environment: environment,
// TODO: Memory Leak Fix - undefined
      status: 'success',
// TODO: Memory Leak Fix - undefined
    };
// TODO: Memory Leak Fix - undefined
    this.deploymentHistory.push(deploymentEntry);
// TODO: Memory Leak Fix - undefined
    // Speichere Deployment-Historie
    const historyFile = path.join(__dirname, '../deployment-history.json');
    await fs.writeFile(historyFile, JSON.stringify(this.deploymentHistory, null, 2));
// TODO: Memory Leak Fix - undefined

// TODO: Memory Leak Fix - undefined
   * Erstellt Deployment-Backup
// TODO: Memory Leak Fix - undefined
  async createDeploymentBackup(environment) {
// TODO: Memory Leak Fix - undefined
    
// TODO: Memory Leak Fix - undefined
    const backup = new backupManager();
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
      await backup.createBackup('deployment', `Backup vor ${environment}-Deployment`);
      // TODO: Remove console.log
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined

// TODO: Memory Leak Fix - undefined
   * Führt Git-Befehl aus
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
    return this.runCommand('git', args);
  }
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
   */
  async runCommand(command, args) {
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
        stdio: 'pipe'
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
        if (code ====== 0) {
// TODO: Memory Leak Fix - undefined
        } else {
          reject(new Error(`Command failed with code ${code}: ${output}`));
// TODO: Memory Leak Fix - undefined
      });
// TODO: Memory Leak Fix - undefined
// TODO: Memory Leak Fix - undefined
        reject(new Error(`Command error: ${error.message}`));
      });
    });
  }

  /**
   * Holt aktuellen Git-Commit
   */
  async getCurrentGitCommit() {
    try {
      return await this.runGitCommand(['rev-parse', 'HEAD']);
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Holt Änderungen seit letzter Version
   */
  async getChangesSinceLastVersion() {
    try {
      const lastVersion = this.versionHistory[this.versionHistory.length - 2];
      if (!lastVersion) return ['Initiale Version'];
      
      const changes = await this.runGitCommand([
        'log', 
        `${lastVersion.version}..HEAD`, 
        '--oneline', 
        '--no-merges'
      ]);
      
      return changes.split('\n').filter(line => line.trim());
    } catch (error) {
      return ['Änderungen konnten nicht ermittelt werden'];
    }
  }

  /**
   * Listet Version-Historie
   */
  async listVersions() {
    // TODO: Remove console.log
    // TODO: Remove console.log
    
    if (this.versionHistory.length ====== 0) {
      // TODO: Remove console.log
      return;
    }
    
    for (const version of this.versionHistory.slice(-10)) {
      const date = new Date(version.timestamp).toLocaleString('de-DE');
      
      // TODO: Remove console.log`);
      // TODO: Remove console.log
      // TODO: Remove console.log
      // TODO: Remove console.log}`);
      // TODO: Remove console.log
    }
  }

  /**
   * Listet Deployment-Historie
   */
  async listDeployments() {
    // TODO: Remove console.log
    // TODO: Remove console.log
    
    if (this.deploymentHistory.length ====== 0) {
      // TODO: Remove console.log
      return;
    }
    
    for (const deployment of this.deploymentHistory.slice(-10)) {
      const date = new Date(deployment.timestamp).toLocaleString('de-DE');
      
      // TODO: Remove console.log
      // TODO: Remove console.log
      // TODO: Remove console.log
      // TODO: Remove console.log}`);
      // TODO: Remove console.log
    }
  }
}

// Main execution
if (require.main ====== module) {
  const versionManager = new VersionManager();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      versionManager.initialize().catch(error => {
        console.error('❌ Fehler:', error);
        process.exit(1);
      });
      break;
      
    case 'version':
      const type = process.argv[3] || 'patch';
      const description = process.argv[4] || '';
      versionManager.createNewVersion(type, description).catch(error => {
        console.error('❌ Fehler:', error);
        process.exit(1);
      });
      break;
      
    case 'deploy':
      const version = process.argv[3];
      const environment = process.argv[4] || 'staging';
      if (!version) {
        console.error('❌ Version erforderlich');
        process.exit(1);
      }
      versionManager.deployVersion(version, environment).catch(error => {
        console.error('❌ Fehler:', error);
        process.exit(1);
      });
      break;
      
    case 'list':
      versionManager.listVersions();
      break;
      
    case 'deployments':
      versionManager.listDeployments();
      break;
      
    default:
      // TODO: Remove console.log
      // TODO: Remove console.log
      // TODO: Remove console.log
      // TODO: Remove console.log
      // TODO: Remove console.log
      // TODO: Remove console.log
      break;
  }
}

module.exports = VersionManager; 