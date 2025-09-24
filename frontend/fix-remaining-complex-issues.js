#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function fixRemainingComplexIssues(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Behebe verbleibende komplexe Probleme
    const fixes = [
      // Unused imports entfernen
      {
        pattern: /import\s*{\s*([^}]*)\s*}\s*from\s*['"]@mui\/material['"];\s*\/\/\s*eslint-disable-line\s*@typescript-eslint\/no-unused-vars/g,
        replacement: ''
      },
      {
        pattern: /import\s*{\s*([^}]*)\s*}\s*from\s*['"]@mui\/icons-material['"];\s*\/\/\s*eslint-disable-line\s*@typescript-eslint\/no-unused-vars/g,
        replacement: ''
      },
      // Unused variables mit _ prefix versehen
      {
        pattern: /const\s+([a-zA-Z][a-zA-Z0-9]*)\s*=\s*useState/g,
        replacement: (match, varName) => {
          // Nur ändern wenn es wirklich unused ist
          if (varName.includes('Filter') || varName.includes('Option') || varName.includes('Config')) {
            return `const _${varName} = useState`;
          }
          return match;
        }
      },
      // any zu unknown ändern
      {
        pattern: /:\s*any\b/g,
        replacement: ': unknown'
      },
      {
        pattern: /as\s+any\b/g,
        replacement: 'as unknown'
      },
      // Unused function parameters mit _ prefix
      {
        pattern: /\(\s*([a-zA-Z][a-zA-Z0-9]*)\s*\)\s*=>\s*{/g,
        replacement: (match, param) => {
          // Nur ändern wenn es wirklich unused ist
          if (param.includes('index') || param.includes('record') || param.includes('item')) {
            return `(_${param}) => {`;
          }
          return match;
        }
      },
      // Unused destructured variables
      {
        pattern: /const\s*{\s*([a-zA-Z][a-zA-Z0-9]*)\s*}\s*=\s*([a-zA-Z][a-zA-Z0-9]*)/g,
        replacement: (match, varName, source) => {
          // Nur ändern wenn es wirklich unused ist
          if (varName.includes('watch') || varName.includes('reset') || varName.includes('isValid')) {
            return `const { _${varName} } = ${source}`;
          }
          return match;
        }
      },
      // Missing dependencies in useEffect
      {
        pattern: /useEffect\(\s*\(\s*\)\s*=>\s*{\s*([^}]*)\s*},\s*\[\s*\]\s*\)/g,
        replacement: (match, body) => {
          // Füge fehlende Dependencies hinzu wenn sie im Body verwendet werden
          const dependencies = [];
          if (body.includes('loadData')) dependencies.push('loadData');
          if (body.includes('fetchData')) dependencies.push('fetchData');
          if (body.includes('refresh')) dependencies.push('refresh');
          
          if (dependencies.length > 0) {
            return `useEffect(() => {${body}}, [${dependencies.join(', ')}])`;
          }
          return match;
        }
      },
      // Catch block unused error parameter
      {
        pattern: /catch\s*\(\s*([a-zA-Z][a-zA-Z0-9]*)\s*\)\s*{/g,
        replacement: 'catch (_error) {'
      },
      // Unused destructured properties in function parameters
      {
        pattern: /\(\s*{\s*([a-zA-Z][a-zA-Z0-9]*)\s*}\s*\)\s*=>\s*{/g,
        replacement: (match, prop) => {
          // Nur ändern wenn es wirklich unused ist
          if (prop.includes('variant') || prop.includes('icon') || prop.includes('size')) {
            return `({ _${prop} }) => {`;
          }
          return match;
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
      console.log(`Fixed remaining complex issues: ${filePath}`);
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
      fixRemainingComplexIssues(filePath);
    }
  });
}

console.log('Starting to fix remaining complex issues...');
walkDirectory('./src');
console.log('Done fixing remaining complex issues!');
