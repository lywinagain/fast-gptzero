# Extension Icons

This directory should contain the following PNG icon files:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon32.png` - 32x32 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Creating Icons

You can use the provided `icon.svg` file and convert it to PNG using:

### Option 1: Online Converter
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Convert to each required size (16x16, 32x32, 48x48, 128x128)
4. Download and save in this directory

### Option 2: Using ImageMagick (if installed)
```bash
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 32x32 icon32.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### Option 3: Using Inkscape (if installed)
```bash
inkscape icon.svg --export-filename=icon16.png --export-width=16 --export-height=16
inkscape icon.svg --export-filename=icon32.png --export-width=32 --export-height=32
inkscape icon.svg --export-filename=icon48.png --export-width=48 --export-height=48
inkscape icon.svg --export-filename=icon128.png --export-width=128 --export-height=128
```

### Option 4: Temporary Workaround
For development/testing, you can use any square PNG images renamed to these filenames. The extension will work with any placeholder icons.
