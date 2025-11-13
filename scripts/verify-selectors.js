// Selector Verification Tool for Fast GPTZero
// Run this in the browser console on each platform to verify selectors

(function() {
  'use strict';

  console.log('%c=== Fast GPTZero Selector Verification ===', 'color: #667eea; font-size: 16px; font-weight: bold;');

  const currentURL = window.location.hostname;
  let platformName = 'Unknown';
  let selectors = {};

  // Determine platform
  if (currentURL.includes('chat.openai.com')) {
    platformName = 'ChatGPT';
    selectors = {
      messages: [
        '[data-message-author-role="assistant"]',
        '.agent-turn',
        '.group.agent-turn'
      ],
      content: [
        '.markdown',
        '[class*="markdown"]',
        '.prose',
        '[class*="prose"]'
      ],
      input: [
        'textarea[placeholder*="Message"]',
        '#prompt-textarea',
        'textarea'
      ]
    };
  } else if (currentURL.includes('claude.ai')) {
    platformName = 'Claude';
    selectors = {
      messages: [
        '[data-test-render-count]',
        '.font-claude-message',
        '[class*="Message"]'
      ],
      userFilter: [
        '[data-is-user-message="true"]',
        '[class*="user"]'
      ],
      input: [
        '[contenteditable="true"]'
      ]
    };
  } else if (currentURL.includes('gemini.google.com')) {
    platformName = 'Gemini';
    selectors = {
      messages: [
        '.model-response-text',
        '[data-test-id="model-response"]',
        '.response-container',
        'model-response',
        '[class*="model"]',
        '.message-content'
      ],
      input: [
        'rich-textarea',
        '[contenteditable="true"]',
        'textarea'
      ]
    };
  } else if (currentURL.includes('grok.x.com') || currentURL.includes('x.com')) {
    platformName = 'Grok';
    selectors = {
      messages: [
        '[data-testid="grok-message"]',
        '.grok-response',
        '[class*="GrokMessage"]',
        '[data-grok-message]',
        'article[role="article"]'
      ],
      input: [
        '[contenteditable="true"]',
        'textarea',
        'input[type="text"]'
      ]
    };
  } else if (currentURL.includes('gptzero.me')) {
    platformName = 'GPTZero';
    selectors = {
      input: [
        'textarea',
        '[contenteditable="true"]',
        '[placeholder*="paste"]',
        '[placeholder*="text"]'
      ],
      buttons: [
        'button[type="submit"]',
        'button'
      ],
      results: [
        '[class*="result"]',
        '[class*="score"]',
        '[class*="probability"]'
      ]
    };
  }

  console.log(`%cPlatform: ${platformName}`, 'color: #43e97b; font-size: 14px; font-weight: bold;');
  console.log(`%cURL: ${window.location.href}`, 'color: #666;');
  console.log('');

  if (platformName === 'Unknown') {
    console.log('%c❌ Unknown platform - cannot verify selectors', 'color: #f5576c;');
    console.log('This tool only works on: ChatGPT, Claude, Gemini, Grok, or GPTZero');
    return;
  }

  // Test each selector group
  for (const [group, selectorList] of Object.entries(selectors)) {
    console.log(`%c${group.charAt(0).toUpperCase() + group.slice(1)}:`, 'color: #667eea; font-weight: bold;');

    selectorList.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        const count = elements.length;

        if (count > 0) {
          console.log(`  %c✓ ${selector}`, 'color: #43e97b;', `(${count} found)`);

          // Show sample for first element
          if (count > 0 && elements[0]) {
            const sample = elements[0].textContent.substring(0, 50).trim();
            if (sample) {
              console.log(`    Sample: "${sample}..."`);
            }

            // Check visibility
            const rect = elements[0].getBoundingClientRect();
            const visible = rect.width > 0 && rect.height > 0;
            console.log(`    Visible: ${visible ? '✓' : '✗'}`);
          }
        } else {
          console.log(`  %c✗ ${selector}`, 'color: #f5576c;', '(0 found)');
        }
      } catch (error) {
        console.log(`  %c⚠ ${selector}`, 'color: #ff9800;', `(Error: ${error.message})`);
      }
    });

    console.log('');
  }

  // Platform-specific checks
  if (platformName === 'ChatGPT') {
    console.log('%cChatGPT-Specific Checks:', 'color: #667eea; font-weight: bold;');
    const assistantMessages = document.querySelectorAll('[data-message-author-role="assistant"]');
    const userMessages = document.querySelectorAll('[data-message-author-role="user"]');
    console.log(`  Assistant messages: ${assistantMessages.length}`);
    console.log(`  User messages: ${userMessages.length}`);
    console.log('');
  }

  if (platformName === 'Claude') {
    console.log('%cClaude-Specific Checks:', 'color: #667eea; font-weight: bold;');
    const allMessages = document.querySelectorAll('[data-test-render-count]');
    const userMessages = Array.from(allMessages).filter(m =>
      m.closest('[data-is-user-message="true"]')
    );
    console.log(`  Total messages: ${allMessages.length}`);
    console.log(`  User messages: ${userMessages.length}`);
    console.log(`  Assistant messages: ${allMessages.length - userMessages.length}`);
    console.log('');
  }

  if (platformName === 'GPTZero') {
    console.log('%cGPTZero-Specific Checks:', 'color: #667eea; font-weight: bold;');

    // Check for percentages
    const bodyText = document.body.textContent;
    const percentages = bodyText.match(/\d+%/g);
    if (percentages) {
      console.log(`  Found percentages: ${percentages.join(', ')}`);
    } else {
      console.log('  No percentages found (may not have results yet)');
    }

    // Check for submit buttons
    console.log('  Submit button candidates:');
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      const text = btn.textContent.toLowerCase();
      if (text.match(/check|scan|analyze|submit/)) {
        console.log(`    - "${btn.textContent.trim()}"`);
      }
    });
    console.log('');
  }

  // Check if extension button exists
  console.log('%cExtension Status:', 'color: #667eea; font-weight: bold;');
  const extensionButtons = document.querySelectorAll('.fast-gptzero-button');
  if (extensionButtons.length > 0) {
    console.log(`  %c✓ Extension buttons found: ${extensionButtons.length}`, 'color: #43e97b;');
  } else {
    console.log(`  %c✗ No extension buttons found`, 'color: #f5576c;');
    console.log('  Make sure the extension is loaded and refresh the page');
  }

  console.log('');
  console.log('%c=== Verification Complete ===', 'color: #667eea; font-size: 16px; font-weight: bold;');

  // Provide recommendations
  console.log('');
  console.log('%cRecommendations:', 'color: #667eea; font-weight: bold;');

  const messageSelectors = selectors.messages || [];
  let foundMessages = false;

  for (const selector of messageSelectors) {
    const count = document.querySelectorAll(selector).length;
    if (count > 0) {
      foundMessages = true;
      break;
    }
  }

  if (!foundMessages && messageSelectors.length > 0) {
    console.log('%c  ⚠ No messages found - try sending a message first', 'color: #ff9800;');
  } else if (foundMessages && extensionButtons.length === 0) {
    console.log('%c  ⚠ Messages found but no buttons - check if extension loaded', 'color: #ff9800;');
    console.log('     1. Check console for "Fast GPTZero: [Platform] content script loaded"');
    console.log('     2. Reload the extension');
    console.log('     3. Refresh this page');
  } else if (foundMessages && extensionButtons.length > 0) {
    console.log('%c  ✓ Everything looks good!', 'color: #43e97b;');
  }

  console.log('');
  console.log('For detailed testing, see: TESTING_CHECKLIST.md');

})();
