const fs = require('fs');
let code = fs.readFileSync('assets/js/script.js', 'utf8');

const startChatStr = 'function sendChat() {';
const endChatStr = 'chatSend.onclick = sendChat;';
const startChatIdx = code.indexOf(startChatStr);
const endChatIdx = code.indexOf(endChatStr, startChatIdx);
if (startChatIdx !== -1 && endChatIdx !== -1) {
    const chatCode = `async function sendChat() {
        const text = chatInput.value.trim();
        if (!text) return;
        addMsg(text, 'user');
        chatInput.value = '';

        const typingMsg = addMsg('', 'typing');

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            typingMsg.remove(); 

            if (!response.ok) {
                if (response.status === 429) {
                    addMsg("Hệ thống: Bạn đang gửi tin nhắn quá nhanh.", 'bot');
                } else {
                    addMsg("Hệ thống: Lỗi kết nối đến máy chủ AI.", 'bot');
                }
                return;
            }

            const data = await response.json();
            addMsg(data.reply || "Xin lỗi, tôi không hiểu.", 'bot');

        } catch (error) {
            typingMsg.remove();
            addMsg("Hệ thống: Lỗi mạng, không thể kết nối tới Backend.", 'bot');
            console.error(error);
        }
    }

    `;
    code = code.substring(0, startChatIdx) + chatCode + code.substring(endChatIdx);
    fs.writeFileSync('assets/js/script.js', code);
    console.log("Refactored sendChat completely!");
} else {
    console.log("Could not find sendChat block");
}
