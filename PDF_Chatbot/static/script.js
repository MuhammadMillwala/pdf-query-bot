document.getElementById("pdf-file").addEventListener("change", async function () {
    const chatBody = document.getElementById("chat-body");
    const fileInput = document.getElementById("pdf-file");
    const file = fileInput.files[0];

    // Display a message if no file is selected
    if (!file) {
        const botMessage = document.createElement("div");
        botMessage.className = "bot-message";
        botMessage.textContent = "Please select a PDF file to upload.";
        chatBody.appendChild(botMessage);
        return;
    }

    // Display upload progress message
    const uploadingMessage = document.createElement("div");
    uploadingMessage.className = "bot-message";
    uploadingMessage.textContent = "Uploading your PDF... Please wait.";
    chatBody.appendChild(uploadingMessage);

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("/upload/", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            const successMessage = document.createElement("div");
            successMessage.className = "bot-message";
            successMessage.textContent = result.message;
            chatBody.appendChild(successMessage);
        } else {
            const errorMessage = document.createElement("div");
            errorMessage.className = "bot-message";
            errorMessage.textContent = "An error occurred. Please try again.";
            chatBody.appendChild(errorMessage);
        }
    } catch (error) {
        const errorMessage = document.createElement("div");
        errorMessage.className = "bot-message";
        errorMessage.textContent = "An error occurred while uploading the file.";
        chatBody.appendChild(errorMessage);
    } finally {
        // Clear file input after processing
        fileInput.value = "";
        uploadingMessage.remove();
    }
});

document.getElementById("send-message-btn").addEventListener("click", async function () {
    const chatBody = document.getElementById("chat-body");
    const chatInput = document.getElementById("chat-input");
    const message = chatInput.value.trim();

    if (message) {
        // Display user's message
        const userMessage = document.createElement("div");
        userMessage.className = "user-message"; // Use appropriate class for user's message
        userMessage.style.backgroundColor = "#d1e7dd"; // Different color for user's message
        userMessage.textContent = message;
        chatBody.appendChild(userMessage);

        // Clear input field
        chatInput.value = "";

        // Auto-scroll to the bottom of the chat body
        chatBody.scrollTop = chatBody.scrollHeight;

        // Display loading message
        const botLoadingMessage = document.createElement("div");
        botLoadingMessage.className = "bot-message";
        botLoadingMessage.textContent = "Processing your query... Please wait.";
        chatBody.appendChild(botLoadingMessage);

        try {
            // Send message to the server
            const response = await fetch("/query/", {
                method: "POST",
                body: new URLSearchParams({ query: message }),
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            const data = await response.json();

            // Remove loading message
            botLoadingMessage.remove();

            // Display bot's response
            const botMessage = document.createElement("div");
            botMessage.className = "bot-message";
            botMessage.style.backgroundColor = "#f8d7da"; // Different color for bot's message
            botMessage.textContent = data.answer || "No response received.";
            chatBody.appendChild(botMessage);

            // Auto-scroll to the bottom of the chat body
            chatBody.scrollTop = chatBody.scrollHeight;
        } catch (error) {
            // Handle errors
            botLoadingMessage.textContent = "An error occurred. Please try again.";
        }
    } else {
        alert("Please enter a message!");
    }
});