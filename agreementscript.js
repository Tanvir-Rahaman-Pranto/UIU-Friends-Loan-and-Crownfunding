// Simple Javascript Code for Agreement & Transfer Room

function confirmTransfer() {
    var confirmed = confirm("Are you sure you have transferred 5,000 BDT to Karim's bKash? False confirmation will result in a ban.");
    
    if (confirmed) {
        // Change Button State
        var btn = document.getElementById("confirmBtn");
        btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Transfer Reported Successfully';
        btn.style.backgroundColor = "#10b981"; // Emerald green
        btn.disabled = true;
        
        // Change Waiting message
        var spinner = document.getElementById("spinnerIcon");
        spinner.className = "material-symbols-outlined"; // Remove spin class
        spinner.innerHTML = "hourglass_empty";
        
        var waitText = document.getElementById("waitingText");
        waitText.innerHTML = "Transfer marked as complete. Waiting for Karim to verify receipt.";
        
        // Change Top Status Badge
        var dot = document.getElementById("pulseDot");
        dot.style.backgroundColor = "#10b981"; // Green dot
        
        var badgeText = document.getElementById("statusText");
        badgeText.innerHTML = "Status: Transferred. Awaiting Borrower Verification";
        
        var badge = document.getElementById("statusBadge");
        badge.style.backgroundColor = "#d1fae5";
        badge.style.borderColor = "#a7f3d0";
        badge.style.color = "#047857";
        
        alert("Transfer confirmed! A notification has been sent to Karim.");
    }
}

function sendMessage() {
    var input = document.getElementById("messageInput");
    var message = input.value.trim();
    
    if (message === "") {
        return;
    }
    
    var chatMessages = document.getElementById("chatMessages");
    
    // Get current time
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    
    // Create new message HTML exactly matching the design
    var newMessageHTML = `
        <div class="msg-row mine">
            <div class="msg-bubble">
                ${message}
                <p class="msg-time">${strTime}</p>
            </div>
        </div>
    `;
    
    chatMessages.innerHTML += newMessageHTML;
    
    // Clear input
    input.value = "";
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add enter key support for chat
document.getElementById("messageInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
