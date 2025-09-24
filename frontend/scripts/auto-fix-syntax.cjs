#!/usr/bin/env node

/**
 * VALEO NeuroERP - Automated Syntax Error Fixer
 * Fixes common parsing errors automatically
 */

const fs = require('fs');
const path = require('path');

class SyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
    this.errors = [];
  }

  /**
   * Find all TypeScript/React files
   */
  findFiles(dir) {
    const files = [];

    function scan(directory) {
      const items = fs.readdirSync(directory);

      for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scan(fullPath);
        } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
          files.push(fullPath);
        }
      }
    }

    scan(dir);
    return files;
  }

  /**
   * Fix common syntax errors in a file
   */
  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      let changed = false;

      // Fix 1: Add missing commas in interface/object definitions
      content = content.replace(/(\w+):\s*string\s*\n\s*(\w+)/g, '$1: string,\n  $2');
      content = content.replace(/(\w+):\s*number\s*\n\s*(\w+)/g, '$1: number,\n  $2');
      content = content.replace(/(\w+):\s*boolean\s*\n\s*(\w+)/g, '$1: boolean,\n  $2');
      content = content.replace(/(\w+):\s*any\s*\n\s*(\w+)/g, '$1: any,\n  $2');

      // Fix 2: Fix malformed import statements
      content = content.replace(/import\s*{\s*([^}]+)\s*\n\s*([^}]+)\s*}\s*from/g, (match, p1, p2) => {
        return `import { ${p1.trim()}, ${p2.trim()} } from`;
      });

      // Fix 3: Fix parameter destructuring with : unknown
      content = content.replace(/(\w+):\s*unknown/g, '$1');

      // Fix 4: Fix useEffect with (: unknown) =>
      content = content.replace(/useEffect\(\(\s*:\s*unknown\s*\)\s*=>\s*{/g, 'useEffect(() => {');

      // Fix 5: Remove trailing commas before closing braces in parameter lists
      content = content.replace(/,(\s*\}\s*\))/g, '$1');

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        this.fixedFiles++;
        changed = true;
      }

      return changed;
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
      return false;
    }
  }

  /**
   * Run the fixer
   */
  async run() {
    console.log('🔧 VALEO NeuroERP - Automated Syntax Error Fixer');
    console.log('==================================================');

    const srcDir = path.join(__dirname, '..', 'src');
    const files = this.findFiles(srcDir);

    console.log(`📁 Found ${files.length} TypeScript/React files`);

    for (const file of files) {
      this.fixFile(file);
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Fixed ${this.fixedFiles} files`);

    if (this.errors.length > 0) {
      console.log(`❌ ${this.errors.length} errors occurred:`);
      this.errors.forEach(err => {
        console.log(`  - ${err.file}: ${err.error}`);
      });
    }

    console.log('\n🎯 Run ESLint again to check remaining issues');
  }
}

// Run the fixer
const fixer = new SyntaxFixer();
fixer.run().catch(console.error);