#!/usr/bin/env node

// Build script to combine modules into single files for each platform

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const outputDir = path.join(__dirname, '..', 'dist');

// Read utility files
const domHelpers = fs.readFileSync(path.join(srcDir, 'utils', 'dom-helpers.js'), 'utf8');
const uiComponents = fs.readFileSync(path.join(srcDir, 'utils', 'ui-components.js'), 'utf8');
const messageHandler = fs.readFileSync(path.join(srcDir, 'utils', 'message-handler.js'), 'utf8');
const platformBase = fs.readFileSync(path.join(srcDir, 'utils', 'platform-base.js'), 'utf8');

// Remove export/import statements
function removeExportsImports(code) {
  return code
    .replace(/export\s+{[^}]+};?/g, '')
    .replace(/export\s+(function|class|const|let|var)/g, '$1')
    .replace(/import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?/g, '')
    .replace(/import\s+\w+\s+from\s+['"][^'"]+['"];?/g, '');
}

// Build platform scripts
const platforms = ['chatgpt', 'claude', 'gemini', 'grok'];

platforms.forEach(platform => {
  const platformCode = fs.readFileSync(
    path.join(srcDir, 'content', 'platforms', `${platform}.js`),
    'utf8'
  );

  const combined = `
// Fast GPTZero - ${platform.charAt(0).toUpperCase() + platform.slice(1)} (Built)
// This file is auto-generated. Do not edit directly.

(function() {
  'use strict';

  // === Utilities ===

  ${removeExportsImports(domHelpers)}

  ${removeExportsImports(uiComponents)}

  ${removeExportsImports(messageHandler)}

  ${removeExportsImports(platformBase)}

  // === Platform Code ===

  ${removeExportsImports(platformCode)}

})();
`;

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write combined file
  fs.writeFileSync(
    path.join(outputDir, `${platform}.js`),
    combined,
    'utf8'
  );

  console.log(`✓ Built ${platform}.js`);
});

console.log('Build complete!');
