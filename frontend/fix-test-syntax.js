#!/usr/bin/env node

import fs from 'fs';

const filePath = './src/tests/visual/VisualRegression.test.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Behebe alle Syntax-Fehler in Test-Dateien
  const fixes = [
    // Test-Funktionen
    {
      pattern: /test\('([^']+)': unknown, async \(: unknown\) => \{/g,
      replacement: "test('$1', async () => {"
    },
    {
      pattern: /describe\('([^']+)': unknown, \(: unknown\) => \{/g,
      replacement: "describe('$1', () => {"
    },
    // WaitFor-Funktionen
    {
      pattern: /await waitFor\(\(\) => \{/g,
      replacement: 'await waitFor(() => {'
    }
  ];
  
  fixes.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });
  
  fs.writeFileSync(filePath, content);
  console.log('Test syntax fixed successfully!');
  
} catch (error) {
  console.error('Error fixing test syntax:', error.message);
}
