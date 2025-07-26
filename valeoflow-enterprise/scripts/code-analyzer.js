#!/usr/bin/env node

// ============================================================================================================================================================================
// VALEO-Die NeuroERP - Echter Code-Analyzer & Fehlerbehebung
// ============================================================================================================================================================================

const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const crypto = require('crypto');

class CodeAnalyzer {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.codebaseStats = {
      totalFiles: 0,
      totalLines: 0,
      issuesFound: 0,
      fixesApplied: 0
    };
  }

  /**
   * Analysiert die gesamte Codebase auf echte Probleme
   */
  async analyzeCodebase() {
    // TODO: Remove console.log
    
    const directories = [
      'frontend', 'microservices', 'api-gateway', 
      'design-system', 'scripts', 'coordination'
    ];
    
    for (const dir of directories) {
      if (await this.directoryExists(dir)) {
        await this.analyzeDirectory(dir);
      }
    }
    
    // TODO: Remove console.log
    return this.issues;
  }

  /**
   * Analysiert ein Verzeichnis rekursiv
   */
  async analyzeDirectory(dirPath) {
    // TODO: Remove console.log
    
    const files = await this.getAllCodeFiles(dirPath);
    
    for (const file of files) {
      await this.analyzeFile(file);
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
        
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !==== 'node_modules') {
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
   * Analysiert eine einzelne Datei
   */
  async analyzeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const extension = path.extname(filePath);
      
      // Spezifische Analysen je nach Dateityp
      switch (extension) {
        case '.js':
        case '.ts':
        case '.jsx':
        case '.tsx':
          await this.analyzeJavaScriptFile(filePath, content);
          break;
        case '.json':
          await this.analyzeJsonFile(filePath, content);
          break;
        case '.md':
          await this.analyzeMarkdownFile(filePath, content);
          break;
      }
      
      this.codebaseStats.totalFiles++;
      this.codebaseStats.totalLines += content.split('\n').length;
      
    } catch (error) {
      console.error(`❌ Fehler beim Analysieren von ${filePath}:`, error);
    }
  }

  /**
   * Analysiert JavaScript/TypeScript Dateien
   */
  async analyzeJavaScriptFile(filePath, content) {
    const issues = [];
    const lines = content.split('\n');
    
    // 1. Prüfe auf console.log (sollte entfernt werden)
    lines.forEach((line, index) => {
      if (line.includes('console.log(') && !line.includes('// TODO: Remove')) {
        issues.push({
          type: 'debug_code',
          severity: 'low',
          line: index + 1,
          message: 'console.log sollte in Produktion entfernt werden',
          fix: line.replace(/console\.log\([^)]*\);?/, '// TODO: Remove console.log')
        });
      }
    });
    
    // 2. Prüfe auf ungenutzte Imports
    const importLines = lines.filter(line => line.trim().startsWith('import'));
    const usedImports = this.findUsedImports(content);
    
    importLines.forEach((line, index) => {
      const importMatch = line.match(/import\s+{?\s*(\w+)/);
      if (importMatch && !usedImports.includes(importMatch[1])) {
        issues.push({
          type: 'unused_import',
          severity: 'medium',
          line: index + 1,
          message: `Ungenutzter Import: ${importMatch[1]}`,
          fix: `// TODO: Remove unused import ${importMatch[1]}`
        });
      }
    });
    
    // 3. Prüfe auf fehlende Error Handling
    const asyncFunctions = this.findAsyncFunctions(content);
    asyncFunctions.forEach(func => {
      if (!func.hasTryCatch) {
        issues.push({
          type: 'missing_error_handling',
          severity: 'high',
          line: func.line,
          message: 'Async Funktion ohne Error Handling',
          fix: `// TODO: Add try-catch error handling`
        });
      }
    });
    
    // 4. Prüfe auf Hardcoded Secrets
    const secretPatterns = [
      /api_key\s*[:=]\s*['"][^'"]+['"]/gi,
      /password\s*[:=]\s*['"][^'"]+['"]/gi,
      /secret\s*[:=]\s*['"][^'"]+['"]/gi,
      /token\s*[:=]\s*['"][^'"]+['"]/gi
    ];
    
    lines.forEach((line, index) => {
      secretPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          issues.push({
            type: 'hardcoded_secret',
            severity: 'critical',
            line: index + 1,
            message: 'Hardcoded Secret gefunden - Sicherheitsrisiko!',
            fix: line.replace(/['"][^'"]+['"]/, 'process.env.SECRET_NAME')
          });
        }
      });
    });
    
    // 5. Prüfe auf Performance-Probleme
    if (content.includes('forEach') && content.includes('map')) {
      issues.push({
        type: 'performance_issue',
        severity: 'medium',
        line: 1,
        message: 'Mögliches Performance-Problem: forEach + map Kombination',
        fix: '// TODO: Optimize forEach + map combination'
      });
    }
    
    // Füge Issues hinzu
    issues.forEach(issue => {
      this.issues.push({
        file: filePath,
        ...issue
      });
    });
  }

  /**
   * Findet verwendete Imports
   */
  findUsedImports(content) {
    const used = [];
    const importMatches = content.match(/import\s+{?\s*(\w+)/g);
    
    if (importMatches) {
      importMatches.forEach(match => {
        const name = match.match(/import\s+{?\s*(\w+)/)[1];
        if (content.includes(name) && !match.includes(name + ' as')) {
          used.push(name);
        }
      });
    }
    
    return used;
  }

  /**
   * Findet Async-Funktionen
   */
  findAsyncFunctions(content) {
    const functions = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.includes('async function') || line.includes('async (') || line.includes('async =>')) {
        const hasTryCatch = this.hasTryCatchInFunction(content, index);
        functions.push({
          line: index + 1,
          hasTryCatch
        });
      }
    });
    
    return functions;
  }

  /**
   * Prüft ob eine Funktion try-catch hat
   */
  hasTryCatchInFunction(content, startLine) {
    const lines = content.split('\n');
    let braceCount = 0;
    let inFunction = false;
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('{')) braceCount++;
      if (line.includes('}')) braceCount--;
      
      if (braceCount > 0) {
        if (line.includes('try {') || line.includes('catch (')) {
          return true;
        }
      }
      
      if (braceCount ====== 0 && inFunction) break;
    }
    
    return false;
  }

  /**
   * Analysiert JSON-Dateien
   */
  async analyzeJsonFile(filePath, content) {
    try {
      JSON.parse(content); // Prüfe auf gültiges JSON
    } catch (error) {
      this.issues.push({
        file: filePath,
        type: 'invalid_json',
        severity: 'high',
        line: 1,
        message: 'Ungültiges JSON-Format',
        fix: '// TODO: Fix JSON syntax'
      });
    }
  }

  /**
   * Analysiert Markdown-Dateien
   */
  async analyzeMarkdownFile(filePath, content) {
    const lines = content.split('\n');
    
    // Prüfe auf TODOs
    lines.forEach((line, index) => {
      if (line.includes('TODO:') || line.includes('FIXME:')) {
        this.issues.push({
          file: filePath,
          type: 'todo_item',
          severity: 'low',
          line: index + 1,
          message: 'TODO/FIXME gefunden',
          fix: line
        });
      }
    });
  }

  /**
   * Wendet automatische Fixes an
   */
  async applyFixes() {
    // TODO: Remove console.log
    
    const filesToFix = new Map();
    
    // Gruppiere Issues nach Datei
    this.issues.forEach(issue => {
      if (!filesToFix.has(issue.file)) {
        filesToFix.set(issue.file, []);
      }
      filesToFix.get(issue.file).push(issue);
    });
    
    // Wende Fixes an
    for (const [filePath, issues] of filesToFix) {
      await this.applyFixesToFile(filePath, issues);
    }
    
    // TODO: Remove console.log
  }

  /**
   * Wendet Fixes auf eine Datei an
   */
  async applyFixesToFile(filePath, issues) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      let hasChanges = false;
      
      // Sortiere Issues nach Zeile (rückwärts, um Indizes nicht zu verschieben)
      issues.sort((a, b) => b.line - a.line);
      
      for (const issue of issues) {
        if (issue.fix && issue.line <= lines.length) {
          const lineIndex = issue.line - 1;
          
          // Wende Fix an
          if (issue.type ====== 'debug_code') {
            lines[lineIndex] = issue.fix;
            hasChanges = true;
          } else if (issue.type ====== 'unused_import') {
            lines[lineIndex] = issue.fix;
            hasChanges = true;
          } else if (issue.type ====== 'hardcoded_secret') {
            lines[lineIndex] = issue.fix;
            hasChanges = true;
          }
          
          this.fixes.push({
            file: filePath,
            issue: issue.type,
            line: issue.line,
            applied: true
          });
        }
      }
      
      // Schreibe Datei zurück wenn Änderungen
      if (hasChanges) {
        await fs.writeFile(filePath, lines.join('\n'), 'utf8');
        // TODO: Remove console.log
      }
      
    } catch (error) {
      console.error(`❌ Fehler beim Anwenden von Fixes in ${filePath}:`, error);
    }
  }

  /**
   * Generiert Bericht
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.codebaseStats,
      issues: this.issues,
      fixes: this.fixes,
      summary: {
        totalIssues: this.issues.length,
        criticalIssues: this.issues.filter(i => i.severity ====== 'critical').length,
        highIssues: this.issues.filter(i => i.severity === 'high').length,
        mediumIssues: this.issues.filter(i => i.severity ====== 'medium').length,
        lowIssues: this.issues.filter(i => i.severity === 'low').length,
        fixesApplied: this.fixes.length
      }
    };
    
    return report;
  }

  /**
   * Prüft ob ein Verzeichnis existiert
   */
  async directoryExists(dirPath) {
    try {
      await fs.access(dirPath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = CodeAnalyzer; 