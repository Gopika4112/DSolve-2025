console.log("✅ AI Energy Saver Extension Loaded");
let totalCO2=0;
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

            // Listen for user input
            chatBox.addEventListener("input", handleUserInput);
            chatBox.addEventListener("keyup", handleUserInput);

            // Detect when the user submits a query
            chatBox.addEventListener("keydown", function (event) {
                if (event.key === "Enter" && !event.shiftKey) {
                    setTimeout(() => displayCarbonFootprint(), 500);
                }
            });
        } else {
            console.log("⏳ Waiting for active ChatGPT input box...");
        }
    }, 1000);
}


function calculateCarbonFootprint() {
    let minCO2 = 2; // Minimum estimated CO₂ in grams
    let maxCO2 = 5; // Maximum estimated CO₂ in grams
    let estimatedCO2 = (Math.random() * (maxCO2 - minCO2) + minCO2).toFixed(2); // Random value in range
    return estimatedCO2;
}
// Convert CO₂ emissions to equivalent driving distance
function co2ToDrivingDistance(co2Grams) {
    const gramsPerKm = 192; // Average car CO₂ emission per km
    return (co2Grams / gramsPerKm).toFixed(2);
}

function displayCarbonFootprint() {
    let footprint = calculateCarbonFootprint();
    totalCO2 += parseFloat(footprint); // Update cumulative total

    let kmEquivalent = co2ToDrivingDistance(totalCO2);

    let label = document.getElementById("carbon-footprint-label");
    if (!label) {
        label = document.createElement("div");
        label.id = "carbon-footprint-label";
        label.style.cssText = `
            position: fixed; top: 10px; right: 10px; 
            background: #222; color: #fff;
            padding: 10px 15px; border-radius: 10px;
            font-size: 16px; font-weight: bold; opacity: 0.9;
            z-index: 10000;
        `;
        document.body.appendChild(label);
    }

    // More meaningful text display
    label.innerHTML = `
        🌍 This query used ~${footprint}g of CO₂<br>
        🔄 Total CO₂ emitted so far: ~${totalCO2.toFixed(2)}g<br>
        🚗 This equals driving a car for ~${kmEquivalent} km
    `;
}


function handleUserInput() {
    let chatBox = document.querySelector("div#prompt-textarea.ProseMirror");
    let userQuery = chatBox.innerText.trim(); // Get input text

    if (isGeneralQuestion(userQuery)) {
        showSuggestionBanner();
    }

    if (requiresWordLimit(userQuery)) {
        askForWordLimit();
    }
}

// Function to check if a query requires a word limit
function requiresWordLimit(query) {
    let keywords = ["write a paragraph", "explain", "describe", "summarize", "generate an essay", "long answer"];
    return keywords.some(keyword => query.toLowerCase().includes(keyword));
}

// Function to prompt for word limit
function askForWordLimit() {
    let existingInput = document.getElementById("word-limit-input");
    if (existingInput) return; // Don't create multiple inputs

    let inputContainer = document.createElement("div");
    inputContainer.id = "word-limit-container";
    inputContainer.style.cssText = `
        position: fixed; bottom: 140px; left: 20px; 
        background: #f0f0f0; color: black;
        padding: 8px 12px; border-radius: 5px; font-size: 14px; 
        border: 1px solid black; z-index: 10000;
    `;
    
    let label = document.createElement("label");
    label.textContent = "Set word limit:";
    label.style.marginRight = "5px";
    label.style.color = "black";
    
    let input = document.createElement("input");
    input.id = "word-limit-input";
    input.type = "number";
    input.min = "1";
    input.placeholder = "Enter limit";
    input.style.width = "60px";
    input.style.color = "black";
    input.style.background = "white";
    input.style.border = "1px solid black";

    let button = document.createElement("button");
    button.textContent = "Apply";
    button.style.marginLeft = "5px";
    button.style.padding = "2px 5px";
    button.style.cursor = "pointer";
    button.style.border = "1px solid black";
    button.style.background = "#007bff";
    button.style.color = "white";
    button.style.borderRadius = "3px";

    button.addEventListener("click", function () {
        let wordLimit = input.value.trim();
        if (wordLimit && parseInt(wordLimit) > 0) {
            applyWordLimit(parseInt(wordLimit));
            inputContainer.remove(); // Remove input box after setting limit
        } else {
            alert("Please enter a valid word limit.");
        }
    });

    inputContainer.appendChild(label);
    inputContainer.appendChild(input);
    inputContainer.appendChild(button);
    document.body.appendChild(inputContainer);
}

// Function to enforce word limit in the ChatGPT input box
function applyWordLimit(limit) {
    let chatBox = document.querySelector("div#prompt-textarea.ProseMirror");
    if (chatBox) {
        chatBox.innerText += ` (Limit: ${limit} words)`; // Modify query
    }
}

// Function to check if a query is general (for Google search suggestion)
function isGeneralQuestion(query) {
    let keywords = ["define", "what is", "who is", "how to", "why does", "meaning of", "explain"];
    return keywords.some(keyword => query.toLowerCase().startsWith(keyword));
}

// Function to show a Google search suggestion
function showSuggestionBanner() {
    let existingBanner = document.getElementById("ai-energy-saver-banner");
    if (existingBanner) return;

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