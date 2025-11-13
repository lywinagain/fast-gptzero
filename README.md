# Fast GPTZero 🤖✓

Chrome extension that automatically checks AI responses using GPTZero. No API key needed!

## Features

- ✅ Works on ChatGPT, Claude, Gemini, and Grok
- ✅ One-click AI detection with percentage score
- ✅ Automated GPTZero workflow
- ✅ Request AI revisions based on results
- ✅ No API key or signup required

## Quick Start

### 1. Install Extension
```
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select fast-gptzero folder
```

### 2. Test on ChatGPT
```
1. Go to https://chatgpt.com/
2. Ask ChatGPT a question
3. Click "Check with GPTZero" button
4. View results in modal
```

## Supported Platforms

| Platform | URL |
|----------|-----|
| ChatGPT | https://chatgpt.com/ |
| Gemini | https://gemini.google.com/app |
| Claude | https://claude.ai/ |
| Grok | https://grok.x.com/ |
| GPTZero | https://gptzero.me/ |

## How It Works

1. Adds button below AI responses
2. Extracts text when you click
3. Opens GPTZero in background
4. Auto-pastes and submits text
5. Extracts detection score
6. Shows results modal
7. Optional: Request revision

## Project Structure

```
fast-gptzero/
├── manifest.json              # Extension config
├── src/
│   ├── background/            # Service worker
│   ├── content/platforms/     # Platform scripts
│   ├── popup/                 # Extension UI
│   └── styles/                # CSS
├── icons/                     # Extension icons
├── scripts/                   # Helper scripts
└── docs/                      # Documentation
```

## Testing

See [docs/TESTING.md](docs/TESTING.md) for testing instructions.

Quick diagnostic (run in console):
```javascript
// Check if messages detected
document.querySelectorAll('[data-message-author-role="assistant"]').length

// Check if buttons added
document.querySelectorAll('.fast-gptzero-button').length
```

## Troubleshooting

**Button not appearing?**
- Refresh page (Ctrl+Shift+R)
- Check console for "content script loaded"
- Reload extension at chrome://extensions/

**Extension not loading?**
- Check version shows 1.0.2
- Verify all files in src/ folder exist
- Check for errors at chrome://extensions/

**GPTZero not working?**
- Check if GPTZero tab opens
- Switch to tab to see automation
- Wait 30-60 seconds for results

## Development

### File Structure
- `src/content/platforms/` - One file per platform (ChatGPT, Claude, etc)
- `src/background/service-worker.js` - GPTZero automation
- `src/content/gptzero.js` - Result extraction
- `manifest.json` - URLs and permissions

### Updating Selectors
If a platform changes their UI:
1. Edit `src/content/platforms/[platform].js`
2. Update the selectors array
3. Reload extension
4. Test on platform

### Debugging
```javascript
// Run verification tool in console
// Copy from scripts/verify-selectors.js
```

## Technical Details

- **Manifest Version**: 3
- **Permissions**: activeTab, tabs, storage, scripting
- **Content Scripts**: Injected per platform
- **Background**: Service worker for automation
- **No external dependencies**

## Limitations

- Uses GPTZero's free tier (rate limits apply)
- Dependent on platform UI selectors (may break on updates)
- Requires minimum 50 characters of text
- Results depend on GPTZero's accuracy

## License

MIT

## Contributing

1. Test on platforms and report issues
2. Update selectors when platforms change
3. Improve extraction logic
4. Add new platforms

---

**Version:** 1.0.2
**Last Updated:** 2024-11-13
