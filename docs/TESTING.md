# Fast GPTZero Testing Guide

## Quick Start (2 minutes)

### 1. Load Extension
```
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select fast-gptzero folder
```

### 2. Test on ChatGPT
```
1. Go to https://chatgpt.com/
2. Press F12 → Console tab
3. Look for: "Fast GPTZero: ChatGPT content script loaded"
4. Ask ChatGPT anything
5. Click purple "Check with GPTZero" button
6. Wait for results modal
```

---

## Platform URLs

Test on these URLs:
- **ChatGPT**: https://chatgpt.com/ or https://chat.openai.com/
- **Gemini**: https://gemini.google.com/app
- **Claude**: https://claude.ai/
- **Grok**: https://grok.x.com/
- **GPTZero**: https://gptzero.me/

---

## Quick Diagnostics

Run in Console (F12):

### Check if messages detected:
```javascript
document.querySelectorAll('[data-message-author-role="assistant"]').length
```

### Check if buttons added:
```javascript
document.querySelectorAll('.fast-gptzero-button').length
```

### Run full verification:
Copy/paste contents of `scripts/verify-selectors.js`

---

## Common Issues

### Button not appearing
- Refresh page (Ctrl+Shift+R)
- Check console for errors
- Run diagnostic commands above

### "Failed to communicate with extension"
- chrome://extensions/ → Reload extension
- Refresh the platform page

### GPTZero automation fails
- Check GPTZero tab is opening
- Verify text pastes correctly
- Results may take 30-60 seconds

---

## Report Issues

Include:
1. Which platform
2. Console errors (screenshot)
3. What step failed

---

## Testing Checklist

### ChatGPT ✅
- [ ] Script loads
- [ ] Button appears
- [ ] GPTZero tab opens
- [ ] Results display

### Gemini
- [ ] Script loads
- [ ] Button appears
- [ ] Full workflow works

### Claude
- [ ] Button on Claude messages only
- [ ] Revision populates input

### GPTZero
- [ ] Text auto-pastes
- [ ] Results extract correctly
