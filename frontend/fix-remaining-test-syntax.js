#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function fixRemainingTestSyntax(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Behebe verbleibende Test-Syntax-Fehler
    const fixes = [
      // Spezifische Test-Funktionen mit falschen Parametern
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
      },
      // Weitere spezifische Fälle
      {
        pattern: /it\('([^']+)': unknown,\s*\(\) => \{/g,
        replacement: "it('$1', () => {"
      },
      {
        pattern: /it\('([^']+)': unknown,\s*async \(\) => \{/g,
        replacement: "it('$1', async () => {"
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
      console.log(`Fixed remaining test syntax: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Behebe spezifische Dateien
const specificFiles = [
  'src/components/__tests__/Input.test.tsx',
  'src/components/__tests__/Layout.test.tsx',
  'src/components/__tests__/Modal.test.tsx'
];

specificFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    fixRemainingTestSyntax(fullPath);
  }
});

console.log('Done fixing remaining test syntax!');
