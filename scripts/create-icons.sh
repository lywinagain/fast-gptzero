#!/bin/bash

# Script to create placeholder icons for Fast GPTZero extension
# This creates simple colored squares as placeholder icons

echo "Creating placeholder icons..."

# Create a simple colored square PNG for each size
# Using ImageMagick (if available)
if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    convert -size 16x16 xc:'#667eea' icons/icon16.png
    convert -size 32x32 xc:'#667eea' icons/icon32.png
    convert -size 48x48 xc:'#667eea' icons/icon48.png
    convert -size 128x128 xc:'#667eea' icons/icon128.png
    echo "Icons created successfully!"
elif command -v inkscape &> /dev/null; then
    echo "Using Inkscape..."
    inkscape icons/icon.svg --export-filename=icons/icon16.png --export-width=16 --export-height=16
    inkscape icons/icon.svg --export-filename=icons/icon32.png --export-width=32 --export-height=32
    inkscape icons/icon.svg --export-filename=icons/icon48.png --export-width=48 --export-height=48
    inkscape icons/icon.svg --export-filename=icons/icon128.png --export-width=128 --export-height=128
    echo "Icons created successfully!"
else
    echo "Error: Neither ImageMagick nor Inkscape found."
    echo "Please install one of these tools or create icons manually:"
    echo "  - ImageMagick: https://imagemagick.org/"
    echo "  - Inkscape: https://inkscape.org/"
    echo ""
    echo "Or use an online converter:"
    echo "  - https://cloudconvert.com/svg-to-png"
    exit 1
fi

echo "Done! Icons are in the icons/ directory."
