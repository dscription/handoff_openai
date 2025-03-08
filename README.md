# OpenAI Assistant Response Processor

A Chrome extension that captures and processes responses from the OpenAI Assistant chat interface.

## Features

- Automatically captures the latest response from OpenAI's assistant
- Processes and stores responses for further use
- Simple popup interface to view the latest captured response
- Real-time updates when new responses are captured

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing these files
5. The extension icon should appear in your Chrome toolbar

## Usage

1. Visit [chat.openai.com](https://chat.openai.com)
2. Start a conversation with the AI assistant
3. The extension will automatically capture the latest response
4. Click the extension icon in the toolbar to view the latest captured response
5. The response will be stored and can be processed according to your needs

## Customization

To add your own processing logic:

1. Modify the `processResponse()` function in `background.js`
2. Add your custom processing code where indicated in the comments
3. You can:
   - Send responses to your own API
   - Transform the text
   - Generate analytics
   - Trigger other actions

## Files

- `manifest.json`: Extension configuration
- `content.js`: Monitors the webpage for new responses
- `background.js`: Processes captured responses
- `popup.html`: Extension popup interface
- `popup.js`: Popup functionality

## Requirements

- Google Chrome browser
- Access to chat.openai.com

## Note

This extension requires permission to access chat.openai.com to function properly. It only captures and processes the assistant's responses and does not interfere with the normal operation of the chat interface.
