import React, { useState } from 'react';

// 1. Khai báo 22 lá Major Arcana (Bộ Ẩn Chính)
const MAJOR_ARCANA = [
  { id: 'm0', name: "The Fool", img: "🃏" },
  { id: 'm1', name: "The Magician", img: "🧙‍♂️" },
  { id: 'm2', name: "The High Priestess", img: "🧝‍♀️" },
  { id: 'm3', name: "The Empress", img: "👸" },
  { id: 'm4', name: "The Emperor", img: "🤴" },
  { id: 'm5', name: "The Hierophant", img: "📿" },
  { id: 'm6', name: "The Lovers", img: "💞" },
  { id: 'm7', name: "The Chariot", img: "🏇" },
  { id: 'm8', name: "Strength", img: "🦁" },
  { id: 'm9', name: "The Hermit", img: "🏮" },
  { id: 'm10', name: "Wheel of Fortune", img: "🎡" },
  { id: 'm11', name: "Justice", img: "⚖️" },
  { id: 'm12', name: "The Hanged Man", img: "🙃" },
  { id: 'm13', name: "Death", img: "💀" },
  { id: 'm14', name: "Temperance", img: "🚰" },
  { id: 'm15', name: "The Devil", img: "👿" },
  { id: 'm16', name: "The Tower", img: "🗼" },
  { id: 'm17', name: "The Star", img: "⭐" },
  { id: 'm18', name: "The Moon", img: "🌙" },
  { id: 'm19', name: "The Sun", img: "☀️" },
  { id: 'm20', name: "Judgement", img: "📯" },
  { id: 'm21', name: "The World", img: "🌍" }
];

// 2. Tự động tạo 56 lá Minor Arcana (Bộ Ẩn Phụ)
const SUITS = [
  { name: "Wands", img: "🪄" },     // Gậy
  { name: "Cups", img: "🏆" },      // Cốc
  { name: "Swords", img: "🗡️" },    // Kiếm
  { name: "Pentacles", img: "🪙" }  // Tiền
];

const RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Page", "Knight", "Queen", "King"];

const MINOR_ARCANA = [];
SUITS.forEach(suit => {
  RANKS.forEach((rank, index) => {
    MINOR_ARCANA.push({
      id: `${suit.name.toLowerCase()}_${index + 1}`,
      name: `${rank} of ${suit.name}`,
      img: suit.img
    });
  });
});

// 3. Gộp lại thành bộ bài hoàn chỉnh 78 lá
const FULL_TAROT_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA];

const initDeck = () => {
  let initial = [...FULL_TAROT_DECK];
  for (let i = initial.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [initial[i], initial[j]] = [initial[j], initial[i]];
  }
  return initial.map(card => ({
    ...card,
    isReversed: Math.random() > 0.5,
    isDrawn: false
  }));
};

export default function App() {
  const [deck, setDeck] = useState(initDeck());
  const [drawnCards, setDrawnCards] = useState([]);
  const [reading, setReading] = useState("");
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const [question, setQuestion] = useState("");

  // Xào bài
  const shuffleDeck = () => {
    let shuffled = [...FULL_TAROT_DECK];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const newDeck = shuffled.map(card => ({
      ...card,
      isReversed: Math.random() > 0.5,
      isDrawn: false
    }));
    setDeck(newDeck);
    setDrawnCards([]); 
    setReading("");    
  };

  // ... (Giữ nguyên toàn bộ logic drawCard, getAIReading và phần return giao diện của bạn ở đây)
  
  // Chọn bài từ trải bài
  const pickCard = (index) => {
    if (drawnCards.length >= 18) {
      alert("Bạn đã rút đủ tối đa 18 lá bài rồi nhé!");
      return;
    }
    const newDeck = [...deck];
    if (newDeck[index].isDrawn) return; // Nếu đã lật thì không làm gì cả
    
    newDeck[index].isDrawn = true;
    setDeck(newDeck);
    setDrawnCards([...drawnCards, newDeck[index]]);
  };

  // Gọi API Backend để nhận luận giải AI
  const getAIReading = async () => {
    if (drawnCards.length === 0) return;
    setIsReadingLoading(true);
    setReading("");

    const cardsList = drawnCards.map(
      (c, index) => `${index + 1}. ${c.name} (${c.isReversed ? 'Ngược' : 'Xuôi'})`
    ).join('\n');
    
    // Xây dựng câu lệnh (Prompt)
    const prompt = `Bạn là một Tarot Reader chuyên nghiệp. 
${question.trim() !== "" ? `Vấn đề người xem quan tâm là: "${question}"` : 'Người xem muốn xem một trải bài tổng quát.'}
Người xem đã bóc được ${drawnCards.length} lá bài sau:
${cardsList}

Hãy viết một đoạn luận giải ngắn gọn nhưng sâu sắc. Bắt đầu bằng việc giải thích ý nghĩa chung của các lá bài khi kết hợp lại, sau đó đưa ra một lời khuyên chân thành cho người xem. Hãy định dạng bằng Markdown cho dễ nhìn.`;

    try {
      const response = await fetch('http://localhost:5000/api/tarot-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Lỗi phản hồi từ server');
      }

      setReading(data.reading);
    } catch (error) {
      console.error("Lỗi:", error.message);
      setReading(`🚨 Lỗi kết nối AI: ${error.message}\n(Hãy kiểm tra lại cửa sổ Terminal đang chạy Node.js Backend để xem chi tiết)`);
    } finally {
      setIsReadingLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '100%', margin: '0 auto', overflowX: 'hidden' }}>
      <h1 style={{ textAlign: 'center', color: '#4a148c' }}>🔮 Trải Bài Tarot Cùng AI</h1>
      
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <input 
          type="text" 
          placeholder="Nhập câu hỏi hoặc vấn đề của bạn..." 
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: '90%', maxWidth: '600px', padding: '12px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px' }}
        />
        <br />
        <button onClick={shuffleDeck} style={btnStyle}>🔀 Xào Bài Mới</button>
        <p style={{ marginTop: '10px', color: '#666' }}>Đã chọn: {drawnCards.length} / 18 lá</p>
      </div>

      {/* Trải 78 lá bài thành 2 hàng */}
      <div style={{ overflowX: 'auto', padding: '10px 0', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(39, 35px)', gridTemplateRows: 'auto auto', gap: '6px', width: 'max-content', margin: '0 auto' }}>
          {deck.map((card, idx) => (
            <div 
              key={idx} 
              onClick={() => pickCard(idx)}
              style={{
                width: '35px', 
                height: '55px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                cursor: card.isDrawn ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: card.isDrawn ? (card.isReversed ? '#fef0f0' : '#f0f8ff') : '#4a148c',
                color: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                opacity: card.isDrawn ? 0.3 : 1,
                transition: 'opacity 0.3s'
              }}>
              {card.isDrawn ? (
                 <span style={{ fontSize: '16px', transform: card.isReversed ? 'rotate(180deg)' : 'none' }}>{card.img}</span>
              ) : (
                 <span style={{ fontSize: '8px', fontWeight: 'bold' }}>Tarot</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {drawnCards.length > 0 && (
        <h2 style={{ textAlign: 'center', color: '#4a148c', fontSize: '20px' }}>Bài bạn đã chọn:</h2>
      )}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', minHeight: '150px', justifyContent: 'center' }}>
        {drawnCards.map((card, idx) => (
          <div key={idx} style={{
             border: '2px solid #ccc', 
             padding: '15px', 
             borderRadius: '10px',
             width: '120px', // Tăng kích thước chiều rộng một chút để chứa tên lá bài dài
             textAlign: 'center',
             backgroundColor: card.isReversed ? '#fef0f0' : '#f0f8ff',
             boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '50px', transform: card.isReversed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
              {card.img}
            </div>
            <strong style={{ display: 'block', marginTop: '10px', fontSize: '14px' }}>{card.name}</strong>
            <small style={{ color: card.isReversed ? 'red' : 'green' }}>
              {card.isReversed ? "Ngược" : "Xuôi"}
            </small>
          </div>
        ))}
      </div>

      {drawnCards.length > 0 && (
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button onClick={getAIReading} disabled={isReadingLoading} style={{...btnStyle, backgroundColor: '#9c27b0', color: 'white', border: 'none', padding: '12px 24px', fontSize: '18px'}}>
            ✨ Nhờ AI Luận Giải
          </button>
          
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f3e5f5', borderRadius: '10px', textAlign: 'left', minHeight: '100px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            {isReadingLoading ? (
              <div style={{ textAlign: 'center', color: '#9c27b0', fontWeight: 'bold' }}>
                Đang kết nối với vũ trụ AI... 🌌
              </div>
            ) : (
              <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '16px', color: '#333' }}>
                {reading || "Nhấn nút phía trên để nhận thông điệp từ vũ trụ."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  padding: '10px 15px',
  marginRight: '10px',
  cursor: 'pointer',
  borderRadius: '5px',
  border: '1px solid #ccc',
  fontSize: '16px',
  fontWeight: 'bold',
  backgroundColor: '#fff',
  transition: 'background-color 0.2s'
};
