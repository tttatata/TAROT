
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Đọc các biến môi trường từ file .env
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Cho phép Frontend gọi API đến Backend
app.use(express.json()); // Phân tích body dạng JSON

// Kiểm tra xem đã có API Key chưa
if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ CẢNH BÁO: Chưa tìm thấy biến môi trường GEMINI_API_KEY trong file .env!");
}

// Khởi tạo Gemini client (Truyền tường minh apiKey vào)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Endpoint xử lý việc luận giải bài Tarot
app.post('/api/tarot-reading', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Thiếu dữ liệu prompt' });
  }

  try {
    console.log("Đang gọi Gemini API...");
    // Sử dụng model gemini-1.5-flash theo yêu cầu
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    // Trả kết quả về cho Frontend
    res.json({ reading: response.text });
  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error.message || error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi kết nối với AI.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`🔮 Tarot Backend đang chạy tại http://localhost:${port}`);
});
