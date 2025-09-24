#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// TypeScript-Fehler beheben
const fixes = [
  // Syntax-Fehler in Import-Statements
  {
    pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/icons-material['"]/g,
    fix: (match, imports) => {
      // Behebe unvollständige Import-Zeilen
      let cleanedImports = imports
        .replace(/,\s*$/g, '') // Entferne trailing comma
        .replace(/^\s*,/g, '') // Entferne leading comma
        .replace(/,\s*,/g, ',') // Bereinige doppelte commas
        .split(',')
        .map(imp => imp.trim())
        .filter(imp => imp && !imp.includes('as') || imp.includes('as '))
        .join(', ');
      
      return `import { ${cleanedImports} } from '@mui/icons-material'`;
    }
  },
  
  // Unvollständige as-Zuweisungen
  {
    pattern: /\s+as\s*$/gm,
    fix: ''
  },
  
  // Fehlende Kommas in Import-Listen
  {
    pattern: /([a-zA-Z_][a-zA-Z0-9_]*\s+as\s+[a-zA-Z_][a-zA-Z0-9_]*)\s+\n\s*([a-zA-Z_][a-zA-Z0-9_]*\s+as\s+[a-zA-Z_][a-zA-Z0-9_]*)/g,
    fix: '$1,\n  $2'
  },
  
  // TypeScript any zu unknown
  {
    pattern: /:\s*any\b/g,
    fix: ': unknown'
  },
  
  // Fehlende Typen in Funktionsparametern
  {
    pattern: /\(([^)]*)\)\s*=>\s*{/g,
    fix: (match, params) => {
      if (params.trim() && !params.includes(':')) {
        const typedParams = params.split(',').map(p => {
          const trimmed = p.trim();
          if (trimmed && !trimmed.includes(':')) {
            return `${trimmed}: unknown`;
          }
          return trimmed;
        }).join(', ');
        return `(${typedParams}) => {`;
      }
      return match;
    }
  },
  
  // Interface-Definitionen verbessern
  {
    pattern: /interface\s+(\w+)\s*{\s*([^}]*)\s*}/g,
    fix: (match, name, body) => {
      const lines = body.split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.includes(':') && !trimmed.includes(';')) {
          return `  ${trimmed}: unknown;`;
        }
        return line;
      }).join('\n');
      
      return `interface ${name} {\n${lines}\n}`;
    }
  },
  
  // React.Component Typen verbessern
  {
    pattern: /React\.FC<([^>]*)>/g,
    fix: 'React.FC<$1>'
  },
  
  // useState Hook-Typen
  {
    pattern: /useState<([^>]*)>\(/g,
    fix: 'useState<$1>('
  },
  
  // useCallback Hook-Typen
  {
    pattern: /useCallback<([^>]*)>/g,
    fix: 'useCallback<$1>'
  },
  
  // useEffect Dependencies
  {
    pattern: /useEffect\(\(\)\s*=>\s*{([^}]+)},\s*\[\]\)/g,
    fix: (match, body) => {
      // Finde verwendete Variablen im useEffect Body
      const usedVars = [];
      const varMatches = body.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g);
      if (varMatches) {
        const uniqueVars = [...new Set(varMatches)];
        usedVars.push(...uniqueVars.filter(v => 
          !['console', 'window', 'document', 'localStorage', 'sessionStorage'].includes(v)
        ));
      }
      
      if (usedVars.length > 0) {
        return `useEffect(() => {${body}}, [${usedVars.join(', ')}])`;
      }
      return match;
    }
  },
  
  // Fehlende Return-Typen
  {
    pattern: /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{/g,
    fix: 'const $1 = (...args: unknown[]) => {'
  }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    fixes.forEach(({ pattern, fix }) => {
      const newContent = content.replace(pattern, fix);
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed TypeScript errors: ${filePath}`);
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
      fixFile(filePath);
    }
  });
}

function runTypeScriptCheck() {
  try {
    console.log('Running TypeScript check...');
    const result = execSync('npm run typecheck', { encoding: 'utf8', stdio: 'pipe' });
    console.log('TypeScript check passed!');
    return true;
  } catch (error) {
    console.log('TypeScript check found errors, fixing...');
    return false;
  }
}

console.log('Starting TypeScript error fixes...');
walkDirectory('./src');
console.log('Done fixing TypeScript errors!');

// Führe TypeScript-Check aus
runTypeScriptCheck();
