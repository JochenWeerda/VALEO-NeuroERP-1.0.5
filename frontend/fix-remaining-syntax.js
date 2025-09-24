#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function fixSyntaxErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Behebe alle verbleibenden Syntax-Fehler
    const fixes = [
      // Event Listener Syntax-Fehler
      {
        pattern: /addEventListener\('([^']+)': unknown, \(: unknown\) => \{/g,
        replacement: "addEventListener('$1', () => {"
      },
      // setTimeout Syntax-Fehler
      {
        pattern: /setTimeout\(\(: unknown\) => \{/g,
        replacement: 'setTimeout(() => {'
      },
      // Function Parameter Syntax-Fehler
      {
        pattern: /\(([^)]+): unknown\) => \{/g,
        replacement: '($1) => {'
      },
      // Object Property Syntax-Fehler
      {
        pattern: /(\w+): unknown,/g,
        replacement: '$1,'
      },
      // Array Parameter Syntax-Fehler
      {
        pattern: /Object\.entries\(([^)]+)\)\.forEach\(\(\[([^,]+): unknown, ([^)]+)\]: unknown\) => \{/g,
        replacement: 'Object.entries($1).forEach(([$2, $3]) => {'
      },
      // Test Function Parameter Syntax-Fehler
      {
        pattern: /async \(timeout = (\d+): unknown\) => \{/g,
        replacement: 'async (timeout = $1) => {'
      },
      // Interface Property Syntax-Fehler
      {
        pattern: /(\w+): unknown;/g,
        replacement: '$1: unknown;'
      },
      // Regex Pattern Syntax-Fehler (escape problematic characters)
      {
        pattern: /\/\*\)/g,
        replacement: '/\\*)'
      },
      // Object Method Syntax-Fehler
      {
        pattern: /(\w+): \(([^)]+): unknown\) => \{/g,
        replacement: '$1: ($2) => {'
      },
      // IntersectionObserver Syntax-Fehler
      {
        pattern: /new IntersectionObserver\(\(entries: unknown\) => \{/g,
        replacement: 'new IntersectionObserver((entries) => {'
      },
      // beforeAll/afterAll/beforeEach/afterEach Syntax-Fehler
      {
        pattern: /(beforeAll|afterAll|beforeEach|afterEach)\(\(: unknown\) => \{/g,
        replacement: '$1(() => {'
      },
      // Object Destructuring Syntax-Fehler
      {
        pattern: /const \{ ([^}]+): unknown \} = /g,
        replacement: 'const { $1 } = '
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
      console.log(`Fixed syntax errors: ${filePath}`);
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
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixSyntaxErrors(filePath);
    }
  });
}

console.log('Starting to fix remaining syntax errors...');
walkDirectory('./src');
console.log('Done fixing syntax errors!');
