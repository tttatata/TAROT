
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
// Lấy model cụ thể mà bạn muốn sử dụng (thử gemini-1.0-pro)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// Endpoint xử lý việc luận giải bài Tarot
app.post('/api/tarot-reading', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Thiếu dữ liệu prompt' });
  }

  try {
    console.log(`Đang gọi Gemini API với model: ${model.model} ...`);
    console.log("Đang gọi Gemini API...");
    // Gửi prompt đến model đã được khởi tạo
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Trả kết quả về cho Frontend
    res.json({ reading: text });
  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error); // Log toàn bộ đối tượng lỗi để debug
    // Đảm bảo chi tiết lỗi luôn là một chuỗi
    res.status(500).json({
      error: 'Đã xảy ra lỗi khi kết nối với AI.',
      details: error.message ? error.message : JSON.stringify(error) // Gửi message hoặc stringify toàn bộ lỗi
    });
  }
});

app.listen(port, () => {
  console.log(`🔮 Tarot Backend đang chạy tại http://localhost:${port}`);
});
