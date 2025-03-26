document.addEventListener("DOMContentLoaded", function () {
    let toggleButton = document.getElementById("toggleButton");

    // Load saved state from storage
    chrome.storage.sync.get("enabled", function (data) {
        if (data.enabled) {
            toggleButton.textContent = "ON";
            toggleButton.classList.add("on");
        }
    });

    toggleButton.addEventListener("click", function () {
        let isEnabled = toggleButton.textContent === "ON"; // Fix: Check ON state
    
        // Toggle button UI
        toggleButton.textContent = isEnabled ? "OFF" : "ON";
        toggleButton.classList.toggle("on", !isEnabled);
    
        // Save state to Chrome storage
        chrome.storage.sync.set({ enabled: !isEnabled });
    });
    
});
