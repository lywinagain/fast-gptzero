// Fast GPTZero - Background Service Worker

console.log('Fast GPTZero: Background service worker loaded');

// Store active checks
const activeChecks = new Map();

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background: Received message', message);

  if (message.action === 'checkWithGPTZero') {
    handleGPTZeroCheck(message, sender)
      .then(result => {
        console.log('Background: Check completed', result);
        sendResponse({ success: true, result });
      })
      .catch(error => {
        console.error('Background: Check failed', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep channel open for async response
  }

  return false;
});

// Handle GPTZero check
async function handleGPTZeroCheck(message, sender) {
  const { text, platform } = message;
  const originTabId = sender.tab.id;

  console.log(`Background: Starting GPTZero check for ${platform}, origin tab: ${originTabId}`);

  try {
    // Create a new tab for GPTZero
    const gptzeroTab = await chrome.tabs.create({
      url: 'https://gptzero.me/',
      active: false // Keep it in background
    });

    console.log('Background: Created GPTZero tab', gptzeroTab.id);

    // Store the check info
    activeChecks.set(gptzeroTab.id, {
      originTabId,
      text,
      platform,
      timestamp: Date.now()
    });

    // Wait for GPTZero page to load
    await waitForTabLoad(gptzeroTab.id);

    console.log('Background: GPTZero tab loaded');

    // Wait a bit for the page to fully initialize
    await sleep(2000);

    // Inject the text into GPTZero
    await injectTextIntoGPTZero(gptzeroTab.id, text);

    console.log('Background: Text injected into GPTZero');

    // Wait for results to appear (this may take a while)
    const results = await waitForGPTZeroResults(gptzeroTab.id, originTabId);

    console.log('Background: Results received', results);

    // Send results back to origin tab
    await chrome.tabs.sendMessage(originTabId, {
      action: 'showResults',
      results: results
    });

    // Clean up - close the GPTZero tab after a delay
    setTimeout(() => {
      chrome.tabs.remove(gptzeroTab.id).catch(err => {
        console.log('Background: Tab already closed', err);
      });
      activeChecks.delete(gptzeroTab.id);
    }, 1000);

    return results;

  } catch (error) {
    console.error('Background: Error during GPTZero check', error);

    // Send error to origin tab
    try {
      await chrome.tabs.sendMessage(originTabId, {
        action: 'showError',
        error: error.message || 'Failed to check with GPTZero'
      });
    } catch (msgError) {
      console.error('Background: Failed to send error message', msgError);
    }

    throw error;
  }
}

// Wait for tab to finish loading
function waitForTabLoad(tabId, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Tab load timeout'));
    }, timeout);

    const checkStatus = () => {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          clearTimeout(timer);
          reject(new Error('Tab not found'));
          return;
        }

        if (tab.status === 'complete') {
          clearTimeout(timer);
          resolve();
        } else {
          setTimeout(checkStatus, 100);
        }
      });
    };

    checkStatus();
  });
}

// Inject text into GPTZero
async function injectTextIntoGPTZero(tabId, text) {
  try {
    // Execute script to paste text into GPTZero
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (textToCheck) => {
        // Find the textarea or input area on GPTZero
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
            if (rect.width > 0 && rect.height > 0) {
              inputElement = el;
              break;
            }
          }
          if (inputElement) break;
        }

        if (!inputElement) {
          throw new Error('Could not find input area on GPTZero');
        }

        // Set the text
        if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
          inputElement.value = textToCheck;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          inputElement.textContent = textToCheck;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Try to find and click the submit/check button
        const buttonSelectors = [
          'button[type="submit"]',
          'button:contains("Check")',
          'button:contains("Scan")',
          'button:contains("Analyze")',
          '[role="button"]',
          '.submit-button',
          '.check-button'
        ];

        let submitButton = null;

        for (const selector of buttonSelectors) {
          const buttons = document.querySelectorAll(selector);
          for (const btn of buttons) {
            const text = btn.textContent.toLowerCase();
            if (text.includes('check') || text.includes('scan') || text.includes('analyze') || text.includes('submit')) {
              submitButton = btn;
              break;
            }
          }
          if (submitButton) break;
        }

        // Also try finding button near the input
        if (!submitButton && inputElement.parentElement) {
          const nearbyButtons = inputElement.parentElement.querySelectorAll('button');
          if (nearbyButtons.length > 0) {
            submitButton = nearbyButtons[0];
          }
        }

        if (submitButton) {
          // Click the button
          setTimeout(() => {
            submitButton.click();

            // After clicking submit, try to trigger Advanced Scan
            setTimeout(() => {
              // Look for Advanced Scan button/option
              const advancedButtons = document.querySelectorAll('button, [role="button"], a');
              for (const btn of advancedButtons) {
                const text = btn.textContent.toLowerCase();
                const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';

                if (text.includes('advanced') || text.includes('deep scan') ||
                    text.includes('detailed') || ariaLabel.includes('advanced')) {
                  console.log('Found Advanced Scan button, clicking...');
                  btn.click();
                  break;
                }
              }

              // Also look for "Show all X sentences" or similar buttons to expand details
              setTimeout(() => {
                const expandButtons = document.querySelectorAll('button, [role="button"], a, summary');
                for (const btn of expandButtons) {
                  const text = btn.textContent.toLowerCase();
                  if (text.includes('show all') || text.includes('view details') ||
                      text.includes('sentences') || text.includes('expand')) {
                    console.log('Found expand button, clicking...');
                    btn.click();
                  }
                }
              }, 2000);
            }, 2000);
          }, 500);

          return { success: true, message: 'Text injected and submitted with Advanced Scan' };
        }

        return { success: true, message: 'Text injected but no submit button found' };
      },
      args: [text]
    });

    console.log('Background: Script executed to inject text');

  } catch (error) {
    console.error('Background: Error injecting text', error);
    throw new Error('Failed to inject text into GPTZero');
  }
}

// Wait for GPTZero results
async function waitForGPTZeroResults(tabId, originTabId, maxWaitTime = 60000) {
  const startTime = Date.now();
  const checkInterval = 1000; // Check every second

  return new Promise((resolve, reject) => {
    const checkForResults = async () => {
      try {
        // Check if we've exceeded max wait time
        if (Date.now() - startTime > maxWaitTime) {
          reject(new Error('Timeout waiting for GPTZero results'));
          return;
        }

        // Try to extract results from the page
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: extractResults
        });

        if (results && results[0] && results[0].result) {
          const extractedResults = results[0].result;

          if (extractedResults.found) {
            console.log('Background: Results found!', extractedResults);
            resolve(extractedResults);
            return;
          }
        }

        // No results yet, check again
        setTimeout(checkForResults, checkInterval);

      } catch (error) {
        console.error('Background: Error checking for results', error);
        reject(error);
      }
    };

    // Start checking
    setTimeout(checkForResults, 3000); // Wait 3 seconds before first check
  });
}

// Function to extract results from GPTZero page
// This runs in the context of the GPTZero page
function extractResults() {
  console.log('Extracting results from GPTZero page');

  // Look for result indicators
  const resultSelectors = [
    '[class*="result"]',
    '[class*="score"]',
    '[class*="probability"]',
    '[class*="detection"]',
    '[class*="analysis"]',
    '[data-testid*="result"]',
    '.percentage',
    '.score-value'
  ];

  let resultsContainer = null;

  for (const selector of resultSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      if (el.textContent.match(/\d+%/) || el.textContent.match(/\d+\.\d+/)) {
        resultsContainer = el;
        break;
      }
    }
    if (resultsContainer) break;
  }

  // Try to extract percentage
  let aiProbability = null;
  let classification = null;
  const details = {};

  // Look for percentage in the page
  const bodyText = document.body.textContent;
  const percentageMatches = bodyText.match(/(\d+)%/g);

  if (percentageMatches && percentageMatches.length > 0) {
    // Get the first prominent percentage
    aiProbability = percentageMatches[0];
  }

  // Look for specific text patterns
  const aiDetectedPattern = /(\d+)%\s*(AI|human|mixed)/i;
  const match = bodyText.match(aiDetectedPattern);

  if (match) {
    aiProbability = match[1];
    classification = match[2];
  }

  // Look for classification text
  const classificationPatterns = [
    /likely\s+AI/i,
    /likely\s+human/i,
    /mixed/i,
    /entirely\s+AI/i,
    /entirely\s+human/i
  ];

  for (const pattern of classificationPatterns) {
    const classMatch = bodyText.match(pattern);
    if (classMatch) {
      classification = classMatch[0];
      break;
    }
  }

  // Check if we have results
  const hasResults = aiProbability !== null || resultsContainer !== null;

  // If no results yet, return not found
  if (!hasResults) {
    // Check if there's a loading indicator
    const loadingIndicators = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="analyzing"]');
    const isLoading = loadingIndicators.length > 0;

    return {
      found: false,
      loading: isLoading,
      message: isLoading ? 'Analysis in progress...' : 'Waiting for results...'
    };
  }

  // Extract any additional details
  if (resultsContainer) {
    const detailElements = resultsContainer.querySelectorAll('[class*="detail"], [class*="metric"]');
    detailElements.forEach(el => {
      const label = el.querySelector('[class*="label"]');
      const value = el.querySelector('[class*="value"]');
      if (label && value) {
        details[label.textContent.trim()] = value.textContent.trim();
      }
    });
  }

  return {
    found: true,
    aiProbability: aiProbability || 'N/A',
    classification: classification || 'Unknown',
    details: Object.keys(details).length > 0 ? details : null,
    rawText: resultsContainer ? resultsContainer.textContent.trim() : bodyText.substring(0, 500)
  };
}

// Utility function to sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Clean up old checks periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes

  for (const [tabId, check] of activeChecks.entries()) {
    if (now - check.timestamp > maxAge) {
      console.log('Background: Cleaning up old check', tabId);
      activeChecks.delete(tabId);

      // Try to close the tab
      chrome.tabs.remove(tabId).catch(() => {
        // Tab might already be closed
      });
    }
  }
}, 60000); // Run every minute

console.log('Fast GPTZero: Background service worker initialized');
