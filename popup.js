// Global state
let assistants = [];
let currentAssistant = null;

// Load saved configuration
document.addEventListener("DOMContentLoaded", async () => {
  const { apiKey } = await chrome.storage.local.get(["apiKey"]);
  if (apiKey) {
    document.getElementById("apiKey").value = apiKey;
    await initializeWithApiKey(apiKey);
  }
});

// Test API key
async function testApiKey(apiKey) {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Key validation error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      if (response.status === 401) {
        throw new Error(
          "Invalid API key. Please check your key and try again."
        );
      } else {
        throw new Error(
          `API Error: ${errorData.error?.message || response.statusText}`
        );
      }
    }

    return true;
  } catch (error) {
    console.error("API Key test error:", error);
    throw error;
  }
}

// Save API key and initialize
document.getElementById("saveApiKey").addEventListener("click", async () => {
  const apiKey = document.getElementById("apiKey").value.trim();

  if (!apiKey) {
    updateStatus("Please enter an API key", false);
    return;
  }

  updateStatus("Validating API key...", true);

  try {
    await testApiKey(apiKey);
    await chrome.storage.local.set({ apiKey });
    await initializeWithApiKey(apiKey);
  } catch (error) {
    console.error("API key validation error:", error);
    updateStatus(error.message, false);
  }
});

// Initialize with API key
async function initializeWithApiKey(apiKey) {
  updateStatus("Loading assistants...", true);
  try {
    // Fetch assistants
    assistants = await fetchAssistants(apiKey);
    if (assistants.length === 0) {
      updateStatus("No assistants found", false);
      return;
    }

    // Populate assistant select
    populateAssistantSelect();
    updateStatus(`Found ${assistants.length} assistant(s)`, true);
    document.getElementById("refreshResponse").disabled = false;
  } catch (error) {
    updateStatus(`Error: ${error.message}`, false);
  }
}

// Populate assistant select dropdown
function populateAssistantSelect() {
  const select = document.getElementById("assistantSelect");
  select.innerHTML = "";
  select.classList.add("visible");

  assistants.forEach((assistant) => {
    const option = document.createElement("option");
    option.value = assistant.id;
    option.textContent = assistant.name || assistant.id;
    select.appendChild(option);
  });

  // Show initial assistant info
  if (assistants.length > 0) {
    currentAssistant = assistants[0];
    updateAssistantInfo(currentAssistant);
    fetchLatestResponse(currentAssistant.id);
  }

  select.addEventListener("change", (e) => {
    const assistant = assistants.find((a) => a.id === e.target.value);
    if (assistant) {
      currentAssistant = assistant;
      updateAssistantInfo(assistant);
      fetchLatestResponse(assistant.id);
    }
  });
}

// Update assistant info display
function updateAssistantInfo(assistant) {
  const infoDiv = document.getElementById("assistantInfo");
  infoDiv.textContent = `Model: ${assistant.model}`;
}

// Fetch assistants from API
async function fetchAssistants(apiKey) {
  try {
    const response = await fetch("https://api.openai.com/v1/assistants", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Assistants API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `API Error (${response.status}): ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Fetch assistants error:", error);
    throw error;
  }
}

// Fetch latest response for an assistant
async function fetchLatestResponse(assistantId) {
  const apiKey = document.getElementById("apiKey").value;
  if (!apiKey || !assistantId) return;

  updateStatus("Fetching latest response...", true);

  try {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      updateStatus("Please navigate to chat.openai.com", false);
      return;
    }

    // Execute script to get thread ID from the page
    const [threadIdResult] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const threadElement = document.querySelector(
          ".thread-title .pg-subheader"
        );
        if (!threadElement) return null;
        // Extract just the thread ID without any potential prefix
        const threadText = threadElement.textContent;
        const threadMatch = threadText.match(/thread_[a-zA-Z0-9]+/);
        return threadMatch ? threadMatch[0] : null;
      },
    });

    const threadId = threadIdResult.result;
    if (!threadId) {
      updateStatus(
        "No thread ID found on the page. Please make sure you're on a chat page.",
        false
      );
      return;
    }

    // Get messages from the specific thread
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json().catch(() => ({}));
      throw new Error(
        `Failed to fetch messages: ${
          errorData.error?.message || messagesResponse.statusText
        }`
      );
    }

    const messages = await messagesResponse.json();

    // Find the latest assistant message
    const latestAssistantMessage = messages.data.find(
      (msg) => msg.role === "assistant"
    );

    if (latestAssistantMessage) {
      updateResponseDisplay(latestAssistantMessage);
      updateStatus("Response fetched successfully", true);
    } else {
      updateStatus("No assistant response found in thread", false);
    }
  } catch (error) {
    console.error("Fetch response error:", error);
    updateStatus(`Error: ${error.message}`, false);
  }
}

// Update response display
function updateResponseDisplay(message) {
  const responseBox = document.getElementById("responseBox");
  const contextBox = document.getElementById("contextBox");
  const timestampElement = document.getElementById("timestamp");

  responseBox.textContent = message.content[0].text.value;

  // Add more context information
  const created = new Date(message.created_at);
  const timeAgo = getTimeAgo(created);

  contextBox.textContent = `Thread ID: ${message.thread_id} | Message ID: ${message.id} | ${timeAgo}`;
  timestampElement.textContent = `Created: ${created.toLocaleString()}`;
}

// Helper function to format time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
}

// Refresh response button
document.getElementById("refreshResponse").addEventListener("click", () => {
  if (currentAssistant) {
    fetchLatestResponse(currentAssistant.id);
  }
});

// Update status message
function updateStatus(message, isSuccess) {
  const statusElement = document.getElementById("status");
  statusElement.textContent = message;
  statusElement.classList.remove(isSuccess ? "inactive" : "active");
  statusElement.classList.add(isSuccess ? "active" : "inactive");
}
