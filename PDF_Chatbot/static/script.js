document.getElementById("pdf-file").addEventListener("change", async function () {
    
    const selectedFile = event.target.files[0]; 
    if (selectedFile) {
        console.log('Selected file:', selectedFile.name); 
        const textInputContainer = document.querySelector('.text-input-container');
        const uploadFormSelector = document.querySelector('.upload-btn');
        const successMessageSelector = document.querySelector('#pdf-success-message');
        const botMesssageSelector = document.querySelector('.bot-message');
        successMessageSelector.style.display = 'block';
        textInputContainer.style.display = 'flex';
        uploadFormSelector.style.display = 'none';
        botMesssageSelector.style.display = 'none';
    }

    
    const chatBody = document.getElementById("chat-body");
    const fileInput = document.getElementById("pdf-file");
    const file = fileInput.files[0];
    const fileInputs = document.getElementById('pdf-file');
    const textInputContainer = document.querySelector('.text-input-container');
    if (fileInputs.files.length > 0) { 
        textInputContainer.style.display = 'flex'; 
    }   

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
            successMessage.className = "success-message";
            successMessage.textContent = result.message;
            chatBody.appendChild(successMessage);
            const fileInput = document.getElementById('pdf-file');
            const textInputContainer = document.querySelector('.text-input-container');
            if (fileInput.files.length > 0) { 
                textInputContainer.style.display = 'flex'; 
            }
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
async function sendMessage(){
    const successMessageSelector = document.querySelector('#pdf-success-message');
    successMessageSelector.style.display = 'none';
    const chatBody = document.getElementById("chat-body");
    const successMessage = chatBody.querySelector(".success-message");
    if (successMessage) {
        successMessage.remove();
    }
    chatBody.style.alignItems = 'start';
    chatBody.style.justifyContent = 'start';
    const chatInput = document.getElementById("chat-input");
    const message = chatInput.value.trim();

    if (message) {
        // Display user's message
        const userMessage = document.createElement("div");
        userMessage.className = "user-message"; // Use appropriate class for user's message
        userMessage.style.backgroundColor = "#d1e7dd"; // Different color for user's message
        userMessage.style.alignSelf = 'flex-end';
        userMessage.style.padding = '10px';
        userMessage.style.borderRadius='10px';
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
};

document.getElementById("chat-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {  
        event.preventDefault();    
        sendMessage();             
    }
});

document.getElementById("send-message-btn").addEventListener("click", sendMessage);