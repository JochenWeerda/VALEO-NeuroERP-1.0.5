#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function fixTestFiles(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Behebe Test-Funktionen mit falscher Syntax
    const fixes = [
      // Test-Funktionen mit falschen Parametern
      {
        pattern: /it\('([^']+)': unknown, \(\) => \{/g,
        replacement: "it('$1', () => {"
      },
      {
        pattern: /it\('([^']+)': unknown, async \(\) => \{/g,
        replacement: "it('$1', async () => {"
      },
      {
        pattern: /describe\('([^']+)': unknown, \(\) => \{/g,
        replacement: "describe('$1', () => {"
      },
      {
        pattern: /test\('([^']+)': unknown, \(\) => \{/g,
        replacement: "test('$1', () => {"
      },
      {
        pattern: /test\('([^']+)': unknown, async \(\) => \{/g,
        replacement: "test('$1', async () => {"
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
      console.log(`Fixed test file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function walkTestDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkTestDirectory(filePath);
    } else if (file.endsWith('.test.tsx') || file.endsWith('.test.ts')) {
      fixTestFiles(filePath);
    }
  });
}

console.log('Starting to fix test files...');
walkTestDirectory('./src');
console.log('Done fixing test files!');
