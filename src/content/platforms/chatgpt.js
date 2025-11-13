// Fast GPTZero - ChatGPT Content Script

console.log('Fast GPTZero: ChatGPT content script loaded');

// State management
let processedMessages = new Set();
let lastCheckResult = null;

// Initialize
function init() {
  observeMessages();
  console.log('Fast GPTZero: Initialized for ChatGPT');
}

// Observe for new messages
function observeMessages() {
  const observer = new MutationObserver((mutations) => {
    addButtonsToMessages();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial scan
  addButtonsToMessages();
}

// Add buttons to AI response messages
function addButtonsToMessages() {
  // ChatGPT uses specific selectors for assistant messages
  const messageSelectors = [
    '[data-message-author-role="assistant"]',
    '.agent-turn',
    '.group.agent-turn'
  ];

  messageSelectors.forEach(selector => {
    const messages = document.querySelectorAll(selector);

    messages.forEach(message => {
      // Skip if already processed
      const messageId = generateMessageId(message);
      if (processedMessages.has(messageId)) return;

      // Find the text content area
      const contentArea = message.querySelector('.markdown, [class*="markdown"], .prose, [class*="prose"]');
      if (!contentArea) return;

      // Add button
      addCheckButton(message, contentArea);
      processedMessages.add(messageId);
    });
  });
}

// Generate unique ID for message
function generateMessageId(element) {
  const text = element.textContent.substring(0, 100);
  return `${text}-${element.offsetTop}`;
}

// Add check button to message
function addCheckButton(messageElement, contentArea) {
  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = 'margin-top: 12px; display: flex; gap: 8px; align-items: center;';

  // Create check button
  const button = document.createElement('button');
  button.className = 'fast-gptzero-button';
  button.innerHTML = `
    <svg class="fast-gptzero-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>Check with GPTZero</span>
  `;

  button.addEventListener('click', () => {
    handleCheck(contentArea, button, messageElement);
  });

  buttonContainer.appendChild(button);

  // Insert after content area
  contentArea.parentNode.insertBefore(buttonContainer, contentArea.nextSibling);
}

// Handle check button click
async function handleCheck(contentArea, button, messageElement) {
  try {
    // Extract text
    const text = extractTextContent(contentArea);

    if (!text || text.trim().length < 50) {
      showToast('Text is too short (minimum 50 characters)', 'error');
      return;
    }

    // Update button state
    button.classList.add('checking');
    button.innerHTML = `
      <svg class="fast-gptzero-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>Checking...</span>
    `;

    // Show loading modal
    showLoadingModal();

    // Send to background script
    chrome.runtime.sendMessage({
      action: 'checkWithGPTZero',
      text: text,
      platform: 'chatgpt'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Fast GPTZero: Message error:', chrome.runtime.lastError);
        showToast('Failed to communicate with extension', 'error');
        resetButton(button);
        hideLoadingModal();
        return;
      }

      console.log('Fast GPTZero: Response received:', response);
    });

  } catch (error) {
    console.error('Fast GPTZero: Error during check:', error);
    showToast('An error occurred', 'error');
    resetButton(button);
    hideLoadingModal();
  }
}

// Extract text content from element
function extractTextContent(element) {
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true);

  // Remove code blocks (we'll add them back with proper formatting)
  const codeBlocks = clone.querySelectorAll('pre, code');
  codeBlocks.forEach(block => {
    block.textContent = block.textContent;
  });

  return clone.textContent.trim();
}

// Reset button to original state
function resetButton(button) {
  button.classList.remove('checking', 'checked');
  button.innerHTML = `
    <svg class="fast-gptzero-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>Check with GPTZero</span>
  `;
}

// Show loading modal
function showLoadingModal() {
  hideLoadingModal(); // Remove any existing modal

  const overlay = document.createElement('div');
  overlay.className = 'fast-gptzero-overlay';
  overlay.id = 'fast-gptzero-loading-overlay';

  const modal = document.createElement('div');
  modal.className = 'fast-gptzero-modal';
  modal.innerHTML = `
    <div class="fast-gptzero-modal-header">
      <h3 class="fast-gptzero-modal-title">Checking with GPTZero</h3>
    </div>
    <div class="fast-gptzero-spinner"></div>
    <div class="fast-gptzero-loading-text">Opening GPTZero and analyzing text...</div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);
}

// Hide loading modal
function hideLoadingModal() {
  const overlay = document.getElementById('fast-gptzero-loading-overlay');
  const modal = document.querySelector('.fast-gptzero-modal');

  if (overlay) overlay.remove();
  if (modal) modal.remove();
}

// Show results modal
function showResultsModal(results) {
  hideLoadingModal();

  const overlay = document.createElement('div');
  overlay.className = 'fast-gptzero-overlay';
  overlay.id = 'fast-gptzero-results-overlay';

  const modal = document.createElement('div');
  modal.className = 'fast-gptzero-modal';

  // Determine score class
  const aiProbability = parseFloat(results.aiProbability) || 0;
  let scoreClass = '';
  if (aiProbability >= 70) scoreClass = 'high-ai';
  else if (aiProbability <= 30) scoreClass = 'low-ai';

  modal.innerHTML = `
    <div class="fast-gptzero-modal-header">
      <h3 class="fast-gptzero-modal-title">GPTZero Results</h3>
      <button class="fast-gptzero-close" id="close-results">&times;</button>
    </div>
    <div class="fast-gptzero-results">
      <div class="fast-gptzero-score ${scoreClass}">${results.aiProbability}%</div>
      <div class="fast-gptzero-label">${results.classification || 'AI Probability'}</div>
      ${results.details ? `
        <div class="fast-gptzero-details">
          ${Object.entries(results.details).map(([key, value]) => `
            <div class="fast-gptzero-detail-item">
              <span class="fast-gptzero-detail-label">${formatLabel(key)}</span>
              <span class="fast-gptzero-detail-value">${value}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    <div class="fast-gptzero-actions">
      <button class="fast-gptzero-button-secondary" id="close-modal">Close</button>
      <button class="fast-gptzero-button-primary" id="request-revision">Request Revision</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Store results for revision
  lastCheckResult = results;

  // Event listeners
  document.getElementById('close-results').addEventListener('click', hideResultsModal);
  document.getElementById('close-modal').addEventListener('click', hideResultsModal);
  overlay.addEventListener('click', hideResultsModal);
  document.getElementById('request-revision').addEventListener('click', handleRevisionRequest);

  // Reset all buttons
  document.querySelectorAll('.fast-gptzero-button').forEach(btn => resetButton(btn));
}

// Hide results modal
function hideResultsModal() {
  const overlay = document.getElementById('fast-gptzero-results-overlay');
  const modal = document.querySelector('.fast-gptzero-modal');

  if (overlay) overlay.remove();
  if (modal) modal.remove();
}

// Handle revision request
function handleRevisionRequest() {
  hideResultsModal();

  if (!lastCheckResult) {
    showToast('No results to revise', 'error');
    return;
  }

  // Find the input textarea
  const inputArea = document.querySelector('textarea[placeholder*="Message"], #prompt-textarea, textarea');

  if (!inputArea) {
    showToast('Could not find input area', 'error');
    return;
  }

  // Create revision prompt
  const revisionPrompt = `The previous response scored ${lastCheckResult.aiProbability}% AI-generated according to GPTZero. Please revise the response to sound more human and natural while maintaining the same information and helpfulness.`;

  // Set the value and trigger events
  inputArea.value = revisionPrompt;
  inputArea.dispatchEvent(new Event('input', { bubbles: true }));
  inputArea.focus();

  showToast('Revision request added to input', 'success');
}

// Format label for display
function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Show toast notification
function showToast(message, type = 'info') {
  // Remove existing toasts
  document.querySelectorAll('.fast-gptzero-toast').forEach(toast => toast.remove());

  const toast = document.createElement('div');
  toast.className = `fast-gptzero-toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Fast GPTZero: Message received:', message);

  if (message.action === 'showResults') {
    showResultsModal(message.results);
    sendResponse({ success: true });
  } else if (message.action === 'showError') {
    hideLoadingModal();
    showToast(message.error, 'error');
    document.querySelectorAll('.fast-gptzero-button').forEach(btn => resetButton(btn));
    sendResponse({ success: true });
  }

  return true; // Keep channel open for async response
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
