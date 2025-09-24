#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function fixImportSyntax(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Behebe Import-Syntax-Fehler
    const fixes = [
      // Mehrzeilige Imports reparieren
      {
        pattern: /import\s*{\s*\n\s*([^}]+)\s*\n\s*}\s*from\s*['"]@mui\/icons-material['"]/gs,
        replacement: (match, imports) => {
          // Bereinige die Import-Liste
          const cleanImports = imports
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.includes('as'))
            .map(line => line.replace(/,\s*$/, ''))
            .join(', ');
          
          return `import { ${cleanImports} } from '@mui/icons-material'`;
        }
      },
      // Einzelne Icon-Imports reparieren
      {
        pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/icons-material['"]/g,
        replacement: (match, imports) => {
          // Entferne ungültige Zeilen und repariere die Struktur
          const lines = imports.split('\n').map(line => line.trim());
          const validImports = lines
            .filter(line => line && (line.includes('as') || line.match(/^[A-Z]/)))
            .map(line => line.replace(/,\s*$/, ''))
            .join(', ');
          
          return `import { ${validImports} } from '@mui/icons-material'`;
        }
      },
      // Funktion Parameter Syntax-Fehler
      {
        pattern: /(\w+): unknown,/g,
        replacement: '$1,'
      },
      // Regex Pattern Syntax-Fehler
      {
        pattern: /\/\*\)/g,
        replacement: '/\\*)'
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
      console.log(`Fixed import syntax: ${filePath}`);
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
      fixImportSyntax(filePath);
    }
  });
}

console.log('Starting to fix import syntax errors...');
walkDirectory('./src');
console.log('Done fixing import syntax errors!');
