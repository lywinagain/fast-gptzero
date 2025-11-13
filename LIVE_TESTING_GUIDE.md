# Live Platform Testing Guide

**IMPORTANT:** I cannot browse websites or install extensions, but I've updated the extension to work with the correct URLs. Follow these steps to test yourself!

## ✅ URLs Updated

The extension now supports:
- ✅ https://chatgpt.com/* (NEW!)
- ✅ https://chat.openai.com/* (OLD URL)
- ✅ https://gemini.google.com/* (includes /app)
- ✅ https://claude.ai/*
- ✅ https://grok.x.com/*
- ✅ https://x.com/* (Grok)
- ✅ https://gptzero.me/*

---

## 🚀 Step-by-Step Testing Instructions

### STEP 1: Install the Extension (2 minutes)

1. Open Chrome browser
2. Go to: `chrome://extensions/`
3. Toggle "Developer mode" ON (top-right corner)
4. Click "Load unpacked"
5. Navigate to and select the `fast-gptzero` folder
6. Verify: Extension appears with no errors
7. Verify: Version shows 1.0.2

---

### STEP 2: Test ChatGPT ⭐ (HIGHEST PRIORITY)

#### A. Navigate to ChatGPT
Go to either:
- https://chatgpt.com/ (NEW URL)
- https://chat.openai.com/ (OLD URL)

#### B. Open DevTools
- Press F12 (or right-click → Inspect)
- Go to Console tab
- Look for: `Fast GPTZero: ChatGPT content script loaded`
- If NOT visible: Refresh page (Ctrl+F5)

#### C. Start a Conversation
1. Ask ChatGPT: "Write a 200-word paragraph about artificial intelligence"
2. Wait for response to fully load
3. Scroll down to see complete response

#### D. Look for the Button
- Purple button should appear below ChatGPT's response
- Button text: "Check with GPTZero"
- Button should have gradient purple background
- If NO button: Run diagnostic (see below)

#### E. Click the Button
1. Click "Check with GPTZero"
2. Button should change to "Checking..."
3. Loading modal should appear
4. Check your tabs - new GPTZero tab should open

#### F. Watch GPTZero Tab
1. Switch to the GPTZero tab (don't close it)
2. Watch for:
   - Text being pasted into input area
   - Submit button being clicked
   - Results appearing (wait 10-30 seconds)

#### G. Check Results
1. Switch back to ChatGPT tab
2. Results modal should appear with:
   - Large percentage (e.g., "85%")
   - Classification (e.g., "Likely AI-generated")
   - Close and "Request Revision" buttons

#### H. Test Revision Request
1. Click "Request Revision"
2. Modal should close
3. Input box should have revision prompt
4. Toast notification: "Revision request added to input"

---

### STEP 3: Test Gemini

#### A. Navigate
Go to: https://gemini.google.com/app

#### B. Check Console
- Press F12 → Console
- Look for: `Fast GPTZero: Gemini content script loaded`
- If not loaded: Refresh

#### C. Test Workflow
1. Ask Gemini: "Write about machine learning"
2. Wait for response
3. Look for purple button
4. Click button
5. Verify GPTZero automation works
6. Check results modal

---

### STEP 4: Test Claude

#### A. Navigate
Go to: https://claude.ai/

#### B. Check Console
- F12 → Console
- Look for: `Fast GPTZero: Claude content script loaded`

#### C. Test Workflow
1. Start conversation with Claude
2. Wait for Claude's response
3. Verify button appears ONLY on Claude's messages (not yours)
4. Click button
5. Test full workflow

#### D. Special Check: Revision Request
- Claude uses contenteditable divs
- Verify revision prompt populates correctly
- Text should appear in input area

---

### STEP 5: Test GPTZero Automation

#### A. Navigate
Go to: https://gptzero.me/

#### B. Check Console
- F12 → Console
- Look for: `Fast GPTZero: GPTZero content script loaded`

#### C. Manual Test First
1. Paste some text manually
2. Click submit
3. Wait for results
4. Note where the percentage appears
5. Note the result structure

#### D. Test Automation
1. Go back to ChatGPT
2. Trigger a check
3. Switch to GPTZero tab immediately
4. Watch the automation:
   - Text pasted ✓
   - Button clicked ✓
   - Results loaded ✓
   - Score extracted ✓

---

### STEP 6: Test Grok (Optional)

#### A. Navigate
Go to: https://grok.x.com/ or https://x.com/

#### B. Access Grok
- May require X/Twitter account
- Look for Grok interface

#### C. Test
1. Start Grok conversation
2. Check for button on Grok responses
3. Verify regular tweets don't get buttons
4. Test workflow

---

## 🐛 Diagnostic Commands

If button doesn't appear, run these in Console:

### Check if script loaded:
```javascript
console.log('Script check');
// Should see "Script check" logged
```

### ChatGPT: Check for messages
```javascript
document.querySelectorAll('[data-message-author-role="assistant"]').length
// Should return number of ChatGPT messages
```

### Check for buttons added:
```javascript
document.querySelectorAll('.fast-gptzero-button').length
// Should match number of messages (or be close)
```

### Check content areas:
```javascript
document.querySelectorAll('.markdown, .prose').length
// Should return number of content areas
```

### Full Diagnostic:
```javascript
// Copy from scripts/verify-selectors.js and paste entire content
// This will run complete verification
```

---

## ✅ Success Checklist

### For Each Platform:

- [ ] **Script loads** - Console shows load message
- [ ] **Button appears** - On AI responses only
- [ ] **Button clicks** - Changes to "Checking..."
- [ ] **Modal appears** - Loading modal shows
- [ ] **GPTZero opens** - New tab created
- [ ] **Text pastes** - Visible in GPTZero input
- [ ] **Submit clicks** - Automation triggers
- [ ] **Results load** - Percentage appears on GPTZero
- [ ] **Results show** - Modal displays in original tab
- [ ] **Revision works** - Text populates input
- [ ] **No errors** - Console clear of red errors

---

## 📊 Test Report Form

After testing each platform:

```markdown
### Platform: [ChatGPT/Gemini/Claude/Grok]
**URL Tested:**
**Date:**
**Browser:** Chrome [version]

#### ✅ What Worked:
-

#### ❌ What Failed:
-

#### 🔧 Selector Issues:
-

#### 📝 Console Errors:
```
[paste any errors]
```

#### 💡 Recommendations:
-
```

---

## 🆘 Common Issues

### Issue: "Script not loaded"
**Solution:**
1. Check chrome://extensions/ - extension enabled?
2. Click reload button on extension
3. Hard refresh page (Ctrl+Shift+R)
4. Check manifest.json has correct URL

### Issue: "Button not appearing"
**Solution:**
1. Wait 2-3 seconds after response loads
2. Scroll to see full response
3. Run diagnostic: `document.querySelectorAll('[data-message-author-role="assistant"]').length`
4. If 0: Selectors may be outdated

### Issue: "Button appears multiple times"
**Solution:**
- Known issue with message ID generation
- Reload page
- May need to fix generateMessageId function

### Issue: "GPTZero tab doesn't open"
**Solution:**
1. Check background service worker:
   - chrome://extensions/ → Fast GPTZero → "service worker"
   - Look for errors
2. Check permissions granted
3. Try reloading extension

### Issue: "Results not extracted"
**Solution:**
1. Switch to GPTZero tab
2. Wait 30+ seconds
3. Check if results visible on page
4. Run in GPTZero console: `window.__extractGPTZeroResults()`
5. If returns null: extraction selectors need update

---

## 📸 What to Screenshot

Please capture:

1. **Extension loaded** - chrome://extensions/ page showing Fast GPTZero
2. **Console with load message** - F12 showing script loaded
3. **Button visible** - Purple button below AI response
4. **Loading modal** - Modal showing "Checking..."
5. **GPTZero tab** - Text pasted and submitted
6. **Results modal** - Score displayed
7. **Any errors** - Red errors in console

---

## 🎯 Testing Priority

1. **ChatGPT** (https://chatgpt.com/) ← START HERE
   - Most important
   - Easiest to test
   - Best for validation

2. **GPTZero** (https://gptzero.me/)
   - Core functionality
   - Must work!

3. **Gemini** (https://gemini.google.com/app)
   - Second most popular

4. **Claude** (https://claude.ai/)
   - Good to verify

5. **Grok** (https://grok.x.com/)
   - Optional

---

## 🔄 After Testing

1. Document results using test report form
2. Note any broken selectors
3. Capture error messages
4. Share findings

I can then:
- Update selectors based on your findings
- Fix any bugs you discover
- Improve extraction logic
- Update documentation

---

**Remember:** I cannot browse or test, but with your testing feedback, I can fix any issues you find! 🚀
