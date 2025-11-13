#!/bin/bash

# This script copies the old working content scripts to the new location
# until we can properly refactor them

echo "Copying platform scripts..."

cp content-chatgpt.js src/content/platforms/chatgpt.js
cp content-claude.js src/content/platforms/claude.js
cp content-gemini.js src/content/platforms/gemini.js
cp content-grok.js src/content/platforms/grok.js

echo "Done! Platform scripts are ready."
