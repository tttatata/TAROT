import { GoogleGenerativeAI } from '@google/generative-ai';

// Hàm này sẽ được Vercel tự động biến thành một API endpoint
export default async function handler(req, res) {
  // Chỉ cho phép phương thức POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Lấy API key từ biến môi trường của Vercel
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Chưa cấu hình GEMINI_API_KEY trên Vercel." });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Thiếu dữ liệu prompt.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reading: text });
  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error);
    res.status(500).json({
      error: 'Đã xảy ra lỗi khi kết nối với AI.',
      details: error.message || JSON.stringify(error),
    });
  }
}