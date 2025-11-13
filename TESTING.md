# Fast GPTZero - Testing & Debugging Guide

## 📁 New Project Structure

```
fast-gptzero/
├── manifest.json                    # Main extension configuration
├── src/
│   ├── background/
│   │   └── service-worker.js       # Background orchestration
│   ├── content/
│   │   ├── platforms/
│   │   │   ├── chatgpt.js         # ChatGPT integration
│   │   │   ├── claude.js          # Claude integration
│   │   │   ├── gemini.js          # Gemini integration
│   │   │   └── grok.js            # Grok integration
│   │   └── gptzero.js             # GPTZero automation
│   ├── popup/
│   │   ├── popup.html             # Extension popup UI
│   │   └── popup.js               # Popup logic
│   └── styles/
│       └── content.css            # Shared styles
├── icons/                          # Extension icons
├── scripts/
│   └── create-icons.sh           # Icon generation script
└── README.md                      # Documentation
```

## 🚀 Installation Steps

### 1. Load Extension in Chrome

1. Open Chrome and navigate to: `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `fast-gptzero` directory
5. The extension should appear with placeholder icons

### 2. Verify Installation

Check for:
- ✅ Extension appears in extensions list
- ✅ No error messages in the extension details
- ✅ Extension icon appears in toolbar

## 🧪 Testing Each Platform

### Testing on ChatGPT (chat.openai.com)

1. Navigate to https://chat.openai.com/
2. Open Developer Tools (F12)
3. Go to Console tab
4. Look for: `Fast GPTZero: ChatGPT content script loaded`
5. Start a new chat and ask a question
6. Wait for ChatGPT's response to fully render
7. Look for "Check with GPTZero" button below the response
8. Click the button and monitor console for:
   - Message sending confirmation
   - GPTZero tab creation
   - Result extraction

**Expected Behavior:**
- Button appears below each assistant message
- Button changes to "Checking..." when clicked
- Loading modal appears
- GPTZero opens in background tab
- Results modal shows after ~10-30 seconds

**Common Issues:**
- **Button not appearing**: Check console for errors. Try refreshing page.
- **Selector mismatch**: ChatGPT may have updated their UI. Check these selectors:
  - `[data-message-author-role="assistant"]`
  - `.agent-turn`
  - `.markdown, .prose`

**Debug Commands:**
```javascript
// In ChatGPT page console:

// Check if script loaded
console.log(window.__fastGPTZero)

// Manually trigger button addition
document.querySelectorAll('[data-message-author-role="assistant"]').length

// Check for existing buttons
document.querySelectorAll('.fast-gptzero-button').length
```

### Testing on Claude (claude.ai)

1. Navigate to https://claude.ai/
2. Open Developer Tools (F12)
3. Look for: `Fast GPTZero: Claude content script loaded`
4. Start a chat and get a response
5. Look for the button below Claude's response

**Key Selectors to Verify:**
- `[data-test-render-count]`
- `.font-claude-message`
- Check that user messages are properly filtered out

**Common Issues:**
- Claude's UI uses contenteditable divs for input
- Make sure revision requests properly populate the input

**Debug:**
```javascript
// Check Claude message elements
document.querySelectorAll('[data-test-render-count]').length

// Find input area
document.querySelector('[contenteditable="true"]')
```

### Testing on Gemini (gemini.google.com)

1. Navigate to https://gemini.google.com/
2. Check console for script load confirmation
3. Generate a response from Gemini
4. Verify button appears

**Key Selectors:**
- `.model-response-text`
- `[data-test-id="model-response"]`
- `.message-content`

**Common Issues:**
- Gemini may use custom elements like `<model-response>`
- Rich-textarea element for input

**Debug:**
```javascript
// Check model responses
document.querySelectorAll('.model-response-text, [data-test-id="model-response"]').length

// Find input
document.querySelector('rich-textarea')
```

### Testing on Grok (grok.x.com or x.com)

1. Navigate to https://grok.x.com/ or https://x.com/ (Grok section)
2. Check for script load
3. Get a response from Grok
4. Verify button placement

**Key Selectors:**
- `[data-testid="grok-message"]`
- `.grok-response`
- `article[role="article"]` (X/Twitter structure)

**Common Issues:**
- Grok runs on X/Twitter infrastructure
- May share selectors with tweets
- Need to filter out non-Grok content

**Debug:**
```javascript
// Check Grok messages
document.querySelectorAll('[data-testid="grok-message"]').length

// Check if on Grok subdomain
window.location.hostname
```

### Testing GPTZero Automation (gptzero.me)

1. Navigate to https://gptzero.me/
2. Check console for: `Fast GPTZero: GPTZero content script loaded`
3. Manually paste text to verify page works
4. Note the structure of results

**Key Elements to Inspect:**
- Text input area (textarea or contenteditable)
- Submit/Check button
- Results container
- Score display elements

**Debug GPTZero Extraction:**
```javascript
// Run in GPTZero console after getting results

// Check if helper function exists
window.__extractGPTZeroResults

// Try extracting results
window.__extractGPTZeroResults()

// Check for result indicators
document.querySelectorAll('[class*="result"], [class*="score"]').length

// Check page text for percentages
document.body.textContent.match(/\d+%/g)
```

## 🔧 Debugging Tips

### Enable Verbose Logging

All scripts log with prefix "Fast GPTZero:". Filter console:
```
Fast GPTZero
```

### Check Extension Status

1. Go to `chrome://extensions/`
2. Click "Details" on Fast GPTZero
3. Check for errors
4. Click "service worker" to see background script console

### Monitor Message Passing

In background service worker console:
```javascript
// Messages should log automatically
// Look for:
// - "Background: Received message"
// - "Background: Starting GPTZero check"
// - "Background: Results received"
```

### Test Button Injection Manually

In any AI platform console:
```javascript
// Force button addition
const observer = new MutationObserver(() => {
  console.log('DOM changed');
});
observer.observe(document.body, { childList: true, subtree: true });
```

### Inspect GPTZero Tab

When checking text:
1. Look for a new GPTZero tab being created
2. It should be inactive (background)
3. Switch to it to see what's happening
4. Check if text was pasted
5. Check if submit button was clicked
6. Check if results appeared

### Common Errors

**"Failed to communicate with extension"**
- Extension service worker may have crashed
- Reload extension in chrome://extensions/

**"Could not find input area"**
- Platform UI changed
- Check selectors in platform-specific script
- Update selectors if needed

**"Timeout waiting for GPTZero results"**
- GPTZero is slow or down
- Results didn't render properly
- Check GPTZero manually

**Button appears multiple times**
- Message ID generation collision
- Processed messages set not working
- Check generateMessageId function

## 📊 Testing Checklist

### Initial Load
- [ ] Extension loads without errors
- [ ] All scripts inject properly
- [ ] Console shows load messages
- [ ] No permission errors

### ChatGPT
- [ ] Script loads
- [ ] Button appears on messages
- [ ] Button click triggers check
- [ ] Modal shows loading state
- [ ] Results modal appears
- [ ] Revision request works

### Claude
- [ ] Script loads
- [ ] Button appears on messages
- [ ] No buttons on user messages
- [ ] Input area found for revisions
- [ ] Full workflow completes

### Gemini
- [ ] Script loads
- [ ] Button appears
- [ ] Handles model responses correctly
- [ ] Rich textarea input works

### Grok
- [ ] Script loads on grok.x.com
- [ ] Button appears on Grok messages
- [ ] Doesn't interfere with regular tweets
- [ ] Input area works

### GPTZero
- [ ] Script loads on gptzero.me
- [ ] Text injection works
- [ ] Submit button found and clicked
- [ ] Results extracted correctly
- [ ] Tab closes after completion

## 🐛 Known Issues

1. **Selector Brittleness**: AI platforms frequently update their UIs. Selectors may break.

2. **GPTZero Rate Limits**: Free tier has usage limits. May see errors after multiple checks.

3. **Race Conditions**: If GPTZero loads slowly, extraction may fail.

4. **Multiple Tabs**: Opening multiple AI chat tabs may cause conflicts.

## 🛠️ Development Workflow

### Making Changes

1. Edit files in `src/` directory
2. Go to `chrome://extensions/`
3. Click reload icon on Fast GPTZero
4. Refresh AI platform pages
5. Test changes

### Updating Selectors

If a platform UI changes:
1. Open that platform's content script (e.g., `src/content/platforms/chatgpt.js`)
2. Find the `addButtonsToMessages()` function
3. Update selectors array
4. Test thoroughly

### Adding New Platforms

1. Copy an existing platform script
2. Update selectors for new platform
3. Add new entry in manifest.json `content_scripts`
4. Test extensively

## 📈 Performance Monitoring

Check performance impact:
```javascript
// In platform console
performance.measure('button-injection-time')

// In background console
performance.now() // Check timing of operations
```

## ✅ Success Criteria

Extension works correctly when:
- Buttons appear reliably on all platforms
- GPTZero automation completes in < 60 seconds
- Results are extracted accurately
- No console errors during normal operation
- Revision requests populate input correctly
- UI is responsive and doesn't lag

## 🆘 Getting Help

If issues persist:
1. Check all console logs (page + background + service worker)
2. Verify selectors match current UI
3. Test GPTZero manually to ensure it works
4. Check Chrome extension permissions
5. Try in incognito mode to rule out conflicts

## 📝 Reporting Issues

When reporting issues, include:
- Chrome version
- Extension version
- Platform being tested (ChatGPT/Claude/etc)
- Console logs from both page and background
- Screenshots of UI
- Steps to reproduce
