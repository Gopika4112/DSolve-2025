console.log("✅ AI Energy Saver Extension Loaded");

// Ask background.js for the "enabled" value
chrome.runtime.sendMessage({ action: "getStorage", key: "enabled" }, function (response) {
    if (response?.enabled) {
        monitorUserInput();
    } else {
        console.log("AI Energy Saver is disabled.");
    }
});

// Function to monitor user input in ChatGPT's text box
function monitorUserInput() {
    let checkExist = setInterval(() => {
        let chatBox = document.querySelector("div#prompt-textarea.ProseMirror");

        if (chatBox) {
            console.log("✅ Active ChatGPT Textbox Found!");
            clearInterval(checkExist);

            // Listen for both 'input' and 'keyup' events
            chatBox.addEventListener("input", handleUserInput);
            chatBox.addEventListener("keyup", handleUserInput);
        } else {
            console.log("⏳ Waiting for active ChatGPT input box...");
        }
    }, 1000); // Check every second
}

function handleUserInput() {
    let chatBox = document.querySelector("div#prompt-textarea.ProseMirror");
    let userQuery = chatBox.innerText.trim(); // Get input text

    if (isGeneralQuestion(userQuery)) {
        showSuggestionBanner();
    }
}



// Function to check if a query is general
function isGeneralQuestion(query) {
    let keywords = ["define", "what is", "who is", "how to", "why does", "meaning of"];
    return keywords.some(keyword => query.toLowerCase().startsWith(keyword));
}

// Function to show a Google search suggestion
function showSuggestionBanner() {
    let existingBanner = document.getElementById("ai-energy-saver-banner");
    if (existingBanner) return; // Avoid multiple banners

    let banner = document.createElement("div");
    banner.id = "ai-energy-saver-banner";
    banner.textContent = "🌍 AI models consume more energy. Try Google for quick answers and save power!";
    banner.style.cssText = `
        position: fixed; bottom: 100px; left: 20px; 
        background: yellow; color: black;
        padding: 5px 10px; border-radius: 5px;
        font-size: 14px; font-weight: bold;
        cursor: pointer; z-index: 9999;
    `;

    banner.addEventListener("click", function () {
        let query = document.querySelector("div#prompt-textarea.ProseMirror").innerText;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
    });

    document.body.appendChild(banner);

    // Remove banner after 10 seconds
    setTimeout(() => {
        banner.remove();
    }, 10000);
}
