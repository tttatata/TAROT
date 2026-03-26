import React, { useState } from 'react';
import './App.css';

// CẤU HÌNH THƯ MỤC BỘ BÀI (Thay đổi biến này để đổi bộ bài khác)
// Yêu cầu: Đặt toàn bộ 78 ảnh (.png) và 1 ảnh 'backside.png' vào thư mục src/assets/card
const DECK_FOLDER = '/src/assets/card';
const CARD_BACK = `${DECK_FOLDER}/backside.png`;

// 1. Khai báo 22 lá Major Arcana (Bộ Ẩn Chính)
const MAJOR_NAMES = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
];

const MAJOR_ARCANA = MAJOR_NAMES.map((name, index) => ({
  id: `m${index}`,
  name: name,
  img: `${DECK_FOLDER}/m${index}.png`
}));

// 2. Tự động tạo 56 lá Minor Arcana (Bộ Ẩn Phụ)
const SUITS = ["Wands", "Cups", "Swords", "Pentacles"];

const RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Page", "Knight", "Queen", "King"];

const MINOR_ARCANA = [];
SUITS.forEach(suit => {
  RANKS.forEach((rank, index) => {
    MINOR_ARCANA.push({
      id: `${suit.toLowerCase()}${index + 1}`,
      name: `${rank} of ${suit}`,
      img: `${DECK_FOLDER}/${suit.toLowerCase()}${index + 1}.png`
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
   
    isDrawn: false
  }));
};

export default function App() {
  const [deck, setDeck] = useState(initDeck());
  const [drawnCards, setDrawnCards] = useState([]);
  const [reading, setReading] = useState("");
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasShuffled, setHasShuffled] = useState(false);
  const [hasSpread, setHasSpread] = useState(false);

  // Xào bài
  const shuffleDeck = () => {
    if (isShuffling) return; // Ngăn bấm nhiều lần khi đang xào
    setIsShuffling(true);
    setHasShuffled(false);
    setHasSpread(false);
    setDrawnCards([]);
    setReading("");
    setDeck(prevDeck => prevDeck.map(card => ({ ...card, isDrawn: false })));

    // Bước 1: Chờ 0.15s để các lá bài tách ra 2 bên, sau đó cập nhật mảng (xáo trộn)
    setTimeout(() => {
      let shuffled = [...FULL_TAROT_DECK];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const newDeck = shuffled.map(card => ({
        ...card,
        
        isDrawn: false
      }));
      setDeck(newDeck); // React sẽ animate các lá bài bay đan xen vào nhau để đổi chỗ

      // Bước 2: Chờ 0.5s cho animation đan bài xong thì xếp cọc gọn lại
      setTimeout(() => {
        setIsShuffling(false);
        setHasShuffled(true);
      }, 500);
    }, 150);
  };

  const startReading = () => {
    if (question.trim() === "") {
      alert("Vui lòng nhập câu hỏi hoặc vấn đề rồi nhấn bắt đầu.");
      return;
    }

    setHasStarted(true);
    setHasShuffled(false);
    setHasSpread(false);
    setReading("");
    setDrawnCards([]);
  };

  const spreadDeck = () => {
    if (!hasShuffled || isShuffling) return;
    setHasSpread(true);
  };

  // Lật tất cả các lá bài lên cùng lúc
  const revealAllCards = () => {
    const newDeck = deck.map(card => ({ ...card, isDrawn: true }));
    setDeck(newDeck);
    
    // Thêm những lá chưa lật vào danh sách đã rút (giữ nguyên thứ tự các lá đã rút trước đó)
    const unDrawnCards = newDeck.filter(card => !drawnCards.some(dc => dc.id === card.id));
    setDrawnCards([...drawnCards, ...unDrawnCards]);
  };

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

    const maxCards = 18; // Trải bài 18 lá
    const pairedCardsList = [];

    // Ghép cặp theo quy tắc (1,10), (2,11), ..., (9,18)
    for (let i = 0; i < 9; i++) { // Duyệt qua 9 cặp tiềm năng
      const cardIndex1 = i; // Lá bài thứ i+1
      const cardIndex2 = i + 9; // Lá bài thứ i+10

      const card1 = drawnCards[cardIndex1];
      const card2 = drawnCards[cardIndex2];

      if (card1 && card2) {
        pairedCardsList.push(`Cặp ${i + 1}: Lá ${cardIndex1 + 1} (${card1.name}) và Lá ${cardIndex2 + 1} (${card2.name})`);
      } else if (card1) {
        // Nếu chỉ có lá đầu tiên của cặp
        pairedCardsList.push(`Cặp ${i + 1}: Lá ${cardIndex1 + 1} (${card1.name}) (chưa có lá thứ 2 để ghép cặp)`);
      } else if (card2) {
        // Trường hợp này ít xảy ra nếu rút bài tuần tự, nhưng vẫn xử lý
        pairedCardsList.push(`Cặp ${i + 1}: Lá ${cardIndex2 + 1} (${card2.name}) (chưa có lá thứ 1 để ghép cặp)`);
      }
    }

    // Xử lý các lá bài còn lại nếu có (ví dụ: nếu có hơn 18 lá, hoặc các lá không theo cặp)
    // Tuy nhiên, với trải bài 18 lá, sẽ không có lá nào "còn lại" nếu đã ghép 9 cặp
    if (drawnCards.length > maxCards) {
      // Logic này có thể được mở rộng nếu bạn muốn hỗ trợ nhiều hơn 18 lá
    }
    const cardsList = pairedCardsList.join('\n');
    
    // Xây dựng câu lệnh (Prompt)
    const prompt = `Bạn là một chuyên gia luận giải Tarot, tập trung vào ý nghĩa thực tế và lời khuyên ứng dụng vào đời sống.
${question.trim() !== "" ? `Vấn đề người xem quan tâm là: "${question}"` : 'Người xem muốn xem một trải bài tổng quát.'}
Người xem đã bóc được ${drawnCards.length} lá bài, được chia thành các cặp sau:
${cardsList}

Hãy viết một đoạn luận giải chi tiết, sâu sắc, tập trung vào ý nghĩa thực tế và lời khuyên ứng dụng vào đời sống.
1.  **Phân tích từng cặp:** Luận giải ý nghĩa thực tế của từng cặp lá bài đã bóc theo thứ tự từ Cặp 1 đến Cặp 9, liên hệ trực tiếp với các khía cạnh trong cuộc sống.
2.  **Tổng quan toàn bộ trải bài:** Sau khi phân tích từng cặp, hãy tổng hợp lại để đưa ra một cái nhìn tổng quan về toàn bộ trải bài 18 lá, kết nối các cặp lại với nhau.
3.  **Lời khuyên:** Cuối cùng, đưa ra một lời khuyên chân thành và hữu ích cho người xem dựa trên toàn bộ trải bài.
Hãy định dạng bằng Markdown cho dễ nhìn, sử dụng tiêu đề phụ cho từng cặp và phần tổng quan.`;

    try {
      const response = await fetch('/api/tarot-reading', { // Đổi sang đường dẫn tương đối
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
    <div className="app-container">
      <header className="header">
        <h1>🔮 Trải Bài Tarot Cùng AI</h1>
      </header>
      
      <section className="controls-section">
        <input 
          type="text" 
          className="question-input"
          placeholder="Nhập câu hỏi hoặc vấn đề của bạn..." 
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isShuffling}
        />
        <br />
        {!hasStarted && (
          <button
            onClick={startReading}
            className="button"
            disabled={question.trim() === ""}
          >
            🚀 Bắt Đầu khám phá
          </button>
        )}

        {hasStarted && !hasSpread && (
          <>
            <button
              onClick={shuffleDeck}
              className="button"
              disabled={isShuffling}
            >
              {isShuffling ? 'Đang xào bài...' : '🔀 Xào bài'}
            </button>
            {hasShuffled && (
              <button
                onClick={spreadDeck}
                className="button"
                disabled={isShuffling}
              >
                🌟 Xòe bài ra
              </button>
            )}
          </>
        )}

        {hasStarted && hasSpread && (
          <>
            <button
              onClick={shuffleDeck}
              className="button"
              disabled={isShuffling}
            >
              🔀 Xào bài tiếp
            </button>
            <button
              onClick={revealAllCards}
              className="button"
              disabled={isShuffling || drawnCards.length === deck.length}
            >
              👁️ Lật hết bài
            </button>
          </>
        )}

        <p className="stats">
          {hasStarted
            ? `Bước: ${hasSpread ? 'Đã xòe bài' : hasShuffled ? 'Chờ xòe bài' : 'Chờ xào bài'}`
            : 'Nhập câu hỏi và nhấn bắt đầu.'
          }
        </p>
        <p className="stats">Đã chọn: {drawnCards.length} / 18 lá</p>
      </section>

      {/* Trải 78 lá bài thành hình vòng cung (Fan spread) */}
      {hasStarted && (
        <section className="deck-container">
          <div className="card-fan-container">
            {deck.map((card, idx) => {
              const totalCards = deck.length;
              let transformStyle = '';
              let isHovered = false;
              let cardZIndex = idx;

              if (hasSpread) {
                const maxAngle = 60;
                const angle = -maxAngle + (idx * ((maxAngle * 2) / (totalCards - 1)));
                isHovered = hoveredCard === idx && !card.isDrawn;
                transformStyle = `rotate(${angle}deg) translateY(${isHovered ? '-25%' : (card.isDrawn ? '-15%' : '0%')}) scale(${isHovered ? 1.2 : 1})`;
                if (isHovered) cardZIndex = 100;
              } else {
                if (isShuffling) {
                  // Hiệu ứng chẻ bài làm 2 nửa trái/phải và xáo trộn
                  const isLeft = idx % 2 === 0;
                  const offsetX = isLeft ? -90 : 90; // Tăng thêm khoảng cách khi chẻ bài để vừa với bài to
                  const randomRot = (Math.random() - 0.5) * 15;
                  transformStyle = `translate(${offsetX}px, ${Math.random() * 20 - 10}px) rotate(${randomRot}deg) scale(1.8)`;
                } else {
                  // Xếp thành cọc bài gọn gàng ở giữa, phóng to 1.8 lần (tương đương thêm ~30px)
                  transformStyle = `translateY(${idx * -0.4}px) translateX(${idx * 0.2}px) scale(1.8)`;
                }
              }

              return (
                <div
                  key={card.id} // Bắt buộc dùng card.id để React animate vị trí thật khi xào
                  className="card-in-fan"
                  onClick={() => hasSpread && pickCard(idx)} // Chỉ cho lật bài khi đã xòe
                  onMouseEnter={() => hasSpread && setHoveredCard(idx)}
                  onMouseLeave={() => hasSpread && setHoveredCard(null)}
                  style={{
                    boxShadow: isHovered ? '0 15px 30px rgba(0,0,0,0.6)' : (card.isDrawn ? 'none' : '-2px 0 8px rgba(0,0,0,0.3)'),
                    opacity: card.isDrawn ? 0.4 : 1,
                    transformOrigin: hasSpread ? 'center 300%' : 'center center',
                    transform: transformStyle,
                    zIndex: cardZIndex,
                    transition: isShuffling ? 'transform 0.3s ease-in-out' : 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), transform-origin 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease, opacity 0.3s ease'
                  }}>
                  <div className="card-image-wrapper">
                    {card.isDrawn ? (
                      <div style={{ width: '100%', height: '100%', transform: card.isReversed ? 'rotate(180deg)' : 'none' }}>
                        <img src={card.img} alt={card.name} className="card-image" />
                      </div>
                    ) : (
                      <img src={CARD_BACK} alt="Card Back" className="card-image" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

 
{drawnCards.length > 0 && (
  <section className="drawn-cards-section">
    <h2 className="section-title">Trải Bài 18 Lá (Song Cửu)</h2>
    
    <div className="drawn-cards-grid">
      {drawnCards.map((card, idx) => (
        <div key={card.id} className="drawn-card-item">
          {/* Hiển thị số thứ tự lá bài để người xem dễ theo dõi */}
          <div className="card-number">#{idx + 1}</div>
          
          <div className="drawn-card-image-container" style={{ marginBottom: '8px' }}>
            <img src={card.img} alt={card.name} className="drawn-card-image" />
          </div>
          
          <div className="card-info">
            <div className="card-name" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
              {card.name}
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
)}
      {drawnCards.length > 0 && (
        <section className="reading-section">
          <button onClick={getAIReading} disabled={isReadingLoading} className="button primary">
            ✨ Nhờ AI Luận Giải ✨
          </button>
          <div className="reading-result-box">
            {isReadingLoading ? (
              <p className="reading-loading">Đang kết nối với vũ trụ AI... 🌌</p>
            ) : reading ? (
              <div className="reading-content" dangerouslySetInnerHTML={{ __html: reading.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
            ) : (
              <p className="reading-placeholder">Nhấn nút phía trên để nhận thông điệp từ vũ trụ.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
