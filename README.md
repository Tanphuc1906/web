# SD'Bike - AI-Powered E-Commerce Website

A modern, full-stack E-Commerce web application for a bicycle store, featuring a custom-built AI consulting chatbot powered by Google Gemini.

## 🌟 Key Features

- **Responsive Frontend**: Built with HTML, CSS, and Vanilla JavaScript for a fast, seamless shopping experience.
- **Node.js/Express Backend**: A secure backend to serve product data and handle API routing.
- **AI Consulting Chatbot**: Integrated Google Gemini AI (`@google/genai`) to act as a 24/7 virtual assistant. It uses a basic RAG (Retrieval-Augmented Generation) approach to advise customers based on real-time bicycle inventory.
- **Security & Performance**:
  - `Helmet` for securing HTTP headers.
  - `CORS` configured for API protection.
  - `Express Rate Limit` to prevent DDoS and LLM API spam.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **AI Integration**: Google Generative AI (Gemini 3.5 Flash)
- **Security**: Helmet, CORS, express-rate-limit

## 🚀 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/Tanphuc1906/web.git
cd web
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Gemini API Key:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Start the server
Run the following command to start the backend and serve the frontend:
```bash
npm start
# or run the batch file on Windows
start.bat
```

The application will be running at `http://localhost:3000`

---
*Built with ❤️ by Tran Nguyen Tan Phuc*
