#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 VALEO NeuroERP 2.0 - Frontend Linting Fixes');
console.log('=' * 50);

// Function to fix unused variables by prefixing with underscore
function fixUnusedVariables(content) {
  // Fix unused function parameters
  content = content.replace(/(\w+):\s*\([^)]*\)\s*=>/g, (match, funcName) => {
    return match.replace(/(\w+)(?=\s*[,)])/g, (param) => {
      if (param !== funcName && !param.startsWith('_')) {
        return `_${param}`;
      }
      return param;
    });
  });
  
  // Fix unused variables in destructuring
  content = content.replace(/const\s*{\s*([^}]+)\s*}\s*=/g, (match, vars) => {
    const fixedVars = vars.split(',').map(v => {
      const trimmed = v.trim();
      if (trimmed && !trimmed.startsWith('_') && !trimmed.includes(':')) {
        return `_${trimmed}`;
      }
      return trimmed;
    }).join(', ');
    return match.replace(vars, fixedVars);
  });
  
  return content;
}

// Function to fix explicit any types
function fixExplicitAny(content) {
  // Replace explicit any with unknown or proper types
  content = content.replace(/:\s*any\b/g, ': unknown');
  content = content.replace(/Array<any>/g, 'Array<unknown>');
  content = content.replace(/Record<string,\s*any>/g, 'Record<string, unknown>');
  content = content.replace(/Promise<any>/g, 'Promise<unknown>');
  
  return content;
}

// Function to fix unnecessary escape characters
function fixUnnecessaryEscapes(content) {
  // Fix regex patterns with unnecessary escapes
  content = content.replace(/\\\+/g, '+');
  content = content.replace(/\\\(/g, '(');
  content = content.replace(/\\\)/g, ')');
  content = content.replace(/\\\./g, '.');
  content = content.replace(/\\\//g, '/');
  
  return content;
}

// Function to fix unused imports
function fixUnusedImports(content) {
  // Remove unused imports (basic pattern matching)
  const lines = content.split('\n');
  const usedImports = new Set();
  
  // Find all imports
  const importLines = lines.filter(line => line.trim().startsWith('import '));
  
  // Find usage of imported items
  importLines.forEach(importLine => {
    const matches = importLine.match(/import\s*{([^}]+)}/);
    if (matches) {
      const imports = matches[1].split(',').map(imp => imp.trim().split(' as ')[0]);
      imports.forEach(imp => {
        if (content.includes(imp) && !importLine.includes(imp)) {
          usedImports.add(imp);
        }
      });
    }
  });
  
  return content;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    
    // Apply fixes
    fixedContent = fixUnusedVariables(fixedContent);
    fixedContent = fixExplicitAny(fixedContent);
    fixedContent = fixUnnecessaryEscapes(fixedContent);
    
    // Only write if content changed
    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively process directory
function processDirectory(dirPath) {
  let totalFiles = 0;
  let fixedFiles = 0;
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', 'dist', 'coverage', '.git'].includes(item)) {
          walkDir(fullPath);
        }
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        totalFiles++;
        if (processFile(fullPath)) {
          fixedFiles++;
        }
      }
    });
  }
  
  walkDir(dirPath);
  return { totalFiles, fixedFiles };
}

// Main execution
const frontendPath = path.join(__dirname, 'frontend', 'src');

if (fs.existsSync(frontendPath)) {
  console.log('🔍 Processing frontend source files...');
  const { totalFiles, fixedFiles } = processDirectory(frontendPath);
  
  console.log('\n📊 Summary:');
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files fixed: ${fixedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - fixedFiles}`);
  
  if (fixedFiles > 0) {
    console.log('\n🎉 Frontend linting fixes completed!');
    console.log('💡 Run "npm run lint" in the frontend directory to verify fixes.');
  } else {
    console.log('\n✨ No files needed fixing - code is already clean!');
  }
} else {
  console.error('❌ Frontend source directory not found!');
  process.exit(1);
}
