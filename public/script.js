const socket = io('http://localhost:5500');
const messageContainer = document.getElementById('chatMessages');
const messageForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const attachmentInput = document.getElementById('attachment');
const attachmentPreview = document.getElementById('attachmentPreview');
const username = getCookie('username');

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Initialize chat
socket.emit('new-user', username);

// Handle incoming messages
socket.on('chat-message', data => {
    console.log(username);
    if (data.attachment) {
        appendMessage(`${data.username}: `, data.message, data.attachment);
    } else {
        appendMessage(`${data.username}: `, data.message);
    }
});

socket.on('user-connected', username => {
    appendMessage('',`${username} connected`,null);
});

socket.on('error', message => {
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerText = message;
    messageContainer.append(errorElement);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
});



// Handle file selection
attachmentInput.addEventListener('change', function() {
    attachmentPreview.innerHTML = '';
    [...this.files].forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'attachment-item';
        fileDiv.innerHTML = `
            <span>${file.name}</span>
            <button class="remove-attachment" onclick="this.parentElement.remove()">×</button>
        `;
        attachmentPreview.appendChild(fileDiv);
    });
});

// Handle message submission
messageForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = messageInput.value;
    console.log(attachmentInput)
    const files = attachmentInput.files;

    if (files.length > 0) {
        for (const file of files) {
            // Convert file to base64
            const reader = new FileReader();
            reader.onload = function() {
                const attachment = {
                    name: file.name,
                    type: file.type,
                    data: reader.result
                };
                
                // Emit message with attachment
                socket.emit('send-chat-message', {
                    message: message,
                    attachment: attachment
                });

                // Show in sender's chat
                appendMessage(`You: `, message, attachment);
            };
            reader.readAsDataURL(file);
        }
    } else {
        // Send normal message without attachment
        socket.emit('send-chat-message', { message });
        appendMessage(`You: `, message, null);
    }

    // Clear inputs
    messageInput.value = '';
    attachmentInput.value = '';
    attachmentPreview.innerHTML = '';
});

// Function to append messages
function appendMessage(prefix, message, attachment = null) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    if (attachment) {
        messageElement.innerHTML = `
            <div>${prefix}${message}</div>
            ${getAttachmentHTML(attachment)}
        `;
    } else {
        messageElement.innerText = `${prefix}${message}`;
    }
    
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Helper function to generate attachment HTML
function getAttachmentHTML(attachment) {
    if (attachment.type.startsWith('image/')) {
        return `<img src="${attachment.data}" class="chat-image" alt="attachment">`;
    } else {
        return `
            <div class="file-attachment">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                <a href="${attachment.data}" download="${attachment.name}">${attachment.name}</a>
            </div>
        `;
    }
}