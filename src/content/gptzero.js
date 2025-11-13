// Fast GPTZero - GPTZero Content Script
// This script runs on gptzero.me to help with automation

console.log('Fast GPTZero: GPTZero content script loaded');

// Monitor for results on the page
let resultsObserver = null;
let lastKnownResults = null;

// Initialize
function init() {
  console.log('Fast GPTZero: Initializing GPTZero helper');

  // Set up observer to watch for results
  observeResults();

  // Check if results are already visible
  setTimeout(() => {
    checkForResults();
  }, 1000);
}

// Observe for result changes
function observeResults() {
  resultsObserver = new MutationObserver((mutations) => {
    checkForResults();
  });

  resultsObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

// Check for results on the page
function checkForResults() {
  const results = extractDetailedResults();

  if (results.found && JSON.stringify(results) !== JSON.stringify(lastKnownResults)) {
    console.log('Fast GPTZero: New results detected', results);
    lastKnownResults = results;

    // Store results so background script can retrieve them
    window.__gptzeroResults = results;

    // Notify background script if needed
    chrome.runtime.sendMessage({
      action: 'gptzeroResultsReady',
      results: results
    }).catch(err => {
      console.log('Fast GPTZero: Could not send results (expected if background not listening)', err);
    });
  }
}

// Extract detailed results from GPTZero page
function extractDetailedResults() {
  console.log('Fast GPTZero: Extracting results...');

  const results = {
    found: false,
    aiProbability: null,
    classification: null,
    details: {},
    sentences: [],
    aiSentenceCount: 0,
    timestamp: Date.now()
  };

  try {
    // Method 1: Look for score/percentage displays
    const percentageElements = document.querySelectorAll('[class*="score"], [class*="percentage"], [class*="probability"]');

    for (const el of percentageElements) {
      const text = el.textContent;
      const percentMatch = text.match(/(\d+(?:\.\d+)?)%/);

      if (percentMatch) {
        results.aiProbability = percentMatch[1];
        results.found = true;
        console.log('Fast GPTZero: Found percentage', results.aiProbability);
        break;
      }
    }

    // Method 2: Search entire body text for patterns
    if (!results.found) {
      const bodyText = document.body.textContent;

      // Look for "XX% AI-generated" or similar patterns
      const patterns = [
        /(\d+(?:\.\d+)?)%\s*AI/i,
        /(\d+(?:\.\d+)?)%\s*probability/i,
        /AI\s*probability[:\s]*(\d+(?:\.\d+)?)%/i,
        /score[:\s]*(\d+(?:\.\d+)?)%/i
      ];

      for (const pattern of patterns) {
        const match = bodyText.match(pattern);
        if (match) {
          results.aiProbability = match[1];
          results.found = true;
          console.log('Fast GPTZero: Found AI probability via pattern', results.aiProbability);
          break;
        }
      }
    }

    // Method 3: Look for classification text
    const classificationPatterns = [
      { pattern: /likely\s+written\s+entirely\s+by\s+AI/i, value: 'Likely AI-generated' },
      { pattern: /likely\s+to\s+include\s+AI/i, value: 'Likely includes AI' },
      { pattern: /may\s+include\s+AI/i, value: 'May include AI' },
      { pattern: /entirely\s+human/i, value: 'Likely human-written' },
      { pattern: /mixed/i, value: 'Mixed (AI and Human)' },
      { pattern: /human[-\s]written/i, value: 'Human-written' }
    ];

    const bodyText = document.body.textContent;
    for (const { pattern, value } of classificationPatterns) {
      if (pattern.test(bodyText)) {
        results.classification = value;
        console.log('Fast GPTZero: Found classification', results.classification);
        break;
      }
    }

    // Method 4: Extract sentence-level analysis (ADVANCED)
    const sentenceElements = document.querySelectorAll(
      '[class*="sentence"], [data-sentence], [class*="highlight"]'
    );

    console.log('Fast GPTZero: Found', sentenceElements.length, 'sentence elements');

    sentenceElements.forEach((el, index) => {
      const sentenceText = el.textContent.trim();

      // Skip if too short or empty
      if (sentenceText.length < 10) return;

      // Look for confidence/probability indicators
      let confidence = null;
      let isAI = false;

      // Check for data attributes
      const aiScore = el.getAttribute('data-ai-score') || el.getAttribute('data-confidence');
      if (aiScore) {
        confidence = aiScore;
        isAI = parseFloat(aiScore) > 50;
      }

      // Check for color/styling that indicates AI detection
      const bgColor = window.getComputedStyle(el).backgroundColor;
      const color = window.getComputedStyle(el).color;
      const classList = el.className.toLowerCase();

      // GPTZero typically highlights AI sentences with specific classes
      if (classList.includes('highlight') || classList.includes('ai') ||
          classList.includes('detected') || classList.includes('risky')) {
        isAI = true;

        // Try to find confidence nearby
        const parent = el.closest('[class*="sentence-container"], [class*="analysis"]');
        if (parent) {
          const confidenceEl = parent.querySelector('[class*="confidence"], [class*="score"], [class*="probability"]');
          if (confidenceEl) {
            const confMatch = confidenceEl.textContent.match(/(\d+(?:\.\d+)?)%/);
            if (confMatch) confidence = confMatch[1];
          }
        }
      }

      // Look for explanation nearby
      let explanation = null;
      const parentContainer = el.closest('[class*="container"], [class*="item"], [class*="row"]');
      if (parentContainer) {
        const explanationEl = parentContainer.querySelector(
          '[class*="explanation"], [class*="reason"], [class*="detail"], [class*="description"]'
        );
        if (explanationEl && explanationEl !== el) {
          explanation = explanationEl.textContent.trim();
        }
      }

      // If this looks like an AI sentence, add it
      if (isAI || confidence) {
        results.sentences.push({
          text: sentenceText,
          confidence: confidence || 'High',
          aiGenerated: isAI,
          explanation: explanation || 'Exhibits patterns typical of AI-generated text',
          index: index
        });

        if (isAI) results.aiSentenceCount++;
      }
    });

    // Method 5: Look for sentence count in text (e.g., "11 AI sentences detected")
    const sentenceCountMatch = bodyText.match(/(\d+)\s*(?:AI|risky)?\s*sentences?/i);
    if (sentenceCountMatch) {
      const count = parseInt(sentenceCountMatch[1]);
      if (count > 0) {
        results.aiSentenceCount = count;
        console.log('Fast GPTZero: Found sentence count:', count);
      }
    }

    // Method 6: Look for additional metrics
    const metricElements = document.querySelectorAll('[class*="metric"], [class*="stat"], [class*="detail"]');

    metricElements.forEach(el => {
      const text = el.textContent;

      // Extract label-value pairs
      const labelValueMatch = text.match(/(.+?):\s*(.+)/);
      if (labelValueMatch) {
        const label = labelValueMatch[1].trim();
        const value = labelValueMatch[2].trim();
        results.details[label] = value;
      }
    });

    // Method 7: Check if analysis is still loading
    const loadingIndicators = document.querySelectorAll(
      '[class*="loading"], [class*="spinner"], [class*="analyzing"], [class*="processing"]'
    );

    if (loadingIndicators.length > 0 && !results.found) {
      console.log('Fast GPTZero: Analysis still loading');
      results.loading = true;
      results.message = 'Analysis in progress...';
    }

    // Method 8: Look for results in specific GPTZero UI elements
    const resultCards = document.querySelectorAll('[class*="result-card"], [class*="result-panel"], [class*="detection-result"]');

    if (resultCards.length > 0) {
      results.found = true;

      // Try to extract more structured information
      resultCards.forEach(card => {
        const cardText = card.textContent;

        // Look for metrics in the card
        const sentences = card.querySelectorAll('p, span, div');
        sentences.forEach(el => {
          const text = el.textContent.trim();

          // Check for percentage
          const percentMatch = text.match(/(\d+(?:\.\d+)?)%/);
          if (percentMatch && !results.aiProbability) {
            results.aiProbability = percentMatch[1];
          }

          // Check for classification keywords
          if (text.includes('AI') || text.includes('human') || text.includes('mixed')) {
            if (!results.classification) {
              results.classification = text;
            }
          }
        });
      });
    }

    // Method 9: Try alternative sentence extraction from list items or table rows
    if (results.sentences.length === 0) {
      const listItems = document.querySelectorAll('li, tr, [role="listitem"]');

      listItems.forEach((item, index) => {
        const text = item.textContent.trim();

        // Look for patterns like "Sentence: ... | Confidence: 95%"
        const sentenceMatch = text.match(/(.+?)(?:\||confidence|score|probability)/i);
        const confidenceMatch = text.match(/(\d+(?:\.\d+)?)%/);

        if (sentenceMatch && text.length > 20) {
          const sentenceText = sentenceMatch[1].trim();
          const confidence = confidenceMatch ? confidenceMatch[1] : null;

          // Check if marked as AI
          const isAI = text.toLowerCase().includes('ai') ||
                       (confidence && parseFloat(confidence) > 70);

          if (isAI || confidence) {
            results.sentences.push({
              text: sentenceText,
              confidence: confidence || 'High',
              aiGenerated: isAI,
              explanation: 'Flagged by GPTZero detection algorithm',
              index: index
            });

            if (isAI) results.aiSentenceCount++;
          }
        }
      });
    }

    // If we found a percentage but no classification, infer it
    if (results.found && results.aiProbability && !results.classification) {
      const prob = parseFloat(results.aiProbability);
      if (prob >= 80) {
        results.classification = 'Likely AI-generated';
      } else if (prob >= 50) {
        results.classification = 'May include AI';
      } else if (prob >= 20) {
        results.classification = 'May include AI';
      } else {
        results.classification = 'Likely human-written';
      }
    }

    // Clean up details
    if (Object.keys(results.details).length === 0) {
      results.details = null;
    }

    // Log summary
    console.log('Fast GPTZero: Final results', results);
    console.log('Fast GPTZero: Extracted', results.sentences.length, 'sentences');
    console.log('Fast GPTZero: AI sentence count:', results.aiSentenceCount);

  } catch (error) {
    console.error('Fast GPTZero: Error extracting results', error);
    results.error = error.message;
  }

  return results;
}

// Auto-fill helper - can be triggered by background script
function autoFillText(text) {
  console.log('Fast GPTZero: Auto-filling text', text.substring(0, 50) + '...');

  try {
    // Find the textarea or input area
    const selectors = [
      'textarea',
      '[contenteditable="true"]',
      'input[type="text"]',
      '[placeholder*="paste"]',
      '[placeholder*="text"]',
      '#text-area',
      '.textarea'
    ];

    let inputElement = null;

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        // Check if element is visible
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        if (rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
          inputElement = el;
          break;
        }
      }
      if (inputElement) break;
    }

    if (!inputElement) {
      console.error('Fast GPTZero: Could not find input element');
      return { success: false, error: 'Input element not found' };
    }

    // Set the text
    if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
      inputElement.value = text;
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      inputElement.textContent = text;
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    }

    console.log('Fast GPTZero: Text filled successfully');

    // Try to find and click submit button
    const submitButton = findSubmitButton(inputElement);

    if (submitButton) {
      console.log('Fast GPTZero: Found submit button, clicking...');

      setTimeout(() => {
        submitButton.click();
        console.log('Fast GPTZero: Submit button clicked');
      }, 500);

      return { success: true, submitted: true };
    }

    return { success: true, submitted: false };

  } catch (error) {
    console.error('Fast GPTZero: Error auto-filling', error);
    return { success: false, error: error.message };
  }
}

// Find submit button near input element
function findSubmitButton(inputElement) {
  // Look for buttons near the input
  const buttonSelectors = [
    'button[type="submit"]',
    'button',
    '[role="button"]',
    'input[type="submit"]'
  ];

  // Search in parent containers
  let container = inputElement.parentElement;
  let attempts = 0;

  while (container && attempts < 5) {
    for (const selector of buttonSelectors) {
      const buttons = container.querySelectorAll(selector);

      for (const btn of buttons) {
        const text = btn.textContent.toLowerCase();
        const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';

        if (
          text.includes('check') ||
          text.includes('scan') ||
          text.includes('analyze') ||
          text.includes('submit') ||
          text.includes('detect') ||
          ariaLabel.includes('check') ||
          ariaLabel.includes('submit')
        ) {
          return btn;
        }
      }
    }

    container = container.parentElement;
    attempts++;
  }

  // If not found near input, search entire document
  const allButtons = document.querySelectorAll('button, [role="button"]');
  for (const btn of allButtons) {
    const text = btn.textContent.toLowerCase();
    if (text.includes('check for ai') || text.includes('scan') || text.includes('detect ai')) {
      return btn;
    }
  }

  return null;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Fast GPTZero: Received message', message);

  if (message.action === 'fillText') {
    const result = autoFillText(message.text);
    sendResponse(result);
  } else if (message.action === 'getResults') {
    const results = extractDetailedResults();
    sendResponse(results);
  }

  return true;
});

// Make extract function available globally for background script
window.__extractGPTZeroResults = extractDetailedResults;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('Fast GPTZero: GPTZero content script initialized');
