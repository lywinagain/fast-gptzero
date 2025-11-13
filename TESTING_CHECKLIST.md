# Fast GPTZero - Platform Testing Checklist

## Current Status: Ready for Testing

The extension has been reorganized with a clean folder structure. Now we need to verify it works on each platform.

## Testing Priority Order

1. ✅ **ChatGPT** - Most popular, test first
2. ✅ **Claude** - Well-defined selectors
3. ⏳ **Gemini** - Google's interface
4. ⏳ **Grok** - X/Twitter integration
5. ⏳ **GPTZero** - Critical for automation

## Platform-Specific Testing

### 1. ChatGPT (chat.openai.com)

**Current Selectors:**
```javascript
'[data-message-author-role="assistant"]'  // Primary selector
'.agent-turn'                              // Fallback 1
'.group.agent-turn'                        // Fallback 2
```

**Content Area:**
```javascript
'.markdown, [class*="markdown"], .prose, [class*="prose"]'
```

**Input Area:**
```javascript
'textarea[placeholder*="Message"], #prompt-textarea, textarea'
```

**Testing Steps:**
1. Load extension in Chrome
2. Go to https://chat.openai.com/
3. Open DevTools Console (F12)
4. Look for: `Fast GPTZero: ChatGPT content script loaded`
5. Start a conversation with ChatGPT
6. Wait for response to fully render
7. Check if button appears below response
8. Click button and verify:
   - Button changes to "Checking..."
   - Loading modal appears
   - GPTZero tab opens in background
   - Results modal appears

**Debug Commands:**
```javascript
// Check if messages are detected
document.querySelectorAll('[data-message-author-role="assistant"]').length

// Check if content areas are found
document.querySelectorAll('.markdown, .prose').length

// Check if buttons were added
document.querySelectorAll('.fast-gptzero-button').length

// Manually trigger button addition
const messages = document.querySelectorAll('[data-message-author-role="assistant"]');
console.log(`Found ${messages.length} assistant messages`);
```

**Known Issues:**
- ChatGPT frequently updates their UI
- Selectors may need updating after OpenAI releases

**Status:** ⏳ NEEDS TESTING

---

### 2. Claude (claude.ai)

**Current Selectors:**
```javascript
'[data-test-render-count]'    // Primary
'.font-claude-message'          // Fallback 1
'[class*="Message"]'            // Fallback 2
```

**User Message Filter:**
```javascript
'[data-is-user-message="true"]'  // Explicit user marker
'[class*="user"]'                 // Class-based filter
```

**Input Area:**
```javascript
'[contenteditable="true"]'  // Claude uses contenteditable divs
```

**Testing Steps:**
1. Go to https://claude.ai/
2. Check console for load message
3. Start a chat
4. Verify button appears only on Claude's responses (not user messages)
5. Test button click
6. Test revision request populates contenteditable input

**Debug Commands:**
```javascript
// Check for Claude messages
document.querySelectorAll('[data-test-render-count]').length

// Check user message filtering
document.querySelectorAll('[data-is-user-message="true"]').length

// Find input area
document.querySelector('[contenteditable="true"]')

// Check if filtering works correctly
const allMessages = document.querySelectorAll('[data-test-render-count]');
const userMessages = Array.from(allMessages).filter(m =>
  m.closest('[data-is-user-message="true"]')
);
console.log(`Total: ${allMessages.length}, User: ${userMessages.length}, Assistant: ${allMessages.length - userMessages.length}`);
```

**Known Issues:**
- Claude uses contenteditable divs, not textareas
- Need to verify text setting works correctly
- User message filtering is critical

**Status:** ⏳ NEEDS TESTING

---

### 3. Gemini (gemini.google.com)

**Current Selectors:**
```javascript
'.model-response-text'           // Primary
'[data-test-id="model-response"]' // Test ID
'.response-container'             // Container
'model-response'                  // Custom element
'[class*="model"]'                // Wildcard
'.message-content'                // Alternative
```

**Input Area:**
```javascript
'rich-textarea'                // Gemini's custom element
'[contenteditable="true"]'     // Fallback
'textarea'                      // Standard fallback
```

**Testing Steps:**
1. Go to https://gemini.google.com/
2. Check for script load
3. Generate a response
4. Verify button placement
5. Test with both short and long responses
6. Verify rich-textarea input works

**Debug Commands:**
```javascript
// Check for Gemini responses
document.querySelectorAll('.model-response-text, [data-test-id="model-response"]').length

// Check for custom elements
document.querySelectorAll('model-response').length

// Find input
document.querySelector('rich-textarea')

// Check message structure
const responses = document.querySelectorAll('[class*="model"]');
responses.forEach((r, i) => console.log(`Response ${i}:`, r.className));
```

**Known Issues:**
- Gemini uses custom web components
- rich-textarea may require special handling
- Response structure varies by content type

**Status:** ⏳ NEEDS TESTING

---

### 4. Grok (grok.x.com)

**Current Selectors:**
```javascript
'[data-testid="grok-message"]'  // Primary
'.grok-response'                 // Class-based
'[class*="GrokMessage"]'         // Wildcard
'[data-grok-message]'            // Data attribute
'article[role="article"]'        // Twitter structure
```

**User Message Filter:**
```javascript
'[data-testid="user-message"]'
'[data-user-message]'
'.user-message'
```

**Input Area:**
```javascript
'[contenteditable="true"]'  // Primary
'textarea'                   // Fallback
'input[type="text"]'        // Last resort
```

**Testing Steps:**
1. Go to https://grok.x.com/ or https://x.com/ (Grok section)
2. Verify script loads
3. Start Grok conversation
4. Ensure buttons don't appear on regular tweets
5. Test Grok-specific responses
6. Verify input area detection

**Debug Commands:**
```javascript
// Check for Grok messages
document.querySelectorAll('[data-testid="grok-message"]').length

// Check page context
console.log('Hostname:', window.location.hostname);
console.log('Pathname:', window.location.pathname);

// Look for Grok UI
document.querySelectorAll('[class*="grok" i]').length

// Check article elements
document.querySelectorAll('article[role="article"]').length
```

**Known Issues:**
- Grok runs on X/Twitter infrastructure
- May share selectors with regular tweets
- Need careful filtering to avoid false positives
- URL structure may vary

**Status:** ⏳ NEEDS TESTING (May be hardest to test)

---

### 5. GPTZero (gptzero.me)

**Critical Component** - This is where the magic happens!

**What to Look For:**
```javascript
// Input areas
'textarea'
'[contenteditable="true"]'
'[placeholder*="paste"]'
'[placeholder*="text"]'

// Submit buttons
'button[type="submit"]'
'button' containing "Check", "Scan", "Analyze"

// Results
'[class*="result"]'
'[class*="score"]'
'[class*="probability"]'
Percentages in text: /\d+%/
```

**Testing Steps:**
1. Go to https://gptzero.me/
2. Check console for: `Fast GPTZero: GPTZero content script loaded`
3. Manually paste text and submit
4. Observe the results structure
5. Note where scores appear
6. Check if extraction function works

**Debug Commands:**
```javascript
// Check helper function
window.__extractGPTZeroResults

// Try extracting results manually
const results = window.__extractGPTZeroResults();
console.log('Extracted:', results);

// Find input area
const inputs = document.querySelectorAll('textarea, [contenteditable="true"]');
console.log('Found inputs:', inputs.length);
inputs.forEach((input, i) => {
  const rect = input.getBoundingClientRect();
  console.log(`Input ${i}:`, {
    visible: rect.width > 0 && rect.height > 0,
    tagName: input.tagName,
    placeholder: input.placeholder
  });
});

// Find submit button
const buttons = document.querySelectorAll('button');
buttons.forEach(btn => {
  if (btn.textContent.match(/check|scan|analyze|submit/i)) {
    console.log('Potential submit button:', btn.textContent.trim());
  }
});

// After getting results, check for percentages
document.body.textContent.match(/\d+%/g)

// Check for result indicators
document.querySelectorAll('[class*="result"], [class*="score"]').length
```

**Testing the Automation:**
1. From ChatGPT, click "Check with GPTZero"
2. Watch for new tab creation
3. Switch to GPTZero tab to observe:
   - Text pasted successfully
   - Submit button clicked
   - Results appeared
   - Scores extracted
4. Check background console for logs
5. Verify results modal shows in ChatGPT

**Known Issues:**
- GPTZero may rate limit free tier
- UI may change without notice
- Results structure varies by text length
- Animation timing can affect extraction

**Status:** ⏳ NEEDS TESTING (Most critical!)

---

## Extension Loading Test

Before testing platforms, verify extension loads correctly:

### Steps:
1. Open `chrome://extensions/`
2. Enable Developer Mode
3. Click "Load unpacked"
4. Select `fast-gptzero` directory
5. Check for errors

### What to Verify:
- ✅ Extension appears in list
- ✅ No red error text
- ✅ Placeholder icon visible
- ✅ Version shows as 1.0.1
- ✅ All permissions granted

### Background Service Worker:
1. Click "service worker" link
2. Console should open
3. Look for: `Fast GPTZero: Background service worker loaded`

---

## Common Issues & Solutions

### Issue: "Button not appearing"
**Check:**
```javascript
// 1. Is script loaded?
console.log('Script loaded');

// 2. Are messages detected?
document.querySelectorAll('[data-message-author-role="assistant"]').length

// 3. Are there any errors?
// Check console for errors
```

**Solutions:**
- Refresh the page
- Reload extension
- Check if selectors match current UI
- Verify mutation observer is working

### Issue: "Failed to communicate with extension"
**Check:**
- Extension service worker status
- Background console for errors
- Chrome hasn't crashed the service worker

**Solutions:**
- Reload extension in chrome://extensions/
- Check manifest.json paths are correct
- Verify message handlers are set up

### Issue: "GPTZero tab opens but nothing happens"
**Check:**
- Is text being pasted?
- Is submit button found and clicked?
- Check GPTZero tab console for errors

**Solutions:**
- Update input selectors
- Update button selectors
- Increase wait times (currently 2 seconds)

### Issue: "Results not extracted"
**Check:**
```javascript
// In GPTZero tab console
window.__extractGPTZeroResults()
```

**Solutions:**
- GPTZero UI may have changed
- Update result extraction selectors
- Check if percentages are visible in page text

---

## Test Report Template

Use this template to document test results:

```markdown
## Platform: [ChatGPT/Claude/Gemini/Grok]
**Date:** YYYY-MM-DD
**Tester:** [Name]

### Load Test
- [ ] Script loaded successfully
- [ ] Console shows initialization message
- [ ] No errors on page load

### Button Injection
- [ ] Button appears on AI responses
- [ ] Button does NOT appear on user messages
- [ ] Button styling is correct
- [ ] Multiple messages handled correctly

### Button Click
- [ ] Button changes to "Checking..." state
- [ ] Loading modal appears
- [ ] Background message sent successfully

### GPTZero Automation
- [ ] GPTZero tab opens
- [ ] Tab is in background (not focused)
- [ ] Text is pasted into input
- [ ] Submit button is clicked
- [ ] Results appear on GPTZero page

### Result Extraction
- [ ] Results extracted successfully
- [ ] AI probability percentage correct
- [ ] Classification text present
- [ ] Modal displays results

### Revision Request
- [ ] "Request Revision" button works
- [ ] Input area found correctly
- [ ] Text populated in input
- [ ] Input is focused

### Notes:
[Any observations, issues, or suggestions]
```

---

## Next Steps

1. **Load Extension** - Verify it loads without errors
2. **Test ChatGPT** - Most important platform
3. **Test Claude** - Second priority
4. **Test Gemini** - Third priority
5. **Test GPTZero** - Critical automation
6. **Test Grok** - If accessible
7. **Document Results** - Use template above
8. **Update Selectors** - Fix any broken ones
9. **Retest** - Verify fixes work

---

## Selector Update Guide

If selectors are broken:

### 1. Inspect the page
- Right-click on AI message
- Select "Inspect"
- Look at element structure

### 2. Find reliable selectors
- Look for data attributes (e.g., `data-testid`)
- Check for unique class names
- Avoid generic classes like `.text` or `.message`

### 3. Update the script
- Edit `src/content/platforms/[platform].js`
- Update the `messageSelectors` array
- Reload extension
- Test again

### 4. Test thoroughly
- Test with multiple messages
- Test with different content types
- Verify user messages are filtered out

---

## Success Criteria

Extension is working when:
- ✅ Loads without errors
- ✅ Buttons appear on all tested platforms
- ✅ Buttons only on AI responses, not user messages
- ✅ Click triggers GPTZero automation
- ✅ GPTZero tab opens and processes text
- ✅ Results extracted accurately (±5% tolerance)
- ✅ Results modal displays correctly
- ✅ Revision requests populate input correctly
- ✅ No console errors during normal operation
- ✅ Works across multiple consecutive checks

---

## Performance Metrics

Track these during testing:

- **Button Injection Time:** < 1 second after message appears
- **GPTZero Tab Open:** < 2 seconds
- **Text Paste:** Immediate
- **Submit Click:** < 1 second after paste
- **Result Extraction:** < 30 seconds total
- **Modal Display:** < 1 second after extraction

---

## Automated Test Script

Run this in any platform's console to verify detection:

```javascript
// Quick diagnostic
(function() {
  console.log('=== Fast GPTZero Diagnostic ===');

  // Check script loaded
  console.log('Script loaded:', typeof init !== 'undefined');

  // Check for messages
  const selectors = [
    '[data-message-author-role="assistant"]', // ChatGPT
    '[data-test-render-count]',               // Claude
    '.model-response-text',                   // Gemini
    '[data-testid="grok-message"]'           // Grok
  ];

  selectors.forEach(sel => {
    const count = document.querySelectorAll(sel).length;
    if (count > 0) {
      console.log(`✓ Found ${count} messages with: ${sel}`);
    }
  });

  // Check for buttons
  const buttons = document.querySelectorAll('.fast-gptzero-button').length;
  console.log('Buttons added:', buttons);

  // Check input areas
  const inputs = document.querySelectorAll('textarea, [contenteditable="true"]').length;
  console.log('Input areas found:', inputs);

  console.log('=== End Diagnostic ===');
})();
```

---

**Ready to start testing!** 🚀

Begin with ChatGPT as it's the most popular platform and easiest to test.
