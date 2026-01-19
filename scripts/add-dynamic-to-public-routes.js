#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const routeFiles = [
  'app/api/contact/route.ts',
  'app/api/youtube-music/video/route.ts',
  'app/api/youtube-music/cali-sound-songs/route.ts',
  'app/api/youtube-music/search/route.ts',
  'app/api/apple-music/search/route.ts',
  'app/api/apple-music/developer-token/route.ts',
  'app/api/spotify/track/route.ts',
  'app/api/spotify/auth/route.ts',
  'app/api/spotify/search/route.ts',
  'app/api/cali-club/songs/route.ts',
  'app/api/cali-club/messages/route.ts',
  'app/api/cali-club/state/route.ts',
  'app/api/cali-club/characters/cleanup/route.ts',
  'app/api/cali-club/characters/route.ts',
  'app/api/search/route.ts',
  'app/api/newsletter/subscribe/route.ts',
];

routeFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
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
