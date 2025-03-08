// Function to observe DOM changes and detect new assistant responses
const observeAssistantResponses = () => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        const assistantResponses = document.querySelectorAll(".markdown.prose");
        if (assistantResponses.length > 0) {
          // Get the last response
          const lastResponse =
            assistantResponses[assistantResponses.length - 1];
          const responseText = lastResponse.textContent;

          // Send the response to the background script for processing
          chrome.runtime.sendMessage({
            type: "NEW_RESPONSE",
            response: responseText,
          });
        }
      }
    }
  });

  // Start observing the chat container
  const config = { childList: true, subtree: true };
  const targetNode = document.body;
  observer.observe(targetNode, config);
};

// Initialize the observer when the page loads
document.addEventListener("DOMContentLoaded", () => {
  observeAssistantResponses();
});

// Also initialize immediately in case the page is already loaded
observeAssistantResponses();
