#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function fixComplexParsingErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Behebe komplexe Parsing-Fehler
    const fixes = [
      // Doppelte Kommas in Import-Statements
      {
        pattern: /import\s*{\s*([^}]*),,\s*([^}]*)\s*}\s*from\s*['"]@mui\/material['"]/g,
        replacement: (match, before, after) => {
          const cleanBefore = before.replace(/,$/, '').trim();
          const cleanAfter = after.trim();
          return `import { ${cleanBefore}, ${cleanAfter} } from '@mui/material'`;
        }
      },
      // Doppelte Kommas in Icon-Imports
      {
        pattern: /import\s*{\s*([^}]*),,\s*([^}]*)\s*}\s*from\s*['"]@mui\/icons-material['"]/g,
        replacement: (match, before, after) => {
          const cleanBefore = before.replace(/,$/, '').trim();
          const cleanAfter = after.trim();
          return `import { ${cleanBefore}, ${cleanAfter} } from '@mui/icons-material'`;
        }
      },
      // Interface-Definitionen mit falschen Kommas
      {
        pattern: /interface\s+(\w+)\s*{\s*([^}]*),,\s*([^}]*)\s*}/g,
        replacement: (match, interfaceName, before, after) => {
          const cleanBefore = before.replace(/,$/, '').trim();
          const cleanAfter = after.trim();
          return `interface ${interfaceName} {\n  ${cleanBefore}\n  ${cleanAfter}\n}`;
        }
      },
      // Funktionsparameter mit falschen Kommas
      {
        pattern: /\(\s*([^)]*),,\s*([^)]*)\s*\)/g,
        replacement: (match, before, after) => {
          const cleanBefore = before.replace(/,$/, '').trim();
          const cleanAfter = after.trim();
          return `(${cleanBefore}, ${cleanAfter})`;
        }
      },
      // Durcheinander geratene Icon-Imports bereinigen
      {
        pattern: /import\s*{\s*([A-Za-z,\s]+[A-Za-z])\s*}\s*from\s*['"]@mui\/icons-material['"]/g,
        replacement: (match, imports) => {
          // Entferne einzelne Buchstaben und bereinige die Liste
          const cleanImports = imports
            .split(',')
            .map(imp => imp.trim())
            .filter(imp => imp.length > 1 && !/^[A-Z]$/.test(imp))
            .join(', ');
          
          return `import { ${cleanImports} } from '@mui/icons-material'`;
        }
      },
      // Parameter-Destructuring mit falschen Kommas
      {
        pattern: /=\s*\(\s*{\s*([^}]*),,\s*([^}]*)\s*}\s*\)/g,
        replacement: (match, before, after) => {
          const cleanBefore = before.replace(/,$/, '').trim();
          const cleanAfter = after.trim();
          return `= ({ ${cleanBefore}, ${cleanAfter} })`;
        }
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
      console.log(`Fixed complex parsing errors: ${filePath}`);
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
      fixComplexParsingErrors(filePath);
    }
  });
}

console.log('Starting to fix complex parsing errors...');
walkDirectory('./src');
console.log('Done fixing complex parsing errors!');
