# OpenAI Assistant Response Processor

A Chrome extension that captures and processes responses from the OpenAI Assistant chat interface.

## Features

- Automatically captures the latest response from OpenAI's assistant
- Processes and stores responses for further use
- Simple popup interface to view the latest captured response
- Real-time updates when new responses are captured
- Lists all your OpenAI assistants and their details
- Fetches the latest response from any selected assistant

## Prerequisites

- Google Chrome browser
- OpenAI API key (get one from [OpenAI's platform](https://platform.openai.com/api-keys))
- Access to chat.openai.com

## Installation

1. Clone  or download this repository:

   
   -Clone: ```bash
   git clone https://github.com/dscription/handoff_openai.git
   cd handoff_openai
   ```
   - Download: Click on Code => Local => Download.zip
   - Make sure to unzip the file.

2. Install the Chrome extension:

   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the directory containing these files
   - The extension icon should appear in your Chrome toolbar

3. Configure the extension:
   - Click on the extension icon in your Chrome toolbar
   - Enter your OpenAI API key in the provided field
   - Click "Save API Key"
   - The extension will automatically load your available assistants

## Usage

1. Visit [chat.openai.com](https://chat.openai.com)
2. Start a conversation with any AI assistant
3. Click the extension icon in the toolbar to:
   - View all your available assistants
   - Select different assistants from the dropdown
   - See the latest response from the current thread
   - View message timestamps and thread information
4. Click "Refresh" to update and fetch the latest response

## Files

- `manifest.json`: Extension configuration
- `popup.html`: Extension popup interface
- `popup.js`: Main extension functionality
- `styles.css`: Extension styling

## Security Note

- Your OpenAI API key is stored securely in Chrome's local storage
- The extension only requests necessary permissions
- No data is sent to any third-party servers
- All communication is directly with OpenAI's API

## Troubleshooting

If you encounter issues:

1. Ensure your API key is valid and has the necessary permissions
2. Check that you're on chat.openai.com when trying to capture responses
3. Make sure you have an active conversation thread
4. Try refreshing the page if the extension isn't responding

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
