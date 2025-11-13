// Fast GPTZero - Gemini Content Script

console.log('Fast GPTZero: Gemini content script loaded');

// State management
let processedMessages = new Set();
let lastCheckResult = null;

// Initialize
function init() {
  observeMessages();
  console.log('Fast GPTZero: Initialized for Gemini');
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
  // Gemini uses specific selectors for model messages
  const messageSelectors = [
    '.model-response-text',
    '[data-test-id="model-response"]',
    '.response-container',
    'model-response',
    '[class*="model"]'
  ];

  messageSelectors.forEach(selector => {
    const messages = document.querySelectorAll(selector);

    messages.forEach(message => {
      // Skip user messages
      if (message.closest('[class*="user"]') || message.classList.contains('user')) {
        return;
      }

      // Skip if already processed
      const messageId = generateMessageId(message);
      if (processedMessages.has(messageId)) return;

      // Find the text content area
      const contentArea = message.querySelector('.markdown, .response-content, [class*="content"]') || message;
      if (!contentArea || contentArea.textContent.trim().length < 10) return;

      // Add button
      addCheckButton(message, contentArea);
      processedMessages.add(messageId);
    });
  });

  // Also check for message-content divs (Gemini's structure)
  const messageContent = document.querySelectorAll('.message-content');
  messageContent.forEach(message => {
    // Check if this is a model response
    const parent = message.closest('[class*="model"], [class*="response"]');
    if (!parent) return;

    const messageId = generateMessageId(message);
    if (processedMessages.has(messageId)) return;

    if (message.textContent.trim().length > 10) {
      addCheckButton(message, message);
      processedMessages.add(messageId);
    }
  });
}

// Generate unique ID for message
function generateMessageId(element) {
  const text = element.textContent.substring(0, 100);
  return `${text}-${element.offsetTop}`;
}

// Add check button to message
function addCheckButton(messageElement, contentArea) {
  // Check if button already exists
  if (messageElement.querySelector('.fast-gptzero-button')) return;

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

  // Insert after message element
  if (messageElement.parentNode) {
    messageElement.appendChild(buttonContainer);
  }
}

// Handle check button click
async function handleCheck(contentArea, button, messageElement) {
  try {
    // Extract text
    const text = extractTextContent(messageElement);

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
      platform: 'gemini'
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
  const clone = element.cloneNode(true);

  // Remove our button
  const buttons = clone.querySelectorAll('.fast-gptzero-button');
  buttons.forEach(btn => btn.remove());

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
  hideLoadingModal();

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

  lastCheckResult = results;

  document.getElementById('close-results').addEventListener('click', hideResultsModal);
  document.getElementById('close-modal').addEventListener('click', hideResultsModal);
  overlay.addEventListener('click', hideResultsModal);
  document.getElementById('request-revision').addEventListener('click', handleRevisionRequest);

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

  // Find Gemini's input area
  const inputArea = document.querySelector('rich-textarea, [contenteditable="true"], textarea');

  if (!inputArea) {
    showToast('Could not find input area', 'error');
    return;
  }

  const revisionPrompt = `The previous response scored ${lastCheckResult.aiProbability}% AI-generated according to GPTZero. Please revise the response to sound more human and natural while maintaining the same information and helpfulness.`;

  if (inputArea.tagName === 'TEXTAREA') {
    inputArea.value = revisionPrompt;
  } else {
    inputArea.textContent = revisionPrompt;
  }

  inputArea.dispatchEvent(new Event('input', { bubbles: true }));
  inputArea.focus();

  showToast('Revision request added to input', 'success');
}

// Handle sending selected sentences to chat
function handleSendSelected() {
  if (!lastCheckResult || !lastCheckResult.sentences) {
    showToast('No sentences to send', 'error');
    return;
  }

  const selectedSentences = [];
  document.querySelectorAll('.fast-gptzero-sentence-checkbox:checked').forEach(checkbox => {
    const index = parseInt(checkbox.id.replace('sentence-', ''));
    const aiSentences = lastCheckResult.sentences.filter(s => s.aiGenerated);
    if (aiSentences[index]) selectedSentences.push(aiSentences[index]);
  });

  if (selectedSentences.length === 0) {
    showToast('No sentences selected', 'error');
    return;
  }

  hideResultsModal();

  const inputArea = document.querySelector('rich-textarea, [contenteditable="true"], textarea');
  if (!inputArea) {
    showToast('Could not find input area', 'error');
    return;
  }

  const sentenceList = selectedSentences.map((s, idx) =>
    `${idx + 1}. "${s.text}" (Confidence: ${s.confidence}${typeof s.confidence === 'string' && s.confidence.includes('%') ? '' : '%'})`
  ).join('\n');

  const prompt = `GPTZero detected ${selectedSentences.length} AI-generated sentence${selectedSentences.length > 1 ? 's' : ''} in your previous response:\n\n${sentenceList}\n\nPlease rewrite these sentences to sound more natural and human-like while preserving the meaning and accuracy.`;

  if (inputArea.tagName === 'TEXTAREA' || inputArea.tagName === 'INPUT') {
    inputArea.value = prompt;
  } else {
    inputArea.textContent = prompt;
  }
  inputArea.dispatchEvent(new Event('input', { bubbles: true }));
  inputArea.focus();

  showToast(`${selectedSentences.length} sentence${selectedSentences.length > 1 ? 's' : ''} sent to chat`, 'success');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

  return true;
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
