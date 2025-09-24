#!/usr/bin/env node

/**
 * VALEO NeuroERP - Critical Error Fixer
 * Fixes the most common parsing errors automatically
 */

const fs = require('fs');
const path = require('path');

class CriticalErrorFixer {
  constructor() {
    this.fixedFiles = 0;
  }

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

  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      let changed = false;

      // Fix 1: Destructuring syntax errors (_{ → {)
      content = content.replace(
        /export const \w+: React\.FC<\w+> = \(_\{/g,
        (match) => match.replace('(_', '(')
      );

      // Fix 2: Remove duplicate icon imports
      content = content.replace(
        /import \{[^}]*, \w+ , \w+ , \w+ , \w+  \} from ['"]@mui\/icons-material['"]/g,
        (match) => {
          // Remove duplicate icon names at the end
          return match.replace(/ , \w+ , \w+ , \w+ , \w+  \}/, ' }');
        }
      );

      // Fix 3: Fix common destructuring patterns
      content = content.replace(
        /export const \w+: React\.FC<\w+> = \(\{([^}]+)\}\) => \{/g,
        (match, params) => {
          // Clean up parameter destructuring
          const cleanParams = params.replace(/_/g, '').replace(/ ,/g, ',');
          return match.replace(params, cleanParams);
        }
      );

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed critical errors in: ${filePath}`);
        this.fixedFiles++;
        changed = true;
      }

      return changed;
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
      return false;
    }
  }

  async run() {
    console.log('🚨 VALEO NeuroERP - Critical Error Fixer');
    console.log('=======================================');

    const srcDir = path.join(__dirname, 'frontend', 'src');
    const files = this.findFiles(srcDir);

    console.log(`📁 Found ${files.length} TypeScript/React files`);

    for (const file of files) {
      this.fixFile(file);
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Fixed critical errors in ${this.fixedFiles} files`);

    console.log('\n🎯 Run ESLint again to check remaining issues');
  }
}

// Run the fixer
const fixer = new CriticalErrorFixer();
fixer.run().catch(console.error);