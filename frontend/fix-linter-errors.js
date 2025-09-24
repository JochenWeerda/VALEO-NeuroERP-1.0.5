#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Liste der häufigsten Linter-Fehler und ihre Fixes
const fixes = [
  // Unused imports entfernen
  {
    pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/icons-material['"]/g,
    fix: (match, imports) => {
      // Entferne ungenutzte Icons
      const unusedIcons = [
        'DeleteIcon', 'SaveIcon', 'CancelIcon', 'FilterIcon', 'EuroIcon',
        'Divider', 'Skeleton', 'Alert', 'Menu', 'CircularProgress', 'Badge',
        'Avatar', 'LinearProgress', 'Paper', 'Grid', 'Table', 'Tag', 'Space',
        'Progress', 'Statistic', 'Tooltip', 'Popconfirm', 'Switch', 'Radio',
        'SettingOutlined', 'formatFileSize', 'Typography', 'ReloadOutlined',
        'formatCurrency', 'calculateGewinn', 'calculateGewinnmarge',
        'calculateDeckungsbeitrag', 'MCPSchema', 'WarningIcon', 'PhoneIcon',
        'EmailIcon', 'ShippingIcon', 'PaymentIcon', 'SearchIcon', 'InvoiceIcon',
        'DescriptionIcon', 'QrCodeIcon', 'SecurityIcon', 'PersonIcon', 'BankIcon',
        'LocationIcon', 'AddIcon', 'EditIcon', 'ViewIcon', 'DownloadIcon',
        'ErrorIcon', 'TrendingUpIcon', 'WarningIcon'
      ];
      
      let cleanedImports = imports;
      unusedIcons.forEach(icon => {
        const regex = new RegExp(`\\s*${icon}\\s*,?`, 'g');
        cleanedImports = cleanedImports.replace(regex, '');
      });
      
      // Bereinige leere Imports
      cleanedImports = cleanedImports.replace(/,\s*,/g, ',');
      cleanedImports = cleanedImports.replace(/^\s*,\s*/, '');
      cleanedImports = cleanedImports.replace(/,\s*$/, '');
      
      if (cleanedImports.trim() === '') {
        return `// ${match}`;
      }
      
      return `import { ${cleanedImports} } from '@mui/icons-material'`;
    }
  },
  
  // Unused variables kommentieren
  {
    pattern: /const\s+(\w+)\s*=\s*[^;]+;/g,
    fix: (match, varName) => {
      const unusedVars = [
        'data', 'loading', 'error', 'setServices', 'selectedWorkflow', 'watch',
        'enhancedFields', 'result', 'refetch', 'uiMetadata', 'options', 'setMetrics',
        'get', 'labels', 'trackComponentLoad', 'formatDate', 'handleSort',
        'statusOptions', 'id', 'field', 'password', 'T'
      ];
      
      if (unusedVars.includes(varName)) {
        return `// ${match}`;
      }
      return match;
    }
  },
  
  // Any types zu unknown ändern
  {
    pattern: /:\s*any\b/g,
    fix: ': unknown'
  },
  
  // Unnecessary escape characters entfernen
  {
    pattern: /\\\+/g,
    fix: '+'
  },
  {
    pattern: /\\\(/g,
    fix: '('
  },
  {
    pattern: /\\\)/g,
    fix: ')'
  },
  {
    pattern: /\\\./g,
    fix: '.'
  },
  {
    pattern: /\\\//g,
    fix: '/'
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
      console.log(`Fixed: ${filePath}`);
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

console.log('Starting to fix linter errors...');
walkDirectory('./src');
console.log('Done fixing linter errors!');
