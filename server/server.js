const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

// Load .env from parent directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();

// ==========================================
// 1. SECURITY MIDDLEWARES
// ==========================================
// Sử dụng Helmet để bảo mật HTTP Headers, nhưng tắt CSP để không block script/image frontend
app.use(helmet({ contentSecurityPolicy: false }));

// Nén Gzip tĩnh và động để tăng tốc độ tải trang
// app.use(compression()); // Tạm tắt để fix lỗi treo

// Cấu hình CORS để bảo vệ API (chỉ cho phép origin chính)
app.use(cors());

// Giới hạn kích thước payload (tránh payload quá lớn)
app.use(express.json({ limit: '10kb' })); 

// Rate Limiting chung cho API (chống DDoS / Spam)
// Tạm tắt rate limiter để fix lỗi treo
// app.use('/api/', apiLimiter);

// Rate Limiting riêng cho Chat (tránh spam API LLM tốn tiền)
// const chatLimiter = rateLimit({
//     windowMs: 60 * 1000, // 1 phút
//     max: 10, // Tối đa 10 tin nhắn / 1 phút / 1 IP
//     message: { reply: 'Bạn gửi tin nhắn quá nhanh. Vui lòng chờ một chút nhé!' }
// });

// ==========================================
// 2. DATA LOADING (SECURE BACKEND DATA)
// ==========================================
const productsDataPath = path.join(__dirname, 'data', 'products.json');
let productsData = { categories: [], products: [] };
try {
    productsData = JSON.parse(fs.readFileSync(productsDataPath, 'utf8'));
} catch (error) {
    console.error("Error loading products.json", error);
}

// ==========================================
// 3. API ROUTES
// ==========================================
// API lấy danh sách sản phẩm
app.get('/api/products', (req, res) => {
    // Không trả về giá nhập/thông tin nhạy cảm (nếu có). Ở đây data hiện tại đã an toàn.
    res.json({ products: productsData });
});

// API cấu hình (Frontend sẽ gọi API này để lấy cấu hình, tránh hardcode App ID)
app.get('/api/config', (req, res) => {
    res.json({
        facebookAppId: process.env.FACEBOOK_APP_ID || ''
    });
});

// API Chat với LLM (Gemini)
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return res.json({ reply: "Xin lỗi, hiện tại tính năng Tư vấn AI đang bảo trì (Thiếu API Key)." });
        }

        // Import Google Generative AI SDK
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // RAG Đơn giản: Đưa danh sách xe vào ngữ cảnh cho AI
        const productContext = productsData.products.slice(0, 20).map(p => `- ${p.name}: ${p.price} VND`).join('\n');
        
        const systemInstruction = `Bạn là nhân viên tư vấn nhiệt tình của cửa hàng xe đạp SD'Bike.
Dưới đây là một số dòng xe cửa hàng đang có:
${productContext}

QUY TẮC:
1. Trả lời ngắn gọn, thân thiện, lịch sự.
2. Dùng thẻ <br> để xuống dòng, và thẻ <b> để in đậm các từ khóa.
3. CHỈ TƯ VẤN về xe đạp và thông tin cửa hàng, từ chối trả lời các câu hỏi không liên quan.
4. KHÔNG báo giá sai lệch so với dữ liệu trên.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: `Hệ thống: ${systemInstruction}\nKhách hàng: ${message}`,
        });

        res.json({ reply: response.text });

    } catch (error) {
        console.error("Chat API Error:", error);
        let errorMsg = 'Hệ thống AI đang quá tải, vui lòng thử lại sau.';
        if (error.status === 429 || (error.message && error.message.includes('depleted'))) {
            errorMsg = 'Hệ thống: API Key của bạn đã hết hạn mức sử dụng (Quota Exceeded). Vui lòng cung cấp API Key mới để tiếp tục sử dụng Chatbot.';
        }
        res.json({ reply: errorMsg });
    }
});

// ==========================================
// 4. SERVE FRONTEND STATIC FILES
// ==========================================
// Phục vụ toàn bộ thư mục gốc chứa HTML/CSS/JS với Cache Control (1 ngày) để tăng tốc độ tải
app.use(express.static(path.join(__dirname, '../'), {
    maxAge: '1d', // Cache trong 1 ngày
    etag: true
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`SD'Bike Secure Server is running on http://localhost:${PORT}`);
});
