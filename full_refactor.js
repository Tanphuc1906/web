const fs = require('fs');
let code = fs.readFileSync('assets/js/script.js', 'utf8');

// 1. Refactor Products Fetch
const startDataStr = 'const data = {';
const endDataStr = 'allProducts = data.products || []; // Dùng trực tiếp dữ liệu tĩnh';
const startDataIdx = code.indexOf(startDataStr);
const endDataIdx = code.indexOf(endDataStr);
if (startDataIdx !== -1 && endDataIdx !== -1) {
    const fetchCode = `const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) throw new Error('Network error');
        const resData = await response.json();
        const data = resData.products;
        allProducts = data.products || [];`;
    code = code.substring(0, startDataIdx) + fetchCode + code.substring(endDataIdx + endDataStr.length);
}

// 2. Refactor Unsplash Links
code = code.replace(/https:\/\/images.unsplash.com\/photo-([a-zA-Z0-9-]+)(?![\?\&])/g, 'https://images.unsplash.com/photo-$1?w=600&q=80&auto=format');

// 3. Refactor addMsg and sendChat
const addMsgStart = '    function addMsg(text, type) {';
const addMsgEnd = '    function sendChat() {';
const s1 = code.indexOf(addMsgStart);
const e1 = code.indexOf(addMsgEnd, s1);

if (s1 !== -1 && e1 !== -1) {
    const newChatBlock = `    function addMsg(text, type) {
        const div = document.createElement('div');
        div.className = \`chat-message \${type}\`;
        if (type === 'typing') {
            div.innerHTML = \`<span class="dot"></span><span class="dot"></span><span class="dot"></span>\`;
        } else if (type === 'bot') {
            div.innerHTML = text; // Cho phép HTML để render thẻ <b> và <br>
        } else {
            div.textContent = text;
        }
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight; // Cuộn xuống cuối
        return div;
    }

    /**
     * Nhận yêu cầu / tin nhắn vừa gõ rồi hiển thị ngay cho phần người dùng trên khung Chat.
     */
    async function sendChat() {
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
    }`;
    
    const sendChatEndStr = 'chatSend.onclick = sendChat;';
    const e2 = code.indexOf(sendChatEndStr, e1);
    
    if (e2 !== -1) {
        code = code.substring(0, s1) + newChatBlock + '\n\n    ' + code.substring(e2);
    }
}

fs.writeFileSync('assets/js/script.js', code);
console.log("Full refactor completed successfully.");
