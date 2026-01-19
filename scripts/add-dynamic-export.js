#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all admin route files
const routeFiles = glob.sync('app/api/admin/**/route.ts', { cwd: __dirname + '/..' });

routeFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if dynamic export already exists
  if (content.includes('export const dynamic')) {
    return; // Skip if already has dynamic export
  }
  
  // Find the first import statement
  const importMatch = content.match(/^(import .+?\n)+/m);
  if (importMatch) {
    const insertPosition = importMatch[0].length;
    const dynamicExport = '\n// Force dynamic rendering to prevent build-time execution\nexport const dynamic = \'force-dynamic\'\n';
    content = content.slice(0, insertPosition) + dynamicExport + content.slice(insertPosition);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Added dynamic export to ${file}`);
  }
});

console.log(`\n✅ Processed ${routeFiles.length} route files`);
