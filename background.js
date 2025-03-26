chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ enabled: true }); // Set default enabled state
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getStorage") {
        chrome.storage.sync.get(message.key, (data) => {
            sendResponse(data || {}); // Ensure response is always sent
        });
        return true; // Keep the connection open for async response
    }
});


