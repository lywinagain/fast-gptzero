// Fast GPTZero - Popup Script

console.log('Fast GPTZero: Popup loaded');

// Open GPTZero button
document.getElementById('openGPTZero').addEventListener('click', () => {
  chrome.tabs.create({
    url: 'https://gptzero.me/',
    active: true
  });
});

// Display extension status
function updateStatus() {
  // You can add more sophisticated status checking here
  console.log('Fast GPTZero: Extension active');
}

// Initialize
updateStatus();
