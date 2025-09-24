#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function fixTestFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Behebe alle Test-Syntax-Fehler
    const fixes = [
      // Test-Funktionen mit Parametern
      {
        pattern: /test\('([^']+)': unknown, async \(: unknown\) => \{/g,
        replacement: "test('$1', async () => {"
      },
      {
        pattern: /test\('([^']+)': unknown, \(: unknown\) => \{/g,
        replacement: "test('$1', () => {"
      },
      // Describe-Funktionen
      {
        pattern: /describe\('([^']+)': unknown, \(: unknown\) => \{/g,
        replacement: "describe('$1', () => {"
      },
      // beforeEach/afterEach
      {
        pattern: /beforeEach\(\(: unknown\) => \{/g,
        replacement: 'beforeEach(() => {'
      },
      {
        pattern: /afterEach\(\(: unknown\) => \{/g,
        replacement: 'afterEach(() => {'
      },
      // WaitFor-Funktionen
      {
        pattern: /await waitFor\(\(\) => \{/g,
        replacement: 'await waitFor(() => {'
      },
      // Arrow-Funktionen mit unbekannten Parametern
      {
        pattern: /\(: unknown\) => \{/g,
        replacement: '() => {'
      },
      // Array-Destructuring-Fehler
      {
        pattern: /expect\(\[(\d+), (\d+)\]\)\.toContain\(([^)]+)\)/g,
        replacement: 'expect([$1, $2]).toContain($3)'
      }
    ];
    
    fixes.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath);
    } else if (file.endsWith('.test.tsx') || file.endsWith('.test.ts')) {
      fixTestFile(filePath);
    }
  });
}

console.log('Starting to fix all test syntax errors...');
walkDirectory('./src');
console.log('Done fixing test syntax errors!');
