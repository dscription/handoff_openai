// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NEW_RESPONSE") {
    processResponse(message.response);
  }
});

// Process the response
async function processResponse(response) {
  try {
    // Store the response in chrome storage
    await chrome.storage.local.set({
      lastResponse: response,
      timestamp: new Date().toISOString(),
    });

    // Notify any open popup
    chrome.runtime.sendMessage({
      type: "RESPONSE_PROCESSED",
      response: response,
    });
  } catch (error) {
    console.error("Error processing response:", error);
  }
}

// Optional: Add periodic checking for new messages
chrome.alarms.create("checkMessages", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "checkMessages") {
    const { apiKey } = await chrome.storage.local.get(["apiKey"]);

    if (apiKey) {
      try {
        // Fetch assistants
        const assistantsResponse = await fetch(
          "https://api.openai.com/v1/assistants",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "OpenAI-Beta": "assistants=v2",
            },
          }
        );

        if (assistantsResponse.ok) {
          const assistants = await assistantsResponse.json();

          // For each assistant, check their latest thread
          for (const assistant of assistants.data) {
            const threadsResponse = await fetch(
              "https://api.openai.com/v1/threads",
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                  "OpenAI-Beta": "assistants=v2",
                },
              }
            );

            if (threadsResponse.ok) {
              const threads = await threadsResponse.json();
              if (threads.data.length > 0) {
                const latestThread = threads.data[0];

                // Get messages from the latest thread
                const messagesResponse = await fetch(
                  `https://api.openai.com/v1/threads/${latestThread.id}/messages`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${apiKey}`,
                      "Content-Type": "application/json",
                      "OpenAI-Beta": "assistants=v2",
                    },
                  }
                );

                if (messagesResponse.ok) {
                  const messages = await messagesResponse.json();
                  const latestMessage = messages.data[0];

                  if (latestMessage && latestMessage.role === "assistant") {
                    processResponse({
                      content: latestMessage.content[0].text.value,
                      assistantId: assistant.id,
                      threadId: latestThread.id,
                      timestamp: latestMessage.created_at,
                    });
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking messages:", error);
      }
    }
  }
});
