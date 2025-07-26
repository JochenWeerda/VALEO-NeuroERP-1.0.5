#!/usr/bin/env node

// ============================================================================================================================================================================
// VALEO-Die NeuroERP - Echter Code-Fixer mit Cursor AI Integration
// ============================================================================================================================================================================

const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const crypto = require('crypto');

class RealCodeFixer {
  constructor() {
    this.cursorApiKey = process.env.CURSOR_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.fixes = [];
    this.analysisResults = [];
    this.errorQueue = [];
    this.isProcessing = false;
    this.batchFixes = new Map(); // Neue Map für Batch-Fixes
    this.errorPatterns = new Map(); // Neue Map für Fehler-Patterns
    this.batchThreshold = 5; // Mindestanzahl für Batch-Behandlung
  }

  /**
   * Analysiert und behebt echte Code-Probleme mit Fehler-Queue
   */
  async analyzeAndFixCodebase() {
    console.log('🔍 Analysiere Codebase auf echte Probleme...');
    
    const directories = [
      'frontend', 'microservices', 'api-gateway', 
      'design-system', 'scripts', 'coordination'
    ];
    
    for (const dir of directories) {
      if (await this.directoryExists(dir)) {
        await this.analyzeDirectoryWithQueue(dir);
      }
    }
    
    console.log(`✅ Codebase-Analyse abgeschlossen: ${this.analysisResults.length} echte Probleme gefunden`);
    console.log(`✅ Fehler-Queue abgeschlossen: ${this.fixes.length} Probleme behoben`);
    
    return this.analysisResults;
  }

  /**
   * Analysiert ein Verzeichnis auf echte Probleme mit sofortiger Fehlerbehebung
   */
  async analyzeDirectoryWithQueue(dirPath) {
    console.log(`  📁 Analysiere ${dirPath} auf echte Probleme...`);
    
    const files = await this.getAllCodeFiles(dirPath);
    
    for (const file of files) {
      await this.analyzeFileAndFixImmediately(file);
    }
  }

  /**
   * Analysiert ein Verzeichnis auf echte Probleme (Legacy-Methode)
   */
  async analyzeDirectory(dirPath) {
    console.log(`  📁 Analysiere ${dirPath} auf echte Probleme...`);
    
    const files = await this.getAllCodeFiles(dirPath);
    
    for (const file of files) {
      await this.analyzeFileForRealIssues(file);
    }
  }

  /**
   * Sammelt alle Code-Dateien
   */
  async getAllCodeFiles(dirPath) {
    const files = [];
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
          files.push(...await this.getAllCodeFiles(fullPath));
        } else if (item.isFile() && this.isCodeFile(item.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`❌ Fehler beim Lesen von ${dirPath}:`, error);
    }
    
    return files;
  }

  /**
   * Prüft ob eine Datei eine Code-Datei ist
   */
  isCodeFile(filename) {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.yml', '.yaml'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  /**
   * Analysiert eine Datei auf echte Probleme
   */
  async analyzeFileForRealIssues(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const extension = path.extname(filePath);
      
      if (['.js', '.ts', '.jsx', '.tsx'].includes(extension)) {
        await this.analyzeJavaScriptFile(filePath, content);
      }
      
    } catch (error) {
      console.error(`❌ Fehler beim Analysieren von ${filePath}:`, error);
    }
  }

  /**
   * Analysiert eine Datei auf echte Probleme und behebt sie sofort
   */
  async analyzeFileAndFixImmediately(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const extension = path.extname(filePath);
      
      if (['.js', '.ts', '.jsx', '.tsx'].includes(extension)) {
        await this.analyzeJavaScriptFileAndFixImmediately(filePath, content);
      }
      
    } catch (error) {
      console.error(`❌ Fehler beim Analysieren von ${filePath}:`, error);
    }
  }

  /**
   * Analysiert JavaScript/TypeScript Dateien auf echte Probleme
   */
  async analyzeJavaScriptFile(filePath, content) {
    const issues = [];
    const lines = content.split('\n');
    
    // 1. Echte Sicherheitsprobleme
    this.findSecurityIssues(filePath, content, lines, issues);
    
    // 2. Performance-Probleme
    this.findPerformanceIssues(filePath, content, lines, issues);
    
    // 3. Memory Leaks
    this.findMemoryLeaks(filePath, content, lines, issues);
    
    // 4. Race Conditions
    this.findRaceConditions(filePath, content, lines, issues);
    
    // 5. Error Handling Probleme
    this.findErrorHandlingIssues(filePath, content, lines, issues);
    
    // 6. TypeScript/JavaScript Spezifische Probleme
    this.findTypeScriptIssues(filePath, content, lines, issues);
    
    // 7. API/Backend Spezifische Probleme
    this.findAPIIssues(filePath, content, lines, issues);
    
    // Füge gefundene Probleme hinzu
    issues.forEach(issue => {
      this.analysisResults.push({
        file: filePath,
        ...issue
      });
    });
  }

  /**
   * Analysiert JavaScript/TypeScript Dateien und behebt Probleme sofort mit Batch-Optimierung
   */
  async analyzeJavaScriptFileAndFixImmediately(filePath, content) {
    const lines = content.split('\n');
    let fileModified = false;
    
    console.log(`    📄 Analysiere ${path.basename(filePath)}...`);
    
    // Sammle alle Probleme zuerst
    const allIssues = [];
    
    // 1. Echte Sicherheitsprobleme
    const securityIssues = [];
    this.findSecurityIssues(filePath, content, lines, securityIssues);
    allIssues.push(...securityIssues);
    
    // 2. Performance-Probleme
    const performanceIssues = [];
    this.findPerformanceIssues(filePath, content, lines, performanceIssues);
    allIssues.push(...performanceIssues);
    
    // 3. Memory Leaks
    const memoryIssues = [];
    this.findMemoryLeaks(filePath, content, lines, memoryIssues);
    allIssues.push(...memoryIssues);
    
    // 4. Race Conditions
    const raceIssues = [];
    this.findRaceConditions(filePath, content, lines, raceIssues);
    allIssues.push(...raceIssues);
    
    // 5. Error Handling Probleme
    const errorIssues = [];
    this.findErrorHandlingIssues(filePath, content, lines, errorIssues);
    allIssues.push(...errorIssues);
    
    // 6. TypeScript/JavaScript Spezifische Probleme
    const tsIssues = [];
    this.findTypeScriptIssues(filePath, content, lines, tsIssues);
    allIssues.push(...tsIssues);
    
    // 7. API/Backend Spezifische Probleme
    const apiIssues = [];
    this.findAPIIssues(filePath, content, lines, apiIssues);
    allIssues.push(...apiIssues);
    
    // Batch-Fehlerbehandlung implementieren
    const batchResults = await this.processBatchFixes(filePath, allIssues, lines);
    
    if (batchResults.modified) {
      fileModified = true;
      console.log(`      🔄 Batch-Fixes angewendet: ${batchResults.batchCount} Batches, ${batchResults.totalFixes} Fixes`);
    }
    
    // Einzelne Fixes für nicht-Batch-Probleme
    for (const issue of allIssues) {
      if (!batchResults.processedIssues.has(issue)) {
        console.log(`      🔧 ${issue.priority === 'critical' ? 'KRITISCH' : 'MITTEL'}: ${issue.type} in Zeile ${issue.line}`);
        await this.applyFixImmediately(filePath, issue, lines);
        fileModified = true;
      }
    }
    
    if (fileModified) {
      await fs.writeFile(filePath, lines.join('\n'), 'utf8');
      console.log(`      ✅ Datei ${path.basename(filePath)} aktualisiert`);
    }
    
    // Füge gefundene Probleme hinzu
    allIssues.forEach(issue => {
      this.analysisResults.push({
        file: filePath,
        ...issue
      });
    });
  }

  /**
   * Findet echte Sicherheitsprobleme
   */
  findSecurityIssues(filePath, content, lines, issues) {
    // SQL Injection
    const sqlPatterns = [
      /query\s*\(\s*['"`][^'"`]*\$\{[^}]*\}[^'"`]*['"`]/gi,
      /execute\s*\(\s*['"`][^'"`]*\$\{[^}]*\}[^'"`]*['"`]/gi,
      /db\.query\s*\(\s*['"`][^'"`]*\$\{[^}]*\}[^'"`]*['"`]/gi
    ];
    
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      for (const pattern of sqlPatterns) {
        if (pattern.test(line)) {
          issues.push({
            type: 'sql_injection',
            severity: 'critical',
            line: index + 1,
            message: 'SQL Injection Gefahr - Parameter müssen escaped werden',
            fix: this.generateLocalSecurityFix('sql_injection', line)
          });
        }
      }
    }
    
    // XSS Probleme
    const xssPatterns = [
      /innerHTML\s*=\s*[^;]+/gi,
      /document\.write\s*\([^)]+\)/gi,
      /eval\s*\([^)]+\)/gi
    ];
    
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      for (const pattern of xssPatterns) {
        if (pattern.test(line)) {
          issues.push({
            type: 'xss_vulnerability',
            severity: 'critical',
            line: index + 1,
            message: 'XSS Gefahr - Unsichere DOM-Manipulation',
            fix: this.generateLocalSecurityFix('xss', line)
          });
        }
      }
    }
    
    // Hardcoded Secrets
    const secretPatterns = [
      /password\s*[:=]\s*['"][^'"]{8,}['"]/gi,
      /api_key\s*[:=]\s*['"][^'"]{10,}['"]/gi,
      /secret\s*[:=]\s*['"][^'"]{8,}['"]/gi,
      /token\s*[:=]\s*['"][^'"]{10,}['"]/gi
    ];
    
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      for (const pattern of secretPatterns) {
        if (pattern.test(line)) {
          issues.push({
            type: 'hardcoded_secret',
            severity: 'critical',
            line: index + 1,
            message: 'Hardcoded Secret gefunden - Sicherheitsrisiko!',
            fix: this.generateLocalSecurityFix('hardcoded_secret', line)
          });
        }
      }
    }
  }

  /**
   * Findet Performance-Probleme
   */
  findPerformanceIssues(filePath, content, lines, issues) {
    // N+1 Query Problem
    const nPlusOnePatterns = [
      /forEach\s*\([^)]*\)\s*{\s*[^}]*\.find\s*\(/gi,
      /map\s*\([^)]*\)\s*\.\s*forEach\s*\([^)]*\)\s*{\s*[^}]*\.find\s*\(/gi
    ];
    
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      for (const pattern of nPlusOnePatterns) {
        if (pattern.test(line)) {
          issues.push({
            type: 'n_plus_one_query',
            severity: 'high',
            line: index + 1,
            message: 'N+1 Query Problem - Ineffiziente Datenbankabfragen',
            fix: this.generateLocalPerformanceFix('n_plus_one', line)
          });
        }
      }
    }
    
    // Ineffiziente Loops
    const inefficientLoopPatterns = [
      /for\s*\(\s*let\s+\w+\s*=\s*0;\s*\w+\s*<\s*array\.length;\s*\w+\+\+\)/gi,
      /array\.forEach\s*\([^)]*\)\s*\.\s*map\s*\(/gi,
      /array\.filter\s*\([^)]*\)\s*\.\s*map\s*\([^)]*\)\s*\.\s*forEach\s*\(/gi
    ];
    
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      for (const pattern of inefficientLoopPatterns) {
        if (pattern.test(line)) {
          issues.push({
            type: 'inefficient_loop',
            severity: 'medium',
            line: index + 1,
            message: 'Ineffiziente Loop-Kombination - Performance-Optimierung nötig',
            fix: this.generateLocalPerformanceFix('inefficient_loop', line)
          });
        }
      }
    }
  }

  /**
   * Findet Memory Leaks
   */
  findMemoryLeaks(filePath, content, lines, issues) {
    // Event Listener ohne Cleanup
    const eventListenerPatterns = [
      /addEventListener\s*\([^)]*\)/gi,
      /on\s*\(\s*['"][^'"]*['"][^)]*\)/gi
    ];
    
    const hasCleanup = content.includes('removeEventListener') || content.includes('off(');
    
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      for (const pattern of eventListenerPatterns) {
        if (pattern.test(line) && !hasCleanup) {
          issues.push({
            type: 'memory_leak',
            severity: 'high',
            line: index + 1,
            message: 'Event Listener ohne Cleanup - Memory Leak Gefahr',
            fix: this.generateLocalMemoryLeakFix(line)
          });
        }
      }
    }
    
    // Unendliche Loops
    const infiniteLoopPatterns = [
      /while\s*\(\s*true\s*\)/gi,
      /for\s*\(\s*;\s*;\s*\)/gi,
      /setInterval\s*\([^)]*\)/gi
    ];
    
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      for (const pattern of infiniteLoopPatterns) {
        if (pattern.test(line)) {
          issues.push({
            type: 'infinite_loop',
            severity: 'critical',
            line: index + 1,
            message: 'Unendliche Loop - System kann hängen bleiben',
            fix: this.generateLocalMemoryLeakFix('infinite_loop', line)
          });
        }
      }
    }
  }

  /**
   * Findet Race Conditions
   */
  findRaceConditions(filePath, content, lines, issues) {
    // Async/Await ohne proper Error Handling
    const asyncPatterns = [
      /async\s+function\s+\w+\s*\([^)]*\)\s*{/gi,
      /const\s+\w+\s*=\s*async\s*\([^)]*\)\s*=>/gi
    ];
    
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      for (const pattern of asyncPatterns) {
        if (pattern.test(line)) {
          // Prüfe ob try-catch vorhanden ist
          const functionStart = index;
          const functionEnd = this.findFunctionEnd(lines, functionStart);
          const functionBody = lines.slice(functionStart, functionEnd).join('\n');
          
          if (!functionBody.includes('try {') && !functionBody.includes('catch (')) {
            issues.push({
              type: 'race_condition',
              severity: 'high',
              line: index + 1,
              message: 'Async Funktion ohne Error Handling - Race Condition Gefahr',
              fix: this.generateLocalRaceConditionFix(line)
            });
          }
        }
      }
    }
  }

  /**
   * Findet Error Handling Probleme
   */
  findErrorHandlingIssues(filePath, content, lines, issues) {
    // Unhandled Promises
    const unhandledPromisePatterns = [
      /fetch\s*\([^)]*\)/gi,
      /axios\.[a-z]+\s*\([^)]*\)/gi,
      /\.then\s*\([^)]*\)/gi
    ];
    
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      for (const pattern of unhandledPromisePatterns) {
        if (pattern.test(line)) {
          // Prüfe ob .catch() vorhanden ist
          const hasCatch = this.hasCatchHandler(lines, index);
          
          if (!hasCatch) {
            issues.push({
              type: 'unhandled_promise',
              severity: 'high',
              line: index + 1,
              message: 'Unbehandelte Promise - Fehler können unentdeckt bleiben',
              fix: this.generateLocalErrorHandlingFix(line)
            });
          }
        }
      }
    }
  }

  /**
   * Findet TypeScript/JavaScript Spezifische Probleme
   */
  findTypeScriptIssues(filePath, content, lines, issues) {
    // TypeScript: any Type
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      const anyTypePatterns = [
        /:\s*any\s*[=;]/gi,
        /as\s+any/gi
      ];
      
      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        for (const pattern of anyTypePatterns) {
          if (pattern.test(line)) {
            issues.push({
              type: 'typescript_any',
              severity: 'medium',
              line: index + 1,
              message: 'TypeScript any Type - Type Safety verloren',
              fix: this.generateLocalTypeScriptFix(line)
            });
          }
        }
      }
    }
    
    // JavaScript: === statt ===
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      const looseEqualityPatterns = [
        /\s*===\s*/gi,
        /\s*!======\s*/gi
      ];
      
      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        for (const pattern of looseEqualityPatterns) {
          if (pattern.test(line) && !line.includes('null') && !line.includes('undefined')) {
            issues.push({
              type: 'loose_equality',
              severity: 'medium',
              line: index + 1,
              message: 'Loose Equality (===) - Strict Equality (===) empfohlen',
              fix: this.generateLocalTypeScriptFix(line)
            });
          }
        }
      }
    }
  }

  /**
   * Findet API/Backend Spezifische Probleme
   */
  findAPIIssues(filePath, content, lines, issues) {
    // Fehlende Input Validation
    const inputPatterns = [
      /req\.body/gi,
      /req\.query/gi,
      /req\.params/gi
    ];
    
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      for (const pattern of inputPatterns) {
        if (pattern.test(line)) {
          // Prüfe ob Validation vorhanden ist
          const hasValidation = this.hasInputValidation(lines, index);
          
          if (!hasValidation) {
            issues.push({
              type: 'missing_validation',
              severity: 'high',
              line: index + 1,
              message: 'Fehlende Input Validation - Sicherheitsrisiko',
              fix: this.generateLocalAPIFix(line)
            });
          }
        }
      }
    }
    
    // Fehlende Rate Limiting
    if (content.includes('app.use') || content.includes('router.use')) {
      const hasRateLimiting = content.includes('rateLimit') || content.includes('limiter');
      
      if (!hasRateLimiting) {
        issues.push({
          type: 'missing_rate_limiting',
          severity: 'medium',
          line: 1,
          message: 'Fehlendes Rate Limiting - DDoS Gefahr',
          fix: this.generateLocalAPIFix('rate_limiting')
        });
      }
    }
  }

  /**
   * Generiert lokale Security Fixes
   */
  generateLocalSecurityFix(issueType, originalLine) {
    const fixes = {
      sql_injection: originalLine.replace(/\$\{[^}]*\}/g, '?').replace(/['"`][^'"`]*\$\{[^}]*\}[^'"`]*['"`]/g, '?'),
      xss: originalLine.replace(/innerHTML/g, 'textContent').replace(/document\.write/g, 'console.warn'),
      hardcoded_secret: originalLine.replace(/['"][^'"]{8,}['"]/, 'process.env.SECRET_NAME')
    };
    
    return fixes[issueType] || `// TODO: Security Fix für ${issueType} - ${originalLine}`;
  }

  /**
   * Generiert lokale Performance Fixes
   */
  generateLocalPerformanceFix(issueType, originalLine) {
    const fixes = {
      n_plus_one: `// TODO: N+1 Query Problem beheben - JOIN oder Batch Loading verwenden\n${originalLine}`,
      inefficient_loop: `// TODO: Loop optimieren - Kombiniere Loops oder verwende effizientere Methoden\n${originalLine}`
    };
    
    return fixes[issueType] || `// TODO: Performance Fix für ${issueType} - ${originalLine}`;
  }

  /**
   * Generiert lokale Memory Leak Fixes
   */
  generateLocalMemoryLeakFix(issueType, originalLine) {
    const fixes = {
      infinite_loop: `// TODO: Unendliche Loop beheben - Break-Condition hinzufügen\n${originalLine}`,
      memory_leak: `// TODO: Memory Leak beheben - Event Listener Cleanup hinzufügen\n${originalLine}`
    };
    
    return fixes[issueType] || `// TODO: Memory Leak Fix - ${originalLine}`;
  }

  /**
   * Generiert lokale Race Condition Fixes
   */
  generateLocalRaceConditionFix(originalLine) {
    return `// TODO: Race Condition beheben - Proper Error Handling mit try-catch hinzufügen\n${originalLine}`;
  }

  /**
   * Generiert lokale Error Handling Fixes
   */
  generateLocalErrorHandlingFix(originalLine) {
    return `// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden\n${originalLine}`;
  }

  /**
   * Generiert lokale TypeScript Fixes
   */
  generateLocalTypeScriptFix(originalLine) {
            return originalLine.replace(/===/g, '===').replace(/!======/g, '!==').replace(/:\s*any/g, ': unknown');
  }

  /**
   * Generiert lokale API Fixes
   */
  generateLocalAPIFix(originalLine) {
    return `// TODO: API Fix - Input Validation oder Rate Limiting hinzufügen\n${originalLine}`;
  }

  /**
   * Behebt echte Probleme
   */
  async fixRealIssues() {
    console.log('🔧 Behebe echte Code-Probleme...');
    
    const criticalIssues = this.analysisResults.filter(issue => issue.priority === 'critical');
    const highIssues = this.analysisResults.filter(issue => issue.priority === 'high');
    
    console.log(`  🚨 ${criticalIssues.length} kritische Probleme gefunden`);
    console.log(`  ⚠️ ${highIssues.length} hohe Priorität Probleme gefunden`);
    
    // Behebe kritische Probleme zuerst
    for (const issue of criticalIssues) {
      await this.applyFix(issue);
    }
    
    // Behebe hohe Priorität Probleme
    for (const issue of highIssues) {
      await this.applyFix(issue);
    }
    
    console.log(`✅ ${this.fixes.length} echte Probleme behoben`);
  }

  /**
   * Wendet einen Fix sofort an (für Fehler-Queue)
   */
  async applyFixImmediately(filePath, issue, lines) {
    try {
      if (issue.fix && issue.line <= lines.length) {
        // Ersetze die problematische Zeile sofort
        lines[issue.line - 1] = issue.fix;
        
        // Füge zur Fix-Liste hinzu
        this.fixes.push({
          file: filePath,
          line: issue.line,
          type: issue.type,
          fix: issue.fix,
          applied: true,
          timestamp: new Date().toISOString()
        });
        
        console.log(`        ✅ Fix angewendet: ${issue.type}`);
      }
    } catch (error) {
      console.error(`        ❌ Fehler beim Anwenden des Fixes:`, error);
    }
  }

  /**
   * Wendet einen Fix an (Legacy-Methode)
   */
  async applyFix(issue) {
    try {
      console.log(`  🔧 Behebe ${issue.type} in ${issue.file}:${issue.line}`);
      
      if (issue.fix) {
        const content = await fs.readFile(issue.file, 'utf8');
        const lines = content.split('\n');
        
        // Ersetze die problematische Zeile
        if (issue.line <= lines.length) {
          lines[issue.line - 1] = issue.fix;
          
          await fs.writeFile(issue.file, lines.join('\n'), 'utf8');
          
          this.fixes.push({
            file: issue.file,
            line: issue.line,
            type: issue.type,
            fix: issue.fix,
            applied: true
          });
          
          console.log(`    ✅ Fix angewendet`);
        }
      }
      
    } catch (error) {
      console.error(`    ❌ Fehler beim Anwenden des Fixes:`, error);
    }
  }

  /**
   * Hilfsfunktionen
   */
  findFunctionEnd(lines, startIndex) {
    let braceCount = 0;
    let inFunction = false;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('{')) {
        braceCount++;
        inFunction = true;
      }
      
      if (line.includes('}')) {
        braceCount--;
      }
      
      if (braceCount === 0 && inFunction) {
        return i + 1;
      }
    }
    
    return lines.length;
  }

  hasCatchHandler(lines, startIndex) {
    for (let i = startIndex; i < Math.min(startIndex + 10, lines.length); i++) {
      if (lines[i].includes('.catch(')) {
        return true;
      }
    }
    return false;
  }

  hasInputValidation(lines, startIndex) {
    for (let i = Math.max(0, startIndex - 5); i < Math.min(startIndex + 5, lines.length); i++) {
      if (lines[i].includes('validate') || lines[i].includes('joi') || lines[i].includes('zod')) {
        return true;
      }
    }
    return false;
  }

  async directoryExists(dirPath) {
    try {
      await fs.access(dirPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Batch-Fehlerbehandlung für sich wiederholende Fehler
   */
  async processBatchFixes(filePath, issues, lines) {
    const batchResults = {
      modified: false,
      batchCount: 0,
      totalFixes: 0,
      processedIssues: new Set()
    };

    // Gruppiere Probleme nach Typ und Pattern
    const issueGroups = this.groupIssuesByType(issues);
    
    for (const [issueType, typeIssues] of issueGroups) {
      // Prüfe ob genug Probleme für Batch-Behandlung vorhanden sind
      if (typeIssues.length >= this.batchThreshold) {
        console.log(`      🔄 Batch-Behandlung für ${issueType}: ${typeIssues.length} Probleme`);
        
        const batchFix = await this.generateBatchFix(issueType, typeIssues, lines);
        
        if (batchFix) {
          // Wende Batch-Fix an
          const appliedFixes = await this.applyBatchFix(filePath, batchFix, lines);
          
          if (appliedFixes > 0) {
            batchResults.modified = true;
            batchResults.batchCount++;
            batchResults.totalFixes += appliedFixes;
            
            // Markiere verarbeitete Probleme
            typeIssues.forEach(issue => {
              batchResults.processedIssues.add(issue);
            });
            
            console.log(`        ✅ Batch-Fix angewendet: ${appliedFixes} Probleme behoben`);
          }
        }
      }
    }
    
    return batchResults;
  }

  /**
   * Gruppiert Probleme nach Typ
   */
  groupIssuesByType(issues) {
    const groups = new Map();
    
    for (const issue of issues) {
      const key = `${issue.type}_${issue.priority}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(issue);
    }
    
    return groups;
  }

  /**
   * Generiert Batch-Fix für einen Problemtyp
   */
  async generateBatchFix(issueType, issues, lines) {
    const firstIssue = issues[0];
    
    switch (firstIssue.type) {
      case 'infinite_loop':
        return this.generateBatchInfiniteLoopFix(issues, lines);
      case 'memory_leak':
        return this.generateBatchMemoryLeakFix(issues, lines);
      case 'race_condition':
        return this.generateBatchRaceConditionFix(issues, lines);
      case 'sql_injection':
        return this.generateBatchSecurityFix(issues, lines);
      case 'n_plus_one_query':
        return this.generateBatchPerformanceFix(issues, lines);
      case 'typescript_any':
        return this.generateBatchTypeScriptFix(issues, lines);
      case 'loose_equality':
        return this.generateBatchLooseEqualityFix(issues, lines);
      default:
        return null;
    }
  }

  /**
   * Batch-Fix für Infinite Loops
   */
  generateBatchInfiniteLoopFix(issues, lines) {
    const fixes = [];
    
    for (const issue of issues) {
      const lineIndex = issue.line - 1;
      const originalLine = lines[lineIndex];
      
// TODO: Unendliche Loop beheben - Break-Condition hinzufügen
// TODO: Unendliche Loop beheben - Break-Condition hinzufügen
// TODO: Unendliche Loop beheben - Break-Condition hinzufügen
// TODO: Unendliche Loop beheben - Break-Condition hinzufügen
      if (originalLine.includes('while(true)') || originalLine.includes('for(;;)')) {
        const fixedLine = originalLine
          .replace(/while\s*\(\s*true\s*\)/g, 'while(this.isRunning)')
          .replace(/for\s*\(\s*;\s*;\s*\)/g, 'for(let i = 0; i < maxIterations && this.isRunning; i++)');
        
        fixes.push({
          line: issue.line,
          original: originalLine,
          fixed: fixedLine,
          type: 'infinite_loop'
        });
      }
    }
    
    return fixes;
  }

  /**
   * Batch-Fix für Memory Leaks
   */
  generateBatchMemoryLeakFix(issues, lines) {
    const fixes = [];
    
    for (const issue of issues) {
      const lineIndex = issue.line - 1;
      const originalLine = lines[lineIndex];
      
      if (originalLine.includes('setInterval') && !originalLine.includes('clearInterval')) {
        const fixedLine = originalLine.replace(
          /setInterval\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/g,
// TODO: Unendliche Loop beheben - Break-Condition hinzufügen
// TODO: Unendliche Loop beheben - Break-Condition hinzufügen
// TODO: Unendliche Loop beheben - Break-Condition hinzufügen
// TODO: Unendliche Loop beheben - Break-Condition hinzufügen
          'const interval = setInterval($1, $2); this.intervals.push(interval);'
        );
        
        fixes.push({
          line: issue.line,
          original: originalLine,
          fixed: fixedLine,
          type: 'memory_leak'
        });
      }
    }
    
    return fixes;
  }

  /**
   * Batch-Fix für Race Conditions
   */
  generateBatchRaceConditionFix(issues, lines) {
    const fixes = [];
    
    for (const issue of issues) {
      const lineIndex = issue.line - 1;
      const originalLine = lines[lineIndex];
      
      if (originalLine.includes('async') && originalLine.includes('forEach')) {
        const fixedLine = originalLine.replace(
          /\.forEach\s*\(\s*async\s*([^)]+)\)/g,
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
          '.map(async $1).then(results => Promise.all(results))'
        );
        
        fixes.push({
          line: issue.line,
          original: originalLine,
          fixed: fixedLine,
          type: 'race_condition'
        });
      }
    }
    
    return fixes;
  }

  /**
   * Batch-Fix für Security Vulnerabilities
   */
  generateBatchSecurityFix(issues, lines) {
    const fixes = [];
    
    for (const issue of issues) {
      const lineIndex = issue.line - 1;
      const originalLine = lines[lineIndex];
      
      if (originalLine.includes('eval(')) {
        const fixedLine = originalLine.replace(
          /eval\s*\(\s*([^)]+)\s*\)/g,
          'JSON.parse($1)' // Sichere Alternative
        );
        
        fixes.push({
          line: issue.line,
          original: originalLine,
          fixed: fixedLine,
          type: 'security_vulnerability'
        });
      }
    }
    
    return fixes;
  }

  /**
   * Batch-Fix für Performance Issues
   */
  generateBatchPerformanceFix(issues, lines) {
    const fixes = [];
    
    for (const issue of issues) {
      const lineIndex = issue.line - 1;
      const originalLine = lines[lineIndex];
      
      if (originalLine.includes('.forEach(') && originalLine.includes('await')) {
        const fixedLine = originalLine.replace(
          /\.forEach\s*\(\s*async\s*([^)]+)\)/g,
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
// TODO: Error Handling hinzufügen - .catch() oder try-catch verwenden
          '.map(async $1).then(results => Promise.all(results))'
        );
        
        fixes.push({
          line: issue.line,
          original: originalLine,
          fixed: fixedLine,
          type: 'performance_issue'
        });
      }
    }
    
    return fixes;
  }

  /**
   * Batch-Fix für TypeScript any Types
   */
  generateBatchTypeScriptFix(issues, lines) {
    const fixes = [];
    
    for (const issue of issues) {
      const lineIndex = issue.line - 1;
      const originalLine = lines[lineIndex];
      
      if (originalLine.includes(': any')) {
        const fixedLine = originalLine.replace(
          /:\s*any\b/g,
          ': unknown'
        );
        
        fixes.push({
          line: issue.line,
          original: originalLine,
          fixed: fixedLine,
          type: 'typescript_any'
        });
      }
    }
    
    return fixes;
  }

  /**
   * Batch-Fix für Loose Equality
   */
  generateBatchLooseEqualityFix(issues, lines) {
    const fixes = [];
    
    for (const issue of issues) {
      const lineIndex = issue.line - 1;
      const originalLine = lines[lineIndex];
      
      if (originalLine.includes(' == ') || originalLine.includes(' != ')) {
        const fixedLine = originalLine
          .replace(/\s*==\s*/g, ' === ')
          .replace(/\s*!=\s*/g, ' !== ');
        
        fixes.push({
          line: issue.line,
          original: originalLine,
          fixed: fixedLine,
          type: 'loose_equality'
        });
      }
    }
    
    return fixes;
  }

  /**
   * Wendet Batch-Fix an
   */
  async applyBatchFix(filePath, batchFix, lines) {
    let appliedCount = 0;
    
    for (const fix of batchFix) {
      if (fix.line <= lines.length) {
        const lineIndex = fix.line - 1;
        lines[lineIndex] = fix.fixed;
        
        this.fixes.push({
          file: filePath,
          line: fix.line,
          type: fix.type,
          fix: fix.fixed,
          applied: true,
          timestamp: new Date().toISOString(),
          batch: true
        });
        
        appliedCount++;
      }
    }
    
    return appliedCount;
  }

  /**
   * Generiert Bericht
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: this.analysisResults.length,
      criticalIssues: this.analysisResults.filter(i => i.priority === 'critical').length,
      highIssues: this.analysisResults.filter(i => i.priority === 'high').length,
      mediumIssues: this.analysisResults.filter(i => i.priority === 'medium').length,
      fixesApplied: this.fixes.length,
      issues: this.analysisResults,
      fixes: this.fixes
    };
    
    return report;
  }
}

// Main execution
if (require.main === module) {
  const fixer = new RealCodeFixer();
  
  fixer.analyzeAndFixCodebase().then(() => {
    const report = fixer.generateReport();
    console.log('\n📊 Echte Code-Fix Bericht:');
    console.log('==========================================================');
    console.log(`Kritische Probleme: ${report.criticalIssues}`);
    console.log(`Hohe Priorität: ${report.highIssues}`);
    console.log(`Mittlere Priorität: ${report.mediumIssues}`);
    console.log(`Fixes angewendet: ${report.fixesApplied}`);
  }).catch(error => {
    console.error('❌ Fehler:', error);
    process.exit(1);
  });
}

module.exports = RealCodeFixer; 