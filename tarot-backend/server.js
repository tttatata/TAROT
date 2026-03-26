
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Đổi tên import cho đúng với thư viện hiện đại

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

// Khởi tạo Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Lấy model cụ thể mà bạn muốn sử dụng
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Sử dụng tên model chuẩn

app.post('/api/tarot-reading', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Thiếu dữ liệu prompt' });
  }

  try {
    console.log("--- Đang kết nối Gemini API ---");
    
    // Đảm bảo dùng model name chuẩn nhất
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text(); // Đảm bảo lấy được text sạch

    console.log("--- Phản hồi thành công ---");
    res.json({ reading: text });

  } catch (error) {
    // In lỗi chi tiết ra Terminal của VS Code/Cmd để bạn kiểm tra
    console.error('LỖI CHI TIẾT TỪ GOOGLE:', error);

    res.status(500).json({ 
      error: 'Lỗi server khi gọi AI.', 
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`🔮 Tarot Backend đang chạy tại http://localhost:${port}`);
});
