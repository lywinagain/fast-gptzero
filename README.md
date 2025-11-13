# Fast GPTZero 🤖✓

A Chrome extension that automatically checks AI-generated responses using GPTZero's web interface. No API key required!

## 🌟 Features

- **One-Click AI Detection**: Add a "Check with GPTZero" button to all AI response messages
- **Automated Workflow**: Automatically opens GPTZero, pastes text, and extracts results
- **Multi-Platform Support**: Works with ChatGPT, Claude, Gemini, and Grok
- **Result Display**: Beautiful modal showing AI probability and classification
- **Revision Requests**: Easily ask the AI to revise responses detected as AI-generated
- **No API Key Needed**: Uses GPTZero's free web interface

## 🚀 Supported Platforms

- ✅ **ChatGPT** (chat.openai.com)
- ✅ **Claude** (claude.ai)
- ✅ **Gemini** (gemini.google.com)
- ✅ **Grok** (grok.x.com)

## 📦 Installation

### Step 1: Clone or Download

```bash
git clone https://github.com/yourusername/fast-gptzero.git
cd fast-gptzero
```

Or download as ZIP and extract.

### Step 2: Create Icons (Required)

The extension needs icon files to work. Choose one of these methods:

#### Option A: Using the provided script (requires ImageMagick or Inkscape)

```bash
./create-icons.sh
```

#### Option B: Manual creation

1. Use an online converter like [CloudConvert](https://cloudconvert.com/svg-to-png)
2. Upload `icons/icon.svg`
3. Convert to these sizes and save in `icons/` directory:
   - icon16.png (16x16)
   - icon32.png (32x32)
   - icon48.png (48x48)
   - icon128.png (128x128)

#### Option C: Quick placeholder (for testing)

Create simple solid color PNG files with these commands:

```bash
# If you have ImageMagick:
convert -size 16x16 xc:'#667eea' icons/icon16.png
convert -size 32x32 xc:'#667eea' icons/icon32.png
convert -size 48x48 xc:'#667eea' icons/icon48.png
convert -size 128x128 xc:'#667eea' icons/icon128.png
```

### Step 3: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `fast-gptzero` directory
5. The extension should now appear in your extensions list!

## 📖 Usage

### Basic Workflow

1. **Visit an AI Platform**: Go to ChatGPT, Claude, Gemini, or Grok
2. **Chat with the AI**: Get a response from the AI
3. **Check the Response**: Click the "Check with GPTZero" button that appears below the AI's response
4. **View Results**: A modal will show the AI detection score and classification
5. **Request Revision** (optional): Click "Request Revision" to automatically ask the AI to rewrite more naturally

### How It Works

1. When you click "Check with GPTZero":
   - The extension copies the AI response text
   - Opens GPTZero in a background tab
   - Automatically pastes and submits the text
   - Extracts the detection results
   - Shows you the results in a modal
   - Closes the GPTZero tab

2. The results show:
   - **AI Probability**: Percentage likelihood the text is AI-generated
   - **Classification**: Category (e.g., "Likely AI-generated")
   - **Additional Details**: Any extra metrics from GPTZero

3. If you want the AI to revise:
   - Click "Request Revision"
   - A prompt is automatically added to your input
   - Send it to get a more human-sounding response

## 🎨 User Interface

### Button Styles

- **Normal**: Purple gradient button
- **Checking**: Pink/red gradient with spinner (during analysis)
- **Checked**: Blue gradient (after getting results)

### Result Modal

The modal displays:
- Large percentage score with color coding:
  - 🔴 Red (>70%): High AI probability
  - 🟢 Green (<30%): Low AI probability
  - 🟣 Purple (30-70%): Medium probability
- Classification label
- Additional metrics (if available)
- Action buttons (Close / Request Revision)

## ⚙️ Technical Details

### Architecture

```
fast-gptzero/
├── manifest.json           # Extension configuration
├── background.js           # Service worker (orchestrates automation)
├── content-chatgpt.js     # ChatGPT integration
├── content-claude.js      # Claude integration
├── content-gemini.js      # Gemini integration
├── content-grok.js        # Grok integration
├── content-gptzero.js     # GPTZero automation
├── styles.css             # Shared styles
├── popup.html             # Extension popup UI
├── popup.js               # Popup functionality
└── icons/                 # Extension icons
```

### How the Automation Works

1. **Content Scripts**: Inject buttons into AI platform pages
2. **Background Worker**: Coordinates the GPTZero automation
3. **GPTZero Script**: Handles text injection and result extraction
4. **Message Passing**: Chrome extension messaging API for communication

### Permissions

The extension requires these permissions:

- `activeTab`: To interact with the current tab
- `tabs`: To create and manage tabs
- `storage`: To store settings (future use)
- `scripting`: To inject scripts for automation

Host permissions for:
- ChatGPT, Claude, Gemini, Grok (to add buttons)
- GPTZero (to automate detection)

## 🐛 Troubleshooting

### Button Not Appearing

- **Refresh the page**: Try reloading the AI chat page
- **Check extension is enabled**: Go to `chrome://extensions/` and ensure it's enabled
- **Wait for messages to load**: The button appears after AI responses are fully rendered

### "Failed to communicate with extension"

- **Reload the extension**: Go to `chrome://extensions/` and click the reload icon
- **Check console**: Open DevTools (F12) and check for errors

### Results Not Showing

- **GPTZero changes**: GPTZero may have updated their UI. Check the console for errors.
- **Wait longer**: Some analyses take 20-30 seconds
- **Check GPTZero manually**: Visit gptzero.me to ensure the service is working

### Icons Not Loading

- **Create icon files**: Follow the installation steps to create icon PNG files
- **Check file names**: Ensure files are named exactly: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
- **Check file location**: Icons must be in the `icons/` directory

## 🔒 Privacy & Security

- **No Data Collection**: This extension doesn't collect or store any data
- **No External Servers**: All processing happens locally and on GPTZero's public website
- **No API Keys**: Uses GPTZero's free web interface
- **Open Source**: All code is visible and auditable

## ⚠️ Limitations

- **Rate Limits**: Subject to GPTZero's usage limits
- **Web Interface Changes**: May break if GPTZero updates their website
- **Detection Accuracy**: Results depend on GPTZero's detection accuracy
- **Text Length**: Very short texts (<50 characters) cannot be analyzed
- **No API Access**: This is a web automation tool, not an official API integration

## 🛠️ Development

### Project Structure

- Content scripts run on AI platform pages
- Background service worker orchestrates automation
- GPTZero content script handles detection automation
- Message passing coordinates between components

### Testing

1. Load the extension in developer mode
2. Visit a supported AI platform
3. Generate an AI response
4. Click the "Check with GPTZero" button
5. Verify results appear correctly

### Debugging

Enable verbose logging:
```javascript
// Check browser console (F12) for logs prefixed with:
// "Fast GPTZero:"
```

## 📄 License

MIT License - feel free to use and modify!

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📧 Support

If you encounter issues:
1. Check the Troubleshooting section
2. Look for errors in the browser console (F12)
3. Open an issue on GitHub

## 🙏 Acknowledgments

- GPTZero for their AI detection service
- The open-source community

## ⚡ Quick Start Example

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/fast-gptzero.git
cd fast-gptzero

# 2. Create icons (if you have ImageMagick)
./create-icons.sh

# 3. Load in Chrome
# - Open chrome://extensions/
# - Enable Developer mode
# - Click "Load unpacked"
# - Select the fast-gptzero folder

# 4. Try it out!
# - Go to chat.openai.com
# - Chat with ChatGPT
# - Click "Check with GPTZero" on any response
```

---

**Note**: This extension automates GPTZero's web interface and is not officially affiliated with GPTZero. Use responsibly and respect GPTZero's terms of service.
