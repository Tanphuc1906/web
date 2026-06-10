const fs = require('fs');
let c = fs.readFileSync('assets/js/script.js', 'utf8');

const replacement = `    function addMsg(text, type) {
        const div = document.createElement('div');
        div.className = \`chat-message \${type}\`;
        if (type === 'typing') {
            div.innerHTML = \`<span class="dot"></span><span class="dot"></span><span class="dot"></span>\`;
        } else if (type === 'bot') {
            div.innerHTML = text;
        } else {
            div.textContent = text;
        }
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight; // Cuộn xuống cuối
        return div;
    }`;

// The replace_file_content tool DELETED the function, so we need to inject it back before sendChat
const targetStr = `    /**
     * Nhận yêu cầu / tin nhắn vừa gõ rồi hiển thị ngay cho phần người dùng trên khung Chat.
     */
    async function sendChat() {`;

if (c.includes(targetStr)) {
    c = c.replace(targetStr, replacement + '\n\n' + targetStr);
    fs.writeFileSync('assets/js/script.js', c);
    console.log("Fixed successfully!");
} else {
    console.log("Could not find insertion point.");
}
