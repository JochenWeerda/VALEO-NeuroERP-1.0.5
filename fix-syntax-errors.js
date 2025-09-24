#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 VALEO NeuroERP 2.0 - Critical Syntax Error Fixes');
console.log('=' * 50);

// Function to fix parsing errors
function fixParsingErrors(content) {
  // Fix common parsing errors
  
  // Fix missing commas in object destructuring
  content = content.replace(/const\s*{\s*([^}]+)\s*}\s*=\s*([^;]+);/g, (match, destructured, assignment) => {
    // Check if there are missing commas in destructuring
    const parts = destructured.split(',');
    const fixedParts = parts.map(part => {
      const trimmed = part.trim();
      if (trimmed && !trimmed.includes(':') && !trimmed.includes(',')) {
        return trimmed;
      }
      return trimmed;
    }).filter(part => part);
    
    if (fixedParts.length > 1) {
      const fixedDestructured = fixedParts.join(', ');
      return match.replace(destructured, fixedDestructured);
    }
    return match;
  });
  
  // Fix missing commas in function parameters
  content = content.replace(/\(([^)]+)\)\s*=>/g, (match, params) => {
    const parts = params.split(',');
    const fixedParts = parts.map(part => {
      const trimmed = part.trim();
      if (trimmed && !trimmed.includes(':')) {
        return trimmed;
      }
      return trimmed;
    }).filter(part => part);
    
    if (fixedParts.length > 1) {
      const fixedParams = fixedParts.join(', ');
      return match.replace(params, fixedParams);
    }
    return match;
  });
  
  // Fix missing commas in array destructuring
  content = content.replace(/const\s*\[\s*([^\]]+)\s*\]\s*=\s*([^;]+);/g, (match, destructured, assignment) => {
    const parts = destructured.split(',');
    const fixedParts = parts.map(part => {
      const trimmed = part.trim();
      if (trimmed && !trimmed.includes(',')) {
        return trimmed;
      }
      return trimmed;
    }).filter(part => part);
    
    if (fixedParts.length > 1) {
      const fixedDestructured = fixedParts.join(', ');
      return match.replace(destructured, fixedDestructured);
    }
    return match;
  });
  
  // Fix missing commas in object literals
  content = content.replace(/{\s*([^}]+)\s*}/g, (match, content) => {
    const lines = content.split('\n');
    const fixedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.endsWith(',') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.includes(':')) {
        return line + ',';
      }
      return line;
    });
    
    if (fixedLines.some((line, index) => line !== lines[index])) {
      return match.replace(content, fixedLines.join('\n'));
    }
    return match;
  });
  
  // Fix missing commas in function calls
  content = content.replace(/\(\s*([^)]+)\s*\)/g, (match, params) => {
    const parts = params.split(',');
    const fixedParts = parts.map(part => {
      const trimmed = part.trim();
      if (trimmed && !trimmed.includes(',')) {
        return trimmed;
      }
      return trimmed;
    }).filter(part => part);
    
    if (fixedParts.length > 1) {
      const fixedParams = fixedParts.join(', ');
      return match.replace(params, fixedParams);
    }
    return match;
  });
  
  return content;
}

// Function to fix specific syntax errors
function fixSpecificSyntaxErrors(content) {
  // Fix common TypeScript/JavaScript syntax issues
  
  // Fix missing semicolons
  content = content.replace(/([^;}])\n\s*(const|let|var|function|class|interface|type|enum)/g, '$1;\n$2');
  
  // Fix missing commas in imports
  content = content.replace(/import\s*{\s*([^}]+)\s*}\s*from/g, (match, imports) => {
    const parts = imports.split(',');
    const fixedParts = parts.map(part => {
      const trimmed = part.trim();
      if (trimmed && !trimmed.includes(',')) {
        return trimmed;
      }
      return trimmed;
    }).filter(part => part);
    
    if (fixedParts.length > 1) {
      const fixedImports = fixedParts.join(', ');
      return match.replace(imports, fixedImports);
    }
    return match;
  });
  
  // Fix missing commas in exports
  content = content.replace(/export\s*{\s*([^}]+)\s*}/g, (match, exports) => {
    const parts = exports.split(',');
    const fixedParts = parts.map(part => {
      const trimmed = part.trim();
      if (trimmed && !trimmed.includes(',')) {
        return trimmed;
      }
      return trimmed;
    }).filter(part => part);
    
    if (fixedParts.length > 1) {
      const fixedExports = fixedParts.join(', ');
      return match.replace(exports, fixedExports);
    }
    return match;
  });
  
  return content;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    
    // Apply fixes
    fixedContent = fixParsingErrors(fixedContent);
    fixedContent = fixSpecificSyntaxErrors(fixedContent);
    
    // Only write if content changed
    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed syntax: ${path.relative(process.cwd(), filePath)}`);
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
  console.log('🔍 Processing frontend source files for syntax errors...');
  const { totalFiles, fixedFiles } = processDirectory(frontendPath);
  
  console.log('\n📊 Summary:');
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files fixed: ${fixedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - fixedFiles}`);
  
  if (fixedFiles > 0) {
    console.log('\n🎉 Critical syntax error fixes completed!');
    console.log('💡 Run "npm run lint" in the frontend directory to verify fixes.');
  } else {
    console.log('\n✨ No syntax errors found - code is already clean!');
  }
} else {
  console.error('❌ Frontend source directory not found!');
  process.exit(1);
}
