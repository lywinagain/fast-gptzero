# Fast GPTZero - Quick Start Guide

## 🚀 Installation (2 minutes)

```bash
# 1. Load extension
# - Open chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select fast-gptzero folder

# 2. Verify installation
# - Check for extension in list
# - No red error messages
# - Placeholder icon visible
```

## ✅ Quick Test (ChatGPT)

1. Go to https://chat.openai.com/
2. Open DevTools (F12) → Console
3. Look for: `Fast GPTZero: ChatGPT content script loaded`
4. Ask ChatGPT: "Write a short paragraph about AI"
5. Wait for response
6. Look for purple "Check with GPTZero" button below response
7. Click the button
8. Watch for:
   - Button changes to "Checking..."
   - Loading modal appears
   - GPTZero tab opens (check tabs!)
   - Results modal shows score

## 🐛 Quick Debug Commands

### Check if script loaded:
```javascript
console.log('Script loaded test');
```

### Check for ChatGPT messages:
```javascript
document.querySelectorAll('[data-message-author-role="assistant"]').length
```

### Check if buttons were added:
```javascript
document.querySelectorAll('.fast-gptzero-button').length
```

### Manual button injection (if needed):
```javascript
// Force a scan for messages
const observer = new MutationObserver(() => {
  console.log('Mutation detected');
});
observer.observe(document.body, { childList: true, subtree: true });
```

## 📋 Platform URLs

- **ChatGPT:** https://chat.openai.com/
- **Claude:** https://claude.ai/
- **Gemini:** https://gemini.google.com/
- **Grok:** https://grok.x.com/ or https://x.com/
- **GPTZero:** https://gptzero.me/

## 🔧 Common Issues

### Issue: Button not appearing
```javascript
// Check console for errors
// Refresh the page (Ctrl+F5)
// Verify messages exist:
document.querySelectorAll('[data-message-author-role="assistant"]').length
```

### Issue: "Failed to communicate with extension"
```
1. Go to chrome://extensions/
2. Find Fast GPTZero
3. Click reload icon (circular arrow)
4. Refresh the AI platform page
```

### Issue: Extension won't load
```
- Check manifest.json for errors
- Verify all files exist in src/ folders
- Check browser console for errors
```

## 📁 File Structure

```
fast-gptzero/
├── manifest.json           # Extension config
├── src/
│   ├── background/
│   │   └── service-worker.js
│   ├── content/
│   │   ├── platforms/
│   │   │   ├── chatgpt.js   # Test this first!
│   │   │   ├── claude.js
│   │   │   ├── gemini.js
│   │   │   └── grok.js
│   │   └── gptzero.js       # Critical for automation
│   ├── popup/
│   │   ├── popup.html
│   │   └── popup.js
│   └── styles/
│       └── content.css
├── icons/                   # Placeholder icons included
├── TESTING_CHECKLIST.md    # Detailed testing guide
└── README.md               # Full documentation
```

## 🎯 Testing Priority

1. ✅ **Load extension** - Verify no errors
2. ✅ **ChatGPT** - Primary platform (easiest to test)
3. ✅ **GPTZero automation** - Critical functionality
4. ⏳ **Claude** - Second priority
5. ⏳ **Gemini** - Third priority
6. ⏳ **Grok** - If accessible

## 💡 Key Selectors by Platform

### ChatGPT
```javascript
Messages: '[data-message-author-role="assistant"]'
Content: '.markdown, .prose'
Input: 'textarea[placeholder*="Message"]'
```

### Claude
```javascript
Messages: '[data-test-render-count]'
Filter: '[data-is-user-message="true"]' // Exclude
Input: '[contenteditable="true"]'
```

### Gemini
```javascript
Messages: '.model-response-text'
Input: 'rich-textarea'
```

### Grok
```javascript
Messages: '[data-testid="grok-message"]'
Input: '[contenteditable="true"]'
```

## 📊 Success Indicators

Extension works if you see:
- ✅ Script load message in console
- ✅ Purple button below AI responses
- ✅ Button click opens GPTZero tab
- ✅ Results modal shows percentage
- ✅ No console errors

## 🆘 Get Help

1. Check **TESTING_CHECKLIST.md** for detailed debugging
2. Check **TESTING.md** for comprehensive guide
3. Open DevTools and look for error messages
4. Check background service worker console:
   - chrome://extensions/ → Fast GPTZero → "service worker"

## 📝 Report Issues

When reporting issues, include:
- Platform (ChatGPT/Claude/etc)
- Console errors (if any)
- Screenshot of issue
- Steps to reproduce

## ⚡ Quick Diagnostic Script

Run this in any platform console:

```javascript
(function() {
  console.log('=== Fast GPTZero Check ===');

  const platforms = {
    'ChatGPT': '[data-message-author-role="assistant"]',
    'Claude': '[data-test-render-count]',
    'Gemini': '.model-response-text',
    'Grok': '[data-testid="grok-message"]'
  };

  for (const [name, selector] of Object.entries(platforms)) {
    const count = document.querySelectorAll(selector).length;
    if (count > 0) {
      console.log(`✓ ${name}: Found ${count} messages`);
    }
  }

  const buttons = document.querySelectorAll('.fast-gptzero-button').length;
  console.log(`Buttons: ${buttons}`);
  console.log('=== End Check ===');
})();
```

## 🎬 Video Testing Flow

1. **Record your test** (optional but helpful)
2. Open ChatGPT
3. F12 for DevTools
4. Start new chat
5. Ask a question
6. Wait for response
7. Look for button
8. Click button
9. Switch to GPTZero tab (observe automation)
10. Return to ChatGPT
11. View results modal

---

**Total setup time:** ~2 minutes
**First test time:** ~30 seconds
**Full platform test:** ~5 minutes per platform

Ready to test! Start with ChatGPT → https://chat.openai.com/
